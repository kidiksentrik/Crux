'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, HelpCircle, Flame, Calendar } from 'lucide-react';

interface WordStats {
  id: string;
  word: string;
  meaning: string;
  synonyms: string[];
  search_count: number;
  last_searched_at: string;
}

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const [topWords, setTopWords] = useState<WordStats[]>([]);
  const [chartData, setChartData] = useState<{ day: string; count: number }[]>([]);
  const [activityGrid, setActivityGrid] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings
  const [targetLang, setTargetLang] = useState('PL');

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      if (typeof window !== 'undefined') {
        const storedTarget = localStorage.getItem('crux_target_lang') || 'PL';
        setTargetLang(storedTarget);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        // 1. Fetch all words for the target language
        const { data: words, error } = await supabase
          .from('words')
          .select('*')
          .eq('target_lang', targetLang);

        if (error) throw error;

        const typedWords: WordStats[] = words || [];

        // 2. Process Top Confusing Words (Top 5 by search_count DESC)
        const sorted = [...typedWords].sort((a, b) => b.search_count - a.search_count);
        setTopWords(sorted.slice(0, 5));

        // 3. Construct 7-Day Chart Data
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d;
        }).reverse();

        const weeklyStats = last7Days.map((date) => {
          const dateStr = date.toDateString();
          // Find search volume: Sum search_count for words last searched on this day
          // Or just count how many words were last searched on this day.
          // Let's sum search_count for words that match this date.
          const count = typedWords
            .filter((w) => new Date(w.last_searched_at).toDateString() === dateStr)
            .reduce((sum, w) => sum + w.search_count, 0);

          return {
            day: daysOfWeek[date.getDay()],
            count: count,
          };
        });
        setChartData(weeklyStats);

        // 4. Construct Activity Grid (Last 28 Days, 4 weeks)
        const last28Days = Array.from({ length: 28 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d;
        }).reverse();

        const gridData = last28Days.map((date) => {
          const dateStr = date.toDateString();
          const count = typedWords
            .filter((w) => new Date(w.last_searched_at).toDateString() === dateStr)
            .reduce((sum, w) => sum + w.search_count, 0);

          return {
            date: date.toISOString().split('T')[0],
            count: count,
          };
        });
        setActivityGrid(gridData);

      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [mounted, targetLang]);

  // Determine GitHub style contribution grid color based on search volume
  const getGridColor = (count: number) => {
    if (count === 0) return 'bg-[#1e1933]'; // Empty
    if (count <= 2) return 'bg-[#4c3599]'; // Low
    if (count <= 5) return 'bg-[#6d4be0]'; // Medium
    return 'bg-[#A78BFA]'; // High (accent color)
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[#161224] pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            Stats
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#161224] text-[#A78BFA] border border-[#2a2245]">
            Target: {targetLang}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] font-medium">
          Monitor your vocabulary stats and learning activity.
        </p>
      </div>

      {loading ? (
        /* Skeleton Loader for Stats */
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-[#161224] border border-[#2a2245] rounded-3xl" />
          <div className="h-28 bg-[#161224] border border-[#2a2245] rounded-3xl" />
          <div className="h-60 bg-[#161224] border border-[#2a2245] rounded-3xl" />
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F472B6]" />
              Weekly Search Volume
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161224',
                      borderColor: '#2a2245',
                      borderRadius: '12px',
                      color: '#E2E8F0',
                      fontSize: '11px',
                    }}
                    cursor={{ fill: 'rgba(167, 139, 250, 0.05)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#A78BFA"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GitHub Activity Grid */}
          <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#A78BFA]" />
              Vocabulary Activity Grid
            </h3>
            <div className="flex flex-col gap-3">
              {/* Grid representation */}
              <div className="grid grid-cols-7 gap-1.5 justify-center max-w-[280px] mx-auto">
                {activityGrid.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-md transition-all duration-300 ${getGridColor(item.count)}`}
                    title={`${item.date}: ${item.count} searches`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#94A3B8] px-2 mt-1">
                <span>28 days ago</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#1e1933]" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#4c3599]" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#6d4be0]" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#A78BFA]" />
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Top Confusing Words */}
          <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F472B6]" />
              Top Confusing Words
            </h3>

            {topWords.length > 0 ? (
              <div className="flex flex-col gap-3">
                {topWords.map((wordObj, idx) => (
                  <div
                    key={wordObj.id}
                    className="bg-[#0B0813]/60 border border-[#2a2245] rounded-2xl p-3.5 flex flex-col gap-2 hover:border-[#382e5c] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#A78BFA] bg-[#161224] border border-[#2a2245] w-5 h-5 flex items-center justify-center rounded-full">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-[#E2E8F0]">{wordObj.word}</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#251f3d] text-[#F472B6]">
                        {wordObj.search_count} searches
                      </span>
                    </div>

                    <div className="text-[11px] text-[#94A3B8] pl-7">
                      <span className="font-semibold text-slate-400">Meaning: </span>
                      {wordObj.meaning}
                    </div>

                    {wordObj.synonyms && wordObj.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-7 pt-0.5">
                        {wordObj.synonyms.map((syn, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[9px] px-2 py-0.5 bg-[#161224] rounded-full border border-[#2a2245] text-[#F472B6]"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#94A3B8] flex flex-col items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#2a2245]" />
                <p>No words lookup history yet. Tap words on the news feed!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
