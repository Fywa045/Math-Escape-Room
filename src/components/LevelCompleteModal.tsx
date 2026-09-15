import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, KeyRound, ArrowRight, Grid, Home, Sparkles } from 'lucide-react';
import { LevelData } from '../types';
import { sounds } from '../utils/audio';

interface LevelCompleteModalProps {
  level: LevelData;
  timeSpentSeconds: number;
  isNewBest: boolean;
  onNextLevel: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  timeSpentSeconds,
  isNewBest,
  onNextLevel,
  onLevelSelect,
  onMainMenu,
}) => {
  useEffect(() => {
    sounds.playLevelComplete();

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const sortedPuzzles = [...level.puzzles].sort((a, b) => a.id - b.id);
  const codeString = sortedPuzzles.map((p) => String(p.hint)).join(' - ');
  const hasNextLevel = level.id < 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col items-center relative">
        {/* Floating Trophy Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">
          Level {level.id} Selesai!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black font-['Fredoka'] text-white">
          KAMU BERHASIL KELUAR!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {level.roomTitle} telah berhasil kamu pecahkan.
        </p>

        {/* Code & Time Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-5 shadow-inner">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>KODE PINTU YANG DITEMBUS</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-['JetBrains_Mono'] text-amber-300 tracking-widest my-1">
            {codeString}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Waktu: <strong className="text-white font-mono">{formatTime(timeSpentSeconds)}</strong></span>
            {isNewBest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                <Sparkles className="w-3 h-3" /> Rekor Baru!
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {hasNextLevel ? (
            <button
              id="btn-modal-next-level"
              onClick={() => {
                sounds.playInteract();
                onNextLevel();
              }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black font-['Fredoka'] text-base rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition"
            >
              <span>LANJUT LEVEL {level.id + 1}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="btn-modal-game-finish"
              onClick={() => {
                sounds.playInteract();
                onNextLevel();
              }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black font-['Fredoka'] text-base rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition"
            >
              <span>LIHAT HASIL KEMENANGAN TOTAL</span>
              <Sparkles className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              id="btn-modal-levels-screen"
              onClick={() => {
                sounds.playInteract();
                onLevelSelect();
              }}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>PILIH LEVEL</span>
            </button>

            <button
              id="btn-modal-main-menu"
              onClick={() => {
                sounds.playInteract();
                onMainMenu();
              }}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>MENU UTAMA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
