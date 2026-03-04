'use client'

import { useState } from 'react'

interface NSFWBlurProps {
  imageUrl: string | null
  alt: string
  className?: string
  onClick?: () => void
}

export default function NSFWBlur({ imageUrl, alt, className = '', onClick }: NSFWBlurProps) {
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    setRevealed(true)
    onClick?.()
  }

  const isVisible = revealed || hovered

  if (!imageUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[var(--taboo-bg-light)] ${className}`}>
        <i className="fa-regular fa-image text-2xl text-[var(--taboo-border)]" />
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !revealed && setHovered(false)}
    >
      {/* Blurred image */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'}`}
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover blur-lg scale-110"
        />
        {/* Overlay with warning */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">18+</div>
            <p className="text-sm text-white font-semibold">Yetişkin İçerik</p>
            <p className="text-xs text-white/80 mt-2">Görmek için tıklayın veya üzerine gelin</p>
          </div>
        </div>
      </div>

      {/* Revealed image */}
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

