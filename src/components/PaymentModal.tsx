import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
  Search,
  Headphones,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem, User } from '../types';
import AddressSearchModal from './AddressSearchModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onPaymentSuccess: (orderData: {
    orderId: string;
    totalAmount: number;
    items: CartItem[];
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    address: string;
    memo: string;
    paymentMethod: string;
    consultationType?: string;
    preferredTime?: string;
    taxInvoice: boolean;
    createdAt: string;
  }) => void;
  onOpenMyPage?: () => void;
  onOpenLegalModal?: (tab: 'refund' | 'terms' | 'privacy' | 'escrow') => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  items,
  user,
  onPaymentSuccess,
  onOpenMyPage,
  onOpenLegalModal,
}: PaymentModalProps) {
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [zonecode, setZonecode] = useState('');
  const [mainAddress, setMainAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [preferredTime, setPreferredTime] = useState<string>('언제나 가능 (빠른 상담)');
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSelectAddress = (data: {
    zonecode: string;
    address: string;
    roadAddress: string;
    jibunAddress: string;
    buildingName: string;
    fullAddress: string;
  }) => {
    setZonecode(data.zonecode);
    setMainAddress(data.fullAddress);
    const combined = detailAddress.trim() ? `${data.fullAddress} ${detailAddress.trim()}` : data.fullAddress;
    setAddress(combined);
  };

  const handleDetailAddressChange = (value: string) => {
    setDetailAddress(value);
    const base = mainAddress || address;
    const combined = value.trim() ? `${base} ${value.trim()}` : base;
    setAddress(combined);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const safeItems = Array.isArray(items) ? items : [];

  const totalItemAmount = safeItems.reduce((sum, item) => {
    const itemPrice = item?.price || 0;
    return sum + itemPrice * (item?.quantity || 1);
  }, 0);

  const totalQuantity = safeItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim()) {
      alert('신청자 성함을 입력해 주세요.');
      return;
    }
    if (!buyerPhone.trim()) {
      alert('연락처(휴대폰 번호)를 입력해 주세요.');
      return;
    }
    if (!address.trim()) {
      alert('설치 희망지 주소를 검색하여 입력해 주세요.');
      return;
    }
    if (!agreeTerms) {
      alert('개인정보 수집 및 사전 상담 신청 동의에 체크해 주세요.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const orderData = {
        orderId: `SY-RES-${Date.now().toString().slice(-7)}`,
        totalAmount: totalItemAmount,
        items: safeItems,
        buyerName,
        buyerPhone,
        buyerEmail,
        address,
        memo,
        paymentMethod: '무료 시공 상담 (결제비용 0원)',
        consultationType: `전화 유선 상담 후 현장 무료 방문 실측 (${preferredTime})`,
        preferredTime,
        taxInvoice,
        createdAt: new Date().toLocaleString('ko-KR'),
      };

      setCompletedOrder(orderData);
      setIsProcessing(false);
      setIsSuccess(true);
      onPaymentSuccess(orderData);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isProcessing ? undefined : onClose}
        className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">무료 시공 상담 및 설치 예약</h2>
              <p className="text-[11px] text-slate-400">결제 비용 0원 · 전문 엔지니어 1:1 방문 실측 및 견적</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess && completedOrder ? (
            /* SUCCESS STATE */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                  접수 완료 (결제비용 0원)
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  무료 시공 상담 및 실측 예약이 완료되었습니다!
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                  24시간 이내에 전담 기술 엔지니어가 직접 전화드려 현장 실측 및 설치 일정을 안내해 드립니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">접수번호</span>
                  <span className="font-mono font-black text-blue-600">{completedOrder.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">신청 고객</span>
                  <span className="font-extrabold text-slate-800">{completedOrder.buyerName} ({completedOrder.buyerPhone})</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-bold shrink-0">설치 장소</span>
                  <span className="font-bold text-slate-800 text-right">{completedOrder.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">진행 절차</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{completedOrder.consultationType}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-900">상담 신청 비용</span>
                  <span className="text-sm font-black text-emerald-600">₩0원 (무료)</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                >
                  확인 완료
                </button>
                {user && onOpenMyPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMyPage();
                    }}
                    className="px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    마이페이지 상담내역
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmitConsultation} className="space-y-5">
              {/* 1. Item summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">상담 신청 상품 ({totalQuantity}개)</p>
                    <p className="text-xs font-black text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {safeItems.map((i) => i.name).join(', ') || '선택된 상품 없음'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">예상 상품가</span>
                  <span className="text-xs font-black text-slate-900">₩{totalItemAmount.toLocaleString()}원</span>
                </div>
              </div>

              {/* 2. Customer details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>신청 고객 정보</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      신청자 성함 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      연락처 (휴대폰 번호) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>설치 희망지 주소</span>
                </h3>
                <div className="flex gap-2">
                  <div
                    onClick={() => setIsAddressSearchOpen(true)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center justify-between transition-all"
                    role="button"
                    tabIndex={0}
                  >
                    <span className={mainAddress || address ? 'text-slate-900' : 'text-slate-400'}>
                      {mainAddress || address || '주소 검색을 눌러 주소를 찾아주세요'}
                    </span>
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddressSearchOpen(true)}
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>주소 검색</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => handleDetailAddressChange(e.target.value)}
                  placeholder="상세 주소를 입력해 주세요 (동/호수 또는 주차장 위치)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="현장 요청사항 (예: 방문 전 연락, 지하주차장 설치 등)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* 4. Consultation & survey process */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-blue-600" />
                    <span>진행 절차: 전화 상담 후 방문 실측</span>
                  </h3>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    100% 무료
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                    <p className="text-slate-700 font-bold"><strong>1차 전화 상담</strong>: 전담 엔지니어가 현장 전력 및 설치 환경 유선 사전 파악</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                    <p className="text-slate-700 font-bold"><strong>2차 현장 무료 실측</strong>: 엔지니어 현장 직접 방문하여 배선 실측 & 최종 견적 확정</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    📞 희망 통화 시간대
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      '언제나 가능 (빠른 상담)',
                      '오전 (09:00 ~ 12:00)',
                      '오후 (13:00 ~ 18:00)',
                      '저녁 (18:00 이후)',
                    ].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPreferredTime(t)}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                          preferredTime === t
                            ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20 font-black'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms agreement */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    id="agreePaymentModal"
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreePaymentModal" className="text-slate-700 leading-snug cursor-pointer">
                    <span className="font-bold text-slate-900">[필수] 무료 시공 상담 및 개인정보 수집 동의</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      온라인 즉시 결제 없이 100% 무료 현장 실측 및 맞춤 상담으로 진행됩니다.
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-[1.005] active:scale-[0.995] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>무료 상담 접수 중입니다...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>⚡ 무료 시공 상담 및 예약 신청하기 (0원)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 font-medium text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  본사 직영 24시간 내 배정 · 7일 내 책임 착공 보증
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={isAddressSearchOpen}
        onClose={() => setIsAddressSearchOpen(false)}
        onSelectAddress={handleSelectAddress}
        title="설치 희망지 주소 검색"
      />
    </div>
  );
}
