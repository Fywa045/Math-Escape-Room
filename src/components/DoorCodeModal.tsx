import React, { useState, useRef } from 'react';
import { X, Lock, Unlock, AlertTriangle, Delete, Sparkles } from 'lucide-react';
import { Puzzle } from '../types';
import { sounds } from '../utils/audio';

interface DoorCodeModalProps {
  puzzles: Puzzle[];
  onClose: () => void;
  onSuccess: () => void;
}

export const DoorCodeModal: React.FC<DoorCodeModalProps> = ({
  puzzles,
  onClose,
  onSuccess,
}) => {
  // Correct sequence ordered strictly by Puzzle ID 1 to 5
  const sortedPuzzles = [...puzzles].sort((a, b) => a.id - b.id);
  const correctCode = sortedPuzzles.map((p) => String(p.hint)).join('');

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '']);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDigitInput = (numStr: string) => {
    if (isSuccess) return;
    setErrorMsg(null);

    const newDigits = [...digits];
    newDigits[activeSlot] = numStr;
    setDigits(newDigits);

    if (activeSlot < 4) {
      setActiveSlot(activeSlot + 1);
    }
  };

  const handleBackspace = () => {
    if (isSuccess) return;
    setErrorMsg(null);
    const newDigits = [...digits];
    if (newDigits[activeSlot] !== '') {
      newDigits[activeSlot] = '';
      setDigits(newDigits);
    } else if (activeSlot > 0) {
      newDigits[activeSlot - 1] = '';
      setDigits(newDigits);
      setActiveSlot(activeSlot - 1);
    }
  };

  const handleClear = () => {
    if (isSuccess) return;
    setDigits(['', '', '', '', '']);
    setActiveSlot(0);
    setErrorMsg(null);
  };

  const handleCheckCode = () => {
    const entered = digits.join('');
    if (entered.length < 5) {
      setErrorMsg('Masukkan semua 5 angka kode!');
      setIsShaking(true);
      sounds.playWrong();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (entered === correctCode) {
      setIsSuccess(true);
      sounds.playDoorUnlock();
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      sounds.playWrong();
      setErrorMsg('Kode salah! Urutkan hint dari Soal #1 sampai Soal #5.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Quick autofill for convenience if player wants
  const handleAutoFill = () => {
    const codeArr = sortedPuzzles.map((p) => String(p.hint));
    setDigits(codeArr);
    setActiveSlot(4);
    setErrorMsg(null);
    sounds.playInteract();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`w-full max-w-md bg-slate-900 rounded-2xl border ${
          isSuccess
            ? 'border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
            : isShaking
            ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-bounce'
            : 'border-amber-500/50 shadow-2xl'
        } p-6 flex flex-col relative`}
      >
        {/* Close Button */}
        {!isSuccess && (
          <button
            id="btn-close-door-code"
            onClick={() => {
              sounds.playInteract();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Tutup Panel Kode"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-2">
            {isSuccess ? (
              <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 text-amber-400" />
            )}
          </div>
          <h2 className="text-xl font-black font-['Fredoka'] text-white">
            {isSuccess ? 'PINTU TERBUKA!' : 'TERMINAL KUNCI PINTU'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Masukkan kode 5 digit berdasarkan urutan{' '}
            <strong className="text-amber-400 font-semibold">
              Soal #1 → Soal #2 → Soal #3 → Soal #4 → Soal #5
            </strong>
          </p>
        </div>

        {/* 5-Slot Display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 shadow-inner">
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setActiveSlot(idx)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold font-['JetBrains_Mono'] border transition-all ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 scale-105'
                      : activeSlot === idx
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                      : digit !== ''
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  {digit || '_'}
                </button>
                <span className="text-[10px] font-mono text-slate-400 mt-1 font-semibold">
                  Soal #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        {!isSuccess ? (
          <div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitInput(num)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold font-mono text-xl border border-slate-700 transition"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs border border-slate-700 uppercase tracking-wider transition"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleDigitInput('0')}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold font-mono text-xl border border-slate-700 transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition"
                aria-label="Hapus Satu Digit"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                id="btn-autofill-hint"
                type="button"
                onClick={handleAutoFill}
                className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                title="Isi otomatis dengan urutan hint yang terkumpul"
              >
                <Sparkles className="w-4 h-4" />
                <span>Susun Hint</span>
              </button>

              <button
                id="btn-unlock-door"
                type="button"
                onClick={handleCheckCode}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>BUKA PINTU</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 animate-in zoom-in-95 duration-300">
            <p className="text-emerald-400 font-bold text-base mb-1">
              Kunci Terbuka! Melarikan diri dari ruangan...
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-emerald-500 h-full w-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
