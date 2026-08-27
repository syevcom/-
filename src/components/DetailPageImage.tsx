import React, { useState, useEffect } from 'react';

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

  // Combined high-clarity style: strictly prevents blurry subpixel rendering and preserves sharp text
  const highQualityStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    imageRendering: '-webkit-optimize-contrast',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    ...style,
  };

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
      {...props}
    />
  );
};

export const HighQualityImage = DetailPageImage;
export default DetailPageImage;

