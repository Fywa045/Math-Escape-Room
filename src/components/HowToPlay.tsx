import React from 'react';
import { ArrowLeft, Compass, HelpCircle, CheckCircle2, KeyRound, DoorOpen, Lightbulb } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  const steps = [
    {
      icon: Compass,
      title: '1. Jelajahi Ruangan',
      desc: 'Gunakan tombol W, A, S, D atau tombol Panah pada keyboard (atau D-Pad virtual di layar ponsel) untuk menggerakkan karakter.',
    },
    {
      icon: HelpCircle,
      title: '2. Temukan 5 Teka-Teki',
      desc: 'Di setiap level ruangan terdapat 5 puzzle matematika yang diletakkan pada perabot unik (meja, komputer, lemari, rak buku, atau papan tulis).',
    },
    {
      icon: Lightbulb,
      title: '3. Tekan [E] untuk Interaksi',
      desc: 'Saat mendekati perabot yang memiliki teka-teki, tekan E atau ketuk tombol Aksi untuk membuka lembar soal matematika.',
    },
    {
      icon: CheckCircle2,
      title: '4. Jawab Soal & Dapatkan Hint',
      desc: 'Kerjakan operasi hitung (+, -, ×, ÷). Jika jawabanmu benar, kamu akan mendapatkan 1 angka hint unik untuk soal tersebut.',
    },
    {
      icon: KeyRound,
      title: '5. Urutan Hint Berdasarkan Nomor Soal!',
      highlight: true,
      desc: 'Urutan kode pintu mengikuti NOMOR SOAL (Soal #1 → #2 → #3 → #4 → #5), BUKAN berdasarkan urutan waktu kamu menyelesaikannya! Panel di atas layar otomatis menyusun hint pada slot yang tepat.',
    },
    {
      icon: DoorOpen,
      title: '6. Buka Pintu & Taklukkan 5 Level',
      desc: 'Setelah kelima soal terjawab dan semua hint terkumpul, dekati pintu keluar, masukkan 5 digit kode hint, dan lolos ke level berikutnya!',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="btn-back-from-how-to-play"
          onClick={() => {
            sounds.playInteract();
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold text-xs sm:text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black font-['Fredoka'] text-white">
          CARA BERMAIN
        </h1>

        <div className="w-20" />
      </div>

      {/* Example Box of the Core Rule */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-md">
        <span className="text-xs font-black text-amber-400 uppercase tracking-wider block mb-1">
          💡 Aturan Emas Escape Room:
        </span>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Jika kamu mengerjakan Soal 3 dapat hint <strong className="text-amber-300 font-mono">7</strong>, Soal 1 dapat hint <strong className="text-amber-300 font-mono">4</strong>, Soal 5 dapat hint <strong className="text-amber-300 font-mono">2</strong>, Soal 2 dapat hint <strong className="text-amber-300 font-mono">9</strong>, Soal 4 dapat hint <strong className="text-amber-300 font-mono">6</strong>;
          maka kode pintu yang benar adalah:
        </p>
        <div className="mt-2.5 inline-flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/40 text-amber-300 font-mono font-extrabold text-base sm:text-lg tracking-widest shadow-inner">
          4 - 9 - 7 - 6 - 2
        </div>
      </div>

      {/* Step by step cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex gap-3.5 ${
                step.highlight
                  ? 'bg-amber-500/10 border-amber-400/50 shadow-md'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  step.highlight
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                    : 'bg-slate-800 text-sky-400 border border-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Fredoka'] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to return */}
      <div className="text-center">
        <button
          id="btn-understand-how-to-play"
          onClick={() => {
            sounds.playInteract();
            onBack();
          }}
          className="py-3 px-8 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-950/40 transition"
        >
          Saya Mengerti, Ayo Main!
        </button>
      </div>
    </div>
  );
};
