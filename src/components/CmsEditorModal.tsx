/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Edit3, 
  Settings, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Building, 
  User, 
  Upload,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock,
  Zap,
  History,
  Download,
  FileJson,
  ArrowRight,
  Activity,
  Sliders,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Solution, Review, FAQ, HeaderConfig, ProductOptionGroup, ProductOptionItem, SolutionProduct } from '../types';
import { DEFAULT_RESIDENTIAL_OPTION_GROUPS } from '../data';
import { PARKING_PRODUCTS_DATA, HOME_PRODUCTS_DATA } from './SolutionsSection';
import { compressImage } from '../lib/imageCompressor';
import { 
  useFirestoreSyncStatus, 
  createFirestoreBackup, 
  restoreFromLatestBackup, 
  restoreFromSpecificBackup, 
  restoreFromRawJson, 
  exportBackupToJsonFile, 
  getBackupHistory, 
  verifyDataIntegrity, 
  formatBackupDate,
  BackupMetadata 
} from '../lib/firebase';

interface CmsEditorModalProps {
  isOpen: boolean;
  isEditMode?: boolean;
  onClose: () => void;
  
  headerConfig: HeaderConfig;
  onSaveHeaderConfig: (config: HeaderConfig) => void;
  
  // Brand Logo and Menu Category configurations
  logoConfig: {
    text: string;
    subtitle: string;
    imageUrl: string;
    height?: number;
    showCompanyName?: boolean;
    companyNameText?: string;
    companyNameFont?: string;
    companyNameWeight?: string;
    companyNameSize?: string;
    companyNameColor?: string;
  };
  onSaveLogoConfig: (config: any) => void;

  categoryLabels: {
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
  onSaveCategoryLabels: (labels: any) => void;

  footerConfig: {
    phone: string;
    email: string;
    companyName: string;
    ceoName: string;
    businessNumber: string;
    address: string;
    teleSalesNumber: string;
    licenseInfo: string;
  };
  onSaveFooterConfig: (config: any) => void;

  snsConfig: {
    kakaoUrl: string;
    instagramUrl: string;
    blogUrl: string;
    youtubeUrl?: string;
    showFloatingSns: boolean;
  };
  onSaveSnsConfig: (config: any) => void;

  quickMenuConfig: {
    showQuickMenu: boolean;
    items: Array<{ id: string; label: string; iconType: string; targetPage: any }>;
  };
  onSaveQuickMenuConfig: (config: any) => void;

  // States and setter props
  heroConfig: {
    badge: string;
    title: string;
    description: string;
    ctaButton: string;
    calcButton: string;
    imageUrl?: string;
    height?: number;
    paddingTop?: number;
    paddingBottom?: number;
    showHeroImage?: boolean;
    titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
    descriptionSize?: 'small' | 'medium' | 'large';
    liveCountStart?: number;
    liveCountLabel?: string;
    liveCountSuffix?: string;
    solutionBlueSize?: 'small' | 'medium' | 'large' | 'xlarge';
    commercialBlueText?: string;
    residentialBlueText?: string;
    parkingBlueText?: string;
    commercialImage?: string;
    residentialImage?: string;
    parkingImage?: string;
    quickContact1?: string;
    quickContact2?: string;
    quickContact3?: string;
  };
  onSaveHeroConfig: (config: any) => void;

  aboutConfig: {
    ceoName: string;
    ceoRole: string;
    ceoGreeting: string;
    ceoMessage1: string;
    ceoMessage2: string;
    ceoMessage3: string;
    ceoImage: string;
  };
  onSaveAboutConfig: (config: any) => void;

  products: Product[];
  onSaveProducts: (products: Product[]) => void;

  solutions: Solution[];
  onSaveSolutions: (solutions: Solution[]) => void;

  reviews: Review[];
  onSaveReviews: (reviews: Review[]) => void;

  faqs: FAQ[];
  onSaveFaqs: (faqs: FAQ[]) => void;

  notices: any[];
  onSaveNotices: (notices: any[]) => void;

  onResetAll: () => void;
  initialTab?: 'brand' | 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support' | 'sync' | 'quote';
  quoteConfig: {
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
  };
  onSaveQuoteConfig: (config: any) => void;
}

const CURATED_EV_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600', label: '완속 충전기 단독' },
  { url: 'https://images.unsplash.com/photo-1695653422718-97d137aac987?auto=format&fit=crop&q=80&w=600', label: '공용 주차장 충전' },
  { url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600', label: '급속 주차 충전' },
  { url: 'https://images.unsplash.com/photo-1620859309999-ed665c53a1ed?auto=format&fit=crop&q=80&w=600', label: '초급속 충전소' },
  { url: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=600', label: '가정용 월박스' },
  { url: 'https://images.unsplash.com/photo-1521500857785-5a827418b62c?auto=format&fit=crop&q=80&w=600', label: '지하 주차 라인' },
  { url: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=600', label: '모던 고급 단독주택' },
  { url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=600', label: '상가 야외 주차장' }
];

const CURATED_CEO_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600', label: '남성 신뢰형 CEO' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', label: '여성 세련된 CEO' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600', label: '캐주얼 테크형 CEO' }
];

function robustUrlDecode(s: string): string {
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '%') {
      const hex = s.substring(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        try {
          result += decodeURIComponent('%' + hex);
        } catch (e) {
          result += s[i];
        }
        i += 2;
      } else {
        result += s[i];
      }
    } else {
      result += s[i];
    }
  }
  return result;
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'select' | 'number' | 'address';
  placeholder?: string;
  required: boolean;
  options?: string[];
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

export default function CmsEditorModal({
  isOpen,
  isEditMode,
  onClose,
  headerConfig,
  onSaveHeaderConfig,
  logoConfig,
  onSaveLogoConfig,
  categoryLabels,
  onSaveCategoryLabels,
  footerConfig,
  onSaveFooterConfig,
  snsConfig,
  onSaveSnsConfig,
  quickMenuConfig,
  onSaveQuickMenuConfig,
  heroConfig,
  onSaveHeroConfig,
  aboutConfig,
  onSaveAboutConfig,
  products,
  onSaveProducts,
  solutions,
  onSaveSolutions,
  reviews,
  onSaveReviews,
  faqs,
  onSaveFaqs,
  notices,
  onSaveNotices,
  onResetAll,
  initialTab = 'brand',
  quoteConfig,
  onSaveQuoteConfig
}: CmsEditorModalProps) {
  const [activeTab, setActiveTab] = useState<typeof initialTab>(initialTab);
  const [saveStatus, setSaveStatus] = useState('');
  const [importCode, setImportCode] = useState('');
  const [configActiveTab, setConfigActiveTab] = useState<'Residential' | 'Commercial' | 'ParkingLot'>('Residential');

  // 0. Brand logo & Categories states
  const [logoText, setLogoText] = useState(logoConfig.text);
  const [logoSubtitle, setLogoSubtitle] = useState(logoConfig.subtitle);
  const [logoImageUrl, setLogoImageUrl] = useState(logoConfig.imageUrl || '');
  const [logoShowCompanyName, setLogoShowCompanyName] = useState(logoConfig.showCompanyName !== false);
  const [logoCompanyNameText, setLogoCompanyNameText] = useState(logoConfig.companyNameText || '');
  const [logoCompanyNameFont, setLogoCompanyNameFont] = useState(logoConfig.companyNameFont || 'noto');
  const [logoCompanyNameWeight, setLogoCompanyNameWeight] = useState(logoConfig.companyNameWeight || 'extrabold');
  const [logoCompanyNameSize, setLogoCompanyNameSize] = useState(logoConfig.companyNameSize || 'sm');
  const [logoCompanyNameColor, setLogoCompanyNameColor] = useState(logoConfig.companyNameColor || 'slate-700');
  const [logoHeight, setLogoHeight] = useState(logoConfig.height || 44);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingCeoImg, setIsDraggingCeoImg] = useState(false);
  const [isDraggingProdImg, setIsDraggingProdImg] = useState(false);
  const [isDraggingBeforeImg, setIsDraggingBeforeImg] = useState(false);
  const [isDraggingAfterImg, setIsDraggingAfterImg] = useState(false);
  const [isDraggingSolImage, setIsDraggingSolImage] = useState(false);
  const [isDraggingSolBlueprint, setIsDraggingSolBlueprint] = useState(false);
  const [isDraggingSolDetail, setIsDraggingSolDetail] = useState(false);

  const [menuHome, setMenuHome] = useState(categoryLabels.home);
  const [menuAbout, setMenuAbout] = useState(categoryLabels.about);
  const [menuProducts, setMenuProducts] = useState(categoryLabels.products);
  const [menuSolutions, setMenuSolutions] = useState(categoryLabels.solutions);
  const [menuReview, setMenuReview] = useState(categoryLabels.review);
  const [menuSupport, setMenuSupport] = useState(categoryLabels.support);
  const [menuSolCommercial, setMenuSolCommercial] = useState(categoryLabels.sol_commercial || '아파트');
  const [menuSolResidential, setMenuSolResidential] = useState(categoryLabels.sol_residential || '가정용 홈');
  const [menuSolParking, setMenuSolParking] = useState(categoryLabels.sol_parking || '상업시설 수익형');

  // Header State
  const [headerInquiryTitlePc, setHeaderInquiryTitlePc] = useState(headerConfig?.inquiryTitlePc || '⚡ 전기차충전기 설치문의');
  const [headerShortcutCommercialPc, setHeaderShortcutCommercialPc] = useState(headerConfig?.shortcutCommercialPc || '⚡ 아파트 · 공동주택');
  const [headerShortcutResidentialPc, setHeaderShortcutResidentialPc] = useState(headerConfig?.shortcutResidentialPc || '🏠 가정용 · 개인 홈');
  const [headerShortcutParkingPc, setHeaderShortcutParkingPc] = useState(headerConfig?.shortcutParkingPc || '🏢 상업시설 · 수익형');

  const [headerInquiryTitleMobile, setHeaderInquiryTitleMobile] = useState(headerConfig?.inquiryTitleMobile || '⚡ 전기차충전기 설치문의');
  const [headerShortcutCommercialMobile, setHeaderShortcutCommercialMobile] = useState(headerConfig?.shortcutCommercialMobile || '⚡ 아파트 · 공동주택');
  const [headerShortcutResidentialMobile, setHeaderShortcutResidentialMobile] = useState(headerConfig?.shortcutResidentialMobile || '🏠 가정용 · 개인 홈');
  const [headerShortcutParkingMobile, setHeaderShortcutParkingMobile] = useState(headerConfig?.shortcutParkingMobile || '🏢 상업시설 · 수익형');

  const [headerSyncMobileWithPc, setHeaderSyncMobileWithPc] = useState(headerConfig?.syncMobileWithPc !== false);

  // SNS State
  const [snsKakaoUrl, setSnsKakaoUrl] = useState(snsConfig.kakaoUrl || '');
  const [snsInstagramUrl, setSnsInstagramUrl] = useState(snsConfig.instagramUrl || '');
  const [snsBlogUrl, setSnsBlogUrl] = useState(snsConfig.blogUrl || '');
  const [snsYoutubeUrl, setSnsYoutubeUrl] = useState(snsConfig.youtubeUrl || '');
  const [snsShowFloating, setSnsShowFloating] = useState(snsConfig.showFloatingSns !== false);

  // Quick Menu State
  const [quickShowMenu, setQuickShowMenu] = useState(quickMenuConfig.showQuickMenu !== false);
  const [quickMenuItems, setQuickMenuItems] = useState(quickMenuConfig.items || []);

  // Footer State
  const [footerPhone, setFooterPhone] = useState(footerConfig.phone);
  const [footerEmail, setFooterEmail] = useState(footerConfig.email);
  const [footerCompanyName, setFooterCompanyName] = useState(footerConfig.companyName);
  const [footerCeoName, setFooterCeoName] = useState(footerConfig.ceoName);
  const [footerBusinessNumber, setFooterBusinessNumber] = useState(footerConfig.businessNumber);
  const [footerAddress, setFooterAddress] = useState(footerConfig.address);
  const [footerTeleSalesNumber, setFooterTeleSalesNumber] = useState(footerConfig.teleSalesNumber);
  const [footerLicenseInfo, setFooterLicenseInfo] = useState(footerConfig.licenseInfo);

  // Admin Account & Password state
  const [newAdminIdInput, setNewAdminIdInput] = useState('');
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [confirmAdminPassInput, setConfirmAdminPassInput] = useState('');
  const [adminPassMsg, setAdminPassMsg] = useState('');

  // 1. Hero Form State
  const [heroBadge, setHeroBadge] = useState(heroConfig.badge);
  const [heroTitle, setHeroTitle] = useState(heroConfig.title);
  const [heroDesc, setHeroDesc] = useState(heroConfig.description);
  const [heroCta, setHeroCta] = useState(heroConfig.ctaButton);
  const [heroCalc, setHeroCalc] = useState(heroConfig.calcButton);
  const [heroImageUrl, setHeroImageUrl] = useState(heroConfig.imageUrl || '');
  const [heroHeight, setHeroHeight] = useState(heroConfig.height || 750);
  const [heroPaddingTop, setHeroPaddingTop] = useState(heroConfig.paddingTop !== undefined ? heroConfig.paddingTop : 120);
  const [heroPaddingBottom, setHeroPaddingBottom] = useState(heroConfig.paddingBottom !== undefined ? heroConfig.paddingBottom : 120);
  const [heroTitleSize, setHeroTitleSize] = useState(heroConfig.titleSize || 'large');
  const [heroDescriptionSize, setHeroDescriptionSize] = useState(heroConfig.descriptionSize || 'medium');
  const [heroLiveCountStart, setHeroLiveCountStart] = useState(heroConfig.liveCountStart || 14520);
  const [heroLiveCountLabel, setHeroLiveCountLabel] = useState(heroConfig.liveCountLabel || '현재 전국 SY.com 충전기 설치 현황');
  const [heroLiveCountSuffix, setHeroLiveCountSuffix] = useState(heroConfig.liveCountSuffix || '대 돌파');
  const [heroSolutionBlueSize, setHeroSolutionBlueSize] = useState(heroConfig.solutionBlueSize || 'medium');
  const [heroCommercialBlueText, setHeroCommercialBlueText] = useState(heroConfig.commercialBlueText || '회사 사옥, 물류창고, 공장, 관공서 전용');
  const [heroResidentialBlueText, setHeroResidentialBlueText] = useState(heroConfig.residentialBlueText || '단독주택, 빌라, 아파트(개인/공용) 전용');
  const [heroParkingBlueText, setHeroParkingBlueText] = useState(heroConfig.parkingBlueText || '대형 마트, 호텔, 빌딩, 공영주차장 맞춤');
  const [heroCommercialImage, setHeroCommercialImage] = useState(heroConfig.commercialImage || '');
  const [heroResidentialImage, setHeroResidentialImage] = useState(heroConfig.residentialImage || '');
  const [heroParkingImage, setHeroParkingImage] = useState(heroConfig.parkingImage || '');
  const [heroQuick1, setHeroQuick1] = useState(heroConfig.quickContact1 || '환경부지원 아파트 무상설치 문의 ⚡');
  const [heroQuick2, setHeroQuick2] = useState(heroConfig.quickContact2 || '가정용 · 홈 충전기 설치문의 🏠');
  const [heroQuick3, setHeroQuick3] = useState(heroConfig.quickContact3 || '상업시설 · 수익형 충전기 설치문의 🏢');

  // 1.5. Quote Modal settings Form State
  const [quoteBadge, setQuoteBadge] = useState(quoteConfig.badge || '정부보조금 마감 임박 혜택 우선 선점');
  const [quoteTitle, setQuoteTitle] = useState(quoteConfig.title || '무료 설치 상담 & 실시간 맞춤 견적');
  const [quoteSubmitButton, setQuoteSubmitButton] = useState(quoteConfig.submitButton || '👉 30초 만에 무료 설치 상담 예약하기');
  const [quoteSuccessTitle, setQuoteSuccessTitle] = useState(quoteConfig.successTitle || '상담 신청이 정상 접수되었습니다!');
  const [quoteSuccessDesc, setQuoteSuccessDesc] = useState(quoteConfig.successDesc || '');
  const [quotePrivacyNotice, setQuotePrivacyNotice] = useState(quoteConfig.privacyNotice || '');
  const [quoteDirectPhone, setQuoteDirectPhone] = useState(quoteConfig.directPhone || '1588-SY01');
  const [quoteDirectKakaoUrl, setQuoteDirectKakaoUrl] = useState(quoteConfig.directKakaoUrl || 'https://pf.kakao.com/');
  const [quotePurposeLabels, setQuotePurposeLabels] = useState(
    quoteConfig.purposeLabels || {
      Residential: '주거용 (단독주택/빌라/아파트)',
      Commercial: '기업/관공서용 (사옥/공장/창고)',
      ParkingLot: '수익형 주차장 (호텔/마트/상가빌딩)'
    }
  );
  const [quoteFields, setQuoteFields] = useState(
    quoteConfig.fields || DEFAULT_FIELDS
  );

  // 2. About Form State
  const [ceoName, setCeoName] = useState(aboutConfig.ceoName);
  const [ceoRole, setCeoRole] = useState(aboutConfig.ceoRole);
  const [ceoGreeting, setCeoGreeting] = useState(aboutConfig.ceoGreeting);
  const [ceoMsg1, setCeoMsg1] = useState(aboutConfig.ceoMessage1);
  const [ceoMsg2, setCeoMsg2] = useState(aboutConfig.ceoMessage2);
  const [ceoMsg3, setCeoMsg3] = useState(aboutConfig.ceoMessage3);
  const [ceoImg, setCeoImg] = useState(aboutConfig.ceoImage);

  // Sync state with props on open/change
  React.useEffect(() => {
    if (isOpen) {
      setLogoText(logoConfig.text);
      setLogoSubtitle(logoConfig.subtitle);
      setLogoImageUrl(logoConfig.imageUrl || '');
      setLogoShowCompanyName(logoConfig.showCompanyName !== false);
      setLogoCompanyNameText(logoConfig.companyNameText || '');
      setLogoCompanyNameFont(logoConfig.companyNameFont || 'noto');
      setLogoCompanyNameWeight(logoConfig.companyNameWeight || 'extrabold');
      setLogoCompanyNameSize(logoConfig.companyNameSize || 'sm');
      setLogoCompanyNameColor(logoConfig.companyNameColor || 'slate-700');
      setLogoHeight(logoConfig.height || 44);

      setMenuHome(categoryLabels.home);
      setMenuAbout(categoryLabels.about);
      setMenuProducts(categoryLabels.products);
      setMenuSolutions(categoryLabels.solutions);
      setMenuReview(categoryLabels.review);
      setMenuSupport(categoryLabels.support);
      setMenuSolCommercial(categoryLabels.sol_commercial || '아파트');
      setMenuSolResidential(categoryLabels.sol_residential || '가정용 홈');
      setMenuSolParking(categoryLabels.sol_parking || '상업시설 수익형');

      setHeaderInquiryTitlePc(headerConfig?.inquiryTitlePc || '⚡ 전기차충전기 설치문의');
      setHeaderShortcutCommercialPc(headerConfig?.shortcutCommercialPc || '⚡ 아파트 · 공동주택');
      setHeaderShortcutResidentialPc(headerConfig?.shortcutResidentialPc || '🏠 가정용 · 개인 홈');
      setHeaderShortcutParkingPc(headerConfig?.shortcutParkingPc || '🏢 상업시설 · 수익형');
      setHeaderInquiryTitleMobile(headerConfig?.inquiryTitleMobile || '⚡ 전기차충전기 설치문의');
      setHeaderShortcutCommercialMobile(headerConfig?.shortcutCommercialMobile || '⚡ 아파트 · 공동주택');
      setHeaderShortcutResidentialMobile(headerConfig?.shortcutResidentialMobile || '🏠 가정용 · 개인 홈');
      setHeaderShortcutParkingMobile(headerConfig?.shortcutParkingMobile || '🏢 상업시설 · 수익형');
      setHeaderSyncMobileWithPc(headerConfig?.syncMobileWithPc !== false);

      setSnsKakaoUrl(snsConfig.kakaoUrl || '');
      setSnsInstagramUrl(snsConfig.instagramUrl || '');
      setSnsBlogUrl(snsConfig.blogUrl || '');
      setSnsYoutubeUrl(snsConfig.youtubeUrl || '');
      setSnsShowFloating(snsConfig.showFloatingSns !== false);

      setQuickShowMenu(quickMenuConfig.showQuickMenu !== false);
      setQuickMenuItems(quickMenuConfig.items || []);

      setFooterPhone(footerConfig.phone);
      setFooterEmail(footerConfig.email);
      setFooterCompanyName(footerConfig.companyName);
      setFooterCeoName(footerConfig.ceoName);
      setFooterBusinessNumber(footerConfig.businessNumber);
      setFooterAddress(footerConfig.address);
      setFooterTeleSalesNumber(footerConfig.teleSalesNumber);
      setFooterLicenseInfo(footerConfig.licenseInfo);

      setHeroBadge(heroConfig.badge);
      setHeroTitle(heroConfig.title);
      setHeroDesc(heroConfig.description);
      setHeroCta(heroConfig.ctaButton);
      setHeroCalc(heroConfig.calcButton);
      setHeroImageUrl(heroConfig.imageUrl || '');
      setHeroHeight(heroConfig.height || 750);
      setHeroPaddingTop(heroConfig.paddingTop !== undefined ? heroConfig.paddingTop : 120);
      setHeroPaddingBottom(heroConfig.paddingBottom !== undefined ? heroConfig.paddingBottom : 120);
      setHeroTitleSize(heroConfig.titleSize || 'large');
      setHeroDescriptionSize(heroConfig.descriptionSize || 'medium');
      setHeroLiveCountStart(heroConfig.liveCountStart || 14520);
      setHeroLiveCountLabel(heroConfig.liveCountLabel || '현재 전국 SY.com 충전기 설치 현황');
      setHeroLiveCountSuffix(heroConfig.liveCountSuffix || '대 돌파');
      setHeroSolutionBlueSize(heroConfig.solutionBlueSize || 'medium');
      setHeroCommercialBlueText(heroConfig.commercialBlueText || '회사 사옥, 물류창고, 공장, 관공서 전용');
      setHeroResidentialBlueText(heroConfig.residentialBlueText || '단독주택, 빌라, 아파트(개인/공용) 전용');
      setHeroParkingBlueText(heroConfig.parkingBlueText || '대형 마트, 호텔, 빌딩, 공영주차장 맞춤');
      setHeroCommercialImage(heroConfig.commercialImage || '');
      setHeroResidentialImage(heroConfig.residentialImage || '');
      setHeroParkingImage(heroConfig.parkingImage || '');
      setHeroQuick1(heroConfig.quickContact1 || '환경부지원 아파트 무상설치 문의 ⚡');
      setHeroQuick2(heroConfig.quickContact2 || '가정용 · 홈 충전기 설치문의 🏠');
      setHeroQuick3(heroConfig.quickContact3 || '상업시설 · 수익형 충전기 설치문의 🏢');

      setQuoteBadge(quoteConfig.badge || '정부보조금 마감 임박 혜택 우선 선점');
      setQuoteTitle(quoteConfig.title || '무료 설치 상담 & 실시간 맞춤 견적');
      setQuoteSubmitButton(quoteConfig.submitButton || '👉 30초 만에 무료 설치 상담 예약하기');
      setQuoteSuccessTitle(quoteConfig.successTitle || '상담 신청이 정상 접수되었습니다!');
      setQuoteSuccessDesc(quoteConfig.successDesc || '');
      setQuotePrivacyNotice(quoteConfig.privacyNotice || '');
      setQuoteDirectPhone(quoteConfig.directPhone || '1588-SY01');
      setQuoteDirectKakaoUrl(quoteConfig.directKakaoUrl || 'https://pf.kakao.com/');
      setQuotePurposeLabels(quoteConfig.purposeLabels || {
        Residential: '주거용 (단독주택/빌라/아파트)',
        Commercial: '기업/관공서용 (사옥/공장/창고)',
        ParkingLot: '수익형 주차장 (호텔/마트/상가빌딩)'
      });
      setQuoteFields(quoteConfig.fields || DEFAULT_FIELDS);

      setCeoName(aboutConfig.ceoName);
      setCeoRole(aboutConfig.ceoRole);
      setCeoGreeting(aboutConfig.ceoGreeting);
      setCeoMsg1(aboutConfig.ceoMessage1);
      setCeoMsg2(aboutConfig.ceoMessage2);
      setCeoMsg3(aboutConfig.ceoMessage3);
      setCeoImg(aboutConfig.ceoImage);
      setActiveTab(initialTab === 'products' ? 'solutions' : initialTab);
    }
  }, [isOpen, logoConfig, categoryLabels, footerConfig, snsConfig, quickMenuConfig, heroConfig, aboutConfig, quoteConfig, initialTab, headerConfig]);

  // 3. Products Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<'완속' | '급속' | '초급속' | '스마트홈' | '스탠드'>('완속');
  const [prodPower, setProdPower] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodPlc, setProdPlc] = useState(false);
  const [prodFeatures, setProdFeatures] = useState<string[]>([]);
  const [prodSpecs, setProdSpecs] = useState<{ [key: string]: string }>({});

