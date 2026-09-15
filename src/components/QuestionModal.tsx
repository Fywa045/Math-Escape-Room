import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Sparkles, CornerDownLeft, Delete } from 'lucide-react';
import { Puzzle } from '../types';
import { sounds } from '../utils/audio';

interface QuestionModalProps {
  puzzle: Puzzle;
  onClose: () => void;
  onSolve: (puzzleId: number) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  puzzle,
  onClose,
  onSolve,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    puzzle.solved ? 'correct' : 'idle'
  );
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!puzzle.solved) {
      inputRef.current?.focus();
    }
  }, [puzzle.solved]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (feedback === 'correct') {
      onClose();
      return;
    }

    const numericAnswer = parseInt(inputVal.trim(), 10);
    if (isNaN(numericAnswer)) {
      setFeedback('wrong');
      setIsShaking(true);
      sounds.playWrong();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (numericAnswer === puzzle.answer) {
      setFeedback('correct');
      sounds.playCorrect();
      setTimeout(() => {
        sounds.playHintUnlocked();
      }, 400);
      onSolve(puzzle.id);
    } else {
      setFeedback('wrong');
      setIsShaking(true);
      sounds.playWrong();
      setTimeout(() => setIsShaking(false), 500);
      setInputVal('');
      inputRef.current?.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    if (feedback === 'correct') return;
    if (val === 'clear') {
      setInputVal('');
      setFeedback('idle');
    } else if (val === 'backspace') {
      setInputVal((prev) => prev.slice(0, -1));
      setFeedback('idle');
    } else {
      if (inputVal.length < 6) {
        setInputVal((prev) => prev + val);
        setFeedback('idle');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md bg-slate-900 rounded-2xl border ${
          feedback === 'correct'
            ? 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            : isShaking
            ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-bounce'
            : 'border-slate-700 shadow-2xl'
        } p-6 overflow-hidden flex flex-col relative`}
      >
        {/* Close Button */}
        <button
          id="btn-close-question"
          onClick={() => {
            sounds.playInteract();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Tutup Soal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="px-2.5 py-1 text-xs font-black tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">
            SOAL #{puzzle.id}
          </span>
          <span className="text-xs text-slate-400 font-medium truncate">
            {puzzle.name}
          </span>
        </div>

        {/* Question formula card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center mb-5 shadow-inner">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-2">
            Hitung Nilai Berikut:
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-['JetBrains_Mono'] tracking-wide text-white">
            {puzzle.question}
          </div>
        </div>

        {/* Solved View vs Active Input View */}
        {feedback === 'correct' ? (
          <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-emerald-400 font-['Fredoka']">
                Hebat! Jawabanmu Benar!
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                {puzzle.explanation || `Jawaban yang tepat adalah ${puzzle.answer}.`}
              </p>
            </div>

            {/* Hint Unlocked Badge */}
            <div className="w-full bg-amber-500/10 border border-amber-400/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Hint Angka Soal #{puzzle.id}
                  </span>
                  <span className="text-xs text-slate-300">
                    Otomatis disimpan di slot #{puzzle.id} di atas!
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/30 border border-amber-400 flex items-center justify-center text-3xl font-extrabold font-['JetBrains_Mono'] text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {puzzle.hint}
              </div>
            </div>

            <button
              id="btn-continue-after-solve"
              onClick={() => {
                sounds.playInteract();
                onClose();
              }}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
            >
              <span>Simpan Hint & Lanjutkan Menjelajah</span>
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="mb-4">
              <label htmlFor="answer-input" className="text-xs text-slate-400 mb-1.5 block font-medium">
                Masukkan Jawaban Angka:
              </label>
              <div className="flex gap-2">
                <input
                  id="answer-input"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value.replace(/[^0-9]/g, ''));
                    setFeedback('idle');
                  }}
                  placeholder="Ketik jawaban..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold font-['JetBrains_Mono'] text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
                <button
                  id="btn-submit-answer"
                  type="submit"
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <CornerDownLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">SUBMIT</span>
                </button>
              </div>
            </form>

            {/* Wrong answer feedback */}
            {feedback === 'wrong' && (
              <div className="mb-4 p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Jawaban belum tepat. Jangan menyerah, coba hitung kembali!</span>
              </div>
            )}

            {/* On-screen number pad for touch/click convenience */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold font-mono text-lg border border-slate-700/80 transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs border border-slate-700/80 uppercase tracking-wider transition"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold font-mono text-lg border border-slate-700/80 transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700/80 transition"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
