import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('tb_products')
    .select('id, name, price, image_url, images, category, in_stock, sort_order')
    .order('sort_order', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS })
}

