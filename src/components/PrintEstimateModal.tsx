import React, { useState, useEffect } from 'react';
import { X, Printer, Check } from 'lucide-react';
import { CartItem } from '../types';

interface PrintEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  initialRecipient?: string;
}

export default function PrintEstimateModal({
  isOpen,
  onClose,
  items,
  initialRecipient = '',
}: PrintEstimateModalProps) {
  const [recipientInput, setRecipientInput] = useState(initialRecipient);
  const [appliedRecipient, setAppliedRecipient] = useState(initialRecipient);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate realistic quote number (YYYYMMDDHHmmss + 4 random digits)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const rand = String(Math.floor(Math.random() * 9000) + 1000);
      
      setQuoteNumber(`${year}${month}${day}${hours}${mins}${secs}${rand}`);
      setQuoteDate(`${year}년 ${month}월 ${day}일`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyRecipient = () => {
    setAppliedRecipient(recipientInput.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const safeItems = Array.isArray(items) ? items : [];
  const totalQuantity = safeItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);
  const totalAmount = safeItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 1), 0);
  const shippingFee = 0;
  const discountFee = 0;
  const finalPayment = totalAmount + shippingFee - discountFee;

  // 공급가액 & 부가세 (10% VAT included)
  const supplyPrice = Math.round(finalPayment / 1.1);
  const vatPrice = finalPayment - supplyPrice;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible">
      
      {/* SCREEN ONLY: Top Control Toolbar */}
      <div className="sticky top-0 z-10 bg-slate-800 text-white border-b border-slate-700 px-4 py-3 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-slate-300 shrink-0">받는분</span>
          <input
            type="text"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            placeholder="받는분 성함/법인명 입력"
            className="px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-white text-xs focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyRecipient()}
          />
          <button
            type="button"
            onClick={handleApplyRecipient}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
          >
            적용
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-black shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            * 받는분을 입력 후 [적용]을 클릭하면 아래의 입력란에 반영됩니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PRINTABLE DOCUMENT AREA */}
      <div className="flex-1 p-4 sm:p-8 flex justify-center items-start print:p-0 print:block">
        <div className="bg-white text-slate-900 w-full max-w-[820px] p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:m-0 font-sans text-xs sm:text-sm">
          
          {/* Document Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-[0.5em] text-black border-b-2 border-black pb-2 inline-block px-8">
              견 적 서
            </h1>
          </div>

          {/* Top Info Grid: Recipient/QuoteNo (Left) vs Company Info (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 items-start">
            
            {/* LEFT: Recipient & Quote Meta */}
            <div className="md:col-span-5 space-y-4">
              <div className="border-b-2 border-slate-900 pb-2 flex items-baseline gap-2">
                <span className="text-base font-bold underline decoration-slate-400 underline-offset-4 min-w-[120px] inline-block">
                  {appliedRecipient ? appliedRecipient : '____________________'}
                </span>
                <span className="text-sm font-bold text-slate-800">귀하</span>
              </div>

              <table className="w-full border-collapse border border-slate-400 text-xs">
                <tbody>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-2 text-left font-bold w-24 text-slate-800">
                      견적번호
                    </th>
                    <td className="border border-slate-400 px-3 py-2 text-slate-900 font-mono text-[11px] font-semibold">
                      {quoteNumber}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-2 text-left font-bold w-24 text-slate-800">
                      견적일자
                    </th>
                    <td className="border border-slate-400 px-3 py-2 text-slate-900 font-semibold">
                      {quoteDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RIGHT: Business / Provider Info */}
            <div className="md:col-span-7">
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr>
                    <th colSpan={2} className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-center font-extrabold text-slate-900">
                      사업자 정보
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold w-24 text-slate-800">
                      사업자 번호
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right font-mono font-semibold text-slate-900">
                      688-86-01875
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold text-slate-800">
                      상호
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right font-extrabold text-slate-900 relative">
                      <div className="flex items-center justify-end gap-2">
                        <span>(유)에스와이닷컴</span>
                        {/* Red Seal Stamp SVG */}
                        <div className="w-7 h-7 border-2 border-red-600 rounded-full flex items-center justify-center text-red-600 text-[9px] font-black leading-none p-0.5 shrink-0 transform rotate-[-6deg] select-none">
                          <span className="tracking-tighter">SY<br/>(인)</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold text-slate-800">
                      대표자명
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right font-bold text-slate-900">
                      박우혁
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold text-slate-800">
                      주소
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right text-[11px] font-medium text-slate-800">
                      전남광주 동구 금남로 161-11
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold text-slate-800">
                      전화번호
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right font-mono font-semibold text-slate-900">
                      1588-SY01
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 border border-slate-400 px-3 py-1.5 text-left font-bold text-slate-800">
                      홈페이지주소
                    </th>
                    <td className="border border-slate-400 px-3 py-1.5 text-right text-slate-800 font-mono text-[11px]">
                      sy.com
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Statement Phrase */}
          <p className="text-xs text-slate-700 font-semibold mb-3">
            아래와 같이 견적합니다.
          </p>

          {/* Items Table */}
          <table className="w-full border-collapse border border-slate-400 text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                <th className="border border-slate-400 px-3 py-2 text-left">품명</th>
                <th className="border border-slate-400 px-2 py-2 text-center w-16">수량</th>
                <th className="border border-slate-400 px-3 py-2 text-right w-32">상품금액합계</th>
                <th className="border border-slate-400 px-2 py-2 text-right w-20">배송비</th>
                <th className="border border-slate-400 px-2 py-2 text-right w-20">할인</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-slate-400 px-4 py-8 text-center text-slate-500 font-medium">
                    장바구니에 담긴 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                safeItems.map((item, idx) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  let optsText = '';
                  if (item.selectedOptions) {
                    if (Array.isArray(item.selectedOptions)) {
                      optsText = ` (${item.selectedOptions.map((o: any) => typeof o === 'string' ? o : o?.optionName || '').filter(Boolean).join(', ')})`;
                    } else if (typeof item.selectedOptions === 'object') {
                      optsText = ` (${Object.values(item.selectedOptions).filter(Boolean).join(', ')})`;
                    }
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="border border-slate-400 px-3 py-2 font-medium text-slate-900">
                        {item.name} {optsText !== ' ()' ? optsText : ''}
                      </td>
                      <td className="border border-slate-400 px-2 py-2 text-center font-bold text-slate-800">
                        {item.quantity || 1}
                      </td>
                      <td className="border border-slate-400 px-3 py-2 text-right font-semibold text-slate-900">
                        ₩{itemTotal.toLocaleString()}
                      </td>
                      <td className="border border-slate-400 px-2 py-2 text-right text-slate-600">
                        ₩0
                      </td>
                      <td className="border border-slate-400 px-2 py-2 text-right text-slate-600">
                        ₩0
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Total Row */}
              <tr className="bg-slate-50 font-bold">
                <td className="border border-slate-400 px-3 py-2 text-center text-slate-900">
                  합계
                </td>
                <td className="border border-slate-400 px-2 py-2 text-center text-slate-900">
                  {totalQuantity}
                </td>
                <td className="border border-slate-400 px-3 py-2 text-right text-slate-900">
                  ₩{totalAmount.toLocaleString()}
                </td>
                <td className="border border-slate-400 px-2 py-2 text-right text-slate-900">
                  ₩0
                </td>
                <td className="border border-slate-400 px-2 py-2 text-right text-slate-900">
                  ₩0
                </td>
              </tr>

              {/* Final Payment Row */}
              <tr className="bg-slate-100 font-black">
                <td className="border border-slate-400 px-3 py-2 text-left text-slate-900" colSpan={4}>
                  결제금액
                </td>
                <td className="border border-slate-400 px-3 py-2 text-right text-slate-900 text-sm">
                  ₩{finalPayment.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Summary Box */}
          <div className="border-2 border-slate-900 p-4 rounded-xs flex flex-col items-end space-y-1 text-xs font-bold text-slate-900">
            <div className="flex justify-between w-60">
              <span className="text-slate-700">공급가액 :</span>
              <span className="font-mono">₩{supplyPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-60">
              <span className="text-slate-700">부가세액 :</span>
              <span className="font-mono">₩{vatPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-60 pt-1 border-t border-slate-400 text-sm font-extrabold">
              <span>합 계 :</span>
              <span className="font-mono text-slate-950">₩{finalPayment.toLocaleString()}</span>
            </div>
          </div>

          {/* Document Footer Notes */}
          <div className="mt-8 text-[11px] text-slate-500 space-y-1">
            <p>※ 본 견적서는 에스와이 ((유)에스와이닷컴)에서 발급한 공식 수탁 견적서입니다.</p>
            <p>※ 견적 금액에는 기본 설치비 및 유효기간 내 배송 비용이 포함되어 있습니다.</p>
          </div>

        </div>
      </div>

      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide non-print UI elements */
          nav, header, footer, button, .print\\:hidden {
            display: none !important;
          }
          /* Full page print dimensions */
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

    </div>
  );
}
