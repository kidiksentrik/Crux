'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Newspaper, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import TranslationSheet from '@/components/TranslationSheet';

interface Article {
  id: string;
  title: string;
  content: string;
  source: string;
  target_lang: string;
  published_at: string;
}

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [fetchingNews, setFetchingNews] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Settings loaded from localStorage
  const [targetLang, setTargetLang] = useState('PL');
  const [baseLang, setBaseLang] = useState('EN');
  const [dailyLimit, setDailyLimit] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTarget = localStorage.getItem('crux_target_lang') || 'PL';
      const storedBase = localStorage.getItem('crux_base_lang') || 'EN';
      const storedLimit = localStorage.getItem('crux_daily_limit') || '1';
      
      setTimeout(() => {
        setTargetLang(storedTarget);
        setBaseLang(storedBase);
        setDailyLimit(parseInt(storedLimit));
      }, 0);
    }
  }, []);

  const fetchArticles = async (tLang: string, limitVal: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('target_lang', tLang)
        .order('published_at', { ascending: false })
        .limit(limitVal);

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(targetLang, dailyLimit);
    }, 0);
    return () => clearTimeout(timer);
  }, [targetLang, dailyLimit]);

  const handleFetchNewsFromFeed = async () => {
    setFetchingNews(true);
    try {
      const res = await fetch('/api/cron/fetch-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_lang: targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          await fetchArticles(targetLang, dailyLimit);
        } else {
          alert('No new articles were saved. The Gemini API might be temporarily rate-limited or experiencing high demand. Please try again in 1 minute.');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to fetch news: ${errorData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred while fetching news. Please check your connection and try again.');
    } finally {
      setFetchingNews(false);
    }
  };

  const handleWordTap = (rawWord: string, contextText: string) => {
    // Strip leading and trailing punctuation
    const cleaned = rawWord.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"'„”\s]+|[.,\/#!$%\^&\*;:{}=\-_`~()?"'„”\s]+$/g, "");
    if (cleaned && cleaned.length > 0) {
      setSelectedWord(cleaned);
      setSelectedContext(contextText);
      setIsSheetOpen(true);
    }
  };

  const formatPublishDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Render text word-by-word
  const renderTokenizedText = (text: string, contextText: string) => {
    if (!text) return null;
    
    // Split by spaces but preserve word boundaries
    const words = text.split(/(\s+)/);

    return words.map((token, index) => {
      // If it is just spaces, render them as text
      if (/^\s+$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      // Check if this token matches selectedWord (after cleaning)
      const cleaned = token.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"'„”\s]+|[.,\/#!$%\^&\*;:{}=\-_`~()?"'„”\s]+$/g, "");
      const isSelected = selectedWord.toLowerCase() === cleaned.toLowerCase() && isSheetOpen;

      return (
        <span
          key={index}
          onClick={() => handleWordTap(token, contextText)}
          className={`cursor-pointer inline-block rounded-xs px-0.5 transition-all duration-150 ${
            isSelected
              ? 'bg-[#A78BFA]/20 text-[#A78BFA] font-medium shadow-xs scale-105'
              : 'hover:bg-[#A78BFA]/10 hover:text-[#E2E8F0]'
          }`}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[#161224] pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            Crux
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#161224] text-[#F472B6] border border-[#2a2245]">
            Daily Feed
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] font-medium">
          Read the crux of local news in 1 minute. Tap words to translate.
        </p>
      </div>

      {loading ? (
        /* Skeleton Card Loader */
        <div className="space-y-6">
          {Array.from({ length: dailyLimit }).map((_, i) => (
            <div key={i} className="bg-[#161224] border border-[#2a2245] rounded-3xl p-6 space-y-5 animate-pulse shadow-xl">
              <div className="h-4 bg-[#251f3d] w-1/4 rounded-md" />
              <div className="space-y-2">
                <div className="h-7 bg-[#251f3d] w-full rounded-lg" />
                <div className="h-7 bg-[#251f3d] w-3/4 rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-[#251f3d] w-full rounded-md" />
                <div className="h-4 bg-[#251f3d] w-full rounded-md" />
                <div className="h-4 bg-[#251f3d] w-5/6 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        /* ARTICLES LIST */
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-1 text-[10px] text-[#94A3B8] font-semibold tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F472B6]" />
              TARGET: {targetLang} ({articles.length} {articles.length === 1 ? 'article' : 'articles'})
            </span>
            <button
              onClick={handleFetchNewsFromFeed}
              disabled={fetchingNews}
              className="flex items-center gap-1.5 text-[#A78BFA] hover:text-[#c3b2f9] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingNews ? 'animate-spin' : ''}`} />
              REFRESH NEWS
            </button>
          </div>

          {articles.map((art) => (
            <article 
              key={art.id} 
              className="bg-[#161224] border border-[#2a2245] rounded-3xl p-6 shadow-xl flex flex-col gap-5 hover:border-[#332b52] transition-all duration-300"
            >
              <div className="flex items-center justify-between border-b border-[#251f3d] pb-3">
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-medium">
                  <Newspaper className="w-4 h-4 text-[#A78BFA]" />
                  <span>{art.source}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8]">
                  {formatPublishDate(art.published_at)}
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#E2E8F0] leading-snug tracking-tight">
                  {art.title}
                </h2>
                <div className="text-sm text-[#E2E8F0]/90 leading-relaxed tracking-wide space-y-4">
                  {renderTokenizedText(art.content, art.content)}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#161224] border border-dashed border-[#2a2245] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-5 shadow-xl">
          <div className="p-4 bg-[#251f3d]/50 rounded-full border border-[#2a2245]">
            <AlertCircle className="w-8 h-8 text-[#A78BFA]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-[#E2E8F0]">No Articles Yet</h3>
            <p className="text-xs text-[#94A3B8] max-w-[240px] mx-auto leading-relaxed">
              We couldn&apos;t find any news articles cached for target language &quot;{targetLang}&quot;.
            </p>
          </div>
          <button
            onClick={handleFetchNewsFromFeed}
            disabled={fetchingNews}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#A78BFA] hover:bg-[#b8a1fa] disabled:bg-[#251f3d] disabled:text-[#94A3B8] text-[#0B0813] font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingNews ? 'animate-spin' : ''}`} />
            {fetchingNews ? 'FETCHING NEWS...' : 'FETCH DAILY LOCAL NEWS'}
          </button>
        </div>
      )}

      {/* Translation Sheet Overlay */}
      <TranslationSheet
        word={selectedWord}
        context={selectedContext}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        targetLang={targetLang}
        baseLang={baseLang}
      />
    </div>
  );
}
