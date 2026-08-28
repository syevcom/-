import React, { useState, useEffect, useMemo } from 'react';
import { X, ExternalLink, Award, FileText, CheckCircle2 } from 'lucide-react';
import { PRODUCTS, SPEEL_11KW_REPRESENTATIVE_IMAGE, SPEEL_5KW_REPRESENTATIVE_IMAGE } from '../data';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';

export interface HomePopupConfig {
  enabled: boolean;
  title: string;
  badgeText: string;
  mainText: string;
  subText: string;
  buttonText: string;
  naverFormUrl: string;
  imageUrl: string;
  tab1Label: string;
  tab1Url: string;
  tab2Label: string;
  tab2Url: string;
  tab3Label: string;
  tab3Url: string;
  noticeText: string;
}

export const DEFAULT_HOME_POPUP_CONFIG: HomePopupConfig = {
  enabled: true,
  title: '품질보증서',
  badgeText: '★ 4년 무상 보증 ★ SE Charger',
  mainText: '스필일렉트릭 구매 및 설치후 꼭 정품보증서를 발급받으세요',
  subText: '무상4년 A/S를 위해 꼭 받아두세요',
  buttonText: '보증서 발급받기',
  naverFormUrl: 'https://form.naver.com/', // 네이버폼 연결 URL (관리자페이지에서 변경 가능)
  imageUrl: '/스필.png',
  tab1Label: '',
  tab1Url: '',
  tab2Label: '정품등록',
  tab2Url: '',
  tab3Label: '',
  tab3Url: '',
  noticeText: '1. 본 제품의 보증 기간은 구입일로부터 4년입니다.\n2. 보증 기간 내에 부품이나 제조상의 결함이 있을 경우에는 무상으로 수리 또는 교체하여 드립니다.\n3. 이 보증서는 국내(대한민국)에서만 유효합니다.\n4. 무상 보증기간 이내라 하더라도 사용자 과실 시 유상 처리됩니다.'
};

interface HomePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: HomePopupConfig;
  onOpenQuoteModal?: () => void;
}

