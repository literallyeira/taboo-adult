'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--taboo-border)] bg-[var(--taboo-bg)]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Facebrowser */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tabo.png" alt="TABOO" className="h-12 w-auto flex-shrink-0" />
          </Link>
          <a
            href="https://facebrowser-tr.gta.world/pages/taboo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)] transition-colors"
          >
            <i className="fa-solid fa-globe text-sm" />
            <span className="text-xs hidden sm:inline">Facebrowser</span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/urunler"
            className="text-sm text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)] transition-colors"
          >
            Ürünler
          </Link>
          <Link
            href="/siparis"
            className="text-sm text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)] transition-colors hidden sm:block"
          >
            Sipariş Takip
          </Link>

          {/* Kırmızı Oda */}
          <Link
            href="/kirmizi-oda"
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Kırmızı Oda
          </Link>

          {/* Cart */}
          <Link href="/sepet" className="relative p-2 rounded-lg hover:bg-[var(--taboo-bg-light)] transition-colors group">
            <i className="fa-solid fa-bag-shopping text-lg text-[var(--taboo-text-muted)] group-hover:text-[var(--taboo-accent)] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 badge text-[10px] min-w-[18px] h-[18px] px-1">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
