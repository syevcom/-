import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ShoppingBag,
  UserCheck,
  UserX,
  ChevronRight,
  Mail,
  Check,
  AlertCircle,
  Search,
  Calendar,
  MessageSquare,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, User, ActivePage } from '../types';
import AddressSearchModal from './AddressSearchModal';

interface CheckoutPageProps {
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
    taxInvoice: boolean;
  }) => void;
  onPageChange: (page: ActivePage) => void;
  onOpenAuthModal: () => void;
  onOpenMyPage?: () => void;
  onOpenLegalModal?: (tab: 'refund' | 'terms' | 'privacy' | 'escrow') => void;
}

export default function CheckoutPage({
  items,
  user,
  onPaymentSuccess,
  onPageChange,
  onOpenAuthModal,
  onOpenMyPage,
  onOpenLegalModal,
}: CheckoutPageProps) {
  // Step state: 'choice' (Guest vs Member) | 'form' (Order/Consultation Form) | 'complete' (Success)
  const [step, setStep] = useState<'choice' | 'form' | 'complete'>(() => {
    return user ? 'form' : 'choice';
  });

  const [orderType, setOrderType] = useState<'member' | 'guest'>(user ? 'member' : 'guest');

  // Automatically transition to form if user logs in while on choice step
  useEffect(() => {
    if (user) {
      setOrderType('member');
      if (step === 'choice') {
        setStep('form');
      }
    }
  }, [user, step]);

  // Form Fields
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

  // Auto fill user data when user logs in
  useEffect(() => {
    if (user) {
      if (!buyerName) setBuyerName(user.name || '');
      if (!buyerPhone) setBuyerPhone(user.phone || '');
      if (!buyerEmail) setBuyerEmail(user.email || '');
    }
  }, [user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

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
        orderType,
        createdAt: new Date().toLocaleString('ko-KR'),
      };

      setCompletedOrder(orderData);
      setIsProcessing(false);
      setStep('complete');
      onPaymentSuccess(orderData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  // 1. ORDER COMPLETE SCREEN
  if (step === 'complete' && completedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1 rounded-full mb-3">
              결제 비용 0원 · 100% 무료 상담 접수 완료
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              무료 시공 상담 및 설치 예약이 접수되었습니다!
            </h1>
            <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
              SY.com 전문 기술 엔지니어가 접수 내용을 확인한 후, <strong className="text-blue-600 font-black">24시간 이내</strong>에 직접 유선 연락드려 현장 실측 및 맞춤 견적을 친절하게 안내해 드립니다.
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left mb-8 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500">예약 접수 번호</span>
                <span className="text-sm font-black font-mono text-blue-600">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">예약 신청자</span>
                <span className="text-sm font-extrabold text-slate-800">{completedOrder.buyerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">연락처</span>
                <span className="text-sm font-extrabold text-slate-800">{completedOrder.buyerPhone}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 shrink-0 mt-0.5">설치 희망지</span>
                <span className="text-xs font-bold text-slate-800 text-right">{completedOrder.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">희망 상담 방식</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {completedOrder.consultationType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">예상 상품 견적 합계</span>
                <span className="text-sm font-extrabold text-slate-800">
                  ₩{completedOrder.totalAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-xs font-black text-slate-900">상담 신청 결제 비용</span>
                <span className="text-lg font-black text-emerald-600">
                  ₩0원 (무료 상담/실측)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => onPageChange('home')}
                className="py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl cursor-pointer transition-colors shadow-md"
              >
                메인 홈으로 이동
              </button>
              <button
                type="button"
                onClick={() => onPageChange('cart')}
                className="py-3.5 px-6 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-sm rounded-2xl cursor-pointer transition-colors"
              >
                장바구니 확인
              </button>
              {user && onOpenMyPage && (
                <button
                  type="button"
                  onClick={onOpenMyPage}
                  className="py-3.5 px-6 bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold text-sm rounded-2xl cursor-pointer transition-colors"
                >
                  마이페이지 상담/예약내역
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. GUEST VS MEMBER SELECTION SCREEN ('choice')
  if (step === 'choice' && !user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => onPageChange('cart')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="장바구니로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">상담 및 예약 방식 선택</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                회원 로그인으로 상담 이력을 관리하시거나, 비회원으로 빠르게 1분 상담 신청을 하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Items Summary Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">상담 신청 예정 상품 ({totalQuantity}개)</p>
                <p className="text-sm font-black text-slate-800 line-clamp-1">
                  {items.length > 0 ? items[0].name : '선택된 상품 없음'}
                  {items.length > 1 && ` 외 ${items.length - 1}건`}
                </p>
              </div>
            </div>
            <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="text-xs text-slate-500 block">예상 견적 합계</span>
              <span className="text-lg font-black text-blue-600">₩{totalItemAmount.toLocaleString()}원 <span className="text-xs font-bold text-emerald-600">(신청비 0원)</span></span>
            </div>
          </div>

          {/* Choice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Log in & Order */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-blue-600/80 rounded-3xl p-6 sm:p-8 shadow-lg relative flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-[11px] font-black px-3 py-1 rounded-full">
                추천 (이력 관리)
              </div>

              <div>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-md">
                  <UserCheck className="w-6 h-6" />
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-2">회원 로그인 / 가입 후 신청</h2>
                <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
                  로그인 후 신청하시면 실시간 시공 진행 현황 확인, 무상 A/S 보증 등록 및 회원 전용 혜택을 이용하실 수 있습니다.
                </p>

                <div className="space-y-2.5 mb-8 text-xs font-bold text-slate-700 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>실시간 실측·설치 일정 및 상담 이력 조회</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>회원 전용 무료 정기 점검 및 보증서 발급</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>카카오/네이버 3초 간편 로그인 지원</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 group"
              >
                <span>로그인하고 신청하기</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Card 2: Guest Order */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-5">
                  <UserX className="w-6 h-6" />
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-2">비회원으로 빠른 상담 신청</h2>
                <p className="text-xs text-slate-600 font-medium mb-6 leading-relaxed">
                  회원 가입 없이 성함과 연락처, 설치 장소만 입력하여 간편하게 1:1 무료 상담 및 실측 예약을 접수합니다.
                </p>

                <div className="space-y-2.5 mb-8 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>가입 절차 없는 1분 초간편 접수</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>휴대폰 번호로 상담 접수 내역 확인</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>100% 동일한 전담 엔지니어 무료 방문 실측</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOrderType('guest');
                  setStep('form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 group"
              >
                <span>비회원으로 간편 신청하기</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FULL ORDER / CONSULTATION FORM VIEW ('form')
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!user) {
                  setStep('choice');
                } else {
                  onPageChange('cart');
                }
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">무료 시공 상담 및 설치 예약</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                별도의 온라인 결제 없이 <strong className="text-blue-600">무료 현장 실측 및 맞춤 견적</strong>을 신청하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* User Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {user ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>회원 신청 ({user.name}님)</span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5 text-amber-600" />
                  비회원 간편 신청
                </span>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="underline hover:text-amber-900 font-extrabold cursor-pointer ml-1"
                >
                  로그인 전환
                </button>
              </div>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-bold text-slate-700 mb-4">상담 신청할 상품이 선택되지 않았습니다.</p>
            <button
              onClick={() => onPageChange('products')}
              className="px-6 py-3 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
            >
              충전기 상품 둘러보기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitConsultation} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs & Options (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* SECTION 1: Customer Info */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-black text-slate-900">1. 신청 고객 정보</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      신청자 성함 / 상호명 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="홍길동 또는 회사명"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      연락처 (휴대폰 번호) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      이메일 주소 <span className="text-slate-400 font-normal">(정밀 견적서 수신 희망 시)</span>
                    </label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Shipping & Installation Address */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-black text-slate-900">2. 설치 희망 현장 주소</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>
                        설치 희망지 주소 <span className="text-rose-500">*</span>
                      </span>
                      {zonecode && (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          우편번호: {zonecode}
                        </span>
                      )}
                    </label>

                    {/* Address Search Trigger Bar */}
                    <div className="flex gap-2 mb-2">
                      <div
                        onClick={() => setIsAddressSearchOpen(true)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center justify-between transition-all"
                        role="button"
                        tabIndex={0}
                      >
                        <span className={mainAddress || address ? 'text-slate-900' : 'text-slate-400'}>
                          {mainAddress || address || '주소 검색을 눌러 도로명/지번 주소를 찾아주세요'}
                        </span>
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddressSearchOpen(true)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>주소 검색</span>
                      </button>
                    </div>

                    {/* Detail Address Input */}
                    <input
                      type="text"
                      value={detailAddress}
                      onChange={(e) => handleDetailAddressChange(e.target.value)}
                      placeholder="상세 위치를 입력해 주세요 (예: 101동 지하 2층 주차장 또는 단독주택 차고지)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      현장 특이사항 및 요청사항
                    </label>
                    <input
                      type="text"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="예: 주말 방문 희망, 스탠드 거치대 필요 여부, 한전 보조금 신청 상담 요청"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '방문 전 미리 전화 주세요',
                        '아파트 지하주차장 설치 희망',
                        '단독주택 벽부형 설치',
                        '스탠드 거치대 추가 문의',
                        '한전 무상 보조금 대행 요청',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMemo(preset)}
                          className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Consultation & On-site Survey Workflow */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-black text-slate-900">3. 상담 및 진행 절차 안내</h2>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    무조건 전화 상담 후 현장 방문 실측 (100% 무료)
                  </span>
                </div>

                {/* 2-Step Workflow Visual Card */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100/80 rounded-2xl p-5 mb-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Step 1 */}
                    <div className="bg-white p-4 rounded-xl border border-blue-200/70 shadow-xs flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-xs">
                        1
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <h4 className="text-xs font-black text-slate-900">1차 유선 전화 상담 (24시간 이내)</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          전문 기술 엔지니어가 직접 전화드려 전기 용량, 설치 위치, 현장 환경 사진을 사전 검토합니다.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200/70 shadow-xs flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-xs">
                        2
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <h4 className="text-xs font-black text-slate-900">2차 1:1 현장 무료 방문 실측</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          고객님 편하신 일정에 맞춰 엔지니어가 현장 방문하여 분전함 배선 실측 & 최종 정밀 견적서를 산출합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>방문 실측 및 견적 상담 비용은 <strong>전액 0원(무료)</strong>이며, 견적 확인 후 시공 여부를 자유롭게 결정하실 수 있습니다.</span>
                  </div>
                </div>

                {/* Preferred Call Time Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-extrabold text-slate-700 mb-2">
                    📞 원활한 상담을 위한 희망 통화 시간대 선택
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      '언제나 가능 (빠른 상담)',
                      '오전 (09:00 ~ 12:00)',
                      '오후 (13:00 ~ 18:00)',
                      '저녁 (18:00 이후)',
                    ].map((timeOption) => {
                      const isSelected = preferredTime === timeOption;
                      return (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => setPreferredTime(timeOption)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all text-center ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-600/20 font-black'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          {timeOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tax invoice info option */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={taxInvoice}
                      onChange={(e) => setTaxInvoice(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      사업자 세금계산서 / 지출증빙 영수증 발행 희망 (시공 계약 시 반영)
                    </span>
                  </label>
                  {taxInvoice && (
                    <p className="text-[11px] text-slate-500 font-medium mt-2 pl-6">
                      ※ 상담 진행 시 사업자등록증 사본을 전달해 주시면 전자세금계산서 발행 처리를 함께 안내해 드립니다.
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 4: Terms & Policies */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                {/* 24시간 내 상담 / 7일 내 착공 배너 */}
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                    ⚡
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="font-extrabold text-emerald-950">
                      [본사 직영 책임시공] 24시간 이내 전문 엔지니어 1:1 연락 · 7일 이내 직영 착공
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      상담 신청 접수 즉시 <strong>24시간 이내</strong> 전담 기술진이 배정되어 현장 실측 일정을 안내해 드리며, 최종 시공 확정 시 <strong>7일 이내 본사 직영 시공</strong>을 진행합니다.
                    </p>
                    <p className="text-[10.5px] text-emerald-800 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 leading-relaxed font-bold">
                      💡 사전 방문 실측 및 견적 상담 비용은 100% 무료이며, 온라인 결제비용이 발생하지 않습니다.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      [필수] 개인정보 수집·이용 및 무료 시공 상담 신청 동의
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium leading-relaxed block mt-1">
                      신청하신 연락처 및 주소 정보는 현장 실측 상담 및 설치 견적 안내 목적으로만 안전하게 사용됩니다.
                    </span>
                  </div>
                </label>

                {onOpenLegalModal && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 pl-8">
                    <button
                      type="button"
                      onClick={() => onOpenLegalModal('privacy')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      개인정보처리방침
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLegalModal('terms')}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      이용약관
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLegalModal('refund')}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      시공 보증 및 정책
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Cart Summary Sidebar (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg sticky top-28 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-black text-slate-900">상담 신청 상품 ({totalQuantity}개)</h2>
                </div>

                {/* Items list */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
                  {safeItems.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">선택된 상품이 없습니다.</p>
                  ) : (
                    safeItems.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <p className="text-[10px] text-slate-500 truncate font-medium">
                              {Object.values(item.selectedOptions).join(', ')}
                            </p>
                          )}
                          <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                            예상가 ₩{(item.price || 0).toLocaleString()}원 × {item.quantity || 1}개
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Amount breakdown */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs font-bold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>예상 상품 견적 합계</span>
                    <span className="text-slate-900 font-extrabold">₩{totalItemAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>현장 실측 및 방문 상담비</span>
                    <span className="text-emerald-600 font-extrabold">₩0원 (100% 무료)</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2.5">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">상담 신청 결제 비용</span>
                      <span className="text-[10px] text-slate-400 font-normal">온라인 즉시 결제 없음</span>
                    </div>
                    <span className="text-xl font-black text-emerald-600 tracking-tight">
                      ₩0원
                    </span>
                  </div>
                </div>

                {/* Guarantee badge */}
                <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl text-[11px] text-blue-800 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>본사 직영 3년 무상 AS 및 정부 보조금 매칭</span>
                </div>

                {/* Submit Consultation Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>무료 상담 접수 중입니다...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ 무료 시공 상담 및 예약 신청하기 (0원)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 font-medium text-center">
                  * 별도의 결제 절차 없이 담당 엔지니어가 배정됩니다.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Address Search Daum Postcode Modal */}
      <AddressSearchModal
        isOpen={isAddressSearchOpen}
        onClose={() => setIsAddressSearchOpen(false)}
        onSelectAddress={handleSelectAddress}
        title="설치 희망지 주소 검색"
      />
    </div>
  );
}
