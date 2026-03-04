'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/supabase'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--taboo-text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--taboo-text)] transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-[var(--taboo-text)]">Blog</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">Blog Yazıları</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="aspect-video bg-[var(--taboo-bg-light)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-full bg-[var(--taboo-bg-light)] rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-[var(--taboo-text-muted)] text-lg">Henüz blog yazısı yok.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
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
                  <p className="text-sm text-[var(--taboo-text-muted)] mb-3 line-clamp-3 leading-relaxed">
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
      )}
    </div>
  )
}

