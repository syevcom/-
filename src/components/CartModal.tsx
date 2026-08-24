import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenQuoteWithItems: (items: CartItem[]) => void;
  onOpenPayment?: (items: CartItem[]) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenQuoteWithItems,
  onOpenPayment,
}: CartModalProps) {
  if (!isOpen) return null;

  const safeItems = Array.isArray(cartItems) ? cartItems : [];
  const totalQuantity = safeItems.reduce((acc, item) => acc + (item?.quantity || 1), 0);
  const totalAmount = safeItems.reduce((acc, item) => acc + (item?.price || 0) * (item?.quantity || 1), 0);

  const handleRequestQuote = () => {
    onClose();
    onOpenQuoteWithItems(safeItems);
  };

  const handleProceedPayment = () => {
    onClose();
    onOpenPayment?.(safeItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base tracking-tight">관심 충전기 장바구니</h3>
                <span className="bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  {totalQuantity}개
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">선택하신 충전기 모델로 무료 견적 신청을 진행할 수 있습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {safeItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-600">장바구니에 담긴 충전기가 없습니다.</p>
              <p className="text-xs text-slate-400">제품 안내 페이지에서 원하는 충전기를 장바구니에 담아보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span>담은 충전기 목록</span>
                <button
                  onClick={onClearCart}
                  className="text-slate-400 hover:text-rose-500 text-[11px] underline cursor-pointer"
                >
                  전체 삭제
                </button>
              </div>

              {safeItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 flex items-center gap-3.5 hover:border-slate-300 transition-all"
                >
                  <img
                    src={getOptimizedImageUrl(item.image, { width: 140, format: 'webp' })}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                      {item.type} · {item.power}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                    {item.price !== undefined && (
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        {(item.price || 0).toLocaleString()} 원
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-slate-800 w-5 text-center">{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-300 hover:text-rose-500 cursor-pointer p-1 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {safeItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-600 block">예상 상품 견적 합계</span>
                <span className="text-[10px] text-emerald-600 font-bold">상담 신청비 0원 (무료 실측)</span>
              </div>
              <span className="text-base font-black text-blue-600">
                ₩{totalAmount.toLocaleString()}원
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRequestQuote}
                className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-2xl cursor-pointer transition-colors"
              >
                📋 무상 견적서 확인
              </button>
              <button
                onClick={handleProceedPayment}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡ 무료 시공 상담/예약 (0원)</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
