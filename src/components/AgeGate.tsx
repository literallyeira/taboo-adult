'use client'

import { useState, useEffect } from 'react'

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('ageVerified') === 'true'
    setVerified(ageVerified)
  }, [])

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true')
    setVerified(true)
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  if (verified) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-6">
        <div className="text-6xl font-bold text-red-500 mb-4">18+</div>
        <h1 className="text-2xl font-bold text-[var(--taboo-text)] mb-2">
          Yaş Doğrulama
        </h1>
        <p className="text-[var(--taboo-text-muted)] leading-relaxed">
          Bu site yetişkin içerik barındırmaktadır. Devam etmek için 18 yaşında veya daha büyük olduğunuzu onaylamalısınız.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleConfirm}
            className="btn-primary w-full py-3 text-base"
          >
            <i className="fa-solid fa-check mr-2" />18 Yaşında veya Daha Büyüğüm
          </button>
          <button
            onClick={handleDecline}
            className="btn-secondary w-full py-3 text-base"
          >
            <i className="fa-solid fa-xmark mr-2" />Çıkış Yap
          </button>
        </div>
        <p className="text-[10px] text-[var(--taboo-text-muted)] opacity-60">
          Bu site yalnızca 18 yaş ve üzeri kullanıcılar içindir.
        </p>
      </div>
    </div>
  )
}

