import React, { useState, useEffect } from 'react';

// Known native pixel dimensions for our long detail-page images.
// Reserving the correct aspect ratio *before* the image finishes loading
// prevents the page height from suddenly jumping once a very tall (up to
// 8000px) image finishes decoding — which is what causes the browser to
// visually "snap" the scroll position while the user is mid-scroll.
const KNOWN_IMAGE_DIMENSIONS: Record<string, { w: number; h: number }> = {
  'biz-charger-35kw.png': { w: 960, h: 1795 },
  'biz-charger-50kw.png': { w: 960, h: 2008 },
  'biz-charger-7-11kw.jpg': { w: 793, h: 8000 },
  'home-detail-chajigo1.jpg': { w: 597, h: 8000 },
  'home-detail-chajigo2.jpg': { w: 522, h: 8000 },
  'home-detail-chajigo3.jpg': { w: 753, h: 8000 },
  'home-detail-coolcharge.jpg': { w: 792, h: 8000 },
  'home-detail-electree.jpg': { w: 960, h: 7912 },
  'home-detail-speel-11kw.jpg': { w: 564, h: 8000 },
  'home-detail-speel-5kw.jpg': { w: 564, h: 8000 },
  'home-detail-speel-7kw.jpg': { w: 564, h: 8000 },
};

function getKnownAspectRatio(src: string): number | undefined {
  if (!src) return undefined;
  const fileName = src.split('/').pop()?.split('?')[0];
  if (!fileName) return undefined;
  const dims = KNOWN_IMAGE_DIMENSIONS[fileName];
  return dims ? dims.w / dims.h : undefined;
}

export interface DetailPageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Optional fallback image source if primary image fails to load */
  fallbackSrc?: string;
  /** Optional container class if wrapping in a layout element */
  containerClassName?: string;
  /** Show subtle loading skeleton while fetching image */
  showSkeleton?: boolean;
  /** Next.js Image compatibility: bypass any downsampling/resizing */
  unoptimized?: boolean;
}

/**
 * DetailPageImage
 * 
 * 표준 HTML <img> 태그 기반의 고해상도 상세페이지/카탈로그 렌더러 컴포넌트입니다.
 * - Next.js <Image /> 컴포넌트의 자동 리사이징/다운샘플링 압축 대신 순수 표준 HTML <img> 태그로 원본 100% 해상도 직접 렌더링
 * - unoptimized={true} 완벽 지원으로 글자 및 다이어그램 깨짐/뭉개짐 방지
 * - 원본 가로세로 비율 유지: width: 100%, height: auto, display: block
 * - CSS image-rendering (-webkit-optimize-contrast, crisp-edges, high-quality) 적용으로 폰트 및 텍스트 선명도 극대화
 * - 엑박 방지를 위한 자동 대체(fallback) URL 복구 처리
 * - 모바일 및 PC 100% 반응형
 */
export const DetailPageImage: React.FC<DetailPageImageProps> = ({
  src,
  alt = '상세페이지',
  className = '',
  loading = 'eager',
  decoding = 'async',
  fallbackSrc,
  unoptimized = true,
  style,
  onError,
  onLoad,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc || '');
  const [hasFallbackTried, setHasFallbackTried] = useState(false);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasFallbackTried(false);
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const failedUrl = currentSrc || src || '';
    const fileName = failedUrl.split('/').pop() || failedUrl;
    
    console.error(`🚨 [상세페이지 이미지 로드 실패 (404 / Network Error)]`);
    console.error(`- 실패한 URL: ${failedUrl}`);
    console.error(`- 요청 파일명: ${fileName}`);
    console.error(`- 컴포넌트 alt: ${alt}`);
    if (fallbackSrc) {
      console.warn(`- 대체(Fallback) URL 시도: ${fallbackSrc}`);
    }

    if (!hasFallbackTried && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasFallbackTried(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  if (!currentSrc) {
    return null;
  }

  const knownRatio = getKnownAspectRatio(currentSrc);

  // Combined high-clarity style: strictly prevents blurry subpixel rendering and preserves sharp text
  const highQualityStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    imageRendering: '-webkit-optimize-contrast',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    // Reserve the correct box size immediately (before the image data
    // arrives) so the page doesn't jump/shift once a very tall image loads.
    ...(knownRatio ? { aspectRatio: `${knownRatio}` } : {}),
    ...style,
  };

  const dims = (() => {
    const fileName = currentSrc.split('/').pop()?.split('?')[0];
    return fileName ? KNOWN_IMAGE_DIMENSIONS[fileName] : undefined;
  })();

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`w-full h-auto block high-res-detail-img ${className}`}
      loading={loading}
      decoding={decoding}
      referrerPolicy="no-referrer"
      style={highQualityStyle}
      onError={handleError}
      onLoad={onLoad}
      {...(dims ? { width: dims.w, height: dims.h } : {})}
      {...props}
    />
  );
};

export const HighQualityImage = DetailPageImage;
export default DetailPageImage;

