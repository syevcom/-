/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Send, Calculator, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking } from '../types';
import AddressSearchModal from './AddressSearchModal';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'select' | 'number' | 'address';
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  initialPurpose?: 'Commercial' | 'Residential' | 'ParkingLot';
  initialBrand?: string;
  initialHomePower?: string;
  initialHomeServiceType?: string;
  quoteConfig?: {
    badge: string;
    title: string;
    submitButton: string;
    successTitle: string;
    successDesc: string;
    privacyNotice: string;
    directPhone?: string;
    directKakaoUrl?: string;
    purposeLabels?: {
      Residential: string;
      Commercial: string;
      ParkingLot: string;
    };
    fields?: {
      Residential: CustomField[];
      Commercial: CustomField[];
      ParkingLot: CustomField[];
    };
  };
}

const DEFAULT_FIELDS: {
  Residential: CustomField[];
  Commercial: CustomField[];
  ParkingLot: CustomField[];
} = {
  Residential: [
    { id: 'name', label: '신청인 이름 / 법인 담당자', type: 'text', placeholder: '홍길동', required: true },
    { id: 'phone', label: '연락처 (휴대폰 번호)', type: 'tel', placeholder: '010-1234-5678', required: true },
    { id: 'location', label: '설치 희망 주소', type: 'address', placeholder: '설치 주소를 검색하거나 입력해 주세요.', required: true },
    { id: 'residenceType', label: '주거 형태', type: 'select', required: true, options: ['아파트(공용)', '아파트(개인)', '단독주택', '빌라/연립', '기타'] },
    { id: 'memo', label: '상담 희망 메모 (선택사항)', type: 'text', placeholder: '기타 상세한 요구 사항을 적어주세요.', required: false }
  ],
  Commercial: [
    { id: 'companyName', label: '아파트명 (건물명)', type: 'text', placeholder: '예: 에스와이 1차 아파트', required: true },
    { id: 'location', label: '주소', type: 'address', placeholder: '설치지 상세 주소를 입력 또는 검색해 주세요.', required: true },
    { id: 'parkingCount', label: '보유 주차면수', type: 'text', placeholder: '예: 150면', required: true },
    { id: 'quantity', label: '설치 희망 수량 (대)', type: 'number', placeholder: '예: 10', required: true },
    { id: 'ownedChargers', label: '보유 충전기 수량 (대)', type: 'number', placeholder: '예: 2 (없을 시 0 입력)', required: true },
    { id: 'name', label: '신청자명', type: 'text', placeholder: '홍길동', required: true },
    { id: 'phone', label: '연락처 (휴대폰 번호)', type: 'tel', placeholder: '010-1234-5678', required: true },
    { id: 'email', label: '이메일 주소', type: 'text', placeholder: 'example@domain.com', required: true },
    { id: 'memo', label: '문의 상세 사항 (선택사항)', type: 'text', placeholder: '기타 추가 질문이나 특이사항을 입력해 주세요.', required: false }
  ],
  ParkingLot: [
    { id: 'parkingName', label: '주차장 상호 / 빌딩명', type: 'text', placeholder: '강남 타워 주차장', required: true },
    { id: 'name', label: '담당자 이름', type: 'text', placeholder: '홍길동', required: true },
    { id: 'phone', label: '연락처 (휴대폰 번호)', type: 'tel', placeholder: '010-1234-5678', required: true },
    { id: 'location', label: '설치 희망 주소', type: 'address', placeholder: '설치 주소를 검색하거나 입력해 주세요.', required: true },
    { id: 'parkingCount', label: '총 주차 가능 면수', type: 'text', placeholder: '예: 50면', required: true },
    { id: 'operatingType', label: '주차장 운영 방식', type: 'select', required: true, options: ['유료 주차장', '무료 주차장', '일부 유료/혼합', '기타'] },
    { id: 'memo', label: '추가 상담 사항 (선택사항)', type: 'text', placeholder: '희망하는 운영 방식이나 질문을 기재해 주세요.', required: false }
  ]
};

