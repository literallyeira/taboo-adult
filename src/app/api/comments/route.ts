import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const COMMENTS_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
}

// Spam koruması - IP bazlı rate limiting
const recentComments = new Map<string, number[]>()

function cleanOldEntries() {
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000
  
  for (const [ip, timestamps] of recentComments.entries()) {
    const filtered = timestamps.filter(ts => now - ts < fiveMinutes)
    if (filtered.length === 0) {
      recentComments.delete(ip)
    } else {
      recentComments.set(ip, filtered)
    }
  }
}

function checkSpam(ip: string | null): boolean {
  if (!ip) return false
  
  cleanOldEntries()
  const now = Date.now()
  const timestamps = recentComments.get(ip) || []
  const recentCount = timestamps.filter(ts => now - ts < 60000).length // Son 1 dakikada
  
  if (recentCount >= 3) {
    return true // Spam - çok hızlı yorum
  }
  
  timestamps.push(now)
  recentComments.set(ip, timestamps)
  return false
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tb_comments')
      .select('id, name, comment, rating, created_at, approved')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { headers: COMMENTS_CACHE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, comment, rating } = body

    // Validasyon
    if (!comment || comment.trim().length < 3) {
      return NextResponse.json({ error: 'Yorum en az 3 karakter olmalıdır' }, { status: 400 })
    }

    if (!comment || comment.trim().length > 1000) {
      return NextResponse.json({ error: 'Yorum en fazla 1000 karakter olabilir' }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1-5 arasında olmalıdır' }, { status: 400 })
    }

    // Spam kontrolü
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    if (checkSpam(ip)) {
      return NextResponse.json({ error: 'Çok hızlı yorum gönderiyorsunuz. Lütfen bekleyin.' }, { status: 429 })
    }

    // Kötü kelime kontrolü (basit)
    const badWords = ['spam', 'scam', 'fake']
    const commentLower = comment.toLowerCase()
    if (badWords.some(word => commentLower.includes(word))) {
      return NextResponse.json({ error: 'Yorumunuz uygun değil' }, { status: 400 })
    }

    // Aynı IP'den son 10 dakikada aynı yorum kontrolü
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('tb_comments')
      .select('comment')
      .eq('ip_address', ip)
      .gte('created_at', tenMinutesAgo)

    if (recent && recent.some(c => c.comment.trim().toLowerCase() === comment.trim().toLowerCase())) {
      return NextResponse.json({ error: 'Aynı yorumu tekrar gönderemezsiniz' }, { status: 400 })
    }

    // Yorumu kaydet
    const { data, error } = await supabase
      .from('tb_comments')
      .insert({
        name: name?.trim() || null,
        comment: comment.trim(),
        rating: Number(rating),
        ip_address: ip,
        user_agent: userAgent.substring(0, 500), // Max 500 karakter
        approved: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

