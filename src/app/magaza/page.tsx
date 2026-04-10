'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MagazaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90">
            <Image src="/matchup_logo.png" alt="MatchUp" width={140} height={40} />
          </Link>
          <Link href="/" className="btn-secondary text-sm">Ana Sayfa</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 mb-6">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-400 text-xl mt-0.5" />
            <div>
              <h1 className="text-2xl font-bold mb-2">Mağaza Kapatıldı</h1>
              <p className="text-sm text-amber-100/90">
                MatchUp üzerinde tüm satın alımlar durduruldu. Yakın zamanda MatchUp servisinin tamamen kapatılması planlanıyor.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--matchup-bg-card)] p-6 space-y-4">
          <h2 className="text-lg font-semibold">Teşekkürler</h2>
          <p className="text-sm text-[var(--matchup-text-muted)]">
            MatchUp&apos;ı kullanan, destekleyen ve burada eşleşme deneyimine katkı sağlayan herkese içten teşekkür ederiz.
          </p>
          <p className="text-sm text-[var(--matchup-text-muted)]">
            Yeni üyelik, Pro, Plus, Boost ve diğer satın alma işlemleri artık alınmıyor. Mevcut süreçle ilgili yeni bir duyuru olursa bu sayfa üzerinden paylaşılacak.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--matchup-bg-input)] p-5 mt-6">
          <p className="text-sm text-[var(--matchup-text-muted)]">
            Soruların varsa ana sayfaya dönebilir veya topluluk kanallarını takip edebilirsin.
          </p>
          <div className="flex gap-3 mt-4">
            <Link href="/" className="btn-primary text-sm">Ana Sayfaya Dön</Link>
            <a
              href="https://discord.gg/gtaworldtr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Discord
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
