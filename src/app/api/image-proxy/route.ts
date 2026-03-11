import { NextRequest, NextResponse } from 'next/server';
import { getImageCandidates, isImgurHost } from '@/lib/images';

const IMAGE_ACCEPT = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
const HTML_IMAGE_META_REGEXES = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+itemprop=["']contentUrl["'][^>]+content=["']([^"']+)["'][^>]*>/i,
];

function toAbsoluteUrl(candidate: string, baseUrl: string): string {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return candidate;
  }
}

function extractImageFromHtml(html: string, baseUrl: string): string | null {
  for (const regex of HTML_IMAGE_META_REGEXES) {
    const match = html.match(regex);
    if (match?.[1]) return toAbsoluteUrl(match[1], baseUrl);
  }
  return null;
}

async function fetchImageResponse(url: string): Promise<Response | null> {
  const response = await fetch(url, {
    headers: {
      Accept: IMAGE_ACCEPT,
      Referer: 'https://imgur.com/',
      'User-Agent': 'Mozilla/5.0 MatchUpImageProxy/1.0',
    },
    redirect: 'follow',
    cache: 'force-cache',
  });

  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/')) {
    return response;
  }

  if (!contentType.includes('text/html')) {
    return null;
  }

  const html = await response.text();
  const resolvedImageUrl = extractImageFromHtml(html, url);
  if (!resolvedImageUrl) return null;

  const nested = await fetch(resolvedImageUrl, {
    headers: {
      Accept: IMAGE_ACCEPT,
      Referer: 'https://imgur.com/',
      'User-Agent': 'Mozilla/5.0 MatchUpImageProxy/1.0',
    },
    redirect: 'follow',
    cache: 'force-cache',
  });

  if (!nested.ok) return null;
  if (!(nested.headers.get('content-type') || '').startsWith('image/')) return null;
  return nested;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return new NextResponse('Missing url', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || !isImgurHost(parsed.hostname)) {
    return new NextResponse('Unsupported host', { status: 400 });
  }

  try {
    const candidates = getImageCandidates(rawUrl);

    for (const candidate of candidates) {
      const response = await fetchImageResponse(candidate);
      if (!response) continue;

      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Proxy error', { status: 502 });
  }
}

