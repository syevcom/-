import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText, LayoutGrid, List, Sparkles, RefreshCw, Lock, Unlock, Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';
import { resolvePostImgUrl } from '../lib/detailPagesData';
import DetailPageImage from './DetailPageImage';

const IMAGE_FALLBACK_MAP: Record<string, string> = {
  // Local to Remote
  '/images/home-detail-speel-5kw.png': 'https://i.postimg.cc/prKqZxGq/seupil5sangsepeiji.png',
  '/images/home-detail-speel-7kw.png': 'https://i.postimg.cc/50hsLj3Z/seupil7sangsepeiji.png',
  '/images/home-detail-speel-11kw.png': 'https://i.postimg.cc/FRMT31Zw/seupil11sangsepeiji.png',
  '/images/home-detail-coolcharge.png': 'https://i.postimg.cc/C5bmNYPW/kulchaji.png',
  '/images/home-detail-electree.png': 'https://i.postimg.cc/13nqFM8p/illegteuli.png',
  '/images/home-detail-chajigo1.png': 'https://i.postimg.cc/d1b5rDBp/chajigo1.png',
  '/images/home-detail-chajigo2.png': 'https://i.postimg.cc/br13T8CM/chajigo2.png',
  '/images/home-detail-chajigo3.png': 'https://i.postimg.cc/90yJpV8K/chajigo3.png',
  '/images/biz-charger-7-11kw.png': 'https://i.postimg.cc/02xfsTH0/plc-klchaji-7kw.png',
  '/images/biz-charger-35kw.png': 'https://i.postimg.cc/BQsg0rwn/35kw-kulchaji.png',
  '/images/biz-charger-50kw.png': 'https://i.postimg.cc/X738bRDp/50kw-kulchaji.png',
  // Remote to Local
  'https://i.postimg.cc/prKqZxGq/seupil5sangsepeiji.png': '/images/home-detail-speel-5kw.png',
  'https://i.postimg.cc/50hsLj3Z/seupil7sangsepeiji.png': '/images/home-detail-speel-7kw.png',
  'https://i.postimg.cc/FRMT31Zw/seupil11sangsepeiji.png': '/images/home-detail-speel-11kw.png',
  'https://i.postimg.cc/C5bmNYPW/kulchaji.png': '/images/home-detail-coolcharge.png',
  'https://i.postimg.cc/13nqFM8p/illegteuli.png': '/images/home-detail-electree.png',
  'https://i.postimg.cc/d1b5rDBp/chajigo1.png': '/images/home-detail-chajigo1.png',
  'https://i.postimg.cc/br13T8CM/chajigo2.png': '/images/home-detail-chajigo2.png',
  'https://i.postimg.cc/90yJpV8K/chajigo3.png': '/images/home-detail-chajigo3.png',
  'https://i.postimg.cc/02xfsTH0/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/kg906Y1Y/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/nZ9WvZ4g/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/BQsg0rwn/35kw-kulchaji.png': '/images/biz-charger-35kw.png',
  'https://i.postimg.cc/X738bRDp/50kw-kulchaji.png': '/images/biz-charger-50kw.png',
};

function getFallbackForUrl(url: string): string | undefined {
  if (!url) return undefined;
  if (IMAGE_FALLBACK_MAP[url]) return IMAGE_FALLBACK_MAP[url];
  // Check substring
  for (const [k, v] of Object.entries(IMAGE_FALLBACK_MAP)) {
    if (url.includes(k) || k.includes(url)) return v;
  }
  return undefined;
}

interface PdfImageRendererProps {
  fileUrl: string;
  fileName?: string;
  brandName?: string;
  isAdmin?: boolean;
  onError?: (e?: any) => void;
}

