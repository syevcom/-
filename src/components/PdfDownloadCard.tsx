import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Eye, EyeOff, Trash2, Upload, Sparkles } from 'lucide-react';
import { downloadFile, openFileInNewTab, isPdfUrl } from '../lib/fileDownload';

interface PdfDownloadCardProps {
  fileUrl: string;
  fileName?: string;
  brandName?: string;
  description?: string;
  isAdmin?: boolean;
  onDelete?: () => void;
  onReplaceFile?: (file: File) => void;
  children?: React.ReactNode; // Optional in-page preview content
  defaultOpenPreview?: boolean;
}

export const PdfDownloadCard: React.FC<PdfDownloadCardProps> = ({
  fileUrl,
  fileName,
  brandName,
  description,
  isAdmin = false,
  onDelete,
  onReplaceFile,
  children,
  defaultOpenPreview = false,
}) => {
  const [showPreview, setShowPreview] = useState(defaultOpenPreview);
  const [isDownloading, setIsDownloading] = useState(false);

  const isPdf = isPdfUrl(fileUrl);
  const displayTitle = fileName || (brandName ? `${brandName} 공식 카탈로그 및 제안서` : '공식 상세 사양서 및 카탈로그');

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadFile(fileUrl, displayTitle);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handleView = () => {
    openFileInNewTab(fileUrl);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 overflow-hidden relative group">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

      {/* Main Content Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                {isPdf ? '공식 PDF 카탈로그' : '공식 브로셔 사양서'}
              </span>
              {brandName && (
                <span className="text-xs font-bold text-slate-300">
                  [{brandName}]
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug break-all">
              {displayTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {description || '용량이 큰 고화질 카탈로그 문서입니다. 기기에 직접 다운로드하거나 새 창에서 원본 화질로 바로 열람하실 수 있습니다.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Direct Download & View in New Tab */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 md:flex-none px-4 sm:px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
            title="기기에 PDF 파일 직접 다운로드"
          >
            <Download className={`w-4 h-4 text-slate-950 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? '다운로드 중...' : 'PDF 파일 다운로드'}</span>
          </button>

          <button
            type="button"
            onClick={handleView}
            className="flex-1 md:flex-none px-4 sm:px-5 py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="새 탭에서 원본 바로보기"
          >
            <ExternalLink className="w-4 h-4 text-slate-300" />
            <span>새 창에서 바로보기</span>
          </button>

          {children && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl sm:rounded-2xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={showPreview ? '화면 미리보기 닫기' : '화면에서 미리보기'}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">미리보기 닫기</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">화면에서 보기</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Admin Controls bar if in edit mode */}
      {isAdmin && (
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              관리자 모드
            </span>
            <span className="text-slate-400 text-[11px]">
              고객이 용량 제한 없이 다운로드할 수 있도록 PDF 파일이 완벽히 연결되었습니다.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onReplaceFile && (
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>새 파일로 교체</span>
                <input
                  type="file"
                  accept="application/pdf, image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onReplaceFile(f);
                  }}
                />
              </label>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>파일 삭제</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional Expandable In-Page Preview */}
      {children && showPreview && (
        <div className="pt-4 border-t border-slate-800 mt-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};