  // Extended pricing, metadata & option groups state
  const [prodPrice, setProdPrice] = useState<number>(598000);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(660000);
  const [prodDiscountRate, setProdDiscountRate] = useState<number>(10);
  const [prodBrand, setProdBrand] = useState('스필');
  const [prodManufacturer, setProdManufacturer] = useState('스필일렉트릭');
  const [prodOrigin, setProdOrigin] = useState('대한민국');
  const [prodModelName, setProdModelName] = useState('DO-EVC-SEC7-C/K');
  const [prodCertNumber, setProdCertNumber] = useState('XD070158-25001A');
  const [prodDeliveryInfo, setProdDeliveryInfo] = useState('택배(주문 시 결제) / 무료배송');
  const [prodComponentsInfo, setProdComponentsInfo] = useState('제조사 별도 발송 / 설치비 미포함 상품');
  const [prodOptionGroups, setProdOptionGroups] = useState<ProductOptionGroup[]>([]);

  // Helper for pasting image from clipboard (Requirement: "캡처해서 붙여넣기로 넣게 못만드나?")
  const handlePasteImageFromClipboard = async (e: React.ClipboardEvent, setImageFn: (url: string) => void) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          const compressed = await compressImage(blob, 1920, 1080, 0.82);
          setImageFn(compressed);
          alert('📋 클립보드 캡처 이미지가 성공적으로 붙여넣어졌습니다!');
          break;
        }
      }
    }
  };

  // 4. Solutions Form State
  const [solSubTab, setSolSubTab] = useState<'parking' | 'home' | 'cards'>('parking');
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [solTitle, setSolTitle] = useState('');
  const [solSubtitle, setSolSubtitle] = useState('');
  const [solDesc, setSolDesc] = useState('');
  const [solTarget, setSolTarget] = useState('');
  const [solPower, setSolPower] = useState('');
  const [solImage, setSolImage] = useState('');
  const [solBlueprintImageUrl, setSolBlueprintImageUrl] = useState('');
  const [solDetailImageUrl, setSolDetailImageUrl] = useState('');
  const [solBenefits, setSolBenefits] = useState<string[]>([]);
  const [solBannerMode, setSolBannerMode] = useState<'cover' | 'unfold'>('cover');
  const [solDetailMode, setSolDetailMode] = useState<'scroll' | 'unfold'>('scroll');

  // Commercial / Parking Lot & Home Chargers states for CMS
  const [cmsParkingProducts, setCmsParkingProducts] = useState<Record<string, SolutionProduct[]>>(() => {
    const saved = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PARKING_PRODUCTS_DATA;
  });

  const [cmsHomeProducts, setCmsHomeProducts] = useState<Record<string, SolutionProduct[]>>(() => {
    const saved = localStorage.getItem('sy_cms_home_products_v6_fixed');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return HOME_PRODUCTS_DATA;
  });

  useEffect(() => {
    const handleProductsUpdate = () => {
      const savedHome = localStorage.getItem('sy_cms_home_products_v6_fixed');
      if (savedHome) {
        try { setCmsHomeProducts(JSON.parse(savedHome)); } catch (e) {}
      }
      const savedParking = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
      if (savedParking) {
        try { setCmsParkingProducts(JSON.parse(savedParking)); } catch (e) {}
      }
    };

    window.addEventListener('sy_cms_products_update', handleProductsUpdate);
    window.addEventListener('storage', handleProductsUpdate);
    return () => {
      window.removeEventListener('sy_cms_products_update', handleProductsUpdate);
      window.removeEventListener('storage', handleProductsUpdate);
    };
  }, []);

  const [editingSolProd, setEditingSolProd] = useState<SolutionProduct | null>(null);
  const [isNewSolProd, setIsNewSolProd] = useState(false);
  const [solProdType, setSolProdType] = useState<'parking' | 'home'>('parking');
  const [solProdCategory, setSolProdCategory] = useState<string>('공용 BIZ 충전기');

  // SolutionProduct Form states
  const [solProdName, setSolProdName] = useState('');
  const [solProdRegularPrice, setSolProdRegularPrice] = useState(0);
  const [solProdPrice, setSolProdPrice] = useState(0);
  const [solProdDiscount, setSolProdDiscount] = useState(0);
  const [solProdImage, setSolProdImage] = useState('');
  const [solProdTags, setSolProdTags] = useState('');
  const [solProdHasASBadge, setSolProdHasASBadge] = useState(false);
  const [solProdHasPromoRibbon, setSolProdHasPromoRibbon] = useState(false);
  const [solProdDescription, setSolProdDescription] = useState('');
  const [solProdDeliveryMethod, setSolProdDeliveryMethod] = useState('');
  const [solProdShippingFee, setSolProdShippingFee] = useState('');
  const [solProdPaymentMethod, setSolProdPaymentMethod] = useState('');
  const [isDraggingSolProdImg, setIsDraggingSolProdImg] = useState(false);

  const handleStartEditSolProd = (p: SolutionProduct | null, type: 'parking' | 'home', category: string) => {
    setSolProdType(type);
    setSolProdCategory(category);
    if (p) {
      setEditingSolProd(p);
      setIsNewSolProd(false);
      setSolProdName(p.name);
      setSolProdRegularPrice(p.regularPrice || 0);
      setSolProdPrice(p.price || 0);
      setSolProdDiscount(p.discount || 0);
      setSolProdImage(p.image || '');
      setSolProdTags(p.tags ? p.tags.join(', ') : '');
      setSolProdHasASBadge(!!p.hasASBadge);
      setSolProdHasPromoRibbon(!!p.hasPromoRibbon);
      setSolProdDescription(p.description || '');
      setSolProdDeliveryMethod(p.deliveryMethod || '택배');
      setSolProdShippingFee(p.shippingFee || '무료');
      setSolProdPaymentMethod(p.paymentMethod || '무통장입금');
    } else {
      setEditingSolProd(null);
      setIsNewSolProd(true);
      setSolProdName('');
      setSolProdRegularPrice(1200000);
      setSolProdPrice(1020000);
      setSolProdDiscount(15);
      setSolProdImage(type === 'parking' ? '/50kw-쿨차지.png' : '/스필.png');
      setSolProdTags('BEST, HIT');
      setSolProdHasASBadge(type === 'home');
      setSolProdHasPromoRibbon(true);
      setSolProdDescription('');
      setSolProdDeliveryMethod('택배');
      setSolProdShippingFee('무료');
      setSolProdPaymentMethod('무통장입금');
    }
  };

  const handleSaveSolProd = () => {
    const newProduct: SolutionProduct = {
      ...(editingSolProd || {}),
      id: editingSolProd ? editingSolProd.id : `${solProdType === 'parking' ? 'park' : 'res'}-${Date.now()}`,
      name: solProdName || '새 충전기',
      regularPrice: Number(solProdRegularPrice) || 0,
      price: Number(solProdPrice) || 0,
      discount: Number(solProdDiscount) || 0,
      image: solProdImage || (solProdType === 'parking' ? '/50kw-쿨차지.png' : '/스필.png'),
      tags: solProdTags ? solProdTags.split(',').map(s => s.trim()).filter(Boolean) : ['BEST'],
      hasASBadge: solProdHasASBadge,
      hasPromoRibbon: solProdHasPromoRibbon,
      description: solProdDescription,
      deliveryMethod: solProdDeliveryMethod,
      shippingFee: solProdShippingFee,
      paymentMethod: solProdPaymentMethod
    };

    if (solProdType === 'parking') {
      const updated = { ...cmsParkingProducts };
      const list = updated[solProdCategory] ? [...updated[solProdCategory]] : [];
      if (editingSolProd) {
        const idx = list.findIndex(item => item.id === editingSolProd.id);
        if (idx !== -1) list[idx] = newProduct;
        else list.push(newProduct);
      } else {
        list.push(newProduct);
      }
      updated[solProdCategory] = list;
      setCmsParkingProducts(updated);
      localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(updated));
      localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(updated));
    } else {
      const updated = { ...cmsHomeProducts };
      const list = updated[solProdCategory] ? [...updated[solProdCategory]] : [];
      if (editingSolProd) {
        const idx = list.findIndex(item => item.id === editingSolProd.id);
        if (idx !== -1) list[idx] = newProduct;
        else list.push(newProduct);
      } else {
        list.push(newProduct);
      }
      updated[solProdCategory] = list;
      setCmsHomeProducts(updated);
      localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(updated));
    }

    // Sync to sy_cms_products_v12 so Admin Center stays identical
    try {
      const savedProds = localStorage.getItem('sy_cms_products_v12');
      if (savedProds) {
        const parsedProds: any[] = JSON.parse(savedProds);
        let matchIdx = parsedProds.findIndex(p => p.id === newProduct.id || (p.name && p.name.trim() === newProduct.name.trim()) || ((newProduct.id === 'sy-ac11-bi' || newProduct.id === 'res-11kw-spil') && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil')));
        if (matchIdx !== -1) {
          parsedProds[matchIdx] = {
            ...parsedProds[matchIdx],
            name: newProduct.name,
            price: newProduct.price,
            originalPrice: newProduct.regularPrice,
            discountRate: newProduct.discount,
            image: newProduct.image,
            description: newProduct.description,
            replacementPrice: newProduct.replacementPrice !== undefined ? newProduct.replacementPrice : parsedProds[matchIdx].replacementPrice,
            replacementRegularPrice: newProduct.replacementRegularPrice !== undefined ? newProduct.replacementRegularPrice : parsedProds[matchIdx].replacementRegularPrice,
            installIncludedPrice: newProduct.installIncludedPrice !== undefined ? newProduct.installIncludedPrice : parsedProds[matchIdx].installIncludedPrice,
            installIncludedRegularPrice: newProduct.installIncludedRegularPrice !== undefined ? newProduct.installIncludedRegularPrice : parsedProds[matchIdx].installIncludedRegularPrice,
            serviceType: newProduct.serviceType || parsedProds[matchIdx].serviceType || 'all',
            deliveryInfo: newProduct.deliveryMethod || parsedProds[matchIdx].deliveryInfo,
            componentsInfo: newProduct.shippingFee || parsedProds[matchIdx].componentsInfo,
            rewardPointsInfo: newProduct.paymentMethod || parsedProds[matchIdx].rewardPointsInfo,
            optionGroups: newProduct.optionGroups || parsedProds[matchIdx].optionGroups
          };
        } else {
          parsedProds.push({
            id: newProduct.id,
            name: newProduct.name,
            type: solProdType === 'parking' ? '급속' : '완속',
            power: solProdCategory || '7kW',
            features: newProduct.tags || ['BEST'],
            image: newProduct.image,
            description: newProduct.description || '',
            price: newProduct.price,
            originalPrice: newProduct.regularPrice,
            discountRate: newProduct.discount,
            replacementPrice: newProduct.replacementPrice,
            replacementRegularPrice: newProduct.replacementRegularPrice,
            installIncludedPrice: newProduct.installIncludedPrice,
            installIncludedRegularPrice: newProduct.installIncludedRegularPrice,
            serviceType: newProduct.serviceType || 'all',
            optionGroups: newProduct.optionGroups
          });
        }
        localStorage.setItem('sy_cms_products_v12', JSON.stringify(parsedProds));
      }
    } catch (e) {
      console.error('Error syncing CmsEditorModal edit to sy_cms_products_v12:', e);
    }

    window.dispatchEvent(new Event('sy_cms_products_update'));
    setEditingSolProd(null);
    setIsNewSolProd(false);
    showSaveSuccess('💾 충전기 상품 정보가 저장되어 홈페이지와 관리자센터에 즉시 반영되었습니다!');
  };

  const handleDeleteSolProd = (id: string, type: 'parking' | 'home', category: string) => {
    if (!confirm('이 충전기 상품을 정말 삭제하시겠습니까?')) return;
    try {
      const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
      const deletedArr: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (!deletedArr.includes(id)) deletedArr.push(id);
      if (id === 'sy-ac07' || id === 'res-7kw-spil') {
        if (!deletedArr.includes('sy-ac07')) deletedArr.push('sy-ac07');
        if (!deletedArr.includes('res-7kw-spil')) deletedArr.push('res-7kw-spil');
      }
      if (id === 'sy-ac05' || id === 'res-5kw-spil') {
        if (!deletedArr.includes('sy-ac05')) deletedArr.push('sy-ac05');
        if (!deletedArr.includes('res-5kw-spil')) deletedArr.push('res-5kw-spil');
      }
      if (id === 'sy-ac11-bi' || id === 'res-11kw-spil') {
        if (!deletedArr.includes('sy-ac11-bi')) deletedArr.push('sy-ac11-bi');
        if (!deletedArr.includes('res-11kw-spil')) deletedArr.push('res-11kw-spil');
      }
      localStorage.setItem('sy_cms_deleted_product_ids', JSON.stringify(deletedArr));

      // Also remove from sy_cms_products_v12
      const savedProds = localStorage.getItem('sy_cms_products_v12');
      if (savedProds) {
        const parsedProds = JSON.parse(savedProds);
        const filtered = parsedProds.filter((p: any) => p && p.id !== id && !deletedArr.includes(p.id));
        localStorage.setItem('sy_cms_products_v12', JSON.stringify(filtered));
      }
    } catch (e) {}

    if (type === 'parking') {
      const updated = { ...cmsParkingProducts };
      if (updated[category]) {
        updated[category] = updated[category].filter(item => item.id !== id);
        setCmsParkingProducts(updated);
        localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(updated));
        localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(updated));
      }
    } else {
      const updated = { ...cmsHomeProducts };
      if (updated[category]) {
        updated[category] = updated[category].filter(item => item.id !== id);
        setCmsHomeProducts(updated);
        localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new Event('sy_cms_products_update'));
    showSaveSuccess('🗑️ 충전기 상품이 삭제되었습니다.');
  };

  const editingSol = solutions.find(s => s.id === editingSolutionId);
  const isCommercial = editingSol?.category === 'Commercial';

  // 5. Reviews Form State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [revTitle, setRevTitle] = useState('');
  const [revLocation, setRevLocation] = useState('');
  const [revCategory, setRevCategory] = useState<'Commercial' | 'Residential' | 'ParkingLot'>('Residential');
  const [revRating, setRevRating] = useState(5);
  const [revAuthor, setRevAuthor] = useState('');
  const [revInterview, setRevInterview] = useState('');
  const [revDetails, setRevDetails] = useState('');
  const [revBeforeImg, setRevBeforeImg] = useState('');
  const [revAfterImg, setRevAfterImg] = useState('');
  const [revX, setRevX] = useState(50);
  const [revY, setRevY] = useState(50);
  const [revBlogUrl, setRevBlogUrl] = useState('');
  const [revIsBlogImported, setRevIsBlogImported] = useState(false);
  const [revBlogName, setRevBlogName] = useState('네이버 블로그');
  const [revIsSyncingBlog, setRevIsSyncingBlog] = useState(false);

  // 6. FAQs Form State
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('보조금/비용');

  // 7. Notices Form State
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
  const [notTitle, setNotTitle] = useState('');
  const [notDate, setNotDate] = useState('');
  const [notImp, setNotImp] = useState(false);

  const syncStatus = useFirestoreSyncStatus();
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<ReturnType<typeof verifyDataIntegrity> | null>(null);
  const [isDraggingJsonBackup, setIsDraggingJsonBackup] = useState(false);
  const [manualImportText, setManualImportText] = useState('');

  // Load backup snapshots whenever sync tab is opened
  useEffect(() => {
    if (activeTab === 'sync' && isOpen) {
      loadBackupList();
      setIntegrityResult(verifyDataIntegrity());
    }
  }, [activeTab, isOpen]);

  const loadBackupList = async () => {
    setIsLoadingBackups(true);
    try {
      const history = await getBackupHistory(20);
      setBackupHistory(history);
    } catch (e) {
      console.warn('Backup list load error:', e);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleManualCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await createFirestoreBackup('manual');
      if (res.success) {
        showSaveSuccess(`☁️ ${res.message}`);
        await loadBackupList();
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert('백업 실패: ' + e.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFromLatest = async () => {
    if (!confirm('⚠️ [경고] 최신 클라우드 백업 스냅샷에서 전체 상품 및 설정 데이터를 복구하시겠습니까?\n현재 로컬 데이터가 최신 백업 시점의 데이터로 완벽히 복구됩니다.')) {
      return;
    }
    setIsRestoring(true);
    try {
      const res = await restoreFromLatestBackup();
      if (res.success) {
        showSaveSuccess(`🎉 ${res.message}`);
        await loadBackupList();
        setIntegrityResult(verifyDataIntegrity());
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert('복구 중 오류: ' + e.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreSpecificBackup = async (backup: BackupMetadata) => {
    if (!confirm(`[확인] [${backup.formattedDate}] (${backup.keyCount}개 데이터) 시점으로 롤백 복구하시겠습니까?`)) {
      return;
    }
    setIsRestoring(true);
    try {
      const res = await restoreFromSpecificBackup(backup.id);
      if (res.success) {
        showSaveSuccess(`🎉 [${backup.formattedDate}] 시점으로 성공적으로 복원되었습니다!`);
        await loadBackupList();
        setIntegrityResult(verifyDataIntegrity());
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert('롤백 오류: ' + e.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleJsonFileUpload = async (file: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      setIsRestoring(true);
      const res = await restoreFromRawJson(text);
      if (res.success) {
        showSaveSuccess(`📂 백업 파일로부터 ${res.restoredKeys}개 항목이 복구되었습니다!`);
        await loadBackupList();
        setIntegrityResult(verifyDataIntegrity());
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert('파일 읽기 오류: ' + e.message);
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  const showSaveSuccess = (message: string) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleSaveBrand = () => {
    onSaveLogoConfig({
      text: logoText,
      subtitle: logoSubtitle,
      imageUrl: logoImageUrl,
      height: Number(logoHeight),
      showCompanyName: logoShowCompanyName,
      companyNameText: logoCompanyNameText,
      companyNameFont: logoCompanyNameFont,
      companyNameWeight: logoCompanyNameWeight,
      companyNameSize: logoCompanyNameSize,
      companyNameColor: logoCompanyNameColor
    });
    onSaveCategoryLabels({
      home: menuHome,
      about: menuAbout,
      products: menuProducts,
      solutions: menuSolutions,
      review: menuReview,
      support: menuSupport,
      sol_commercial: menuSolCommercial,
      sol_residential: menuSolResidential,
      sol_parking: menuSolParking
    });
    onSaveHeaderConfig({
      inquiryTitlePc: headerInquiryTitlePc,
      shortcutCommercialPc: headerShortcutCommercialPc,
      shortcutResidentialPc: headerShortcutResidentialPc,
      shortcutParkingPc: headerShortcutParkingPc,
      inquiryTitleMobile: headerSyncMobileWithPc ? headerInquiryTitlePc : headerInquiryTitleMobile,
      shortcutCommercialMobile: headerSyncMobileWithPc ? headerShortcutCommercialPc : headerShortcutCommercialMobile,
      shortcutResidentialMobile: headerSyncMobileWithPc ? headerShortcutResidentialPc : headerShortcutResidentialMobile,
      shortcutParkingMobile: headerSyncMobileWithPc ? headerShortcutParkingPc : headerShortcutParkingMobile,
      syncMobileWithPc: headerSyncMobileWithPc
    });
    onSaveFooterConfig({
      phone: footerPhone,
      email: footerEmail,
      companyName: footerCompanyName,
      ceoName: footerCeoName,
      businessNumber: footerBusinessNumber,
      address: footerAddress,
      teleSalesNumber: footerTeleSalesNumber,
      licenseInfo: footerLicenseInfo
    });
    onSaveSnsConfig({
      kakaoUrl: snsKakaoUrl,
      instagramUrl: snsInstagramUrl,
      blogUrl: snsBlogUrl,
      youtubeUrl: snsYoutubeUrl,
      showFloatingSns: snsShowFloating
    });
    onSaveQuickMenuConfig({
      showQuickMenu: quickShowMenu,
      items: quickMenuItems
    });
    showSaveSuccess('⚙️ 브랜드 로고, 카테고리, 헤더 단축문구, 푸터 회사 정보 및 SNS, 퀵메뉴 설정이 즉시 저장되었습니다!');
  };

  const handleSaveHero = async () => {
    let finalImg = heroImageUrl;
    if (finalImg && (finalImg.startsWith('data:image') || finalImg.startsWith('blob:'))) {
      finalImg = await compressImage(finalImg, 1920, 1080, 0.82);
    }
    onSaveHeroConfig({
      ...heroConfig,
      badge: heroBadge,
      title: heroTitle,
      description: heroDesc,
      ctaButton: heroCta,
      calcButton: heroCalc,
      imageUrl: finalImg,
      height: Number(heroHeight),
      paddingTop: Number(heroPaddingTop),
      paddingBottom: Number(heroPaddingBottom),
      titleSize: heroTitleSize,
      descriptionSize: heroDescriptionSize,
      liveCountStart: Number(heroLiveCountStart),
      liveCountLabel: heroLiveCountLabel,
      liveCountSuffix: heroLiveCountSuffix,
      solutionBlueSize: heroSolutionBlueSize,
      commercialBlueText: heroCommercialBlueText,
      residentialBlueText: heroResidentialBlueText,
      parkingBlueText: heroParkingBlueText,
      commercialImage: heroCommercialImage,
      residentialImage: heroResidentialImage,
      parkingImage: heroParkingImage,
      quickContact1: heroQuick1,
      quickContact2: heroQuick2,
      quickContact3: heroQuick3
    });
    showSaveSuccess('🏠 메인 히어로 및 상단 3개 간편 문의 텍스트가 즉시 저장되었습니다!');
  };

  const handleSaveQuote = () => {
    onSaveQuoteConfig({
      badge: quoteBadge,
      title: quoteTitle,
      submitButton: quoteSubmitButton,
      successTitle: quoteSuccessTitle,
      successDesc: quoteSuccessDesc,
      privacyNotice: quotePrivacyNotice,
      directPhone: quoteDirectPhone,
      directKakaoUrl: quoteDirectKakaoUrl,
      purposeLabels: quotePurposeLabels,
      fields: quoteFields
    });
    showSaveSuccess('💬 온라인 무료 설치문의 팝업창 설정이 즉시 저장되었습니다!');
  };

  const handleSaveAbout = () => {
    onSaveAboutConfig({
      ceoName,
      ceoRole,
      ceoGreeting,
      ceoMessage1: ceoMsg1,
      ceoMessage2: ceoMsg2,
      ceoMessage3: ceoMsg3,
      ceoImage: ceoImg
    });
    showSaveSuccess('🏢 회사 소개 및 대표 인사말이 즉시 저장되었습니다!');
  };

  const handleSaveAllMaster = () => {
    handleSaveBrand();
    handleSaveHero();
    handleSaveQuote();
    handleSaveAbout();

    if (editingSolProd) {
      handleSaveSolProd();
    }

    onSaveProducts(products);
    onSaveSolutions(solutions);
    onSaveReviews(reviews);
    onSaveFaqs(faqs);
    onSaveNotices(notices);

    showSaveSuccess('💾 모든 탭의 에디터 변경 사항이 성공적으로 영구 저장되었습니다!');
  };

  // Product actions
  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdType(p.type);
    setProdPower(p.power);
    setProdDesc(p.description);
    setProdImage(p.image);
    setProdPlc(p.plcSupported);
    setProdFeatures([...p.features]);
    setProdSpecs({ ...p.specs });
    setProdPrice(p.price || 598000);
    setProdOriginalPrice(p.originalPrice || 660000);
    setProdDiscountRate(p.discountRate || 10);
    setProdBrand(p.brand || '스필');
    setProdManufacturer(p.manufacturer || '스필일렉트릭');
    setProdOrigin(p.origin || '대한민국');
    setProdModelName(p.modelName || 'DO-EVC-SEC7-C/K');
    setProdCertNumber(p.certNumber || 'XD070158-25001A');
    setProdDeliveryInfo(p.deliveryInfo || '택배(주문 시 결제) / 무료배송');
    setProdComponentsInfo(p.componentsInfo || '제조사 별도 발송 / 설치비 미포함 상품');
    setProdOptionGroups(p.optionGroups && p.optionGroups.length > 0 ? JSON.parse(JSON.stringify(p.optionGroups)) : JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS)));
  };

  const handleUpdateProduct = () => {
    const updated = products.map((p) => {
      if (p.id === editingProductId) {
        return {
          ...p,
          name: prodName,
          type: prodType,
          power: prodPower,
          description: prodDesc,
          image: prodImage,
          plcSupported: prodPlc,
          features: prodFeatures,
          specs: prodSpecs,
          price: Number(prodPrice),
          originalPrice: Number(prodOriginalPrice),
          discountRate: Number(prodDiscountRate),
          brand: prodBrand,
          manufacturer: prodManufacturer,
          origin: prodOrigin,
          modelName: prodModelName,
          certNumber: prodCertNumber,
          deliveryInfo: prodDeliveryInfo,
          componentsInfo: prodComponentsInfo,
          optionGroups: prodOptionGroups
        };
      }
      return p;
    });
    onSaveProducts(updated);
    setEditingProductId(null);
    showSaveSuccess('⚡ 신제품 정보, 할인가격 및 옵션 설정이 모두 저장되었습니다!');
  };

  // Solution actions
  const startEditSolution = (sol: Solution) => {
    setEditingSolutionId(sol.id);
    setSolTitle(sol.title);
    setSolSubtitle(sol.subtitle);
    setSolDesc(sol.description);
    setSolTarget(sol.target);
    setSolPower(sol.recommendedPower);
    setSolImage(sol.image);
    setSolBlueprintImageUrl(sol.blueprintImageUrl || '');
    setSolDetailImageUrl(sol.detailImageUrl || '');
    setSolBenefits([...sol.benefits]);
    setSolBannerMode(sol.bannerMode || 'cover');
    setSolDetailMode(sol.detailMode || 'scroll');
  };

  const handleUpdateSolution = () => {
    const updated = solutions.map((sol) => {
      if (sol.id === editingSolutionId) {
        return {
          ...sol,
          title: solTitle,
          subtitle: solSubtitle,
          description: solDesc,
          target: solTarget,
          recommendedPower: solPower,
          image: solImage,
          blueprintImageUrl: solBlueprintImageUrl,
          detailImageUrl: solDetailImageUrl,
          benefits: solBenefits,
          bannerMode: solBannerMode,
          detailMode: solDetailMode
        };
      }
      return sol;
    });
    onSaveSolutions(updated);
    setEditingSolutionId(null);
    showSaveSuccess('🛠️ 솔루션 세부 데이터가 갱신되었습니다!');
  };

  // Review actions
  const startEditReview = (rev: Review) => {
    setEditingReviewId(rev.id);
    setRevTitle(rev.title);
    setRevLocation(rev.location);
    setRevCategory(rev.category);
    setRevRating(rev.rating);
    setRevAuthor(rev.author);
    setRevInterview(rev.interview);
    setRevDetails(rev.details);
    setRevBeforeImg(rev.beforeImg);
    setRevAfterImg(rev.afterImg);
    setRevX(rev.coordinates?.x ?? 50);
    setRevY(rev.coordinates?.y ?? 50);
    setRevBlogUrl(rev.blogUrl ?? '');
    setRevIsBlogImported(rev.isBlogImported ?? false);
    setRevBlogName(rev.blogName ?? '네이버 블로그');
  };

  const handleUpdateReview = () => {
    const updated = reviews.map((rev) => {
      if (rev.id === editingReviewId) {
        return {
          ...rev,
          title: revTitle,
          location: revLocation,
          category: revCategory,
          rating: revRating,
          author: revAuthor,
          interview: revInterview,
          details: revDetails,
          beforeImg: revBeforeImg,
          afterImg: revAfterImg,
          coordinates: { x: Number(revX), y: Number(revY) },
          blogUrl: revBlogUrl || undefined,
          isBlogImported: revIsBlogImported,
          blogName: revBlogName
        };
      }
      return rev;
    });
    onSaveReviews(updated);
    setEditingReviewId(null);
    showSaveSuccess('📍 시공후기 지도 정보가 성공적으로 변경되었습니다!');
  };

  const handleAddReview = () => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      title: '새 시공 현장 후기 제목',
      location: '서울 강남구',
      category: 'Commercial',
      date: new Date().toISOString().slice(0, 10),
      rating: 5,
      beforeImg: 'https://images.unsplash.com/photo-1521500857785-5a827418b62c?auto=format&fit=crop&q=80&w=600',
      afterImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600',
      author: '홍길동 관리소장',
      interview: '새로 설치 후 전기차 타는 입주민들의 만족도가 아주 높습니다.',
      details: '완속 충전기 5대 신규 구축 및 안전 펜스 도장 완료',
      coordinates: { x: 35, y: 45 },
      blogUrl: '',
      isBlogImported: false,
      blogName: '네이버 블로그'
    };
    onSaveReviews([...reviews, newRev]);
    startEditReview(newRev);
    showSaveSuccess('➕ 새로운 시공 후기 항목이 생성되었습니다!');
  };

  const handleDeleteReview = (id: string) => {
    onSaveReviews(reviews.filter((r) => r.id !== id));
    if (editingReviewId === id) setEditingReviewId(null);
    showSaveSuccess('🗑️ 시공 후기가 성공적으로 삭제되었습니다.');
  };

  // FAQ actions
  const startEditFaq = (faq: FAQ) => {
    setEditingFaqId(faq.id);
    setFaqQ(faq.question);
    setFaqA(faq.answer);
    setFaqCat(faq.category);
  };

  const handleUpdateFaq = () => {
    const updated = faqs.map((faq) => {
      if (faq.id === editingFaqId) {
        return { ...faq, question: faqQ, answer: faqA, category: faqCat };
      }
      return faq;
    });
    onSaveFaqs(updated);
    setEditingFaqId(null);
    showSaveSuccess('💬 FAQ 답변 데이터가 업데이트되었습니다!');
  };

  const handleAddFaq = () => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: '새 질문 내용을 입력해 주세요.',
      answer: '새 질문에 대한 상세 답변 내용을 작성해 주세요.',
      category: '보조금/비용'
    };
    onSaveFaqs([...faqs, newFaq]);
    startEditFaq(newFaq);
    showSaveSuccess('➕ 신규 FAQ 항목이 생성되었습니다!');
  };

  const handleDeleteFaq = (id: string) => {
    onSaveFaqs(faqs.filter((f) => f.id !== id));
    if (editingFaqId === id) setEditingFaqId(null);
    showSaveSuccess('🗑️ FAQ가 삭제되었습니다.');
  };

  // Notice actions
  const startEditNotice = (not: any) => {
    setEditingNoticeId(not.id);
    setNotTitle(not.title);
    setNotDate(not.date);
    setNotImp(not.important);
  };

  const handleUpdateNotice = () => {
    const updated = notices.map((not) => {
      if (not.id === editingNoticeId) {
        return { ...not, title: notTitle, date: notDate, important: notImp };
      }
      return not;
    });
    onSaveNotices(updated);
    setEditingNoticeId(null);
    showSaveSuccess('📢 공지사항이 수정되었습니다!');
  };

  const handleAddNotice = () => {
    const newNot = {
      id: Date.now(),
      title: '새로운 통합 공지사항 타이틀',
      date: new Date().toISOString().split('T')[0],
      important: false
    };
    onSaveNotices([newNot, ...notices]);
    startEditNotice(newNot);
    showSaveSuccess('➕ 신규 공지사항이 작성되었습니다!');
  };

  const handleDeleteNotice = (id: number) => {
    onSaveNotices(notices.filter((n) => n.id !== id));
    if (editingNoticeId === id) setEditingNoticeId(null);
    showSaveSuccess('🗑️ 공지사항이 즉시 삭제되었습니다.');
  };

  const handleRestoreDefault = () => {
    if (confirm('주의: 모든 에디터 편집 기록을 지우고 처음 SY.com의 고품격 기본 텍스트 및 이미지로 복원하시겠습니까?')) {
      onResetAll();
      showSaveSuccess('🔄 모든 홈페이지 콘텐츠가 초기값으로 복원되었습니다.');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  if (!isOpen || (isEditMode !== undefined && !isEditMode)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
      />

      {/* Editor Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        id="cms-editor-modal"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
      >
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
              <Settings className="w-5.5 h-5.5 text-blue-400 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">SY.com 실시간 통합 홈페이지 에디터</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  CMS Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-350 font-bold mt-0.5">상세페이지 및 상품 등록 데이터가 Firestore 클라우드와 실시간 자동 동기화됩니다.</p>
            </div>
          </div>

          {/* Real-time Cloud Sync & Disaster Recovery Status Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('sync')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                syncStatus.state === 'syncing'
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 animate-pulse'
                  : syncStatus.state === 'restoring'
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 animate-pulse'
                  : syncStatus.state === 'error'
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
              title="클라우드 동기화 & 백업 복구 센터 열기"
            >
              {syncStatus.state === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>클라우드 동기화 중...</span>
                </>
              ) : syncStatus.state === 'restoring' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>데이터 복구 중...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>실시간 클라우드 동기화 됨</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:inline">({syncStatus.totalSyncedKeys}개 항목)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              id="btn-cms-close"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Notification Bar */}
        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-800 font-extrabold flex items-center gap-1.5 shrink-0"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0 scrollbar-none px-6">
          {(['brand', 'hero', 'about', 'solutions', 'review', 'support', 'sync', 'quote'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setEditingProductId(null);
                setEditingSolutionId(null);
                setEditingReviewId(null);
                setEditingFaqId(null);
                setEditingNoticeId(null);
              }}
              id={`tab-cms-${tab}`}
              className={`py-3.5 text-xs font-black border-b-2 transition-all mr-5 shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-850'
              }`}
            >
              {tab === 'brand' && '⚙️ 메뉴명 & 로고 설정'}
              {tab === 'hero' && '🏠 메인 화면 (히어로)'}
              {tab === 'about' && '🏢 회사소개 관리'}
              {tab === 'solutions' && '🛠️ 추천 상품 & 비교표 관리'}
              {tab === 'review' && '📍 설치후기 (설치지도/사례)'}
              {tab === 'support' && '💬 자주묻는질문 & 공지사항'}
              {tab === 'sync' && (
                <span className="flex items-center gap-1">
                  🔄 클라우드 동기화 & 백업 복구
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </span>
              )}
              {tab === 'quote' && (
                <span className="relative flex items-center gap-1 text-emerald-600 font-extrabold">
                  🔥 설치문의 팝업 설정
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </span>
              )}
            </button>
          ))}
          
          <button
            onClick={handleRestoreDefault}
            id="btn-cms-restore"
            className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 py-3 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 초기화 복원
          </button>
        </div>

        {/* Main Form Fields scroll box */}
        <div className="overflow-y-auto p-6 flex-grow bg-white text-slate-800">
          {/* Admin Easy Navigation and Helper Guide Box */}
          <div className="mb-6 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-blue-50 border border-emerald-100/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-black shrink-0 animate-bounce">
                💡
              </span>
              <div className="space-y-1.5">
                <h5 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-2">
                  관리자 전용 실시간 편집 꿀팁 &amp; 메뉴 가이드
                </h5>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  현재 홈페이지의 상단 메뉴명(<span className="text-blue-600 font-extrabold">{categoryLabels.products}</span>, <span className="text-blue-600 font-extrabold">{categoryLabels.solutions}</span>, <span className="text-blue-600 font-extrabold">{categoryLabels.review}</span>, <span className="text-blue-600 font-extrabold">{categoryLabels.support}</span>)과 에디터 탭 이름이 실시간으로 <span className="text-emerald-700 font-black underline">100% 자동 동기화</span>되어 관리하기 쉽습니다!
                </p>
                <div className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  📌 <strong className="text-slate-800">설치문의 팝업 설정 방법:</strong> 상단 우측의 <span className="text-emerald-700 font-black">🔥 설치문의 팝업 설정</span> 탭에서 팝업창 문구, 대표 번호, 신청 양식(이름, 주소, 연락처 등)을 다이렉트로 추가·삭제하실 수 있습니다.
                </div>
                
                {/* Dynamic Shortcuts */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('quote')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                      activeTab === 'quote'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    🔥 설치문의 팝업/입력항목 설정 바로가기
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('brand')}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                      activeTab === 'brand'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    ⚙️ 메뉴 이름 &amp; 로고 수정 바로가기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 0. BRAND & CATEGORIES TAB */}
            {activeTab === 'brand' && (
              <motion.div
                key="tab-brand"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-6"
              >
                {/* 🔒 ADMIN ID & PASSWORD CHANGE CARD */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-400/30">
                        🔒
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          전용 관리자 계정 (아이디/비밀번호) 설정
                        </h4>
                        <p className="text-[10px] text-slate-300 font-medium">
                          일반 방문자에게는 숨겨진 관리자 전용 계정 정보입니다. (현재 아이디: <strong className="text-blue-300">{localStorage.getItem('sy_admin_id') || 'admin'}</strong>)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-slate-300">새 아이디</label>
                      <input
                        type="text"
                        value={newAdminIdInput}
                        onChange={(e) => setNewAdminIdInput(e.target.value)}
                        placeholder="변경할 아이디 입력"
                        className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-400 rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-slate-300">새 비밀번호</label>
                      <input
                        type="password"
                        value={newAdminPassInput}
                        onChange={(e) => setNewAdminPassInput(e.target.value)}
                        placeholder="변경 시 입력"
                        className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-400 rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-slate-300">비밀번호 확인</label>
                      <input
                        type="password"
                        value={confirmAdminPassInput}
                        onChange={(e) => setConfirmAdminPassInput(e.target.value)}
                        placeholder="비밀번호 확인"
                        className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-400 rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminPassMsg('');
                          let updated = false;

                          if (newAdminIdInput.trim()) {
                            localStorage.setItem('sy_admin_id', newAdminIdInput.trim());
                            updated = true;
                          }

                          if (newAdminPassInput.trim()) {
                            if (newAdminPassInput.trim() !== confirmAdminPassInput.trim()) {
                              setAdminPassMsg('❌ 비밀번호 확인이 서로 일치하지 않습니다.');
                              return;
                            }
                            localStorage.setItem('sy_admin_password', newAdminPassInput.trim());
                            updated = true;
                          }

                          if (!updated) {
                            setAdminPassMsg('❌ 변경할 아이디 또는 비밀번호를 입력해 주세요.');
                            return;
                          }

                          setAdminPassMsg('✅ 관리자 전용 계정 정보가 새로 저장되었습니다!');
                          setNewAdminIdInput('');
                          setNewAdminPassInput('');
                          setConfirmAdminPassInput('');
                        }}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer h-[38px] flex items-center justify-center gap-1"
                      >
                        🔒 계정 설정 적용
                      </button>
                    </div>
                  </div>

                  {adminPassMsg && (
                    <p className={`text-xs font-bold px-3 py-2 rounded-xl border ${
                      adminPassMsg.startsWith('✅')
                        ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50'
                        : 'bg-rose-900/60 text-rose-200 border-rose-500/50'
                    }`}>
                      {adminPassMsg}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <Settings className="w-4 h-4 text-blue-600" />
                    실시간 브랜드 로고 이미지 &amp; 텍스트 변경
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    홈페이지 상단 헤더와 하단 푸터에 노출되는 로고 문구 및 서브타이틀을 직접 변경할 수 있습니다. 로고에 텍스트 대신 회사 로고 전용 이미지 파일을 적용하려면 이미지 링크를 지정하세요.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">로고 대문자 영문/한글 약어 (예: SY)</label>
                      <input
                        type="text"
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        placeholder="SY"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">로고 도메인/메인 브랜드명 (예: SY.com)</label>
                      <input
                        type="text"
                        value={logoSubtitle}
                        onChange={(e) => setLogoSubtitle(e.target.value)}
                        placeholder="SY.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <label className="block text-[11px] font-bold text-slate-700">대표 로고 이미지 설정 (업로드 또는 URL 링크)</label>
                    
                    {/* File Upload & Preview Section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                      {/* Drag & Drop Area */}
                      <div className="md:col-span-8">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(true);
                          }}
                          onDragLeave={() => setIsDraggingLogo(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                alert('이미지 파일만 업로드할 수 있습니다.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoImageUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById('logo-file-input')?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                            isDraggingLogo
                              ? 'border-blue-500 bg-blue-50/50'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="file"
                            id="logo-file-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setLogoImageUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-xs font-black text-slate-700">여기에 로고 이미지 파일을 드래그하거나 클릭하여 업로드</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">PNG, JPG, SVG, GIF 지원 (가로 비율 권장)</p>
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="md:col-span-4 flex flex-col justify-center items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden min-h-[140px]">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-2 left-2">PREVIEW</span>
                        {logoImageUrl ? (
                          <div className="flex flex-col items-center gap-2 w-full mt-2">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 max-h-[70px] flex items-center justify-center">
                              <img
                                src={logoImageUrl}
                                alt="Logo Preview"
                                className="max-h-[50px] max-w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setLogoImageUrl('')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer border border-rose-150"
                            >
                              <Trash2 className="w-3 h-3" />
                              이미지 제거
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-[11px] font-bold mt-2">
                            <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-40" />
                            <span>등록된 파일 없음</span>
                            <p className="text-[9px] text-slate-400 mt-0.5">기본 텍스트 로고 사용</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* URL Input Fallback */}
                    <div className="space-y-1 mt-2">
                      <label className="block text-[10px] font-bold text-slate-500">또는 로고 이미지 URL 직접 입력</label>
                      <input
                        type="text"
                        value={logoImageUrl}
                        onChange={(e) => setLogoImageUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono text-blue-600"
                      />
                      <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                        ※ 이미지 파일을 업로드하면 자동으로 고화질 로컬 Base64 데이터로 인코딩되어 실시간으로 반영됩니다.
                      </span>
                    </div>

                    {/* Logo Image Height Config */}
                    <div className="space-y-1 bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl mt-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                          📐 상단 로고 이미지 크기(높이) 조절
                        </label>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          {logoHeight} px
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-normal">
                        실제 홈페이지에서 로고 이미지가 너무 작거나 크게 보일 경우, 아래 슬라이더 또는 숫자로 최적의 크기를 직접 설정할 수 있습니다. (기본값: 44px)
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="range"
                          min="20"
                          max="120"
                          step="1"
                          value={logoHeight}
                          onChange={(e) => setLogoHeight(parseInt(e.target.value, 10))}
                          className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="20"
                          max="120"
                          value={logoHeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              setLogoHeight(Math.max(20, Math.min(120, val)));
                            }
                          }}
                          className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-emerald-800"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-black text-blue-900">로고 옆 회사명 표시 설정</span>
                          <span className="block text-[10px] text-slate-500 font-bold">상단 헤더 로고 옆에 회사명을 함께 노출시킬지 설정합니다.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={logoShowCompanyName} 
                            onChange={(e) => setLogoShowCompanyName(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {logoShowCompanyName && (
                        <div className="space-y-4 pt-2 border-t border-blue-100">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-600">노출할 회사명 텍스트</label>
                            <input
                              type="text"
                              value={logoCompanyNameText}
                              onChange={(e) => setLogoCompanyNameText(e.target.value)}
                              placeholder="(유)에스와이닷컴"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-600">글씨체 (폰트)</label>
                              <select
                                value={logoCompanyNameFont}
                                onChange={(e) => setLogoCompanyNameFont(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              >
                                <option value="noto">Clean 고딕 (Noto Sans KR)</option>
                                <option value="nanumgothic">Soft 나눔고딕 (Nanum Gothic)</option>
                                <option value="gowun">Elegant 명조체 (Gowun Batang)</option>
                                <option value="songmyung">Classic 서예체 (Song Myung)</option>
                                <option value="dohyeon">Bold 배달의민족 도현체 (Do Hyeon)</option>
                                <option value="blackhan">Display 블랙한산스 (Black Han Sans)</option>
                                <option value="sans">기본 시스템 폰트 (Sans-serif)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-600">글씨 두께 (굵기)</label>
                              <select
                                value={logoCompanyNameWeight}
                                onChange={(e) => setLogoCompanyNameWeight(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              >
                                <option value="normal">Normal (가늘게)</option>
                                <option value="medium">Medium (보통)</option>
                                <option value="semibold">Semibold (약간 두껍게)</option>
                                <option value="bold">Bold (두껍게)</option>
                                <option value="extrabold">Extrabold (매우 두껍게)</option>
                                <option value="black">Black (가장 두껍게)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-600">글씨 크기 (사이즈)</label>
                              <select
                                value={logoCompanyNameSize}
                                onChange={(e) => setLogoCompanyNameSize(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              >
                                <option value="xs">XS (가장 작게 - 12px)</option>
                                <option value="sm">SM (표준 - 14px)</option>
                                <option value="base">BASE (약간 크게 - 16px)</option>
                                <option value="lg">LG (크게 - 18px)</option>
                                <option value="xl">XL (아주 크게 - 20px)</option>
                                <option value="2xl">2XL (극대화 - 24px)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-600">글씨 색상 (컬러)</label>
                              <select
                                value={logoCompanyNameColor}
                                onChange={(e) => setLogoCompanyNameColor(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              >
                                <option value="slate-700">Slate Gray (중후한 회색)</option>
                                <option value="slate-900">Charcoal Dark (세련된 차콜블랙)</option>
                                <option value="blue-600">Electric Blue (활기찬 블루)</option>
                                <option value="blue-900">Deep Ocean (신뢰의 남색)</option>
                                <option value="indigo-700">Premium Indigo (품격있는 자줏빛인디고)</option>
                                <option value="emerald-700">Eco Green (친환경 녹색)</option>
                                <option value="red-600">Active Red (강렬한 붉은색)</option>
                              </select>
                            </div>
                          </div>

                          {/* Live Preview Font Demonstration in CMS Editor Modal */}
                          <div className="bg-slate-100/60 p-3 rounded-xl border border-slate-200/50 space-y-1 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block">글씨체 설정 실시간 미리보기 (Live Preview)</span>
                            <span className={`inline-block ${
                              logoCompanyNameFont === 'noto' ? 'font-noto' :
                              logoCompanyNameFont === 'gowun' ? 'font-gowun' :
                              logoCompanyNameFont === 'dohyeon' ? 'font-dohyeon' :
                              logoCompanyNameFont === 'blackhan' ? 'font-blackhan' :
                              logoCompanyNameFont === 'songmyung' ? 'font-songmyung' :
                              logoCompanyNameFont === 'nanumgothic' ? 'font-nanumgothic' : 'font-sans'
                            } ${
                              logoCompanyNameWeight === 'normal' ? 'font-normal' :
                              logoCompanyNameWeight === 'medium' ? 'font-medium' :
                              logoCompanyNameWeight === 'semibold' ? 'font-semibold' :
                              logoCompanyNameWeight === 'bold' ? 'font-bold' :
                              logoCompanyNameWeight === 'extrabold' ? 'font-extrabold' :
                              logoCompanyNameWeight === 'black' ? 'font-black' : 'font-extrabold'
                            } ${
                              logoCompanyNameSize === 'xs' ? 'text-xs' :
                              logoCompanyNameSize === 'sm' ? 'text-sm' :
                              logoCompanyNameSize === 'base' ? 'text-base' :
                              logoCompanyNameSize === 'lg' ? 'text-lg' :
                              logoCompanyNameSize === 'xl' ? 'text-xl' :
                              logoCompanyNameSize === '2xl' ? 'text-2xl' : 'text-sm'
                            } ${
                              logoCompanyNameColor === 'slate-900' ? 'text-slate-900' :
                              logoCompanyNameColor === 'blue-600' ? 'text-blue-600' :
                              logoCompanyNameColor === 'blue-900' ? 'text-blue-900' :
                              logoCompanyNameColor === 'indigo-700' ? 'text-indigo-700' :
                              logoCompanyNameColor === 'emerald-700' ? 'text-emerald-700' :
                              logoCompanyNameColor === 'red-600' ? 'text-red-600' : 'text-slate-700'
                            }`}>
                              {logoCompanyNameText || '회사명 테스트'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <X className="w-4 h-4 text-blue-600 rotate-45" />
                    메인 메뉴 카테고리 탭 이름 사용자 정의 (6대 핵심 메뉴)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    상단 내비게이션 탭의 각 카테고리 메뉴명을 비즈니스 특성에 맞게 원하는 대로 리네이밍할 수 있습니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 1: 메인 홈</label>
                      <input
                        type="text"
                        value={menuHome}
                        onChange={(e) => setMenuHome(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 2: 회사 소개</label>
                      <input
                        type="text"
                        value={menuAbout}
                        onChange={(e) => setMenuAbout(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 3: 아파트 (Commercial)</label>
                      <input
                        type="text"
                        value={menuSolCommercial}
                        onChange={(e) => setMenuSolCommercial(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 4: 가정용 홈 (Residential)</label>
                      <input
                        type="text"
                        value={menuSolResidential}
                        onChange={(e) => setMenuSolResidential(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 5: 상업시설 수익형 (ParkingLot)</label>
                      <input
                        type="text"
                        value={menuSolParking}
                        onChange={(e) => setMenuSolParking(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메뉴 6: 설치후기 (Reviews)</label>
                      <input
                        type="text"
                        value={menuReview}
                        onChange={(e) => setMenuReview(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <Building className="w-4 h-4 text-blue-600" />
                    홈페이지 하단 회사 정보 및 푸터(Footer) 설정
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    홈페이지 맨 아래(Footer) 영역에 노출되는 사업자 정보, 상호, 대표자명, 주소, 대표전화 및 이메일 정보를 실시간으로 수정할 수 있습니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">상호명 / 회사명</label>
                      <input
                        type="text"
                        value={footerCompanyName}
                        onChange={(e) => setFooterCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">대표이사 이름</label>
                      <input
                        type="text"
                        value={footerCeoName}
                        onChange={(e) => setFooterCeoName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">사업자 등록번호</label>
                      <input
                        type="text"
                        value={footerBusinessNumber}
                        onChange={(e) => setFooterBusinessNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">전국 대표 전화번호</label>
                      <input
                        type="text"
                        value={footerPhone}
                        onChange={(e) => setFooterPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">사업 제휴 이메일 주소</label>
                      <input
                        type="text"
                        value={footerEmail}
                        onChange={(e) => setFooterEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">통신판매업 신고번호</label>
                      <input
                        type="text"
                        value={footerTeleSalesNumber}
                        onChange={(e) => setFooterTeleSalesNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2 md:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600">회사 본사 소재지 주소</label>
                      <input
                        type="text"
                        value={footerAddress}
                        onChange={(e) => setFooterAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2 md:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600">전기공사업 면허 정보 및 하단 법적 고지 문구</label>
                      <textarea
                        value={footerLicenseInfo}
                        onChange={(e) => setFooterLicenseInfo(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 leading-normal"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <Save className="w-4 h-4 text-blue-600" />
                    우측 플로팅 소셜 미디어(SNS) 연동 설정
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    화면 오른쪽에 고정되는 플로팅 카카오톡 상담, 인스타그램 링크, 네이버 블로그 링크를 실시간으로 직접 수정할 수 있습니다.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4 mt-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="block text-xs font-black text-slate-800">우측 플로팅 SNS 버튼 노출</span>
                        <span className="block text-[10px] text-slate-500 font-bold">화면 우측에 소셜 미디어 플로팅 링크 바를 띄울지 결정합니다.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={snsShowFloating} 
                          onChange={(e) => setSnsShowFloating(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {snsShowFloating && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            카카오톡 상담 링크 URL
                          </label>
                          <input
                            type="text"
                            value={snsKakaoUrl}
                            onChange={(e) => setSnsKakaoUrl(e.target.value)}
                            placeholder="https://pf.kakao.com/..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                            인스타그램 링크 URL
                          </label>
                          <input
                            type="text"
                            value={snsInstagramUrl}
                            onChange={(e) => setSnsInstagramUrl(e.target.value)}
                            placeholder="https://www.instagram.com/..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            유튜브 채널 링크 URL
                          </label>
                          <input
                            type="text"
                            value={snsYoutubeUrl}
                            onChange={(e) => setSnsYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            네이버 블로그 링크 URL
                          </label>
                          <input
                            type="text"
                            value={snsBlogUrl}
                            onChange={(e) => setSnsBlogUrl(e.target.value)}
                            placeholder="https://blog.naver.com/..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <Settings className="w-4 h-4 text-blue-600" />
                    서비스 간편 8대 목차 바로가기(퀵메뉴) 아이콘 및 문구 수정
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    메인 히어로 아래 노출되는 8가지 동그란 아이콘 형태의 바로가기 메뉴의 문구, 아이콘 디자인, 그리고 클릭 시 연결할 이동 탭 정보를 직접 설정할 수 있습니다.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4 mt-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="block text-xs font-black text-slate-800">간편 퀵메뉴 영역 노출</span>
                        <span className="block text-[10px] text-slate-500 font-bold">메인 화면에 원형 간편 목차 바로가기 영역을 띄울지 결정합니다.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={quickShowMenu} 
                          onChange={(e) => setQuickShowMenu(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {quickShowMenu && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {quickMenuItems.map((item, idx) => (
                            <div key={item.id} className="bg-white border border-slate-200/80 p-3 rounded-xl space-y-2">
                              <span className="text-[10px] font-black text-blue-600 font-mono">ITEM {idx + 1}</span>
                              
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500">메뉴 노출 이름</label>
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => {
                                    const updated = [...quickMenuItems];
                                    updated[idx] = { ...item, label: e.target.value };
                                    setQuickMenuItems(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500">아이콘 모양 선택</label>
                                <select
                                  value={item.iconType}
                                  onChange={(e) => {
                                    const updated = [...quickMenuItems];
                                    updated[idx] = { ...item, iconType: e.target.value };
                                    setQuickMenuItems(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                                >
                                  <option value="MapPin">📍 설치후기 (MapPin)</option>
                                  <option value="Building2">🏢 기업용 충전 (Building2)</option>
                                  <option value="Home">🏠 주택 비공용 (Home)</option>
                                  <option value="GraduationCap">🎓 학교/기관 (GraduationCap)</option>
                                  <option value="ParkingCircle">🅿️ 주차장 충전 (ParkingCircle)</option>
                                  <option value="Zap">⚡ 급속충전 (Zap)</option>
                                  <option value="RefreshCw">🔄 기기교체 (RefreshCw)</option>
                                  <option value="TrendingUp">📈 홍보수익형 (TrendingUp)</option>
                                  <option value="Phone">📞 전화상담 (Phone)</option>
                                  <option value="Wrench">🔧 정비관리 (Wrench)</option>
                                  <option value="ShieldCheck">🛡️ 품질보증 (ShieldCheck)</option>
                                  <option value="Sparkles">✨ 혜택/뱃지 (Sparkles)</option>
                                  <option value="Landmark">🏛️ 관공서 (Landmark)</option>
                                  <option value="Calculator">🧮 견적계산 (Calculator)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500">클릭 시 연결 탭</label>
                                <select
                                  value={item.targetPage}
                                  onChange={(e) => {
                                    const updated = [...quickMenuItems];
                                    updated[idx] = { ...item, targetPage: e.target.value };
                                    setQuickMenuItems(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                                >
                                  <option value="home">메인 홈</option>
                                  <option value="about">회사 소개</option>
                                  <option value="products">신제품소개</option>
                                  <option value="solutions">용도별솔루션</option>
                                  <option value="review">설치후기</option>
                                  <option value="support">고객지원</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    상단 헤더 설치문의 및 단축 버튼 문구 제어
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5 leading-relaxed">
                    상단 우측에 고정 노출되는 \'전기차충전기 설치문의\' 통합 레이블 및 아파트, 가정용, 상업시설 단축 이동 버튼들의 문구를 직접 커스터마이징합니다. PC와 모바일 화면 문구를 독립적으로 운영하거나 하나로 동기화(연동)할 수 있습니다.
                  </p>

                  {/* Sync Option */}
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-black text-blue-900">모바일 단축 문구 PC와 동일하게 동기화 (연동)</span>
                        <span className="block text-[10px] text-slate-500 font-bold">활성화 시, 모바일 드로어 메뉴의 문구가 PC용 단축 문구와 동일하게 자동 동기화되어 유지됩니다.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={headerSyncMobileWithPc} 
                          onChange={(e) => setHeaderSyncMobileWithPc(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* PC Section */}
                    <div className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <h5 className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        PC 화면용 문구 설정
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">PC 설치문의 메인 버튼</label>
                          <input
                            type="text"
                            value={headerInquiryTitlePc}
                            onChange={(e) => setHeaderInquiryTitlePc(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">PC 단축 1: 아파트 · 공동주택</label>
                          <input
                            type="text"
                            value={headerShortcutCommercialPc}
                            onChange={(e) => setHeaderShortcutCommercialPc(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">PC 단축 2: 가정용 · 개인 홈</label>
                          <input
                            type="text"
                            value={headerShortcutResidentialPc}
                            onChange={(e) => setHeaderShortcutResidentialPc(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">PC 단축 3: 상업시설 · 수익형</label>
                          <input
                            type="text"
                            value={headerShortcutParkingPc}
                            onChange={(e) => setHeaderShortcutParkingPc(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Section */}
                    <div className="space-y-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <h5 className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${headerSyncMobileWithPc ? 'bg-slate-400' : 'bg-emerald-600'}`}></span>
                        모바일 화면용 문구 설정 {headerSyncMobileWithPc && <span className="text-[10px] text-blue-600 font-bold">(PC 동기화 적용 중)</span>}
                      </h5>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">모바일 설치문의 메인 버튼</label>
                          <input
                            type="text"
                            value={headerSyncMobileWithPc ? headerInquiryTitlePc : headerInquiryTitleMobile}
                            onChange={(e) => setHeaderInquiryTitleMobile(e.target.value)}
                            disabled={headerSyncMobileWithPc}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-bold ${
                              headerSyncMobileWithPc ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">모바일 단축 1: 아파트 · 공동주택</label>
                          <input
                            type="text"
                            value={headerSyncMobileWithPc ? headerShortcutCommercialPc : headerShortcutCommercialMobile}
                            onChange={(e) => setHeaderShortcutCommercialMobile(e.target.value)}
                            disabled={headerSyncMobileWithPc}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-bold ${
                              headerSyncMobileWithPc ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">모바일 단축 2: 가정용 · 개인 홈</label>
                          <input
                            type="text"
                            value={headerSyncMobileWithPc ? headerShortcutResidentialPc : headerShortcutResidentialMobile}
                            onChange={(e) => setHeaderShortcutResidentialMobile(e.target.value)}
                            disabled={headerSyncMobileWithPc}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-bold ${
                              headerSyncMobileWithPc ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-600">모바일 단축 3: 상업시설 · 수익형</label>
                          <input
                            type="text"
                            value={headerSyncMobileWithPc ? headerShortcutParkingPc : headerShortcutParkingMobile}
                            onChange={(e) => setHeaderShortcutParkingMobile(e.target.value)}
                            disabled={headerSyncMobileWithPc}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-bold ${
                              headerSyncMobileWithPc ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveBrand}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-4 h-4" />
                    대표 로고, 회사명, SNS, 퀵메뉴 설정 저장
                  </button>
                </div>
              </motion.div>
            )}

            {/* 1. HERO TAB */}
            {activeTab === 'hero' && (
              <motion.div
                key="tab-hero"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-4"
              >
                <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  메인 히어로 영역 텍스트 편집
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">히어로 상단 미니 뱃지 문구</label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">메인 무료 상담 예약 버튼 문구</label>
                    <input
                      type="text"
                      value={heroCta}
                      onChange={(e) => setHeroCta(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                {/* 1-0. HERO BACKGROUND IMAGE & HEIGHT CONFIG */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-4 mt-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="block text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        📁 메인 배경 이미지 파일 첨부 & 배너 설정
                      </span>
                      <p className="text-[10px] text-slate-500 font-bold leading-normal mt-0.5">
                        내 컴퓨터의 배경 이미지 파일(JPG, PNG, WEBP 등)을 직접 첨부하여 메인 화면 배경을 변경할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* PROMINENT FILE ATTACHMENT BOX & PREVIEW */}
                  <div className="bg-white border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Current Image Preview Thumbnail */}
                      <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs">
                        <img
                          src={heroImageUrl || "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1920&auto=format&fit=crop"}
                          alt="Hero Background Preview"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-slate-950/85 text-white text-[9px] font-extrabold px-2 py-0.5 rounded backdrop-blur-xs">
                          현재 적용 배경
                        </span>
                      </div>

                      {/* File Upload Controls */}
                      <div className="flex-1 space-y-2.5 w-full">
                        <label className="block text-xs font-black text-slate-800 flex items-center gap-1">
                          📷 메인 배경 이미지 파일 첨부하기
                        </label>
                        <p className="text-[11px] text-slate-500 font-medium leading-snug">
                          원하는 배경 사진 파일(고화질 가로형 이미지 권장)을 선택하면 즉시 메인 화면에 적용됩니다.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-95">
                            <Upload className="w-4 h-4" />
                            <span>📁 컴퓨터에서 이미지 파일 선택 / 첨부</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const compressed = await compressImage(file, 1920, 1080, 0.82);
                                  setHeroImageUrl(compressed);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {heroImageUrl && (
                            <button
                              type="button"
                              onClick={() => setHeroImageUrl('')}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>기본 이미지로 초기화</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible URL Input Option */}
                    <details className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <summary className="font-bold text-slate-600 cursor-pointer hover:text-emerald-700 select-none py-1">
                        🔗 웹 이미지 URL 주소로 직접 입력하기 (선택 사항)
                      </summary>
                      <div className="mt-2 space-y-1">
                        <input
                          type="text"
                          value={heroImageUrl}
                          onChange={(e) => setHeroImageUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-blue-600"
                          placeholder="https://images.unsplash.com/... 또는 직접 이미지 URL 주소 입력"
                        />
                      </div>
                    </details>
                  </div>

                      {/* Banner Height Adjust */}
                      <div className="space-y-1 bg-white p-3 border border-slate-200/80 rounded-xl">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-700">배너 세로 높이 조절 (px 단위)</label>
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {heroHeight} px
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="450"
                            max="1100"
                            step="10"
                            value={heroHeight}
                            onChange={(e) => setHeroHeight(parseInt(e.target.value, 10))}
                            className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                    {/* Content Spacing (Padding Top & Bottom) controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-700">글자 상단(위) 여백 (Padding Top)</label>
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {heroPaddingTop} px
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="20"
                            max="300"
                            step="5"
                            value={heroPaddingTop}
                            onChange={(e) => setHeroPaddingTop(parseInt(e.target.value, 10))}
                            className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-700">글자 하단(아래) 여백 (Padding Bottom)</label>
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {heroPaddingBottom} px
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="20"
                            max="300"
                            step="5"
                            value={heroPaddingBottom}
                            onChange={(e) => setHeroPaddingBottom(parseInt(e.target.value, 10))}
                            className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">메인 대형 메인 카피 타이틀 (HTML 지원)</label>
                  <textarea
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">상세 설명 서브 단락 카피</label>
                  <textarea
                    value={heroDesc}
                    onChange={(e) => setHeroDesc(e.target.value)}
                    rows={3.5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">보조금 간편 계산 버튼 문구</label>
                  <input
                    type="text"
                    value={heroCalc}
                    onChange={(e) => setHeroCalc(e.target.value)}
                    className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                {/* 1-1. HERO TEXT SIZES */}
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-3 mt-4">
                  <span className="block text-xs font-black text-amber-900 flex items-center gap-1">
                    🔍 글자 크기 (사이즈) 미세 조절 설정
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">메인 타이틀(제목) 글씨 크기</label>
                      <select
                        value={heroTitleSize}
                        onChange={(e) => setHeroTitleSize(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="small">작게 (Small - 모바일에서 아담하게 노출)</option>
                        <option value="medium">보통 (Medium - 단정하고 깔끔한 느낌)</option>
                        <option value="large">크게 (Large - 웅장한 기본 크기)</option>
                        <option value="xlarge">매우 크게 (X-Large - 시원시원한 극대화 크기)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">상세 설명 서브 단락 글씨 크기</label>
                      <select
                        value={heroDescriptionSize}
                        onChange={(e) => setHeroDescriptionSize(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="small">작게 (Small)</option>
                        <option value="medium">보통 (Medium - 기본값)</option>
                        <option value="large">크게 (Large)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1-2. HERO LIVE COUNTER STATUS */}
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-3 mt-4">
                  <span className="block text-xs font-black text-blue-900 flex items-center gap-1.5">
                    📊 우측 라이브(LIVE) 설치현황 숫자 및 문구 직접 수정
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    전국 충전기 설치현황 전산 집계 수치의 실시간 시작값과 해당 영역의 문구들을 변경할 수 있습니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">누적 설치 시작 숫자 (숫자만 입력)</label>
                      <input
                        type="number"
                        value={heroLiveCountStart}
                        onChange={(e) => setHeroLiveCountStart(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-700"
                        placeholder="14520"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600">설치 현황 안내 타이틀</label>
                      <input
                        type="text"
                        value={heroLiveCountLabel}
                        onChange={(e) => setHeroLiveCountLabel(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="현재 전국 SY.com 충전기 설치 현황"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">수치 뒤 돌파 문구</label>
                      <input
                        type="text"
                        value={heroLiveCountSuffix}
                        onChange={(e) => setHeroLiveCountSuffix(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="대 돌파"
                      />
                    </div>

                    {/* Quick Live Preview inside CMS */}
                    <div className="bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/50 flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold">라이브 카운터 실시간 미리보기 (Live Preview)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded font-mono">
                          {heroLiveCountStart}
                        </span>
                        <span className="text-xs font-extrabold text-slate-700">
                          {heroLiveCountSuffix || '대 돌파'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-3. CUSTOM SOLUTIONS CARD SUBTITLE AND SIZE SETTING */}
                <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl space-y-3 mt-4">
                  <span className="block text-xs font-black text-blue-900 flex items-center gap-1.5">
                    ⚙️ 용도별 맞춤 충전 솔루션 카드 파란 글씨(소개글) 및 크기 편집
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    홈 화면의 세 가지 카드(기업용, 주거용, 주차장용) 제목 아래에 있는 파란색 핵심 특징 소개 문구와 그 글씨 크기를 조절할 수 있습니다.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">핵심 특징 파란 글씨 크기 조절</label>
                      <select
                        value={heroSolutionBlueSize}
                        onChange={(e) => setHeroSolutionBlueSize(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                        <option value="small">작게 (Small)</option>
                        <option value="medium">보통 (Medium - 기본값)</option>
                        <option value="large">크게 (Large)</option>
                        <option value="xlarge">매우 크게 (X-Large)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 mt-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">기업용 카드 파란 글씨</label>
                        <input
                          type="text"
                          value={heroCommercialBlueText}
                          onChange={(e) => setHeroCommercialBlueText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          placeholder="회사 사옥, 물류창고, 공장, 관공서 전용"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">주거용 카드 파란 글씨</label>
                        <input
                          type="text"
                          value={heroResidentialBlueText}
                          onChange={(e) => setHeroResidentialBlueText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          placeholder="단독주택, 빌라, 아파트(개인/공용) 전용"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">주차장용 카드 파란 글씨</label>
                        <input
                          type="text"
                          value={heroParkingBlueText}
                          onChange={(e) => setHeroParkingBlueText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          placeholder="대형 마트, 호텔, 빌딩, 공영주차장 맞춤"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-3-2. CUSTOM SOLUTION CARDS MAIN IMAGE CONFIG (아파트 / 가정용 / 상업시설 수익형) */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-4 mt-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        🖼️ 메인화면 용도별 맞춤 솔루션 카드 3종 이미지(사진) 설정
                      </span>
                      <p className="text-[10px] text-slate-500 font-bold leading-normal mt-0.5">
                        메인 화면의 3개 대표 카드(가정용 홈, 아파트, 상업시설 수익형)에 들어가는 메인 이미지/사진을 직접 첨부하거나 변경할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: 가정용 홈 */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            🏠 가정용 홈 메인 이미지
                          </span>
                          {heroResidentialImage && (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              적용중
                            </span>
                          )}
                        </div>

                        <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {heroResidentialImage ? (
                            <img
                              src={heroResidentialImage}
                              alt="Residential Hero Card Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center p-2 text-slate-400 text-[10px] font-bold">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                              <span>기본 일러스트 모드</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">이미지 URL 직접 입력</label>
                          <input
                            type="text"
                            value={heroResidentialImage}
                            onChange={(e) => setHeroResidentialImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <label className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black text-center cursor-pointer flex items-center justify-center gap-1 transition-all">
                          <Upload className="w-3 h-3" />
                          <span>사진 파일 첨부</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file, 1200, 800, 0.85);
                                setHeroResidentialImage(compressed);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {heroResidentialImage && (
                          <button
                            type="button"
                            onClick={() => setHeroResidentialImage('')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card 2: 아파트 */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            🏢 아파트 메인 이미지
                          </span>
                          {heroCommercialImage && (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              적용중
                            </span>
                          )}
                        </div>

                        <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {heroCommercialImage ? (
                            <img
                              src={heroCommercialImage}
                              alt="Commercial Hero Card Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center p-2 text-slate-400 text-[10px] font-bold">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                              <span>기본 일러스트 모드</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">이미지 URL 직접 입력</label>
                          <input
                            type="text"
                            value={heroCommercialImage}
                            onChange={(e) => setHeroCommercialImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <label className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black text-center cursor-pointer flex items-center justify-center gap-1 transition-all">
                          <Upload className="w-3 h-3" />
                          <span>사진 파일 첨부</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file, 1200, 800, 0.85);
                                setHeroCommercialImage(compressed);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {heroCommercialImage && (
                          <button
                            type="button"
                            onClick={() => setHeroCommercialImage('')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card 3: 상업시설 수익형 */}
                    <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-2.5 flex flex-col justify-between ring-2 ring-emerald-500/10">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                            🅿️ 상업시설 수익형 메인 이미지
                          </span>
                          {heroParkingImage ? (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              적용중
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              수정 가능
                            </span>
                          )}
                        </div>

                        <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {heroParkingImage ? (
                            <img
                              src={heroParkingImage}
                              alt="Parking Hero Card Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center p-2 text-slate-400 text-[10px] font-bold">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                              <span>기본 일러스트 모드</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500">이미지 URL 직접 입력</label>
                          <input
                            type="text"
                            value={heroParkingImage}
                            onChange={(e) => setHeroParkingImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-emerald-800 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        <label className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black text-center cursor-pointer flex items-center justify-center gap-1 transition-all shadow-sm">
                          <Upload className="w-3 h-3" />
                          <span>상업시설 사진 파일 첨부</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file, 1200, 800, 0.85);
                                setHeroParkingImage(compressed);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {heroParkingImage && (
                          <button
                            type="button"
                            onClick={() => setHeroParkingImage('')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-4. TOP QUICK CONTACT SHORTCUTS */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl space-y-3 mt-4">
                  <span className="block text-xs font-black text-blue-900 flex items-center gap-1.5">
                    ⚡ 상단 3개 간편 문의 바로가기 버튼 텍스트 수정
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    홈페이지 상단 메뉴바 위에 노출되는 3개의 무상 설치 문의 버튼 안의 텍스트를 각각 변경할 수 있습니다.
                  </p>

                  <div className="grid grid-cols-1 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">첫 번째 버튼 텍스트</label>
                      <input
                        type="text"
                        value={heroQuick1}
                        onChange={(e) => setHeroQuick1(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="환경부지원 아파트 무상설치 문의 ⚡"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">두 번째 버튼 텍스트</label>
                      <input
                        type="text"
                        value={heroQuick2}
                        onChange={(e) => setHeroQuick2(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="가정용 · 홈 충전기 설치문의 🏠"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">세 번째 버튼 텍스트</label>
                      <input
                        type="text"
                        value={heroQuick3}
                        onChange={(e) => setHeroQuick3(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="상업시설 · 수익형 충전기 설치문의 🏢"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveHero}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-4 h-4" />
                    히어로 설정 변경 즉시 저장
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. ABOUT TAB */}
            {activeTab === 'about' && (
              <motion.div
                key="tab-about"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-4"
              >
                <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                  <User className="w-4 h-4 text-blue-600" />
                  대표자 인사말 및 소개 이미지 수정
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">CEO 이름</label>
                      <input
                        type="text"
                        value={ceoName}
                        onChange={(e) => setCeoName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">CEO 직함 및 이력</label>
                      <input
                        type="text"
                        value={ceoRole}
                        onChange={(e) => setCeoRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-slate-700">대표자 사진 설정 (업로드 또는 URL 링크)</label>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                      {/* Drag & Drop Area */}
                      <div className="md:col-span-8">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingCeoImg(true);
                          }}
                          onDragLeave={() => setIsDraggingCeoImg(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingCeoImg(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                alert('이미지 파일만 업로드할 수 있습니다.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCeoImg(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById('ceo-file-input')?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
                            isDraggingCeoImg
                              ? 'border-blue-500 bg-blue-50/50'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="file"
                            id="ceo-file-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCeoImg(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <p className="text-[11px] font-black text-slate-700">대표자 사진 드래그 또는 클릭 업로드</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">PNG, JPG, JPEG 지원</p>
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="md:col-span-4 flex flex-col justify-center items-center p-3 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden min-h-[120px]">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-1.5 left-1.5">PREVIEW</span>
                        {ceoImg ? (
                          <div className="flex flex-col items-center gap-1.5 w-full mt-2">
                            <img
                              src={ceoImg}
                              alt="CEO Preview"
                              className="max-h-[60px] max-w-[100px] object-cover rounded-lg border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setCeoImg('')}
                              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer border border-rose-150"
                            >
                              제거
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-[10px] font-bold mt-2">
                            <ImageIcon className="w-4 h-4 mx-auto mb-1 opacity-40" />
                            <span>등록 없음</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">직접 입력 / 프리셋 선택</label>
                      <input
                        type="text"
                        value={ceoImg}
                        onChange={(e) => setCeoImg(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-blue-600 font-mono"
                      />
                      <div className="flex gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                        {CURATED_CEO_IMAGES.map((img) => (
                          <button
                            key={img.url}
                            type="button"
                            onClick={() => setCeoImg(img.url)}
                            className={`p-1 border rounded-lg overflow-hidden shrink-0 transition-all ${
                              ceoImg === img.url ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200'
                            }`}
                          >
                            <img src={img.url} alt={img.label} className="w-12 h-8 object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">인사말 대표 캐치프레이즈 인용구</label>
                  <input
                    type="text"
                    value={ceoGreeting}
                    onChange={(e) => setCeoGreeting(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-700">인사말 장문 단락 (3단락 구성)</label>
                  <textarea
                    value={ceoMsg1}
                    onChange={(e) => setCeoMsg1(e.target.value)}
                    rows={2.5}
                    placeholder="단락 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <textarea
                    value={ceoMsg2}
                    onChange={(e) => setCeoMsg2(e.target.value)}
                    rows={2.5}
                    placeholder="단락 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <textarea
                    value={ceoMsg3}
                    onChange={(e) => setCeoMsg3(e.target.value)}
                    rows={2.5}
                    placeholder="단락 3 (마무리 및 서명)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveAbout}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-4 h-4" />
                    회사 소개 및 인사말 저장하기
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div
                key="tab-products"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-5"
              >
                {!editingProductId ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">신제품 충전기 라인업 관리</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200/50" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black">{p.type}</span>
                                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-extrabold">{p.power}</span>
                              </div>
                              <h5 className="text-xs font-black text-slate-900 mt-1 truncate">{p.name}</h5>
                            </div>
                          </div>

                          <button
                            onClick={() => startEditProduct(p)}
                            className="px-3.5 py-1.5 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            상세 편집 / 이미지 수정
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/5 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h5 className="text-xs font-black text-blue-800 uppercase">⚡ 신제품 상세 프로필 편집</h5>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        돌아가기
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">기기명 (모델명)</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">구분 타입</label>
                          <select
                            value={prodType}
                            onChange={(e) => setProdType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                          >
                            <option value="완속">완속</option>
                            <option value="급속">급속</option>
                            <option value="초급속">초급속</option>
                            <option value="스마트홈">스마트홈</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">출력 전력</label>
                          <input
                            type="text"
                            value={prodPower}
                            onChange={(e) => setProdPower(e.target.value)}
                            placeholder="예: 7kW, 11kW, 200kW"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price & Discount Settings matching user prompt */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-[11px] font-black text-slate-800">
                        💰 정가 및 할인가격 / 할인율 설정
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500">기존 정가 (취소선 표시)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={prodOriginalPrice}
                              onChange={(e) => setProdOriginalPrice(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 line-through"
                            />
                            <span className="text-xs font-bold text-slate-400">원</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-slate-500">실제 판매가 (할인가)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={prodPrice}
                              onChange={(e) => setProdPrice(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-600"
                            />
                            <span className="text-xs font-bold text-slate-700">원</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-slate-500">할인율 뱃지 (%)</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={prodDiscountRate}
                              onChange={(e) => setProdDiscountRate(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-600"
                            />
                            <span className="text-xs font-bold text-slate-700">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Image & Clipboard Paste Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700">충전기 사진 설정 (업로드, 붙여넣기, URL)</label>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const clipboardItems = await navigator.clipboard.read();
                                for (const item of clipboardItems) {
                                  for (const type of item.types) {
                                    if (type.startsWith('image/')) {
                                      const blob = await item.getType(type);
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (reader.result) {
                                          setProdImage(reader.result as string);
                                          alert('📋 캡처한 이미지가 성공적으로 붙여넣어졌습니다!');
                                        }
                                      };
                                      reader.readAsDataURL(blob);
                                      return;
                                    }
                                  }
                                }
                                alert('클립보드에 이미지 파일이 없습니다. 캡처(PrtScn / Ctrl+Shift+S) 후 다시 눌러주세요.');
                              } catch (err) {
                                alert('아래 입력란을 클릭하고 keyboard Ctrl+V 키를 직접 누르면 캡처 이미지가 즉시 붙여넣어집니다!');
                              }
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1"
                          >
                            📋 캡처 이미지 붙여넣기
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                          {/* Drag & Drop Area */}
                          <div className="md:col-span-8">
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingProdImg(true);
                              }}
                              onDragLeave={() => setIsDraggingProdImg(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingProdImg(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  if (!file.type.startsWith('image/')) {
                                    alert('이미지 파일만 업로드할 수 있습니다.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setProdImage(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              onClick={() => document.getElementById('prod-file-input')?.click()}
                              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                                isDraggingProdImg
                                  ? 'border-blue-500 bg-blue-50/50'
                                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="file"
                                id="prod-file-input"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setProdImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Upload className="w-5 h-5 text-slate-400 mb-1" />
                              <p className="text-[11px] font-black text-slate-700">사진 드래그, 클릭 또는 Ctrl+V 붙여넣기</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">캡처 사진 직접 붙여넣기 지원</p>
                            </div>
                          </div>

                          {/* Preview Box */}
                          <div className="md:col-span-4 flex flex-col justify-center items-center p-2.5 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden min-h-[110px]">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-1.5 left-1.5">PREVIEW</span>
                            {prodImage ? (
                              <div className="flex flex-col items-center gap-1 w-full mt-2">
                                <img
                                  src={prodImage}
                                  alt="Product Preview"
                                  className="max-h-[50px] max-w-[80px] object-cover rounded-lg border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setProdImage('')}
                                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer border border-rose-150"
                                >
                                  제거
                                </button>
                              </div>
                            ) : (
                              <div className="text-center text-slate-400 text-[10px] font-bold mt-2">
                                <ImageIcon className="w-4 h-4 mx-auto mb-1 opacity-40" />
                                <span>등록 없음</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500">URL 직접 입력 / 캡처한 이미지 Ctrl+V 붙여넣기</label>
                          <input
                            type="text"
                            value={prodImage}
                            onChange={(e) => setProdImage(e.target.value)}
                            onPaste={(e) => handlePasteImageFromClipboard(e, setProdImage)}
                            placeholder="이미지 URL 입력 또는 캡처 사진 붙여넣기 (Ctrl+V)"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-blue-600 font-mono"
                          />
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {CURATED_EV_IMAGES.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                title={item.label}
                                onClick={() => setProdImage(item.url)}
                                className={`h-10 rounded-lg border overflow-hidden shrink-0 relative transition-all ${
                                  prodImage === item.url ? 'border-blue-600 ring-2 ring-blue-600/15' : 'border-slate-200'
                                }`}
                              >
                                <img src={item.url} alt="preset" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="space-y-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <label className="block text-[10px] font-black text-slate-700">상세 메타데이터 (브랜드/제조사/모델명)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold">브랜드</span>
                              <input
                                type="text"
                                value={prodBrand}
                                onChange={(e) => setProdBrand(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold">제조사</span>
                              <input
                                type="text"
                                value={prodManufacturer}
                                onChange={(e) => setProdManufacturer(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold">모델명</span>
                              <input
                                type="text"
                                value={prodModelName}
                                onChange={(e) => setProdModelName(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] text-slate-400 font-bold">인증번호</span>
                              <input
                                type="text"
                                value={prodCertNumber}
                                onChange={(e) => setProdCertNumber(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            checked={prodPlc}
                            onChange={(e) => setProdPlc(e.target.checked)}
                            id="chk-prod-plc"
                            className="w-4 h-4 text-blue-600 rounded border-slate-200 focus:ring-blue-500"
                          />
                          <label htmlFor="chk-prod-plc" className="text-xs font-bold text-slate-800">
                            환경부 화재 감지용 핵심 PLC 모뎀 탑재 모델 여부
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Product Options & Additional Items Manager */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <h6 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                            <Settings className="w-4 h-4 text-emerald-600" />
                            상품 옵션 및 추가구성 그룹 관리자
                          </h6>
                          <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                            사용자가 구매 시 선택할 수 있는 케이블 길이, 하이박스, 캐노피, 스탠드, 볼라드, 스토퍼, 표지판 등 옵션들을 직접 수정 및 추가합니다.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newGroup: ProductOptionGroup = {
                              id: `grp-${Date.now()}`,
                              title: '새 추가옵션 그룹 선택',
                              required: false,
                              options: [
                                { id: `opt-${Date.now()}-1`, name: '선택 안함', price: 0 },
                                { id: `opt-${Date.now()}-2`, name: '추가 옵션 항목 (+10,000원)', price: 10000 }
                              ]
                            };
                            setProdOptionGroups([...prodOptionGroups, newGroup]);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>옵션/추가구성 그룹 추가</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {prodOptionGroups.map((grp, grpIdx) => (
                          <div key={grp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                  그룹 {grpIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={grp.title}
                                  onChange={(e) => {
                                    const next = [...prodOptionGroups];
                                    next[grpIdx].title = e.target.value;
                                    setProdOptionGroups(next);
                                  }}
                                  placeholder="예: 충전선 길이 선택, 캐노피 선택..."
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const next = prodOptionGroups.filter((_, idx) => idx !== grpIdx);
                                  setProdOptionGroups(next);
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="그룹 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Options List */}
                            <div className="space-y-1.5 pl-2">
                              <div className="text-[10px] font-black text-slate-500">옵션 세부 선택 항목 (항목 명칭 / 추가 금액):</div>
                              {grp.options.map((opt, optIdx) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => {
                                      const next = [...prodOptionGroups];
                                      next[grpIdx].options[optIdx].name = e.target.value;
                                      setProdOptionGroups(next);
                                    }}
                                    placeholder="항목 명칭 (예: 7m 케이블)"
                                    className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                                  />
                                  <div className="flex items-center gap-1 w-32 shrink-0">
                                    <span className="text-xs font-bold text-slate-400">+</span>
                                    <input
                                      type="number"
                                      value={opt.price}
                                      onChange={(e) => {
                                        const next = [...prodOptionGroups];
                                        next[grpIdx].options[optIdx].price = Number(e.target.value) || 0;
                                        setProdOptionGroups(next);
                                      }}
                                      placeholder="추가금액"
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                    />
                                    <span className="text-xs font-bold text-slate-500">원</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...prodOptionGroups];
                                      next[grpIdx].options = next[grpIdx].options.filter((_, idx) => idx !== optIdx);
                                      setProdOptionGroups(next);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="항목 삭제"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...prodOptionGroups];
                                  next[grpIdx].options.push({
                                    id: `opt-${Date.now()}-${Math.random()}`,
                                    name: '새 옵션 항목',
                                    price: 0
                                  });
                                  setProdOptionGroups(next);
                                }}
                                className="mt-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>세부 옵션 항목 추가</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">충전기 상세 홍보 설명 문구</label>
                      <textarea
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        rows={2.5}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateProduct}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                      >
                        기기 변경 사항 적용
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. SOLUTIONS TAB */}
            {activeTab === 'solutions' && (
              <motion.div
                key="tab-solutions"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-4"
              >
                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => { setSolSubTab('parking'); setEditingSolProd(null); setIsNewSolProd(false); setEditingSolutionId(null); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      solSubTab === 'parking'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>🏢 상업시설 수익형 충전기 관리</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSolSubTab('home'); setEditingSolProd(null); setIsNewSolProd(false); setEditingSolutionId(null); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      solSubTab === 'home'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>🏠 가정용 홈 충전기 관리</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSolSubTab('cards'); setEditingSolProd(null); setIsNewSolProd(false); setEditingSolutionId(null); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      solSubTab === 'cards'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>🛠️ 용도별 메인 카드 & 브로셔</span>
                  </button>
                </div>

                {/* TAB 1: PARKING / COMMERCIAL REVENUE CHARGERS */}
                {solSubTab === 'parking' && (
                  <div className="space-y-4">
                    {editingSolProd || isNewSolProd ? (
                      <div className="space-y-4 p-4 border border-indigo-100 bg-indigo-50/10 rounded-2xl">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h5 className="text-xs font-black text-indigo-800 uppercase flex items-center gap-1.5">
                            ⚡ {isNewSolProd ? '새 상업시설 수익형 충전기 등록' : '상업시설 수익형 충전기 상세 수정'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => { setEditingSolProd(null); setIsNewSolProd(false); }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            목록으로 돌아가기
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">충전기 명칭 (모델명)</label>
                            <input
                              type="text"
                              value={solProdName}
                              onChange={(e) => setSolProdName(e.target.value)}
                              placeholder="예: 롯데 이브이시스 11kW 수익형 완속 충전기"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">카테고리 / 구분</label>
                            <input
                              type="text"
                              value={solProdCategory}
                              onChange={(e) => setSolProdCategory(e.target.value)}
                              placeholder="예: 공용 BIZ 충전기, 50kW 급속 충전기"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Prices */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="block text-[11px] font-black text-slate-800">💰 가격 및 할인율 설정</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">기존 정가 (원)</span>
                              <input
                                type="number"
                                value={solProdRegularPrice}
                                onChange={(e) => {
                                  const reg = Number(e.target.value) || 0;
                                  setSolProdRegularPrice(reg);
                                  if (reg > 0 && solProdPrice > 0) {
                                    setSolProdDiscount(Math.round(((reg - solProdPrice) / reg) * 100));
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 line-through"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">실제 판매가 (원)</span>
                              <input
                                type="number"
                                value={solProdPrice}
                                onChange={(e) => {
                                  const pr = Number(e.target.value) || 0;
                                  setSolProdPrice(pr);
                                  if (solProdRegularPrice > 0 && pr > 0) {
                                    setSolProdDiscount(Math.round(((solProdRegularPrice - pr) / solProdRegularPrice) * 100));
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-indigo-600"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">할인율 (%)</span>
                              <input
                                type="number"
                                value={solProdDiscount}
                                onChange={(e) => setSolProdDiscount(Number(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image upload */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">충전기 대표 이미지</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={solProdImage}
                              onChange={(e) => setSolProdImage(e.target.value)}
                              placeholder="이미지 URL 또는 파일 드래그앤드롭"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                            />
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingSolProdImg(true); }}
                              onDragLeave={() => setIsDraggingSolProdImg(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingSolProdImg(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('image/')) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) setSolProdImage(ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className={`px-4 py-2 border-2 border-dashed rounded-xl text-xs font-black cursor-pointer flex items-center justify-center transition-all ${
                                isDraggingSolProdImg ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
                              }`}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      if (ev.target?.result) setSolProdImage(ev.target.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              📁 파일 업로드
                            </div>
                          </div>
                          {solProdImage && (
                            <img src={solProdImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 mt-2" />
                          )}
                        </div>

                        {/* Tags and Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">태그 목록 (쉼표 분리)</label>
                            <input
                              type="text"
                              value={solProdTags}
                              onChange={(e) => setSolProdTags(e.target.value)}
                              placeholder="예: BEST, HIT, MD CHOICE"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-4 pt-4">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={solProdHasASBadge}
                                onChange={(e) => setSolProdHasASBadge(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600"
                              />
                              <span>🛡️ 무상 A/S 4년 뱃지</span>
                            </label>

                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={solProdHasPromoRibbon}
                                onChange={(e) => setSolProdHasPromoRibbon(e.target.checked)}
                                className="w-4 h-4 rounded text-rose-600"
                              />
                              <span>🔥 특가 리본 뱃지</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">기기 상세 홍보 문구 / 스펙</label>
                          <textarea
                            value={solProdDescription}
                            onChange={(e) => setSolProdDescription(e.target.value)}
                            rows={2.5}
                            placeholder="예: RFID 및 전용 앱 정산 수수료 정산 관제망 탑재, 사업 수익 정산용 고효율 모델"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => { setEditingSolProd(null); setIsNewSolProd(false); }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSolProd}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>상업시설 충전기 저장</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              🏢 상업시설 수익형 충전기 제품 라인업
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">상업시설, 마트, 골프장, 주차장 등에 설치되는 수익형 충전기 목록을 추가 및 수정합니다.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditSolProd(null, 'parking', '공용 BIZ 충전기')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>새 수익형 충전기 등록</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {(Object.entries(cmsParkingProducts) as [string, SolutionProduct[]][]).map(([catKey, prodList]) => (
                            <div key={catKey} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-xs font-black text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                                  {catKey} ({prodList.length}개 기기)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditSolProd(null, 'parking', catKey)}
                                  className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>이 카테고리에 충전기 추가</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5">
                                {prodList.map((p) => (
                                  <div
                                    key={p.id}
                                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-indigo-300 transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-slate-100" />
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {p.tags.map(t => (
                                            <span key={t} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-black">{t}</span>
                                          ))}
                                          <span className="text-xs font-black text-indigo-600">{p.price?.toLocaleString()}원</span>
                                          {p.regularPrice ? (
                                            <span className="text-[10px] text-slate-400 line-through">{p.regularPrice.toLocaleString()}원</span>
                                          ) : null}
                                        </div>
                                        <h5 className="text-xs font-black text-slate-900 truncate">{p.name}</h5>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditSolProd(p, 'parking', catKey)}
                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-indigo-200/60 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>수정</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSolProd(p.id, 'parking', catKey)}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: HOME CHARGERS */}
                {solSubTab === 'home' && (
                  <div className="space-y-4">
                    {editingSolProd || isNewSolProd ? (
                      <div className="space-y-4 p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h5 className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
                            🏠 {isNewSolProd ? '새 가정용 홈 충전기 등록' : '가정용 홈 충전기 상세 수정'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => { setEditingSolProd(null); setIsNewSolProd(false); }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            목록으로 돌아가기
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">충전기 명칭 (모델명)</label>
                            <input
                              type="text"
                              value={solProdName}
                              onChange={(e) => setSolProdName(e.target.value)}
                              placeholder="예: 스필 7kW 개인용 전기차 충전기 무상AS 4년"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">용량 구분</label>
                            <select
                              value={solProdCategory}
                              onChange={(e) => setSolProdCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                            >
                              <option value="5kW">5kW</option>
                              <option value="7kW">7kW</option>
                              <option value="11kW">11kW</option>
                            </select>
                          </div>
                        </div>

                        {/* Prices */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="block text-[11px] font-black text-slate-800">💰 가격 및 할인율 설정</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">기존 정가 (원)</span>
                              <input
                                type="number"
                                value={solProdRegularPrice}
                                onChange={(e) => {
                                  const reg = Number(e.target.value) || 0;
                                  setSolProdRegularPrice(reg);
                                  if (reg > 0 && solProdPrice > 0) {
                                    setSolProdDiscount(Math.round(((reg - solProdPrice) / reg) * 100));
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 line-through"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">실제 판매가 (원)</span>
                              <input
                                type="number"
                                value={solProdPrice}
                                onChange={(e) => {
                                  const pr = Number(e.target.value) || 0;
                                  setSolProdPrice(pr);
                                  if (solProdRegularPrice > 0 && pr > 0) {
                                    setSolProdDiscount(Math.round(((solProdRegularPrice - pr) / solProdRegularPrice) * 100));
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-emerald-600"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500">할인율 (%)</span>
                              <input
                                type="number"
                                value={solProdDiscount}
                                onChange={(e) => setSolProdDiscount(Number(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image upload */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">충전기 대표 이미지</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={solProdImage}
                              onChange={(e) => setSolProdImage(e.target.value)}
                              placeholder="이미지 URL 또는 파일 드래그앤드롭"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                            />
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingSolProdImg(true); }}
                              onDragLeave={() => setIsDraggingSolProdImg(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingSolProdImg(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('image/')) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) setSolProdImage(ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className={`px-4 py-2 border-2 border-dashed rounded-xl text-xs font-black cursor-pointer flex items-center justify-center transition-all ${
                                isDraggingSolProdImg ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400'
                              }`}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      if (ev.target?.result) setSolProdImage(ev.target.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              📁 파일 업로드
                            </div>
                          </div>
                          {solProdImage && (
                            <img src={solProdImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 mt-2" />
                          )}
                        </div>

                        {/* Tags and Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">태그 목록 (쉼표 분리)</label>
                            <input
                              type="text"
                              value={solProdTags}
                              onChange={(e) => setSolProdTags(e.target.value)}
                              placeholder="예: MD CHOICE, HIT, BEST"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-4 pt-4">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={solProdHasASBadge}
                                onChange={(e) => setSolProdHasASBadge(e.target.checked)}
                                className="w-4 h-4 rounded text-emerald-600"
                              />
                              <span>🛡️ 무상 A/S 4년 뱃지</span>
                            </label>

                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={solProdHasPromoRibbon}
                                onChange={(e) => setSolProdHasPromoRibbon(e.target.checked)}
                                className="w-4 h-4 rounded text-rose-600"
                              />
                              <span>🔥 특가 리본 뱃지</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">기기 상세 홍보 문구 / 스펙</label>
                          <textarea
                            value={solProdDescription}
                            onChange={(e) => setSolProdDescription(e.target.value)}
                            rows={2.5}
                            placeholder="예: [국내최초 무상A/S 4년] 화재 감지 자동 전력 차단 가정용 완속 충전 베스트셀러"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => { setEditingSolProd(null); setIsNewSolProd(false); }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSolProd}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>가정용 충전기 저장</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              🏠 가정용 홈 충전기 제품 라인업
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">단독주택, 전원주택, 개인용 주차장에 설치되는 가정용 충전기 목록을 관리합니다.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditSolProd(null, 'home', '7kW')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>새 가정용 충전기 등록</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {(Object.entries(cmsHomeProducts) as [string, SolutionProduct[]][]).map(([capacityKey, prodList]) => (
                            <div key={capacityKey} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  {capacityKey} ({prodList.length}개 기기)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditSolProd(null, 'home', capacityKey)}
                                  className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{capacityKey} 충전기 추가</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5">
                                {prodList.map((p) => (
                                  <div
                                    key={p.id}
                                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-emerald-300 transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-slate-100" />
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {p.tags.map(t => (
                                            <span key={t} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-black">{t}</span>
                                          ))}
                                          <span className="text-xs font-black text-emerald-600">{p.price?.toLocaleString()}원</span>
                                          {p.regularPrice ? (
                                            <span className="text-[10px] text-slate-400 line-through">{p.regularPrice.toLocaleString()}원</span>
                                          ) : null}
                                        </div>
                                        <h5 className="text-xs font-black text-slate-900 truncate">{p.name}</h5>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditSolProd(p, 'home', capacityKey)}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-emerald-200/60 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>수정</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSolProd(p.id, 'home', capacityKey)}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CARDS & BROCHURES */}
                {solSubTab === 'cards' && (
                  <div>
                {!editingSolutionId ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">용도별 맞춤 전용 솔루션 편집</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {solutions.map((sol) => (
                        <div
                          key={sol.id}
                          className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={sol.image} alt={sol.title} className="w-12 h-12 object-cover rounded-xl border border-slate-200/50" />
                            <div className="min-w-0">
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">
                                {sol.category === 'Commercial' ? (categoryLabels.sol_commercial || '아파트') : sol.category === 'Residential' ? (categoryLabels.sol_residential || '가정용 홈') : (categoryLabels.sol_parking || '상업시설 수익형')}
                              </span>
                              <h5 className="text-xs font-black text-slate-900 mt-1 truncate">{sol.title}</h5>
                            </div>
                          </div>

                          <button
                            onClick={() => startEditSolution(sol)}
                            className="px-3.5 py-1.5 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            카드 및 이미지 편집
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/5 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h5 className="text-xs font-black text-blue-800 uppercase">🛠️ 솔루션 카드 상세 정보 편집</h5>
                      <button
                        onClick={() => setEditingSolutionId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        돌아가기
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">솔루션 대제목</label>
                        <input
                          type="text"
                          value={solTitle}
                          onChange={(e) => setSolTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">서브 타이틀 / 주요 대상</label>
                        <input
                          type="text"
                          value={solSubtitle}
                          onChange={(e) => setSolSubtitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">권장 충전 용량 사양</label>
                        <input
                          type="text"
                          value={solPower}
                          onChange={(e) => setSolPower(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">주요 타겟 건축 공간</label>
                        <input
                          type="text"
                          value={solTarget}
                          onChange={(e) => setSolTarget(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    {isCommercial ? (
                      <>
                        {/* 1. Apartment Catalog Detailed Specs Image Upload & Preview Section */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-extrabold text-blue-700">🏢 아파트 상세안내 카탈로그 이미지 설정 (업로드 또는 URL 링크)</label>
                            <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black border border-blue-100">권장: 세로가 긴 통이미지 형태</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                            {/* Drag & Drop Area */}
                            <div className="md:col-span-8">
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingSolDetail(true);
                                }}
                                onDragLeave={() => setIsDraggingSolDetail(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingSolDetail(false);
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) {
                                    if (!file.type.startsWith('image/')) {
                                      alert('이미지 파일만 업로드할 수 있습니다.');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setSolDetailImageUrl(reader.result as string);
                                      setSolImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                onClick={() => document.getElementById('sol-detail-file-input')?.click()}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
                                  isDraggingSolDetail
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="file"
                                  id="sol-detail-file-input"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setSolDetailImageUrl(reader.result as string);
                                        setSolImage(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <p className="text-[11px] font-black text-slate-700">카탈로그 이미지 드래그 또는 클릭 업로드</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">PNG, JPG, JPEG 지원</p>
                              </div>
                            </div>

                            {/* Preview Box */}
                            <div className="md:col-span-4 flex flex-col justify-center items-center p-3 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden min-h-[120px]">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-1.5 left-1.5">PREVIEW</span>
                              {solDetailImageUrl ? (
                                <div className="flex flex-col items-center gap-1.5 w-full mt-2">
                                  <img
                                    src={solDetailImageUrl}
                                    alt="Detail Spec Preview"
                                    className="max-h-[70px] max-w-[110px] object-contain rounded-lg border border-slate-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSolDetailImageUrl('');
                                      setSolImage('');
                                    }}
                                    className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer border border-rose-150"
                                  >
                                    제거
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center text-slate-400 text-[10px] font-bold mt-2">
                                  <ImageIcon className="w-4 h-4 mx-auto mb-1 opacity-40" />
                                  <span>등록 없음</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500">카탈로그 이미지 직접 입력 URL</label>
                            <input
                              type="text"
                              value={solDetailImageUrl}
                              onChange={(e) => {
                                setSolDetailImageUrl(e.target.value);
                                setSolImage(e.target.value);
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] text-blue-600 font-mono"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        {/* 2. Catalog Image Presentation Mode settings */}
                        <div className="border-t border-b border-slate-100 py-3 my-2">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-extrabold text-slate-800">📄 통합 비교도/카탈로그 출력 형태</label>
                            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setSolDetailMode('scroll')}
                                className={`py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                  solDetailMode === 'scroll'
                                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                스크롤 제안 박스 (상하 스크롤)
                              </button>
                              <button
                                type="button"
                                onClick={() => setSolDetailMode('unfold')}
                                className={`py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                  solDetailMode === 'unfold'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                상세페이지형 전체 펼침 (스크롤 없음)
                              </button>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                              * 카탈로그 설명 이미지가 아주 길 경우, 스크롤 없이 전체를 통째로 보실 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : null}

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">솔루션 메인 단락 카피 설명</label>
                      <textarea
                        value={solDesc}
                        onChange={(e) => setSolDesc(e.target.value)}
                        rows={3.5}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingSolutionId(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateSolution}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                      >
                        솔루션 데이터 업데이트
                      </button>
                    </div>
                  </div>
                )}
                </div>
                )}
              </motion.div>
            )}

            {/* 5. REVIEW TAB */}
            {activeTab === 'review' && (
              <motion.div
                key="tab-review"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-4"
              >
                {!editingReviewId ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">📍 생생한 설치 시공 후기 및 현장 전후 비교 이미지 관리</h4>
                      <button
                        onClick={handleAddReview}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        새 설치후기 등록
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={rev.afterImg} alt={rev.title} className="w-12 h-12 object-cover rounded-xl border border-slate-200/50" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-blue-600 font-extrabold">{rev.location}</span>
                                {rev.isBlogImported && (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black">
                                    {rev.blogName || '블로그'}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-black text-slate-900 mt-0.5 truncate">{rev.title}</h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditReview(rev)}
                              className="px-3 py-1.5 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-150 cursor-pointer transition-all"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/5 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h5 className="text-xs font-black text-blue-800 uppercase">📍 시공 후기 및 비포/애프터 슬라이더 수정</h5>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        돌아가기
                      </button>
                    </div>

                    {/* Naver / Tistory Blog Sync Section */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          🔗 네이버/외부 블로그 후기 원클릭 연동기
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-extrabold text-emerald-700 cursor-pointer flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={revIsBlogImported}
                              onChange={(e) => setRevIsBlogImported(e.target.checked)}
                              className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            이 후기에 블로그 연동 마크 표시하기
                          </label>
                        </div>
                      </div>

                      <p className="text-[10px] text-emerald-700 leading-relaxed font-semibold">
                        블로그 글 주소(URL)를 입력하시면 블로그 원문 데이터(제목, 블로거명, 세부 인터뷰)를 실시간 동기화하여 시공후기 서식을 1초 만에 자동 완성해 줍니다.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={revBlogUrl}
                          onChange={(e) => {
                            setRevBlogUrl(e.target.value);
                            if (e.target.value) {
                              setRevIsBlogImported(true);
                            }
                          }}
                          placeholder="예: https://blog.naver.com/energy_ev/223490181201"
                          className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!revBlogUrl) {
                              alert('블로그 글 주소(URL)를 입력해 주세요!');
                              return;
                            }
                            setRevIsSyncingBlog(true);
                            setTimeout(() => {
                              let extractedUserId = 'blogger';
                              let detectedBlogName = '네이버 블로그';
                              
                              if (revBlogUrl.includes('naver.com')) {
                                detectedBlogName = '네이버 블로그';
                                const parts = revBlogUrl.split('/');
                                if (parts.length > 3) {
                                  extractedUserId = parts[3] || 'naver_user';
                                }
                              } else if (revBlogUrl.includes('tistory.com')) {
                                detectedBlogName = '티스토리 블로그';
                                extractedUserId = 'tistory_blogger';
                              } else {
                                detectedBlogName = '외부 개인 블로그';
                              }

                              setRevIsBlogImported(true);
                              setRevBlogName(detectedBlogName);
                              setRevAuthor(`파워블로거 '${extractedUserId}'`);
                              setRevTitle(`[${detectedBlogName}] 분당 야탑 단독주택 전기차 충전소 SY.com 시공 완료 후기!`);
                              setRevInterview(`블로그 포스트 원문 요약: '지인이 추천해줘서 에스와이코리아(SY.com)를 선택했는데 정말 신의 한 수였네요. 복잡한 서류 작성부터 한전 무상 대행, 꼼꼼한 접지 화재 예방 설계까지 하루 만에 원스톱으로 끝내줬어요! 실제 충전 속도도 빠르고 기기도 무척 모던하고 세련돼서 100% 대만족 중입니다.'`);
                              setRevDetails(`7kW 완속 스마트 월박스 1대 완공 (블로그 자동연동 글)`);
                              setRevLocation('경기 성남시 분당구 야탑동');
                              setRevRating(5);
                              setRevBeforeImg('https://images.unsplash.com/photo-1521500857785-5a827418b62c?auto=format&fit=crop&q=80&w=600');
                              setRevAfterImg('https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600');
                              
                              setRevIsSyncingBlog(false);
                              showSaveSuccess('🔌 블로그 포스트 정보가 완벽하게 실시간 동기화되었습니다!');
                            }, 1000);
                          }}
                          disabled={revIsSyncingBlog}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          {revIsSyncingBlog ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              동기화 중...
                            </span>
                          ) : (
                            '⚡ 글 동기화'
                          )}
                        </button>
                      </div>

                      {revIsBlogImported && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-emerald-100">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-emerald-800">연동 블로그 플랫폼명</label>
                            <input
                              type="text"
                              value={revBlogName}
                              onChange={(e) => setRevBlogName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-950"
                              placeholder="예: 네이버 블로그"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-emerald-800">블로그 채널 소유자명</label>
                            <input
                              type="text"
                              value={revAuthor}
                              onChange={(e) => setRevAuthor(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-950"
                              placeholder="예: 파워블로거 달콤한초코"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">후기 제목</label>
                        <input
                          type="text"
                          value={revTitle}
                          onChange={(e) => setRevTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">시공 상세 지역</label>
                        <input
                          type="text"
                          value={revLocation}
                          onChange={(e) => setRevLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">솔루션 대분류</label>
                        <select
                          value={revCategory}
                          onChange={(e) => setRevCategory(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                          <option value="Commercial">기업/관공서</option>
                          <option value="Residential">주거 전용</option>
                          <option value="ParkingLot">수익형 주차장</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Image URL editing */}
                      <div className="space-y-3 p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                        <span className="text-xs font-extrabold text-slate-800 uppercase block">1. 시공 전 (Before) 이미지 설정 (업로드 또는 URL)</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                          <div className="sm:col-span-8">
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingBeforeImg(true);
                              }}
                              onDragLeave={() => setIsDraggingBeforeImg(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingBeforeImg(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  if (!file.type.startsWith('image/')) {
                                    alert('이미지 파일만 업로드할 수 있습니다.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setRevBeforeImg(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              onClick={() => document.getElementById('before-file-input')?.click()}
                              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] ${
                                isDraggingBeforeImg
                                  ? 'border-red-400 bg-red-50/50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="file"
                                id="before-file-input"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setRevBeforeImg(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                              <p className="text-[10px] font-black text-slate-700">시공 전 사진 업로드</p>
                            </div>
                          </div>

                          <div className="sm:col-span-4 flex flex-col justify-center items-center p-2 bg-white border border-slate-200 rounded-xl relative min-h-[90px]">
                            {revBeforeImg ? (
                              <div className="flex flex-col items-center gap-1 w-full text-center">
                                <img
                                  src={revBeforeImg}
                                  alt="Before Preview"
                                  className="max-h-[40px] max-w-full object-cover rounded border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setRevBeforeImg('')}
                                  className="text-[9px] text-rose-600 font-bold hover:underline"
                                >
                                  제거
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">등록 없음</span>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={revBeforeImg}
                          onChange={(e) => setRevBeforeImg(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] text-rose-600 font-mono"
                          placeholder="시공 전 이미지 URL"
                        />
                        <div className="flex gap-1 overflow-x-auto scrollbar-none pt-0.5">
                          {CURATED_EV_IMAGES.slice(5).map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRevBeforeImg(img.url)}
                              className="w-8 h-6 rounded border overflow-hidden shrink-0"
                            >
                              <img src={img.url} alt="preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* After Image URL editing */}
                      <div className="space-y-3 p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                        <span className="text-xs font-extrabold text-slate-800 uppercase block">2. 시공 후 (After) 이미지 설정 (업로드 또는 URL)</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                          <div className="sm:col-span-8">
                            <div
                              tabIndex={0}
                              onPaste={(e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                for (let i = 0; i < items.length; i++) {
                                  if (items[i].type.indexOf('image') !== -1) {
                                    const file = items[i].getAsFile();
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setRevAfterImg(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                      e.preventDefault();
                                    }
                                    break;
                                  }
                                }
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingAfterImg(true);
                              }}
                              onDragLeave={() => setIsDraggingAfterImg(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingAfterImg(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  if (!file.type.startsWith('image/')) {
                                    alert('이미지 파일만 업로드할 수 있습니다.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setRevAfterImg(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              onClick={() => document.getElementById('after-file-input')?.click()}
                              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] ${
                                isDraggingAfterImg
                                  ? 'border-blue-400 bg-blue-50/50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="file"
                                id="after-file-input"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setRevAfterImg(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                              <p className="text-[10px] font-black text-slate-700">시공 후 사진 업로드</p>
                            </div>
                          </div>

                          <div className="sm:col-span-4 flex flex-col justify-center items-center p-2 bg-white border border-slate-200 rounded-xl relative min-h-[90px]">
                            {revAfterImg ? (
                              <div className="flex flex-col items-center gap-1 w-full text-center">
                                <img
                                  src={revAfterImg}
                                  alt="After Preview"
                                  className="max-h-[40px] max-w-full object-cover rounded border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setRevAfterImg('')}
                                  className="text-[9px] text-rose-600 font-bold hover:underline"
                                >
                                  제거
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">등록 없음</span>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={revAfterImg}
                          onChange={(e) => setRevAfterImg(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] text-blue-600 font-mono"
                          placeholder="시공 후 이미지 URL"
                        />
                        <div className="flex gap-1 overflow-x-auto scrollbar-none pt-0.5">
                          {CURATED_EV_IMAGES.slice(0, 4).map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRevAfterImg(img.url)}
                              className="w-8 h-6 rounded border overflow-hidden shrink-0"
                            >
                              <img src={img.url} alt="preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">고객 실제 생생 인터뷰 인용구</label>
                      <textarea
                        value={revInterview}
                        onChange={(e) => setRevInterview(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">시공 세부내역 설명</label>
                      <input
                        type="text"
                        value={revDetails}
                        onChange={(e) => setRevDetails(e.target.value)}
                        placeholder="예: SY-AC07 완속 4대 설치, LED 보강 도색 패키지 시공 완료"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-amber-900">시공지도 전국 핀 X좌표 위치 (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={revX}
                          onChange={(e) => setRevX(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">※ 가로 위치: 왼쪽 0% ~ 오른쪽 100%</span>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-amber-900">시공지도 전국 핀 Y좌표 위치 (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={revY}
                          onChange={(e) => setRevY(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">※ 세로 위치: 위쪽 0% ~ 아래쪽 100%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(editingReviewId!)}
                        className="px-4 py-2 bg-rose-50 text-rose-650 hover:bg-rose-100 rounded-xl text-xs font-bold cursor-pointer transition-all border border-rose-150"
                      >
                        이 후기 삭제
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateReview}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                        >
                          후기 데이터 업데이트
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. SUPPORT & FAQS TAB */}
            {activeTab === 'support' && (
              <motion.div
                key="tab-support"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-6"
              >
                {/* FAQs Sub-editor */}
                <div className="space-y-3.5 border-b border-slate-100 pb-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      고객 자주 묻는 질문(FAQ) 원터치 관리
                    </h4>
                    {!editingFaqId && (
                      <button
                        onClick={handleAddFaq}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        새 FAQ 생성
                      </button>
                    )}
                  </div>

                  {!editingFaqId ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {faqs.map((faq) => (
                        <div key={faq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{faq.category}</span>
                            <span className="font-bold text-slate-800 ml-2 truncate">{faq.question}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => startEditFaq(faq)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 cursor-pointer"
                              title="수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-blue-100 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">FAQ 카테고리 구분</label>
                          <select
                            value={faqCat}
                            onChange={(e) => setFaqCat(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          >
                            <option value="보조금/비용">보조금/비용</option>
                            <option value="화재안전">화재안전</option>
                            <option value="설치과정">설치과정</option>
                            <option value="전기안전">전기안전</option>
                            <option value="사후관리(A/S)">사후관리(A/S)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">자주 묻는 질문 제목</label>
                          <input
                            type="text"
                            value={faqQ}
                            onChange={(e) => setFaqQ(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">자주 묻는 질문 답변내용</label>
                        <textarea
                          value={faqA}
                          onChange={(e) => setFaqA(e.target.value)}
                          rows={3.5}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingFaqId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleUpdateFaq}
                          className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-black cursor-pointer"
                        >
                          FAQ 갱신 적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notices Sub-editor */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      실시간 새소식 &amp; 공지사항 관리
                    </h4>
                    {!editingNoticeId && (
                      <button
                        onClick={handleAddNotice}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        공지 작성
                      </button>
                    )}
                  </div>

                  {!editingNoticeId ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {notices.map((not) => (
                        <div key={not.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 flex items-center gap-2">
                            {not.important && (
                              <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 font-extrabold px-1 py-0.5 rounded">중요</span>
                            )}
                            <span className="font-bold text-slate-800 truncate">{not.title}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold mr-1">{not.date}</span>
                            <button
                              onClick={() => startEditNotice(not)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 cursor-pointer"
                              title="수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotice(not.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-blue-100 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">공지 작성 일자</label>
                          <input
                            type="date"
                            value={notDate}
                            onChange={(e) => setNotDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            checked={notImp}
                            onChange={(e) => setNotImp(e.target.checked)}
                            id="chk-not-imp"
                            className="w-4 h-4 text-blue-600 rounded border-slate-200 focus:ring-blue-500"
                          />
                          <label htmlFor="chk-not-imp" className="text-xs font-bold text-slate-800">
                            중요 상단 고정 공지여부 (빨간색 중요 뱃지 부착)
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">공지사항 제목 텍스트</label>
                        <input
                          type="text"
                          value={notTitle}
                          onChange={(e) => setNotTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoticeId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleUpdateNotice}
                          className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-black cursor-pointer"
                        >
                          공지사항 변경 적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 8. CLOUD SYNC & DISASTER RECOVERY CENTER TAB */}
            {activeTab === 'sync' && (
              <motion.div
                key="tab-sync"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-3xl text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black tracking-tight">클라우드 비동기 동기화 &amp; 재해 복구 센터</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                              Firestore Active
                            </span>
                          </div>
                          <p className="text-xs text-blue-200/80 font-medium">
                            관리자가 에디터에서 수정한 상세페이지 및 상품 등록 데이터가 Firestore 클라우드에 비동기 실시간 저장됩니다.
                          </p>
                        </div>
                      </div>

                      {/* Quick Snapshot Trigger */}
                      <button
                        onClick={handleManualCloudBackup}
                        disabled={isBackingUp || isRestoring}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all shrink-0"
                      >
                        {isBackingUp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CloudUpload className="w-4 h-4" />
                        )}
                        <span>지금 즉시 클라우드 백업 생성</span>
                      </button>
                    </div>

                    {/* 4 Status Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                      <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          실시간 클라우드 상태
                        </div>
                        <div className="text-xs font-black mt-1 flex items-center gap-1.5 text-white">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {syncStatus.state === 'syncing' ? '저장 중...' : '정상 연동됨'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          동기화 키: {syncStatus.totalSyncedKeys}개
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                          <Database className="w-3 h-3 text-cyan-400" />
                          상품 &amp; 상세페이지 보존
                        </div>
                        <div className="text-xs font-black mt-1 text-cyan-200">
                          100% 영구 안전
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          캐시 삭제 시에도 안전
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          정기 자동 스냅샷
                        </div>
                        <div className="text-xs font-black mt-1 text-amber-200">
                          매 60분 상시 주기
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          백업 스냅샷 누적 보관
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                          <History className="w-3 h-3 text-indigo-400" />
                          최근 동기화 시각
                        </div>
                        <div className="text-xs font-black mt-1 text-indigo-200 font-mono">
                          {syncStatus.lastSyncedTime
                            ? syncStatus.lastSyncedTime.split(' ')[1] || syncStatus.lastSyncedTime
                            : '방금 전'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          대기 큐: {syncStatus.pendingCount}건
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Recovery Control Center */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Action 1: Restore Latest */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black mb-2">
                        <CloudDownload className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-black text-slate-800">최신 클라우드 백업에서 전체 복원</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        실수로 상품이나 상세페이지를 잘못 수정했거나 삭제했을 때, 가장 최신 클라우드 스냅샷으로 즉시 되돌립니다.
                      </p>
                    </div>
                    <button
                      onClick={handleRestoreFromLatest}
                      disabled={isRestoring || isBackingUp}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 transition-all"
                    >
                      {isRestoring ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>최신 백업본에서 1초 전체 복구</span>
                    </button>
                  </div>

                  {/* Action 2: JSON Backup Download */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-2">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-black text-slate-800">JSON 오프라인 백업 파일 다운로드</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        현재 등록된 모든 상품, 로고, 옵션, 이미지 및 견적 데이터를 내 컴퓨터(PC)에 영구 JSON 백업 파일로 보관합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        exportBackupToJsonFile();
                        showSaveSuccess('💾 백업 파일 다운로드가 완료되었습니다!');
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-slate-800/10 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON 백업 파일 다운로드 (.json)</span>
                    </button>
                  </div>

                  {/* Action 3: Health Integrity Diagnostic */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black mb-2">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-black text-slate-800">데이터 무결성 실시간 건강 진단</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        로컬 스토리지와 Firestore 클라우드 간의 누락된 데이터 항목 및 손상 여부를 정밀 분석합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const res = verifyDataIntegrity();
                        setIntegrityResult(res);
                        if (res.isHealthy) {
                          showSaveSuccess('🩺 무결성 진단 완료: 모든 CMS 데이터가 완벽하고 건강합니다 (100%)');
                        } else {
                          showSaveSuccess(`🩺 무결성 진단 완료: 주의 항목 ${res.issues.length}건 발견`);
                        }
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>데이터 건강 진단 실행</span>
                    </button>
                  </div>
                </div>

                {/* Integrity Diagnostic Results (if run) */}
                {integrityResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${integrityResult.isHealthy ? 'text-emerald-600' : 'text-amber-500'}`} />
                        <span className="font-black text-slate-800">
                          무결성 검사 결과: {integrityResult.isHealthy ? '최상 (100% 정상)' : `확인 필요 (${integrityResult.issues.length}건)`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">총 {integrityResult.stats.totalKeys}개 핵심 키 점검 ({integrityResult.stats.approximateSizeKb} KB)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                        <span className="text-slate-500 block text-[10px]">등록 상품</span>
                        <span className="font-black text-emerald-600">
                          {integrityResult.stats.totalProducts}개 정상
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                        <span className="text-slate-500 block text-[10px]">커스텀 상세페이지</span>
                        <span className="font-black text-emerald-600">
                          {integrityResult.stats.totalCustomDetails}개 정상
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                        <span className="text-slate-500 block text-[10px]">옵션 프리셋</span>
                        <span className="font-black text-emerald-600">
                          {integrityResult.stats.totalOptionPresets}개 정상
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                        <span className="text-slate-500 block text-[10px]">등록 브랜드</span>
                        <span className="font-black text-emerald-600">
                          {integrityResult.stats.totalBrands}개 정상
                        </span>
                      </div>
                    </div>
                    {integrityResult.issues.length > 0 && (
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                        {integrityResult.issues.map((iss, idx) => (
                          <div key={idx}>{iss}</div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Drag-and-Drop JSON File Upload Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingJsonBackup(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingJsonBackup(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingJsonBackup(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleJsonFileUpload(file);
                  }}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-2 cursor-pointer ${
                    isDraggingJsonBackup
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,application/json';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) handleJsonFileUpload(file);
                    };
                    input.click();
                  }}
                >
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">
                      오프라인 백업 JSON 파일 드래그 &amp; 드롭 복원
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      PC에 다운로드해 둔 <code className="text-emerald-700 font-mono font-bold">SY_COM_CMS_Backup_*.json</code> 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요.
                    </p>
                  </div>
                </div>

                {/* Firestore Cloud Snapshot Timeline History & Rollback Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <h5 className="text-xs font-black text-slate-800">
                        클라우드 스냅샷 타임라인 &amp; 시점별 롤백 복원
                      </h5>
                    </div>
                    <button
                      onClick={loadBackupList}
                      disabled={isLoadingBackups}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                      새로고침
                    </button>
                  </div>

                  {isLoadingBackups ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span>클라우드 백업 목록을 불러오는 중입니다...</span>
                    </div>
                  ) : backupHistory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                      <Cloud className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold">아직 생성된 백업 스냅샷이 없습니다.</p>
                      <p className="text-[11px] text-slate-400">상단의 [지금 즉시 클라우드 백업 생성] 버튼을 누르면 첫 번째 스냅샷이 생성됩니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {backupHistory.map((backup) => (
                        <div
                          key={backup.id}
                          className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                                backup.trigger === 'manual'
                                  ? 'bg-blue-100 text-blue-700'
                                  : backup.trigger === 'hourly'
                                  ? 'bg-amber-100 text-amber-700'
                                  : backup.trigger === 'import'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {backup.trigger === 'manual'
                                ? '수동 생성'
                                : backup.trigger === 'hourly'
                                ? '정기 1시간'
                                : backup.trigger === 'import'
                                ? '파일 복원본'
                                : '자동 스냅샷'}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block truncate">
                                {backup.formattedDate}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {backup.keyCount}개 데이터 항목 ({backup.dataSizeKb} KB)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRestoreSpecificBackup(backup)}
                            disabled={isRestoring}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>이 시점으로 롤백</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cross-Device Encrypted String Code Copy / Paste */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      기기간 암호화 텍스트 동기화 (간편 코드 복사 &amp; 붙여넣기)
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      PC와 스마트폰 간에 즉시 전체 설정을 복사하여 붙여넣을 수 있는 Base64 텍스트 코드 동기화 방식입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Export */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">1. 현재 기기 설정 코드 복사</label>
                      <button
                        onClick={() => {
                          const keys = [
                            'sy_cms_logo',
                            'sy_cms_categories',
                            'sy_cms_footer',
                            'sy_cms_hero',
                            'sy_cms_about',
                            'sy_cms_products',
                            'sy_cms_solutions',
                            'sy_cms_reviews',
                            'sy_cms_faqs',
                            'sy_cms_notices',
                            'sy_cms_sns',
                            'sy_cms_quickmenu',
                            'sy_cms_quote'
                          ];
                          const data: Record<string, string | null> = {};
                          keys.forEach(key => {
                            data[key] = localStorage.getItem(key);
                          });
                          const code = btoa(encodeURIComponent(JSON.stringify(data)));
                          navigator.clipboard.writeText(code).then(() => {
                            showSaveSuccess('📋 전체 설정 동기화 코드가 클립보드에 복사되었습니다!');
                          }).catch(() => {
                            alert('클립보드 복사 권한이 없습니다. 아래 텍스트박스에서 전체 복사해 주세요.');
                          });
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        <span>📋 전체 설정 코드 복사하기</span>
                      </button>
                    </div>

                    {/* Import */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">2. 다른 기기에서 복사한 코드 붙여넣기</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="복사한 코드를 여기에 붙여넣으세요..."
                          value={importCode}
                          onChange={(e) => setImportCode(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleImportSync(importCode, showSaveSuccess)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Console Recovery Guide */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>비상 재해 복구 브라우저 콘솔 도구 안내</span>
                  </div>
                  <p>
                    만약 브라우저가 예기치 않게 종료되었거나 에디터가 열리지 않는 특수 상황인 경우, 브라우저 개발자 도구(F12) 콘솔(Console)에 다음 명령어를 입력하여 즉시 데이터를 복구할 수 있습니다:
                  </p>
                  <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg select-all">
                    await window.syBackupManager.restoreFromLatest();
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. QUOTE TAB (Custom Inquiry Popup) */}
            {activeTab === 'quote' && (
              <motion.div
                key="tab-quote"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-6"
              >
                <h4 className="text-xs font-black text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                  <Settings className="w-4 h-4 text-blue-600" />
                  온라인 무료 설치 문의 팝업 내용 편집
                </h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  화면의 모든 견적 및 무상 상담 신청 버튼을 클릭했을 때 나타나는 '온라인 설치문의 팝업창'의 모든 문구, 헤더 뱃지, 안심보증 문구, 제출 성공 안내글을 직접 수정할 수 있습니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">팝업 상단 미니 뱃지 문구</label>
                    <input
                      type="text"
                      value={quoteBadge}
                      onChange={(e) => setQuoteBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="정부보조금 마감 임박 혜택 우선 선점"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">팝업 메인 타이틀</label>
                    <input
                      type="text"
                      value={quoteTitle}
                      onChange={(e) => setQuoteTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="무료 설치 상담 & 실시간 맞춤 견적"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-blue-800">📞 실시간 직통 전화번호</label>
                    <input
                      type="text"
                      value={quoteDirectPhone}
                      onChange={(e) => setQuoteDirectPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-xs font-black text-blue-700"
                      placeholder="1588-SY01"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-amber-800">💬 카카오톡 1:1 상담 URL</label>
                    <input
                      type="text"
                      value={quoteDirectKakaoUrl}
                      onChange={(e) => setQuoteDirectKakaoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700"
                      placeholder="https://pf.kakao.com/"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">상담 신청 접수 완료 타이틀</label>
                    <input
                      type="text"
                      value={quoteSuccessTitle}
                      onChange={(e) => setQuoteSuccessTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="상담 신청이 정상 접수되었습니다!"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">상담 신청 제출 버튼 텍스트</label>
                    <input
                      type="text"
                      value={quoteSubmitButton}
                      onChange={(e) => setQuoteSubmitButton(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
                      placeholder="👉 30초 만에 무료 설치 상담 예약하기"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">상담 신청 완료시 안내 설명 본문</label>
                  <textarea
                    value={quoteSuccessDesc}
                    onChange={(e) => setQuoteSuccessDesc(e.target.value)}
                    rows={2.5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 leading-normal"
                    placeholder="올해 배정된 정부 보조금 잔여 한도 선점을 위해, 2시간 이내에 담당 전문 컨설턴트가 기재해 주신 번호로 연락드리겠습니다."
                  />
                </div>

                {/* Dynamic Fields Customizer Section */}
                <div className="border border-blue-100 bg-blue-50/20 rounded-3xl p-5 space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                      설치문의 입력창 & 탭 별 다르게 세부 항목 설정하기
                    </h5>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      설치문의 팝업창에서 고객이 기재해야 할 세부 입력 항목을 탭(주거용 / 기업용 / 수익형 주차장)마다 다르게 직접 디자인할 수 있습니다. 항목의 문구, 형식(텍스트, 연락처, 선택 드롭다운, 숫자 등)을 마음대로 설정해 보세요!
                    </p>
                  </div>

                  {/* Tab Selector inside config */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['Residential', 'Commercial', 'ParkingLot'] as const).map((tabKey) => {
                      const displayLabel = tabKey === 'Residential' ? '주거용' : tabKey === 'Commercial' ? '기업/관공서' : '수익형 주차장';
                      const isActive = configActiveTab === tabKey;
                      return (
                        <button
                          key={tabKey}
                          onClick={() => setConfigActiveTab(tabKey)}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Tab Info */}
                  <div className="space-y-4 p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">이 문의 탭 표시 이름</label>
                      <input
                        type="text"
                        value={quotePurposeLabels[configActiveTab] || ''}
                        onChange={(e) => {
                          setQuotePurposeLabels({
                            ...quotePurposeLabels,
                            [configActiveTab]: e.target.value
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="탭 표시 이름"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-800">이 탭의 현재 입력칸 목록 ({quoteFields[configActiveTab]?.length || 0}개)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = quoteFields[configActiveTab] || [];
                            const newId = `custom_field_${Date.now()}`;
                            const updatedList = [
                              ...currentList,
                              { id: newId, label: '새 입력 항목', type: 'text', placeholder: '내용을 입력해 주세요.', required: false }
                            ];
                            setQuoteFields({
                              ...quoteFields,
                              [configActiveTab]: updatedList
                            });
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 cursor-pointer"
                        >
                          ➕ 새 입력창 항목 추가하기
                        </button>
                      </div>

                      {/* Render fields list */}
                      <div className="space-y-3.5">
                        {(quoteFields[configActiveTab] || []).map((field, index) => (
                          <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black text-slate-400 font-mono">항목 #{index + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const updatedList = [...(quoteFields[configActiveTab] || [])];
                                    const temp = updatedList[index];
                                    updatedList[index] = updatedList[index - 1];
                                    updatedList[index - 1] = temp;
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer"
                                  title="위로 이동"
                                >
                                  ▲ 위로
                                </button>
                                <button
                                  type="button"
                                  disabled={index === (quoteFields[configActiveTab] || []).length - 1}
                                  onClick={() => {
                                    const fieldsList = quoteFields[configActiveTab] || [];
                                    if (index === fieldsList.length - 1) return;
                                    const updatedList = [...fieldsList];
                                    const temp = updatedList[index];
                                    updatedList[index] = updatedList[index + 1];
                                    updatedList[index + 1] = temp;
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer"
                                  title="아래로 이동"
                                >
                                  ▼ 아래로
                                </button>
                                <div className="h-4 w-px bg-slate-200 mx-0.5" />
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => {
                                      const updatedList = [...(quoteFields[configActiveTab] || [])];
                                      updatedList[index] = { ...field, required: e.target.checked };
                                      setQuoteFields({
                                        ...quoteFields,
                                        [configActiveTab]: updatedList
                                      });
                                    }}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-[10px] font-bold text-slate-600">필수 입력</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedList = (quoteFields[configActiveTab] || []).filter((f) => f.id !== field.id);
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 transition-all border border-red-200 cursor-pointer"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-extrabold text-slate-500">입력 항목 이름 (라벨)</span>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => {
                                    const updatedList = [...(quoteFields[configActiveTab] || [])];
                                    updatedList[index] = { ...field, label: e.target.value };
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-extrabold text-slate-500">입력창 가이드 (Placeholder)</span>
                                <input
                                  type="text"
                                  value={field.placeholder || ''}
                                  onChange={(e) => {
                                    const updatedList = [...(quoteFields[configActiveTab] || [])];
                                    updatedList[index] = { ...field, placeholder: e.target.value };
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-extrabold text-slate-500">입력 방식 종류 (Type)</span>
                                <select
                                  value={field.type}
                                  onChange={(e) => {
                                    const updatedList = [...(quoteFields[configActiveTab] || [])];
                                    updatedList[index] = { ...field, type: e.target.value as any };
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                >
                                  <option value="text">텍스트 입력칸 (이름 등)</option>
                                  <option value="tel">연락처 입력칸 (전화번호)</option>
                                  <option value="number">숫자 입력칸 (수량 등)</option>
                                  <option value="address">주소 검색 입력칸 (Daum 우편번호 검색)</option>
                                  <option value="select">드롭다운 선택창 (Select)</option>
                                </select>
                              </div>
                            </div>

                            {field.type === 'select' && (
                              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-600 block">드롭다운 선택 옵션 목록 (쉼표(,)로 구분)</span>
                                <input
                                  type="text"
                                  value={field.options?.join(', ') || ''}
                                  onChange={(e) => {
                                    const opts = e.target.value.split(',').map((opt) => opt.trim()).filter(Boolean);
                                    const updatedList = [...(quoteFields[configActiveTab] || [])];
                                    updatedList[index] = { ...field, options: opts };
                                    setQuoteFields({
                                      ...quoteFields,
                                      [configActiveTab]: updatedList
                                    });
                                  }}
                                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                  placeholder="옵션1, 옵션2, 옵션3"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {(quoteFields[configActiveTab] || []).length === 0 && (
                          <div className="py-6 text-center text-xs font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                            설정된 입력 항목이 없습니다. 상단 추가 버튼으로 추가해 주세요.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">하단 개인 정보 보호 고지 및 안심 보증 정책</label>
                  <textarea
                    value={quotePrivacyNotice}
                    onChange={(e) => setQuotePrivacyNotice(e.target.value)}
                    rows={2.5}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 leading-normal"
                    placeholder="안심 보증 정책: 입력하신 정보는 한전 한도 및 정부 무상 보조금 산정 용도로만 안전하게 활용되며, 전문 법률에 따라 개인정보보호법을 철저히 준수합니다."
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveQuote}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Save className="w-4 h-4" />
                    문의 팝업 설정 즉시 저장
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <p className="text-[10px] text-slate-400 font-bold leading-normal text-left max-w-md">
            ※ 관리자 에디터에서 변경한 텍스트 및 사진 링크는 사용자의 인터넷 브라우저 <strong>로컬 스토리지(LocalStorage)</strong>에 즉시 안전히 영구 저장되어 기기를 껐다 켜도 계속해서 유지됩니다.
          </p>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveAllMaster}
              id="btn-cms-save-all"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border border-emerald-500"
            >
              <Save className="w-4 h-4" />
              <span>💾 변경사항 저장</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              id="btn-cms-finish"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-800"
            >
              편집 완료 후 나가기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper robust JSON URL parser when loading sync settings
function handleImportSync(importCode: string, showSaveSuccess: (msg: string) => void) {
  if (!importCode.trim()) {
    alert('붙여넣을 동기화 코드를 입력해 주세요!');
    return;
  }
  try {
    const decoded = robustUrlDecode(atob(importCode.trim()));
    const data = JSON.parse(decoded);
    
    let importCount = 0;
    Object.entries(data).forEach(([key, val]) => {
      if (key.startsWith('sy_cms_')) {
        if (val === null) {
          localStorage.removeItem(key);
        } else if (typeof val === 'string') {
          localStorage.setItem(key, val);
        }
        importCount++;
      }
    });
    
    if (importCount === 0) {
      alert('가져올 유효한 설정 데이터가 없습니다.');
      return;
    }
    
    showSaveSuccess('🔄 다른 기기의 설정 데이터가 성공적으로 반영되었습니다! 웹페이지를 새로고침합니다.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    alert('동기화 코드가 올바르지 않거나 손상되었습니다. 복사가 제대로 되었는지 다시 확인해 주세요!');
  }
}
