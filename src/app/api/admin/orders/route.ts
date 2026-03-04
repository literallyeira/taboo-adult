import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(request: Request) {
  const pw = request.headers.get('x-admin-password')
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const err = checkAdmin(request)
  if (err) return err

  const { data, error } = await supabase
    .from('tb_orders')
    .select('*, tb_order_items(*, product:tb_products(name, image_url))')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const err = checkAdmin(request)
  if (err) return err

  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Order id and status required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tb_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const err = checkAdmin(request)
  if (err) return err

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Order id required' }, { status: 400 })
    }

    // Önce order_items'ı sil
    const { error: itemsError } = await supabase
      .from('tb_order_items')
      .delete()
      .eq('order_id', id)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Sonra order'ı sil
    const { error: orderError } = await supabase
      .from('tb_orders')
      .delete()
      .eq('id', id)

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

