/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainHero from './components/MainHero';
import AboutSection from './components/AboutSection';
import ProductsSection from './components/ProductsSection';
import SolutionsSection from './components/SolutionsSection';
import ReviewSection from './components/ReviewSection';
import SupportSection from './components/SupportSection';
import AuthModal from './components/AuthModal';
import QuoteModal from './components/QuoteModal';
import ConsultationSuccessModal, { ConsultationSuccessData } from './components/ConsultationSuccessModal';
import MyPageModal from './components/MyPageModal';
import CmsEditorModal from './components/CmsEditorModal';
import AdminLoginModal from './components/AdminLoginModal';
import CartModal from './components/CartModal';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import PaymentModal from './components/PaymentModal';
import PrintEstimateModal from './components/PrintEstimateModal';
import { MyProfilePage } from './components/MyProfilePage';
import AIChatBot from './components/AIChatBot';
import HomePopupModal, { HomePopupConfig, DEFAULT_HOME_POPUP_CONFIG } from './components/HomePopupModal';
import { AdminPage } from './components/AdminPage';
import LegalTermsModal, { LegalTabType } from './components/LegalTermsModal';
import { MobileDesignCenterModal } from './components/MobileDesignCenterModal';
import { AdminNotificationCenter } from './components/AdminNotificationCenter';
import { AdminLoginAlertToast } from './components/AdminLoginAlertToast';
import { BRAND_METADATA, HOME_PRODUCTS_DATA, PARKING_PRODUCTS_DATA } from './components/SolutionsSection';
import { setupFirebaseStorageSync, loadFromFirestore } from './lib/firebase';
import { recordVisitorHit, initExternalAnalytics } from './lib/visitorAnalytics';
import { secureAuthManager, useSecureAuth } from './lib/secureAuthManager';

