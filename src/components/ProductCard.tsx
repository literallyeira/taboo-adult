'use client'

import Link from 'next/link'
import type { Product } from '@/lib/supabase'
import { useCart } from './CartProvider'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
  }

  return (
    <Link href={`/urunler/${product.id}`} className="group block">
      <div className="card p-0 overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/10">
        {/* Image */}
        <div className="aspect-square bg-[var(--taboo-bg-light)] relative overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fa-regular fa-image text-2xl text-[var(--taboo-border)]" />
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Tükendi</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-0.5">{product.category || 'Kategorisiz'}</p>
          <h3 className="font-semibold text-xs text-[var(--taboo-text)] mb-1.5 line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--taboo-accent)]">${product.price.toLocaleString()}</span>
            {product.in_stock && (
              <button
                onClick={handleAdd}
                className="p-1.5 rounded-lg bg-[var(--taboo-primary)]/10 hover:bg-[var(--taboo-primary)]/20 text-[var(--taboo-primary-light)] transition-colors"
                title="Sepete Ekle"
              >
                <i className="fa-solid fa-cart-plus text-sm" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
