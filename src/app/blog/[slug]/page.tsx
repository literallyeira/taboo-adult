'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost } from '@/lib/supabase'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[var(--taboo-bg-light)] rounded animate-pulse" />
          <div className="aspect-video bg-[var(--taboo-bg-light)] rounded-2xl animate-pulse" />
          <div className="h-64 bg-[var(--taboo-bg-light)] rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Yazısı Bulunamadı</h1>
        <p className="text-[var(--taboo-text-muted)] mb-6">Bu blog yazısı mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/blog" className="btn-primary">Blog'a Dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--taboo-text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--taboo-text)] transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-[var(--taboo-text)] transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-[var(--taboo-text)] line-clamp-1">{post.title}</span>
      </div>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 border border-[var(--taboo-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <article className="card">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[var(--taboo-text-muted)]">
            <span><i className="fa-solid fa-user mr-1" />{post.author}</span>
            <span><i className="fa-solid fa-calendar mr-1" />{new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-[var(--taboo-text-muted)] mb-6 leading-relaxed">{post.description}</p>
          {post.content && (
            <div className="text-[var(--taboo-text)] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          )}
        </div>

        {/* Back to blog */}
        <div className="mt-8 pt-6 border-t border-[var(--taboo-border)]">
          <Link href="/blog" className="btn-secondary inline-flex items-center gap-2">
            <i className="fa-solid fa-arrow-left" /> Blog'a Dön
          </Link>
        </div>
      </article>
    </div>
  )
}

