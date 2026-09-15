import React from 'react';
import { Volume2, VolumeX, HelpCircle, LogOut, KeyRound, CheckCircle2 } from 'lucide-react';
import { Puzzle } from '../types';
import { sounds } from '../utils/audio';

interface HintBarProps {
  levelId: number;
  levelName: string;
  roomTitle: string;
  puzzles: Puzzle[];
  elapsedSeconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  onExitToMenu: () => void;
}

export const HintBar: React.FC<HintBarProps> = ({
  levelId,
  roomTitle,
  puzzles,
  elapsedSeconds,
  isMuted,
  onToggleMute,
  onOpenHowToPlay,
  onExitToMenu,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const solvedCount = puzzles.filter((p) => p.solved).length;
  const allSolved = solvedCount === 5;

  // Crucial: hint slots MUST always be mapped by Puzzle ID (1 to 5)
  // Puzzle IDs are 1, 2, 3, 4, 5
  const sortedPuzzles = [...puzzles].sort((a, b) => a.id - b.id);

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Level Info & Timer */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
              Level {levelId}
            </span>
            <h1 className="text-sm md:text-base font-bold text-slate-100 font-['Fredoka']">
              {roomTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="font-mono text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              ⏱️ {formatTime(elapsedSeconds)}
            </span>
            <span className={allSolved ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              Teka-teki: {solvedCount}/5 Selesai
            </span>
          </div>
        </div>
      </div>

      {/* Center: HINT CODE PANEL (Slots 1 to 5) */}
      <div className="flex flex-col items-center bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700/70 shadow-inner">
        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
          <KeyRound className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>HINT CODE (Sesuai Urutan Soal 1–5)</span>
        </div>

        <div className="flex items-center gap-2">
          {sortedPuzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              className="flex flex-col items-center"
              title={`Soal #${puzzle.id}: ${puzzle.name} (${puzzle.solved ? 'Selesai' : 'Belum Selesai'})`}
            >
              <div
                className={`w-9 h-10 md:w-10 md:h-11 flex items-center justify-center rounded-md font-['JetBrains_Mono'] font-extrabold text-lg md:text-xl transition-all duration-300 border ${
                  puzzle.solved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {puzzle.solved ? (
                  <span className="animate-in fade-in zoom-in duration-300">
                    {puzzle.hint}
                  </span>
                ) : (
                  <span className="text-slate-600">?</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                #{puzzle.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Controls: Door Status & Actions */}
      <div className="flex items-center gap-2">
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
            allSolved
              ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {allSolved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pintu Siap Dibuka!</span>
            </>
          ) : (
            <span>Pintu Terkunci</span>
          )}
        </div>

        {/* Audio Mute Button */}
        <button
          id="btn-sound-toggle"
          onClick={() => {
            onToggleMute();
            sounds.playInteract();
          }}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* How to Play Quick Help */}
        <button
          id="btn-quick-help"
          onClick={() => {
            sounds.playInteract();
            onOpenHowToPlay();
          }}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          aria-label="Petunjuk Cara Main"
          title="Cara Main"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
        </button>

        {/* Exit to Menu */}
        <button
          id="btn-exit-menu"
          onClick={() => {
            sounds.playInteract();
            onExitToMenu();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-700 text-xs font-semibold transition"
          title="Keluar ke Menu"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Menu</span>
        </button>
      </div>
    </header>
  );
};
