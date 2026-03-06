import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
}

export async function GET() {
  const { data, error } = await supabase
    .from('tb_categories')
    .select('id, name, slug, sort_order')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS })
}

