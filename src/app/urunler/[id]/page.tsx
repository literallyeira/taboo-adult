'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/lib/supabase'
import { useCart } from '@/components/CartProvider'
import NSFWBlur from '@/components/NSFWBlur'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-[var(--taboo-bg-light)] rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
            <div className="h-8 w-64 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
            <div className="h-6 w-24 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
            <div className="h-20 w-full bg-[var(--taboo-bg-light)] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
        <Link href="/urunler" className="btn-primary">Ürünlere Dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--taboo-text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--taboo-text)] transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-[var(--taboo-text)] transition-colors">Ürünler</Link>
        <span>/</span>
        <span className="text-[var(--taboo-text)] line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="aspect-square bg-[var(--taboo-bg-light)] rounded-2xl overflow-hidden border border-[var(--taboo-border)]">
            <NSFWBlur
              imageUrl={selectedImage || product.image_url}
              alt={product.name}
              className="rounded-2xl"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {/* Main photo thumbnail */}
              {product.image_url && (
                <button
                  onClick={() => setSelectedImage(null)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    !selectedImage ? 'border-[var(--taboo-accent)] ring-1 ring-[var(--taboo-accent)]' : 'border-[var(--taboo-border)] hover:border-[var(--taboo-accent)]/50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image_url} alt="Ana foto" className="w-full h-full object-cover" />
                </button>
              )}
              {/* Gallery thumbnails */}
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-[var(--taboo-accent)] ring-1 ring-[var(--taboo-accent)]' : 'border-[var(--taboo-border)] hover:border-[var(--taboo-accent)]/50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-widest text-[var(--taboo-accent)] mb-2">{product.category || 'Kategorisiz'}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-[var(--taboo-accent)] mb-6">${product.price.toLocaleString()}</p>

          {product.description && (
            <p className="text-[var(--taboo-text-muted)] leading-relaxed mb-8">{product.description}</p>
          )}

          {product.in_stock ? (
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--taboo-text-muted)]">Adet:</span>
                <div className="flex items-center border border-[var(--taboo-border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-[var(--taboo-bg-light)] transition-colors text-lg"
                  >
                    <i className="fa-solid fa-minus text-xs" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-2 hover:bg-[var(--taboo-bg-light)] transition-colors text-lg"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="btn-primary w-full text-base py-3"
              >
                {added ? (
                  <><i className="fa-solid fa-check mr-2" />Sepete Eklendi</>
                ) : (
                  <><i className="fa-solid fa-cart-plus mr-2" />Sepete Ekle</>
                )}
              </button>
              <div className="flex items-center gap-2 text-xs text-[var(--taboo-text-muted)]">
                <i className="fa-solid fa-circle-check text-green-400" />
                <span>Stokta &mdash; Ödeme mağazada nakit olarak yapılır</span>
              </div>
            </div>
          ) : (
            <div className="mt-auto card bg-red-500/5 border-red-500/20 text-center py-6">
              <p className="text-red-400 font-medium"><i className="fa-solid fa-circle-xmark mr-1" />Stokta Yok</p>
              <p className="text-sm text-[var(--taboo-text-muted)] mt-1">Daha sonra tekrar kontrol edin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
