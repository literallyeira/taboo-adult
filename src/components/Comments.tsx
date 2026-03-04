'use client'

import { useState, useEffect } from 'react'
import type { Comment } from '@/lib/supabase'

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    rating: 5,
    anonymous: false,
  })

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments')
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Yorumlar yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.anonymous ? null : formData.name.trim(),
          comment: formData.comment.trim(),
          rating: formData.rating,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Yorum gönderilemedi')
      }

      setSuccess(true)
      setFormData({ name: '', comment: '', rating: 5, anonymous: false })
      fetchComments()
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Müşteri Yorumları</h2>

      {/* Yorum Formu */}
      <div className="card p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Yorumunuzu Paylaşın</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={e => setFormData({ ...formData, anonymous: e.target.checked })}
                className="accent-[var(--taboo-primary)]"
              />
              <span className="text-sm">Anonim olarak paylaş</span>
            </label>
          </div>

          {!formData.anonymous && (
            <div>
              <label className="form-label">İsim (Opsiyonel)</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="İsminiz"
                maxLength={50}
              />
            </div>
          )}

          <div>
            <label className="form-label">Puan *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: r })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.rating >= r
                      ? 'bg-[var(--taboo-primary)] border-[var(--taboo-primary)] text-white'
                      : 'border-[var(--taboo-border)] text-[var(--taboo-text-muted)] hover:border-[var(--taboo-primary)]'
                  }`}
                >
                  <i className="fa-solid fa-star text-sm" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Yorumunuz *</label>
            <textarea
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              className="form-input resize-none"
              rows={4}
              placeholder="Deneyiminizi paylaşın..."
              required
              minLength={3}
              maxLength={1000}
            />
            <p className="text-xs text-[var(--taboo-text-muted)] mt-1">
              {formData.comment.length} / 1000 karakter
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              Yorumunuz başarıyla gönderildi! Teşekkür ederiz.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || formData.comment.trim().length < 3}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2" /> Gönderiliyor...
              </>
            ) : (
              'Yorumu Gönder'
            )}
          </button>
        </form>
      </div>

      {/* Yorum Listesi */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 w-24 bg-[var(--taboo-bg-light)] rounded mb-2" />
              <div className="h-4 w-full bg-[var(--taboo-bg-light)] rounded mb-2" />
              <div className="h-4 w-3/4 bg-[var(--taboo-bg-light)] rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="card text-center py-12 text-[var(--taboo-text-muted)]">
          Henüz yorum yok. İlk yorumu sen yap!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--taboo-bg-light)] flex items-center justify-center">
                    <i className="fa-solid fa-user text-[var(--taboo-text-muted)]" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {comment.name || 'Anonim'}
                    </div>
                    <div className="text-xs text-[var(--taboo-text-muted)]">
                      {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
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
              </div>
              <p className="text-sm text-[var(--taboo-text)] leading-relaxed whitespace-pre-wrap">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

