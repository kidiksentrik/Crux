-- Cruabase Schema Setup

-- 1. Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    target_lang TEXT NOT NULL DEFAULT 'PL',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on published_at and target_lang for fast querying of the latest daily news
CREATE INDEX IF NOT EXISTS idx_articles_lang_published ON articles(target_lang, published_at DESC);

-- 2. Words Table
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    target_lang TEXT NOT NULL DEFAULT 'PL',
    meaning TEXT NOT NULL,
    base_form TEXT,
    synonyms TEXT[] NOT NULL DEFAULT '{}',
    search_count INTEGER NOT NULL DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_word_per_lang UNIQUE (word, target_lang)
);

-- Index on word and target_lang for fast translation lookups
CREATE INDEX IF NOT EXISTS idx_words_lookup ON words(word, target_lang);
-- Index on search_count for the stats tab ranking
CREATE INDEX IF NOT EXISTS idx_words_search_count ON words(search_count DESC);

-- 3. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY, -- Matches auth.uid() or a fixed user uuid for local use
    daily_article_limit INTEGER NOT NULL DEFAULT 1,
    target_lang TEXT NOT NULL DEFAULT 'PL',
    base_lang TEXT NOT NULL DEFAULT 'EN',
    preferred_categories TEXT[] NOT NULL DEFAULT ARRAY['infrastructure', 'technology']
);
