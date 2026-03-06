import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '0')

    let query = supabase
      .from('tb_blog_posts')
      .select('id, slug, title, description, cover_image_url, author, created_at, sort_order')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { headers: PUBLIC_CACHE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

