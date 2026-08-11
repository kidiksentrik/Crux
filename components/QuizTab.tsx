'use client';

import React, { useState, useEffect } from 'react';
import { B1Word, QuizQuestion } from '@/lib/types';
import { updateWordStatus } from '@/lib/storage';

interface QuizTabProps {
  allWords: B1Word[];
  ttsSpeed: number;
}

export default function QuizTab({ allWords, ttsSpeed }: QuizTabProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuiz = React.useCallback(() => {
    if (!allWords || allWords.length === 0) return;

    // Pick 5 random questions
    const shuffled = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 5);
    const quiz: QuizQuestion[] = shuffled.map((word) => {
      // Pick 3 wrong options
      const wrongOptions = allWords
        .filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.meaning_en);

      const options = [...wrongOptions, word.meaning_en].sort(() => 0.5 - Math.random());

      return {
        word,
        options,
        correctAnswer: word.meaning_en,
        exampleSentence: word.example_pl,
      };
    });

    setQuestions(quiz);
    setCurrentIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [allWords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQuiz();
    }, 0);
    return () => clearTimeout(timer);
  }, [generateQuiz]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      updateWordStatus(currentQ.word.id, 'mastered');
    } else {
      updateWordStatus(currentQ.word.id, 'learning');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const speakPolish = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = ttsSpeed;
    window.speechSynthesis.speak(utterance);
  };

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-gray-400">Loading B1 Quiz...</div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] p-4 max-w-lg mx-auto">
      {/* Quiz Top Header */}
      {!quizFinished && (
        <div className="w-full card-glass p-4 rounded-2xl mb-4 flex justify-between items-center">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            ⚔️ B1 Quiz Battle
          </span>
          <span className="text-xs font-mono text-gray-300">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>
      )}

      {/* Main Question Box */}
      {!quizFinished && currentQ && (
        <div className="w-full flex-1 flex flex-col justify-between">
          <div className="card-glass p-6 rounded-3xl mb-6 border border-white/10 text-center relative overflow-hidden">
            <div className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/40 bg-blue-500/20 text-blue-300 inline-block mb-3">
              {currentQ.word.category}
            </div>

            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-extrabold text-white">{currentQ.word.word}</h2>
              <button
                onClick={() => speakPolish(currentQ.word.word)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-400"
              >
                🔊
              </button>
            </div>

            <p className="text-xs text-gray-400 font-mono mt-1">Lemma: {currentQ.word.base_form}</p>

            {currentQ.exampleSentence && (
              <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-gray-300 italic">
                &quot;{currentQ.exampleSentence}&quot;
              </div>
            )}
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, idx) => {
              let btnStyle = 'bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700';

              if (isAnswered) {
                if (option === currentQ.correctAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/20';
                } else if (option === selectedOption) {
                  btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                } else {
                  btnStyle = 'opacity-40 bg-gray-900 border-gray-800 text-gray-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition-all duration-300 flex items-center justify-between active:scale-[0.99] ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && option === currentQ.correctAnswer && (
                    <span className="text-emerald-400 font-bold text-base">✓</span>
                  )}
                  {isAnswered && option === selectedOption && option !== currentQ.correctAnswer && (
                    <span className="text-red-400 font-bold text-base">✕</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
            >
              {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results'}
            </button>
          )}
        </div>
      )}

      {/* Quiz Finished Result Screen */}
      {quizFinished && (
        <div className="w-full card-glass p-8 rounded-3xl text-center my-auto border border-blue-500/30">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/40 text-3xl">
            🏆
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">Quiz Completed!</h2>
          <p className="text-sm text-gray-300 mb-4">
            You scored <span className="text-emerald-400 font-extrabold text-xl">{score}</span> out of {questions.length}!
          </p>

          <div className="w-full bg-gray-800/80 p-4 rounded-2xl border border-white/10 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Accuracy:</span>
              <span className="font-bold text-amber-400">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>Mastery Progress:</span>
              <span className="font-bold text-emerald-400">+{score} Words Mastered</span>
            </div>
          </div>

          <button
            onClick={generateQuiz}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
          >
            🔄 Play Again with New Questions
          </button>
        </div>
      )}
    </div>
  );
}
