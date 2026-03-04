import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: order, error } = await supabase
    .from('tb_orders')
    .select('*, tb_order_items(*, product:tb_products(name, image_url))')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(order)
}

