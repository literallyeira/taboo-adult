'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartProvider'

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="mb-6">
          <i className="fa-solid fa-bag-shopping text-6xl text-[var(--taboo-border)]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Sepetiniz Boş</h1>
        <p className="text-[var(--taboo-text-muted)] mb-6">Ürünlerimize göz atın ve sepetinize bir şeyler ekleyin.</p>
        <Link href="/urunler" className="btn-primary">Ürünleri İncele</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sepet ({totalItems})</h1>
        <button onClick={clearCart} className="btn-danger text-xs">
          <i className="fa-solid fa-trash mr-1" />Sepeti Temizle
        </button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="card flex items-center gap-4 p-4">
            {/* Image */}
            <div className="w-16 h-16 rounded-lg bg-[var(--taboo-bg-light)] overflow-hidden flex-shrink-0">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fa-regular fa-image text-sm text-[var(--taboo-border)]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-[var(--taboo-accent)] font-bold">${item.price.toLocaleString()}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center border border-[var(--taboo-border)] rounded-lg overflow-hidden">
              <button
                onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                className="px-2.5 py-1.5 hover:bg-[var(--taboo-bg-light)] transition-colors text-sm"
              >
                {item.quantity === 1 ? <i className="fa-solid fa-xmark text-xs" /> : <i className="fa-solid fa-minus text-xs" />}
              </button>
              <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2.5 py-1.5 hover:bg-[var(--taboo-bg-light)] transition-colors text-sm"
              >
                <i className="fa-solid fa-plus text-xs" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right min-w-[80px]">
              <p className="font-bold">${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card mt-6 space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="text-[var(--taboo-text-muted)]">Toplam</span>
          <span className="font-bold text-2xl text-[var(--taboo-accent)]">${totalPrice.toLocaleString()}</span>
        </div>
        <p className="text-xs text-[var(--taboo-text-muted)]">Ödeme mağazada nakit olarak yapılır. Siparişiniz gönderildikten sonra hazırlanacaktır.</p>
        <Link href="/siparis" className="btn-primary w-full text-center block">
          Siparişi Tamamla
        </Link>
      </div>
    </div>
  )
}
