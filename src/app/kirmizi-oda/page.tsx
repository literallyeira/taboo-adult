'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RedRoomPage() {
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redroom klasöründeki fotoğrafları yükle
    const loadImages = async () => {
      try {
        // Redroom klasöründeki bilinen dosyaları kontrol et
        const imageFiles = [
          '/redroom/Screenshot_1.png',
          '/redroom/Screenshot_3.png',
          '/redroom/Screenshot_4.png',
          '/redroom/Screenshot_5.png',
          '/redroom/Screenshot_6.png',
          '/redroom/Screenshot_7.png',
        ]
        
        // Gerçek dosyaları kontrol et
        const existingImages: string[] = []
        for (const img of imageFiles) {
          try {
            const response = await fetch(img, { method: 'HEAD' })
            if (response.ok) {
              existingImages.push(img)
            }
          } catch {
            // Dosya yoksa atla
          }
        }
        
        setImages(existingImages)
      } catch (error) {
        console.error('Fotoğraf yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadImages()
  }, [])

  // Otomatik slideshow
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000) // 4 saniyede bir değiş

    return () => clearInterval(interval)
  }, [images.length])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/60 via-red-900/30 to-[var(--taboo-bg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.3),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="mb-6">
            <i className="fa-solid fa-door-closed text-6xl text-red-400 mb-4" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-400">
            Kırmızı Oda
          </h1>
          <p className="text-red-300/90 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            Mağazamızın en gizemli köşesi... Kırmızı Oda, en cesur fantezileriniz için tasarlanmış
            özel bir deneyim alanıdır. Bu gizli oda, sadece seçilmiş müşterilerimize açıktır.
            İçeride ne olduğunu keşfetmek için mağazamızı ziyaret edin ve personelimizle konuşun.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-red-300/80">
            <i className="fa-solid fa-lock" />
            <span>Gizli oda - Sadece seçilmiş müşterilere açık</span>
          </div>
        </div>
      </section>

      {/* Photo Gallery / Slideshow */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="card text-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-red-400 mb-4" />
            <p className="text-[var(--taboo-text-muted)]">Fotoğraflar yükleniyor...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="card text-center py-20">
            <i className="fa-solid fa-image text-4xl text-[var(--taboo-text-muted)] mb-4" />
            <p className="text-[var(--taboo-text-muted)]">Henüz fotoğraf eklenmemiş.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {/* Current Image */}
              {images.map((img, index) => (
                <div
                  key={img}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Kırmızı Oda ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
                    aria-label="Önceki fotoğraf"
                  >
                    <i className="fa-solid fa-chevron-left text-xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
                    aria-label="Sonraki fotoğraf"
                  >
                    <i className="fa-solid fa-chevron-right text-xl" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-red-400 w-6'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Fotoğraf ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-3 text-red-400">
              <i className="fa-solid fa-info-circle mr-2" />
              Nasıl Erişilir?
            </h3>
            <p className="text-[var(--taboo-text-muted)] leading-relaxed">
              Kırmızı Oda&apos;ya erişim için mağazamızı ziyaret edin ve personelimizle iletişime geçin.
              Bu özel alan, sadece belirli koşullar altında kullanılabilir.
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3 text-red-400">
              <i className="fa-solid fa-shield-halved mr-2" />
              Gizlilik ve Güvenlik
            </h3>
            <p className="text-[var(--taboo-text-muted)] leading-relaxed">
              Tüm deneyimler tamamen gizli ve güvenli bir şekilde gerçekleştirilir.
              Müşteri gizliliği bizim için en önemli önceliktir.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/urunler" className="btn-primary inline-flex items-center gap-2">
            <i className="fa-solid fa-arrow-left" />
            Ürünlere Dön
          </Link>
        </div>
      </section>
    </div>
  )
}