export const HomePopupModal: React.FC<HomePopupModalProps> = ({
  isOpen,
  onClose,
  config = DEFAULT_HOME_POPUP_CONFIG,
  onOpenQuoteModal
}) => {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab2');

  // 가정용 홈 충전기에 등록된 스필 메인 이미지와 100% 동일하게 동기화
  const displayImageUrl = useMemo(() => {
    if (config.imageUrl && config.imageUrl.trim() && config.imageUrl !== '/스필.png') {
      return config.imageUrl.trim();
    }
    try {
      const saved = localStorage.getItem('sy_cms_products_v12');
      if (saved) {
        const parsed = JSON.parse(saved);
        const matched = parsed.find((p: any) => 
          (p.id && (p.id === 'sy-ac07' || p.id === 'sy-ac05' || p.id === 'sy-ac11-bi' || p.id === 'res-7kw-spil' || p.id === 'res-5kw-spil' || p.id === 'res-11kw-spil')) ||
          (p.name && p.name.includes('스필'))
        );
        if (matched?.image && matched.image.trim()) {
          return matched.image.trim();
        }
      }
    } catch (e) {}

    const defaultSpeel = PRODUCTS.find(p => p.id === 'sy-ac07' || p.id === 'sy-ac05' || p.brand === '스필');
    if (defaultSpeel?.image && defaultSpeel.image.trim()) {
      return defaultSpeel.image.trim();
    }
    return config.imageUrl || '/스필.png';
  }, [config.imageUrl]);

  if (!isOpen) return null;

  const handleDontShowToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      localStorage.setItem('sy_popup_hide_date', todayStr);
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handleCtaClick = () => {
    if (config.naverFormUrl && config.naverFormUrl.trim()) {
      window.open(config.naverFormUrl.trim(), '_blank', 'noopener,noreferrer');
    } else {
      alert('연결된 네이버폼 URL이 없습니다. 관리자 설정에서 URL을 입력해 주세요.');
    }
  };

  const handleTabClick = (tabKey: 'tab1' | 'tab2' | 'tab3', url?: string) => {
    setActiveTab(tabKey);
    if (url && url.trim()) {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    } else if (tabKey === 'tab1' && onOpenQuoteModal) {
      onOpenQuoteModal();
    }
  };

  const availableTabs = [
    { id: 'tab1' as const, label: config.tab1Label, url: config.tab1Url },
    { id: 'tab2' as const, label: config.tab2Label, url: config.tab2Url },
    { id: 'tab3' as const, label: config.tab3Label, url: config.tab3Url }
  ].filter(t => t.label && t.label.trim() !== '' && t.label !== '포토리뷰이벤트' && t.label !== '상담시간연장');

  return (
    <div 
      className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-50 w-[320px] sm:w-[350px] max-w-[calc(100vw-24px)] animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans"
    >
      <div 
        className="relative w-full bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-amber-500/40 flex flex-col max-h-[88vh] ring-1 ring-amber-500/20 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-md border border-slate-700 cursor-pointer"
          title="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Banner Body */}
        <div className="relative overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 p-4 text-center">
          
          {/* Top Gold Badge */}
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-md border border-amber-200/60 mb-2 tracking-tight">
            <Award className="w-3.5 h-3.5 mr-1 text-slate-950 fill-amber-900" />
            {config.badgeText || '★ 4년 무상 보증 ★ SE Charger'}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight mb-3 drop-shadow-sm">
            {config.title || '품질보증서'}
          </h2>

          {/* Product Graphic + Card Wrapper */}
          <div className="relative my-2 bg-slate-800/90 rounded-xl p-3.5 text-slate-100 shadow-xl border border-amber-500/30 backdrop-blur-md">
            
            {/* Enlarged Charger Image / Graphic */}
            <div className="flex justify-center mb-3">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-slate-950 rounded-xl overflow-hidden border border-amber-500/30 shadow-inner flex items-center justify-center p-2 group">
                <img
                  src={getOptimizedImageUrl(encodeURI(displayImageUrl || config.imageUrl || '/스필.png'), { width: 350, format: 'webp' })}
                  alt="품질보증서 대상 충전기"
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== SPEEL_5KW_REPRESENTATIVE_IMAGE) {
                      target.src = SPEEL_5KW_REPRESENTATIVE_IMAGE;
                    }
                  }}
                />
                <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                  4년 무상 A/S
                </div>
              </div>
            </div>

            {/* Headline Banner Text */}
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug break-keep mb-1">
              {config.mainText || '스필일렉트릭 구매 및 설치후 꼭 정품보증서를 발급받으세요'}
            </h3>
            
            <p className="text-xs font-bold text-amber-400 mb-3.5">
              {config.subText || '무상4년 A/S를 위해 꼭 받아두세요'}
            </p>

            {/* Prominent Gold CTA Button */}
            <button
              onClick={handleCtaClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-lg shadow-amber-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 border border-amber-200/50 cursor-pointer"
            >
              <span>{config.buttonText || '보증서 발급받기'}</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          {/* Notice / Terms */}
          <div className="mt-3 text-left bg-slate-950/80 rounded-xl p-3 text-[10px] text-slate-300 leading-relaxed border border-slate-700/60 whitespace-pre-line max-h-24 overflow-y-auto custom-scrollbar">
            <div className="font-bold text-amber-400 mb-1 flex items-center text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-amber-400" />
              보증 서비스 안내
            </div>
            {config.noticeText}
          </div>
        </div>

        {/* Bottom Tabs (Only rendered if available) */}
        {availableTabs.length > 0 && (
          <div className={`grid grid-cols-${availableTabs.length} bg-slate-800 border-t border-slate-700`}>
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.url)}
                className={`py-2 px-1 text-xs font-bold transition-colors border-r border-slate-700 last:border-r-0 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-amber-500 text-slate-950 font-extrabold' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Bar (Dont show today / Close) */}
        <div className="flex items-center justify-between bg-slate-950 text-slate-400 text-[11px] px-3.5 py-2 font-bold border-t border-slate-800">
          <button
            onClick={handleDontShowToday}
            className="hover:text-amber-300 transition-colors cursor-pointer flex items-center py-0.5 text-[11px]"
          >
            <span>오늘 하루 보이지 않음</span>
          </button>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 text-[11px] border border-slate-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePopupModal;
