import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Application } from '@/lib/supabase';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gtawId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Profile ID gerekli' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    const app = data as Application;
    const { gtaw_user_id: _, character_id: __, ...safe } = app;

    return NextResponse.json({ profile: safe });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
