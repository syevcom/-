import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Check, X, FileText, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem, ActivePage } from '../types';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenQuoteWithItems: (items: CartItem[]) => void;
  onOpenPayment?: (items: CartItem[]) => void;
  onPageChange: (page: ActivePage) => void;
}

export default function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenQuoteWithItems,
  onOpenPayment,
  onPageChange,
}: CartPageProps) {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  // Track selected item IDs (all selected by default)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(safeItems.map((item) => item.id));
  }, [cartItems]);

  const isAllSelected = safeItems.length > 0 && selectedIds.length === safeItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(safeItems.map((item) => item.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = safeItems.filter((item) => selectedIds.includes(item.id));
  const targetItems = selectedItems.length > 0 ? selectedItems : safeItems;

  const totalAmount = targetItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 상품을 선택해 주세요.');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}개 상품을 장바구니에서 삭제하시겠습니까?`)) {
      selectedIds.forEach((id) => onRemoveItem(id));
      setSelectedIds([]);
    }
  };

  const handleOrderSelected = () => {
    if (targetItems.length === 0) {
      alert('주문할 상품을 선택해 주세요.');
      return;
    }
    onOpenPayment?.(targetItems);
  };

  const handleQuoteSelected = () => {
    if (targetItems.length === 0) {
      alert('견적을 신청할 상품을 선택해 주세요.');
      return;
    }
    onOpenQuoteWithItems(targetItems);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center my-8 sm:my-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            장바구니
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            선택하신 에스와이 충전기 및 솔루션을 확인하고 주문/견적을 진행하실 수 있습니다.
          </p>
        </div>

        {safeItems.length === 0 ? (
          /* EMPTY CART STATE */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-8 space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800">장바구니에 담긴 상품이 없습니다</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                에스와이의 다양한 가정용/공용 전기차 충전기와 맞춤 솔루션을 둘러보세요.
              </p>
            </div>
            <button
              onClick={() => onPageChange('sol_commercial')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>충전기 상품 둘러보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          /* CART CONTENT GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ITEM LIST & ACTIONS */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Top Selection Bar */}
              <div className="flex items-center justify-between px-2 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span>전체선택 ({selectedIds.length}/{safeItems.length})</span>
                </label>
                <button
                  onClick={onClearCart}
                  className="text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                >
                  장바구니 비우기
                </button>
              </div>

              {/* Shipping Group Box */}
              <div className="border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-xs">
                {/* Box Header Bar */}
                <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                      배송
                    </span>
                    <span>택배 무료 배송 및 전국 현장 방문 설치 지원</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-normal">에스와이 정품 보증</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-200">
                  {safeItems.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    const itemPrice = item.price || 0;
                    const itemTotalPrice = itemPrice * (item.quantity || 1);

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 relative transition-colors ${
                          isChecked ? 'bg-white' : 'bg-slate-50/40 opacity-75'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                        </div>

                        {/* Thumbnail Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">
                              ⚡
                            </div>
                          )}
                        </div>

                        {/* Middle: Product Info */}
                        <div className="flex-1 min-w-0 pr-6 sm:pr-0 space-y-2">
                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mb-1">
                              {item.power} · {item.type}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 leading-snug">
                              {item.name}
                            </h4>
                          </div>

                          {/* Selected Options */}
                          {item.selectedOptions && (
                            <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] text-slate-600 space-y-0.5">
                              {Array.isArray(item.selectedOptions)
                                ? item.selectedOptions.map((opt: any, oIdx: number) => (
                                    <div key={oIdx} className="flex items-center gap-1.5">
                                      {opt?.groupTitle && <span className="text-slate-400 font-bold">[{opt.groupTitle}]</span>}
                                      <span className="font-semibold text-slate-800">{typeof opt === 'string' ? opt : opt?.optionName || ''}</span>
                                      {opt?.optionPrice > 0 && (
                                        <span className="text-emerald-600 font-bold ml-auto">
                                          (+₩{opt.optionPrice.toLocaleString()})
                                        </span>
                                      )}
                                    </div>
                                  ))
                                : typeof item.selectedOptions === 'object'
                                ? Object.entries(item.selectedOptions).map(([groupTitle, optionName], oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1.5">
                                      <span className="text-slate-400 font-bold">[{groupTitle}]</span>
                                      <span className="font-semibold text-slate-800">{String(optionName)}</span>
                                    </div>
                                  ))
                                : null}
                            </div>
                          )}

                          {/* Quantity control & price info */}
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-black text-slate-800 min-w-[28px] text-center">
                                {item.quantity}개
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-xs text-slate-500 font-medium">
                              (개당 ₩{itemPrice.toLocaleString()}원)
                            </span>
                          </div>
                        </div>

                        {/* Right: Price Breakdown & Action buttons */}
                        <div className="sm:w-52 shrink-0 flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 text-xs space-y-2">
                          <div className="w-full text-right space-y-1">
                            <div className="flex justify-between text-slate-500 text-[11px]">
                              <span>상품금액</span>
                              <span>₩{itemTotalPrice.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[11px]">
                              <span>할인금액</span>
                              <span>-</span>
                            </div>
                            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-100">
                              <span>할인적용금액</span>
                              <span className="text-blue-600 font-black">
                                ₩{itemTotalPrice.toLocaleString()}원
                              </span>
                            </div>
                          </div>

                          <div className="w-full space-y-1.5 pt-2">
                            <button
                              type="button"
                              onClick={() => onOpenPayment?.([item])}
                              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>바로구매</span>
                            </button>
                          </div>
                        </div>

                        {/* Close / Delete Button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          title="삭제"
                          className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 cursor-pointer p-1 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Selection Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-white border border-slate-200 rounded-2xl p-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span>전체선택</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    선택상품 삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleOrderSelected}
                    className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span>⚡ 선택상품 상담/예약 신청</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-4 sticky top-28 space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                <span>예상 견적 합계</span>
                <span className="text-xs font-normal text-slate-500">
                  (선택 {selectedIds.length}개)
                </span>
              </h3>

              <div className="border border-slate-300 bg-white p-5 rounded-2xl space-y-4 shadow-sm">
                <div className="space-y-2.5 text-xs font-bold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>총 상품금액</span>
                    <span className="text-slate-900 font-extrabold">
                      ₩{totalAmount.toLocaleString()}원
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>방문 실측 / 출장 진단</span>
                    <span className="text-emerald-600 font-extrabold">₩0원 (100% 무료)</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>상담 신청 결제비용</span>
                    <span className="text-emerald-600 font-extrabold">₩0원 (즉시결제 없음)</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">예상 상품 견적</span>
                      <span className="text-[10px] text-slate-400 font-medium">상담 후 최종 견적 확정</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600 tracking-tight">
                      ₩{totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>설치 현장 무상 진단 및 보조금 100% 매칭 지원</span>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleQuoteSelected}
                  className="py-3.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-black text-xs sm:text-sm rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>전체 견적서</span>
                </button>

                <button
                  type="button"
                  onClick={handleOrderSelected}
                  className="py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  <span>⚡ 무료 시공 상담/예약</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
