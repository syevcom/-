/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  User, 
  CalendarDays, 
  Sparkles, 
  Settings, 
  Menu, 
  X, 
  Youtube, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  BookOpen,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Headphones,
  ShieldCheck,
  FileText,
  Bell,
  Clock,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { User as UserType, ActivePage, HeaderConfig, MobileDesignConfig, DEFAULT_MOBILE_DESIGN_CONFIG } from '../types';
import { SearchModal } from './SearchModal';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';
import { useSecureAuth } from '../lib/secureAuthManager';

interface HeaderProps {
  user: UserType | null;
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  onOpenAuth: () => void;
  onOpenMyPage: () => void;
  onOpenQuote: () => void;
  onOpenQuoteWithPurpose?: (purpose: 'Commercial' | 'Residential' | 'ParkingLot') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenCms?: (tab?: 'brand' | 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support' | 'quote') => void;
  logoConfig?: {
    text: string;
    subtitle: string;
    imageUrl?: string;
    height?: number;
    showCompanyName?: boolean;
    companyNameText?: string;
    companyNameFont?: string;
    companyNameWeight?: string;
    companyNameSize?: string;
    companyNameColor?: string;
  };
  snsConfig?: {
    kakaoUrl: string;
    instagramUrl: string;
    blogUrl: string;
    youtubeUrl?: string;
    showFloatingSns: boolean;
  };
  footerConfig?: {
    phone: string;
    email: string;
  };
  selectedAptBrand?: string;
  onSelectAptBrand?: (brand: string) => void;
  selectedHomePower?: string;
  onSelectHomePower?: (power: string) => void;
  selectedHomeServiceType?: string;
  onSelectHomeServiceType?: (serviceType: string) => void;
  selectedParkingCapacity?: string;
  onSelectParkingCapacity?: (capacity: string) => void;
  categoryLabels?: {
    home: string;
    about: string;
    products: string;
    solutions: string;
    review: string;
    support: string;
    sol_residential?: string;
    sol_commercial?: string;
    sol_parking?: string;
  };
  headerConfig?: HeaderConfig;
  cartCount?: number;
  onOpenCartModal?: () => void;
  mobileDesignConfig?: MobileDesignConfig;
  onOpenMobileDesignCenter?: () => void;
  unreadNotificationCount?: number;
  onOpenNotificationCenter?: () => void;
}

export default function Header({
  user,
  activePage,
  onPageChange,
  onOpenAuth,
  onOpenMyPage,
  onOpenQuote,
  onOpenQuoteWithPurpose,
  isEditMode,
  onToggleEditMode,
  onOpenCms,
  logoConfig = { text: 'SY', subtitle: 'SY.com', showCompanyName: true, companyNameText: '(유)에스와이닷컴' },
  snsConfig = { kakaoUrl: 'https://pf.kakao.com/', instagramUrl: 'https://www.instagram.com/', blogUrl: 'https://section.blog.naver.com/', youtubeUrl: 'https://www.youtube.com/', showFloatingSns: true },
  footerConfig = { phone: '1588-SY01', email: 'sy.car.com@gmail.com' },
  selectedAptBrand = 'sk일렉링크',
  onSelectAptBrand,
  selectedHomePower = '7kW',
  onSelectHomePower,
  selectedHomeServiceType = '단말기 단품',
  onSelectHomeServiceType,
  selectedParkingCapacity = '50kW 급속',
  onSelectParkingCapacity,
  categoryLabels,
  headerConfig = {
    inquiryTitlePc: '⚡ 전기차충전기 설치문의',
    shortcutCommercialPc: '⚡ 아파트 · 공동주택',
    shortcutResidentialPc: '🏠 가정용 · 개인 홈',
    shortcutParkingPc: '🏢 상업시설 · 수익형',
    inquiryTitleMobile: '⚡ 전기차충전기 설치문의',
    shortcutCommercialMobile: '⚡ 아파트 · 공동주택',
    shortcutResidentialMobile: '🏠 가정용 · 개인 홈',
    shortcutParkingMobile: '🏢 상업시설 · 수익형',
    syncMobileWithPc: true
  },
  cartCount = 0,
  onOpenCartModal,
  mobileDesignConfig = DEFAULT_MOBILE_DESIGN_CONFIG,
  onOpenMobileDesignCenter,
  unreadNotificationCount = 0,
  onOpenNotificationCenter,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInquiryDropdownOpen, setIsInquiryDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isHomeSubmenuOpen, setIsHomeSubmenuOpen] = useState(false);
  const [extendToastMsg, setExtendToastMsg] = useState('');

  const { formattedTime, remainingSeconds, isExpiringSoon, extendSession } = useSecureAuth();

  const handleExtendSessionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = extendSession();
    if (ok) {
      setExtendToastMsg('세션 30분 연장 완료');
      setTimeout(() => setExtendToastMsg(''), 2500);
    }
  };

