import React, { useState } from 'react';
import { ArrowLeft, Lock, Unlock, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { GameProgress } from '../types';
import { sounds } from '../utils/audio';

interface LevelSelectProps {
  progress: GameProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
  onResetProgress: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBackToMenu,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatTime = (secs?: number) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="btn-back-to-menu-from-levels"
          onClick={() => {
            sounds.playInteract();
            onBackToMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black font-['Fredoka'] text-white">
          PILIH LEVEL RUANGAN
        </h1>

        <button
          id="btn-trigger-reset-progress"
          onClick={() => {
            sounds.playInteract();
            setShowResetConfirm(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700 font-semibold text-xs transition"
          title="Reset Progres Permainan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Progres</span>
        </button>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEVELS.map((lvl) => {
          const isUnlocked = progress.unlockedLevels.includes(lvl.id);
          const isCompleted = progress.completedLevels.includes(lvl.id);
          const bestTime = progress.bestTimes[lvl.id];

          return (
            <div
              key={lvl.id}
              className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-700/80 hover:border-amber-400/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] cursor-pointer group'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isUnlocked) {
                  sounds.playInteract();
                  onSelectLevel(lvl.id);
                } else {
                  sounds.playWrong();
                }
              }}
            >
              {/* Header inside Card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    Level {lvl.id}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      lvl.difficulty === 'Mudah'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : lvl.difficulty === 'Mudah+'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        : lvl.difficulty === 'Sedang'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : lvl.difficulty === 'Sedang+'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {lvl.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-['Fredoka'] group-hover:text-amber-400 transition">
                  {lvl.roomTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {lvl.description}
                </p>
              </div>

              {/* Status Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {isUnlocked ? (
                  <>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Bebas</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-300">Terbuka</span>
                        </>
                      )}
                    </div>

                    {bestTime && (
                      <div className="flex items-center gap-1 font-mono text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatTime(bestTime)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Selesaikan Level {lvl.id - 1}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Fredoka'] mb-2">
              Reset Progres Permainan?
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Semua pencapaian dan catatan waktu akan dikembalikan ke awal (Level 1 terbuka). Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                  sounds.playWrong();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
