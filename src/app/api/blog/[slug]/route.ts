import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { data, error } = await supabase
      .from('tb_blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

