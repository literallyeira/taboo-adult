'use client';

import { useMemo, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { getImageCandidates, getImgurProxyUrl, isImgurUrl } from '@/lib/images';

type RemoteImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

export function RemoteImage({ src, alt, onError, unoptimized, ...props }: RemoteImageProps) {
  const isImgur = isImgurUrl(src);
  const candidates = useMemo(() => {
    const baseCandidates = isImgur ? [getImgurProxyUrl(src)] : getImageCandidates(src);
    if (baseCandidates.length === 0) return [src];
    if (!isImgur && baseCandidates.length > 0) {
      return [...baseCandidates, src];
    }
    return baseCandidates;
  }, [isImgur, src]);
  const [candidateIndices, setCandidateIndices] = useState<Record<string, number>>({});
  const candidateIndex = candidateIndices[src] || 0;

  const currentSrc = candidates[candidateIndex] || src;
  const shouldBypassOptimizer = unoptimized ?? (isImgur || currentSrc.startsWith('/api/image-proxy'));

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndices((prev) => ({ ...prev, [src]: candidateIndex + 1 }));
      return;
    }
    onError?.(event);
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={shouldBypassOptimizer}
      referrerPolicy={shouldBypassOptimizer ? 'no-referrer' : undefined}
      onError={handleError}
    />
  );
}

