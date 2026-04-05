'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Application } from '@/lib/supabase';
import { PROFILE_PROMPTS } from '@/lib/prompts';
import { getInlineBadges } from '@/lib/badges-client';
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
const getLookingForLabel = (v: string | null | undefined) =>
  ({ friends: 'Arkadaşlık', dating: 'İlişki' }[v || ''] || null);

function formatLastActive(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (mins < 1) return 'Şimdi aktif';
  if (mins < 60) return `${mins} dk önce aktif`;
  if (hours < 24) return `${hours} saat önce aktif`;
  if (days < 7) return `${days} gün önce aktif`;
  return null;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('matchup_selected_character');
      if (raw) setSelectedCharacter(JSON.parse(raw) as Character);
    } catch { /* ignore */ }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) { setLoading(false); return; }
    fetch(`/api/profile/${profileId}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(data => { if (data?.profile) setProfile(data.profile); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [profileId, session?.user, status]);

  const handleLike = async () => {
    if (!profile || !selectedCharacter) return;
    setActionPending('like');
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toApplicationId: profile.id, characterId: selectedCharacter.id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isMatch) {
          showToast(`${profile.first_name} seni de beğenmiş — eşleşme!`, 'success');
          setTimeout(() => router.push('/?tab=matches'), 1500);
        } else {
          showToast('Beğenildi!', 'success');
          setTimeout(() => router.back(), 800);
        }
      } else {
        showToast(data.error || 'Bir hata oluştu', 'error');
      }
    } catch { showToast('Bağlantı hatası', 'error'); }
    finally { setActionPending(null); }
  };

  const handleDislike = async () => {
    if (!profile || !selectedCharacter) return;
    setActionPending('dislike');
    try {
      const res = await fetch('/api/dislike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toApplicationId: profile.id, characterId: selectedCharacter.id }),
      });
      if (res.ok) { showToast('Geçildi', 'success'); setTimeout(() => router.back(), 500); }
      else { const data = await res.json(); showToast(data.error || 'Hata', 'error'); }
    } catch { showToast('Bağlantı hatası', 'error'); }
    finally { setActionPending(null); }
  };

  const handleBlock = async () => {
    if (!profile || !selectedCharacter) return;
    if (!confirm(`${profile.first_name} ${profile.last_name} engellensin mi?`)) return;
    setActionPending('block');
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedApplicationId: profile.id, characterId: selectedCharacter.id }),
      });
      if (res.ok) { showToast('Profil engellendi.', 'success'); setTimeout(() => router.back(), 800); }
      else { const data = await res.json(); showToast(data.error || 'Engellenemedi.', 'error'); }
    } catch { showToast('Bağlantı hatası.', 'error'); }
    finally { setActionPending(null); }
  };

  const handleReport = async () => {
    if (!profile || !selectedCharacter) return;
    setActionPending('report');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedApplicationId: profile.id, characterId: selectedCharacter.id, reason: reportReason }),
      });
      if (res.ok) {
        showToast('Rapor alındı. Teşekkürler.', 'success');
        setShowReportModal(false); setReportReason('');
        setTimeout(() => router.back(), 800);
      } else { const data = await res.json(); showToast(data.error || 'Rapor gönderilemedi.', 'error'); }
    } catch { showToast('Bağlantı hatası.', 'error'); }
    finally { setActionPending(null); }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[var(--matchup-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-[var(--matchup-text-muted)]">Profili görüntülemek için giriş yapın.</p>
        <Link href="/" className="btn-primary max-w-xs text-center">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <i className="fa-solid fa-user-slash text-4xl text-[var(--matchup-text-muted)]" />
        <p className="text-[var(--matchup-text-muted)]">Profil bulunamadı.</p>
        <Link href="/" className="btn-secondary">Geri Dön</Link>
      </div>
    );
  }

  const photos = [profile.photo_url, ...(profile.extra_photos || [])].filter(Boolean);
  const badges = getInlineBadges(profile);
  const activeText = formatLastActive(profile.last_active_at);
  const lookingFor = getLookingForLabel(profile.looking_for);

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--matchup-text-muted)] hover:text-white transition-colors">
            <i className="fa-solid fa-arrow-left" /> Geri
          </button>
          <Link href="/" className="hover:opacity-90">
            <Image src="/matchup_logo.png" alt="MatchUp" width={120} height={34} />
          </Link>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profil Üst Kısım */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[var(--matchup-border)]">
            {profile.photo_url ? (
              <RemoteImage src={profile.photo_url} alt="" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <i className="fa-solid fa-user text-2xl text-white/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{profile.first_name} {profile.last_name}</h1>
            <p className="text-sm text-[var(--matchup-text-muted)] mt-0.5">
              {profile.age} · {getGenderLabel(profile.gender)} · {getPreferenceLabel(profile.sexual_preference)}
            </p>
            {activeText && (
              <p className="text-xs text-emerald-400 mt-1">
                <i className="fa-solid fa-circle text-[6px] mr-1.5 align-middle" />{activeText}
              </p>
            )}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {badges.map(b => (
                  <span key={b.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${b.colorClass}`}>
                    <i className={`fa-solid ${b.icon}`} style={{ fontSize: '9px' }} /> {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bilgi Kartları */}
        <div className="space-y-4">
          {/* Bio */}
          {profile.description && (
            <div className="rounded-xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] p-4">
              <h2 className="text-xs font-semibold text-[var(--matchup-text-muted)] uppercase tracking-wider mb-2">Hakkında</h2>
              <p className="text-sm leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Detaylar */}
          {lookingFor && (
            <div className="rounded-xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] p-4">
              <h2 className="text-xs font-semibold text-[var(--matchup-text-muted)] uppercase tracking-wider mb-2">Aradığı</h2>
              <p className="text-sm"><i className="fa-solid fa-magnifying-glass mr-2 text-[var(--matchup-primary)]" />{lookingFor}</p>
            </div>
          )}

          {/* Fotoğraflar */}
          {photos.length > 1 && (
            <div className="rounded-xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] p-4">
              <h2 className="text-xs font-semibold text-[var(--matchup-text-muted)] uppercase tracking-wider mb-3">Fotoğraflar</h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <RemoteImage src={url} alt="" width={200} height={200} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Cevapları */}
          {profile.prompts && Object.keys(profile.prompts).filter(k => profile.prompts?.[k]?.trim()).length > 0 && (
            <div className="space-y-3">
              {PROFILE_PROMPTS.filter(p => profile.prompts?.[p.key]?.trim()).map(p => (
                <div key={p.key} className="rounded-xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--matchup-primary)] mb-1.5">{p.label}</p>
                  <p className="text-sm leading-relaxed">{profile.prompts![p.key]}</p>
                </div>
              ))}
            </div>
          )}

          {/* Facebrowser */}
          {profile.facebrowser && (
            <a
              href={`https://face-tr.gta.world/profile/${profile.facebrowser.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-[var(--matchup-bg-card)] border border-[var(--matchup-border)] p-4 hover:border-[var(--matchup-primary)]/40 transition-all"
            >
              <i className="fa-solid fa-at text-[var(--matchup-primary)]" />
              <span className="text-sm">{profile.facebrowser}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-xs text-[var(--matchup-text-muted)] ml-auto" />
            </a>
          )}
        </div>
      </main>

      {/* Sticky Alt Bar — Like / Dislike / Engelle / Raporla */}
      {selectedCharacter && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBlock}
                disabled={!!actionPending}
                className="text-xs text-[var(--matchup-text-muted)] hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-ban" /> Engelle
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                disabled={!!actionPending}
                className="text-xs text-[var(--matchup-text-muted)] hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-flag" /> Raporla
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDislike}
                disabled={!!actionPending}
                className="w-11 h-11 rounded-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
              <button
                onClick={handleLike}
                disabled={!!actionPending}
                className="w-11 h-11 rounded-full bg-[var(--matchup-primary)] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-heart text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in" onClick={() => { setShowReportModal(false); setReportReason(''); }}>
          <div className="card max-w-sm w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Raporla</h2>
            <p className="text-[var(--matchup-text-muted)] text-sm mb-3">{profile.first_name} {profile.last_name} hakkında şikayette bulunuyorsunuz.</p>
            <textarea className="form-input text-sm min-h-[80px] mb-4" placeholder="Sebep (isteğe bağlı)" value={reportReason} onChange={(e) => setReportReason(e.target.value)} maxLength={500} />
            <div className="flex gap-2">
              <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="btn-secondary flex-1">İptal</button>
              <button onClick={handleReport} disabled={!!actionPending} className="btn-primary flex-1">
                {actionPending === 'report' ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
