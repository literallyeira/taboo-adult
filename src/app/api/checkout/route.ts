import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      error: 'MatchUp üzerindeki satın alımlar durduruldu. Servis yakın zamanda kapatılacak.',
    },
    { status: 410 }
  );
}
