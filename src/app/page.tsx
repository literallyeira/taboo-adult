'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Product, Category, BlogPost } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import Comments from '@/components/Comments'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/blog?limit=3').then(r => r.json()),
    ]).then(([p, c, b]) => {
      setProducts(p)
      setCategories(c)
      setBlogPosts(Array.isArray(b) ? b : [])
    }).finally(() => setLoading(false))
  }, [])

  const featured = products.filter(p => p.in_stock).slice(0, 6)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-purple-900/10 to-[var(--taboo-bg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(147,51,234,0.08),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tabo.png" alt="TABOO" className="h-32 md:h-40 w-auto mx-auto" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--taboo-accent)] mb-4">Premium Yetişkin Ürünleri</p>
          <h1 className="font-[var(--font-serif)] text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Arzularınızı<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Keşfedin</span>
          </h1>
          <p className="text-[var(--taboo-text-muted)] max-w-lg mx-auto mb-8 text-base leading-relaxed">
            Los Santos&apos;un en özel yetişkin ürünleri mağazası. Özenle seçilmiş, yüksek kaliteli ürünlerle gizli ve güvenli bir alışveriş deneyimi sunuyoruz.
          </p>
          <Link href="/urunler" className="btn-primary text-base px-8 py-3">
            Ürünleri İncele
          </Link>
        </div>
      </section>

      {/* Hakkımızda / Tanıtım */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-900/40 flex items-center justify-center">
              <i className="fa-solid fa-store text-2xl text-[var(--taboo-accent)]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Hakkımızda</h3>
            <p className="text-sm text-[var(--taboo-text-muted)] leading-relaxed">
              Taboo Adult Store, Los Santos&apos;ta hizmet veren lisanslı bir yetişkin ürünleri mağazasıdır. Müşterilerimize en kaliteli ve güvenli ürünleri sunmak önceliğimizdir.
            </p>
          </div>
          <div className="card text-center p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-900/40 flex items-center justify-center">
              <i className="fa-solid fa-location-dot text-2xl text-[var(--taboo-accent)]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Adresimiz</h3>
            <p className="text-sm text-[var(--taboo-text-muted)] leading-relaxed">
              Palomino Ave, Vespucci Blvd.<br />
              Little Seoul, Los Santos<br />
              San Andreas<br />
              <span className="text-[var(--taboo-accent)]">Her gün açık</span>
            </p>
          </div>
          <div className="card text-center p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-900/40 flex items-center justify-center">
              <i className="fa-solid fa-phone text-2xl text-[var(--taboo-accent)]" />
            </div>
            <h3 className="font-bold text-lg mb-2">İletişim</h3>
            <p className="text-sm text-[var(--taboo-text-muted)] leading-relaxed">
              <span className="text-[var(--taboo-accent)]">651 24 860</span> - Skylar<br />
              <span className="text-[var(--taboo-accent)]">527 06 458</span> - Maggie<br />
              <span className="text-[var(--taboo-accent)]">936 78 42</span> - Lexi<br />
              <span className="text-xs mt-2 block">Online sipariş veya mağazadan alışveriş</span>
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/urunler?category=${cat.slug}`}
                className="card p-4 text-center hover:bg-[var(--taboo-bg-light)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--taboo-text)] group-hover:text-[var(--taboo-accent)] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Öne Çıkanlar</h2>
          <Link href="/urunler" className="text-sm text-[var(--taboo-accent)] hover:underline">
            Tümünü Gör <i className="fa-solid fa-arrow-right ml-1 text-xs" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden">
                <div className="aspect-square bg-[var(--taboo-bg-light)] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-12 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                  <div className="h-3 w-16 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                  <div className="h-4 w-10 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="card text-center py-12 bg-gradient-to-br from-purple-950/40 to-[var(--taboo-bg-card)] border-purple-500/20">
          <h2 className="text-2xl font-bold mb-3">Online Sipariş Ver</h2>
          <p className="text-[var(--taboo-text-muted)] max-w-md mx-auto mb-6">
            Siparişini online ver, mağazamızdan teslim al veya kargo ile gönderelim. Kolay, hızlı ve gizli.
          </p>
          <Link href="/urunler" className="btn-primary">Alışverişe Başla</Link>
        </div>
      </section>

      {/* Kırmızı Oda Tanıtımı */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="red-room-card text-center animate-red-pulse">
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/50 flex items-center justify-center border border-red-500/30">
              <i className="fa-solid fa-door-closed text-2xl text-red-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-400">Kırmızı Oda</h2>
            <p className="text-red-300/80 max-w-xl mx-auto mb-4 text-sm leading-relaxed">
              Mağazamızın en gizemli köşesi... Kırmızı Oda, en cesur fantezileriniz için tasarlanmış
              özel bir deneyim alanıdır. Bu gizli oda, sadece seçilmiş müşterilerimize açıktır.
              İçeride ne olduğunu keşfetmek için mağazamızı ziyaret edin ve personelimizle konuşun.
            </p>
            <p className="text-xs text-red-400/60 mb-6">
              <i className="fa-solid fa-lock mr-1" />Gizli oda - Detaylı bilgi için mağazamızı ziyaret edin veya bizi arayın.
            </p>
            <Link href="/kirmizi-oda" className="inline-flex items-center gap-2 px-6 py-3 bg-red-700/30 hover:bg-red-700/50 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-300 font-semibold text-sm transition-all">
              <i className="fa-solid fa-eye" /> Kırmızı Oda&apos;yı Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Yorumlar */}
      <Comments />

      {/* Blog Yazıları - En altta */}
      {blogPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Blog Yazıları</h2>
            <Link href="/blog" className="text-sm text-[var(--taboo-accent)] hover:underline">
              Tümünü Gör <i className="fa-solid fa-arrow-right ml-1 text-xs" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <div className="card p-0 overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/10">
                  {/* Cover Image */}
                  <div className="aspect-video bg-[var(--taboo-bg-light)] relative overflow-hidden">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-regular fa-image text-3xl text-[var(--taboo-border)]" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-2 text-[var(--taboo-text)] line-clamp-2 group-hover:text-[var(--taboo-accent)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--taboo-text-muted)] mb-3 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--taboo-text-muted)]">
                      <span>{post.author}</span>
                      <span className="text-[var(--taboo-accent)] group-hover:underline">
                        Devamını Oku <i className="fa-solid fa-arrow-right ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
