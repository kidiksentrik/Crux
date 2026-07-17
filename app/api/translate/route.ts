import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateAndGetSynonyms } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { word, context = '', target_lang = 'PL', base_lang = 'EN' } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
    }

    const cleanWord = word.trim().toLowerCase();

    // 1. Check cache in Supabase first
    const { data: cachedWord } = await supabase
      .from('words')
      .select('*')
      .eq('word', cleanWord)
      .eq('target_lang', target_lang)
      .maybeSingle();

    if (cachedWord) {
      // Increment search count
      const newSearchCount = (cachedWord.search_count || 1) + 1;
      const { data: updatedWord, error: updateError } = await supabase
        .from('words')
        .update({
          search_count: newSearchCount,
          last_searched_at: new Date().toISOString(),
        })
        .eq('id', cachedWord.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Failed to increment search count:', updateError);
      }

      return NextResponse.json(updatedWord || { ...cachedWord, search_count: newSearchCount });
    }

    // 2. Fetch Translation, Base Form and Synonyms from Gemini in a single context-aware call
    const { meaning, base_form, synonyms } = await translateAndGetSynonyms(
      cleanWord,
      context,
      target_lang,
      base_lang
    );

    // 3. Insert into Supabase words table
    const { data: newWord, error: insertError } = await supabase
      .from('words')
      .insert({
        word: cleanWord,
        target_lang,
        meaning,
        base_form,
        synonyms,
        search_count: 1,
        last_searched_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('Failed to insert new word:', insertError);
      // Handle unique constraint conflict just in case (race condition)
      const { data: refetchedWord } = await supabase
        .from('words')
        .select('*')
        .eq('word', cleanWord)
        .eq('target_lang', target_lang)
        .maybeSingle();
      
      if (refetchedWord) {
        return NextResponse.json(refetchedWord);
      }
      
      // If DB insert completely fails, return transient values
      return NextResponse.json({
        word: cleanWord,
        target_lang,
        meaning,
        base_form,
        synonyms,
        search_count: 1,
      });
    }

    return NextResponse.json(newWord);
  } catch (error) {
    console.error('Translation route error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