export default function QuoteModal({ 
  isOpen, 
  onClose, 
  onSubmitBooking, 
  initialPurpose = 'Residential',
  initialBrand = 'sk일렉링크',
  initialHomePower = '7kW',
  initialHomeServiceType = '단말기 단품',
  quoteConfig = {
    badge: '정부보조금 마감 임박 혜택 우선 선점',
    title: '무료 설치 상담 & 실시간 맞춤 견적',
    submitButton: '👉 30초 만에 무료 설치 상담 예약하기',
    successTitle: '상담 신청이 정상 접수되었습니다!',
    successDesc: '올해 배정된 정부 보조금 잔여 한도 선점을 위해, 2시간 이내에 담당 전문 컨설턴트가 기재해 주신 번호로 연락드리겠습니다.',
    privacyNotice: '안심 보증 정책: 입력하신 정보는 한전 한도 및 정부 무상 보조금 산정 용도로만 안전하게 활용되며, 전문 법률에 따라 개인정보보호법을 철저히 준수합니다.',
    directPhone: '1588-SY01',
    directKakaoUrl: 'https://pf.kakao.com/',
    purposeLabels: {
      Residential: '주거용 (단독주택/빌라/아파트)',
      Commercial: '기업/관공서용 (사옥/공장/창고)',
      ParkingLot: '수익형 주차장 (호텔/마트/상가빌딩)'
    },
    fields: DEFAULT_FIELDS
  }
}: QuoteModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'calc'>('quick');
  
  // Quick booking state (Exactly 4 fields!)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('서울');
  const [purpose, setPurpose] = useState<'Commercial' | 'Residential' | 'ParkingLot'>(initialPurpose);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedHomePower, setSelectedHomePower] = useState<string>(initialHomePower);
  const [selectedHomeServiceType, setSelectedHomeServiceType] = useState<string>(initialHomeServiceType);
  const [memo, setMemo] = useState('');

  // Dynamic field values
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // 1-minute estimation state
  const [calcPower, setCalcPower] = useState<'7' | '11' | '50' | '100' | '200'>('7');
  const [calcQty, setCalcQty] = useState(1);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [addressSearchFieldId, setAddressSearchFieldId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Simple location options
  const locations = [
    '서울', '경기', '인천', '강원', '충북', '충남/대전', '전북', '전남/광주', '경북/대구', '경남/부산/울산', '제주'
  ];

  const activeFields = quoteConfig.fields?.[purpose] || DEFAULT_FIELDS[purpose];

  // Address search with Daum Postcode
  React.useEffect(() => {
    if (addressSearchFieldId) {
      const runPostcode = () => {
        const container = document.getElementById('daum-postcode-container');
        if (container && (window as any).daum && (window as any).daum.Postcode) {
          new (window as any).daum.Postcode({
            oncomplete: function(data: any) {
              const fullAddress = data.roadAddress || data.address;
              handleInputChange(addressSearchFieldId, fullAddress);
              setAddressSearchFieldId(null);
            },
            width: '100%',
            height: '100%'
          }).embed(container);
        }
      };

      if ((window as any).daum && (window as any).daum.Postcode) {
        setTimeout(runPostcode, 150);
      } else {
        const scriptId = 'daum-postcode-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
          script.async = true;
          document.body.appendChild(script);
        }
        script.onload = () => {
          setTimeout(runPostcode, 150);
        };
      }
    }
  }, [addressSearchFieldId]);

  // Initialize formValues when purpose changes
  React.useEffect(() => {
    if (isOpen) {
      setPurpose(initialPurpose);
      setSelectedBrand(initialBrand);
      setSelectedHomePower(initialHomePower);
      setSelectedHomeServiceType(initialHomeServiceType);
    }
  }, [isOpen, initialPurpose, initialBrand, initialHomePower]);

  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      activeFields.forEach(f => {
        initial[f.id] = formValues[f.id] || (f.id === 'name' ? name : f.id === 'phone' ? phone : f.id === 'location' ? location : f.id === 'memo' ? memo : '') || (f.type === 'select' ? (f.options?.[0] || '') : '');
      });
      setFormValues(prev => ({
        ...initial,
        ...prev
      }));
    }
  }, [purpose, isOpen, quoteConfig.fields]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    if (fieldId === 'name') setName(value);
    else if (fieldId === 'phone') setPhone(value);
    else if (fieldId === 'location') setLocation(value);
    else if (fieldId === 'memo') setMemo(value);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check required fields dynamically
    for (const field of activeFields) {
      const val = (formValues[field.id] || '').trim();
      if (field.required && !val) {
        setError(`'${field.label}' 필드를 정확히 입력해 주세요.`);
        return;
      }
    }

    // Dynamic extraction of Name, Phone, and Location
    const nameField = activeFields.find(f => f.id === 'name' || f.label.includes('이름') || f.label.includes('성함'));
    const bookingName = nameField ? (formValues[nameField.id] || '').trim() : name || '익명 고객';

    const phoneField = activeFields.find(f => f.id === 'phone' || f.type === 'tel' || f.label.includes('연락처') || f.label.includes('전화번호'));
    const bookingPhone = phoneField ? (formValues[phoneField.id] || '').trim() : phone || '';

    if (!bookingPhone) {
      setError('연락처 휴대폰 번호가 필요합니다.');
      return;
    }

    const cleanPhone = bookingPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setError('올바른 연락처(휴대폰 번호)를 입력해 주세요.');
      return;
    }

    const locationField = activeFields.find(f => f.id === 'location' || f.label.includes('지역'));
    const bookingLocation = locationField ? (formValues[locationField.id] || '') : location || '서울';

    // Pack non-core custom fields into a neat memo bullet list
    let compiledMemo = '';
    if (purpose === 'Commercial') {
      compiledMemo += `• [희망 브랜드] ${selectedBrand}\n`;
    }
    if (purpose === 'Residential') {
      compiledMemo += `• [희망 구분] ${selectedHomeServiceType}\n`;
      compiledMemo += `• [희망 용량] ${selectedHomePower}\n`;
    }
    activeFields.forEach(field => {
      if (field.id !== 'name' && field.id !== 'phone' && field.id !== 'location' && field.id !== 'memo') {
        const val = formValues[field.id] || '';
        compiledMemo += `• [${field.label}] ${val}\n`;
      }
    });

    const memoField = activeFields.find(f => f.id === 'memo' || f.label.includes('메모') || f.label.includes('상세'));
    if (memoField && formValues[memoField.id]) {
      compiledMemo += `• [${memoField.label}] ${formValues[memoField.id]}`;
    }

    if (!compiledMemo) {
      compiledMemo = `${purpose === 'Commercial' ? '기업용' : purpose === 'Residential' ? '주거용' : '주차장용'} 무상 상담 신청`;
    }

    // Submit
    onSubmitBooking({
      name: bookingName,
      phone: bookingPhone,
      location: bookingLocation,
      purpose,
      memo: compiledMemo,
      estimateCost: activeTab === 'calc' ? `${calculateFinalCost().toLocaleString()}원` : undefined
    });

    setName('');
    setPhone('');
    setMemo('');
    setFormValues({});
    setSubmitted(false);
    onClose();
  };

  // Helper calculation for 1-minute custom quotation
  const calculateCosts = () => {
    let unitCost = 0;
    let subsidyPerUnit = 0;

    switch (calcPower) {
      case '7':
        unitCost = 1500000;
        subsidyPerUnit = 1100000; // 70% ~ 80% subsidy
        break;
      case '11':
        unitCost = 2200000;
        subsidyPerUnit = 1600000;
        break;
      case '50':
        unitCost = 12000000;
        subsidyPerUnit = 8000000;
        break;
      case '100':
        unitCost = 25000000;
        subsidyPerUnit = 17000000;
        break;
      case '200':
        unitCost = 48000000;
        subsidyPerUnit = 32000000;
        break;
    }

    const totalCost = unitCost * calcQty;
    const totalSubsidy = subsidyPerUnit * calcQty;
    const finalCost = Math.max(0, totalCost - totalSubsidy);

    return { totalCost, totalSubsidy, finalCost };
  };

  const calculateFinalCost = () => {
    return calculateCosts().finalCost;
  };

  const { totalCost, totalSubsidy, finalCost } = calculateCosts();

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

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        id="quote-modal"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-quote"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors z-10 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Gradient Ribbon */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

        {/* Scrollable Content wrapper */}
        <div className="overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12 px-4 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{quoteConfig.successTitle}</h3>
                <p className="text-slate-500 mt-2.5 max-w-sm text-xs font-semibold leading-relaxed">
                  {quoteConfig.successDesc}
                </p>
                <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs text-slate-500 w-full max-w-md font-bold">
                  <div className="grid grid-cols-2 gap-2">
                    <div>• <span className="text-slate-400">신청 고객:</span> {name}</div>
                    <div>• <span className="text-slate-400">연락처:</span> {phone}</div>
                    <div>• <span className="text-slate-400">설치 희망지:</span> {location}</div>
                    <div>• <span className="text-slate-400">구분:</span> {purpose === 'Commercial' ? '기업/관공서' : purpose === 'Residential' ? '주거용' : '수익형 주차장'}</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {quoteConfig.badge}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {quoteConfig.title}
                  </h2>
                </div>

                {/* Tab content */}
                {activeTab === 'quick' ? (
                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Purpose Select Field */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">설치 용도 구분</label>
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value as any)}
                          id="select-quote-purpose"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-bold transition-all"
                        >
                          <option value="Commercial">{quoteConfig.purposeLabels?.Commercial || '아파트용 (공동주택/공용시설)'}</option>
                          <option value="Residential">{quoteConfig.purposeLabels?.Residential || '가정용 홈 (단독주택/빌라/개인)'}</option>
                          <option value="ParkingLot">{quoteConfig.purposeLabels?.ParkingLot || '상업시설 수익형 (호텔/마트/상가빌딩)'}</option>
                        </select>
                      </div>

                      {/* Apartment Brand Selection Grid */}
                      {purpose === 'Commercial' && (
                        <div className="md:col-span-2 space-y-2 pt-1 pb-1">
                          <label className="block text-xs font-extrabold text-emerald-600">
                            🏢 희망하시는 충전기 사업자 (브랜드)를 선택해 주세요:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { id: 'sk-link', name: 'sk일렉링크', desc: 'SK의 강력한 인프라' },
                              { id: 'plug-link', name: '플러그링크', desc: '스마트 완속 전력 제어' },
                              { id: 'el-electric', name: '이엘일렉트릭', desc: '화재 예방 특화 차단' },
                              { id: 'nice-charger', name: '나이스차져', desc: '금융급 완벽 과금 관리' },
                              { id: 'everon', name: '에버온', desc: '전국 최다 시공 실적' },
                              { id: 'iparking', name: '아이파킹', desc: '무인 주차 1위 연동 제어' },
                              { id: 'lg-voltup', name: 'LG유플러스볼트업', desc: 'LG 신뢰성 망 프리미엄' }
                            ].map((b) => {
                              const isSelected = selectedBrand === b.name;
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setSelectedBrand(b.name)}
                                  className={`p-3 rounded-xl border text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between h-[82px] ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                                      : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="w-full">
                                    <div className="flex items-center justify-between w-full">
                                      <span className={`text-[15px] sm:text-[17px] font-black tracking-tight ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                        {b.name}
                                      </span>
                                      {isSelected && (
                                        <span className="text-[9px] bg-emerald-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1 leading-tight">
                                      {b.desc}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Home Charger Service Type & Power Selection Grid */}
                      {purpose === 'Residential' && (
                        <div className="md:col-span-2 space-y-4 pt-1 pb-1">
                          {/* Service Type Selection */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-emerald-700">
                              📦 희망하시는 시공/구분을 선택해 주세요:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: '단말기 단품', name: '단말기 단품', desc: '본체만 구매' },
                                { id: '교체 시공', name: '교체 시공', desc: '기존 충전기 교체' },
                                { id: '신규 설치 포함', name: '설치 포함', desc: '한전대행+신규설치' }
                              ].map((st) => {
                                const isSelected = selectedHomeServiceType === st.id;
                                return (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setSelectedHomeServiceType(st.id)}
                                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between ${
                                      isSelected
                                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                                        : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>
                                        {st.name}
                                      </span>
                                      {isSelected && (
                                        <span className="text-[9px] bg-emerald-600 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shrink-0">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight">
                                      {st.desc}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Power Capacity Selection */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-amber-700">
                              ⚡ 희망하시는 충전 용량을 선택해 주세요:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: '5kw', name: '5kW', desc: '슬림형 / 계약전력 최소화' },
                                { id: '7kw', name: '7kW', desc: '표준형 / 가장 보편적 선택' },
                                { id: '11kw', name: '11kW', desc: '고출력 3상 / 빠른 속도' }
                              ].map((b) => {
                                const isSelected = selectedHomePower === b.name;
                                return (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedHomePower(b.name)}
                                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between ${
                                      isSelected
                                        ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500'
                                        : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-300'
                                    }`}
                                    id={`btn-home-power-${b.id}`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className={`text-xs sm:text-sm font-black tracking-tight ${isSelected ? 'text-amber-800' : 'text-slate-800'}`}>
                                        {b.name}
                                      </span>
                                      {isSelected && (
                                        <span className="text-[9px] bg-amber-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shrink-0">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight">
                                      {b.desc}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Input Fields */}
                      {activeFields.map((field) => {
                        const isFullWidth = field.id === 'memo' || (field.type === 'text' && (field.placeholder?.length || 0) > 20);
                        
                        return (
                          <div key={field.id} className={isFullWidth ? "md:col-span-2" : "col-span-1"}>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              {field.label}
                              {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                            </label>
                            
                            {field.id === 'memo' ? (
                              <textarea
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                rows={3}
                                id={`input-quote-${field.id}`}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-bold transition-all resize-none"
                              />
                            ) : field.type === 'select' ? (
                              <select
                                value={formValues[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                id={`select-quote-${field.id}`}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-bold transition-all"
                              >
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="relative flex gap-1.5">
                                <input
                                  type={field.type === 'address' ? 'text' : field.type}
                                  value={formValues[field.id] || ''}
                                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                                  placeholder={field.placeholder}
                                  id={`input-quote-${field.id}`}
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-bold transition-all"
                                />
                                {(field.id === 'location' || field.type === 'address' || (field.label.includes('주소') && !field.label.includes('이메일') && field.id !== 'email') || field.label.includes('지역')) && (
                                  <button
                                    type="button"
                                    onClick={() => setAddressSearchFieldId(field.id)}
                                    className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shrink-0 cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <span>🔍 주소 검색</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-start gap-2 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-[11px] text-slate-600 mt-4">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="font-semibold leading-relaxed">
                        <strong className="text-slate-800">안심 보증 정책:</strong> {quoteConfig.privacyNotice}
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-quote-submit"
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xl shadow-amber-500/25 hover:shadow-amber-500/45 transition-all text-center flex items-center justify-center gap-2 mt-6 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      {quoteConfig.submitButton}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Calculator Config */}
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">시뮬레이터 설정</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Power Select */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">선택 기기 출력</label>
                          <select
                            value={calcPower}
                            onChange={(e) => setCalcPower(e.target.value as any)}
                            id="select-calc-power"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                          >
                            <option value="7">7kW 스마트 완속 (주택, 빌라, 아파트)</option>
                            <option value="11">11kW 스마트 고속완속 (빌딩, 주차장)</option>
                            <option value="50">50kW 도심형 급속 (상가, 마트, 요식업)</option>
                            <option value="100">100kW 멀티 급속 (호텔, 빌딩 주차장)</option>
                            <option value="200">200kW 초급속 하이퍼 (물류창고, 지자체)</option>
                          </select>
                        </div>

                        {/* Qty Select */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">설치 수량 (대)</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCalcQty(Math.max(1, calcQty - 1))}
                              id="btn-calc-qty-dec"
                              className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={calcQty}
                              onChange={(e) => setCalcQty(Math.max(1, parseInt(e.target.value) || 1))}
                              id="input-calc-qty"
                              className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                            />
                            <button
                              type="button"
                              onClick={() => setCalcQty(calcQty + 1)}
                              id="btn-calc-qty-inc"
                              className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Output Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">시공/설비 정가</span>
                        <span className="text-xs font-bold text-slate-500 line-through">
                          {totalCost.toLocaleString()}원
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[10px] text-emerald-600 font-extrabold block mb-1">예상 정부 보조금</span>
                        <span className="text-xs font-black text-emerald-600">
                          - {totalSubsidy.toLocaleString()}원
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                        <span className="text-[10px] text-indigo-800 font-extrabold block mb-1">최종 자가 부담금</span>
                        <span className="text-xs font-black text-indigo-700">
                          {finalCost.toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    {/* Explanatory text */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50/20 rounded-3xl p-4 border border-emerald-200/50 text-xs text-slate-600 space-y-1.5 font-semibold">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        올해 정부보조금 선점 우선 신청 대상자 추가 혜택
                      </p>
                      <p>
                        * 상기 견적은 전국 평균 지자체 무상 지원 보조금을 기준으로 산출되었으며, 신청자의 지역 및 당해 한도에 따라 최대 100% 무상 시공까지 가능합니다.
                      </p>
                      <p>
                        * SY.com 한전 대행 수수료 무상 면제 프로모션 혜택이 적용되어 계량기 신설 비용이 최소화됩니다.
                      </p>
                    </div>

                    {/* Quick reservation direct form wrapper inside estimate tab */}
                    <div className="p-5 border border-slate-200 rounded-3xl space-y-3">
                      <h4 className="text-xs font-black text-slate-800">이 견적으로 바로 상담 및 보조금 예약 접수</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="이름 (예: 홍길동)"
                          value={formValues['name'] || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          id="input-calc-name"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="tel"
                          placeholder="연락처 (예: 010-1234-5678)"
                          value={formValues['phone'] || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          id="input-calc-phone"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={formValues['location'] || '서울'}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          id="select-calc-location"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                        >
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value as any)}
                          id="select-calc-purpose"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Commercial">{quoteConfig.purposeLabels?.Commercial || '아파트용 (급속/완속 추천)'}</option>
                          <option value="Residential">{quoteConfig.purposeLabels?.Residential || '가정용 홈 (7kW 추천)'}</option>
                          <option value="ParkingLot">{quoteConfig.purposeLabels?.ParkingLot || '상업시설 수익형 (급속 추천)'}</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleQuickSubmit}
                        id="btn-calc-quote-submit"
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        {quoteConfig.submitButton}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={!!addressSearchFieldId}
        onClose={() => setAddressSearchFieldId(null)}
        onSelectAddress={(data) => {
          if (addressSearchFieldId) {
            handleInputChange(addressSearchFieldId, data.fullAddress);
          }
          setAddressSearchFieldId(null);
        }}
        title="설치 희망지 주소 검색"
      />
    </div>
  );
}
