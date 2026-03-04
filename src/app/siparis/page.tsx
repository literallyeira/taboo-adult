'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import type { DeliveryType } from '@/lib/supabase'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Track order mode
  const [trackMode, setTrackMode] = useState(false)
  const [trackId, setTrackId] = useState('')

  if (items.length === 0 && !trackMode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-3">Sipariş</h1>
        <p className="text-[var(--taboo-text-muted)] mb-6">Sepetiniz boş. Sipariş vermeden önce ürün ekleyin.</p>
        <div className="flex flex-col gap-3 items-center">
          <Link href="/urunler" className="btn-primary">Ürünleri İncele</Link>
          <button onClick={() => setTrackMode(true)} className="btn-secondary">Sipariş Takip Et</button>
        </div>
      </div>
    )
  }

  if (trackMode) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center">Sipariş Takip</h1>
        <div className="card space-y-4">
          <label className="form-label">Sipariş ID</label>
          <input
            type="text"
            value={trackId}
            onChange={e => setTrackId(e.target.value)}
            placeholder="Sipariş ID'nizi buraya yapıştırın..."
            className="form-input"
          />
          <button
            onClick={() => { if (trackId.trim()) router.push(`/siparis/${trackId.trim()}`) }}
            className="btn-primary w-full"
            disabled={!trackId.trim()}
          >
            Sipariş Takip Et
          </button>
          <button onClick={() => setTrackMode(false)} className="btn-secondary w-full">Geri</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim() || null,
          notes: notes.trim() || null,
          delivery_type: deliveryType,
          items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sipariş oluşturulamadı')

      clearCart()
      router.push(`/siparis/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Sipariş Ver</h1>

      <div className="grid gap-6">
        {/* Order summary */}
        <div className="card">
          <h2 className="font-semibold mb-4 text-[var(--taboo-text-muted)] uppercase text-xs tracking-wider">Sipariş Özeti</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--taboo-text)]">
                  {item.name} <span className="text-[var(--taboo-text-muted)]">x{item.quantity}</span>
                </span>
                <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--taboo-border)] pt-3 flex justify-between items-center">
            <span className="font-semibold">Toplam</span>
            <span className="text-xl font-bold text-[var(--taboo-accent)]">${totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Checkout form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold mb-2 text-[var(--taboo-text-muted)] uppercase text-xs tracking-wider">Bilgileriniz</h2>

          <div>
            <label className="form-label">Ad Soyad *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ad ve soyadınız"
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Telefon Numarası *</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Telefon numaranız"
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Adres *</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Teslimat / ikamet adresiniz"
              required
              className="form-input"
            />
          </div>

          {/* Teslimat Seçeneği */}
          <div>
            <label className="form-label">Teslimat Seçeneği *</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-[var(--taboo-primary)] bg-[var(--taboo-primary)]/10 text-[var(--taboo-primary-light)]'
                    : 'border-[var(--taboo-border)] text-[var(--taboo-text-muted)] hover:border-[var(--taboo-text-muted)]'
                }`}
              >
                <i className="fa-solid fa-store text-2xl mb-1 block" />
                <div className="font-semibold text-sm">Gel Al</div>
                <div className="text-xs mt-1 opacity-70">Mağazamıza gelerek teslim alın</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-[var(--taboo-primary)] bg-[var(--taboo-primary)]/10 text-[var(--taboo-primary-light)]'
                    : 'border-[var(--taboo-border)] text-[var(--taboo-text-muted)] hover:border-[var(--taboo-text-muted)]'
                }`}
              >
                <i className="fa-solid fa-truck text-2xl mb-1 block" />
                <div className="font-semibold text-sm">Kargo ile Gönder</div>
                <div className="text-xs mt-1 opacity-70">Adresinize kargo ile gönderilir</div>
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Not (isteğe bağlı)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Özel istekleriniz..."
              rows={3}
              className="form-input resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="text-xs text-[var(--taboo-text-muted)] space-y-1">
            <p>* Ödeme mağazada nakit olarak yapılır.</p>
            <p>* Sipariş durumunuzu takip etmek için bir sipariş ID&apos;si alacaksınız.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sipariş Veriliyor...' : 'Sipariş Ver'}
          </button>
        </form>
      </div>
    </div>
  )
}
