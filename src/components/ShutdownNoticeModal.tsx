'use client';

import { useState } from 'react';

export default function ShutdownNoticeModal() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#111111] p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">MatchUp yakinda kapanacak</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              MatchUp servisini yakin zamanda kapatmayi planliyoruz. Bize bugune kadar destek olan, kullanan ve burada vakit geciren herkese tesekkur ederiz.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Istek, ihtiyac veya sorularin icin Discord uzerinden <span className="font-semibold text-white">louchesaints</span> kullanici adiyla ulasabilirsin.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://discord.com/users/louchesaints"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Discord'a Git
              </a>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="btn-secondary text-sm"
              >
                Anladim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
