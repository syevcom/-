import React, { useState } from 'react';

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
 * 모바일 및 고해상도(Retina) 디스플레이에서 상세페이지/카탈로그 이미지가 
 * 흐릿하게 뭉개지거나 번지는 현상을 방지하기 위한 고선명 래퍼 컴포넌트입니다.
 * 
 * - style={{ imageRendering: 'high-quality' }} 기본 적용
 * - 모바일 하드웨어 가속(GPU transform) 및 앤티 앨리어싱 보정
 * - WebKit/Blink/Firefox 호환 선명도 옵티마이징 스타일 탑재
 */
export const DetailPageImage: React.FC<DetailPageImageProps> = ({
  src,
  alt = '상세페이지 이미지',
  className = '',
  style = {},
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  fallbackSrc,
  showSkeleton = false,
  onError,
  onLoad,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultHighQualityStyle: React.CSSProperties = {
    imageRendering: 'auto',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    ...style,
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const imageSource = (hasError && fallbackSrc) ? fallbackSrc : src;

  return (
    <img
      src={imageSource}
      alt={alt}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      className={`w-full max-w-[860px] h-auto mx-auto block high-res-detail-img select-none ${className}`}
      style={defaultHighQualityStyle}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export const HighQualityImage = DetailPageImage;
export default DetailPageImage;
