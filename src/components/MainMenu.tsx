import React from 'react';
import { Play, Grid, HelpCircle, Volume2, VolumeX, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import { GameProgress } from '../types';
import { sounds } from '../utils/audio';

interface MainMenuProps {
  progress: GameProgress;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: (levelId: number) => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  isMuted,
  onToggleMute,
  onStartGame,
  onOpenLevelSelect,
  onOpenHowToPlay,
}) => {
  // Find highest unlocked level
  const highestUnlocked = Math.max(...progress.unlockedLevels, 1);
  const completedCount = progress.completedLevels.length;

  return (
    <div className="relative w-full min-h-[580px] flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500 blur-3xl opacity-30" />
      </div>

      {/* Audio toggle in corner */}
      <div className="absolute top-4 right-4 z-20">
        <button
          id="btn-main-menu-sound"
          onClick={() => {
            onToggleMute();
            sounds.playInteract();
          }}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow transition flex items-center gap-2 text-xs font-semibold"
          aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Suara: Mati</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Suara: Hidup</span>
            </>
          )}
        </button>
      </div>

      {/* Main Branding & Title */}
      <div className="relative z-10 text-center max-w-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Edukasi Matematika Dasar & Logika</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-['Fredoka'] tracking-tight text-white drop-shadow-md">
          MATH ESCAPE ROOM
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto">
          Jelajahi ruangan terkunci, selesaikan 5 teka-teki matematika, kumpulkan angka hint sesuai nomor soal, dan susun kode untuk melarikan diri!
        </p>

        {/* Progress badge */}
        {completedCount > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold">
            <Trophy className="w-4 h-4" />
            <span>Progres: {completedCount} / 5 Ruangan Berhasil Ditembus</span>
          </div>
        )}
      </div>

      {/* Menu Actions */}
      <div className="relative z-10 w-full max-w-xs space-y-3">
        {/* Play / Continue Button */}
        <button
          id="btn-menu-play"
          onClick={() => {
            sounds.playInteract();
            onStartGame(highestUnlocked);
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-black font-['Fredoka'] text-xl rounded-2xl shadow-xl shadow-amber-500/20 border-2 border-amber-300 flex items-center justify-center gap-3 transition"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>{completedCount > 0 ? `LANJUT LEVEL ${highestUnlocked}` : 'MULAI MAIN'}</span>
        </button>

        {/* Level Selection Button */}
        <button
          id="btn-menu-levels"
          onClick={() => {
            sounds.playInteract();
            onOpenLevelSelect();
          }}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded-2xl border border-slate-700 shadow-md flex items-center justify-center gap-2.5 transition text-sm"
        >
          <Grid className="w-5 h-5 text-amber-400" />
          <span>PILIH LEVEL (1 - 5)</span>
        </button>

        {/* How to Play Button */}
        <button
          id="btn-menu-how-to-play"
          onClick={() => {
            sounds.playInteract();
            onOpenHowToPlay();
          }}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-300 hover:text-white font-bold rounded-2xl border border-slate-700 shadow-md flex items-center justify-center gap-2.5 transition text-sm"
        >
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <span>CARA BERMAIN</span>
        </button>
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 mt-10 text-center text-xs text-slate-500">
        Top-Down 2D Puzzle Game • Operasi Dasar (+, -, ×, ÷)
      </footer>
    </div>
  );
};
