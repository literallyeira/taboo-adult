import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('tb_blog_posts')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, content, cover_image_url, author, slug, published, sort_order } = body

    if (!title || !description || !author || !slug) {
      return NextResponse.json({ error: 'Başlık, açıklama, yazar ve slug gerekli' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tb_blog_posts')
      .insert({
        title: title.trim(),
        description: description.trim(),
        content: content?.trim() || null,
        cover_image_url: cover_image_url?.trim() || null,
        author: author.trim(),
        slug: slug.trim(),
        published: published ?? false,
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, content, cover_image_url, author, slug, published, sort_order } = body

    if (!id || !title || !description || !author || !slug) {
      return NextResponse.json({ error: 'ID, başlık, açıklama, yazar ve slug gerekli' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tb_blog_posts')
      .update({
        title: title.trim(),
        description: description.trim(),
        content: content?.trim() || null,
        cover_image_url: cover_image_url?.trim() || null,
        author: author.trim(),
        slug: slug.trim(),
        published: published ?? false,
        sort_order: sort_order || 0,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const adminPassword = request.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tb_blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

