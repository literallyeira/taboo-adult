'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Ad {
  id: string;
  position: string;
  image_url: string;
  link_url: string;
  expires_at: string;
}

/** IAB skyscraper 160×600 — tam görünsün diye object-contain; kısa ekranda orantılı küçülür */
const AD_WIDTH = 160;
const AD_MAX_H = 600;

function AdSlot({ ad, side }: { ad: Ad | null; side: 'left' | 'right' }) {
  // Banner'ı, ana içerik (yaklaşık 700px) ile ekran kenarı arasındaki boşluğun ortasına konumla (160px genişlik için)
  const positionStyle = {
    [side]: `calc((100vw - 700px) / 4 - ${AD_WIDTH / 2}px)`,
  };

  const frameClass =
    'rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-black/50';

  if (ad) {
    return (
      <div
        className="fixed top-0 z-40 hidden xl:flex items-center justify-center h-screen py-4 pointer-events-none"
        style={positionStyle}
      >
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group pointer-events-auto"
        >
          <div className="relative w-[160px] shrink-0 flex justify-center">
            <div
              className={`${frameClass} transition-all duration-300 group-hover:border-pink-500/30 group-hover:shadow-pink-500/10 bg-black/20 w-full`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image_url}
                alt="Reklam"
                width={AD_WIDTH}
                height={AD_MAX_H}
                className="block h-auto w-auto max-w-[160px] max-h-[min(600px,calc(100vh-3rem))] object-contain object-top mx-auto"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-[9px] text-gray-500 px-2 py-0.5 rounded-full border border-white/5">
              Reklam
            </div>
          </div>
        </a>
      </div>
    );
  }

  // Boş alan - placeholder (aynı 160×600 oranı)
  return (
    <div
      className="fixed top-0 z-40 hidden xl:flex items-center justify-center h-screen py-4 pointer-events-none"
      style={positionStyle}
    >
      <Link href="/reklam" className="block group pointer-events-auto">
        <div className="relative w-[160px] shrink-0">
          <div
            className={`${frameClass} border-dashed h-[min(600px,calc(100vh-3rem))] min-h-[280px] flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:border-pink-500/30 group-hover:bg-pink-500/5 cursor-pointer`}
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-all">
              <i className="fa-solid fa-rectangle-ad text-xl text-gray-600 group-hover:text-pink-400 transition-colors"></i>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-medium">Reklam Alanı</p>
              <p className="text-[10px] text-gray-600 group-hover:text-pink-400 transition-colors mt-1">Reklam vermek için tıkla</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function AdBanners() {
  const pathname = usePathname();
  const [leftAd, setLeftAd] = useState<Ad | null>(null);
  const [rightAd, setRightAd] = useState<Ad | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Önce reklam sistemi açık mı kontrol et
    fetch('/api/ads/status')
      .then((res) => res.json())
      .then((data) => {
        if (!data.enabled) {
          setLoaded(true);
          return;
        }
        setEnabled(true);
        return fetch('/api/ads')
          .then((res) => res.json())
          .then((data) => {
            setLeftAd(data.left || null);
            setRightAd(data.right || null);
          });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !enabled) return null;
  if (pathname !== '/') return null;

  return (
    <>
      <AdSlot ad={leftAd} side="left" />
      <AdSlot ad={rightAd} side="right" />
    </>
  );
}