export default function PdfImageRenderer({ fileUrl, fileName = 'document.pdf', brandName = '브랜드', isAdmin = false, onError }: PdfImageRendererProps) {
  const resolvedUrl = resolvePostImgUrl(fileUrl);
  const isDataPdf = resolvedUrl.startsWith('data:application/pdf');
  const isDataImage = resolvedUrl.startsWith('data:image/');
  const isPdfExt = fileName.toLowerCase().endsWith('.pdf') || resolvedUrl.toLowerCase().split('?')[0].endsWith('.pdf');
  const isImageExt = /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName) || /\.(png|jpe?g|webp|gif|svg)$/i.test(resolvedUrl.split('?')[0]) || resolvedUrl.includes('i.postimg.cc');

  // If it's explicitly an image data URI or image extension, render with native ImageCatalogViewer
  const isPdf = isDataPdf || (isPdfExt && !isDataImage && !isImageExt);
  
  if (!isPdf) {
    // If it's a standard image file, render it natively with premium frame and zoom
    return <ImageCatalogViewer imageUrl={resolvedUrl} fileName={fileName} brandName={brandName} isAdmin={isAdmin} onError={onError} />;
  }

  return <PdfCatalogViewer pdfUrl={resolvedUrl} fileName={fileName} brandName={brandName} isAdmin={isAdmin} />;
}

const PRESET_ZOOM_LEVELS = [50, 75, 100, 125, 150, 180, 200, 250, 300];

