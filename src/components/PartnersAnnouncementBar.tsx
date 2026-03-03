'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PartnersAnnouncementBar() {
  const [hasPartners, setHasPartners] = useState(false);

  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => setHasPartners(Array.isArray(data) && data.length > 0))
      .catch(() => setHasPartners(false));
  }, []);

  if (!hasPartners) return null;

  return (
    <div className="w-full bg-[var(--matchup-primary)]/15 border-b border-[var(--matchup-primary)]/30 py-1.5 px-4 text-center">
      <Link
        href="/#is-ortaklari-avantajlar"
        className="text-xs sm:text-sm text-[var(--matchup-text-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
      >
        <i className="fa-solid fa-handshake text-[var(--matchup-primary)]" />
        <span>Ortaklarımızın sizlere sunduğu avantajlardan faydalanmak için bilgi mesajına tıklayın.</span>
        <i className="fa-solid fa-chevron-down text-[10px] opacity-70" />
      </Link>
    </div>
  );
}
