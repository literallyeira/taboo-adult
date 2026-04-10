import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      error: 'MatchUp uzerindeki satin alimlar durduruldu. Servis yakin zamanda kapatilacak.',
    },
    { status: 410 }
  );
}