// 1. Native Image Viewer (for JPG, PNG uploads)
function ImageCatalogViewer({ imageUrl, fileName, brandName, isAdmin, onError }: { imageUrl: string; fileName: string; brandName: string; isAdmin: boolean; onError?: (e?: any) => void }) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem('sy_catalog_zoom_percent');
    return saved ? Math.min(Math.max(Number(saved), 30), 400) : 100;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('sy_catalog_zoom_locked') === 'true';
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const applyZoom = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 30), 400);
    setZoom(clamped);
    if (isLocked) {
      localStorage.setItem('sy_catalog_zoom_percent', String(clamped));
    }
  };

  const handleZoomIn = () => applyZoom(zoom + 25);
  const handleZoomOut = () => applyZoom(zoom - 25);

  const handleToggleLock = () => {
    const nextLock = !isLocked;
    setIsLocked(nextLock);
    localStorage.setItem('sy_catalog_zoom_locked', String(nextLock));
    if (nextLock) {
      localStorage.setItem('sy_catalog_zoom_percent', String(zoom));
      showToast(`🔒 카탈로그 배율이 ${zoom}%로 고정되었습니다. 다른 상품을 볼 때도 유지됩니다.`);
    } else {
      showToast('🔓 배율 고정이 해제되었습니다.');
    }
  };

  const displayName = isAdmin ? fileName : '공식 사양서 및 카탈로그';

  // 1-A. Non-Admin View: Pure clean image output with tap-to-expand lightbox for mobile/desktop
  if (!isAdmin) {
    return (
      <>
        <div className="w-full flex justify-center py-0 sm:py-1">
          <div 
            className="w-full max-w-[960px] mx-auto rounded-none sm:rounded-2xl bg-white relative group cursor-zoom-in"
            style={!isMobile && isLocked ? { width: `${zoom}%`, maxWidth: '960px' } : { width: '100%', maxWidth: '960px' }}
            onClick={() => setIsFullscreen(true)}
          >
            <DetailPageImage
              src={imageUrl}
              unoptimized={true}
              fallbackSrc={getFallbackForUrl(imageUrl)}
              alt={`${brandName} 카탈로그`}
              className="w-full h-auto mx-auto block select-none high-res-detail-img"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="sync"
              style={{ width: '100%', height: 'auto', imageRendering: '-webkit-optimize-contrast' }}
              onError={onError}
            />
            
            {/* Subtle mobile tap-to-expand indicator */}
            <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3 text-emerald-400" />
              <span>터치하여 크게 보기</span>
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox Modal for Non-Admin */}
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col backdrop-blur-sm animate-fade-in"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800/60 flex justify-between items-center px-4 sm:px-6 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                  {brandName} 공식 상세페이지 카탈로그
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black cursor-pointer border border-slate-700 flex items-center gap-1"
              >
                <span>✕ 닫기</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 cursor-zoom-out flex justify-center items-start">
              <div className="w-full max-w-5xl mx-auto h-auto">
                <DetailPageImage
                  src={imageUrl}
                  unoptimized={true}
                  fallbackSrc={getFallbackForUrl(imageUrl)}
                  alt={`${brandName} Full Catalog`}
                  className="w-full h-auto mx-auto block rounded-lg shadow-2xl high-res-detail-img"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="sync"
                  style={{ width: '100%', height: 'auto', imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative border border-slate-800 bg-slate-950/60 rounded-xl sm:rounded-2xl overflow-visible shadow-2xl flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-xl border border-emerald-300 flex items-center gap-1.5 animate-fadeIn">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="px-3 sm:px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase">
            IMAGE
          </span>
          <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]" title={displayName}>
            {displayName}
          </span>
        </div>

        {/* Zoom Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Direct Percent Select Dropdown */}
            <select
              value={zoom}
              onChange={(e) => applyZoom(Number(e.target.value))}
              className="bg-slate-900 text-emerald-400 text-xs font-mono font-black border border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {PRESET_ZOOM_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}%
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lock / Fix Percentage Button */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
              isLocked
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isLocked ? '배율 고정됨 (클릭 시 해제)' : '현재 퍼센트 배율 고정하기'}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>배율 고정 ({zoom}%)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-slate-400" />
                <span>배율 고정하기</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-slate-800"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>전체화면</span>
          </button>
        </div>
      </div>

      {/* Main Image Stage - Unlimited height for natural vertical scrolling */}
      <div className="bg-slate-900/40 p-2 sm:p-4 overflow-visible flex items-start justify-center h-auto relative">
        <div 
          className="w-full max-w-[960px] mx-auto transition-all duration-200 ease-out shadow-2xl rounded-lg bg-white"
          style={!isMobile && isLocked ? { width: `${zoom}%`, maxWidth: '960px' } : { width: '100%', maxWidth: '960px' }}
        >
          <DetailPageImage
            src={imageUrl}
            unoptimized={true}
            fallbackSrc={getFallbackForUrl(imageUrl)}
            alt={`${brandName} 카탈로그 이미지`}
            className="w-full h-auto mx-auto block pointer-events-none high-res-detail-img"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="sync"
            style={{ width: '100%', height: 'auto', imageRendering: '-webkit-optimize-contrast' }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500">
        <span>이미지 카탈로그 뷰어</span>
        <span className="text-emerald-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" />
          {isLocked ? `배율 ${zoom}% 고정 모드` : '100% 모바일/웹 최적화 렌더링 완료'}
        </span>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
          <div className="p-4 bg-slate-950/90 border-b border-slate-800/60 flex justify-between items-center px-6 shrink-0">
            <span className="text-xs font-black text-white">{brandName} 카탈로그 전체화면</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black cursor-pointer"
            >
              닫기 (ESC)
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center items-start p-4 sm:p-6">
            <div className="w-full max-w-5xl mx-auto h-auto">
              <DetailPageImage
                src={imageUrl}
                unoptimized={true}
                fallbackSrc={getFallbackForUrl(imageUrl)}
                alt="Full Catalog"
                className="w-full h-auto mx-auto block rounded-xl shadow-2xl high-res-detail-img"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="sync"
                style={{ width: '100%', height: 'auto', imageRendering: '-webkit-optimize-contrast' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. High-Tech PDF Canvas Renderer using Mozilla PDF.js (CDN-loaded) - Continuous Scroll Only
function PdfCatalogViewer({ pdfUrl, fileName, brandName, isAdmin }: { pdfUrl: string; fileName: string; brandName: string; isAdmin: boolean }) {
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackToImage, setFallbackToImage] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem('sy_catalog_zoom_percent');
    return saved ? Math.min(Math.max(Number(saved), 40), 400) : 150;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('sy_catalog_zoom_locked') === 'true';
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (fallbackToImage) {
    return <ImageCatalogViewer imageUrl={pdfUrl} fileName={fileName} brandName={brandName} isAdmin={isAdmin} />;
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const applyZoom = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 40), 400);
    setZoom(clamped);
    if (isLocked) {
      localStorage.setItem('sy_catalog_zoom_percent', String(clamped));
    }
  };

  const handleZoomIn = () => applyZoom(zoom + 20);
  const handleZoomOut = () => applyZoom(zoom - 20);

  const handleToggleLock = () => {
    const nextLock = !isLocked;
    setIsLocked(nextLock);
    localStorage.setItem('sy_catalog_zoom_locked', String(nextLock));
    if (nextLock) {
      localStorage.setItem('sy_catalog_zoom_percent', String(zoom));
      showToast(`🔒 PDF 사양서 배율이 ${zoom}%로 고정되었습니다.`);
    } else {
      showToast('🔓 배율 고정이 해제되었습니다.');
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Script Loader for PDF.js
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setPdfLibLoaded(true);
      return;
    }

    const scriptId = 'pdfjs-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const handleScriptLoad = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        setPdfLibLoaded(true);
      }
    };

    script.addEventListener('load', handleScriptLoad);
    return () => {
      script.removeEventListener('load', handleScriptLoad);
    };
  }, []);

  // Load PDF Document
  useEffect(() => {
    if (!pdfLibLoaded || !pdfUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadDocument = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error('PDF.js 라이브러리 로드 실패');

        let dataInput: any = pdfUrl;
        if (pdfUrl.startsWith('data:')) {
          const base64Parts = pdfUrl.split(',');
          const base64Data = base64Parts[1] || base64Parts[0];
          const binaryString = window.atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          dataInput = { data: bytes };
        }

        const loadingTask = pdfjsLib.getDocument(dataInput);
        const doc = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('PDF.js load error:', err);
        if (isMounted) {
          setError('PDF 파일을 해독하는 데 실패했습니다. 파일이 손상되었거나 브라우저 보안 제약이 있을 수 있습니다.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [pdfLibLoaded, pdfUrl]);

  const displayName = isAdmin ? fileName : '공식 사양서 및 카탈로그';

  // 2-A. Non-Admin View: Clean continuous scroll pages without top/bottom control bars
  if (!isAdmin) {
    return (
      <div className="w-full py-1 flex flex-col items-center relative scroll-smooth">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-2 py-10">
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500">카탈로그 문서 로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <p className="text-xs text-rose-600 font-bold">{error}</p>
            <button
              type="button"
              onClick={() => setFallbackToImage(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm"
            >
              이미지로 보기
            </button>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className="space-y-4 w-full flex flex-col items-center">
            {Array.from({ length: numPages }).map((_, i) => (
              <ScrollPageItem
                key={i}
                pdfDoc={pdfDoc}
                pageNum={i + 1}
                zoom={zoom}
                brandName={brandName}
                isAdmin={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative border border-slate-800 bg-slate-950/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-xl border border-amber-300 flex items-center gap-1.5 animate-fadeIn">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Controller Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-black uppercase">
            PDF
          </span>
          <span className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]" title={displayName}>
            {displayName}
          </span>
        </div>

        {/* Info Label */}
        <div className="text-[10px] text-slate-400 font-bold bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
          <span>전체 스크롤 ({numPages} Pages)</span>
        </div>

        {/* Zoom & Lock Controls */}
        {!loading && !error && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-xl">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <select
                value={zoom}
                onChange={(e) => applyZoom(Number(e.target.value))}
                className="bg-slate-900 text-amber-400 text-xs font-mono font-black border border-slate-700 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                {PRESET_ZOOM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}%
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleLock}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isLocked
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isLocked ? '배율 고정됨 (클릭 시 해제)' : '현재 퍼센트 배율 고정하기'}
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>배율 고정 ({zoom}%)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span>배율 고정하기</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-slate-800"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>전체화면</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Render Area */}
      <div 
        ref={containerRef}
        className="bg-slate-900/40 p-4 overflow-visible flex flex-col items-center min-h-[420px] h-auto relative scroll-smooth"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/80 z-20">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin" />
            <p className="text-xs font-bold text-slate-300">PDF 디지털 엔진 가동 및 기기 사양서 로딩 중...</p>
            <p className="text-[10px] text-slate-500">브라우저 내 자체 고해상도 이미지 렌더링 진행 중</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950/90 z-20">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <FileText className="w-6 h-6 text-rose-500" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h5 className="text-sm font-black text-white">PDF 직접 렌더링 불가 안내</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setFallbackToImage(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-1"
              >
                🖼️ 이미지 뷰어로 보기
              </button>
              <a
                href={pdfUrl}
                download={fileName}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-1"
              >
                📥 파일 즉시 다운로드
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black transition-all flex items-center gap-1"
              >
                🖥️ 새 창에서 보기
              </a>
            </div>
          </div>
        )}

        {/* All Pages Continuous Scroll View */}
        {!loading && !error && pdfDoc && (
          <div className="space-y-8 w-full max-w-6xl py-4 flex flex-col items-center">
            {Array.from({ length: numPages }).map((_, i) => (
              <ScrollPageItem
                key={i}
                pdfDoc={pdfDoc}
                pageNum={i + 1}
                zoom={zoom}
                brandName={brandName}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Log */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span>{brandName} 공식 브로셔</span>
          <span>•</span>
          <span className="font-mono text-slate-400">
            {isAdmin ? `${fileName} (${numPages} Pages)` : `${numPages} Pages`}
          </span>
        </div>
        <span className="text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" />
          {isLocked ? `배율 ${zoom}% 고정 모드` : '고선명 스마트 이미지 컨버팅 완료 (PDF.js Engine)'}
        </span>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
          <div className="p-4 bg-slate-950/90 border-b border-slate-800/60 flex justify-between items-center px-6">
            <span className="text-xs font-black text-white">{brandName} 카탈로그 전체화면 (전체 스크롤)</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black cursor-pointer"
            >
              닫기
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-neutral-900/40 p-6 flex flex-col items-center justify-start scrollbar-thin">
            <div className="space-y-8 w-full max-w-4xl py-6 flex flex-col items-center">
              {Array.from({ length: numPages }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-slate-400 font-mono text-xs font-bold mb-2">PAGE {i + 1}</span>
                  <FullscreenPageItem pdfDoc={pdfDoc} pageNum={i + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent to render individual page inside scroll view mode safely
function ScrollPageItem({ pdfDoc, pageNum, zoom, brandName, isAdmin }: { pdfDoc: any; pageNum: number; zoom: number; brandName: string; isAdmin?: boolean; key?: React.Key }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [rendered, setRendered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel previous render task if active and wait for it to settle
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
          await renderTaskRef.current.promise.catch(() => {});
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      if (!isMounted || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted || !canvasRef.current) return;

        // Render at high resolution (2.0x scale) so text stays crystal clear
        const baseViewport = page.getViewport({ scale: 1.0 });
        const pageRatio = baseViewport.width / baseViewport.height;
        setAspectRatio(pageRatio);

        const effectiveZoom = isMobile ? 100 : zoom;
        const renderScale = 2.0 * (effectiveZoom / 100);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // CSS responsive styling - MUST be width 100% and height auto to preserve aspect ratio without distortion!
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (isMounted) {
          setRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !err?.message?.includes('cancelling')) {
          console.error(`Page ${pageNum} render error:`, err);
        }
      } finally {
        renderTaskRef.current = null;
      }
    };

    render();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNum, zoom, isMobile]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center w-full">
        <div 
          className="w-full rounded-none sm:rounded-xl bg-white overflow-hidden select-none relative shadow-sm"
          style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
        >
          <canvas ref={canvasRef} className="block w-full h-auto object-contain" />
          {!rendered && (
            <div className="absolute inset-0 bg-slate-100/60 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 w-full">
      <div 
        className="w-full shadow-2xl rounded-xl bg-white overflow-hidden border border-slate-800/80 select-none relative"
        style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
      >
        <canvas ref={canvasRef} className="block w-full h-auto object-contain" />
        {!rendered && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
          {isAdmin ? `${brandName} Catalog - Page ${pageNum}` : `페이지 ${pageNum}`}
        </span>
      </div>
    </div>
  );
}

// Fullscreen high-res render page
function FullscreenPageItem({ pdfDoc, pageNum }: { pdfDoc: any; pageNum: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
          await renderTaskRef.current.promise.catch(() => {});
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      if (!isMounted || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted || !canvasRef.current) return;

        const scale = 2.5; // static high resolution for full screen
        const viewport = page.getViewport({ scale: scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !err?.message?.includes('cancelling')) {
          console.error(`Page ${pageNum} fullscreen render error:`, err);
        }
      } finally {
        renderTaskRef.current = null;
      }
    };

    render();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNum]);

  return (
    <div className="shadow-2xl rounded-xl bg-white overflow-hidden select-none w-full max-w-4xl border border-slate-800">
      <canvas ref={canvasRef} className="block w-full h-auto object-contain" />
    </div>
  );
}
