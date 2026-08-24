import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  PhoneCall, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  X, 
  Phone, 
  MessageCircle, 
  FileText,
  BadgeCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ConsultationSuccessData {
  name: string;
  phone: string;
  location: string;
  purpose?: string;
  memo?: string;
  bookingId?: string;
  estimateCost?: string;
  createdAt?: string;
}

interface ConsultationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ConsultationSuccessData | null;
  onOpenKakao?: () => void;
  onOpenPhone?: () => void;
}

export default function ConsultationSuccessModal({
  isOpen,
  onClose,
  data,
  onOpenKakao,
  onOpenPhone
}: ConsultationSuccessModalProps) {
  // Fire celebration confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      // First burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#38bdf8']
      });

      // Side fireworks burst after 250ms
      const timeout1 = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#3b82f6', '#10b981', '#fbbf24']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#3b82f6', '#10b981', '#ec4899']
        });
      }, 250);

      // Final celebratory star shower
      const timeout2 = setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 100,
          origin: { y: 0.4 },
          shapes: ['circle'],
          colors: ['#60a5fa', '#34d399', '#fbbf24']
        });
      }, 600);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const purposeKorean = data.purpose === 'Commercial'
    ? '아파트/상업시설 공용'
    : data.purpose === 'Residential'
    ? '주거용 (홈충전)'
    : data.purpose === 'ParkingLot'
    ? '수익형 주차장'
    : data.purpose || '전기차 충전기 설치 상담';

  const nextSteps = [
    {
      step: '01',
      title: '접수 완료 및 현장 사전 분석',
      desc: '신청하신 주소지의 한전 인입 전력 용량 및 건물 환경 1차 기술 검토',
      badge: '즉시 완료',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: FileText,
      active: false,
      done: true
    },
    {
      step: '02',
      title: '전담 엔지니어 해피콜 (방문 일정 조율)',
      desc: '배정된 전문 기술 매니저가 2시간 이내 유선 연락을 드려 편하신 방문 실측 일정을 확정합니다.',
      badge: '진행 예정',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 font-black animate-pulse',
      icon: PhoneCall,
      active: true,
      done: false
    },
    {
      step: '03',
      title: '현장 무료 실측 & 맞춤 견적서 산출',
      desc: '배선 거리, 분전함 위치, 계량기 여유 전력 정밀 측정 후 최적 견적 및 정부 지원금 컨설팅',
      badge: '100% 무료',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: MapPin,
      active: false,
      done: false
    },
    {
      step: '04',
      title: '안전 책임 시공 & 한전 대행 승인',
      desc: '국가 공인 전기공사 기사 방문 시공 및 한국전기안전공사 사용전검사 합격 후 즉시 사용',
      badge: '원스톱 대행',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: ShieldCheck,
      active: false,
      done: false
    }
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Decorative Header with Fireworks & Animated Check */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 px-6 pt-8 pb-7 text-white text-center overflow-hidden shrink-0">
            {/* Background Glows */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Floating Sparkles Icons */}
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/15 backdrop-blur-md rounded-full border border-white/25 text-xs font-black text-amber-300 shadow-inner mb-3.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>상담 신청 접수 완료</span>
            </motion.div>

            {/* Animated Big Celebration Icon */}
            <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              {/* Pulsing Outer Rings */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-emerald-400/30"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-white/20"
              />

              {/* Main Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl border-2 border-white/80"
              >
                <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
              </motion.div>
            </div>

            {/* Headline */}
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight"
            >
              실측 방문 상담이 준비되었습니다!
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 max-w-md mx-auto leading-relaxed"
            >
              안전한 시공과 최적의 맞춤 견적을 위해 전담 기술 엔지니어가 신속하게 연락드리겠습니다.
            </motion.p>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
            {/* 1. Customer Application Summary Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                  신청 접수 정보
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {data.createdAt || '접수 번호: ' + (data.bookingId || `SY-${Date.now().toString().slice(-6)}`)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold w-16 shrink-0">신청자명</span>
                  <span className="font-extrabold text-slate-900">{data.name} 고객님</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold w-16 shrink-0">연락처</span>
                  <span className="font-extrabold text-slate-900">{data.phone}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-2">
                  <span className="text-slate-400 font-bold w-16 shrink-0">설치 희망지</span>
                  <span className="font-extrabold text-slate-900 break-all">{data.location || '주소 상담 시 확인'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold w-16 shrink-0">상담 구분</span>
                  <span className="font-extrabold text-blue-600">{purposeKorean}</span>
                </div>
                {data.estimateCost && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold w-16 shrink-0">예상 견적</span>
                    <span className="font-black text-rose-600">{data.estimateCost}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Next Steps Guide (다음 단계 안내) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  다음 진행 단계 안내
                </h4>
                <span className="text-[11px] text-blue-600 font-bold">100% 무료 현장 방문 실측</span>
              </div>

              <div className="space-y-2">
                {nextSteps.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        item.active 
                          ? 'bg-blue-50/80 border-blue-200 shadow-xs ring-2 ring-blue-500/20' 
                          : item.done
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      {/* Step Number Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        item.done
                          ? 'bg-emerald-600 text-white'
                          : item.active 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.done ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black ${item.active ? 'text-blue-900' : 'text-slate-900'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Safety & Trust Guarantee Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-emerald-900">에스와이 이모빌리티 안심 보증 정책</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  사전 방문 실측은 전액 무료이며, 실측 후 시공 진행 여부는 자유롭게 결정하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenKakao) onOpenKakao();
                else window.open('https://pf.kakao.com/', '_blank');
              }}
              className="flex-1 py-3 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>카카오톡 1:1 빠른 문의</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenPhone) onOpenPhone();
                else window.location.href = 'tel:1588-SY01';
              }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>고객센터 전화상담</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-28 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>확인</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
