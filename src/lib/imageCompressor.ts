/**
 * Utility to compress image files or base64 data URLs before storing to localStorage / Firestore.
 * Automatically converts to high-efficiency WebP format (with JPEG fallback) to minimize bandwidth.
 */
import { convertToWebP } from './imageOptimizer';

export async function compressImage(
  input: File | Blob | string,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  return convertToWebP(input, quality, maxWidth, maxHeight);
}

