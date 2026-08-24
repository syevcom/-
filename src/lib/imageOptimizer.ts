/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Checks if the current browser environment supports Canvas WebP export.
 */
let cachedWebpSupport: boolean | null = null;

export function isWebPSupported(): boolean {
  if (cachedWebpSupport !== null) return cachedWebpSupport;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    cachedWebpSupport = dataUrl.startsWith('data:image/webp');
  } catch {
    cachedWebpSupport = false;
  }
  return cachedWebpSupport;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'auto' | 'jpeg';
}

/**
 * Optimizes an image URL (Unsplash, Cloudinary, Imgix, etc.) to use WebP format,
 * query compression parameters, and responsive dimensions.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return '';

  const { width, height, quality = 80, format = 'webp' } = options;

  // 1. Leave inline SVG / data URIs or already optimized tiny assets intact
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // 2. Unsplash Image URL optimization (e.g. images.unsplash.com)
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      if (format === 'webp') {
        urlObj.searchParams.set('fm', 'webp');
      }
      urlObj.searchParams.set('q', String(quality));
      if (width) urlObj.searchParams.set('w', String(width));
      if (height) urlObj.searchParams.set('h', String(height));
      return urlObj.toString();
    } catch {
      // Fallback string replacement if URL parse fails
      let optimized = url;
      if (!optimized.includes('fm=webp')) {
        optimized += (optimized.includes('?') ? '&' : '?') + 'fm=webp';
      }
      if (width && !optimized.includes(`w=${width}`)) {
        optimized += `&w=${width}`;
      }
      return optimized;
    }
  }

  // 3. Cloudinary Image URL optimization
  if (url.includes('res.cloudinary.com')) {
    const formatTransform = format === 'webp' ? 'f_webp,q_auto' : 'f_auto,q_auto';
    const widthTransform = width ? `,w_${width},c_limit` : '';
    return url.replace('/upload/', `/upload/${formatTransform}${widthTransform}/`);
  }

  return url;
}

/**
 * Client-side script/utility to convert uploaded image files, Blobs, or data URLs into
 * highly compressed modern WebP format (or JPEG fallback).
 */
export async function convertToWebP(
  input: File | Blob | string,
  quality = 0.82,
  maxWidth = 1920,
  maxHeight = 1080
): Promise<string> {
  return new Promise((resolve) => {
    let src = '';
    if (typeof input === 'string') {
      src = input;
    } else {
      src = URL.createObjectURL(input);
    }

    // Pass through SVG data URIs or non-data URLs
    if (src.startsWith('data:image/svg+xml') || src.startsWith('http://') || src.startsWith('https://')) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (typeof input !== 'string') URL.revokeObjectURL(src);
        resolve(src);
        return;
      }

      // Draw background and image
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP if supported, otherwise fallback to JPEG
      const preferredMime = isWebPSupported() ? 'image/webp' : 'image/jpeg';
      let resultDataUrl = canvas.toDataURL(preferredMime, quality);

      // Verify that result is valid
      if (!resultDataUrl.startsWith(`data:${preferredMime}`)) {
        resultDataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      if (typeof input !== 'string') URL.revokeObjectURL(src);
      resolve(resultDataUrl);
    };

    img.onerror = () => {
      if (typeof input !== 'string') URL.revokeObjectURL(src);
      resolve(typeof input === 'string' ? input : '');
    };

    img.src = src;
  });
}
