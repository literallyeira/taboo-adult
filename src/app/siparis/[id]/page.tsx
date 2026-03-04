'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { OrderStatus, DeliveryType } from '@/lib/supabase'

interface OrderData {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  notes: string | null
  delivery_type: DeliveryType
  status: OrderStatus
  total_amount: number
  created_at: string
  tb_order_items: {
    id: string
    quantity: number
    unit_price: number
    product: { name: string; image_url: string | null } | null
  }[]
}

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Beklemede', color: 'text-yellow-400', icon: 'fa-solid fa-hourglass-half text-yellow-400' },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-400', icon: 'fa-solid fa-box text-blue-400' },
  ready: { label: 'Teslimata Hazır', color: 'text-green-400', icon: 'fa-solid fa-circle-check text-green-400' },
  completed: { label: 'Tamamlandı', color: 'text-gray-400', icon: 'fa-solid fa-check-double text-gray-400' },
  cancelled: { label: 'İptal Edildi', color: 'text-red-400', icon: 'fa-solid fa-circle-xmark text-red-400' },
}

const DELIVERY_LABELS: Record<DeliveryType, { label: string; icon: string }> = {
  pickup: { label: 'Gel Al', icon: 'fa-solid fa-store' },
  delivery: { label: 'Kargo ile Gönderi', icon: 'fa-solid fa-truck' },
}

const STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed']

export default function OrderTrackPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
          <div className="h-32 bg-[var(--taboo-bg-light)] rounded-2xl animate-pulse" />
          <div className="h-48 bg-[var(--taboo-bg-light)] rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
        <p className="text-[var(--taboo-text-muted)] mb-6">Bu sipariş ID&apos;si mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="btn-primary">Ana Sayfaya Dön</Link>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[order.status]
  const currentStep = STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const orderDate = new Date(order.created_at)
  const deliveryInfo = DELIVERY_LABELS[order.delivery_type] || DELIVERY_LABELS.pickup

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Invoice / Fatura */}
      <div className="invoice">
        {/* Invoice header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tabo.png" alt="TABOO" className="h-12 w-auto flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-[var(--taboo-accent)]">TABOO</h1>
                <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider">Adult Store</p>
              </div>
            </div>
            <p className="text-[10px] text-[var(--taboo-text-muted)] mt-2">
              <i className="fa-solid fa-location-dot mr-1" />Vespucci Blvd, Los Santos<br />
              <i className="fa-solid fa-phone mr-1" />Tel: #TABOO
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-[var(--taboo-text)] mb-1">FATURA</h2>
            <p className="text-xs text-[var(--taboo-text-muted)]">
              {orderDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-[var(--taboo-text-muted)]">
              {orderDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Order ID */}
        <div className="mb-6 p-3 rounded-lg bg-purple-950/30 border border-purple-500/10">
          <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">Sipariş Numarası</p>
          <p className="font-mono text-sm text-[var(--taboo-accent)] select-all break-all">{order.id}</p>
        </div>

        {/* Status */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--taboo-bg-light)] border border-[var(--taboo-border)]">
          <div className="flex items-center gap-3 mb-3">
            <i className={`text-2xl ${statusInfo.icon}`} />
            <div>
              <p className={`text-base font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              <p className="text-[10px] text-[var(--taboo-text-muted)]">
                <i className={`${deliveryInfo.icon} mr-1`} />{deliveryInfo.label}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {!isCancelled && (
            <>
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-all ${
                      i <= currentStep ? 'bg-[var(--taboo-primary)]' : 'bg-[var(--taboo-bg)]'
                    }`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-[var(--taboo-text-muted)] mt-1.5">
                {STEPS.map(s => (
                  <span key={s} className={s === order.status ? 'text-[var(--taboo-accent)] font-medium' : ''}>
                    {STATUS_MAP[s].label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-[var(--taboo-border)] my-6" />

        {/* Customer info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">Müşteri</p>
            <p className="font-semibold text-sm">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">Telefon</p>
            <p className="font-semibold text-sm">{order.customer_phone}</p>
          </div>
          {order.customer_address && (
            <div className="col-span-2">
              <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">Adres</p>
              <p className="font-semibold text-sm">{order.customer_address}</p>
            </div>
          )}
          {order.notes && (
            <div className="col-span-2">
              <p className="text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">Not</p>
              <p className="text-sm text-[var(--taboo-text-muted)]">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-[var(--taboo-border)] my-6" />

        {/* Items table */}
        <div className="mb-6">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-[10px] text-[var(--taboo-text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--taboo-border)]">
            <span>Ürün</span>
            <span className="text-right">Adet</span>
            <span className="text-right">Birim Fiyat</span>
            <span className="text-right">Toplam</span>
          </div>
          {order.tb_order_items.map(item => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-3 border-b border-[var(--taboo-border)]/50 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--taboo-bg-light)] overflow-hidden flex-shrink-0">
                  {item.product?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--taboo-border)]">
                      <i className="fa-regular fa-image" />
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm">{item.product?.name || 'Bilinmiyor'}</span>
              </div>
              <span className="text-right text-[var(--taboo-text-muted)]">x{item.quantity}</span>
              <span className="text-right text-[var(--taboo-text-muted)]">${Number(item.unit_price).toLocaleString()}</span>
              <span className="text-right font-medium">${(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-4 rounded-xl bg-purple-950/30 border border-purple-500/10">
          <span className="text-sm font-semibold text-[var(--taboo-text-muted)] uppercase tracking-wider">Genel Toplam</span>
          <span className="text-2xl font-bold text-[var(--taboo-accent)]">${Number(order.total_amount).toLocaleString()}</span>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--taboo-border)]">
          <div className="text-center">
            <p className="text-xs text-[var(--taboo-text-muted)]">
              Taboo Adult Store - Lisanslı İşletme
            </p>
            <p className="text-[10px] text-[var(--taboo-text-muted)] mt-1 opacity-60">
              Bu fatura siparişinizin kanıtı niteliğindedir. Lütfen saklayınız.
            </p>
            <p className="text-[10px] text-[var(--taboo-text-muted)] mt-1 opacity-50">
              City İşletme Lisansı #LS-2024-TABOO
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Link href="/urunler" className="btn-secondary flex-1 text-center">Alışverişe Devam Et</Link>
        <Link href="/" className="btn-secondary flex-1 text-center">Ana Sayfa</Link>
      </div>
    </div>
  )
}
