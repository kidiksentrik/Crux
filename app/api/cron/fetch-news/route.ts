import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseStringPromise } from 'xml2js';
import { generateB1ArticleWithVocab } from '@/lib/gemini';

// Clean content: Strip HTML tags from RSS item description
function cleanDescription(html: string): string {
  if (!html) return '';
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  // Remove publisher credits and links
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/Zobacz pełną treść/gi, '');
  text = text.replace(/Więcej na ten temat/gi, '');
  // Compress whitespace
  text = text.replace(/\s+/g, ' ');
  return text.trim();
}

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    // 1. Authorization check (only if CRON_SECRET is configured, bypassed in development)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const querySecret = url.searchParams.get('secret');
      if (querySecret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Try parsing request body, fallback to empty object
    const body = await request.json().catch(() => ({}));
    const target_lang = body.target_lang || 'PL';

    // Fetch base_lang from user_settings if available, fallback to 'EN'
    const { data: settings } = await supabase
      .from('user_settings')
      .select('base_lang')
      .limit(1)
      .maybeSingle();
    const base_lang = settings?.base_lang || 'EN';

    // 2. Build dynamic Google News RSS URL
    let rssUrl = '';
    if (target_lang === 'PL') {
      rssUrl = `https://news.google.com/rss/search?q=Krak%C3%B3w+komunikacja+OR+remont+when:24h&hl=pl&gl=PL&ceid=PL:pl`;
    } else {
      rssUrl = `https://news.google.com/rss/search?q=news+when:24h&hl=${target_lang.toLowerCase()}&gl=${target_lang}&ceid=${target_lang}:${target_lang.toLowerCase()}`;
    }

    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS from Google News: ${response.statusText}`);
    }

    const xml = await response.text();
    const result = await parseStringPromise(xml);
    const items = result.rss.channel[0].item;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No articles found in RSS feed' });
    }

    // Banned words to filter out tabloid/sensational content
    const bannedWords = [
      'plotki', 'pudelek', 'gossip', 'sensacja', 'szok', 'wpadka', 
      'skandal', 'horror', 'tragedia', 'sex', 'sexy', 'gwiazd'
    ];

    const articlesToSave = [];

    for (const item of items) {
      try {
        const title = item.title?.[0] || '';
        const rawContent = item.description?.[0] || '';
        const source = item.source?.[0]?._ || item.source?.[0]?.$?.url || 'Google News';
        const published_at = item.pubDate?.[0] 
          ? new Date(item.pubDate[0]).toISOString() 
          : new Date().toISOString();

        const cleanContent = cleanDescription(rawContent);
        
        // Skip if content is too short or title is suspicious
        if (cleanContent.length < 30 || title.length < 10) continue;
        
        const hasBannedWord = bannedWords.some(word => 
          title.toLowerCase().includes(word) || cleanContent.toLowerCase().includes(word)
        );
        if (hasBannedWord) continue;

        // Extract title and strip the publisher name (usually trailing " - Publisher")
        const titleParts = title.split(' - ');
        const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : title;

        // Add a tiny delay between requests to prevent triggering rate limits or 503s on Gemini
        if (articlesToSave.length > 0) {
          await delay(1500);
        }

        // Generate B1 news article and vocabulary in a single JSON Gemini call
        const genResult = await generateB1ArticleWithVocab(
          cleanTitle,
          cleanContent,
          target_lang,
          base_lang
        );

        if (genResult.errorType === 'quota') {
          console.error('[Crawl] Hit Gemini rate/quota limit. Stopping crawl loop.');
          throw new Error('Gemini API quota/rate limit exceeded. Please wait 1 minute before retrying.');
        }

        const { article_text, vocabulary } = genResult;

        // If article generation failed or returned default raw snippet, skip
        if (!article_text || article_text === cleanContent) {
          console.warn(`[Crawl] Skipping article "${cleanTitle}" because generation failed or returned default context.`);
          continue;
        }

        articlesToSave.push({
          title: cleanTitle,
          content: article_text,
          source,
          target_lang,
          published_at,
        });

        // Pre-cache vocabulary in the database
        if (vocabulary && vocabulary.length > 0) {
          const vocabToUpsert = vocabulary.map((vocab) => ({
            word: vocab.word.trim().toLowerCase(),
            target_lang,
            meaning: vocab.meaning,
            base_form: vocab.base_form,
            synonyms: vocab.synonyms,
            search_count: 0, // Preset to 0 since it has not been clicked yet
            last_searched_at: new Date().toISOString()
          }));

          const { error: vocabError } = await supabase
            .from('words')
            .upsert(vocabToUpsert, { onConflict: 'word,target_lang' });

          if (vocabError) {
            console.error('Failed to upsert pre-translated vocabulary:', vocabError);
          } else {
            console.log(`Pre-cached ${vocabToUpsert.length} words for article: "${cleanTitle}"`);
          }
        }

        // We save up to 3 articles (matching the daily settings max limit)
        if (articlesToSave.length >= 3) break;
      } catch (itemErr: unknown) {
        const err = itemErr as { message?: string };
        if (err?.message?.toLowerCase().includes('quota')) {
          throw itemErr;
        }
        console.error('Error processing news item, skipping to next:', itemErr);
        continue;
      }
    }

    let savedCount = 0;
    if (articlesToSave.length > 0) {
      const { error: insertError } = await supabase
        .from('articles')
        .insert(articlesToSave);

      if (insertError) {
        throw insertError;
      }
      savedCount = articlesToSave.length;
    }

    return NextResponse.json({
      success: true,
      message: `Fetched and saved ${savedCount} articles with pre-cached vocabulary.`,
      articles: articlesToSave,
    });
  } catch (error: unknown) {
    console.error('Fetch news error:', error);
    const err = error as { message?: string };
    const message = err?.message || String(error);
    const isQuota = message.toLowerCase().includes('quota') || message.includes('429');
    return NextResponse.json({ error: message }, { status: isQuota ? 429 : 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
