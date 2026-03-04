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
    .from('tb_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const err = checkAdmin(request)
  if (err) return err

  try {
    const body = await request.json()
    const { name, slug, sort_order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tb_categories')
      .insert({ name, slug, sort_order: sort_order || 0 })
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

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Category id required' }, { status: 400 })

  const { error } = await supabase.from('tb_categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

