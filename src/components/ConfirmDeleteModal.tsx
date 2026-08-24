import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  targetName?: string;
  description?: string;
  warningNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = '데이터 삭제 확인',
  targetName,
  description = '정말 이 항목을 삭제하시겠습니까?',
  warningNote = '삭제된 데이터는 즉시 제거되며, 복구하려면 다시 등록해야 합니다.',
  confirmLabel = '네, 삭제합니다',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  onClose,
}) => {
  const handleClose = onCancel || onClose || (() => {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="confirm-delete-modal-backdrop" 
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          id="confirm-delete-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-rose-700 font-medium">관리자 전용 데이터 삭제 보호</p>
              </div>
            </div>
            <button
              id="confirm-delete-close-btn"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {targetName && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 shrink-0">삭제 대상:</span>
                <span className="text-xs font-bold text-slate-800 break-all">{targetName}</span>
              </div>
            )}

            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {description}
            </p>

            {warningNote && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  {warningNote}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              id="confirm-delete-cancel-btn"
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-delete-action-btn"
              type="button"
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
