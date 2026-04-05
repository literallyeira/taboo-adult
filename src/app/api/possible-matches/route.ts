import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getWantedGenders } from '@/lib/compatibility';
import { getProfileCompleteness } from '@/lib/profile-completeness';
import type { Application } from '@/lib/supabase';

function getActivityScore(app: Application): number {
  if (!app.last_active_at) return 2;
  const hoursAgo = (Date.now() - new Date(app.last_active_at).getTime()) / 3_600_000;
  if (hoursAgo <= 24) return 5;
  if (hoursAgo <= 72) return 4;
  if (hoursAgo <= 168) return 3;
  if (hoursAgo <= 336) return 2;
  return 1;
}

function shuffleWithinBands<T>(items: T[], scoreFn: (item: T) => number): T[] {
  const bands = new Map<number, T[]>();
  for (const item of items) {
    const s = scoreFn(item);
    if (!bands.has(s)) bands.set(s, []);
    bands.get(s)!.push(item);
  }
  for (const arr of bands.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  const sorted = [...bands.entries()].sort((a, b) => b[0] - a[0]);
  return sorted.flatMap(([, arr]) => arr);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gtawId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  if (!characterId) {
    return NextResponse.json({ error: 'characterId gerekli' }, { status: 400 });
  }

  try {
    const { data: myApp, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('gtaw_user_id', session.user.gtawId)
      .eq('character_id', parseInt(characterId))
      .single();

    if (appError || !myApp) {
      return NextResponse.json({ possibleMatches: [], hasApplication: false });
    }

    const myApplication = myApp as Application;

    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [likesRes, recentLikesRes, dislikesRes, matchesRes, boostsRes, blockedRes] = await Promise.all([
      supabase.from('likes').select('to_application_id').eq('from_application_id', myApplication.id),
      supabase.from('likes').select('to_application_id').eq('from_application_id', myApplication.id).gt('created_at', thirtyDaysAgo),
      supabase.from('dislikes').select('to_application_id').eq('from_application_id', myApplication.id).gt('created_at', tenHoursAgo),
      supabase
        .from('matches')
        .select('application_1_id, application_2_id')
        .or(`application_1_id.eq.${myApplication.id},application_2_id.eq.${myApplication.id}`)
        .gt('created_at', sevenDaysAgo),
      supabase.from('boosts').select('application_id').gt('expires_at', new Date().toISOString()),
      supabase.from('blocked_users').select('blocked_application_id').eq('blocker_application_id', myApplication.id),
    ]);

    const allLikedIds = (likesRes.data ?? []).map((r: { to_application_id: string }) => r.to_application_id);
    const recentLikedIds = (recentLikesRes.data ?? []).map((r: { to_application_id: string }) => r.to_application_id);
    const dislikedIds = (dislikesRes.data ?? []).map((r: { to_application_id: string }) => r.to_application_id);
    const matchedIds: string[] = [];
    (matchesRes.data ?? []).forEach((m: { application_1_id: string; application_2_id: string }) => {
      if (m.application_1_id !== myApplication.id) matchedIds.push(m.application_1_id);
      if (m.application_2_id !== myApplication.id) matchedIds.push(m.application_2_id);
    });
    const boostedIds = new Set((boostsRes.data ?? []).map((r: { application_id: string }) => r.application_id));
    const blockedIds = (blockedRes.data ?? []).map((r: { blocked_application_id: string }) => r.blocked_application_id);

    const myWanted = getWantedGenders(myApplication.gender, myApplication.sexual_preference);
    if (myWanted.length === 0) {
      return NextResponse.json({ possibleMatches: [], hasApplication: true, application: myApplication });
    }

    const genderFilters: string[] = [];
    for (const g of myWanted) {
      if (myApplication.gender === 'erkek') {
        genderFilters.push(`and(gender.eq.${g},sexual_preference.in.(${g === 'erkek' ? 'homoseksuel,biseksuel' : 'heteroseksuel,biseksuel'}))`);
      } else {
        genderFilters.push(`and(gender.eq.${g},sexual_preference.in.(${g === 'kadin' ? 'homoseksuel,biseksuel' : 'heteroseksuel,biseksuel'}))`);
      }
    }

    const fetchCompatible = async (idsToExclude: string[], fetchLimit: number) => {
      const overFetch = Math.min(Math.max(fetchLimit * 5, 100), 500);
      let q = supabase
        .from('applications')
        .select('*')
        .not('gender', 'is', null)
        .not('sexual_preference', 'is', null)
        .or(genderFilters.join(','))
        .limit(overFetch);

      if (idsToExclude.length > 0) {
        q = q.not('id', 'in', `(${idsToExclude.join(',')})`);
      }

      const { data, error } = await q;
      if (error) return { data: null, error };
      return { data: (data ?? []) as Application[], error: null };
    };

    // Strict: tüm likes + dislikes (10h) + matches (7d) + blocked + self
    const strictExcludeIds = [...new Set([myApplication.id, ...allLikedIds, ...dislikedIds, ...matchedIds, ...blockedIds])];
    // Relaxed: tüm likes + blocked + self (dislike ve match exclusion düşürülür)
    const relaxedExcludeIds = [...new Set([myApplication.id, ...allLikedIds, ...blockedIds])];
    // Minimal: sadece son 30 gün likes + blocked + self (eski tek taraflı beğeniler geri gelir)
    const minimalExcludeIds = [...new Set([myApplication.id, ...recentLikedIds, ...blockedIds])];

    const mergedById = new Map<string, Application>();
    const addBatch = (rows: Application[]) => {
      for (const row of rows) {
        if (!mergedById.has(row.id)) mergedById.set(row.id, row);
      }
    };

    const fetchSize = Math.min(limit + 40, 120);

    const { data: strictRows, error: strictErr } = await fetchCompatible(strictExcludeIds, fetchSize);
    if (strictErr) {
      return NextResponse.json({ error: 'Başvurular alınamadı' }, { status: 500 });
    }
    addBatch((strictRows ?? []) as Application[]);

    if (mergedById.size < limit) {
      const { data: relaxedRows, error: relaxedErr } = await fetchCompatible(
        [...new Set([...relaxedExcludeIds, ...Array.from(mergedById.keys())])],
        fetchSize
      );
      if (relaxedErr) {
        return NextResponse.json({ error: 'Başvurular alınamadı' }, { status: 500 });
      }
      addBatch((relaxedRows ?? []) as Application[]);
    }

    if (mergedById.size < limit) {
      const { data: minimalRows, error: minimalErr } = await fetchCompatible(
        [...new Set([...minimalExcludeIds, ...Array.from(mergedById.keys())])],
        fetchSize
      );
      if (minimalErr) {
        return NextResponse.json({ error: 'Başvurular alınamadı' }, { status: 500 });
      }
      addBatch((minimalRows ?? []) as Application[]);
    }

    const apps = Array.from(mergedById.values());

    // Boost'lu profiller en üstte, sonra aktiflik+completeness+shuffle ile sırala
    const boostedApps = apps.filter((a) => boostedIds.has(a.id));
    const normalApps = apps.filter((a) => !boostedIds.has(a.id));

    const rankedNormal = shuffleWithinBands(normalApps, (a) => {
      const activity = getActivityScore(a);
      const completeness = getProfileCompleteness(a) >= 60 ? 1 : 0;
      return activity * 2 + completeness;
    });

    const ranked = [...boostedApps.slice(0, 10), ...rankedNormal];
    const candidateIds = ranked.slice(0, limit).map((a) => a.id);

    const [likesToCount, matchesCount] = await Promise.all([
      candidateIds.length > 0
        ? supabase.from('likes').select('to_application_id').in('to_application_id', candidateIds)
        : { data: [] },
      candidateIds.length > 0
        ? supabase
            .from('matches')
            .select('application_1_id, application_2_id')
            .or(`application_1_id.in.(${candidateIds.join(',')}),application_2_id.in.(${candidateIds.join(',')})`)
            .gt('created_at', sevenDaysAgo)
        : { data: [] },
    ]);

    const likedCountMap: Record<string, number> = {};
    (likesToCount.data ?? []).forEach((r: { to_application_id: string }) => {
      likedCountMap[r.to_application_id] = (likedCountMap[r.to_application_id] || 0) + 1;
    });
    const matchCountMap: Record<string, number> = {};
    (matchesCount.data ?? []).forEach((m: { application_1_id: string; application_2_id: string }) => {
      matchCountMap[m.application_1_id] = (matchCountMap[m.application_1_id] || 0) + 1;
      matchCountMap[m.application_2_id] = (matchCountMap[m.application_2_id] || 0) + 1;
    });

    const stripSensitive = (app: Application) => {
      const { gtaw_user_id: _, character_id: __, ...safe } = app;
      return safe;
    };
    const possible = ranked.slice(0, limit).map((a) => ({
      ...stripSensitive(a),
      liked_count: likedCountMap[a.id] || 0,
      match_count: matchCountMap[a.id] || 0,
    }));

    if (possible.length > 0) {
      const viewRecords = possible.slice(0, 5).map(p => ({
        viewer_application_id: myApplication.id,
        viewed_application_id: p.id,
      }));
      supabase.from('profile_views').insert(viewRecords).then(() => {});
    }

    return NextResponse.json({
      possibleMatches: possible,
      hasApplication: true,
      application: stripSensitive(myApplication),
    });
  } catch (error) {
    console.error('Possible matches error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
