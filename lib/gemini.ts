import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

interface TranslationResult {
  meaning: string;
  base_form: string;
  synonyms: string[];
}

// Since listModels is not supported by the default client in this SDK version,
// we resolve directly to models/gemini-3.5-flash which is the active model.
async function getActiveModelName(): Promise<string> {
  return 'models/gemini-2.0-flash';
}

export async function translateAndGetSynonyms(
  word: string,
  context: string,
  targetLang: string,
  baseLang: string
): Promise<TranslationResult> {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Returning fallback.');
    return {
      meaning: `Translation of "${word}"`,
      base_form: word,
      synonyms: [
        `${word} (동의어1)`,
        `${word} (동의어2)`,
        `${word} (동의어3)`
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = await getActiveModelName();
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
Context article: "${context}"
Target word: "${word}"

Analyze the target word in the context of the article. Provide the following in a strict JSON format matching this schema:
{
  "meaning": "Translation of the word in language '${baseLang}' matching its context. If it is a local abbreviation (e.g. Al., ul., pl. in Polish), expand and explain it (e.g., 'Aleja (Avenue)').",
  "base_form": "The base dictionary/lemma form of the target word in language '${targetLang}' (e.g., infinitive verb, nominative singular noun).",
  "synonyms": ["syn1", "syn2", "syn3"] // Exactly 3 B1-level synonyms of the base form in language '${targetLang}'.
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      meaning: data.meaning || `Translation of "${word}"`,
      base_form: data.base_form || word,
      synonyms: Array.isArray(data.synonyms) ? data.synonyms.slice(0, 3) : [],
    };
  } catch (error) {
    console.error('Error in translateAndGetSynonyms:', error);
    return {
      meaning: `Translation of "${word}"`,
      base_form: word,
      synonyms: [],
    };
  }
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  base_form: string;
  synonyms: string[];
}

export interface ArticleGenerationResult {
  article_text: string;
  vocabulary: VocabularyItem[];
  errorType?: 'quota' | 'other';
}

export async function generateB1ArticleWithVocab(
  title: string,
  context: string,
  lang: string,
  baseLang: string
): Promise<ArticleGenerationResult> {
  const defaultResult: ArticleGenerationResult = {
    article_text: context,
    vocabulary: []
  };

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing. Returning default.');
    return defaultResult;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = await getActiveModelName();
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
Headline: "${title}"
RSS Snippet: "${context}"

Based on the headline and snippet, write a medium-sized local news article (exactly 6-8 sentences, approximately 120-180 words) in language '${lang}' suitable for B1 level language learners.
Also, analyze your generated article and extract ALL unique words/vocabulary items (including nouns, verbs, adjectives, adverbs, pronouns, prepositions, numbers, and local abbreviations).
For EVERY single unique word, provide its translation to language '${baseLang}' matching its context, its base dictionary/lemma form (e.g. infinitive verb, nominative singular noun), and exactly 3 B1-level synonyms in language '${lang}'.

Provide the response in a strict JSON format matching this schema:
{
  "article_text": "The generated news article in language '${lang}'.",
  "vocabulary": [
    {
      "word": "word/term as written in the text (lowercase, trimmed, clean)",
      "meaning": "Contextual translation in language '${baseLang}'. If it is a local abbreviation, expand and explain it (e.g. 'Aleja (Avenue)').",
      "base_form": "The base dictionary/lemma form in language '${lang}' (e.g., infinitive, nominative singular).",
      "synonyms": ["syn1", "syn2", "syn3"]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      article_text: data.article_text || context,
      vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : []
    };
  } catch (error) {
    console.error('Error generating B1 article with vocab:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    const status = (error as { status?: number })?.status;
    const statusText = (error as { statusText?: string })?.statusText || '';
    const isQuota = status === 429 || 
                    statusText.includes('Too Many Requests') || 
                    errorMsg.includes('429') || 
                    errorMsg.toLowerCase().includes('quota') || 
                    errorMsg.toLowerCase().includes('too many requests');
    return {
      ...defaultResult,
      errorType: isQuota ? 'quota' : 'other'
    };
  }
}
