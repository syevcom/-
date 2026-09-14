/**
 * Direct file download and preview helper utilities
 * Solves heavy PDF rendering issues by allowing direct file download & fast native preview.
 */

export function downloadFile(url: string, filename?: string): void {
  if (!url) return;

  const defaultName = filename && filename.trim().length > 0 
    ? filename.trim() 
    : '공식_카탈로그.pdf';
  const cleanName = defaultName.includes('.') ? defaultName : `${defaultName}.pdf`;

  // Base64 Data URL or Blob URL
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch (e) {
      console.error('Data URL download error:', e);
    }
  }

  // Remote URL: Fetch as Blob to force direct download across all modern browsers
  fetch(url, { mode: 'cors' })
    .then((response) => {
      if (!response.ok) throw new Error('Download network error');
      return response.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
    })
    .catch(() => {
      // Fallback: Direct link download
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
}

export function openFileInNewTab(url: string): void {
  if (!url) return;

  if (url.startsWith('data:application/pdf') || url.startsWith('data:image/')) {
    try {
      const parts = url.split(',');
      const byteString = atob(parts[1] || parts[0]);
      const mimeString = parts[0].split(':')[1]?.split(';')[0] || 'application/pdf';
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        window.location.href = blobUrl;
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function isPdfUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.startsWith('data:application/pdf') || 
         lower.includes('.pdf') || 
         lower.includes('application/pdf');
}