  const getMenuLabel = (id: ActivePage) => {
    switch (id) {
      case 'home': return categoryLabels?.home || '홈';
      case 'about': return categoryLabels?.about || '회사소개';
      case 'sol_commercial': {
        const val = categoryLabels?.sol_commercial || '아파트';
        return val.includes('충전기') ? val : `${val}충전기`;
      }
      case 'sol_residential': {
        const val = categoryLabels?.sol_residential || '가정용 홈';
        return val.includes('충전기') ? val : `${val} 충전기`;
      }
      case 'sol_parking': {
        const val = categoryLabels?.sol_parking || '상업시설 수익형';
        return val.includes('충전기') ? val : `${val} 충전기`;
      }
      case 'review': return categoryLabels?.review || '설치후기';
      default: return '';
    }
  };

  const menuItems: { id: ActivePage; label: string }[] = [
    { id: 'home', label: getMenuLabel('home') },
    { id: 'about', label: getMenuLabel('about') },
    { id: 'sol_commercial', label: getMenuLabel('sol_commercial') },
    { id: 'sol_residential', label: getMenuLabel('sol_residential') },
    { id: 'sol_parking', label: getMenuLabel('sol_parking') },
    { id: 'review', label: getMenuLabel('review') }
  ];

  const handleMenuClick = (pageId: ActivePage) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleInquirySelect = (purpose: 'Commercial' | 'Residential' | 'ParkingLot') => {
    if (onOpenQuoteWithPurpose) {
      onOpenQuoteWithPurpose(purpose);
    } else {
      onOpenQuote();
    }
    setIsInquiryDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/75 backdrop-blur-lg border-b border-slate-200/80 shadow-md shadow-slate-900/5">
      {/* Top Banner (Subtle, professional notification banner) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs sm:text-[13px] py-1.5 px-4 text-center font-bold tracking-tight flex justify-center items-center gap-2 border-b border-emerald-500/20 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
        <span className="truncate max-w-[90vw]">[공지] 2026년 하반기 전기차 충전기 국가 무상 보조금 한도 선착순 마감 임박! 지금 바로 견적 신청하세요.</span>
      </div>

      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-x-4 relative">
        
        {/* 1. Left side: Brand Logo Container (Sleek, responsive height) */}
        <div 
          onClick={() => handleMenuClick('home')}
          id="logo-container"
          className="flex flex-col items-start justify-center cursor-pointer group shrink-0 gap-0.5 text-left px-0"
        >
          {logoConfig.imageUrl ? (
            <img 
              src={getOptimizedImageUrl(logoConfig.imageUrl, { width: 400, format: 'webp' })} 
              alt={logoConfig.subtitle} 
              style={{ height: `${mobileDesignConfig?.headerMobileLogoHeight || logoConfig.height || 36}px` }}
              className="max-w-[200px] object-contain transition-transform group-hover:scale-103 shrink-0"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="font-black text-white text-base tracking-tighter">{logoConfig.text}</span>
            </div>
          )}
          
          <div className="flex flex-col leading-none items-start pl-0.5">
            {!logoConfig.imageUrl && (
              <span className="font-black text-xs sm:text-sm tracking-tight text-stone-900 whitespace-nowrap">
                {logoConfig.subtitle || 'SY.com'}
              </span>
            )}
            {logoConfig.showCompanyName && logoConfig.companyNameText && (
              <span className="tracking-tight whitespace-nowrap text-[8.5px] sm:text-[9.5px] text-stone-500 font-bold mt-0.5">
                {logoConfig.companyNameText}
              </span>
            )}
          </div>
        </div>

        {/* 2. Navigation Links (Clean, horizontal distribution like reference site) */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 max-w-2xl xl:max-w-3xl mx-2 lg:mx-4 shrink-0">
          {menuItems.map((item) => {
            const isActive = activePage === item.id || 
              (item.id === 'sol_residential' && activePage === 'solutions');
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-extrabold tracking-tight transition-all duration-150 cursor-pointer whitespace-nowrap relative rounded-lg ${
                  isActive
                    ? 'text-emerald-700 font-black bg-emerald-50/80 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2.5px] after:bg-emerald-600'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 3. Right side: Compact Installation Shortcuts + Utility Icons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 pl-3 border-l border-stone-200/80 ml-auto">

          {/* Compact Horizontal Installation Shortcuts */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-xs">
            {/* 1. 아파트 */}
            <button
              onClick={() => onOpenQuoteWithPurpose ? onOpenQuoteWithPurpose('Commercial') : onOpenQuote()}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs whitespace-nowrap hover:bg-yellow-400 hover:text-slate-950 ${
                activePage === 'sol_commercial' 
                  ? 'bg-emerald-600 text-white font-black' 
                  : 'bg-white text-slate-800 hover:bg-emerald-50'
              }`}
              title="아파트 · 공동주택 충전기 설치문의"
            >
              {headerConfig.shortcutCommercialPc?.split('·')[0] || '⚡ 아파트'}
            </button>

            {/* 2. 가정용 */}
            <button
              onClick={() => onOpenQuoteWithPurpose ? onOpenQuoteWithPurpose('Residential') : onOpenQuote()}
              className="px-2.5 py-1 bg-white hover:bg-yellow-400 text-slate-800 hover:text-slate-950 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="가정용 · 개인 홈 충전기 설치문의"
            >
              {headerConfig.shortcutResidentialPc?.split('·')[0] || '🏠 가정용'}
            </button>

            {/* 3. 상업시설 */}
            <button
              onClick={() => onOpenQuoteWithPurpose ? onOpenQuoteWithPurpose('ParkingLot') : onOpenQuote()}
              className="px-2.5 py-1 bg-white hover:bg-yellow-400 text-slate-800 hover:text-slate-950 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="상업시설 · 수익형 충전기 설치문의"
            >
              {headerConfig.shortcutParkingPc?.split('·')[0] || '🏢 상업시설'}
            </button>

            {/* 메인 설치문의 버튼 */}
            <button
              onClick={() => isEditMode ? onOpenCms?.('brand') : onOpenQuote()}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-xs whitespace-nowrap ml-0.5"
            >
              ⚡ 무료견적
            </button>
          </div>

          {/* User Profile / Cart / Admin Quick links */}
          <div className="flex items-center gap-1.5 pl-1.5 shrink-0">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="충전기 모델 / 용량 검색"
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 transition-all cursor-pointer border border-stone-200"
            >
              <Search className="w-3.5 h-3.5 text-stone-700" />
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={onOpenCartModal}
              title="관심 충전기 장바구니"
              className="relative p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 transition-all cursor-pointer border border-stone-200"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <button
                onClick={onOpenMyPage}
                title="마이페이지"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer shadow-2xs transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>마이페이지</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                title="로그인 / 회원가입"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shadow-2xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </button>
            )}

            {/* Admin control buttons: Visible ONLY when logged in as Admin or in Edit Mode */}
            {(user?.isAdmin || isEditMode) && (
              <div className="flex items-center gap-1.5">
                {/* Admin Session Timeout Countdown Badge */}
                {user?.isAdmin && remainingSeconds > 0 && (
                  <div 
                    className={`relative flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-extrabold transition-all shadow-xs ${
                      isExpiringSoon
                        ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                    title="관리자 보안 세션 만료 시간 (30분)"
                  >
                    <Clock className={`w-3 h-3 ${isExpiringSoon ? 'text-rose-600 animate-spin' : 'text-slate-500'}`} />
                    <span className="font-mono tracking-tight font-black">{formattedTime}</span>
                    <button
                      type="button"
                      onClick={handleExtendSessionClick}
                      className="ml-0.5 px-1.5 py-0.5 bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-300 rounded text-[9px] font-bold cursor-pointer transition-colors shadow-2xs"
                      title="세션 유효 시간 30분 연장"
                    >
                      연장
                    </button>
                    {extendToastMsg && (
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50 animate-bounce">
                        {extendToastMsg}
                      </span>
                    )}
                  </div>
                )}

                {/* Admin Notification Bell */}
                {onOpenNotificationCenter && (
                  <button
                    onClick={onOpenNotificationCenter}
                    className={`relative p-1.5 rounded-lg border transition-all cursor-pointer ${
                      unreadNotificationCount > 0
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm animate-pulse hover:bg-amber-300'
                        : 'bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-800 border-stone-200'
                    }`}
                    title={`실시간 예약 및 상담 신청 알림 (${unreadNotificationCount}건 미확인)`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-xs">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={onToggleEditMode}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isEditMode 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse' 
                      : 'bg-slate-700 hover:bg-slate-600 text-amber-300'
                  }`}
                  title={isEditMode ? "관리자 수정모드 (클릭시 비활성화)" : "실시간 편집모드 켜기"}
                >
                  <Settings className={`w-3 h-3 ${isEditMode ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => onPageChange('admin')}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg font-bold text-[10.5px] px-2 py-1 cursor-pointer transition-all shrink-0 shadow-xs flex items-center gap-0.5"
                  title="관리자 센터"
                >
                  <span>🔧 관리자</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 4. Mobile Hamburger Button & Search Button */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {/* Mobile Cart button */}
          <button
            onClick={onOpenCartModal}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
            title="장바구니"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Search button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
            title="충전기 검색"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
          </button>

          {/* Mobile Design Center Direct Button (Admins only) */}
          {(user?.isAdmin || isEditMode) && onOpenMobileDesignCenter && (
            <button
              onClick={onOpenMobileDesignCenter}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
              title="모바일 디자인센터 (크기 조절)"
            >
              <span className="text-sm">🎨</span>
            </button>
          )}

          {/* Mobile Notification Bell (Admins only) */}
          {(user?.isAdmin || isEditMode) && onOpenNotificationCenter && (
            <button
              onClick={onOpenNotificationCenter}
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform ${
                unreadNotificationCount > 0
                  ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-md animate-pulse'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title={`실시간 알림 (${unreadNotificationCount}건)`}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Toggle on Mobile (Visible ONLY when logged in as admin or isEditMode) */}
          {(user?.isAdmin || isEditMode) && (
            <button
              onClick={() => onPageChange('admin')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-amber-400 border border-slate-700 flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition-transform"
              title="관리자 센터"
            >
              <Settings className={`w-4 h-4 ${isEditMode ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}

          {/* High-Visibility Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-md ${
              mobileDesignConfig?.headerMobileMenuBtnSize === 'xl'
                ? 'w-13 h-11 px-2.5 rounded-2xl bg-slate-950 text-white border-2 border-emerald-400 ring-2 ring-emerald-500/20'
                : mobileDesignConfig?.headerMobileMenuBtnSize === 'lg'
                ? 'w-11 h-10 px-2 rounded-xl bg-slate-900 text-white border border-slate-700 ring-1 ring-slate-800'
                : mobileDesignConfig?.headerMobileMenuBtnSize === 'sm'
                ? 'w-9 h-9 rounded-lg bg-slate-900 text-white'
                : 'w-10 h-10 rounded-xl bg-slate-900 text-white border border-slate-700'
            }`}
            title="전체 메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <div className="flex items-center gap-1">
                <Menu className="w-5 h-5 text-white" />
                <span className="text-[11px] font-black tracking-tighter text-emerald-400 hidden sm:inline">메뉴</span>
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Sub-navigation bar for Brands (Only visible when 'sol_commercial' / Apartment Charger page is active) */}
      {activePage === 'sol_commercial' && (
        <div className="w-full bg-white/95 backdrop-blur-md border-t border-b border-slate-200/80 py-2 shadow-2xs">
          <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap py-0.5 flex-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">아파트 브랜드:</span>
              {[
                'sk일렉링크',
                '플러그링크',
                '이엘일렉트릭',
                '나이스차져',
                '에버온',
                '아이파킹',
                'LG유플러스볼트업'
              ].map((brand) => {
                const isSelected = selectedAptBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => {
                      onSelectAptBrand?.(brand);
                      setTimeout(() => {
                        const el = document.getElementById('apt-brand-section');
                        if (el) {
                          const yOffset = -120;
                          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 50);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20 scale-[1.02]'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            {/* Quick Charger Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="충전기 모델 / 용량 검색"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs shadow-yellow-400/20 shrink-0 hover:scale-103 active:scale-97 border border-yellow-300"
              id="btn-header-search"
            >
              <Search className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">🔍 충전기 검색</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation bar for Home Charger (Price Type & Power Capacities) */}
      {activePage === 'sol_residential' && (
        <div className="w-full bg-white/95 backdrop-blur-md border-t border-b border-slate-200/80 py-2 shadow-2xs">
          <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 overflow-x-auto scrollbar-none whitespace-nowrap flex-1">
              {/* Price Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">구분:</span>
                {[
                  { id: '단말기 단품', label: '📦 단말기 단품' },
                  { id: '교체 시공', label: '🛠️ 교체 시공' },
                  { id: '신규 설치 포함', label: '⚡ 설치 포함 (신규)' }
                ].map((st) => {
                  const isSelected = selectedHomeServiceType === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        if (activePage !== 'sol_residential') {
                          onPageChange('sol_residential');
                        }
                        onSelectHomeServiceType?.(st.id);
                        setTimeout(() => {
                          const el = document.getElementById('home-options-section');
                          if (el) {
                            const yOffset = -110;
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                          }
                        }, 60);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20 scale-[1.02]'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* Power Capacity Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap border-l border-slate-200 pl-3">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">용량:</span>
                {['5kW', '7kW', '11kW'].map((kw) => {
                  const isSelected = selectedHomePower === kw;
                  return (
                    <button
                      key={kw}
                      onClick={() => {
                        if (activePage !== 'sol_residential') {
                          onPageChange('sol_residential');
                        }
                        onSelectHomePower?.(kw);
                        setTimeout(() => {
                          const el = document.getElementById('home-options-section');
                          if (el) {
                            const yOffset = -110;
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                          }
                        }, 60);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/20 scale-[1.02]'
                          : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/60'
                      }`}
                    >
                      ⚡ {kw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Charger Search Button (Moved down 1 line as requested) */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="충전기 모델 / 용량 검색"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md shadow-yellow-400/20 shrink-0 hover:scale-103 active:scale-97 border border-yellow-300"
              id="btn-header-search"
            >
              <Search className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">🔍 충전기 검색</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation bar for ParkingLot (Only visible when 'sol_parking' is active) */}
      {activePage === 'sol_parking' && (
        <div className="w-full bg-white/95 backdrop-blur-md border-t border-b border-slate-200/80 py-2 shadow-2xs">
          <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none whitespace-nowrap flex-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">구분:</span>
              {[
                '공용 BIZ 충전기'
              ].map((cap) => {
                const isSelected = selectedParkingCapacity === cap;
                return (
                  <button
                    key={cap}
                    onClick={() => onSelectParkingCapacity?.(cap)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20 scale-[1.02]'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    🏢 {cap}
                  </button>
                );
              })}
            </div>

            {/* Quick Charger Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="충전기 모델 / 용량 검색"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs shadow-amber-500/20 shrink-0 hover:scale-103 active:scale-97 border border-amber-400"
              id="btn-header-search"
            >
              <Search className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">🔍 충전기 검색</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-bar for Home, About, Review */}
      {(activePage === 'home' || activePage === 'about' || activePage === 'review') && (
        <div className="w-full bg-white/95 backdrop-blur-md border-t border-b border-slate-200/80 py-2 shadow-2xs">
          <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200/80 font-bold">원스톱 서비스</span>
              <span className="hidden sm:inline text-slate-600">전국 최대 네트워크! 원하는 전기차 충전기 모델과 용량을 원클릭으로 검색해보세요.</span>
            </div>

            {/* Quick Charger Search Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              title="충전기 모델 / 용량 검색"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs shadow-yellow-400/20 shrink-0 hover:scale-103 active:scale-97 border border-yellow-300"
              id="btn-header-search"
            >
              <Search className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">🔍 충전기 검색</span>
            </button>
          </div>
        </div>
      )}
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPageChange={onPageChange}
        onSelectHomePower={onSelectHomePower}
        onSelectParkingCapacity={onSelectParkingCapacity}
        onOpenQuoteWithPurpose={onOpenQuoteWithPurpose}
      />
    </header>

    {/* 5. Mobile Drawer Overlay Menu (Right Side Drawer Layout - Full Viewport) */}
    {isMobileMenuOpen && (
      <div 
        id="mobile-drawer-menu"
        className="md:hidden fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex justify-end"
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, width: '100vw', height: '100dvh' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div 
          className="bg-white w-[300px] sm:w-[340px] max-w-[86vw] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 relative z-[1000000] border-l border-slate-200"
          style={{ height: '100dvh', maxHeight: '100dvh' }}
        >
          {/* Top Area (Scrollable body) */}
          <div className="flex-1 overflow-y-auto">
            {/* Top Auth & Action Bar */}
            <div className="p-4 pt-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                {user ? (
                  <div className="text-xs font-black text-slate-900 truncate max-w-[120px]">
                    {user.name || user.email?.split('@')[0]} 님
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-500">
                    로그인하세요.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenMyPage();
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      MY쇼핑
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="px-2 py-1 text-[11px] font-bold border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      회원가입
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer ml-1"
                  title="메뉴 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Icon row */}
            <div className="px-4 py-2.5 flex justify-end border-b border-slate-100 bg-white">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="text-slate-700 hover:text-emerald-700 p-1 flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                title="충전기 검색"
              >
                <span>충전기 모델 검색</span>
                <Search className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* 4 Quick Icons Grid (주문조회, MY쇼핑, 1:1문의, 장바구니) */}
            <div className="grid grid-cols-4 py-3.5 px-2 border-b border-slate-200 text-center bg-slate-50/70">
              {/* 주문조회 */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMyPage();
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-1 cursor-pointer group"
              >
                <Truck className="w-5 h-5 text-slate-600 group-hover:text-emerald-700 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">주문조회</span>
              </button>

              {/* MY쇼핑 */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMyPage();
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-1 cursor-pointer group"
              >
                <User className="w-5 h-5 text-slate-600 group-hover:text-emerald-700 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">MY쇼핑</span>
              </button>

              {/* 1:1문의 */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-1 cursor-pointer group"
              >
                <Headphones className="w-5 h-5 text-slate-600 group-hover:text-emerald-700 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">1:1문의</span>
              </button>

              {/* 장바구니 */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCartModal();
                }}
                className="relative flex flex-col items-center justify-center gap-1.5 py-1 cursor-pointer group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-emerald-700 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">장바구니</span>
              </button>
            </div>

            {/* Vertical Navigation Items (Accordion & Direct Navigation) */}
            <div className="px-5 py-4 space-y-4">
              {/* 브랜드소개 */}
              <div>
                <button
                  onClick={() => handleMenuClick('about')}
                  className={`w-full text-left font-extrabold text-[14px] transition-colors cursor-pointer py-1 ${
                    activePage === 'about' ? 'text-emerald-700 font-black' : 'text-slate-800 hover:text-emerald-700'
                  }`}
                >
                  브랜드소개
                </button>
              </div>

              {/* 홈 충전기 (Accordion) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <button
                    onClick={() => handleMenuClick('sol_residential')}
                    className={`font-extrabold text-[14px] text-left transition-colors cursor-pointer ${
                      activePage === 'sol_residential' ? 'text-emerald-700 font-black' : 'text-slate-800 hover:text-emerald-700'
                    }`}
                  >
                    홈 충전기
                  </button>
                  <button
                    onClick={() => setIsHomeSubmenuOpen(!isHomeSubmenuOpen)}
                    className="p-1 text-slate-500 hover:text-emerald-600 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHomeSubmenuOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                </div>
                {isHomeSubmenuOpen && (
                  <div className="pl-3 space-y-2 border-l-2 border-emerald-500/30 text-xs font-semibold text-slate-600 animate-in fade-in duration-200">
                    <button
                      onClick={() => {
                        onPageChange('sol_residential');
                        onSelectHomeServiceType?.('단말기 단품');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-1 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      • 단말기 단품 (5kW / 7kW / 11kW)
                    </button>
                    <button
                      onClick={() => {
                        onPageChange('sol_residential');
                        onSelectHomeServiceType?.('교체 시공');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-1 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      • 교체 시공
                    </button>
                    <button
                      onClick={() => {
                        onPageChange('sol_residential');
                        onSelectHomeServiceType?.('신규 설치 포함');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-1 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      • 신규 설치 포함 (완속)
                    </button>
                  </div>
                )}
              </div>

              {/* 아파트 충전기 */}
              <div>
                <button
                  onClick={() => handleMenuClick('sol_commercial')}
                  className={`w-full text-left font-extrabold text-[14px] transition-colors cursor-pointer py-1 ${
                    activePage === 'sol_commercial' ? 'text-emerald-700 font-black' : 'text-slate-800 hover:text-emerald-700'
                  }`}
                >
                  아파트 충전기
                </button>
              </div>

              {/* 상업시설 충전기 */}
              <div>
                <button
                  onClick={() => handleMenuClick('sol_parking')}
                  className={`w-full text-left font-extrabold text-[14px] transition-colors cursor-pointer py-1 ${
                    activePage === 'sol_parking' ? 'text-emerald-700 font-black' : 'text-slate-800 hover:text-emerald-700'
                  }`}
                >
                  상업시설 충전기
                </button>
              </div>

              {/* 설치후기 */}
              <div>
                <button
                  onClick={() => handleMenuClick('review')}
                  className={`w-full text-left font-extrabold text-[14px] transition-colors cursor-pointer py-1 ${
                    activePage === 'review' ? 'text-emerald-700 font-black' : 'text-slate-800 hover:text-emerald-700'
                  }`}
                >
                  설치후기
                </button>
              </div>

              {/* 충전기문의 */}
              <div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full text-left font-extrabold text-[14px] text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer py-1 flex items-center justify-between"
                >
                  <span>충전기문의</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">무료 견적</span>
                </button>
              </div>
            </div>

            {/* Mobile Design Center & Admin Quick Links (Visible ONLY to Admin / Edit Mode) */}
            {(user?.isAdmin || isEditMode) && (
              <div className="px-5 pt-2 pb-4 space-y-2 border-t border-slate-100">
                {/* Admin Session Security Box */}
                {user?.isAdmin && remainingSeconds > 0 && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between shadow-2xs ${
                    isExpiringSoon ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-rose-600 animate-spin' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold">관리자 세션 만료 시간</div>
                        <div className="text-xs font-mono font-black">{formattedTime} 남음</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExtendSessionClick}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-transform"
                    >
                      30분 연장
                    </button>
                  </div>
                )}

                {onOpenMobileDesignCenter && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMobileDesignCenter();
                    }}
                    className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🎨 모바일 디자인 센터</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onToggleEditMode}
                    className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    {isEditMode ? '✏️ 편집 끄기' : '✏️ 실시간 편집'}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onPageChange('admin');
                    }}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    🔧 관리자
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom CS CENTER Box */}
          <div className="p-5 border-t border-slate-200 bg-white shrink-0">
            <div className="text-[11px] font-extrabold text-slate-800 tracking-wider">CS CENTER</div>
            <a 
              href={`tel:${footerConfig.phone.split(' ')[0] || '1644-7595'}`}
              className="block text-2xl font-black text-slate-900 tracking-tight my-1 hover:text-emerald-700 transition-colors"
            >
              {footerConfig.phone.split(' ')[0] || '1644-7595'}
            </a>
            <div className="text-[10px] text-slate-400 font-medium space-y-0.5 leading-tight mb-3.5">
              <div>MON-FRI : AM 09:00 ~ PM 06:00</div>
              <div>LUNCH : PM 12:00 ~ PM 01:00</div>
              <div>SAT, SUN, HOLIDAY OFF</div>
            </div>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-2.5 bg-[#374151] hover:bg-[#1f2937] text-white text-xs font-bold rounded-lg text-center shadow-xs cursor-pointer transition-colors"
            >
              고객센터
            </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
}
