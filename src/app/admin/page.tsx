'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Product, Category, OrderStatus, DeliveryType, BlogPost, Comment } from '@/lib/supabase'
import Modal from '@/components/Modal'

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
  blog: { label: 'Blog', icon: 'fa-solid fa-blog' },
  comments: { label: 'Yorumlar', icon: 'fa-solid fa-comments' },
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)

  // Tab
  const [tab, setTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'blog' | 'comments'>('dashboard')

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<Comment[]>([])
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

  // Blog form
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [editBlog, setEditBlog] = useState<BlogPost | null>(null)
  const [bTitle, setBTitle] = useState('')
  const [bDesc, setBDesc] = useState('')
  const [bContent, setBContent] = useState('')
  const [bCoverImage, setBCoverImage] = useState('')
  const [bAuthor, setBAuthor] = useState('')
  const [bSlug, setBSlug] = useState('')
  const [bPublished, setBPublished] = useState(false)
  const [bSort, setBSort] = useState('0')

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const uploadHeaders = useCallback(() => ({
    'x-admin-password': password,
  }), [password])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'blog' = 'product') => {
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

      if (type === 'product') {
        setPImage(data.url)
      } else {
        setBCoverImage(data.url)
      }
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
      const [s, p, c, o, b, cm] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/products', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/categories', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/orders', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/blog', { headers: { 'x-admin-password': password } }).then(r => r.json()),
        fetch('/api/admin/comments', { headers: { 'x-admin-password': password } }).then(r => r.json()),
      ])
      setStats(s)
      setProducts(Array.isArray(p) ? p : [])
      setCategories(Array.isArray(c) ? c : [])
      setOrders(Array.isArray(o) ? o : [])
      setBlogPosts(Array.isArray(b) ? b : [])
      setComments(Array.isArray(cm) ? cm : [])
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
  const [editOrderStatus, setEditOrderStatus] = useState<OrderData | null>(null)
  const [orderStatusModal, setOrderStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending')

  const openOrderStatusModal = (order: OrderData) => {
    setEditOrderStatus(order)
    setSelectedStatus(order.status)
    setOrderStatusModal(true)
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ id, status }),
    })
    setOrderStatusModal(false)
    fetchAll()
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Bu siparişi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return
    await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE', headers: headers() })
    fetchAll()
  }

  // Pagination for orders
  const [orderPage, setOrderPage] = useState(1)
  const ordersPerPage = 5
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage)
  const paginatedOrders = orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage)

  // === Blog actions ===
  const openBlogForm = (blog?: BlogPost) => {
    if (blog) {
      setEditBlog(blog)
      setBTitle(blog.title)
      setBDesc(blog.description)
      setBContent(blog.content || '')
      setBCoverImage(blog.cover_image_url || '')
      setBAuthor(blog.author)
      setBSlug(blog.slug)
      setBPublished(blog.published)
      setBSort(String(blog.sort_order))
    } else {
      setEditBlog(null)
      setBTitle(''); setBDesc(''); setBContent(''); setBCoverImage(''); setBAuthor(''); setBSlug(''); setBPublished(false); setBSort('0')
    }
    setShowBlogForm(true)
  }

  const saveBlog = async () => {
    if (!bTitle || !bDesc || !bAuthor || !bSlug) return
    const body = {
      ...(editBlog ? { id: editBlog.id } : {}),
      title: bTitle,
      description: bDesc,
      content: bContent || null,
      cover_image_url: bCoverImage || null,
      author: bAuthor,
      slug: bSlug,
      published: bPublished,
      sort_order: Number(bSort) || 0,
    }

    await fetch('/api/admin/blog', {
      method: editBlog ? 'PUT' : 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    })

    setShowBlogForm(false)
    fetchAll()
  }

  const deleteBlog = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE', headers: headers() })
    fetchAll()
  }

  // === Comment actions ===
  const deleteComment = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE', headers: headers() })
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
        {(['dashboard', 'products', 'categories', 'orders', 'blog', 'comments'] as const).map(t => (
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Siparişler ({orders.length})</h2>
            {totalOrderPages > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                  disabled={orderPage === 1}
                  className="btn-secondary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <span className="text-[var(--taboo-text-muted)]">
                  Sayfa {orderPage} / {totalOrderPages}
                </span>
                <button
                  onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
                  disabled={orderPage === totalOrderPages}
                  className="btn-secondary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {paginatedOrders.map(order => {
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
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openOrderStatusModal(order)} className="btn-secondary text-xs">
                      <i className="fa-solid fa-edit mr-1" />Durum Düzenle
                    </button>
                    <button onClick={() => deleteOrder(order.id)} className="btn-danger text-xs">
                      <i className="fa-solid fa-trash mr-1" />Siparişi Sil
                    </button>
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && (
              <div className="card text-center py-10 text-[var(--taboo-text-muted)]">Henüz sipariş yok.</div>
            )}
          </div>
        </div>
      )}

      {/* ===== ORDER STATUS MODAL ===== */}
      <Modal open={orderStatusModal} onClose={() => setOrderStatusModal(false)} maxWidth="max-w-md">
        <h3 className="font-bold text-lg mb-4">Sipariş Durumu Düzenle</h3>
        {editOrderStatus && (
          <>
            <div className="mb-4 p-3 bg-[var(--taboo-bg-light)] rounded-lg">
              <p className="text-sm font-semibold mb-1">{editOrderStatus.customer_name}</p>
              <p className="text-xs text-[var(--taboo-text-muted)]">Sipariş ID: {editOrderStatus.id.substring(0, 8)}...</p>
            </div>
            <div>
              <label className="form-label">Durum *</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
                className="form-input"
              >
                <option value="pending">Beklemede</option>
                <option value="preparing">Hazırlanıyor</option>
                <option value="ready">Hazır</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => updateOrderStatus(editOrderStatus.id, selectedStatus)}
                className="btn-primary flex-1"
              >
                Kaydet
              </button>
              <button onClick={() => setOrderStatusModal(false)} className="btn-secondary flex-1">
                İptal
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* ===== BLOG ===== */}
      {tab === 'blog' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Blog Yazıları ({blogPosts.length})</h2>
            <button onClick={() => openBlogForm()} className="btn-primary text-sm">
              <i className="fa-solid fa-plus mr-1" /> Blog Yazısı Ekle
            </button>
          </div>

          {/* Blog list */}
          <div className="space-y-2">
            {blogPosts.map(post => (
              <div key={post.id} className="card flex items-center gap-4 p-3">
                <div className="w-16 h-16 rounded-lg bg-[var(--taboo-bg-light)] overflow-hidden flex-shrink-0">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--taboo-border)]">
                      <i className="fa-regular fa-image" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{post.title}</span>
                    {post.published ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Yayında</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">Taslak</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--taboo-text-muted)]">
                    {post.author} · {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <button onClick={() => openBlogForm(post)} className="btn-secondary text-xs px-3 py-1.5">
                  <i className="fa-solid fa-pen mr-1" />Düzenle
                </button>
                <button onClick={() => deleteBlog(post.id)} className="btn-danger text-xs px-3 py-1.5">
                  <i className="fa-solid fa-trash mr-1" />Sil
                </button>
              </div>
            ))}
            {blogPosts.length === 0 && (
              <div className="card text-center py-10 text-[var(--taboo-text-muted)]">Henüz blog yazısı yok.</div>
            )}
          </div>
        </div>
      )}

      {/* ===== COMMENTS ===== */}
      {tab === 'comments' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Yorumlar ({comments.length})</h2>
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--taboo-bg-light)] flex items-center justify-center">
                      <i className="fa-solid fa-user text-[var(--taboo-text-muted)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {comment.name || 'Anonim'}
                      </div>
                      <div className="text-xs text-[var(--taboo-text-muted)]">
                        {new Date(comment.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(r => (
                        <i
                          key={r}
                          className={`fa-solid fa-star text-xs ${
                            r <= comment.rating
                              ? 'text-yellow-400'
                              : 'text-[var(--taboo-text-muted)] opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    {comment.approved ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Onaylı</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">Beklemede</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--taboo-text)] mb-2 leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </p>
                {comment.ip_address && (
                  <p className="text-xs text-[var(--taboo-text-muted)] font-mono mb-2">
                    IP: {comment.ip_address}
                  </p>
                )}
                <button onClick={() => deleteComment(comment.id)} className="btn-danger text-xs px-3 py-1.5">
                  <i className="fa-solid fa-trash mr-1" />Sil
                </button>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="card text-center py-10 text-[var(--taboo-text-muted)]">Henüz yorum yok.</div>
            )}
          </div>
        </div>
      )}

      {/* ===== PRODUCT MODAL (Portal) ===== */}
      <Modal open={showProductForm} onClose={() => setShowProductForm(false)} maxWidth="max-w-md">
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
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={e => handleImageUpload(e, 'product')} disabled={uploading} className="hidden" />
                <div className={`btn-secondary w-full text-center py-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Yükleniyor...</> : <><i className="fa-solid fa-upload mr-2" />Fotoğraf Yükle</>}
                </div>
              </label>
            </div>
            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
            <div className="text-xs text-[var(--taboo-text-muted)] text-center">veya</div>
            <input value={pImage} onChange={e => setPImage(e.target.value)} className="form-input text-sm" placeholder="https://ornek.com/foto.jpg" />
            {pImage && (
              <div className="mt-2 w-full aspect-square max-w-[200px] rounded-lg overflow-hidden bg-[var(--taboo-bg-light)] border border-[var(--taboo-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pImage} alt="Önizleme" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; const p = e.currentTarget.parentElement; if (p) p.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-400">Yüklenemedi</div>' }} />
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
      </Modal>

      {/* ===== BLOG MODAL (Portal) ===== */}
      <Modal open={showBlogForm} onClose={() => setShowBlogForm(false)} maxWidth="max-w-2xl">
        <h3 className="font-bold text-lg">{editBlog ? 'Blog Yazısı Düzenle' : 'Blog Yazısı Ekle'}</h3>
        <div>
          <label className="form-label">Başlık *</label>
          <input value={bTitle} onChange={e => { setBTitle(e.target.value); if (!editBlog) setBSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} className="form-input" />
        </div>
        <div>
          <label className="form-label">Açıklama *</label>
          <textarea value={bDesc} onChange={e => setBDesc(e.target.value)} className="form-input resize-none" rows={3} />
        </div>
        <div>
          <label className="form-label">İçerik</label>
          <textarea value={bContent} onChange={e => setBContent(e.target.value)} className="form-input resize-none" rows={6} placeholder="Blog yazısının tam içeriği..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Yazar *</label>
            <input value={bAuthor} onChange={e => setBAuthor(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Slug *</label>
            <input value={bSlug} onChange={e => setBSlug(e.target.value)} className="form-input" />
          </div>
        </div>
        <div>
          <label className="form-label">Kapak Fotoğrafı</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={e => handleImageUpload(e, 'blog')} disabled={uploading} className="hidden" />
              <div className={`btn-secondary w-full text-center py-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploading ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Yükleniyor...</> : <><i className="fa-solid fa-upload mr-2" />Fotoğraf Yükle</>}
              </div>
            </label>
          </div>
          {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
          <input value={bCoverImage} onChange={e => setBCoverImage(e.target.value)} className="form-input text-sm mt-2" placeholder="https://ornek.com/foto.jpg" />
          {bCoverImage && (
            <div className="mt-2 w-full aspect-video max-w-md rounded-lg overflow-hidden bg-[var(--taboo-bg-light)] border border-[var(--taboo-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bCoverImage} alt="Önizleme" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; const p = e.currentTarget.parentElement; if (p) p.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-400">Yüklenemedi</div>' }} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Sıra</label>
            <input type="number" value={bSort} onChange={e => setBSort(e.target.value)} className="form-input" />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer h-10">
              <input type="checkbox" checked={bPublished} onChange={e => setBPublished(e.target.checked)} className="accent-[var(--taboo-primary)] w-4 h-4" />
              <span className="text-sm">Yayınla</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={saveBlog} className="btn-primary flex-1">Kaydet</button>
          <button onClick={() => setShowBlogForm(false)} className="btn-secondary flex-1">İptal</button>
        </div>
      </Modal>
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
