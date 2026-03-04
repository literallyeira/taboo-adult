'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Product, Category, OrderStatus, DeliveryType } from '@/lib/supabase'

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

interface Stats {
  products: number
  categories: number
  orders: number
  pendingOrders: number
  totalRevenue: number
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Beklemede',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  ready: 'bg-green-500/10 text-green-400 border-green-500/30',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const DELIVERY_LABELS: Record<DeliveryType, { label: string; icon: string }> = {
  pickup: { label: 'Gel Al', icon: 'fa-solid fa-store' },
  delivery: { label: 'Kargo', icon: 'fa-solid fa-truck' },
}

const TAB_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: 'Panel', icon: 'fa-solid fa-chart-line' },
  products: { label: 'Ürünler', icon: 'fa-solid fa-box-open' },
  categories: { label: 'Kategoriler', icon: 'fa-solid fa-tags' },
  orders: { label: 'Siparişler', icon: 'fa-solid fa-receipt' },
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)

  // Tab
  const [tab, setTab] = useState<'dashboard' | 'products' | 'categories' | 'orders'>('dashboard')

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(false)

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pImage, setPImage] = useState('')
  const [pCategory, setPCategory] = useState('')
  const [pInStock, setPInStock] = useState(true)
  const [pSort, setPSort] = useState('0')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Category form
  const [showCatForm, setShowCatForm] = useState(false)
  const [cName, setCName] = useState('')
  const [cSlug, setCSlug] = useState('')
  const [cSort, setCSort] = useState('0')

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const uploadHeaders = useCallback(() => ({
    'x-admin-password': password,
  }), [password])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: uploadHeaders(),
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Yükleme başarısız')

      setPImage(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Yükleme hatası')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, c, o] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/products', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/categories', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/orders', { headers: { 'x-admin-password': password } }).then(r => r.json()),
      ])
      setStats(s)
      setProducts(Array.isArray(p) ? p : [])
      setCategories(Array.isArray(c) ? c : [])
      setOrders(Array.isArray(o) ? o : [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [password])

  const tryLogin = async () => {
    setAuthError(false)
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } })
    if (res.ok) {
      setAuthed(true)
      fetchAll()
    } else {
      setAuthError(true)
    }
  }

  useEffect(() => {
    if (authed) fetchAll()
  }, [authed, fetchAll])

  // === Product actions ===
  const openProductForm = (product?: Product) => {
    if (product) {
      setEditProduct(product)
      setPName(product.name)
      setPDesc(product.description || '')
      setPPrice(String(product.price))
      setPImage(product.image_url || '')
      setPCategory(product.category || '')
      setPInStock(product.in_stock)
      setPSort(String(product.sort_order))
    } else {
      setEditProduct(null)
      setPName(''); setPDesc(''); setPPrice(''); setPImage(''); setPCategory(''); setPInStock(true); setPSort('0')
    }
    setShowProductForm(true)
  }

  const saveProduct = async () => {
    if (!pName || !pPrice) return
    const body = {
      ...(editProduct ? { id: editProduct.id } : {}),
      name: pName,
      description: pDesc || null,
      price: Number(pPrice),
      image_url: pImage || null,
      category: pCategory || null,
      in_stock: pInStock,
      sort_order: Number(pSort) || 0,
    }

    await fetch('/api/admin/products', {
      method: editProduct ? 'PUT' : 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    })

    setShowProductForm(false)
    fetchAll()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE', headers: headers() })
    fetchAll()
  }

  // === Category actions ===
  const saveCategory = async () => {
    if (!cName || !cSlug) return
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name: cName, slug: cSlug, sort_order: Number(cSort) || 0 }),
    })
    setShowCatForm(false)
    setCName(''); setCSlug(''); setCSort('0')
    fetchAll()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', headers: headers() })
    fetchAll()
  }

  // === Order actions ===
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ id, status }),
    })
    fetchAll()
  }

  // === Login screen ===
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card w-full max-w-sm space-y-4 animate-fade-in">
          <div className="text-center mb-2">
            <div className="mx-auto mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tabo.png" alt="TABOO" className="h-20 w-auto mx-auto" />
            </div>
            <h1 className="text-xl font-bold">Yönetim Paneli</h1>
            <p className="text-sm text-[var(--taboo-text-muted)]">Devam etmek için şifrenizi girin</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()}
            placeholder="Admin şifresi"
            className="form-input"
            autoFocus
          />
          {authError && <p className="text-red-400 text-sm text-center">Yanlış şifre</p>}
          <button onClick={tryLogin} className="btn-primary w-full">Giriş Yap</button>
        </div>
      </div>
    )
  }

  // === Admin panel ===
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
        <button onClick={fetchAll} disabled={loading} className="btn-secondary text-xs">
          <i className="fa-solid fa-rotate-right mr-1" />
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--taboo-bg-light)] p-1 rounded-xl w-fit">
        {(['dashboard', 'products', 'categories', 'orders'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              tab === t
                ? 'bg-[var(--taboo-primary)] text-white shadow-lg'
                : 'text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)]'
            }`}
          >
            <i className={TAB_LABELS[t].icon} />
            {TAB_LABELS[t].label}
          </button>
        ))}
      </div>

      {/* ===== DASHBOARD ===== */}
      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Ürünler" value={stats.products} icon="fa-solid fa-box-open" />
          <StatCard label="Kategoriler" value={stats.categories} icon="fa-solid fa-tags" />
          <StatCard label="Toplam Sipariş" value={stats.orders} icon="fa-solid fa-receipt" />
          <StatCard label="Bekleyen" value={stats.pendingOrders} icon="fa-solid fa-hourglass-half" accent />
          <StatCard label="Gelir" value={`$${stats.totalRevenue.toLocaleString()}`} icon="fa-solid fa-dollar-sign" accent />
        </div>
      )}

      {/* ===== PRODUCTS ===== */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ürünler ({products.length})</h2>
            <button onClick={() => openProductForm()} className="btn-primary text-sm">
              <i className="fa-solid fa-plus mr-1" /> Ürün Ekle
            </button>
          </div>

          {/* Product form modal */}
          {showProductForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowProductForm(false)}>
              <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg">{editProduct ? 'Ürün Düzenle' : 'Ürün Ekle'}</h3>
                <div>
                  <label className="form-label">Ürün Adı *</label>
                  <input value={pName} onChange={e => setPName(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Açıklama</label>
                  <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} className="form-input resize-none" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Fiyat *</label>
                    <input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Sıra</label>
                    <input type="number" value={pSort} onChange={e => setPSort(e.target.value)} className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Fotoğraf</label>
                  <div className="space-y-2">
                    {/* File upload */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className={`btn-secondary w-full text-center py-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {uploading ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin mr-2" />Yükleniyor...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-upload mr-2" />Fotoğraf Yükle
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-400">{uploadError}</p>
                    )}
                    {/* URL input */}
                    <div className="text-xs text-[var(--taboo-text-muted)] text-center">veya</div>
                    <input
                      value={pImage}
                      onChange={e => setPImage(e.target.value)}
                      className="form-input text-sm"
                      placeholder="https://ornek.com/foto.jpg"
                    />
                    {/* Preview */}
                    {pImage && (
                      <div className="mt-2 w-full aspect-square max-w-[200px] rounded-lg overflow-hidden bg-[var(--taboo-bg-light)] border border-[var(--taboo-border)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pImage}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-400">Yüklenemedi</div>'
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Kategori</label>
                  <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="form-input">
                    <option value="">Yok</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pInStock} onChange={e => setPInStock(e.target.checked)} className="accent-[var(--taboo-primary)]" />
                  <span className="text-sm">Stokta</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveProduct} className="btn-primary flex-1">Kaydet</button>
                  <button onClick={() => setShowProductForm(false)} className="btn-secondary flex-1">İptal</button>
                </div>
              </div>
            </div>
          )}

          {/* Product list */}
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="card flex items-center gap-4 p-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--taboo-bg-light)] overflow-hidden flex-shrink-0">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--taboo-border)]">
                      <i className="fa-regular fa-image" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{p.name}</span>
                    {!p.in_stock && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Tükendi</span>}
                  </div>
                  <div className="text-xs text-[var(--taboo-text-muted)]">
                    {p.category || 'Kategorisiz'} · ${p.price.toLocaleString()}
                  </div>
                </div>
                <button onClick={() => openProductForm(p)} className="btn-secondary text-xs px-3 py-1.5">
                  <i className="fa-solid fa-pen mr-1" />Düzenle
                </button>
                <button onClick={() => deleteProduct(p.id)} className="btn-danger text-xs px-3 py-1.5">
                  <i className="fa-solid fa-trash mr-1" />Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CATEGORIES ===== */}
      {tab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kategoriler ({categories.length})</h2>
            <button onClick={() => { setCName(''); setCSlug(''); setCSort('0'); setShowCatForm(true) }} className="btn-primary text-sm">
              <i className="fa-solid fa-plus mr-1" /> Kategori Ekle
            </button>
          </div>

          {showCatForm && (
            <div className="card mb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Ad *</label>
                  <input value={cName} onChange={e => { setCName(e.target.value); setCSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Slug *</label>
                  <input value={cSlug} onChange={e => setCSlug(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Sıra</label>
                  <input type="number" value={cSort} onChange={e => setCSort(e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCategory} className="btn-primary text-sm">Kaydet</button>
                <button onClick={() => setShowCatForm(false)} className="btn-secondary text-sm">İptal</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="card flex items-center justify-between p-3">
                <div>
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-xs text-[var(--taboo-text-muted)] ml-2">/{c.slug}</span>
                </div>
                <button onClick={() => deleteCategory(c.id)} className="btn-danger text-xs px-3 py-1.5">
                  <i className="fa-solid fa-trash mr-1" />Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ORDERS ===== */}
      {tab === 'orders' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Siparişler ({orders.length})</h2>
          <div className="space-y-3">
            {orders.map(order => {
              const dInfo = DELIVERY_LABELS[order.delivery_type] || DELIVERY_LABELS.pickup
              return (
                <div key={order.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{order.customer_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--taboo-bg-light)] text-[var(--taboo-text-muted)]">
                          <i className={`${dInfo.icon} mr-1`} />{dInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--taboo-text-muted)]">
                        <i className="fa-solid fa-phone mr-1" />{order.customer_phone} · {new Date(order.created_at).toLocaleString('tr-TR')}
                      </p>
                      {order.customer_address && (
                        <p className="text-xs text-[var(--taboo-text-muted)]">
                          <i className="fa-solid fa-location-dot mr-1" />{order.customer_address}
                        </p>
                      )}
                      <p className="text-xs font-mono text-[var(--taboo-text-muted)] mt-1">{order.id}</p>
                    </div>
                    <span className="font-bold text-[var(--taboo-accent)]">${Number(order.total_amount).toLocaleString()}</span>
                  </div>

                  {/* Items */}
                  <div className="text-xs space-y-1 bg-[var(--taboo-bg-light)] rounded-lg p-3">
                    {order.tb_order_items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product?.name || '?'} x{item.quantity}</span>
                        <span>${(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {order.notes && <p className="text-[var(--taboo-text-muted)] pt-1 border-t border-[var(--taboo-border)] mt-1">Not: {order.notes}</p>}
                  </div>

                  {/* Status buttons */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-secondary text-xs">
                          <i className="fa-solid fa-box mr-1" />Hazırlanıyor
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => updateOrderStatus(order.id, 'ready')} className="btn-secondary text-xs">
                          <i className="fa-solid fa-circle-check mr-1" />Hazır
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => updateOrderStatus(order.id, 'completed')} className="btn-primary text-xs">
                          <i className="fa-solid fa-check-double mr-1" />Tamamla
                        </button>
                      )}
                      <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="btn-danger text-xs">
                        <i className="fa-solid fa-xmark mr-1" />İptal Et
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {orders.length === 0 && (
              <div className="card text-center py-10 text-[var(--taboo-text-muted)]">Henüz sipariş yok.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <i className={`${icon} text-lg mb-2 ${accent ? 'text-[var(--taboo-accent)]' : 'text-[var(--taboo-text-muted)]'}`} />
      <p className="text-xs text-[var(--taboo-text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-[var(--taboo-accent)]' : 'text-[var(--taboo-text)]'}`}>{value}</p>
    </div>
  )
}
