import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('tb_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS })
}

