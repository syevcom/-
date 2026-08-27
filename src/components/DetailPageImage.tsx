import React, { useState, useEffect } from 'react';

export interface DetailPageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Optional fallback image source if primary image fails to load */
  fallbackSrc?: string;
  /** Optional container class if wrapping in a layout element */
  containerClassName?: string;
  /** Show subtle loading skeleton while fetching image */
  showSkeleton?: boolean;
}

/**
 * DetailPageImage
 * 
 * 표준 HTML <img> 태그 기반의 고화질 상세페이지/카탈로그 렌더러 컴포넌트입니다.
 * - Next.js <Image /> 컴포넌트 대신 순수 표준 HTML <img> 태그를 직접 렌더링
 * - 엑박 방지를 위한 자동 대체(fallback) URL 복구 처리
 * - 모바일 및 PC 100% 반응형 (w-full h-auto block)
 */
export const DetailPageImage: React.FC<DetailPageImageProps> = ({
  src,
  alt = '상세페이지',
  className = 'w-full h-auto block',
  loading = 'lazy',
  fallbackSrc,
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

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`w-full h-auto block ${className}`}
      loading={loading}
      onError={handleError}
      onLoad={onLoad}
      {...props}
    />
  );
};

export const HighQualityImage = DetailPageImage;
export default DetailPageImage;

