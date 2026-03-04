'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--taboo-border)] bg-[var(--taboo-bg)]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tabo.png" alt="TABOO" className="h-12 w-auto flex-shrink-0" />
          <div>
            <span className="text-lg font-bold tracking-wide text-[var(--taboo-text)] group-hover:text-[var(--taboo-primary-light)] transition-colors">
              TABOO
            </span>
            <span className="hidden sm:inline text-xs text-[var(--taboo-text-muted)] ml-2 tracking-widest uppercase">
              Adult Store
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
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
