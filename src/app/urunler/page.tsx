'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product, Category } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { Suspense } from 'react'

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = activeCategory ? `/api/products?category=${activeCategory}` : '/api/products'
    fetch(url).then(r => r.json()).then(setProducts).finally(() => setLoading(false))
  }, [activeCategory])

  useEffect(() => {
    setActiveCategory(categoryFilter)
  }, [categoryFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--taboo-text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--taboo-text)] transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-[var(--taboo-text)]">Ürünler</span>
        {activeCategory && (
          <>
            <span>/</span>
            <span className="text-[var(--taboo-accent)] capitalize">{activeCategory}</span>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-8">
        {activeCategory ? (
          <span className="capitalize">{activeCategory}</span>
        ) : (
          'Tüm Ürünler'
        )}
      </h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !activeCategory
              ? 'bg-[var(--taboo-primary)] text-white shadow-lg shadow-purple-500/20'
              : 'bg-[var(--taboo-bg-light)] text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)]'
          }`}
        >
          Tümü
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.slug
                ? 'bg-[var(--taboo-primary)] text-white shadow-lg shadow-purple-500/20'
                : 'bg-[var(--taboo-bg-light)] text-[var(--taboo-text-muted)] hover:text-[var(--taboo-text)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid - 5-6 per row */}
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="aspect-square bg-[var(--taboo-bg-light)] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-2 w-12 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                <div className="h-3 w-10 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-[var(--taboo-text-muted)] text-lg">Ürün bulunamadı.</p>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)} className="btn-secondary mt-4">
              Tüm Ürünleri Gör
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Kırmızı Oda - ürünlerin altında */}
      <div className="mt-16">
        <div className="red-room-card text-center animate-red-pulse">
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-900/50 flex items-center justify-center border border-red-500/30">
              <i className="fa-solid fa-door-closed text-xl text-red-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-red-400">Kırmızı Oda</h2>
            <p className="text-red-300/80 max-w-lg mx-auto mb-4 text-sm leading-relaxed">
              Mağazamızın en gizemli köşesi... Kırmızı Oda, en cesur fantezileriniz için tasarlanmış
              özel bir deneyim alanıdır. Bu gizli oda, sadece seçilmiş müşterilerimize açıktır.
              İçeride ne olduğunu keşfetmek için mağazamızı ziyaret edin ve personelimizle konuşun.
            </p>
            <p className="text-xs text-red-400/60">
              <i className="fa-solid fa-lock mr-1" />Gizli oda - Detaylı bilgi için mağazamızı ziyaret edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-8 w-48 bg-[var(--taboo-bg-light)] rounded animate-pulse" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}
