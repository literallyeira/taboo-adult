'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  link_url: string;
  sort_order: number;
  description?: string | null;
  promo_code?: string | null;
  discount_label?: string | null;
}

export default function AvantajlarPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90">
            <Image src="/matchup_logo.png" alt="MatchUp" width={140} height={40} />
          </Link>
          <Link href="/" className="btn-secondary text-sm">Ana Sayfa</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-center mb-2">İş Ortaklarımız & Avantajlar</h1>
        <p className="text-center text-[var(--matchup-text-muted)] text-sm mb-10 max-w-xl mx-auto">
          Ortaklarımızın sizlere sunduğu avantajlardan faydalanın.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-10 h-10 border-2 border-[var(--matchup-primary)] border-t-transparent rounded-full" />
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-16 text-[var(--matchup-text-muted)]">
            <p>Şu an listelenecek avantaj yok.</p>
            <Link href="/" className="text-[var(--matchup-primary)] hover:underline mt-2 inline-block">Ana sayfaya dön</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {partners.map((p) => (
              <a
                key={p.id}
                href={p.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] hover:border-[var(--matchup-primary)]/40 transition-all duration-200 text-left"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="max-h-14 w-auto max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-[var(--matchup-primary)] transition-colors">{p.name}</p>
                  {p.description && (
                    <p className="text-sm text-[var(--matchup-text-muted)] mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                  {(p.promo_code || p.discount_label) && (
                    <p className="text-sm text-emerald-400/90 mt-1 font-medium">
                      {p.promo_code && <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{p.promo_code}</span>}
                      {p.promo_code && p.discount_label && ' '}
                      {p.discount_label && <span>{p.discount_label}</span>}
                    </p>
                  )}
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-[var(--matchup-text-muted)] group-hover:text-[var(--matchup-primary)] text-sm flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
