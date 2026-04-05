'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import type { Application } from '@/lib/supabase';
import { PROFILE_PROMPTS } from '@/lib/prompts';
import { getInlineBadges } from '@/lib/badges-client';
import { PhotoSlider } from '@/components/PhotoSlider';
import { RemoteImage } from '@/components/RemoteImage';

interface Character {
  id: number;
  memberid: number;
  firstname: string;
  lastname: string;
}

const getGenderLabel = (v: string) => ({ erkek: 'Erkek', kadin: 'Kadın' }[v] || v);
const getPreferenceLabel = (v: string) =>
  ({ heteroseksuel: 'Heteroseksüel', homoseksuel: 'Homoseksüel', biseksuel: 'Biseksüel' }[v] || v);

function MatchPhotoGallery({ photos, children }: { photos: string[]; children: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  return (
    <PhotoSlider photos={photos} value={idx} onChange={setIdx} aspectClass="aspect-[4/5]">
      {children}
    </PhotoSlider>
  );
}

export default function BegenilerPage() {
  const { data: session, status } = useSession();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [likedBy, setLikedBy] = useState<Application[]>([]);
  const [likedByCount, setLikedByCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>('free');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showReportModal, setShowReportModal] = useState<Application | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [blockReportPending, setBlockReportPending] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<'match' | 'reject' | null>(null);
  const [selectedCard, setSelectedCard] = useState<Application | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    try {
      const raw = localStorage.getItem('matchup_selected_character');
      if (raw) {
        const saved = JSON.parse(raw) as Character;
        const chars = (session.user as any).characters || [];
        const found = (chars as Character[]).find((c: Character) => c.id === saved.id);
        if (found) setSelectedCharacter(found);
      }
    } catch { /* ignore */ }
  }, [status, session?.user]);

  useEffect(() => {
    if (!selectedCharacter || status !== 'authenticated') { setLoading(false); return; }
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [likedRes, limitsRes] = await Promise.all([
          fetch(`/api/liked-me?characterId=${selectedCharacter.id}`),
          fetch(`/api/me/limits?characterId=${selectedCharacter.id}`),
        ]);
        if (!cancelled && likedRes.ok) {
          const data = await likedRes.json();
          setLikedBy(data.likedBy || []);
          setLikedByCount(data.count ?? 0);
        }
        if (!cancelled && limitsRes.ok) {
          const limData = await limitsRes.json();
          setTier(limData.tier || 'free');
        }
      } catch {
        if (!cancelled) { setLikedBy([]); setLikedByCount(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [selectedCharacter, status]);

  const handleLike = async (profile: Application) => {
    if (!selectedCharacter) return;
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toApplicationId: profile.id, characterId: selectedCharacter.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikedBy((prev) => prev.filter((p) => p.id !== profile.id));
        setLikedByCount((c) => Math.max(0, c - 1));
        setSelectedCard(null);
        showToast(data.isMatch ? `${profile.first_name} ile eşleştiniz!` : 'Beğenildi!', 'success');
      } else if (res.status === 429) {
        showToast(data.error || 'Günlük hakkınız doldu.', 'error');
      } else {
        showToast(data.error || 'Bir hata oluştu', 'error');
      }
    } catch { showToast('Bağlantı hatası', 'error'); }
  };

  const handleDismiss = (profileId: string) => {
    setLikedBy((prev) => prev.filter((p) => p.id !== profileId));
    setLikedByCount((c) => Math.max(0, c - 1));
    setSelectedCard(null);
  };

  const handleBulkMatch = async () => {
    if (!selectedCharacter || likedBy.length === 0) return;
    setBulkAction('match');
    try {
      const res = await fetch('/api/like/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toApplicationIds: likedBy.map(p => p.id), characterId: selectedCharacter.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikedBy([]); setLikedByCount(0);
        showToast((data.matchCount ?? 0) > 0 ? `${data.matchCount} eşleşme oluştu!` : 'Tümü beğenildi!', 'success');
      } else { showToast(data.error || 'Bir hata oluştu', 'error'); }
    } catch { showToast('Bağlantı hatası', 'error'); }
    finally { setBulkAction(null); }
  };

  const handleBulkReject = async () => {
    if (!selectedCharacter || likedBy.length === 0) return;
    setBulkAction('reject');
    try {
      const res = await fetch('/api/dislike/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toApplicationIds: likedBy.map(p => p.id), characterId: selectedCharacter.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikedBy([]); setLikedByCount(0);
        showToast(`${data.processed ?? likedBy.length} profil reddedildi.`, 'success');
      } else { showToast(data.error || 'Bir hata oluştu', 'error'); }
    } catch { showToast('Bağlantı hatası', 'error'); }
    finally { setBulkAction(null); }
  };

  const handleBlock = async (profile: Application) => {
    if (!selectedCharacter) return;
    if (!confirm(`${profile.first_name} ${profile.last_name} engellensin mi?`)) return;
    setBlockReportPending(profile.id);
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedApplicationId: profile.id, characterId: selectedCharacter.id }),
      });
      if (res.ok) {
        setLikedBy((prev) => prev.filter((p) => p.id !== profile.id));
        setLikedByCount((c) => Math.max(0, c - 1));
        setSelectedCard(null);
        showToast('Profil engellendi.', 'success');
      } else { const data = await res.json(); showToast(data.error || 'Engellenemedi.', 'error'); }
    } catch { showToast('Bağlantı hatası.', 'error'); }
    finally { setBlockReportPending(null); }
  };

  const handleReport = async (profile: Application, reason?: string) => {
    if (!selectedCharacter) return;
    setBlockReportPending(profile.id);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedApplicationId: profile.id, characterId: selectedCharacter.id, reason: reason || '' }),
      });
      if (res.ok) {
        setLikedBy((prev) => prev.filter((p) => p.id !== profile.id));
        setLikedByCount((c) => Math.max(0, c - 1));
        setSelectedCard(null); setShowReportModal(null); setReportReason('');
        showToast('Rapor alındı. Teşekkürler.', 'success');
      } else { const data = await res.json(); showToast(data.error || 'Rapor gönderilemedi.', 'error'); }
    } catch { showToast('Bağlantı hatası.', 'error'); }
    finally { setBlockReportPending(null); }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (status !== 'authenticated' || !session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <div className="card max-w-md w-full text-center">
          <Link href="/" className="inline-block hover:opacity-90 mb-6">
            <Image src="/matchup_logo.png" alt="MatchUp" width={180} height={50} priority />
          </Link>
          <h1 className="text-xl font-bold mb-2">Seni Beğenenler</h1>
          <p className="text-[var(--matchup-text-muted)] mb-6">Bu sayfayı görmek için giriş yapın.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2"><i className="fa-solid fa-right-to-bracket" /> Ana Sayfaya Dön</Link>
        </div>
      </main>
    );
  }

  if (!selectedCharacter) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <div className="card max-w-md w-full text-center">
          <Link href="/" className="inline-block hover:opacity-90 mb-6">
            <Image src="/matchup_logo.png" alt="MatchUp" width={180} height={50} priority />
          </Link>
          <h1 className="text-xl font-bold mb-2">Karakter Seçilmedi</h1>
          <p className="text-[var(--matchup-text-muted)] mb-6">Önce ana sayfadan bir karakter seçmelisiniz.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2"><i className="fa-solid fa-arrow-left" /> Ana Sayfaya Dön</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="hover:opacity-90"><Image src="/matchup_logo.png" alt="MatchUp" width={140} height={40} priority /></Link>
          <Link href="/" className="btn-secondary text-sm"><i className="fa-solid fa-arrow-left mr-2" /> Ana Sayfa</Link>
        </div>

        <div className="mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-eye text-violet-400" /> Seni Beğenenler
          </h1>
          <p className="text-[var(--matchup-text-muted)] text-sm mt-1">Bu profiller seni beğendi. Beğenerek eşleş!</p>
        </div>

        {tier !== 'pro' && likedByCount > 0 ? (
          <div className="card text-center py-12">
            <i className="fa-solid fa-heart text-5xl text-[var(--matchup-primary)] mb-4" />
            <h3 className="text-lg font-bold mb-1">{likedByCount} kişi seni beğendi</h3>
            <p className="text-[var(--matchup-text-muted)] text-sm mb-4">Kim olduklarını görmek için MatchUp Pro&apos;ya geç.</p>
            <Link href="/magaza" className="btn-primary inline-flex items-center gap-2"><i className="fa-solid fa-crown" /> Mağaza&apos;ya Git</Link>
          </div>
        ) : likedBy.length === 0 ? (
          <div className="card text-center py-12">
            <i className="fa-solid fa-heart-crack text-5xl text-[var(--matchup-text-muted)] mb-4" />
            <h3 className="text-lg font-bold mb-1">Henüz seni beğenen yok</h3>
            <p className="text-[var(--matchup-text-muted)] text-sm">Profilini güncelleyip daha fazla kişiye ulaş!</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={handleBulkMatch} disabled={!!bulkAction} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {bulkAction === 'match' ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> İşleniyor...</> : <><i className="fa-solid fa-heart" /> Hepsini Eşleş</>}
              </button>
              <button onClick={handleBulkReject} disabled={!!bulkAction} className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60">
                {bulkAction === 'reject' ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> İşleniyor...</> : <><i className="fa-solid fa-xmark" /> Hepsini Reddet</>}
              </button>
            </div>

            <p className="text-xs text-[var(--matchup-text-muted)] mb-3">{likedBy.length} kişi</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {likedBy.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedCard(profile)}
                  className="rounded-2xl overflow-hidden bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] hover:border-violet-500/40 transition-all text-left flex flex-col items-stretch"
                >
                  <div className="relative aspect-[3/4] w-full">
                    {profile.photo_url ? (
                      <RemoteImage src={profile.photo_url} alt="" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 33vw" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                        <i className="fa-solid fa-user text-3xl text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white font-semibold text-sm truncate drop-shadow-lg">{profile.first_name} {profile.last_name}</p>
                      <p className="text-white/80 text-xs">{profile.age} · {getGenderLabel(profile.gender)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detay Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto animate-fade-in" onClick={() => setSelectedCard(null)}>
          <div className="w-full max-w-lg my-8 rounded-3xl overflow-hidden shadow-2xl bg-[var(--matchup-bg-card)] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button type="button" onClick={() => setSelectedCard(null)} className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <i className="fa-solid fa-times text-lg" />
              </button>
              <MatchPhotoGallery photos={[selectedCard.photo_url, ...(selectedCard.extra_photos || [])].filter(Boolean)}>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 pt-12 pb-3 px-4">
                  {(() => {
                    const badges = getInlineBadges(selectedCard);
                    return badges.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {badges.map(b => (
                          <span key={b.key} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${b.colorClass}`}>
                            <i className={`fa-solid ${b.icon}`} style={{ fontSize: '8px' }} /> {b.label}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{selectedCard.first_name} {selectedCard.last_name}</h3>
                  <p className="text-white/90 text-xs">{selectedCard.age} · {getGenderLabel(selectedCard.gender)} · {getPreferenceLabel(selectedCard.sexual_preference)}</p>
                </div>
              </MatchPhotoGallery>
            </div>
            {selectedCard.prompts && Object.keys(selectedCard.prompts).filter(k => selectedCard.prompts?.[k]?.trim()).length > 0 && (
              <div className="mx-4 mt-3 mb-1 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 space-y-2.5">
                {PROFILE_PROMPTS.filter(p => selectedCard.prompts?.[p.key]?.trim()).map(p => (
                  <div key={p.key} className="pl-3 border-l-2 border-[var(--matchup-primary)]/60">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">{p.label}</p>
                    <p className="text-sm text-white/90 leading-relaxed mt-0.5">{selectedCard.prompts![p.key]}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 space-y-3">
              {selectedCard.description && (
                <p className="text-sm text-[var(--matchup-text-muted)]">{selectedCard.description}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleLike(selectedCard)} className="btn-primary py-2.5 flex-1 flex items-center justify-center gap-2">
                  <i className="fa-solid fa-heart" /> Beğen & Eşleş
                </button>
                <button onClick={() => handleDismiss(selectedCard.id)} className="w-11 h-11 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all flex-shrink-0">
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>
              <div className="flex gap-2 text-xs text-[var(--matchup-text-muted)]">
                <button onClick={() => handleBlock(selectedCard)} disabled={!!blockReportPending} className="flex-1 py-1.5 rounded-lg border border-white/20 hover:text-red-400 hover:border-red-500/30 transition-colors flex items-center justify-center gap-1">
                  <i className="fa-solid fa-ban" /> Engelle
                </button>
                <button onClick={() => { setShowReportModal(selectedCard); setSelectedCard(null); }} disabled={!!blockReportPending} className="flex-1 py-1.5 rounded-lg border border-white/20 hover:text-amber-400 transition-colors flex items-center justify-center gap-1">
                  <i className="fa-solid fa-flag" /> Raporla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in" onClick={() => { setShowReportModal(null); setReportReason(''); }}>
          <div className="card max-w-sm w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Raporla</h2>
            <p className="text-[var(--matchup-text-muted)] text-sm mb-3">{showReportModal.first_name} {showReportModal.last_name} hakkında şikayette bulunuyorsunuz.</p>
            <textarea className="form-input text-sm min-h-[80px] mb-4" placeholder="Sebep (isteğe bağlı)" value={reportReason} onChange={(e) => setReportReason(e.target.value)} maxLength={500} />
            <div className="flex gap-2">
              <button onClick={() => { setShowReportModal(null); setReportReason(''); }} className="btn-secondary flex-1">İptal</button>
              <button onClick={() => handleReport(showReportModal, reportReason)} disabled={!!blockReportPending} className="btn-primary flex-1">
                {blockReportPending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </main>
  );
}
