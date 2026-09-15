import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Grid, Home, CheckCircle2 } from 'lucide-react';
import { GameProgress } from '../types';
import { sounds } from '../utils/audio';

interface GameCompleteModalProps {
  progress: GameProgress;
  onPlayAgain: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  progress,
  onPlayAgain,
  onLevelSelect,
  onMainMenu,
}) => {
  useEffect(() => {
    sounds.playLevelComplete();

    // Dual burst confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const totalTimeSeconds = (Object.values(progress.bestTimes) as number[]).reduce(
    (acc, curr) => acc + (typeof curr === 'number' ? curr : 0),
    0
  );

  const formatTotalTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins} menit ${remainder} detik`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center relative">
        {/* Grand Crown Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/30 animate-pulse">
          <Award className="w-10 h-10" />
        </div>

        <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-2">
          MASTER ESCAPE ROOM TERBUKTI!
        </span>

        <h2 className="text-2xl sm:text-4xl font-black font-['Fredoka'] text-white">
          SELAMAT! KAMU MENANG!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
          Kamu telah berhasil memecahkan semua teka-teki dan melarikan diri dari kelima ruangan: Kamar Tidur, Ruang Tamu, Kantor, Perpustakaan, dan Ruang Kelas!
        </p>

        {/* Badges Grid */}
        <div className="w-full grid grid-cols-2 gap-2 my-5">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-left">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Operasi Dasar 4 Pilar</span>
              <span className="text-[10px] text-slate-400">+ , - , × , ÷ Dikuasai</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-left">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Logika Urutan Hint</span>
              <span className="text-[10px] text-slate-400">Kode Pintu 100% Benar</span>
            </div>
          </div>
        </div>

        {totalTimeSeconds > 0 && (
          <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 mb-6">
            Total Waktu Terbaik Seluruh Ruangan:{' '}
            <strong className="text-amber-400 font-mono font-bold">
              {formatTotalTime(totalTimeSeconds)}
            </strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            id="btn-play-again"
            onClick={() => {
              sounds.playInteract();
              onPlayAgain();
            }}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black font-['Fredoka'] text-base rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>MAIN DARI AWAL (LEVEL 1)</span>
          </button>

          <div className="flex gap-2">
            <button
              id="btn-levels-after-game-complete"
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
              id="btn-home-after-game-complete"
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
