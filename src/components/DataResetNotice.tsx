'use client';

import { useState } from 'react';

const DISMISS_KEY = 'matchup_data_reset_notice_dismissed_v1';

export default function DataResetNotice() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(DISMISS_KEY) !== '1';
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  return (
    <div className="fixed top-3 right-3 z-[70] max-w-[92vw] sm:max-w-md">
      <div className="rounded-xl border border-yellow-400/40 bg-yellow-500/15 text-yellow-100 shadow-xl backdrop-blur px-4 py-3">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-triangle-exclamation mt-0.5 text-yellow-300" />
          <p className="text-xs sm:text-sm leading-relaxed">
            Ozur dileriz. Eslesme hatasi nedeniyle verilerimiz sifirlanmistir (like/dislike/eslesme).
          </p>
          <button
            type="button"
            aria-label="Duyuruyu kapat"
            className="ml-auto text-yellow-200 hover:text-yellow-50 transition-colors"
            onClick={() => {
              try {
                localStorage.setItem(DISMISS_KEY, '1');
              } catch {}
              setVisible(false);
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>
    </div>
  );
}