import { PRODUCTS, SOLUTIONS, REVIEWS, FAQS, NOTICES, LOTTE_EVSIS_OPTION_GROUPS, ELECTREE_OPTION_GROUPS, CHARGEGO_OPTION_GROUPS, COOLCHARGE_OPTION_GROUPS, DEFAULT_RESIDENTIAL_OPTION_GROUPS, PUBLIC_CHARGER_OPTION_GROUPS } from './data';
import { ActivePage, User, Booking, ASRequest, Product, Solution, Review, FAQ, HeaderConfig, CartItem, MobileDesignConfig, DEFAULT_MOBILE_DESIGN_CONFIG, AdminNotification } from './types';
import { CalendarDays, ShieldCheck, Heart, Sparkles, Phone, HelpCircle, Landmark, Instagram, Youtube, ChevronUp, ChevronDown, MessageSquare, ChevronRight, Sliders, Smartphone, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const DEFAULT_FIELDS = {
  Residential: [
    { id: 'name', label: '신청인 이름 / 법인 담당자', type: 'text', placeholder: '홍길동', required: true },
    { id: 'phone', label: '연락처 (휴대폰 번호)', type: 'tel', placeholder: '010-1234-5678', required: true },
    { id: 'location', label: '설치 희망 주소', type: 'address', placeholder: '설치 주소를 검색하거나 입력해 주세요.', required: true },
    { id: 'residenceType', label: '주거 형태', type: 'select', required: true, options: ['아파트(공용)', '아파트(개인)', '단독주택', '빌라/연립', '기타'] },
    { id: 'memo', label: '상담 희망 메모 (선택사항)', type: 'text', placeholder: '기타 상세한 요구 사항을 적어주세요.', required: false }
  ],
  Commercial: [
    { id: 'companyName', label: '아파트명 (건물명)', type: 'text', placeholder: '예: 에스와이 1차 아파트', required: true },
    { id: 'location', label: '설치희망주소', type: 'address', placeholder: '설치지 상세 주소를 입력 또는 검색해 주세요.', required: true },
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
    { id: 'location', label: '설치희망주소', type: 'address', placeholder: '설치 주소를 검색하거나 입력해 주세요.', required: true },
    { id: 'parkingCount', label: '보유주차면수', type: 'text', placeholder: '예: 50면', required: true },
    { id: 'quantity', label: '설치 희망 수량 (대)', type: 'number', placeholder: '예: 10', required: true },
    { id: 'operatingType', label: '주차장 운영 방식', type: 'select', required: true, options: ['유료 주차장', '무료 주차장', '일부 유료/혼합', '기타'] },
    { id: 'memo', label: '추가 상담 사항 (선택사항)', type: 'text', placeholder: '희망하는 운영 방식이나 질문을 기재해 주세요.', required: false }
  ]
};

const REMOVED_PRODUCT_IDS = new Set([
  'park-11kw-spil',
  'res-7kw-chargego',
  'res-7kw-convenient',
  'res-7kw-safe',
  'res-7kw-hyundai',
  'res-7kw-pylon',
  'res-5kw-convenient',
  'res-5kw-safe',
  'sy-canopy-01',
  'sy-stand-01',
  'res-5kw-evsis',
  'sy-home07',
  'res-7kw-evsis',
  'res-11kw-evsis',
  'sy-ac11',
  'park-11kw-convenient',
  'sy-fc200'
]);

export default function App() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [user, setUser] = useState<User | null>(() => {
    // Purge any insecure legacy credentials or stored sessions on boot
    try {
      localStorage.removeItem('sy_saved_login_password');
      localStorage.removeItem('sy_logged_user');
      localStorage.removeItem('sy_user');
      sessionStorage.removeItem('sy_logged_user');
      sessionStorage.removeItem('sy_user');
    } catch (e) {
      console.error(e);
    }
    return secureAuthManager.getUser();
  });
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);

  // Sync with Firestore on initial boot in the background and bind secure auth listener
  useEffect(() => {
    async function initFirebaseSync() {
      try {
        // Setup interception of localStorage writes
        setupFirebaseStorageSync();
        // Read existing values from Firestore in background
        await loadFromFirestore();
      } catch (err) {
        console.error('Failed to initialize Firebase Sync:', err);
      }
    }
    initFirebaseSync();

    // Subscribe to secure in-memory auth manager state
    const unsubscribeAuth = secureAuthManager.subscribeAuth((updatedUser) => {
      setUser(updatedUser);
    });

    // Listen for admin session expiration event
    const handleSessionExpired = () => {
      setUser(null);
      setIsEditMode(false);
      setShowLoginAlertToast(false);
      setIsSessionExpiredModalOpen(true);
      setActivePage((prev) => (prev === 'admin' ? 'home' : prev));
    };

    window.addEventListener('sy_admin_session_expired', handleSessionExpired);

    // Check OAuth callbacks on mount
    const hasHashAccessToken = window.location.hash.includes('access_token=');
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.get('code');
    const isGooglePending = sessionStorage.getItem('google_auth_pending');

    if (hasHashAccessToken && isGooglePending) {
      sessionStorage.removeItem('google_auth_pending');
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(data => {
            const loggedInUser: User = {
              id: `usr-google-${data.sub || Date.now()}`,
              email: data.email || '',
              name: data.name || data.given_name || (data.email ? data.email.split('@')[0] : '구글 사용자'),
              profileImage: data.picture || '',
              type: 'B2C'
            };
            handleLogin(loggedInUser);
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch(err => console.error('Google userinfo fetch failed:', err));
      }
    } else if (hasHashAccessToken || hasCode) {
      const initNaverLogin = () => {
        if ((window as any).naver && (window as any).naver.LoginWithNaverId) {
          try {
            const naverLogin = new (window as any).naver.LoginWithNaverId({
              clientId: '70CVfYxs3pmZjg_kATOJ',
              callbackUrl: window.location.origin.replace(/\/$/, ''),
              isPopup: false,
              callbackHandle: true
            });
            naverLogin.init();
            naverLogin.getLoginStatus((status: boolean) => {
              if (status && naverLogin.user) {
                sessionStorage.removeItem('naver_auth_pending');
                const realEmail = naverLogin.user.getEmail() || naverLogin.user.email || 'sy.car.com@naver.com';
                const realName = naverLogin.user.getName() || naverLogin.user.name || naverLogin.user.nickname || realEmail.split('@')[0];
                const profileImg = naverLogin.user.getProfileImage() || naverLogin.user.profile_image || '';

                const loggedInUser: User = {
                  id: `usr-naver-${naverLogin.user.id || Date.now()}`,
                  email: realEmail,
                  name: realName,
                  profileImage: profileImg,
                  type: 'B2C'
                };
                handleLogin(loggedInUser);
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            });
          } catch (err) {
            console.error('Naver Login status error:', err);
          }
        }
      };

      if ((window as any).naver) {
        initNaverLogin();
      } else {
        window.addEventListener('load', initNaverLogin);
      }
    }

    return () => {
      unsubscribeAuth();
      window.removeEventListener('sy_admin_session_expired', handleSessionExpired);
    };
  }, []);

  // Modal Open States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentItems, setPaymentItems] = useState<CartItem[]>([]);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType>('refund');

  const handleOpenLegalModal = (tab: LegalTabType = 'refund') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const sanitizePopupConfig = (cfg: HomePopupConfig): HomePopupConfig => {
    const cleaned = { ...cfg };
    if (cleaned.tab1Label === '포토리뷰이벤트') cleaned.tab1Label = '';
    if (cleaned.tab3Label === '상담시간연장') cleaned.tab3Label = '';
    return cleaned;
  };

  // Home Popup Config & State
  const [homePopupConfig, setHomePopupConfig] = useState<HomePopupConfig>(() => {
    try {
      const saved = localStorage.getItem('sy_home_popup_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = sanitizePopupConfig(parsed);
        localStorage.setItem('sy_home_popup_config', JSON.stringify(cleaned));
        return cleaned;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_HOME_POPUP_CONFIG;
  });
  const [isHomePopupOpen, setIsHomePopupOpen] = useState(false);

  // Auto-open Home Popup on homepage mount if enabled and not hidden for today
  useEffect(() => {
    if (activePage === 'home' && homePopupConfig.enabled) {
      const todayStr = new Date().toISOString().split('T')[0];
      const hiddenDate = localStorage.getItem('sy_popup_hide_date');
      if (hiddenDate !== todayStr) {
        const timer = setTimeout(() => {
          setIsHomePopupOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activePage, homePopupConfig.enabled]);

  const handleSaveHomePopupConfig = (newConfig: HomePopupConfig) => {
    setHomePopupConfig(newConfig);
    try {
      localStorage.setItem('sy_home_popup_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreviewPopup = (configToPreview?: HomePopupConfig) => {
    if (configToPreview) {
      handleSaveHomePopupConfig(configToPreview);
    }
    localStorage.removeItem('sy_popup_hide_date');
    setIsHomePopupOpen(true);
  };
  
  // Cart items state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartToastMsg, setCartToastMsg] = useState<string>('');

  // Print Estimate Document Modal state
  const [isPrintEstimateOpen, setIsPrintEstimateOpen] = useState(false);
  const [printEstimateItems, setPrintEstimateItems] = useState<CartItem[]>([]);

  const handleOpenPrintEstimate = (items: CartItem[]) => {
    setPrintEstimateItems(items.length > 0 ? items : cartItems);
    setIsPrintEstimateOpen(true);
  };
  
  // Custom default purpose for Quote Modal
  const [quoteDefaultPurpose, setQuoteDefaultPurpose] = useState<'Commercial' | 'Residential' | 'ParkingLot'>('Residential');

  // Consultation Success Celebratory Modal state
  const [isConsultationSuccessOpen, setIsConsultationSuccessOpen] = useState(false);
  const [consultationSuccessData, setConsultationSuccessData] = useState<ConsultationSuccessData | null>(null);

  // Bookings and A/S records stored persistently in localStorage
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [asRequests, setAsRequests] = useState<ASRequest[]>([]);

  // Admin Real-Time Notifications State (Bookings & Consultations)
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    try {
      const saved = localStorage.getItem('sy_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
    return [];
  });
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isNotificationBannerDismissed, setIsNotificationBannerDismissed] = useState(false);
  const [showLoginAlertToast, setShowLoginAlertToast] = useState(false);

  // CMS Live Editor states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [cmsTab, setCmsTab] = useState<'brand' | 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support' | 'quote'>('brand');
  const [selectedAptBrand, setSelectedAptBrand] = useState<string>('sk일렉링크');
  const [selectedHomePower, setSelectedHomePower] = useState<string>('7kW');
  const [selectedHomeServiceType, setSelectedHomeServiceType] = useState<string>('단말기 단품');
  const [selectedParkingCapacity, setSelectedParkingCapacity] = useState<string>('공용 BIZ 충전기');

  // Brand Logo & Categories config state
  const [logoConfig, setLogoConfig] = useState({
    text: 'SY',
    subtitle: 'SY.com',
    imageUrl: '',
    height: 44,
    showCompanyName: true,
    companyNameText: '(유)에스와이닷컴',
    companyNameFont: 'noto',
    companyNameWeight: 'extrabold',
    companyNameSize: 'sm',
    companyNameColor: 'slate-700'
  });

  const [categoryLabels, setCategoryLabels] = useState({
    home: '홈',
    about: '회사소개',
    products: '가정용',
    solutions: '아파트',
    review: '설치후기',
    support: '상업시설',
    sol_commercial: '아파트',
    sol_residential: '가정용 홈',
    sol_parking: '상업시설 수익형'
  });

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    inquiryTitlePc: '⚡ 전기차충전기 설치문의',
    shortcutCommercialPc: '⚡ 아파트 · 공동주택',
    shortcutResidentialPc: '🏠 가정용 · 개인 홈',
    shortcutParkingPc: '🏢 상업시설 · 수익형',
    inquiryTitleMobile: '⚡ 전기차충전기 설치문의',
    shortcutCommercialMobile: '⚡ 아파트 · 공동주택',
    shortcutResidentialMobile: '🏠 가정용 · 개인 홈',
    shortcutParkingMobile: '🏢 상업시설 · 수익형',
    syncMobileWithPc: true
  });

  const [footerConfig, setFooterConfig] = useState({
    phone: '1588-SY01 (A/S 정비 전담 지원)',
    email: 'sy.car.com@gmail.com',
    companyName: '(유)에스와이닷컴',
    ceoName: '박우혁',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 OOO 타워 SY빌딩',
    teleSalesNumber: '제 2026-서울강남-1234호',
    licenseInfo: '모든 전기공사는 국가 정식 전기공사업 면허(제 OO-12345호) 보유 유자격 전담 시공팀이 직접 배정되어 법을 준수합니다.'
  });

  const [brands, setBrands] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('sy_cms_brands');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return BRAND_METADATA;
  });

  const handleSaveBrands = (newBrands: Record<string, any>) => {
    setBrands(newBrands);
    localStorage.setItem('sy_cms_brands', JSON.stringify(newBrands));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const [heroConfig, setHeroConfig] = useState(() => {
    const savedHero = localStorage.getItem('sy_cms_hero');
    if (savedHero) {
      try {
        return JSON.parse(savedHero);
      } catch (e) {
        console.error('Error parsing sy_cms_hero from localStorage:', e);
      }
    }
    return {
      badge: '전국 최대 원스톱 설치 네트워크',
      title: '대한민국 어디든,<br />전기차가 멈추는 곳엔 <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">SY.com</span>',
      description: '전국 최대 전력 인프라망을 바탕으로 완벽 설계, 까다로운 지자체 정부 무상 보조금 신청 대행, 한전 계량기 수급 및 사후 24시간 철저 정비 관리까지 원스톱으로 명쾌하게 해결하세요.',
      ctaButton: '👉 30초 만에 무료 설치 상담 예약하기',
      calcButton: '1분 스마트 보조금 견적 내기',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      height: 750,
      paddingTop: 120,
      paddingBottom: 120,
      showHeroImage: true,
      titleSize: 'large' as 'small' | 'medium' | 'large' | 'xlarge',
      descriptionSize: 'medium' as 'small' | 'medium' | 'large',
      liveCountStart: 14520,
      liveCountLabel: '현재 전국 SY.com 충전기 설치 현황',
      liveCountSuffix: '대 돌파',
      solutionBlueSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge',
      commercialBlueText: '회사 사옥, 물류창고, 공장, 관공서 전용',
      residentialBlueText: '단독주택, 빌라, 아파트(개인/공용) 전용',
      parkingBlueText: '대형 마트, 호텔, 빌딩, 공영주차장 맞춤',
      quickContact1: '환경부지원 아파트 무상설치 문의 ⚡',
      quickContact2: '가정용 · 홈 충전기 설치문의 🏠',
      quickContact3: '상업시설 · 수익형 충전기 설치문의 🏢'
    };
  });

  // Mobile Design Center Config State (User Self-Service for Mobile UI)
  const [mobileDesignConfig, setMobileDesignConfig] = useState<MobileDesignConfig>(() => {
    const saved = localStorage.getItem('sy_mobile_design_config_v1');
    if (saved) {
      try {
        return { ...DEFAULT_MOBILE_DESIGN_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing sy_mobile_design_config_v1:', e);
      }
    }
    return DEFAULT_MOBILE_DESIGN_CONFIG;
  });

  const [isMobileDesignCenterOpen, setIsMobileDesignCenterOpen] = useState(false);
  const [isQuickPanelCollapsed, setIsQuickPanelCollapsed] = useState<boolean>(true);

  const handleSaveMobileDesignConfig = (newConfig: MobileDesignConfig) => {
    setMobileDesignConfig(newConfig);
    localStorage.setItem('sy_mobile_design_config_v1', JSON.stringify(newConfig));
    window.dispatchEvent(new Event('sy_mobile_design_update'));
  };

  const [quoteConfig, setQuoteConfig] = useState<{
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
      Residential: any[];
      Commercial: any[];
      ParkingLot: any[];
    };
  }>({
    badge: '정부보조금 마감 임박 혜택 우선 선점',
    title: '무료 설치 상담 & 실시간 맞춤 견적',
    submitButton: '👉 30초 만에 무료 설치 상담 예약하기',
    successTitle: '상담 신청이 정상 접수되었습니다!',
    successDesc: '올해 배정된 정부 보조금 잔여 한도 선점을 위해, 2시간 이내에 담당 전문 컨설턴트가 기재해 주신 번호로 연락드리겠습니다.',
    privacyNotice: '안심 보증 정책: 입력하신 정보는 한전 한도 및 정부 무상 보조금 산정 용도로만 안전하게 활용되며, 전문 법률에 따라 개인정보보호법을 철저히 준수합니다.',
    directPhone: '1588-SY01',
    directKakaoUrl: 'https://pf.kakao.com/',
    purposeLabels: {
      Residential: '가정용 홈 (단독주택/빌라/개인)',
      Commercial: '아파트용 (공동주택/공용시설)',
      ParkingLot: '상업시설 수익형 (호텔/마트/상가빌딩)'
    },
    fields: DEFAULT_FIELDS
  });

  // Dynamic sub-navigation tabs default filtering state
  const [solutionsDefaultTab, setSolutionsDefaultTab] = useState<'ALL' | 'Commercial' | 'Residential' | 'ParkingLot'>('ALL');
  const [productsDefaultTab, setProductsDefaultTab] = useState<string>('ALL');

  const [snsConfig, setSnsConfig] = useState({
    kakaoUrl: 'https://pf.kakao.com/',
    instagramUrl: 'https://www.instagram.com/',
    blogUrl: 'https://section.blog.naver.com/',
    youtubeUrl: 'https://www.youtube.com/',
    showFloatingSns: true
  });

  const [quickMenuConfig, setQuickMenuConfig] = useState({
    showQuickMenu: true,
    items: [
      { id: 'q-1', label: '설치후기', iconType: 'MapPin', targetPage: 'review' },
      { id: 'q-2', label: '아파트 충전', iconType: 'Building2', targetPage: 'solutions' },
      { id: 'q-3', label: '가정용 홈', iconType: 'Home', targetPage: 'solutions' },
      { id: 'q-4', label: '학교&관공서', iconType: 'GraduationCap', targetPage: 'solutions' },
      { id: 'q-5', label: '상업시설 수익형', iconType: 'ParkingCircle', targetPage: 'solutions' },
      { id: 'q-6', label: '급속충전기', iconType: 'Zap', targetPage: 'products' },
      { id: 'q-7', label: '기기 교체', iconType: 'RefreshCw', targetPage: 'support' },
      { id: 'q-8', label: '홍보수익형', iconType: 'TrendingUp', targetPage: 'about' }
    ]
  });

  const [aboutConfig, setAboutConfig] = useState({
    ceoName: '박 우 혁 대표이사',
    ceoRole: 'SY.com Co., Ltd. Founder & CEO',
    ceoGreeting: '"지속 가능한 전기차 운전의 첫걸음, \n내 주차장에서 시작되는 안전과 편안함입니다."',
    ceoMessage1: '안녕하십니까, SY.com 대표이사 박우혁입니다. 대한민국 도로 위에 친환경 전기차가 급증하면서 이제 충전 인프라는 선택이 아닌 필수 주거/상업 복지 인프라가 되었습니다.',
    ceoMessage2: '하지만 최근 다중이용시설 및 주거지역 내 전기차 충전 중의 크고 작은 전기적 트러블과 화재 위험에 대한 우려로 입주민 협의를 보지 못하고 설치를 망설이시는 고객분들이 많습니다.',
    ceoMessage3: '저희 SY.com은 특허청에 등록된 차세대 화재감지 PLC 모뎀 차단 기술과 실시간 과열 진단 모니터링을 전 기종에 도입하여 완벽히 안전한 스마트 충전 생태계를 이룩했습니다. 설계부터 번거로운 관공서/한전/지자체 보조금 심사 서류 신청까지, SY.com 전 직원이 발로 뛰며 고객님의 편안함을 완성하겠습니다.',
    ceoImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600'
  });

  const [products, setProducts] = useState<Product[]>(() => PRODUCTS || []);
  const [solutions, setSolutions] = useState<Solution[]>(() => SOLUTIONS || []);
  const [reviews, setReviews] = useState<Review[]>(() => REVIEWS || []);
  const [faqs, setFaqs] = useState<FAQ[]>(() => FAQS || []);
  const [notices, setNotices] = useState<any[]>(() => NOTICES || []);

  // Load from LocalStorage
  useEffect(() => {
    if (isSyncing) return;
    const savedUser = localStorage.getItem('sy_user') || localStorage.getItem('sy_logged_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.isAdmin || parsed.email === 'sy.car.com@gmail.com' || parsed.role === 'admin') {
          setIsEditMode(true);
        }
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }

    const savedBookings = localStorage.getItem('sy_bookings');
    if (savedBookings) {
      try {
        const parsed = JSON.parse(savedBookings);
        setBookings(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse bookings', e);
      }
    } else {
      // Seed pre-loaded bookings for first-time premium experience
      const initialBookings: Booking[] = [
        {
          id: 'b-seed-1',
          name: '김태우 소장',
          phone: '010-9876-5432',
          location: '서울',
          purpose: 'ParkingLot',
          memo: '테헤란로 오피스 빌딩 주차 면적 수익형 급속 충전 시공 설계',
          status: '시공완료',
          createdAt: '2026-06-12 10:20',
          estimateCost: '18,500,000원'
        }
      ];
      setBookings(initialBookings);
      localStorage.setItem('sy_bookings', JSON.stringify(initialBookings));
    }

    const savedAS = localStorage.getItem('sy_as');
    if (savedAS) {
      try {
        const parsed = JSON.parse(savedAS);
        setAsRequests(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse A/S', e);
      }
    } else {
      const initialAS: ASRequest[] = [
        {
          id: 'as-seed-1',
          userId: 'usr-seed',
          productName: 'SY-AC11 프로 멀티 완속',
          serialNumber: 'SY-2026-0811',
          symptom: '전원 상태 지시등 점멸 이상',
          status: '처리완료',
          createdAt: '2026-06-14 11:30'
        }
      ];
      setAsRequests(initialAS);
      localStorage.setItem('sy_as', JSON.stringify(initialAS));
    }

    // Load Cart Items
    const savedCart = localStorage.getItem('sy_cart_items');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse cart items', e);
        setCartItems([]);
      }
    }

    // CMS Configurations
    const savedLogo = localStorage.getItem('sy_cms_logo');
    if (savedLogo) {
      try { setLogoConfig(JSON.parse(savedLogo)); } catch (e) { console.error(e); }
    }

    const savedCategories = localStorage.getItem('sy_cms_categories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        if (parsed) {
          if (!parsed.sol_commercial) parsed.sol_commercial = '아파트';
          if (!parsed.sol_residential) parsed.sol_residential = '가정용 홈';
          if (!parsed.sol_parking) parsed.sol_parking = '상업시설 수익형';
        }
        setCategoryLabels(parsed);
      } catch (e) { console.error(e); }
    }

    const savedHeader = localStorage.getItem('sy_cms_header');
    if (savedHeader) {
      try { setHeaderConfig(JSON.parse(savedHeader)); } catch (e) { console.error(e); }
    }

    const savedFooter = localStorage.getItem('sy_cms_footer');
    if (savedFooter) {
      try { setFooterConfig(JSON.parse(savedFooter)); } catch (e) { console.error(e); }
    }

    const savedHero = localStorage.getItem('sy_cms_hero');
    if (savedHero) {
      try { setHeroConfig(JSON.parse(savedHero)); } catch (e) { console.error(e); }
    }

    const savedAbout = localStorage.getItem('sy_cms_about');
    if (savedAbout) {
      try { setAboutConfig(JSON.parse(savedAbout)); } catch (e) { console.error(e); }
    }

    const syncAllProductsFromStorage = () => {
      try {

        const applyBrandOptions = (pList: Product[]) => {
          return pList.map(p => {
            if (p.optionGroups && p.optionGroups.length > 0) {
              return p;
            }
            const b = (p.brand || '').toLowerCase();
            const n = (p.name || '').toLowerCase();
            const isPublic = (
              p.detailCategory === '공용완속' ||
              p.detailCategory === '급속' ||
              p.type === '급속' ||
              p.id.startsWith('park-') ||
              (n.includes('공용') && !n.includes('개인용')) ||
              n.includes('수익형') ||
              n.includes('관공서') ||
              n.includes('조달상품')
            ) && !n.includes('개인용') && !n.includes('가정용');

            if (isPublic) {
              if (p.optionGroups && p.optionGroups.length === 1 && p.optionGroups[0].title === '커넥터길이') {
                return p;
              }
              return { ...p, optionGroups: PUBLIC_CHARGER_OPTION_GROUPS };
            }

            if (b.includes('롯데') || b.includes('evsis') || n.includes('롯데') || n.includes('evsis')) {
              return { ...p, optionGroups: LOTTE_EVSIS_OPTION_GROUPS };
            }
            if (b.includes('일렉트리') || n.includes('일렉트리') || b.includes('electree') || n.includes('electree')) {
              return { ...p, optionGroups: ELECTREE_OPTION_GROUPS };
            }
            if (b.includes('차지고') || n.includes('차지고') || b.includes('chargego') || n.includes('chargego')) {
              return { ...p, optionGroups: CHARGEGO_OPTION_GROUPS };
            }
            if (b.includes('쿨차지') || n.includes('쿨차지') || b.includes('coolcharge') || n.includes('coolcharge') || b.includes('cool charge')) {
              return { ...p, optionGroups: COOLCHARGE_OPTION_GROUPS };
            }
            return { ...p, optionGroups: DEFAULT_RESIDENTIAL_OPTION_GROUPS };
          });
        };

        const normalizeProductServiceTypes = (prods: Product[]) => {
          return prods.map(p => {
            if (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil') {
              return {
                ...p,
                name: '스필 11kW 개인용 전기차 충전기 무상AS 4년',
                serviceType: 'all',
                price: p.price || 779000,
                originalPrice: p.originalPrice || 829000,
                replacementPrice: (p as any).replacementPrice || 929000,
                replacementRegularPrice: (p as any).replacementRegularPrice || 1029000,
                installIncludedPrice: p.installIncludedPrice || 1129000,
                installIncludedRegularPrice: p.installIncludedRegularPrice || 1229000
              };
            }
            if (p.serviceType === 'install' && p.price && p.price > 0) {
              return { ...p, serviceType: 'all' };
            }
            return p;
          });
        };

        const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
        const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
        deletedSet.add('park-11kw-spil');
        deletedSet.add('res-5kw-evsis');
        deletedSet.add('sy-home07');
        deletedSet.add('res-7kw-evsis');
        deletedSet.add('res-11kw-evsis');

        const isLotteProduct = (p: any) => {
          if (!p) return false;
          const id = String(p.id || '').toLowerCase();
          const name = String(p.name || '').toLowerCase();
          const brand = String(p.brand || '').toLowerCase();
          const mfr = String(p.manufacturer || '').toLowerCase();
          return id.includes('evsis') || name.includes('롯데') || name.includes('evsis') || name.includes('이브이시스') || brand.includes('롯데') || brand.includes('evsis') || brand.includes('이브이시스') || mfr.includes('롯데') || mfr.includes('evsis');
        };

        const checkIsMatch = (item: any, np: Product) => {
          if (!item || !np) return false;
          if (item.id && np.id && item.id === np.id) return true;
          if (item.name && np.name && item.name.trim() === np.name.trim()) return true;
          if ((item.id === 'res-7kw-spil' || item.id === 'sy-ac07') && (np.id === 'res-7kw-spil' || np.id === 'sy-ac07')) return true;
          if ((item.id === 'res-5kw-spil' || item.id === 'sy-ac05') && (np.id === 'res-5kw-spil' || np.id === 'sy-ac05')) return true;
          if ((item.id === 'res-11kw-spil' || item.id === 'sy-ac11-bi') && (np.id === 'res-11kw-spil' || np.id === 'sy-ac11-bi')) return true;
          if ((item.id === 'park-50kw-1ch-coolcharge' || item.id === 'sy-dc50') && (np.id === 'park-50kw-1ch-coolcharge' || np.id === 'sy-dc50')) return true;
          if (item.name && np.name && item.name.toLowerCase().includes('50kw') && np.name.toLowerCase().includes('50kw')) return true;
          return false;
        };

        const savedProducts = localStorage.getItem('sy_cms_products_v12');
        let currentProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : [...PRODUCTS];
        currentProducts = currentProducts.filter(p => p && !REMOVED_PRODUCT_IDS.has(p.id) && !deletedSet.has(p.id) && !isLotteProduct(p));
        currentProducts = normalizeProductServiceTypes(applyBrandOptions(currentProducts));

        const savedHome = localStorage.getItem('sy_cms_home_products_v6_fixed');
        const parsedHome = savedHome ? JSON.parse(savedHome) : null;

        const savedParking = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
        const parsedParking = savedParking ? JSON.parse(savedParking) : null;

        let isModified = false;
        const nextProducts = [...currentProducts];

        if (parsedHome) {
          let homeUpdated = false;
          Object.keys(HOME_PRODUCTS_DATA).forEach((catKey) => {
            if (!parsedHome[catKey]) {
              parsedHome[catKey] = [...HOME_PRODUCTS_DATA[catKey]];
              homeUpdated = true;
            } else {
              HOME_PRODUCTS_DATA[catKey].forEach((defItem) => {
                if (!REMOVED_PRODUCT_IDS.has(defItem.id) && !deletedSet.has(defItem.id)) {
                  const hasItem = parsedHome[catKey].some((p: any) => checkIsMatch(p, defItem as any));
                  if (!hasItem) {
                    parsedHome[catKey].unshift({ ...defItem });
                    homeUpdated = true;
                  }
                }
              });
            }
          });

          Object.keys(parsedHome).forEach((powerKey) => {
            const seenNames = new Set<string>();
            parsedHome[powerKey] = (parsedHome[powerKey] || []).filter((sp: any) => {
              if (!sp || REMOVED_PRODUCT_IDS.has(sp.id) || deletedSet.has(sp.id)) return false;
              if (sp.id === 'res-7kw-spil') sp.id = 'sy-ac07';
              if (sp.id === 'res-5kw-spil') sp.id = 'sy-ac05';
              if (sp.id === 'res-11kw-spil') sp.id = 'sy-ac11-bi';
              if (sp.id === 'sy-ac11-bi' && sp.name && (sp.name.includes('공용') || sp.name.includes('수익형'))) {
                sp.name = '스필 11kW 개인용 전기차 충전기 무상AS 4년';
              }
              const nameKey = (sp.name || '').trim();
              if (seenNames.has(nameKey)) return false;
              seenNames.add(nameKey);
              return true;
            });

            (parsedHome[powerKey] || []).forEach((sp: any) => {
              sp.serviceType = 'all';
              const matchIdx = nextProducts.findIndex((mp) => checkIsMatch(sp, mp));
              if (matchIdx !== -1) {
                const existing = nextProducts[matchIdx];
                let changed = false;
                if (existing.image && sp.image !== existing.image) {
                  sp.image = existing.image;
                  homeUpdated = true;
                } else if (sp.image && !existing.image) {
                  existing.image = sp.image;
                  changed = true;
                }
                if (sp.name && existing.name !== sp.name) {
                  existing.name = sp.name;
                  changed = true;
                }
                if (sp.price !== undefined && existing.price !== sp.price) {
                  existing.price = sp.price;
                  changed = true;
                }
                if (sp.regularPrice !== undefined && existing.originalPrice !== sp.regularPrice) {
                  existing.originalPrice = sp.regularPrice;
                  changed = true;
                }
                if (sp.replacementPrice !== undefined && (existing as any).replacementPrice !== sp.replacementPrice) {
                  (existing as any).replacementPrice = sp.replacementPrice;
                  changed = true;
                }
                if (sp.installIncludedPrice !== undefined && (existing as any).installIncludedPrice !== sp.installIncludedPrice) {
                  (existing as any).installIncludedPrice = sp.installIncludedPrice;
                  changed = true;
                }
                if (sp.discount !== undefined && existing.discountRate !== sp.discount) {
                  existing.discountRate = sp.discount;
                  changed = true;
                }
                existing.serviceType = 'all';
                if (sp.optionGroups && sp.optionGroups.length > 0 && JSON.stringify(existing.optionGroups) !== JSON.stringify(sp.optionGroups)) {
                  existing.optionGroups = sp.optionGroups;
                  changed = true;
                }
                if (changed) {
                  nextProducts[matchIdx] = { ...existing };
                  isModified = true;
                }
              } else if (!REMOVED_PRODUCT_IDS.has(sp.id) && !deletedSet.has(sp.id)) {
                // Brand new product added in Home section
                const brandMatch = sp.name ? sp.name.match(/^\[([^\]]+)\]/) : null;
                const brandName = brandMatch ? brandMatch[1] : (sp.name ? sp.name.split(' ')[0] : '에스와이');
                const newP: Product = {
                  id: sp.id || `res-custom-${Date.now()}`,
                  name: sp.name || '신규 홈 충전기',
                  type: '완속',
                  power: powerKey || '7kW',
                  features: sp.tags || ['MD CHOICE', 'HIT'],
                  image: sp.image || '/스필.png',
                  description: sp.description || '가정용, 회사용, 공장용, 창고용 전기차 충전기',
                  price: sp.price || 0,
                  originalPrice: sp.regularPrice || sp.price || 0,
                  discountRate: sp.discount || 0,
                  brand: brandName,
                  serviceType: 'device',
                  optionGroups: sp.optionGroups || JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
                };
                nextProducts.push(newP);
                isModified = true;
              }
            });
          });
          if (homeUpdated) {
            localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(parsedHome));
          }
        }

        if (parsedParking) {
          let parkingUpdated = false;
          Object.keys(PARKING_PRODUCTS_DATA).forEach((catKey) => {
            if (!parsedParking[catKey]) {
              parsedParking[catKey] = [...PARKING_PRODUCTS_DATA[catKey]];
              parkingUpdated = true;
            } else {
              PARKING_PRODUCTS_DATA[catKey].forEach((defItem) => {
                if (!REMOVED_PRODUCT_IDS.has(defItem.id) && !deletedSet.has(defItem.id)) {
                  const hasItem = parsedParking[catKey].some((p: any) => checkIsMatch(p, defItem as any));
                  if (!hasItem) {
                    parsedParking[catKey].push({ ...defItem });
                    parkingUpdated = true;
                  }
                }
              });
            }
          });

          Object.keys(parsedParking).forEach((catKey) => {
            const seenNames = new Set<string>();
            parsedParking[catKey] = (parsedParking[catKey] || []).filter((sp: any) => {
              if (!sp || REMOVED_PRODUCT_IDS.has(sp.id) || deletedSet.has(sp.id)) return false;
              if (sp.id === 'sy-dc50') sp.id = 'park-50kw-1ch-coolcharge';
              const nameKey = (sp.name || '').trim();
              if (seenNames.has(nameKey)) return false;
              seenNames.add(nameKey);
              return true;
            });

            (parsedParking[catKey] || []).forEach((sp: any) => {
              const matchIdx = nextProducts.findIndex((mp) => checkIsMatch(sp, mp));
              if (matchIdx !== -1) {
                const existing = nextProducts[matchIdx];
                let changed = false;
                if (sp.name && existing.name !== sp.name) { existing.name = sp.name; changed = true; }
                if (existing.image && sp.image !== existing.image) {
                  sp.image = existing.image;
                  parkingUpdated = true;
                } else if (sp.image && !existing.image) {
                  existing.image = sp.image;
                  changed = true;
                }
                if (sp.description && existing.description !== sp.description) { existing.description = sp.description; changed = true; }
                if (sp.price !== undefined && existing.price !== sp.price) { existing.price = sp.price; changed = true; }
                if (sp.regularPrice !== undefined && existing.originalPrice !== sp.regularPrice) { existing.originalPrice = sp.regularPrice; changed = true; }
                if (sp.discount !== undefined && existing.discountRate !== sp.discount) { existing.discountRate = sp.discount; changed = true; }
                if (sp.replacementPrice !== undefined && (existing as any).replacementPrice !== sp.replacementPrice) { (existing as any).replacementPrice = sp.replacementPrice; changed = true; }
                if (sp.replacementRegularPrice !== undefined && (existing as any).replacementRegularPrice !== sp.replacementRegularPrice) { (existing as any).replacementRegularPrice = sp.replacementRegularPrice; changed = true; }
                if (sp.installIncludedPrice !== undefined && (existing as any).installIncludedPrice !== sp.installIncludedPrice) { (existing as any).installIncludedPrice = sp.installIncludedPrice; changed = true; }
                if (sp.installIncludedRegularPrice !== undefined && (existing as any).installIncludedRegularPrice !== sp.installIncludedRegularPrice) { (existing as any).installIncludedRegularPrice = sp.installIncludedRegularPrice; changed = true; }
                if (sp.serviceType && existing.serviceType !== sp.serviceType) { existing.serviceType = sp.serviceType; changed = true; }
                if (sp.optionGroups && JSON.stringify(existing.optionGroups) !== JSON.stringify(sp.optionGroups)) { existing.optionGroups = sp.optionGroups; changed = true; }

                if (changed) {
                  nextProducts[matchIdx] = { ...existing };
                  isModified = true;
                }
              } else if (!REMOVED_PRODUCT_IDS.has(sp.id) && !deletedSet.has(sp.id)) {
                // Brand new product added in Commercial / Parking section
                const brandMatch = sp.name ? sp.name.match(/^\[([^\]]+)\]/) : null;
                const brandName = brandMatch ? brandMatch[1] : (sp.name ? sp.name.split(' ')[0] : '에스와이');
                const newP: Product = {
                  id: sp.id || `park-custom-${Date.now()}`,
                  name: sp.name || '신규 상업용 충전기',
                  type: '급속',
                  power: catKey || '100kW',
                  features: sp.tags || ['BEST', 'HIT'],
                  image: sp.image || '/50kw-쿨차지.png',
                  description: sp.description || '상업시설, 수익형 매장용 충전기',
                  price: sp.price || 0,
                  originalPrice: sp.regularPrice || sp.price || 0,
                  discountRate: sp.discount || 0,
                  brand: brandName,
                  serviceType: sp.serviceType || 'all',
                  replacementPrice: sp.replacementPrice,
                  replacementRegularPrice: sp.replacementRegularPrice,
                  installIncludedPrice: sp.installIncludedPrice,
                  installIncludedRegularPrice: sp.installIncludedRegularPrice,
                  optionGroups: sp.optionGroups || JSON.parse(JSON.stringify(PUBLIC_CHARGER_OPTION_GROUPS))
                };
                nextProducts.push(newP);
                isModified = true;
              }
            });
          });

          if (parkingUpdated) {
            localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(parsedParking));
            localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(parsedParking));
          }
        }

        setProducts(nextProducts);
        if (isModified || !savedProducts) {
          localStorage.setItem('sy_cms_products_v12', JSON.stringify(nextProducts));
        }
      } catch (e) {
        console.error('Error syncing products in App.tsx:', e);
      }
    };

    syncAllProductsFromStorage();

    const savedSolutions = localStorage.getItem('sy_cms_solutions');
    if (savedSolutions) {
      try { setSolutions(JSON.parse(savedSolutions)); } catch (e) { console.error(e); }
    } else {
      setSolutions(SOLUTIONS);
      localStorage.setItem('sy_cms_solutions', JSON.stringify(SOLUTIONS));
    }

    const savedReviews = localStorage.getItem('sy_cms_reviews');
    if (savedReviews) {
      try {
        const parsed: Review[] = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
        } else {
          setReviews(REVIEWS);
          localStorage.setItem('sy_cms_reviews', JSON.stringify(REVIEWS));
        }
      } catch (e) {
        console.error(e);
        setReviews(REVIEWS);
      }
    } else {
      setReviews(REVIEWS);
      localStorage.setItem('sy_cms_reviews', JSON.stringify(REVIEWS));
    }

    const savedFaqs = localStorage.getItem('sy_cms_faqs');
    if (savedFaqs) {
      try { setFaqs(JSON.parse(savedFaqs)); } catch (e) { console.error(e); }
    } else {
      setFaqs(FAQS);
      localStorage.setItem('sy_cms_faqs', JSON.stringify(FAQS));
    }

    const savedNotices = localStorage.getItem('sy_cms_notices');
    if (savedNotices) {
      try { setNotices(JSON.parse(savedNotices)); } catch (e) { console.error(e); }
    } else {
      setNotices(NOTICES);
      localStorage.setItem('sy_cms_notices', JSON.stringify(NOTICES));
    }

    const savedSns = localStorage.getItem('sy_cms_sns');
    if (savedSns) {
      try { setSnsConfig(JSON.parse(savedSns)); } catch (e) { console.error(e); }
    }

    const savedQuickMenu = localStorage.getItem('sy_cms_quickmenu');
    if (savedQuickMenu) {
      try { setQuickMenuConfig(JSON.parse(savedQuickMenu)); } catch (e) { console.error(e); }
    }

    const savedQuote = localStorage.getItem('sy_cms_quote');
    if (savedQuote) {
      try {
        const parsed = JSON.parse(savedQuote);
        if (parsed) {
          let migrated = false;
          if (parsed.purposeLabels) {
            if (parsed.purposeLabels.Residential && (parsed.purposeLabels.Residential.includes('비공용') || parsed.purposeLabels.Residential.includes('주거용'))) {
              parsed.purposeLabels.Residential = '가정용 홈 (단독주택/빌라/개인)';
              migrated = true;
            }
            if (parsed.purposeLabels.Commercial && (parsed.purposeLabels.Commercial.includes('기업/관공서') || parsed.purposeLabels.Commercial.includes('기업용'))) {
              parsed.purposeLabels.Commercial = '아파트용 (공동주택/공용시설)';
              migrated = true;
            }
            if (parsed.purposeLabels.ParkingLot && (parsed.purposeLabels.ParkingLot.includes('수익형 주차장') || parsed.purposeLabels.ParkingLot.includes('수익형 상가'))) {
              parsed.purposeLabels.ParkingLot = '상업시설 수익형 (호텔/마트/상가빌딩)';
              migrated = true;
            }
          }
          
          if (!parsed.fields) {
            parsed.fields = DEFAULT_FIELDS;
            migrated = true;
          } else {
            // 1. Wipe out any added custom fields for Residential (가정용 홈 설치문의 새입력항목 없애기)
            if (parsed.fields.Residential) {
              const originalLength = parsed.fields.Residential.length;
              parsed.fields.Residential = parsed.fields.Residential.filter((f: any) => 
                !f.id.startsWith('custom_field') && f.label !== '새 입력 항목'
              );
              if (parsed.fields.Residential.length !== originalLength) {
                migrated = true;
              }
            }

            // 2. Align Commercial fields
            if (parsed.fields.Commercial) {
              let updated = false;
              parsed.fields.Commercial = parsed.fields.Commercial.map((f: any) => {
                if (f.id === 'location' && f.label !== '설치희망주소') {
                  updated = true;
                  return { ...f, label: '설치희망주소' };
                }
                return f;
              });
              if (updated) migrated = true;
            }

            // 3. Align ParkingLot fields
            if (parsed.fields.ParkingLot) {
              let updated = false;
              // Map labels
              parsed.fields.ParkingLot = parsed.fields.ParkingLot.map((f: any) => {
                if (f.id === 'location' && f.label !== '설치희망주소') {
                  updated = true;
                  return { ...f, label: '설치희망주소' };
                }
                if (f.id === 'parkingCount' && f.label !== '보유주차면수') {
                  updated = true;
                  return { ...f, label: '보유주차면수' };
                }
                return f;
              });
              // Ensure quantity field exists
              if (!parsed.fields.ParkingLot.some((f: any) => f.id === 'quantity')) {
                parsed.fields.ParkingLot.splice(4, 0, {
                  id: 'quantity',
                  label: '설치 희망 수량 (대)',
                  type: 'number',
                  placeholder: '예: 10',
                  required: true
                });
                updated = true;
              }
              if (updated) migrated = true;
            }
          }
          
          if (!parsed.fields.Commercial || parsed.fields.Commercial.some((f: any) => f.id === 'powerCapacity') || !parsed.fields.Commercial.some((f: any) => f.id === 'ownedChargers')) {
            parsed.fields = {
              ...parsed.fields,
              Commercial: DEFAULT_FIELDS.Commercial
            };
            migrated = true;
          }

          if (migrated) {
            localStorage.setItem('sy_cms_quote', JSON.stringify(parsed));
          }
        }
        setQuoteConfig(parsed);
      } catch (e) { console.error(e); }
    }
  }, [isSyncing]);

  // Initialize external analytics (GA4 & Naver) if configured
  useEffect(() => {
    initExternalAnalytics();
  }, []);

  // Track visitor visits in real-time
  useEffect(() => {
    const pageNamesMap: Record<string, string> = {
      home: '메인 홈 (충전기 통합 솔루션)',
      residential: '🏠 가정용 홈 충전기 스토어',
      commercial: '⚡ 아파트·상업용 솔루션',
      calculator: '무료 시공 견적 계산기',
      support: '고객지원 센터 & FAQ',
      as: '🔧 긴급 A/S 접수',
      mypage: '마이페이지',
      cart: '장바구니 & 주문서',
      admin: '관리자 대시보드'
    };
    const pageName = pageNamesMap[activePage] || `페이지: ${activePage}`;
    recordVisitorHit(pageName);
  }, [activePage]);

  useEffect(() => {
    const handleProductsUpdate = () => {
      try {
        const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
        const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
        deletedSet.add('park-11kw-spil');
        deletedSet.add('res-5kw-evsis');
        deletedSet.add('sy-home07');
        deletedSet.add('res-7kw-evsis');
        deletedSet.add('res-11kw-evsis');

        const checkIsMatch = (item: any, np: Product) => {
          if (!item || !np) return false;
          if (item.id && np.id && item.id === np.id) return true;
          if (item.name && np.name && item.name.trim() === np.name.trim()) return true;
          if ((item.id === 'res-7kw-spil' || item.id === 'sy-ac07') && (np.id === 'res-7kw-spil' || np.id === 'sy-ac07')) return true;
          if ((item.id === 'res-5kw-spil' || item.id === 'sy-ac05') && (np.id === 'res-5kw-spil' || np.id === 'sy-ac05')) return true;
          if ((item.id === 'res-11kw-spil' || item.id === 'sy-ac11-bi') && (np.id === 'res-11kw-spil' || np.id === 'sy-ac11-bi')) return true;
          if ((item.id === 'park-50kw-1ch-coolcharge' || item.id === 'sy-dc50') && (np.id === 'park-50kw-1ch-coolcharge' || np.id === 'sy-dc50')) return true;
          if (item.name && np.name && item.name.toLowerCase().includes('50kw') && np.name.toLowerCase().includes('50kw')) return true;
          return false;
        };

        const isLotteProduct = (p: any) => {
          if (!p) return false;
          const id = String(p.id || '').toLowerCase();
          const name = String(p.name || '').toLowerCase();
          const brand = String(p.brand || '').toLowerCase();
          const mfr = String(p.manufacturer || '').toLowerCase();
          return id.includes('evsis') || name.includes('롯데') || name.includes('evsis') || name.includes('이브이시스') || brand.includes('롯데') || brand.includes('evsis') || brand.includes('이브이시스') || mfr.includes('롯데') || mfr.includes('evsis');
        };

        const savedProducts = localStorage.getItem('sy_cms_products_v12');
        let currentProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : [...PRODUCTS];
        currentProducts = currentProducts.filter(p => p && !REMOVED_PRODUCT_IDS.has(p.id) && !deletedSet.has(p.id) && !isLotteProduct(p));
        currentProducts = currentProducts.map(p => {
          if (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil') {
            return {
              ...p,
              name: '스필 11kW 개인용 전기차 충전기 무상AS 4년',
              serviceType: 'all',
              price: p.price || 779000,
              originalPrice: p.originalPrice || 829000,
              replacementPrice: (p as any).replacementPrice || 929000,
              replacementRegularPrice: (p as any).replacementRegularPrice || 1029000,
              installIncludedPrice: p.installIncludedPrice || 1129000,
              installIncludedRegularPrice: p.installIncludedRegularPrice || 1229000
            };
          }
          if (p.serviceType === 'install' && p.price && p.price > 0) {
            return { ...p, serviceType: 'all' };
          }
          return p;
        });

        const savedHome = localStorage.getItem('sy_cms_home_products_v6_fixed');
        const parsedHome = savedHome ? JSON.parse(savedHome) : null;

        const savedParking = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
        const parsedParking = savedParking ? JSON.parse(savedParking) : null;

        let isModified = false;
        const nextProducts = [...currentProducts];

        if (parsedHome) {
          let homeUpdated = false;
          Object.keys(HOME_PRODUCTS_DATA).forEach((catKey) => {
            if (!parsedHome[catKey]) {
              parsedHome[catKey] = [...HOME_PRODUCTS_DATA[catKey]];
              homeUpdated = true;
            } else {
              HOME_PRODUCTS_DATA[catKey].forEach((defItem) => {
                if (!REMOVED_PRODUCT_IDS.has(defItem.id) && !deletedSet.has(defItem.id)) {
                  const hasItem = parsedHome[catKey].some((p: any) => checkIsMatch(p, defItem as any));
                  if (!hasItem) {
                    parsedHome[catKey].unshift({ ...defItem });
                    homeUpdated = true;
                  }
                }
              });
            }
          });

          Object.keys(parsedHome).forEach((powerKey) => {
            const seenNames = new Set<string>();
            parsedHome[powerKey] = (parsedHome[powerKey] || []).filter((sp: any) => {
              if (!sp || REMOVED_PRODUCT_IDS.has(sp.id) || deletedSet.has(sp.id)) return false;
              if (sp.id === 'res-7kw-spil') sp.id = 'sy-ac07';
              if (sp.id === 'res-5kw-spil') sp.id = 'sy-ac05';
              if (sp.id === 'res-11kw-spil') sp.id = 'sy-ac11-bi';
              if (sp.id === 'sy-ac11-bi' && sp.name && (sp.name.includes('공용') || sp.name.includes('수익형'))) {
                sp.name = '스필 11kW 개인용 전기차 충전기 무상AS 4년';
              }
              const nameKey = (sp.name || '').trim();
              if (seenNames.has(nameKey)) return false;
              seenNames.add(nameKey);
              return true;
            });

            (parsedHome[powerKey] || []).forEach((sp: any) => {
              const matchIdx = nextProducts.findIndex((mp) => checkIsMatch(sp, mp));
              if (matchIdx !== -1) {
                const existing = nextProducts[matchIdx];
                let changed = false;

                // Sync all fields symmetrically
                if (sp.name && existing.name !== sp.name) { existing.name = sp.name; changed = true; }
                if (existing.image && sp.image !== existing.image) {
                  sp.image = existing.image;
                  homeUpdated = true;
                } else if (sp.image && !existing.image) {
                  existing.image = sp.image;
                  changed = true;
                }
                if (sp.description && existing.description !== sp.description) { existing.description = sp.description; changed = true; }
                if (sp.price !== undefined && existing.price !== sp.price) { existing.price = sp.price; changed = true; }
                if (sp.regularPrice !== undefined && existing.originalPrice !== sp.regularPrice) { existing.originalPrice = sp.regularPrice; changed = true; }
                if (sp.discount !== undefined && existing.discountRate !== sp.discount) { existing.discountRate = sp.discount; changed = true; }
                if (sp.replacementPrice !== undefined && (existing as any).replacementPrice !== sp.replacementPrice) { (existing as any).replacementPrice = sp.replacementPrice; changed = true; }
                if (sp.replacementRegularPrice !== undefined && (existing as any).replacementRegularPrice !== sp.replacementRegularPrice) { (existing as any).replacementRegularPrice = sp.replacementRegularPrice; changed = true; }
                if (sp.installIncludedPrice !== undefined && (existing as any).installIncludedPrice !== sp.installIncludedPrice) { (existing as any).installIncludedPrice = sp.installIncludedPrice; changed = true; }
                if (sp.installIncludedRegularPrice !== undefined && (existing as any).installIncludedRegularPrice !== sp.installIncludedRegularPrice) { (existing as any).installIncludedRegularPrice = sp.installIncludedRegularPrice; changed = true; }
                if (sp.serviceType && existing.serviceType !== sp.serviceType) { existing.serviceType = sp.serviceType; changed = true; }
                if (sp.optionGroups && JSON.stringify(existing.optionGroups) !== JSON.stringify(sp.optionGroups)) { existing.optionGroups = sp.optionGroups; changed = true; }

                if (changed) {
                  nextProducts[matchIdx] = { ...existing };
                  isModified = true;
                }

                // Reverse sync from existing back to sp if sp was missing values
                if (existing.replacementPrice !== undefined && sp.replacementPrice === undefined) { sp.replacementPrice = existing.replacementPrice; homeUpdated = true; }
                if (existing.installIncludedPrice !== undefined && sp.installIncludedPrice === undefined) { sp.installIncludedPrice = existing.installIncludedPrice; homeUpdated = true; }
              } else if (!REMOVED_PRODUCT_IDS.has(sp.id) && !deletedSet.has(sp.id)) {
                const brandMatch = sp.name ? sp.name.match(/^\[([^\]]+)\]/) : null;
                const brandName = brandMatch ? brandMatch[1] : (sp.name ? sp.name.split(' ')[0] : '에스와이');
                const newP: Product = {
                  id: sp.id || `res-custom-${Date.now()}`,
                  name: sp.name || '신규 홈 충전기',
                  type: '완속',
                  power: powerKey || '7kW',
                  features: sp.tags || ['MD CHOICE', 'HIT'],
                  image: sp.image || '/스필.png',
                  description: sp.description || '가정용, 회사용, 공장용, 창고용 전기차 충전기',
                  price: sp.price || 0,
                  originalPrice: sp.regularPrice || sp.price || 0,
                  discountRate: sp.discount || 0,
                  brand: brandName,
                  serviceType: sp.serviceType || 'all',
                  replacementPrice: sp.replacementPrice,
                  replacementRegularPrice: sp.replacementRegularPrice,
                  installIncludedPrice: sp.installIncludedPrice,
                  installIncludedRegularPrice: sp.installIncludedRegularPrice,
                  optionGroups: sp.optionGroups || JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
                };
                nextProducts.push(newP);
                isModified = true;
              }
            });
          });
          if (homeUpdated) {
            localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(parsedHome));
          }
        }

        if (parsedParking) {
          let parkingUpdated = false;
          Object.keys(PARKING_PRODUCTS_DATA).forEach((catKey) => {
            if (!parsedParking[catKey]) {
              parsedParking[catKey] = [...PARKING_PRODUCTS_DATA[catKey]];
              parkingUpdated = true;
            } else {
              PARKING_PRODUCTS_DATA[catKey].forEach((defItem) => {
                if (!REMOVED_PRODUCT_IDS.has(defItem.id) && !deletedSet.has(defItem.id)) {
                  const hasItem = parsedParking[catKey].some((p: any) => checkIsMatch(p, defItem as any));
                  if (!hasItem) {
                    parsedParking[catKey].push({ ...defItem });
                    parkingUpdated = true;
                  }
                }
              });
            }
          });

          Object.keys(parsedParking).forEach((catKey) => {
            const seenNames = new Set<string>();
            parsedParking[catKey] = (parsedParking[catKey] || []).filter((sp: any) => {
              if (!sp || REMOVED_PRODUCT_IDS.has(sp.id) || deletedSet.has(sp.id)) return false;
              if (sp.id === 'sy-dc50') sp.id = 'park-50kw-1ch-coolcharge';
              const nameKey = (sp.name || '').trim();
              if (seenNames.has(nameKey)) return false;
              seenNames.add(nameKey);
              return true;
            });

            (parsedParking[catKey] || []).forEach((sp: any) => {
              const matchIdx = nextProducts.findIndex((mp) => checkIsMatch(sp, mp));
              if (matchIdx !== -1) {
                const existing = nextProducts[matchIdx];
                let changed = false;

                // Sync all fields symmetrically
                if (sp.name && existing.name !== sp.name) { existing.name = sp.name; changed = true; }
                if (existing.image && sp.image !== existing.image) {
                  sp.image = existing.image;
                  parkingUpdated = true;
                } else if (sp.image && !existing.image) {
                  existing.image = sp.image;
                  changed = true;
                }
                if (sp.description && existing.description !== sp.description) { existing.description = sp.description; changed = true; }
                if (sp.price !== undefined && existing.price !== sp.price) { existing.price = sp.price; changed = true; }
                if (sp.regularPrice !== undefined && existing.originalPrice !== sp.regularPrice) { existing.originalPrice = sp.regularPrice; changed = true; }
                if (sp.discount !== undefined && existing.discountRate !== sp.discount) { existing.discountRate = sp.discount; changed = true; }
                if (sp.replacementPrice !== undefined && (existing as any).replacementPrice !== sp.replacementPrice) { (existing as any).replacementPrice = sp.replacementPrice; changed = true; }
                if (sp.replacementRegularPrice !== undefined && (existing as any).replacementRegularPrice !== sp.replacementRegularPrice) { (existing as any).replacementRegularPrice = sp.replacementRegularPrice; changed = true; }
                if (sp.installIncludedPrice !== undefined && (existing as any).installIncludedPrice !== sp.installIncludedPrice) { (existing as any).installIncludedPrice = sp.installIncludedPrice; changed = true; }
                if (sp.installIncludedRegularPrice !== undefined && (existing as any).installIncludedRegularPrice !== sp.installIncludedRegularPrice) { (existing as any).installIncludedRegularPrice = sp.installIncludedRegularPrice; changed = true; }
                if (sp.serviceType && existing.serviceType !== sp.serviceType) { existing.serviceType = sp.serviceType; changed = true; }
                if (sp.optionGroups && JSON.stringify(existing.optionGroups) !== JSON.stringify(sp.optionGroups)) { existing.optionGroups = sp.optionGroups; changed = true; }

                if (changed) {
                  nextProducts[matchIdx] = { ...existing };
                  isModified = true;
                }

                // Reverse sync from existing back to sp if sp was missing values
                if (existing.replacementPrice !== undefined && sp.replacementPrice === undefined) { sp.replacementPrice = existing.replacementPrice; parkingUpdated = true; }
                if (existing.installIncludedPrice !== undefined && sp.installIncludedPrice === undefined) { sp.installIncludedPrice = existing.installIncludedPrice; parkingUpdated = true; }
              } else if (!REMOVED_PRODUCT_IDS.has(sp.id) && !deletedSet.has(sp.id)) {
                const brandMatch = sp.name ? sp.name.match(/^\[([^\]]+)\]/) : null;
                const brandName = brandMatch ? brandMatch[1] : (sp.name ? sp.name.split(' ')[0] : '에스와이');
                const newP: Product = {
                  id: sp.id || `park-custom-${Date.now()}`,
                  name: sp.name || '신규 상업용 충전기',
                  type: '급속',
                  power: catKey || '100kW',
                  features: sp.tags || ['BEST', 'HIT'],
                  image: sp.image || '/50kw-쿨차지.png',
                  description: sp.description || '상업시설, 수익형 매장용 충전기',
                  price: sp.price || 0,
                  originalPrice: sp.regularPrice || sp.price || 0,
                  discountRate: sp.discount || 0,
                  brand: brandName,
                  serviceType: sp.serviceType || 'all',
                  replacementPrice: sp.replacementPrice,
                  replacementRegularPrice: sp.replacementRegularPrice,
                  installIncludedPrice: sp.installIncludedPrice,
                  installIncludedRegularPrice: sp.installIncludedRegularPrice,
                  optionGroups: sp.optionGroups || JSON.parse(JSON.stringify(PUBLIC_CHARGER_OPTION_GROUPS))
                };
                nextProducts.push(newP);
                isModified = true;
              }
            });
          });
          if (parkingUpdated) {
            localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(parsedParking));
            localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(parsedParking));
          }
        }

        setProducts(nextProducts);
        if (isModified) {
          localStorage.setItem('sy_cms_products_v12', JSON.stringify(nextProducts));
        }
        handleHeroUpdate();
      } catch (e) {
        console.error('Error on sy_cms_products_update in App.tsx:', e);
      }
    };

    const handleHeroUpdate = () => {
      const savedHero = localStorage.getItem('sy_cms_hero');
      if (savedHero) {
        try {
          setHeroConfig(JSON.parse(savedHero));
        } catch (e) {
          console.error('Error reading sy_cms_hero:', e);
        }
      }
    };

    const handleFullSyncReload = () => {
      try {
        // Reload Reviews
        const savedReviews = localStorage.getItem('sy_cms_reviews');
        if (savedReviews) {
          try {
            const parsed = JSON.parse(savedReviews);
            if (Array.isArray(parsed) && parsed.length > 0) setReviews(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload Notices
        const savedNotices = localStorage.getItem('sy_cms_notices');
        if (savedNotices) {
          try {
            const parsed = JSON.parse(savedNotices);
            if (Array.isArray(parsed) && parsed.length > 0) setNotices(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload FAQs
        const savedFaqs = localStorage.getItem('sy_cms_faqs');
        if (savedFaqs) {
          try {
            const parsed = JSON.parse(savedFaqs);
            if (Array.isArray(parsed) && parsed.length > 0) setFaqs(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload Solutions
        const savedSolutions = localStorage.getItem('sy_cms_solutions');
        if (savedSolutions) {
          try {
            const parsed = JSON.parse(savedSolutions);
            if (Array.isArray(parsed) && parsed.length > 0) setSolutions(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload Brands
        const savedBrands = localStorage.getItem('sy_cms_brands');
        if (savedBrands) {
          try {
            const parsed = JSON.parse(savedBrands);
            if (parsed) setBrands(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload Bookings
        const savedBookings = localStorage.getItem('sy_bookings');
        if (savedBookings) {
          try {
            const parsed = JSON.parse(savedBookings);
            if (Array.isArray(parsed) && parsed.length > 0) setBookings(parsed);
          } catch (e) { console.error(e); }
        }

        // Reload About
        const savedAbout = localStorage.getItem('sy_cms_about');
        if (savedAbout) {
          try { setAboutConfig(JSON.parse(savedAbout)); } catch (e) { console.error(e); }
        }

        // Reload Logo & Header
        const savedLogo = localStorage.getItem('sy_cms_logo');
        if (savedLogo) {
          try { setLogoConfig(JSON.parse(savedLogo)); } catch (e) { console.error(e); }
        }
        const savedHeader = localStorage.getItem('sy_cms_header');
        if (savedHeader) {
          try { setHeaderConfig(JSON.parse(savedHeader)); } catch (e) { console.error(e); }
        }
        const savedFooter = localStorage.getItem('sy_cms_footer');
        if (savedFooter) {
          try { setFooterConfig(JSON.parse(savedFooter)); } catch (e) { console.error(e); }
        }
        const savedQuote = localStorage.getItem('sy_cms_quote');
        if (savedQuote) {
          try { setQuoteConfig(JSON.parse(savedQuote)); } catch (e) { console.error(e); }
        }

        handleProductsUpdate();
        handleHeroUpdate();
      } catch (err) {
        console.error('Error during full sync reload:', err);
      }
    };

    window.addEventListener('sy_cms_data_sync_completed', handleFullSyncReload);
    window.addEventListener('sy_cms_products_update', handleProductsUpdate);
    window.addEventListener('sy_cms_hero_update', handleHeroUpdate);
    window.addEventListener('sy_cms_reviews_update', handleFullSyncReload);
    window.addEventListener('sy_cms_notices_update', handleFullSyncReload);
    window.addEventListener('sy_cms_faqs_update', handleFullSyncReload);
    return () => {
      window.removeEventListener('sy_cms_data_sync_completed', handleFullSyncReload);
      window.removeEventListener('sy_cms_products_update', handleProductsUpdate);
      window.removeEventListener('sy_cms_hero_update', handleHeroUpdate);
      window.removeEventListener('sy_cms_reviews_update', handleFullSyncReload);
      window.removeEventListener('sy_cms_notices_update', handleFullSyncReload);
      window.removeEventListener('sy_cms_faqs_update', handleFullSyncReload);
    };
  }, []);

  // Sync state helpers
  const handleLogin = (newUser: User) => {
    const isOwner = newUser.email === 'sy.car.com@gmail.com' || newUser.isAdmin || newUser.role === 'admin';
    const finalUser: User = {
      ...newUser,
      isAdmin: isOwner,
      role: isOwner ? 'admin' : 'user'
    };
    setUser(finalUser);
    if (isOwner) {
      setIsEditMode(true);
      setIsNotificationBannerDismissed(false);
      setShowLoginAlertToast(true);
    }
    // Store in secure in-memory manager with AES-GCM heap encryption & 30-minute auto-expiry
    secureAuthManager.login(finalUser, 30 * 60 * 1000);
    // Explicitly wipe any persistent storage
    try {
      localStorage.removeItem('sy_logged_user');
      localStorage.removeItem('sy_user');
      sessionStorage.removeItem('sy_logged_user');
      sessionStorage.removeItem('sy_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    secureAuthManager.logout();
    setUser(null);
    setIsEditMode(false);
    setShowLoginAlertToast(false);
    setIsMyPageOpen(false);
    try {
      localStorage.removeItem('sy_user');
      localStorage.removeItem('sy_logged_user');
      sessionStorage.removeItem('sy_user');
      sessionStorage.removeItem('sy_logged_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Notification helpers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      localStorage.setItem('sy_admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem('sy_admin_notifications', JSON.stringify(updated));
      return updated;
    });
    setIsNotificationBannerDismissed(true);
    setShowLoginAlertToast(false);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem('sy_admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Cart & Payment management handlers
  const handleAddToCart = (
    product: any,
    selectedOptions?: { groupTitle: string; optionName: string; optionPrice: number }[],
    customPrice?: number,
    customQuantity: number = 1
  ) => {
    let updatedCart: CartItem[];
    const itemPrice = customPrice !== undefined ? customPrice : (product.price || 0);
    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      updatedCart = cartItems.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              quantity: item.quantity + customQuantity,
              price: itemPrice > 0 ? itemPrice : item.price,
              selectedOptions: selectedOptions && selectedOptions.length > 0 ? selectedOptions : item.selectedOptions
            }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        power: product.power || (product.name?.includes('5kW') ? '5kW' : product.name?.includes('11kW') ? '11kW' : '7kW'),
        type: product.type || '완속',
        image: product.image,
        quantity: customQuantity,
        price: itemPrice,
        selectedOptions: selectedOptions || [],
        addedAt: new Date().toISOString()
      };
      updatedCart = [newItem, ...cartItems];
    }

    setCartItems(updatedCart);
    localStorage.setItem('sy_cart_items', JSON.stringify(updatedCart));

    setCartToastMsg(`🛒 [${product.name}] 장바구니에 담겼습니다!`);
    setTimeout(() => setCartToastMsg(''), 4000);
  };

  const handleOpenPayment = (items: CartItem[]) => {
    const targetItems = items && items.length > 0 ? items : cartItems;
    setPaymentItems(targetItems);
    setActivePage('checkout');
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (orderData: any) => {
    const newBookingData = {
      name: orderData.buyerName,
      phone: orderData.buyerPhone,
      location: orderData.address,
      purpose: 'Residential' as const,
      memo: `[무료 시공상담/예약 접수 #${orderData.orderId}] ${orderData.items.map((i: any) => `${i.name} (${i.quantity}개)`).join(', ')} / 상담방식: ${orderData.consultationType || orderData.paymentMethod || '무료 현장실측'} / 요청: ${orderData.memo || '없음'}`,
      estimateCost: `₩${orderData.totalAmount.toLocaleString()}원 (예상 견적)`
    };
    handleAddBooking(newBookingData);

    const paidItemIds = new Set(orderData.items.map((i: any) => i.id));
    const remainingCart = cartItems.filter((i) => !paidItemIds.has(i.id));
    setCartItems(remainingCart);
    localStorage.setItem('sy_cart_items', JSON.stringify(remainingCart));
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCartItems(updated);
    localStorage.setItem('sy_cart_items', JSON.stringify(updated));
  };

  const handleRemoveCartItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('sy_cart_items', JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('sy_cart_items');
  };

  const handleAddBooking = (newBookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const freshBooking: Booking = {
      ...newBookingData,
      id: `booking-${Date.now()}`,
      status: '접수대기',
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false }).replace(/\. /g, '-').replace(':', ':')
    };

    const updated = [freshBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('sy_bookings', JSON.stringify(updated));

    // Create real-time admin notification
    const purposeName = freshBooking.purpose === 'Commercial' ? '아파트·공동주택' : freshBooking.purpose === 'ParkingLot' ? '상업시설·수익형' : '가정용·개인홈';
    const newNotif: AdminNotification = {
      id: `notif-bk-${Date.now()}`,
      type: freshBooking.purpose === 'Commercial' ? 'consultation' : 'booking',
      title: `[${purposeName}] 전기차 충전기 설치·실측 상담 예약`,
      customerName: freshBooking.name || '신청 고객',
      customerPhone: freshBooking.phone || '',
      location: freshBooking.location || freshBooking.address || '',
      memo: freshBooking.memo || freshBooking.notes || '',
      purpose: freshBooking.purpose,
      estimateCost: freshBooking.estimateCost,
      status: '접수대기',
      createdAt: freshBooking.createdAt,
      timestamp: Date.now(),
      isRead: false,
      targetId: freshBooking.id
    };

    setNotifications((prev) => {
      const updatedNotifs = [newNotif, ...prev];
      localStorage.setItem('sy_admin_notifications', JSON.stringify(updatedNotifs));
      return updatedNotifs;
    });
    setIsNotificationBannerDismissed(false);
    setShowLoginAlertToast(true);

    // Launch celebratory consultation confirmation modal with roadmap
    setConsultationSuccessData({
      name: freshBooking.name,
      phone: freshBooking.phone,
      location: freshBooking.location,
      purpose: freshBooking.purpose,
      memo: freshBooking.memo,
      bookingId: freshBooking.id,
      estimateCost: freshBooking.estimateCost,
      createdAt: freshBooking.createdAt
    });
    setIsConsultationSuccessOpen(true);
  };

  const handleAddASRequest = (newASData: Omit<ASRequest, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    const freshAS: ASRequest = {
      ...newASData,
      id: `as-${Date.now()}`,
      userId: user?.id || 'anonymous',
      status: '접수완료',
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false }).replace(/\. /g, '-').replace(':', ':')
    };

    const updated = [freshAS, ...asRequests];
    setAsRequests(updated);
    localStorage.setItem('sy_as', JSON.stringify(updated));

    // Create real-time admin notification
    const newNotif: AdminNotification = {
      id: `notif-as-${Date.now()}`,
      type: 'as',
      title: `[긴급 A/S] ${freshAS.productName || '전기차 충전기 수리/점검'} 접수`,
      customerName: freshAS.userName || '고객',
      customerPhone: freshAS.phone || '',
      location: freshAS.locationAddress || '',
      memo: freshAS.symptom || freshAS.description || '',
      status: '접수완료',
      createdAt: freshAS.createdAt,
      timestamp: Date.now(),
      isRead: false,
      targetId: freshAS.id
    };

    setNotifications((prev) => {
      const updatedNotifs = [newNotif, ...prev];
      localStorage.setItem('sy_admin_notifications', JSON.stringify(updatedNotifs));
      return updatedNotifs;
    });
    setIsNotificationBannerDismissed(false);
    setShowLoginAlertToast(true);
  };

  // CMS configuration save handlers
  const handleSaveLogoConfig = (config: any) => {
    setLogoConfig(config);
    localStorage.setItem('sy_cms_logo', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveCategoryLabels = (labels: any) => {
    setCategoryLabels(labels);
    localStorage.setItem('sy_cms_categories', JSON.stringify(labels));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveHeaderConfig = (config: HeaderConfig) => {
    setHeaderConfig(config);
    localStorage.setItem('sy_cms_header', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveFooterConfig = (config: any) => {
    setFooterConfig(config);
    localStorage.setItem('sy_cms_footer', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveHeroConfig = (config: any) => {
    setHeroConfig(config);
    localStorage.setItem('sy_cms_hero', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveAboutConfig = (config: any) => {
    setAboutConfig(config);
    localStorage.setItem('sy_cms_about', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveSnsConfig = (config: any) => {
    setSnsConfig(config);
    localStorage.setItem('sy_cms_sns', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveQuickMenuConfig = (config: any) => {
    setQuickMenuConfig(config);
    localStorage.setItem('sy_cms_quickmenu', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveQuoteConfig = (config: any) => {
    setQuoteConfig(config);
    localStorage.setItem('sy_cms_quote', JSON.stringify(config));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveProducts = (newProducts: Product[]) => {
    const getCanonicalProductImage = (name?: string, power?: string, type?: string) => {
      const s = `${name || ''} ${power || ''} ${type || ''}`.toLowerCase();
      if (s.includes('50kw') || s.includes('급속') || s.includes('dc50')) return '/50kw-쿨차지.png';
      if (s.includes('스필') || s.includes('sy-ac')) return '/스필.png';
      if (s.includes('쿨차지') || s.includes('coolcharge')) return '/쿨차지.png';
      if (s.includes('일렉트리') || s.includes('electree')) return '/일렉트리.png';
      if (s.includes('차지고') || s.includes('chargego')) return '/차지고.png';
      return '/스필.png';
    };

    // Validate that every product has a clean, non-empty image
    const validatedProducts = newProducts.map(p => {
      let img = (p.image && p.image.trim()) ? p.image.trim() : '';
      if (!img || img.includes('unsplash.com')) {
        img = getCanonicalProductImage(p.name, p.power, p.type);
      }
      return {
        ...p,
        image: img
      };
    });

    setProducts(validatedProducts);
    try {
      const dataStr = JSON.stringify(validatedProducts);
      localStorage.setItem('sy_cms_products_v12', dataStr);
      localStorage.setItem('sy_cms_products', dataStr);
      // Clean up legacy duplicated key versions to save quota space
      localStorage.removeItem('sy_cms_products_v11');
      localStorage.removeItem('sy_cms_products_v10');
      localStorage.removeItem('sy_cms_products_v7');
      localStorage.removeItem('sy_cms_products_v6');
    } catch (e) {
      console.warn('LocalStorage quota warning (products saved to state):', e);
    }

    // Also sync homeProducts & parkingProducts in localStorage so SolutionsSection is updated instantly
    try {
      // 1. Sync Home Chargers (가정용 홈 충전기)
      const savedHome = localStorage.getItem('sy_cms_home_products_v6_fixed');
      const parsedHome = savedHome ? JSON.parse(savedHome) : JSON.parse(JSON.stringify(HOME_PRODUCTS_DATA));

      // 2. Sync Parking / Commercial Chargers (상업시설 충전기)
      const savedParking = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
      const parsedParking = savedParking ? JSON.parse(savedParking) : JSON.parse(JSON.stringify(PARKING_PRODUCTS_DATA));

      const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
      const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);

      const checkIsMatch = (item: any, np: Product, powerOrCatKey?: string) => {
        if (!item || !np) return false;
        if (item.id && np.id && item.id === np.id) return true;
        if (item.name && np.name && item.name.trim() === np.name.trim()) return true;
        if ((item.id === 'res-7kw-spil' || item.id === 'sy-ac07') && (np.id === 'res-7kw-spil' || np.id === 'sy-ac07')) return true;
        if ((item.id === 'res-5kw-spil' || item.id === 'sy-ac05') && (np.id === 'res-5kw-spil' || np.id === 'sy-ac05')) return true;
        if ((item.id === 'res-11kw-spil' || item.id === 'sy-ac11-bi') && (np.id === 'res-11kw-spil' || np.id === 'sy-ac11-bi')) return true;
        if ((item.id === 'park-50kw-1ch-coolcharge' || item.id === 'sy-dc50') && (np.id === 'park-50kw-1ch-coolcharge' || np.id === 'sy-dc50')) return true;
        if (item.name && np.name && item.name.toLowerCase().includes('50kw') && np.name.toLowerCase().includes('50kw')) return true;
        return false;
      };

      const REMOVED_SET = new Set([
        'sy-canopy-01',
        'sy-stand-01',
        'res-7kw-convenient',
        'res-7kw-safe',
        'res-7kw-hyundai',
        'res-7kw-pylon',
        'res-5kw-convenient',
        'res-5kw-safe',
        'sy-ac11',
        'park-11kw-convenient',
        'sy-fc200'
      ]);

      // Prune deleted items & legacy aliases
      Object.keys(parsedHome).forEach((powerKey) => {
        const seenNames = new Set<string>();
        parsedHome[powerKey] = (parsedHome[powerKey] || []).filter((item: any) => {
          if (!item || REMOVED_SET.has(item.id) || deletedSet.has(item.id)) return false;
          if (item.id === 'res-7kw-spil') item.id = 'sy-ac07';
          if (item.id === 'res-5kw-spil') item.id = 'sy-ac05';
          if (item.id === 'res-11kw-spil') item.id = 'sy-ac11-bi';
          const nameKey = (item.name || '').trim();
          if (seenNames.has(nameKey)) return false;
          seenNames.add(nameKey);
          return true;
        });
      });

      Object.keys(parsedParking).forEach((catKey) => {
        const seenNames = new Set<string>();
        parsedParking[catKey] = (parsedParking[catKey] || []).filter((item: any) => {
          if (!item || REMOVED_SET.has(item.id) || deletedSet.has(item.id)) return false;
          if (item.id === 'sy-dc50') item.id = 'park-50kw-1ch-coolcharge';
          const nameKey = (item.name || '').trim();
          if (seenNames.has(nameKey)) return false;
          seenNames.add(nameKey);
          return true;
        });
      });

      validatedProducts.forEach((np) => {
        if (!np || REMOVED_SET.has(np.id) || deletedSet.has(np.id)) return;
        let matched = false;
        const targetImg = (np.image && np.image.trim()) ? np.image.trim() : '';

        Object.keys(parsedHome).forEach((powerKey) => {
          parsedHome[powerKey] = parsedHome[powerKey].map((item: any) => {
            if (checkIsMatch(item, np, powerKey)) {
              matched = true;
              return {
                ...item,
                id: np.id,
                name: np.name || item.name,
                price: np.price !== undefined ? np.price : item.price,
                regularPrice: np.originalPrice !== undefined ? np.originalPrice : item.regularPrice,
                discount: np.discountRate !== undefined ? np.discountRate : item.discount,
                replacementPrice: np.replacementPrice !== undefined ? np.replacementPrice : item.replacementPrice,
                replacementRegularPrice: np.replacementRegularPrice !== undefined ? np.replacementRegularPrice : item.replacementRegularPrice,
                replacementDiscount: np.replacementDiscount !== undefined ? np.replacementDiscount : item.replacementDiscount,
                installIncludedPrice: np.installIncludedPrice !== undefined ? np.installIncludedPrice : item.installIncludedPrice,
                installIncludedRegularPrice: np.installIncludedRegularPrice !== undefined ? np.installIncludedRegularPrice : item.installIncludedRegularPrice,
                installIncludedDiscount: np.installIncludedDiscount !== undefined ? np.installIncludedDiscount : item.installIncludedDiscount,
                serviceType: np.serviceType || item.serviceType,
                image: targetImg || item.image,
                description: np.description || item.description,
                plcSupported: np.plcSupported !== undefined ? np.plcSupported : item.plcSupported,
                optionGroups: np.optionGroups || item.optionGroups,
              };
            }
            return item;
          });
        });

        Object.keys(parsedParking).forEach((catKey) => {
          parsedParking[catKey] = parsedParking[catKey].map((item: any) => {
            if (checkIsMatch(item, np, catKey)) {
              matched = true;
              return {
                ...item,
                name: np.name || item.name,
                price: np.price !== undefined ? np.price : item.price,
                regularPrice: np.originalPrice || item.regularPrice,
                discount: np.discountRate !== undefined ? np.discountRate : item.discount,
                replacementPrice: np.replacementPrice,
                replacementRegularPrice: np.replacementRegularPrice,
                replacementDiscount: np.replacementDiscount,
                installIncludedPrice: np.installIncludedPrice,
                installIncludedRegularPrice: np.installIncludedRegularPrice,
                installIncludedDiscount: np.installIncludedDiscount,
                serviceType: np.serviceType || item.serviceType,
                image: targetImg || item.image,
                description: np.description || item.description,
                plcSupported: np.plcSupported !== undefined ? np.plcSupported : item.plcSupported,
                optionGroups: np.optionGroups || item.optionGroups,
              };
            }
            return item;
          });
        });

        // If this product is brand new and not yet present in home/parking sections
        if (!matched && !REMOVED_SET.has(np.id) && (np as any).type !== '스탠드' && (np as any).type !== '악세사리') {
          const newItem = {
            id: np.id,
            name: np.name,
            description: np.description || '',
            price: np.price || 0,
            regularPrice: np.originalPrice || np.price || 0,
            discount: np.discountRate || 0,
            image: np.image || '/스필.png',
            features: np.features || [],
            plcSupported: np.plcSupported,
            powerTag: np.power || '7kW',
            options: [],
            optionGroups: np.optionGroups || []
          };

          if (np.type === '급속' || np.type === '초급속' || (np.power && ['50kW', '100kW', '200kW', '35kW', '50kw', '100kw', '200kw', '35kw'].some(k => np.power?.includes(k)))) {
            const targetCat = '공용 BIZ 충전기';
            if (!parsedParking[targetCat]) parsedParking[targetCat] = [];
            parsedParking[targetCat].push(newItem);
          } else if (np.type === '완속' || ['5kW', '7kW', '11kW', '5kw', '7kw', '11kw'].some(k => (np.power || '').includes(k))) {
            const targetPower = (np.power && parsedHome[np.power]) ? np.power : '7kW';
            if (!parsedHome[targetPower]) parsedHome[targetPower] = [];
            parsedHome[targetPower].push(newItem);
          }
        }
      });

      // Prune items from parsedHome & parsedParking that were deleted from newProducts or in REMOVED_SET
      Object.keys(parsedHome).forEach((powerKey) => {
        parsedHome[powerKey] = parsedHome[powerKey].filter((item: any) => {
          if (!item || REMOVED_SET.has(item.id)) return false;
          return newProducts.some((np) => checkIsMatch(item, np, powerKey));
        });
      });

      Object.keys(parsedParking).forEach((catKey) => {
        parsedParking[catKey] = parsedParking[catKey].filter((item: any) => {
          if (!item || REMOVED_SET.has(item.id)) return false;
          return newProducts.some((np) => checkIsMatch(item, np, catKey));
        });
      });

      localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(parsedHome));
      localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(parsedParking));
      localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(parsedParking));

      // Dispatch event for real-time component updates
      window.dispatchEvent(new Event('sy_cms_products_update'));
    } catch (e) {
      console.error('Failed to sync home products', e);
    }
  };

  const handleSaveSolutions = (newSolutions: Solution[]) => {
    setSolutions(newSolutions);
    localStorage.setItem('sy_cms_solutions', JSON.stringify(newSolutions));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('sy_cms_reviews', JSON.stringify(newReviews));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveFaqs = (newFaqs: FAQ[]) => {
    setFaqs(newFaqs);
    localStorage.setItem('sy_cms_faqs', JSON.stringify(newFaqs));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleSaveNotices = (newNotices: any[]) => {
    setNotices(newNotices);
    localStorage.setItem('sy_cms_notices', JSON.stringify(newNotices));
    window.dispatchEvent(new Event('sy_cms_products_update'));
  };

  const handleResetAll = () => {
    localStorage.removeItem('sy_cms_logo');
    localStorage.removeItem('sy_cms_categories');
    localStorage.removeItem('sy_cms_header');
    localStorage.removeItem('sy_cms_footer');
    localStorage.removeItem('sy_cms_hero');
    localStorage.removeItem('sy_cms_about');
    localStorage.removeItem('sy_cms_products');
    localStorage.removeItem('sy_cms_solutions');
    localStorage.removeItem('sy_cms_reviews');
    localStorage.removeItem('sy_cms_faqs');
    localStorage.removeItem('sy_cms_notices');
    localStorage.removeItem('sy_cms_sns');
    localStorage.removeItem('sy_cms_quickmenu');
    localStorage.removeItem('sy_cms_quote');

    setLogoConfig({
      text: 'SY',
      subtitle: 'SY.com',
      imageUrl: '',
      height: 48,
      showCompanyName: true,
      companyNameText: '(유)에스와이닷컴',
      companyNameFont: 'noto',
      companyNameWeight: 'extrabold',
      companyNameSize: 'sm',
      companyNameColor: 'slate-700'
    });

    setCategoryLabels({
      home: '홈',
      about: '회사소개',
      products: '가정용',
      solutions: '아파트',
      review: '설치후기',
      support: '상업시설',
      sol_commercial: '아파트',
      sol_residential: '가정용 홈',
      sol_parking: '상업시설 수익형'
    });

    setHeaderConfig({
      inquiryTitlePc: '⚡ 전기차충전기 설치문의',
      shortcutCommercialPc: '⚡ 아파트 · 공동주택',
      shortcutResidentialPc: '🏠 가정용 · 개인 홈',
      shortcutParkingPc: '🏢 상업시설 · 수익형',
      inquiryTitleMobile: '⚡ 전기차충전기 설치문의',
      shortcutCommercialMobile: '⚡ 아파트 · 공동주택',
      shortcutResidentialMobile: '🏠 가정용 · 개인 홈',
      shortcutParkingMobile: '🏢 상업시설 · 수익형',
      syncMobileWithPc: true
    });

    setFooterConfig({
      phone: '1588-SY01 (A/S 정비 전담 지원)',
      email: 'sy.car.com@gmail.com',
      companyName: '(유)에스와이닷컴',
      ceoName: '박우혁',
      businessNumber: '123-45-67890',
      address: '서울특별시 강남구 테헤란로 OOO 타워 SY빌딩',
      teleSalesNumber: '제 2026-서울강남-1234호',
      licenseInfo: '모든 전기공사는 국가 정식 전기공사업 면허(제 OO-12345호) 보유 유자격 전담 시공팀이 직접 배정되어 법을 준수합니다.'
    });

    setHeroConfig({
      badge: '전국 최대 원스톱 설치 네트워크',
      title: '대한민국 어디든,<br />전기차가 멈추는 곳엔 <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">SY.com</span>',
      description: '전국 최대 전력 인프라망을 바탕으로 완벽 설계, 까다로운 지자체 정부 무상 보조금 신청 대행, 한전 계량기 수급 및 사후 24시간 철저 정비 관리까지 원스톱으로 명쾌하게 해결하세요.',
      ctaButton: '👉 30초 만에 무료 설치 상담 예약하기',
      calcButton: '1분 스마트 보조금 견적 내기',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      showHeroImage: true,
      titleSize: 'large' as 'small' | 'medium' | 'large' | 'xlarge',
      descriptionSize: 'medium' as 'small' | 'medium' | 'large',
      liveCountStart: 14520,
      liveCountLabel: '현재 전국 SY.com 충전기 설치 현황',
      liveCountSuffix: '대 돌파',
      solutionBlueSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge',
      commercialBlueText: '회사 사옥, 물류창고, 공장, 관공서 전용',
      residentialBlueText: '단독주택, 빌라, 아파트(개인/공용) 전용',
      parkingBlueText: '대형 마트, 호텔, 빌딩, 공영주차장 맞춤',
      quickContact1: '환경부지원 아파트 무상설치 문의 ⚡',
      quickContact2: '가정용 · 홈 충전기 설치문의 🏠',
      quickContact3: '상업시설 · 수익형 충전기 설치문의 🏢'
    });

    setQuoteConfig({
      badge: '정부보조금 마감 임박 혜택 우선 선점',
      title: '무료 설치 상담 & 실시간 맞춤 견적',
      submitButton: '👉 30초 만에 무료 설치 상담 예약하기',
      successTitle: '상담 신청이 정상 접수되었습니다!',
      successDesc: '올해 배정된 정부 보조금 잔여 한도 선점을 위해, 2시간 이내에 담당 전문 컨설턴트가 기재해 주신 번호로 연락드리겠습니다.',
      privacyNotice: '안심 보증 정책: 입력하신 정보는 한전 한도 및 정부 무상 보조금 산정 용도로만 안전하게 활용되며, 전문 법률에 따라 개인정보보호법을 철저히 준수합니다.',
      directPhone: '1588-SY01',
      directKakaoUrl: 'https://pf.kakao.com/',
      purposeLabels: {
        Residential: '가정용 홈 (단독주택/빌라/개인)',
        Commercial: '아파트용 (공동주택/공용시설)',
        ParkingLot: '상업시설 수익형 (호텔/마트/상가빌딩)'
      },
      fields: DEFAULT_FIELDS
    });

    setSnsConfig({
      kakaoUrl: 'https://pf.kakao.com/',
      instagramUrl: 'https://www.instagram.com/',
      blogUrl: 'https://section.blog.naver.com/',
      youtubeUrl: 'https://www.youtube.com/',
      showFloatingSns: true
    });

    setQuickMenuConfig({
      showQuickMenu: true,
      items: [
        { id: 'q-1', label: '설치후기', iconType: 'MapPin', targetPage: 'review' },
        { id: 'q-2', label: '아파트 충전', iconType: 'Building2', targetPage: 'solutions' },
        { id: 'q-3', label: '가정용 홈', iconType: 'Home', targetPage: 'solutions' },
        { id: 'q-4', label: '학교&관공서', iconType: 'GraduationCap', targetPage: 'solutions' },
        { id: 'q-5', label: '상업시설 수익형', iconType: 'ParkingCircle', targetPage: 'solutions' },
        { id: 'q-6', label: '급속충전기', iconType: 'Zap', targetPage: 'products' },
        { id: 'q-7', label: '기기 교체', iconType: 'RefreshCw', targetPage: 'support' },
        { id: 'q-8', label: '홍보수익형', iconType: 'TrendingUp', targetPage: 'about' }
      ]
    });

    setAboutConfig({
      ceoName: '박 우 혁 대표이사',
      ceoRole: 'SY.com Co., Ltd. Founder & CEO',
      ceoGreeting: '"지속 가능한 전기차 운전의 첫걸음, \n내 주차장에서 시작되는 안전과 편안함입니다."',
      ceoMessage1: '안녕하십니까, SY.com 대표이사 박우혁입니다. 대한민국 도로 위에 친환경 전기차가 급증하면서 이제 충전 인프라는 선택이 아닌 필수 주거/상업 복지 인프라가 되었습니다.',
      ceoMessage2: '하지만 최근 다중이용시설 및 주거지역 내 전기차 충전 중의 크고 작은 전기적 트러블과 화재 위험에 대한 우려로 입주민 협의를 보지 못하고 설치를 망설이시는 고객분들이 많습니다.',
      ceoMessage3: '저희 SY.com은 특허청에 등록된 차세대 화재감지 PLC 모뎀 차단 기술과 실시간 과열 진단 모니터링을 전 기종에 도입하여 완벽히 안전한 스마트 충전 생태계를 이룩했습니다. 설계부터 번거로운 관공서/한전/지자체 보조금 심사 서류 신청까지, SY.com 전 직원이 발로 뛰며 고객님의 편안함을 완성하겠습니다.',
      ceoImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600'
    });

    setProducts(PRODUCTS);
    setSolutions(SOLUTIONS);
    setReviews(REVIEWS);
    setFaqs(FAQS);
    setNotices(NOTICES);
  };

  const handleOpenCmsTab = (tab: any) => {
    if (!isEditMode) {
      alert('대표자 프로필 사진 및 콘텐츠 편집은 관리자 전용 기능입니다. 관리자로 로그인해 주세요.');
      setIsAdminLoginOpen(true);
      return;
    }
    setCmsTab(tab);
    setIsCmsOpen(true);
  };

  // Dedicated Open quote with specific purpose pre-selected
  const handleOpenQuoteWithPurpose = (purpose: 'Commercial' | 'Residential' | 'ParkingLot') => {
    setQuoteDefaultPurpose(purpose);
    setIsQuoteOpen(true);
  };

  const handleOpenMyPageAS = () => {
    handlePageChange('mypage');
  };

  const handlePageChange = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAptBrand = (brand: string) => {
    setSelectedAptBrand(brand);
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
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <>
            <MainHero
              heroConfig={heroConfig}
              quickMenuConfig={quickMenuConfig}
              onPageChange={handlePageChange}
              isEditMode={isEditMode}
              onOpenCms={handleOpenCmsTab}
              onOpenQuote={() => handleOpenQuoteWithPurpose('Residential')}
              onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose}
              onOpenMyPageAS={handleOpenMyPageAS}
              onOpenAuth={() => setIsAuthOpen(true)}
              isLoggedIn={!!user}
              mobileDesignConfig={mobileDesignConfig}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
              <ReviewSection 
                reviews={reviews}
                isEditMode={isEditMode}
                onOpenCms={handleOpenCmsTab}
                onDeleteReview={(id) => handleSaveReviews(reviews.filter((r) => r.id !== id))}
                onSaveReviews={handleSaveReviews}
              />
            </div>
          </>
        );
      case 'about':
        return (
          <AboutSection 
            aboutConfig={aboutConfig} 
            isEditMode={isEditMode} 
            onOpenCms={handleOpenCmsTab} 
          />
        );
      case 'products':
        return (
          <ProductsSection
            products={products}
            isEditMode={isEditMode}
            onOpenCms={handleOpenCmsTab}
            onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose}
            onAddToCart={handleAddToCart}
            onOpenPayment={handleOpenPayment}
          />
        );
      case 'solutions':
      case 'sol_residential':
        return (
          <SolutionsSection 
            key="sol_residential"
            solutions={solutions}
            isEditMode={isEditMode}
            user={user}
            onOpenCms={handleOpenCmsTab}
            onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose} 
            onPageChange={handlePageChange}
            defaultActiveTab="Residential"
            selectedHomePower={selectedHomePower}
            onSelectHomePower={setSelectedHomePower}
            selectedHomeServiceType={selectedHomeServiceType}
            onSelectHomeServiceType={setSelectedHomeServiceType}
            onAddToCart={handleAddToCart}
            onOpenCartModal={() => handlePageChange('cart')}
            onOpenPayment={handleOpenPayment}
          />
        );
      case 'sol_commercial':
        return (
          <SolutionsSection 
            key="sol_commercial"
            solutions={solutions}
            isEditMode={isEditMode}
            user={user}
            onOpenCms={handleOpenCmsTab}
            onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose} 
            onPageChange={handlePageChange}
            defaultActiveTab="Commercial"
            selectedAptBrand={selectedAptBrand}
            onSelectAptBrand={handleSelectAptBrand}
            onAddToCart={handleAddToCart}
            onOpenCartModal={() => handlePageChange('cart')}
            onOpenPayment={handleOpenPayment}
          />
        );
      case 'sol_parking':
        return (
          <SolutionsSection 
            key="sol_parking"
            solutions={solutions}
            isEditMode={isEditMode}
            user={user}
            onOpenCms={handleOpenCmsTab}
            onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose} 
            onPageChange={handlePageChange}
            defaultActiveTab="ParkingLot"
            selectedParkingCapacity={selectedParkingCapacity}
            onSelectParkingCapacity={setSelectedParkingCapacity}
            onAddToCart={handleAddToCart}
            onOpenCartModal={() => handlePageChange('cart')}
            onOpenPayment={handleOpenPayment}
          />
        );
      case 'review':
        return (
          <ReviewSection 
            reviews={reviews}
            isEditMode={isEditMode}
            onOpenCms={handleOpenCmsTab}
            onDeleteReview={(id) => handleSaveReviews(reviews.filter((r) => r.id !== id))}
            onSaveReviews={handleSaveReviews}
          />
        );
      case 'support':
        return (
          <SupportSection
            faqs={faqs}
            notices={notices}
            isEditMode={isEditMode}
            onOpenCms={handleOpenCmsTab}
            onOpenMyPageAS={handleOpenMyPageAS}
            onOpenAuth={() => setIsAuthOpen(true)}
            isLoggedIn={!!user}
            onAddInquiry={(inquiry) => {
              handleAddBooking({
                name: inquiry.name,
                phone: inquiry.phone,
                location: '1:1 온라인 고객센터 문의',
                purpose: 'Residential',
                memo: inquiry.memo,
                estimateCost: '상담 후 견적 산출'
              });
            }}
          />
        );
      case 'admin':
        return (
          <AdminPage
            products={products}
            onSaveProducts={handleSaveProducts}
            brands={brands}
            onSaveBrands={handleSaveBrands}
            bookings={bookings}
            asRequests={asRequests}
            snsConfig={snsConfig}
            onSaveSnsConfig={handleSaveSnsConfig}
            footerConfig={footerConfig}
            onSaveFooterConfig={handleSaveFooterConfig}
            homePopupConfig={homePopupConfig}
            onSaveHomePopupConfig={handleSaveHomePopupConfig}
            onPreviewPopup={(cfg) => handlePreviewPopup(cfg)}
            onNavigateHome={() => handlePageChange('home')}
          />
        );
      case 'cart':
        return (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenQuoteWithItems={(items) => {
              handleOpenPrintEstimate(items);
            }}
            onOpenPayment={handleOpenPayment}
            onPageChange={handlePageChange}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            items={paymentItems.length > 0 ? paymentItems : cartItems}
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
            onPageChange={handlePageChange}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onOpenMyPage={() => handlePageChange('mypage')}
            onOpenLegalModal={handleOpenLegalModal}
          />
        );
      case 'mypage':
        return (
          <MyProfilePage
            user={user}
            onLogout={handleLogout}
            cartItems={cartItems}
            bookings={bookings}
            asRequests={asRequests}
            onPageChange={handlePageChange}
            onOpenQuoteModal={() => setIsQuoteOpen(true)}
            isEditMode={isEditMode}
            onUpdateUserProfileImage={(imgUrl) => {
              const updated = { ...user, profileImage: imgUrl };
              setUser(updated);
              localStorage.setItem('sy_logged_user', JSON.stringify(updated));
            }}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('sy_logged_user', JSON.stringify(updated));
            }}
            onOpenAuthModal={() => setIsAuthOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  if (isSyncing) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-[9999]">
        <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl animate-pulse">⚡</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black tracking-tight text-white">데이터베이스 동기화 중</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              안전한 클라우드 데이터베이스(Firebase)로부터 최신 홈페이지 설정 정보를 동기화하고 있습니다. 잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-900 font-sans flex flex-col justify-between">
      {/* Admin Top Control Banner (Visible ONLY when logged in as Admin) */}
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xl border-b border-indigo-500/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-extrabold text-blue-300">⚡ SY.com 관리자 모드 접속됨</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline border-l border-slate-700 pl-2">
              관리자 계정: <strong>{localStorage.getItem('sy_admin_id') || 'admin'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCmsTab('brand')}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>📁 CMS 에디터 열기</span>
            </button>
            <button
              onClick={() => {
                setIsEditMode(false);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1 border border-slate-700"
            >
              <span>🔒 관리자 로그아웃</span>
            </button>
          </div>
        </div>
      )}

      {/* Spacer container to match the fixed Header height and prevent page content overlap */}
      <div className={`w-full shrink-0 transition-all duration-200 ${
        isEditMode
          ? activePage === 'sol_commercial' || activePage === 'sol_residential' || activePage === 'sol_parking' || activePage === 'home' || activePage === 'about' || activePage === 'review'
            ? 'h-[150px] sm:h-[155px]'
            : 'h-[115px] sm:h-[120px]'
          : activePage === 'sol_commercial' || activePage === 'sol_residential' || activePage === 'sol_parking' || activePage === 'home' || activePage === 'about' || activePage === 'review'
            ? 'h-[115px] sm:h-[120px]'
            : 'h-[80px] sm:h-[85px]'
      }`}>
        <Header
          user={user}
          activePage={activePage}
          onPageChange={handlePageChange}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenMyPage={() => handlePageChange('mypage')}
          onOpenQuote={() => handleOpenQuoteWithPurpose('Residential')}
          onOpenQuoteWithPurpose={handleOpenQuoteWithPurpose}
          isEditMode={isEditMode}
          onToggleEditMode={() => {
            if (!isEditMode) {
              setIsAdminLoginOpen(true);
            } else {
              setIsEditMode(false);
            }
          }}
          onOpenCms={handleOpenCmsTab}
          categoryLabels={categoryLabels}
          logoConfig={logoConfig}
          snsConfig={snsConfig}
          footerConfig={footerConfig}
          selectedAptBrand={selectedAptBrand}
          onSelectAptBrand={handleSelectAptBrand}
          selectedHomePower={selectedHomePower}
          onSelectHomePower={setSelectedHomePower}
          selectedHomeServiceType={selectedHomeServiceType}
          onSelectHomeServiceType={setSelectedHomeServiceType}
          selectedParkingCapacity={selectedParkingCapacity}
          onSelectParkingCapacity={setSelectedParkingCapacity}
          headerConfig={headerConfig}
          cartCount={(cartItems || []).reduce((acc, i) => acc + (i?.quantity || 1), 0)}
          onOpenCartModal={() => handlePageChange('cart')}
          mobileDesignConfig={mobileDesignConfig}
          onOpenMobileDesignCenter={(user?.isAdmin || isEditMode) ? () => setIsMobileDesignCenterOpen(true) : undefined}
          unreadNotificationCount={(notifications || []).filter((n) => !n.isRead).length}
          onOpenNotificationCenter={(user?.isAdmin || isEditMode) ? () => setIsNotificationCenterOpen(true) : undefined}
        />

        {/* Real-time Admin Notification Center & Top Floating Alert Toast */}
        {(user?.isAdmin || isEditMode) && (
          <>
            <AdminNotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onDeleteNotification={handleDeleteNotification}
              onNavigateToAdmin={(tab) => {
                handlePageChange('admin');
                window.dispatchEvent(new CustomEvent('sy_admin_switch_tab', { detail: { tab: tab || 'inquiries' } }));
              }}
              isBannerDismissed={isNotificationBannerDismissed}
              onDismissBanner={() => setIsNotificationBannerDismissed(true)}
              isOpen={isNotificationCenterOpen}
              onClose={() => setIsNotificationCenterOpen(false)}
            />
            {showLoginAlertToast && (notifications || []).filter((n) => !n.isRead).length > 0 && (
              <AdminLoginAlertToast
                notifications={notifications}
                onNavigateToAdmin={(tab) => {
                  handlePageChange('admin');
                  window.dispatchEvent(new CustomEvent('sy_admin_switch_tab', { detail: { tab: tab || 'inquiries' } }));
                }}
                onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
                onMarkAsRead={handleMarkNotificationAsRead}
                onClose={() => setShowLoginAlertToast(false)}
              />
            )}
          </>
        )}



      </div>

      {/* Main Container */}
      <main className={`flex-grow w-full ${
        activePage === 'home'
          ? 'py-0 pb-12 sm:pb-8 px-0 w-full'
          : activePage === 'sol_commercial' || activePage === 'sol_residential' || activePage === 'sol_parking' || activePage === 'products'
          ? 'py-0 pb-12 sm:pb-8 px-0 sm:px-6 lg:px-8 max-w-7xl mx-auto' 
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12 sm:pb-8'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating SNS & Quick Navigation Bar on the Right side (Collapsible & Mobile Optimized) */}
      {snsConfig.showFloatingSns && (
        <div className="fixed right-3 bottom-30 sm:right-6 sm:bottom-28 z-40 flex flex-col gap-2 items-end">
          {/* Collapsed Compact State */}
          {isQuickPanelCollapsed ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5"
            >
              {/* Quick Design Center shortcut (Only for Admin / Edit Mode) */}
              {(user?.isAdmin || isEditMode) && (
                <button
                  onClick={() => setIsMobileDesignCenterOpen(true)}
                  title="모바일 디자인 설정 열기"
                  className="bg-slate-900/90 hover:bg-slate-900 text-emerald-300 p-2.5 rounded-full shadow-lg border border-slate-700 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}

              {/* Expand Quick Panel Button */}
              <button
                onClick={() => setIsQuickPanelCollapsed(false)}
                title="빠른 상담 & SNS 패널 펼치기"
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-full shadow-xl flex items-center gap-1.5 transition-all border border-emerald-400 cursor-pointer animate-pulse hover:animate-none"
              >
                <MessageSquare className="w-4 h-4" />
                <span>빠른상담</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            /* Expanded Panel with Full Options */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="flex flex-col gap-2.5 items-center"
            >
              {/* Box Wrapper with elegant glassmorphism and shadow */}
              <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col gap-2.5 items-center relative">
                {/* Fold button */}
                <button
                  onClick={() => setIsQuickPanelCollapsed(true)}
                  title="패널 접기"
                  className="w-full py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>접기</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Instagram URL */}
                <a
                  href={snsConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="인스타그램 방문"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                {/* YouTube URL */}
                <a
                  href={snsConfig.youtubeUrl || 'https://www.youtube.com/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="유튜브 채널 방문"
                  className="w-10 h-10 rounded-full bg-[#FF0000] hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                >
                  <Youtube className="w-5 h-5" />
                </a>

                {/* Naver Blog URL */}
                <a
                  href={snsConfig.blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="공식 블로그 방문"
                  className="w-10 h-10 rounded-full bg-[#03C75A] hover:scale-110 active:scale-95 flex items-center justify-center text-white text-[10px] font-black shadow-md transition-all cursor-pointer font-mono"
                >
                  blog
                </a>

                {/* Re-open Warranty / Popup Button */}
                <button
                  onClick={() => setIsHomePopupOpen(true)}
                  title="품질보증서 / 정품등록 팝업 열기"
                  className="w-10 h-10 rounded-full bg-purple-800 hover:bg-purple-900 hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer border border-purple-400/40"
                >
                  <span className="text-sm">📜</span>
                </button>

                {/* Design Center shortcut (Only for Admin / Edit Mode) */}
                {(user?.isAdmin || isEditMode) && (
                  <button
                    onClick={() => setIsMobileDesignCenterOpen(true)}
                    title="모바일 화면 디자인 센터"
                    className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 hover:scale-110 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer border border-emerald-400/40"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Scroll Top / Bottom buttons */}
              <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-1.5 items-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  title="맨 위로 가기"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  title="맨 아래로 가기"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Urgent Bottom Call To Action Sticky Banner (Satisfying CTA Button "올해 마감 임박 정부 보조금 혜택 선점") */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 border-t border-emerald-400/30 py-5 px-4 shadow-xl text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-yellow-300 shrink-0 shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-white leading-snug">
                "지금 신청하시면, 올해 마감 임박한 정부 보조금 혜택을 우선 선점해 드립니다."
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-50 font-bold mt-0.5">
                지자체 예산 소진 전 한전 불입금 무료 대행과 특허 세이프티 시공 패키지를 즉시 확보하세요.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenQuoteWithPurpose('Residential')}
            id="btn-footer-sticky-cta"
            className="w-full sm:w-auto py-3.5 px-7 bg-yellow-400 hover:bg-yellow-300 active:scale-98 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center gap-1.5 shrink-0 shadow-xl cursor-pointer border border-yellow-300/50 shadow-yellow-500/20"
          >
            <span>👉 30초 만에 무료 설치 상담 예약하기</span>
          </button>
        </div>
      </div>

      {/* Footer (Premium, honest, and highly clean with bright emerald green theme) */}
      <footer className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-emerald-50 py-12 border-t border-emerald-400/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Branding & description */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                {logoConfig.imageUrl ? (
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={logoConfig.imageUrl} 
                      alt={logoConfig.subtitle} 
                      className="h-8 max-w-[140px] object-contain brightness-0 invert opacity-95"
                      referrerPolicy="no-referrer"
                    />
                    {logoConfig.companyNameText && (
                      <span className="font-extrabold text-white text-sm sm:text-base tracking-tight pl-2.5 border-l border-emerald-400/50">
                        {logoConfig.companyNameText}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm tracking-tight border border-emerald-400/35">
                      {logoConfig.text}
                    </div>
                    <span className="font-extrabold text-white text-base tracking-tight">
                      {logoConfig.subtitle}
                    </span>
                    {logoConfig.companyNameText && (
                      <span className="font-medium text-emerald-100 text-xs sm:text-sm tracking-tight pl-2.5 border-l border-emerald-400/50">
                        {logoConfig.companyNameText}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-sm">
                {logoConfig.subtitle}은 대한민국 환경부 공식 대행 사업 파트너로서 친환경 과열감지 차단 기술 탑재 완속 및 초급속 충전기를 설계부터 국가보조금 지원까지 책임 시공합니다.
              </p>
              <div className="text-xs text-emerald-100 space-y-1">
                <p><span className="text-emerald-200/80">전국 통합 대표번호:</span> <span className="text-white font-bold">{footerConfig.phone}</span></p>
                <p><span className="text-emerald-200/80">사업 제휴 메일:</span> <span className="text-white font-bold">{footerConfig.email}</span></p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">주요 카테고리</h4>
              <ul className="text-xs space-y-2 text-left">
                <li><button onClick={() => setActivePage('about')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">{categoryLabels.about || '회사소개'}</button></li>
                <li><button onClick={() => setActivePage('sol_commercial')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">{categoryLabels.sol_commercial || '아파트'} 솔루션</button></li>
                <li><button onClick={() => setActivePage('sol_residential')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">{categoryLabels.sol_residential || '가정용 홈'} 솔루션</button></li>
                <li><button onClick={() => setActivePage('sol_parking')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">{categoryLabels.sol_parking || '상업시설 수익형'} 솔루션</button></li>
                <li><button onClick={() => setActivePage('review')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">{categoryLabels.review || '설치후기'}</button></li>
                <li><button onClick={() => setActivePage('support')} className="text-emerald-100 hover:text-white transition-colors cursor-pointer">고객지원</button></li>
              </ul>
            </div>

            {/* Legal and compliance footnotes */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">회사 정보 및 면책 고지</h4>
              <p className="text-[11px] text-emerald-100/95 leading-relaxed">
                <span className="text-emerald-200/80">상호:</span> {footerConfig.companyName} | <span className="text-emerald-200/80">대표이사:</span> {footerConfig.ceoName} | <span className="text-emerald-200/80">사업자등록번호:</span> {footerConfig.businessNumber} <br />
                <span className="text-emerald-200/80">주소:</span> {footerConfig.address} <br />
                <span className="text-emerald-200/80">통신판매업신고번호:</span> {footerConfig.teleSalesNumber} <br />
                <span className="text-emerald-200/80">{footerConfig.licenseInfo}</span>
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-500/20 text-xs text-emerald-200/85 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left space-y-1">
              <p>© 2026 {logoConfig.subtitle} Co., Ltd. All Rights Reserved.</p>
              <p className="text-[10px] text-emerald-300/80 font-medium">
                ※ 본사 직영 책임시공 (신청 후 24시간 내 전문 엔지니어 1:1 상담 및 무료 현장 실측 · 7일 내 착공) | 100% 무료 사전 방문 진단 서비스
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
              <button
                onClick={() => handleOpenLegalModal('refund')}
                className="font-bold text-emerald-300 hover:text-white hover:underline cursor-pointer bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px]"
              >
                🔄 환불 / 취소 정책
              </button>
              <button
                onClick={() => handleOpenLegalModal('terms')}
                className="hover:text-white hover:underline cursor-pointer text-emerald-200/90 text-[11px]"
              >
                이용약관
              </button>
              <button
                onClick={() => handleOpenLegalModal('privacy')}
                className="hover:text-white hover:underline cursor-pointer text-emerald-200/90 text-[11px]"
              >
                개인정보처리방침
              </button>
              <button
                onClick={() => handleOpenLegalModal('escrow')}
                className="hover:text-white hover:underline cursor-pointer text-emerald-200/90 text-[11px]"
              >
                구매안전(에스크로) 안내
              </button>
              {user?.isAdmin && (
                <button
                  onClick={() => handlePageChange('admin')}
                  className="hover:text-white hover:underline cursor-pointer text-emerald-200/90 hover:text-white flex items-center gap-1 text-[11px] ml-2 font-bold"
                  title="관리자 센터 이동"
                >
                  <span>🔧 관리자 대시보드</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Bottom Action Bar (Sticky Quick Action for Mobile Conversion) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 shadow-2xl flex items-center gap-2">
        <a
          href={`tel:${footerConfig.phone.split(' ')[0] || '010-8647-7975'}`}
          className="flex-1 py-2.5 bg-slate-900 active:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>전화상담</span>
        </a>
        <button
          onClick={() => handleOpenQuoteWithPurpose('Residential')}
          className="flex-[1.5] py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>⚡ 1분 무료 견적</span>
        </button>
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {isLegalModalOpen && (
          <LegalTermsModal
            isOpen={isLegalModalOpen}
            onClose={() => setIsLegalModalOpen(false)}
            initialTab={legalModalTab}
          />
        )}
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={handleLogin}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}
        
        {isQuoteOpen && (
          <QuoteModal
            isOpen={isQuoteOpen}
            onClose={() => setIsQuoteOpen(false)}
            onSubmitBooking={handleAddBooking}
            initialPurpose={quoteDefaultPurpose}
            initialBrand={selectedAptBrand}
            initialHomePower={selectedHomePower}
            initialHomeServiceType={selectedHomeServiceType}
            quoteConfig={quoteConfig}
          />
        )}

        <ConsultationSuccessModal
          isOpen={isConsultationSuccessOpen}
          onClose={() => {
            setIsConsultationSuccessOpen(false);
            setConsultationSuccessData(null);
          }}
          data={consultationSuccessData}
        />

        {isCartOpen && (
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenQuoteWithItems={(items) => {
              setIsCartOpen(false);
              handleOpenPrintEstimate(items);
            }}
            onOpenPayment={handleOpenPayment}
          />
        )}

        {isPrintEstimateOpen && (
          <PrintEstimateModal
            isOpen={isPrintEstimateOpen}
            onClose={() => setIsPrintEstimateOpen(false)}
            items={printEstimateItems}
          />
        )}

        {isPaymentOpen && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            items={paymentItems}
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
            onOpenMyPage={() => setIsMyPageOpen(true)}
            onOpenLegalModal={handleOpenLegalModal}
          />
        )}

        {isMyPageOpen && user && (
          <MyPageModal
            isOpen={isMyPageOpen}
            onClose={() => setIsMyPageOpen(false)}
            user={user}
            onLogout={handleLogout}
            cartItems={cartItems}
            bookings={bookings}
            asRequests={asRequests}
            onOpenCartModal={() => {
              setIsMyPageOpen(false);
              handlePageChange('cart');
            }}
            onOpenQuoteModal={() => setIsQuoteOpen(true)}
            isEditMode={isEditMode}
            onUpdateUserProfileImage={(imgUrl) => {
              const updated = { ...user, profileImage: imgUrl };
              setUser(updated);
              secureAuthManager.login(updated);
            }}
            onUpdateUser={(updated) => {
              setUser(updated);
              secureAuthManager.login(updated);
            }}
          />
        )}

        {isCmsOpen && isEditMode && (
          <CmsEditorModal
            isOpen={isCmsOpen && isEditMode}
            isEditMode={isEditMode}
            onClose={() => setIsCmsOpen(false)}
            logoConfig={logoConfig}
            onSaveLogoConfig={handleSaveLogoConfig}
            categoryLabels={categoryLabels}
            onSaveCategoryLabels={handleSaveCategoryLabels}
            footerConfig={footerConfig}
            onSaveFooterConfig={handleSaveFooterConfig}
            snsConfig={snsConfig}
            onSaveSnsConfig={handleSaveSnsConfig}
            quickMenuConfig={quickMenuConfig}
            onSaveQuickMenuConfig={handleSaveQuickMenuConfig}
            heroConfig={heroConfig}
            onSaveHeroConfig={handleSaveHeroConfig}
            aboutConfig={aboutConfig}
            onSaveAboutConfig={handleSaveAboutConfig}
            products={products}
            onSaveProducts={handleSaveProducts}
            solutions={solutions}
            onSaveSolutions={handleSaveSolutions}
            reviews={reviews}
            onSaveReviews={handleSaveReviews}
            faqs={faqs}
            onSaveFaqs={handleSaveFaqs}
            notices={notices}
            onSaveNotices={handleSaveNotices}
            onResetAll={handleResetAll}
            initialTab={cmsTab}
            quoteConfig={quoteConfig}
            onSaveQuoteConfig={handleSaveQuoteConfig}
            headerConfig={headerConfig}
            onSaveHeaderConfig={handleSaveHeaderConfig}
          />
        )}

        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={() => {
              const adminUser: User = {
                id: 'usr-admin-sycom',
                email: 'sy.car.com@gmail.com',
                name: 'SY.com 최고 관리자',
                type: 'B2B',
                companyName: '(유)에스와이닷컴',
                isAdmin: true,
                role: 'admin'
              };
              handleLogin(adminUser);
              setIsAdminLoginOpen(false);
              setIsEditMode(true);
              setIsCmsOpen(true);
            }}
          />
        )}

        {/* Admin Session Expired Notification Modal */}
        {isSessionExpiredModalOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
                <ShieldCheck className="w-9 h-9 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">관리자 보안 세션 만료</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                보안 정책에 따라 30분 동안의 관리자 세션이 만료되어 안전하게 <strong className="text-slate-900 font-black">자동 로그아웃</strong>되었습니다.<br/>
                브라우저 메모리 보안 상태가 초기화되었으니 작업을 계속하시려면 다시 로그인해 주세요.
              </p>
              <div className="flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setIsSessionExpiredModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  홈으로 이동
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSessionExpiredModalOpen(false);
                    setIsAdminLoginOpen(true);
                  }}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>관리자 재로그인</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating Cart Toast Notification */}
        {cartToastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3"
          >
            <span>{cartToastMsg}</span>
            <button
              onClick={() => handlePageChange('cart')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
            >
              장바구니 보기
            </button>
          </motion.div>
        )}

        {/* Home Entry Popup Modal (Naver Form / Warranty Popup) */}
        {isHomePopupOpen && (
          <HomePopupModal
            isOpen={isHomePopupOpen}
            onClose={() => setIsHomePopupOpen(false)}
            config={homePopupConfig}
            onOpenQuoteModal={() => setIsQuoteOpen(true)}
          />
        )}

        {/* Mobile Design Center Modal (Visible ONLY to Admin / Edit Mode) */}
        {isMobileDesignCenterOpen && (user?.isAdmin || isEditMode) && (
          <MobileDesignCenterModal
            isOpen={isMobileDesignCenterOpen}
            onClose={() => setIsMobileDesignCenterOpen(false)}
            config={mobileDesignConfig}
            onSave={handleSaveMobileDesignConfig}
          />
        )}

        {/* 24/7 AI 1:1 Live Support Chatbot */}
        <AIChatBot
          onOpenQuote={() => setIsQuoteOpen(true)}
          onNavigateToSol={(sol) => setActivePage(sol === 'residential' ? 'sol_residential' : sol === 'commercial' ? 'sol_commercial' : 'sol_parking')}
          onNavigateToProducts={() => setActivePage('products')}
        />
      </AnimatePresence>
    </div>
  );
}
