import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

interface VirtualDPadProps {
  onDirectionChange: (dir: { x: number; y: number } | null) => void;
  onInteract: () => void;
}

export const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionChange,
  onInteract,
}) => {
  const handleTouchStart = (dx: number, dy: number) => {
    onDirectionChange({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    onDirectionChange(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 px-3 flex items-center justify-between gap-4 select-none touch-none">
      {/* 4-way D-Pad */}
      <div className="relative w-32 h-32 bg-slate-900/90 rounded-full border border-slate-700/80 p-2 shadow-lg flex items-center justify-center">
        {/* UP */}
        <button
          id="btn-dpad-up"
          type="button"
          onMouseDown={() => handleTouchStart(0, -1)}
          onMouseUp={handleTouchEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart(0, -1);
          }}
          onTouchEnd={handleTouchEnd}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition"
          aria-label="Atas"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* DOWN */}
        <button
          id="btn-dpad-down"
          type="button"
          onMouseDown={() => handleTouchStart(0, 1)}
          onMouseUp={handleTouchEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart(0, 1);
          }}
          onTouchEnd={handleTouchEnd}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition"
          aria-label="Bawah"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* LEFT */}
        <button
          id="btn-dpad-left"
          type="button"
          onMouseDown={() => handleTouchStart(-1, 0)}
          onMouseUp={handleTouchEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart(-1, 0);
          }}
          onTouchEnd={handleTouchEnd}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition"
          aria-label="Kiri"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* RIGHT */}
        <button
          id="btn-dpad-right"
          type="button"
          onMouseDown={() => handleTouchStart(1, 0)}
          onMouseUp={handleTouchEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart(1, 0);
          }}
          onTouchEnd={handleTouchEnd}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-slate-800 active:bg-amber-500 active:text-slate-950 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition"
          aria-label="Kanan"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Pivot */}
        <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700" />
      </div>

      {/* Instructions note for keyboard users */}
      <div className="hidden sm:flex flex-col items-center text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Kontrol Keyboard:</span>
        <span>Gunakan tombol <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">W</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">A</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">S</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">D</kbd> atau Panah</span>
        <span>Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">E</kbd> atau Spasi untuk Berinteraksi</span>
      </div>

      {/* Large INTERACT / ACTION button */}
      <button
        id="btn-action-interact"
        type="button"
        onClick={onInteract}
        onTouchStart={(e) => {
          e.preventDefault();
          onInteract();
        }}
        className="w-24 h-24 sm:w-28 sm:h-24 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black shadow-xl shadow-amber-950/40 border-2 border-amber-300 flex flex-col items-center justify-center gap-1 transition"
      >
        <Hand className="w-7 h-7" />
        <span className="text-xs tracking-wider uppercase">AKSI [E]</span>
      </button>
    </div>
  );
};
