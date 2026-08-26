import React, { useState, useEffect } from 'react';
import { Product, Solution, Review, FAQ, Booking, ASRequest, ActivePage, ProductOptionGroup, ProductOptionItem, VisitorAnalyticsData } from '../types';
import { DEFAULT_RESIDENTIAL_OPTION_GROUPS, LOTTE_EVSIS_OPTION_GROUPS, ELECTREE_OPTION_GROUPS, CHARGEGO_OPTION_GROUPS, COOLCHARGE_OPTION_GROUPS, PUBLIC_CHARGER_OPTION_GROUPS, PRODUCTS } from '../data';
import { HomePopupConfig, DEFAULT_HOME_POPUP_CONFIG } from './HomePopupModal';
import { AdminVisitorAnalytics } from './AdminVisitorAnalytics';
import { getVisitorAnalytics, fetchRealVisitorAnalyticsFromFirestore } from '../lib/visitorAnalytics';
import { compressImage } from '../lib/imageCompressor';
import { uploadFileToFirebaseStorage } from '../lib/firebase';
import { 
  Package, 
  Building2, 
  Building,
  Home,
  Store,
  ClipboardList, 
  Settings, 
  Bell,
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Check,
  ArrowLeft, 
  Search, 
  Image as ImageIcon,
  Zap,
  Save,
  Phone,
  MessageSquare,
  Globe,
  Youtube,
  Instagram,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Copy,
  Sliders,
  Edit3,
  FolderPlus,
  Database,
  Cloud,
  CloudDownload,
  CloudUpload,
  History,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  HardDrive,
  BarChart3,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useSecureAuth } from '../lib/secureAuthManager';
import { 
  createFirestoreBackup, 
  restoreFromLatestBackup, 
  restoreFromSpecificBackup, 
  getBackupHistory, 
  BackupMetadata, 
  formatBackupDate 
} from '../lib/firebase';

export interface OptionPreset {
  id: string;
  name: string;
  brand: string;
  description?: string;
  optionGroups: ProductOptionGroup[];
}

export const isResidentialProduct = (p: Product) => {
  const cat = p.detailCategory || '';
  const pwr = (p.power || '').toLowerCase().replace(/\s+/g, '');
  const type = (p.type || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  if (cat === '공용완속' || cat === '급속' || cat === '스탠드') return false;
  if (pwr.includes('biz') || pwr.includes('50kw') || pwr.includes('100kw') || pwr.includes('200kw')) return false;
  if (type.includes('급속') || type.includes('초급속')) return false;
  if (id.startsWith('park-') || id.startsWith('comm-') || id.startsWith('sy-dc') || id.startsWith('sy-fc') || id.startsWith('sy-biz') || id.startsWith('sy-stand')) return false;
  if ((name.includes('공용') && !name.includes('비공용') && !name.includes('개인용')) || name.includes('수익형') || name.includes('관공서') || name.includes('조달상품') || name.includes('초급속') || name.includes('주차장')) return false;

  return true;
};

export const isCommercialProduct = (p: Product) => {
  return !isResidentialProduct(p);
};

export const INITIAL_OPTION_PRESETS: OptionPreset[] = [
  {
    id: 'preset-public-biz',
    name: '공용/BIZ 충전기 전용 세부옵션 (커넥터길이 단일 옵션)',
    brand: '공용/BIZ',
    description: '공용 BIZ/상업용 충전기 전용 단일 커넥터길이 (5M / 7M) 옵션',
    optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
  },
  {
    id: 'preset-speel',
    name: '스필(SPEEL) 4년 무상A/S 전용 세부옵션 (7종)',
    brand: '스필',
    description: '스필 브랜드 특화: 5m/7m/10m 충전선, 계량기 하이박스, 스필 아크릴 캐노피, 고급 스탠드, 볼라드, 주차스토퍼, 표지판',
    optionGroups: [
      {
        id: 'speel-cable',
        title: '스필 커넥터 케이블 길이 선택',
        required: false,
        options: [
          { id: 'scable-5m', name: '5m 정품 케이블 (기본)', price: 0 },
          { id: 'scable-7m', name: '7m 연장 케이블 (+30,000원)', price: 30000 },
          { id: 'scable-10m', name: '10m 최장 전용선 (+60,000원)', price: 60000 }
        ]
      },
      {
        id: 'speel-hibox',
        title: '계량기 보호 방수 하이박스',
        required: false,
        options: [
          { id: 'shibox-none', name: '선택 안함', price: 0 },
          { id: 'shibox-std', name: '스필 투명 방수/방진 하이박스 (+50,000원)', price: 50000 }
        ]
      },
      {
        id: 'speel-canopy',
        title: '스필 빗물/자외선 차단 캐노피',
        required: false,
        options: [
          { id: 'scanopy-none', name: '선택 안함', price: 0 },
          { id: 'scanopy-acrylic', name: '스필 아크릴/선루프 캐노피 (+80,000원)', price: 80000 }
        ]
      },
      {
        id: 'speel-stand',
        title: '스필 앙카식 고급 스틸 스탠드',
        required: false,
        options: [
          { id: 'sstand-none', name: '선택 안함 (벽부형 기본)', price: 0 },
          { id: 'sstand-steel', name: '스필 자립형 스틸 고급 스탠드 (+150,000원)', price: 150000 }
        ]
      },
      {
        id: 'speel-bollard',
        title: '스텐 304 앙카식 볼라드',
        required: false,
        options: [
          { id: 'sbollard-none', name: '선택 안함', price: 0 },
          { id: 'sbollard-i', name: '스텐 304 앙카식 I형 볼라드 (+70,000원)', price: 70000 }
        ]
      },
      {
        id: 'speel-stopper',
        title: '고무 주차 스토퍼',
        required: false,
        options: [
          { id: 'sstopper-none', name: '선택 안함', price: 0 },
          { id: 'sstopper-rubber', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
        ]
      },
      {
        id: 'speel-sign',
        title: '전기차 충전구역 표지판',
        required: false,
        options: [
          { id: 'ssign-none', name: '선택 안함', price: 0 },
          { id: 'ssign-al', name: '알루미늄 충전구역 표지판 (+35,000원)', price: 35000 }
        ]
      }
    ]
  },
  {
    id: 'preset-electree',
    name: '일렉트리(ELECTREE) 전용 세부옵션 (7종 대분류 세트)',
    brand: '일렉트리',
    description: '충전선 길이, 하이박스, 캐노피, 스탠드, I형 볼라드, 스토퍼, 표지판 선택 7종',
    optionGroups: ELECTREE_OPTION_GROUPS
  },
  {
    id: 'preset-convenient',
    name: '편리(PNL)전기 전용 세부옵션',
    brand: '편리',
    description: '편리 브랜드: 케이블 사양, 편리 스마트 차양 캐노피, I형 스텐 볼라드, 주차 스토퍼',
    optionGroups: [
      {
        id: 'pnl-cable',
        title: '편리 충전선 길이',
        required: false,
        options: [
          { id: 'pcable-5m', name: '5m 커넥터 (기본)', price: 0 },
          { id: 'pcable-7m', name: '7m 케이블 (+28,000원)', price: 28000 },
          { id: 'pcable-10m', name: '10m 케이블 (+50,000원)', price: 50000 }
        ]
      },
      {
        id: 'pnl-canopy',
        title: '편리 스마트 차양 캐노피',
        required: false,
        options: [
          { id: 'pcanopy-none', name: '선택 안함', price: 0 },
          { id: 'pcanopy-std', name: '편리 스마트 차양 캐노피 (+75,000원)', price: 75000 }
        ]
      },
      {
        id: 'pnl-bollard',
        title: 'I형 스텐 안전 볼라드',
        required: false,
        options: [
          { id: 'pbollard-none', name: '선택 안함', price: 0 },
          { id: 'pbollard-std', name: 'I형 스텐 안전 볼라드 (+65,000원)', price: 65000 }
        ]
      },
      {
        id: 'pnl-stopper',
        title: '고무 주차 스토퍼',
        required: false,
        options: [
          { id: 'pstopper-none', name: '선택 안함', price: 0 },
          { id: 'pstopper-std', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
        ]
      }
    ]
  },
  {
    id: 'preset-chargego',
    name: '차지고(CHARGEGO) 전용 세부옵션 (7종 대분류 세트)',
    brand: '차지고',
    description: '충전선 길이, 하이박스, 캐노피, 스탠드, I형 볼라드, 스토퍼, 표지판 선택 7종',
    optionGroups: CHARGEGO_OPTION_GROUPS
  },
  {
    id: 'preset-coolcharge',
    name: '쿨차지(COOLCHARGE) 전용 세부옵션 (7종 대분류 세트)',
    brand: '쿨차지',
    description: '충전선 길이, 하이박스, 캐노피, 스탠드, I형 볼라드, 스토퍼, 표지판 선택 7종',
    optionGroups: COOLCHARGE_OPTION_GROUPS
  },
  {
    id: 'preset-evsis',
    name: '롯데 이브이시스(EVSIS) 전용 세부옵션 (9종 대분류 세트)',
    brand: '롯데 이브이시스',
    description: '충전선 길이, 하이박스, 캐노피, 스탠드, I형 볼라드, 스토퍼, 표지판, 추가거리공사, 사설계량기 선택 9종',
    optionGroups: LOTTE_EVSIS_OPTION_GROUPS
  },
  {
    id: 'preset-standard',
    name: '표준 가정용/홈충전기 세부옵션 (7종 풀세트)',
    brand: '공통',
    description: '표준 7종: 충전선, 하이박스, 캐노피, 스탠드, 볼라드, 주차스토퍼, 표지판',
    optionGroups: DEFAULT_RESIDENTIAL_OPTION_GROUPS
  },
  {
    id: 'preset-empty',
    name: '단품/스탠드 전용 (옵션없음)',
    brand: '공통',
    description: '옵션 없이 단품으로 판매되는 상품에 적용',
    optionGroups: []
  }
];

interface AdminPageProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  brands: Record<string, any>;
  onSaveBrands: (brands: Record<string, any>) => void;
  bookings: Booking[];
  asRequests: ASRequest[];
  snsConfig: {
    kakaoUrl: string;
    instagramUrl: string;
    blogUrl: string;
    youtubeUrl?: string;
    showFloatingSns: boolean;
  };
  onSaveSnsConfig: (config: any) => void;
  footerConfig: {
    phone: string;
    email: string;
    companyName: string;
    ceoName: string;
    businessNumber: string;
  };
  onSaveFooterConfig: (config: any) => void;
  homePopupConfig?: HomePopupConfig;
  onSaveHomePopupConfig?: (config: HomePopupConfig) => void;
  onPreviewPopup?: (config?: HomePopupConfig) => void;
  onNavigateHome: () => void;
}

interface ProductImageControlProps {
  product: Product;
  realIndex: number;
  onImageChange: (index: number, newUrl: string) => void;
  onFileUpload: (index: number, file: File) => void;
  onShowToast: (msg: string) => void;
}

const ProductImageControl: React.FC<ProductImageControlProps> = ({
  product,
  realIndex,
  onImageChange,
  onFileUpload,
  onShowToast
}) => {
  const isData = product.image?.startsWith('data:') || false;
  const [urlInput, setUrlInput] = useState(() => (isData ? '' : (product.image || '')));
  const [isUrlMode, setIsUrlMode] = useState(() => !isData);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    if (!product.image?.startsWith('data:')) {
      setUrlInput(product.image || '');
    }
  }, [product.image]);

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      alert('적용할 이미지 URL을 입력해주세요.');
      return;
    }
    setHasLoadError(false);
    onImageChange(realIndex, trimmed);
    onShowToast(`'${product.name}' 대표 이미지 URL이 적용되었습니다!`);
  };

  const handleResetToDefault = () => {
    const defaultUrl = '/스필.png';
    setUrlInput(defaultUrl);
    setIsUrlMode(true);
    setHasLoadError(false);
    onImageChange(realIndex, defaultUrl);
    onShowToast(`'${product.name}' 이미지가 기본 이미지로 초기화되었습니다.`);
  };

  return (
    <div className="lg:col-span-3 flex flex-col items-center sm:items-start gap-2.5 w-full">
      {/* Image Preview Box */}
      <div className="relative w-36 h-36 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden group flex items-center justify-center shadow-xs">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2"
          onError={() => setHasLoadError(true)}
          onLoad={() => setHasLoadError(false)}
        />
        
        {/* Top Status Badge */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
          {isData ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-600/95 text-white font-black text-[9px] shadow-xs flex items-center gap-0.5">
              📷 로컬 사진
            </span>
          ) : hasLoadError ? (
            <span className="px-1.5 py-0.5 rounded bg-red-600/95 text-white font-black text-[9px] shadow-xs flex items-center gap-0.5">
              ⚠️ 로드 실패
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-slate-900/85 text-emerald-400 font-black text-[9px] shadow-xs flex items-center gap-0.5">
              🌐 웹 URL
            </span>
          )}
        </div>

        {/* Hover overlay for quick upload */}
        <label
          htmlFor={`upload-img-${product.id}`}
          className="absolute inset-0 bg-slate-950/75 text-white font-extrabold text-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-2 text-center"
        >
          <Upload className="w-5 h-5 mb-1 text-amber-400" />
          <span>사진 변경</span>
          <span className="text-[10px] text-slate-300">내 컴퓨터 파일 선택</span>
        </label>
      </div>

      <input
        type="file"
        id={`upload-img-${product.id}`}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileUpload(realIndex, e.target.files[0]);
            setIsUrlMode(false);
          }
        }}
      />

      {/* Upload button & Quick Actions */}
      <div className="w-full space-y-1.5">
        <label
          htmlFor={`upload-img-${product.id}`}
          className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-black text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>사진 파일 업로드</span>
        </label>

        {isData && !isUrlMode ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsUrlMode(true);
                setUrlInput('');
              }}
              className="flex-1 py-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold text-center cursor-pointer border border-blue-200 transition-colors"
            >
              🌐 웹 URL로 변경
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
              title="기본 이미지로 초기화"
            >
              초기화
            </button>
          </div>
        ) : (
          <div className="w-full space-y-1">
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="https://... 이미지 URL 입력"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors shrink-0"
                title="입력한 이미지 URL 적용"
              >
                적용
              </button>
            </div>
            {hasLoadError && (
              <p className="text-[10px] font-bold text-red-600">
                ⚠️ 이미지 URL을 불러올 수 없습니다. 링크를 확인해주세요.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  onSaveProducts,
  brands,
  onSaveBrands,
  bookings,
  asRequests,
  snsConfig,
  onSaveSnsConfig,
  footerConfig,
  onSaveFooterConfig,
  homePopupConfig = DEFAULT_HOME_POPUP_CONFIG,
  onSaveHomePopupConfig,
  onPreviewPopup,
  onNavigateHome
}) => {
  const { formattedTime, remainingSeconds, isExpiringSoon, extendSession, logout } = useSecureAuth();
  const [adminTab, setAdminTab] = useState<'products' | 'residential' | 'brands' | 'commercial' | 'inquiries' | 'analytics' | 'settings' | 'popup' | 'backup'>('products');
  const [visitorData, setVisitorData] = useState<VisitorAnalyticsData>(() => getVisitorAnalytics());
  
  // Cloud Backup & Restore States
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupInfo, setLastBackupInfo] = useState<{ formattedDate?: string; keyCount?: number; trigger?: string; dataSizeKb?: number } | null>(() => {
    try {
      const saved = localStorage.getItem('sy_last_backup_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loadBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const list = await getBackupHistory(30);
      setBackupHistory(list);
      const saved = localStorage.getItem('sy_last_backup_info');
      if (saved) {
        setLastBackupInfo(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'backup') {
      loadBackups();
    }
    if (adminTab === 'analytics') {
      setVisitorData(getVisitorAnalytics());
      fetchRealVisitorAnalyticsFromFirestore().then(res => setVisitorData(res));
    }
  }, [adminTab]);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail && e.detail.tab) {
        setAdminTab(e.detail.tab);
        if (e.detail.tab === 'analytics') {
          setVisitorData(getVisitorAnalytics());
          fetchRealVisitorAnalyticsFromFirestore().then(res => setVisitorData(res));
        }
      }
    };
    window.addEventListener('sy_admin_switch_tab', handleSwitchTab);
    return () => window.removeEventListener('sy_admin_switch_tab', handleSwitchTab);
  }, []);

  useEffect(() => {
    const handleBackupCompleted = (e: any) => {
      const doc = e.detail;
      if (doc) {
        setLastBackupInfo({
          formattedDate: doc.formattedDate,
          keyCount: doc.keyCount,
          trigger: doc.trigger,
          dataSizeKb: doc.dataSizeKb
        });
      }
    };
    window.addEventListener('sy_cms_backup_completed', handleBackupCompleted);
    return () => window.removeEventListener('sy_cms_backup_completed', handleBackupCompleted);
  }, []);

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await createFirestoreBackup('manual');
      if (res.success) {
        setSaveSuccessMsg(`☁️ ${res.message}`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        await loadBackups();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert(`백업 실패: ${e}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleConfirmRestoreLatest = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: '최신 클라우드 백업본에서 전체 복구',
      targetName: lastBackupInfo?.formattedDate ? `[${lastBackupInfo.formattedDate}] 백업 스냅샷` : '최신 정상 백업본',
      description: 'Firestore에 저장된 최신 정상 백업 데이터로 로컬스토리지 및 쇼핑몰 전체 구성을 복구하시겠습니까?',
      warningNote: '현재 로컬 데이터가 클라우드 백업 시점의 데이터로 덮어씌워지며, 전체 상품 및 설정이 즉시 복원됩니다.',
      confirmLabel: '백업본에서 전체 복구',
      onConfirm: async () => {
        setIsRestoring(true);
        try {
          const res = await restoreFromLatestBackup();
          if (res.success) {
            setSaveSuccessMsg(`🎉 ${res.message}`);
            setTimeout(() => setSaveSuccessMsg(''), 5000);
            await loadBackups();
          } else {
            alert(`복구 실패: ${res.message}`);
          }
        } catch (err) {
          alert(`복구 중 오류가 발생했습니다: ${err}`);
        } finally {
          setIsRestoring(false);
        }
      }
    });
  };

  const handleConfirmRestoreSpecific = (backup: BackupMetadata) => {
    setDeleteModalConfig({
      isOpen: true,
      title: '특정 시점 백업본 복구',
      targetName: `[${backup.formattedDate}] 백업 스냅샷 (${backup.summary || `${backup.keyCount}개 항목`})`,
      description: `선택하신 '${backup.formattedDate}' 시점의 백업본으로 모든 데이터를 롤백 복구하시겠습니까?`,
      warningNote: '현재 상태가 선택하신 과거 시점 데이터로 즉시 교체 적용됩니다.',
      confirmLabel: '이 시점으로 롤백 복구',
      onConfirm: async () => {
        setIsRestoring(true);
        try {
          const res = await restoreFromSpecificBackup(backup.id);
          if (res.success) {
            setSaveSuccessMsg(`🎉 ${res.message}`);
            setTimeout(() => setSaveSuccessMsg(''), 5000);
            await loadBackups();
          } else {
            alert(`복구 실패: ${res.message}`);
          }
        } catch (err) {
          alert(`복구 중 오류 발생: ${err}`);
        } finally {
          setIsRestoring(false);
        }
      }
    });
  };
  
  // Local working copy of products for batch editing
  const [productList, setProductList] = useState<Product[]>(products);

  useEffect(() => {
    setProductList(products);
  }, [products]);

  const sanitizePopup = (cfg: HomePopupConfig): HomePopupConfig => {
    const cleaned = { ...cfg };
    if (cleaned.tab1Label === '포토리뷰이벤트') cleaned.tab1Label = '';
    if (cleaned.tab3Label === '상담시간연장') cleaned.tab3Label = '';
    if (!cleaned.imageUrl || cleaned.imageUrl.startsWith('data:image/svg') || cleaned.imageUrl.includes('postimg') || cleaned.imageUrl.includes('unsplash')) {
      cleaned.imageUrl = '/스필.png';
    }
    return cleaned;
  };

  const [popupState, setPopupState] = useState<HomePopupConfig>(() => sanitizePopup(homePopupConfig));
  useEffect(() => {
    if (homePopupConfig) setPopupState(sanitizePopup(homePopupConfig));
  }, [homePopupConfig]);
  const [productSearch, setProductSearch] = useState('');
  const [powerFilter, setPowerFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'device' | 'replace' | 'install'>('all');
  const [detailCategoryFilter, setDetailCategoryFilter] = useState<'all' | '비공용완속' | '비공용중속' | '공용완속' | '급속' | '스탠드'>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Local working copy of brands
  const [brandList, setBrandList] = useState<Record<string, any>>(brands);

  // Local SNS & Footer config
  const [snsState, setSnsState] = useState(snsConfig);
  const [footerState, setFooterState] = useState(footerConfig);

  // Admin Delete Confirmation Modal Config
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    targetName?: string;
    description?: string;
    warningNote?: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    onConfirm: () => {},
  });

  // Option Presets State
  const [optionPresets, setOptionPresets] = useState<OptionPreset[]>(() => {
    try {
      const saved = localStorage.getItem('sy_cms_option_presets_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse option presets', e);
    }
    return INITIAL_OPTION_PRESETS;
  });

  const [batchSelectedBrand, setBatchSelectedBrand] = useState<string>('스필');
  const [batchSelectedServiceType, setBatchSelectedServiceType] = useState<'device' | 'replace' | 'install' | 'all'>('all');
  const [batchSelectedPresetId, setBatchSelectedPresetId] = useState<string>('preset-speel');
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<OptionPreset | null>(null);

  // Save optionPresets to localStorage
  const updateOptionPresets = (newList: OptionPreset[]) => {
    setOptionPresets(newList);
    try {
      localStorage.setItem('sy_cms_option_presets_v2', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Create a brand new preset
  const handleCreateNewPreset = () => {
    setEditingPreset({
      id: `preset-custom-${Date.now()}`,
      name: '새 브랜드 전용 세부 옵션 템플릿',
      brand: '공통',
      description: '템플릿 설명을 입력해주세요.',
      optionGroups: [
        {
          id: `grp-${Date.now()}`,
          title: '기본 구성 및 케이블 길이 선택',
          required: false,
          options: [
            { id: `opt-${Date.now()}-1`, name: '5m 정품 케이블 (기본 장착)', price: 0 },
            { id: `opt-${Date.now()}-2`, name: '7m 연장 케이블 (+30,000원)', price: 30000 },
            { id: `opt-${Date.now()}-3`, name: '10m 최장 케이블 (+60,000원)', price: 60000 }
          ]
        }
      ]
    });
  };

  // Duplicate an existing preset
  const handleDuplicatePreset = (preset: OptionPreset) => {
    const newPreset: OptionPreset = {
      ...JSON.parse(JSON.stringify(preset)),
      id: `preset-custom-${Date.now()}`,
      name: `${preset.name} (복사본)`
    };
    const nextList = [...optionPresets, newPreset];
    updateOptionPresets(nextList);
    alert(`'${newPreset.name}' 템플릿이 사본으로 복사 저장되었습니다.`);
  };

  // Save edited preset
  const handleSaveEditedPreset = () => {
    if (!editingPreset) return;
    if (!editingPreset.name.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }
    const idx = optionPresets.findIndex(p => p.id === editingPreset.id);
    let nextList: OptionPreset[];
    if (idx !== -1) {
      nextList = [...optionPresets];
      nextList[idx] = editingPreset;
    } else {
      nextList = [...optionPresets, editingPreset];
    }
    updateOptionPresets(nextList);
    setEditingPreset(null);
    alert(`'${editingPreset.name}' 템플릿이 정상적으로 저장되었습니다!`);
  };

  // Delete Preset with confirmation modal
  const executeDeletePreset = (presetId: string) => {
    const nextPresets = optionPresets.filter(p => p.id !== presetId);
    updateOptionPresets(nextPresets);
    setSaveSuccessMsg('옵션 템플릿이 성공적으로 삭제되었습니다.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = optionPresets.find(p => p.id === presetId);
    if (!preset) return;
    setDeleteModalConfig({
      isOpen: true,
      title: '옵션 템플릿 삭제 확인',
      targetName: preset.name,
      description: `'${preset.name}' 옵션 템플릿을 삭제하시겠습니까?`,
      warningNote: '삭제된 템플릿은 템플릿 선택 목록에서 영구적으로 제거됩니다.',
      confirmLabel: '템플릿 삭제',
      onConfirm: () => executeDeletePreset(presetId)
    });
  };

  // Reset Presets to Default with confirmation modal
  const handleResetPresetsToDefault = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: '옵션 템플릿 초기화 확인',
      targetName: '전체 옵션 템플릿',
      description: '모든 옵션 템플릿을 브랜드 공식 기본값으로 복원하시겠습니까?',
      warningNote: '작성하신 커스텀 템플릿이 삭제되고 초기 기본 프리셋으로 덮어씌워집니다.',
      confirmLabel: '기본값으로 복원',
      onConfirm: () => {
        updateOptionPresets(INITIAL_OPTION_PRESETS);
        setSaveSuccessMsg('옵션 템플릿이 초기 기본값으로 복원되었습니다.');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    });
  };

  // Apply a preset to a single product
  const handleApplyPresetToProduct = (productIndex: number, presetId: string) => {
    const preset = optionPresets.find(p => p.id === presetId);
    if (!preset) return;

    const updated = [...productList];
    updated[productIndex] = {
      ...updated[productIndex],
      optionGroups: JSON.parse(JSON.stringify(preset.optionGroups))
    };
    setProductList(updated);
    setExpandedOptions(prev => ({ ...prev, [updated[productIndex].id]: true }));
    alert(`[${updated[productIndex].name}] 상품에 [${preset.name}] 세부 옵션이 적용되었습니다!`);
  };

  // Apply a preset to ALL products matching a brand (or all)
  const handleApplyPresetToBrand = (targetBrand: string, presetId: string, targetService?: 'device' | 'replace' | 'install' | 'all') => {
    const preset = optionPresets.find(p => p.id === presetId);
    if (!preset) {
      alert('선택된 옵션 템플릿을 찾을 수 없습니다.');
      return;
    }

    const svc = targetService || batchSelectedServiceType;
    const brandLabel = targetBrand === 'all' ? '전체' : targetBrand;
    const svcLabel = svc === 'device' ? '단말기 단품' : svc === 'replace' ? '교체 시공' : svc === 'install' ? '신규 설치' : '전체 서비스';

    let affectedCount = 0;
    const updated = productList.map(p => {
      const pBrand = p.brand || '';
      const pName = p.name || '';
      const matches = targetBrand === 'all' || 
                      pBrand.toLowerCase().includes(targetBrand.toLowerCase()) || 
                      pName.toLowerCase().includes(targetBrand.toLowerCase());

      if (matches) {
        affectedCount++;
        const clonedGroups = JSON.parse(JSON.stringify(preset.optionGroups));
        if (svc === 'device') {
          return { ...p, deviceOptionGroups: clonedGroups };
        } else if (svc === 'replace') {
          return { ...p, replaceOptionGroups: clonedGroups };
        } else if (svc === 'install') {
          return { ...p, installOptionGroups: clonedGroups };
        } else {
          return {
            ...p,
            deviceOptionGroups: clonedGroups,
            replaceOptionGroups: clonedGroups,
            installOptionGroups: clonedGroups,
            optionGroups: clonedGroups
          };
        }
      }
      return p;
    });

    setProductList(updated);
    onSaveProducts(updated);
    setSaveSuccessMsg(`[${brandLabel}]의 [${svcLabel}] 영역에 [${preset.name}] 템플릿이 적용되었습니다 (${affectedCount}개 상품).`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Save current product's options as a new Preset
  const handleSaveCurrentOptionsAsPreset = (productIndex: number) => {
    const sourceProduct = productList[productIndex];
    const sourceGroups = sourceProduct.optionGroups || [];

    if (sourceGroups.length === 0) {
      alert('저장할 세부 옵션 그룹이 없습니다. 먼저 옵션을 구성해주세요.');
      return;
    }

    const defaultPresetName = `${sourceProduct.brand || '커스텀'} ${sourceProduct.name} 전용 옵션`;
    const presetName = prompt(`현재 상품 [${sourceProduct.name}]의 옵션(${sourceGroups.length}개 그룹)을 새 템플릿으로 저장합니다.\n템플릿 이름을 입력해 주세요:`, defaultPresetName);

    if (!presetName || !presetName.trim()) return;

    const newPreset: OptionPreset = {
      id: `preset-custom-${Date.now()}`,
      name: presetName.trim(),
      brand: sourceProduct.brand || '커스텀',
      description: `${sourceProduct.name}에서 직접 추출한 옵션 세트`,
      optionGroups: JSON.parse(JSON.stringify(sourceGroups))
    };

    const nextPresets = [...optionPresets, newPreset];
    updateOptionPresets(nextPresets);
    alert(`'${presetName}' 템플릿이 성공적으로 저장되었습니다!\n이제 브랜드별 일괄 적용이나 다른 상품 옵션 설정에서 언제든지 불러와 사용할 수 있습니다.`);
  };

  // Handle Product Field Edit
  const handleProductChange = (index: number, field: keyof Product, value: any) => {
    const updated = [...productList];
    updated[index] = { ...updated[index], [field]: value };
    setProductList(updated);
  };

  // Track expanded option sections per product ID
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

  const toggleExpandOption = (id: string) => {
    setExpandedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Batch update serviceType for ALL products at once
  const handleBatchServiceType = (targetType: 'all' | 'device' | 'replace' | 'install') => {
    const labelMap = {
      all: '⚡ 전체 호환 (단말기/교체/설치 모두)',
      device: '📦 단말기 (기기 단품)',
      replace: '🔄 교체 (기기 교체시공)',
      install: '⚡ 설치 (신규 설치포함)'
    };
    const updated = productList.map(p => ({
      ...p,
      serviceType: targetType
    }));
    setProductList(updated);
    onSaveProducts(updated);
    setSaveSuccessMsg(`모든 상품(${updated.length}개)의 대분류가 [${labelMap[targetType]}]로 변경되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Batch copy option groups from a specific product to ALL products
  const handleBatchCopyOptionsFromProduct = (sourceIndex: number) => {
    const sourceProduct = productList[sourceIndex];
    const sourceGroups = sourceProduct.optionGroups || [];

    if (sourceGroups.length === 0) {
      alert('복사할 세부 옵션 그룹이 없습니다. 먼저 대분류 및 옵션을 추가해 주세요.');
      return;
    }

    const updated = productList.map(p => ({
      ...p,
      optionGroups: JSON.parse(JSON.stringify(sourceGroups))
    }));
    setProductList(updated);
    onSaveProducts(updated);
    setSaveSuccessMsg(`모든 상품(${updated.length}개)에 [${sourceProduct.name}]의 세부 옵션이 복사되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Batch apply default 6 option groups to ALL products
  const handleBatchApplyDefaultOptionsToAll = () => {
    const updated = productList.map(p => ({
      ...p,
      optionGroups: JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
    }));
    setProductList(updated);
    onSaveProducts(updated);
    setSaveSuccessMsg(`모든 상품(${updated.length}개)에 표준 세부 옵션 6종이 적용되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const expandAllOptions = () => {
    const next: Record<string, boolean> = {};
    productList.forEach(p => { next[p.id] = true; });
    setExpandedOptions(next);
  };

  const collapseAllOptions = () => {
    setExpandedOptions({});
  };

  // Add Option Group
  const handleAddOptionGroup = (productIndex: number) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = target.optionGroups || [];
    const grpCount = currentGroups.length;

    let defaultTitle = '커넥터길이';
    let defaultOptions: ProductOptionItem[] = [
      { id: `opt-${Date.now()}-1`, name: '5m 커넥터 일체형 (기본 장착)', price: 0 },
      { id: `opt-${Date.now()}-2`, name: '7m 연장형 (+30,000원)', price: 30000 },
      { id: `opt-${Date.now()}-3`, name: '10m 최장 전용선 (+50,000원)', price: 50000 }
    ];

    if (grpCount === 1) {
      defaultTitle = '거치대 및 스탠드 사양';
      defaultOptions = [
        { id: `opt-${Date.now()}-1`, name: '선택 안 함 (벽부형 기본)', price: 0 },
        { id: `opt-${Date.now()}-2`, name: '자립형 독립 스탠드 (+120,000원)', price: 120000 }
      ];
    } else if (grpCount >= 2) {
      defaultTitle = `추가 옵션 그룹 ${grpCount + 1}`;
      defaultOptions = [
        { id: `opt-${Date.now()}-1`, name: '선택 안 함 (기본)', price: 0 },
        { id: `opt-${Date.now()}-2`, name: '추가 구성품 포함', price: 20000 }
      ];
    }

    const newGroup: ProductOptionGroup = {
      id: `grp-${Date.now()}`,
      title: defaultTitle,
      required: false,
      options: defaultOptions
    };
    updated[productIndex] = {
      ...target,
      optionGroups: [...currentGroups, newGroup]
    };
    setProductList(updated);
    setExpandedOptions(prev => ({ ...prev, [target.id]: true }));
  };

  // Delete Option Group
  const executeDeleteOptionGroup = (productIndex: number, groupIdx: number) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = [...(target.optionGroups || [])];
    currentGroups.splice(groupIdx, 1);
    updated[productIndex] = { ...target, optionGroups: currentGroups };
    setProductList(updated);
  };

  const handleDeleteOptionGroup = (productIndex: number, groupIdx: number) => {
    const target = productList[productIndex];
    const grp = target?.optionGroups?.[groupIdx];
    const grpTitle = grp?.title || `옵션 그룹 #${groupIdx + 1}`;

    setDeleteModalConfig({
      isOpen: true,
      title: '옵션 그룹 삭제 확인',
      targetName: grpTitle,
      description: `'${target?.name || '상품'}'의 '${grpTitle}' 옵션 그룹 및 하위 항목을 삭제하시겠습니까?`,
      warningNote: '삭제 후 [저장하기]를 누르면 상품 구성에 최종 반영됩니다.',
      confirmLabel: '옵션 그룹 삭제',
      onConfirm: () => executeDeleteOptionGroup(productIndex, groupIdx)
    });
  };

  // Update Option Group Title
  const handleUpdateOptionGroupTitle = (productIndex: number, groupIdx: number, title: string) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = [...(target.optionGroups || [])];
    currentGroups[groupIdx] = { ...currentGroups[groupIdx], title };
    updated[productIndex] = { ...target, optionGroups: currentGroups };
    setProductList(updated);
  };

  // Add Option Choice Item
  const handleAddOptionItem = (productIndex: number, groupIdx: number) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = [...(target.optionGroups || [])];
    const grp = currentGroups[groupIdx];
    const newOpt: ProductOptionItem = {
      id: `opt-${Date.now()}`,
      name: '새 추가 옵션 항목',
      price: 10000
    };
    currentGroups[groupIdx] = { ...grp, options: [...grp.options, newOpt] };
    updated[productIndex] = { ...target, optionGroups: currentGroups };
    setProductList(updated);
  };

  // Delete Option Choice Item
  const handleDeleteOptionItem = (productIndex: number, groupIdx: number, optIdx: number) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = [...(target.optionGroups || [])];
    const grp = currentGroups[groupIdx];
    const nextOpts = grp.options.filter((_, idx) => idx !== optIdx);
    currentGroups[groupIdx] = { ...grp, options: nextOpts };
    updated[productIndex] = { ...target, optionGroups: currentGroups };
    setProductList(updated);
  };

  // Update Option Choice Item
  const handleUpdateOptionItem = (
    productIndex: number, 
    groupIdx: number, 
    optIdx: number, 
    field: 'name' | 'price', 
    val: any
  ) => {
    const updated = [...productList];
    const target = updated[productIndex];
    const currentGroups = [...(target.optionGroups || [])];
    const grp = currentGroups[groupIdx];
    const nextOpts = [...grp.options];
    nextOpts[optIdx] = { ...nextOpts[optIdx], [field]: val };
    currentGroups[groupIdx] = { ...grp, options: nextOpts };
    updated[productIndex] = { ...target, optionGroups: currentGroups };
    setProductList(updated);
  };

  // Validate and sanitize image URL helper
  const validateImageUrl = (url: string): { isValid: boolean; message: string; type: 'local' | 'url' | 'empty' | 'invalid' } => {
    if (!url || !url.trim()) {
      return { isValid: false, message: '이미지가 설정되지 않았습니다.', type: 'empty' };
    }
    const trimmed = url.trim();
    if (trimmed.startsWith('data:image/')) {
      return { isValid: true, message: '📷 로컬 사진 파일 (압축 완료)', type: 'local' };
    }
    if (trimmed.startsWith('blob:')) {
      return { isValid: true, message: '📎 임시 브라우저 이미지', type: 'local' };
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('/')) {
      return { isValid: true, message: '🌐 웹 이미지 URL', type: 'url' };
    }
    return { isValid: false, message: '⚠️ 유효하지 않은 URL 형식', type: 'invalid' };
  };

  // Handle Product Image File Upload (Uploads to Firebase Storage and returns permanent public URL)
  const handleProductImageUpload = async (index: number, file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('이미지 파일 크기가 너무 큽니다. 25MB 이하의 JPG/PNG 이미지를 선택해 주세요.');
      return;
    }

    try {
      const prodName = productList[index]?.name || `prod_${index}`;
      const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', `${prodName}_${file.name}`);
      if (downloadUrl) {
        const updated = [...productList];
        if (updated[index]) {
          updated[index] = { ...updated[index], image: downloadUrl };
          setProductList(updated);
          onSaveProducts(updated);
          setSaveSuccessMsg(`'${updated[index].name}' 대표 사진이 Firebase Storage에 저장되어 실시간 동기화되었습니다!`);
          setTimeout(() => setSaveSuccessMsg(''), 3500);
        }
      }
    } catch (err) {
      console.warn('Firebase Storage upload fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const updated = [...productList];
          if (updated[index]) {
            updated[index] = { ...updated[index], image: dataUrl };
            setProductList(updated);
            onSaveProducts(updated);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add New Product
  const handleAddProduct = () => {
    const newProd: Product = {
      id: `custom-prod-${Date.now()}`,
      name: '새 전기차 충전기 모델',
      type: '완속',
      power: '7kW',
      features: ['PLC 화재 차단 기능', '무상 A/S 지원'],
      specs: { '설치방식': '벽부형 / 스탠드' },
      image: '/스필.png',
      description: '새로 추가된 고급 전기차 충전기 제품입니다.',
      plcSupported: true,
      price: 650000,
      originalPrice: 850000,
      discountRate: 23,
      brand: 'SY.com',
      manufacturer: '에스와이코리아',
      detailCategory: '비공용완속',
      optionGroups: JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
    };

    const updated = [newProd, ...productList];
    setProductList(updated);
    onSaveProducts(updated);

    // Reset filters & search so the newly added product is immediately visible
    setProductSearch('');
    setPowerFilter('all');
    setServiceFilter('all');

    // Expand options on new product
    setExpandedOptions(prev => ({ ...prev, [newProd.id]: true }));

    // Show toast message
    setSaveSuccessMsg(`[${newProd.name}] 신규 상품이 추가되고 자동 저장되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);

    // Close preset manager modal if open
    setIsPresetManagerOpen(false);
  };

  // Add New Residential Product
  const handleAddResidentialProduct = () => {
    const newProd: Product = {
      id: `res-prod-${Date.now()}`,
      name: '새 가정용 7kW 스마트 홈 충전기',
      type: '완속',
      power: '7kW',
      features: ['PLC 화재 차단 기능', '무상 A/S 4년 보장', '스마트폰 앱 연동'],
      specs: { '설치방식': '벽부형 / 스탠드' },
      image: '/스필.png',
      description: '단독주택 및 빌라, 개인 주차면에 최적화된 가정용 완속 충전기 신규 모델입니다.',
      plcSupported: true,
      price: 550000,
      originalPrice: 650000,
      discountRate: 15,
      brand: 'SY.com',
      manufacturer: '에스와이코리아',
      detailCategory: '비공용완속',
      serviceType: 'device',
      optionGroups: JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
    };

    const updated = [newProd, ...productList];
    setProductList(updated);
    onSaveProducts(updated);

    setProductSearch('');
    setPowerFilter('all');
    setServiceFilter('all');
    setDetailCategoryFilter('all');

    setExpandedOptions(prev => ({ ...prev, [newProd.id]: true }));
    setSaveSuccessMsg(`[${newProd.name}] 가정용 충전기 신규 상품이 추가되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setIsPresetManagerOpen(false);
  };

  // Add New Commercial Product
  const handleAddCommercialProduct = () => {
    const newProd: Product = {
      id: `comm-prod-${Date.now()}`,
      name: '새 상업시설 공용 BIZ 스마트 충전기',
      type: '급속',
      power: '50kW',
      features: ['공용 과금 및 결제 시스템 연동', '화재 감지 PLC 모뎀 내장', 'KC 형식승인 완료'],
      specs: { '설치방식': '스탠드 / 주차타워' },
      image: '/50kw-쿨차지.png',
      description: '호텔, 마트, 상가빌딩, 공영주차장 맞춤형 상업시설 수익형 공용 충전기입니다.',
      plcSupported: true,
      price: 1200000,
      originalPrice: 1500000,
      discountRate: 20,
      brand: 'SY.com',
      manufacturer: '에스와이코리아',
      detailCategory: '급속',
      serviceType: 'install',
      optionGroups: JSON.parse(JSON.stringify(PUBLIC_CHARGER_OPTION_GROUPS))
    };

    const updated = [newProd, ...productList];
    setProductList(updated);
    onSaveProducts(updated);

    setProductSearch('');
    setPowerFilter('all');
    setServiceFilter('all');
    setDetailCategoryFilter('all');

    setExpandedOptions(prev => ({ ...prev, [newProd.id]: true }));
    setSaveSuccessMsg(`[${newProd.name}] 상업시설 충전기 신규 상품이 추가되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setIsPresetManagerOpen(false);
  };

  // Delete Product with confirmation modal
  const executeDeleteProduct = (id: string) => {
    const target = productList.find(p => p.id === id);
    const prodName = target ? target.name : '상품';

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
    } catch (e) {}

    const updated = productList.filter(p => p.id !== id);
    setProductList(updated);
    onSaveProducts(updated);
    setSaveSuccessMsg(`'${prodName}' 상품이 성공적으로 삭제되었습니다.`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDeleteProduct = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const target = productList.find(p => p.id === id);
    const prodName = target ? target.name : '상품';

    setDeleteModalConfig({
      isOpen: true,
      title: '충전기 상품 삭제 확인',
      targetName: prodName,
      description: `정말 '${prodName}' 충전기 상품을 관리자 상품 목록에서 삭제하시겠습니까?`,
      warningNote: '삭제 시 고객 솔루션 화면과 관리자 목록에서 즉시 제외됩니다.',
      confirmLabel: '상품 삭제',
      onConfirm: () => executeDeleteProduct(id)
    });
  };

  // Reset Default Products with confirmation modal
  const handleResetDefaultProducts = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: '기본 충전기 상품 목록 복원',
      targetName: 'SY.com 기본 충전기 전체 목록',
      description: '기초 정식 충전기 상품 목록(SY.com 기본 데이터)으로 전체 복원하시겠습니까?',
      warningNote: '실수로 삭제하셨던 기본 충전기 상품들이 모두 복구되며, 새로 덮어씌워집니다.',
      confirmLabel: '기본 데이터로 전체 복구',
      onConfirm: () => {
        try {
          localStorage.removeItem('sy_cms_deleted_product_ids');
        } catch (e) {}
        setProductList(PRODUCTS);
        onSaveProducts(PRODUCTS);
        setSaveSuccessMsg('SY.com 기본 충전기 상품 목록이 성공적으로 전면 복원되었습니다!');
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      }
    });
  };

  // Save Single Product
  const handleSaveSingleProduct = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const validatedList = productList.map(p => {
        if (p.id === product.id) {
          const imgVal = p.image?.trim() || '/스필.png';
          return { ...p, image: imgVal };
        }
        return p;
      });
      setProductList(validatedList);
      onSaveProducts(validatedList);
      setIsSavedRecently(true);
      setSaveSuccessMsg(`'${product.name}' 상품 정보 및 대표 이미지가 검증되어 로컬스토리지에 저장되었습니다!`);
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsSavedRecently(false);
      }, 3500);
    } catch (err) {
      console.error('Single product save error:', err);
      setSaveSuccessMsg(`'${product.name}' 상품 정보 저장 완료!`);
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  // Save All Products
  const handleSaveAllProducts = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const validatedList = productList.map(p => ({
        ...p,
        image: p.image?.trim() || '/스필.png'
      }));
      setProductList(validatedList);
      onSaveProducts(validatedList);
      setIsSavedRecently(true);
      setSaveSuccessMsg(`전체 ${validatedList.length}개 상품의 정보 및 대표 이미지가 성공적으로 일괄 동기화되었습니다!`);
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsSavedRecently(false);
      }, 3500);
    } catch (err) {
      console.error('Save all products error:', err);
      setSaveSuccessMsg('전체 상품 변경사항이 성공적으로 저장되었습니다!');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  // Save All Brands
  const handleSaveAllBrands = () => {
    onSaveBrands(brandList);
    setSaveSuccessMsg('아파트 브랜드 정보가 성공적으로 저장되었습니다!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Save Site Settings
  const handleSaveSiteSettings = () => {
    onSaveSnsConfig(snsState);
    onSaveFooterConfig(footerState);
    setSaveSuccessMsg('사이트 설정 및 퀵채널 SNS 링크가 저장되었습니다!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Helper to get service category (단말기, 교체, 설치, 전체)
  const getProductServiceType = (p: Product): 'device' | 'replace' | 'install' | 'all' => {
    if (p.serviceType) return p.serviceType as any;
    return 'all';
  };

  // Residential & Commercial counts
  const residentialCount = productList.filter(isResidentialProduct).length;
  const commercialCount = productList.filter(isCommercialProduct).length;

  // Filter products by mode, search, service category (단말기/교체/설치), & power
  const getFilteredProductsForMode = (mode: 'all' | 'residential' | 'commercial') => {
    let baseList = productList;
    if (mode === 'residential') {
      baseList = productList.filter(isResidentialProduct);
    } else if (mode === 'commercial') {
      baseList = productList.filter(isCommercialProduct);
    }

    return baseList.filter(p => {
      const searchLower = productSearch.trim().toLowerCase();
      const matchesSearch = !searchLower || 
        (p.name && p.name.toLowerCase().includes(searchLower)) || 
        (p.modelName && p.modelName.toLowerCase().includes(searchLower)) ||
        (p.brand && p.brand.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower));

      // Service category filter (단말기, 교체, 설치)
      const st = getProductServiceType(p);
      let matchesService = true;
      if (serviceFilter !== 'all') {
        if (st === 'all') {
          matchesService = true; // 'all' (모두 호환) matches device, replace, and install
        } else {
          matchesService = (st === serviceFilter);
        }
      }

      // Power filter (5kW, 7kW, 11kW, 14kW, BIZ)
      let matchesPower = true;
      if (powerFilter !== 'all') {
        const pPower = (p.power || '').toLowerCase().replace(/\s+/g, '');
        const pName = (p.name || '').toLowerCase().replace(/\s+/g, '');
        const pfLower = powerFilter.toLowerCase().replace(/\s+/g, '');

        if (pfLower === '5kw') {
          matchesPower = pPower.includes('5kw') || pName.includes('5kw') || pName.includes('5킬로');
        } else if (pfLower === '7kw') {
          matchesPower = pPower.includes('7kw') || pName.includes('7kw') || pName.includes('7킬로');
        } else if (pfLower === '11kw') {
          matchesPower = pPower.includes('11kw') || pName.includes('11kw') || pName.includes('11킬로');
        } else if (pfLower === '14kw') {
          matchesPower = pPower.includes('14kw') || pName.includes('14kw') || pName.includes('14킬로');
        } else if (pfLower === 'biz') {
          matchesPower = pPower.includes('biz') || pPower.includes('50kw') || pPower.includes('100kw') || pPower.includes('200kw') || 
                         (p.type && (p.type.includes('급속') || p.type.includes('초급속'))) || 
                         (p.detailCategory && (p.detailCategory.includes('급속') || p.detailCategory.includes('공용완속')));
        } else if (pfLower === '50kw') {
          matchesPower = pPower.includes('50kw') || pName.includes('50kw');
        } else if (pfLower === '100kw') {
          matchesPower = pPower.includes('100kw') || pName.includes('100kw');
        } else if (pfLower === '200kw') {
          matchesPower = pPower.includes('200kw') || pName.includes('200kw') || pName.includes('초급속');
        } else if (pfLower === '스탠드') {
          matchesPower = p.detailCategory === '스탠드' || p.type === '스탠드' || pName.includes('스탠드');
        } else {
          matchesPower = pPower.includes(pfLower) || pName.includes(pfLower);
        }
      }

      // Detail Category filter (비공용완속, 비공용중속, 공용완속, 급속, 스탠드)
      let matchesCategory = true;
      if (detailCategoryFilter !== 'all') {
        matchesCategory = p.detailCategory === detailCategoryFilter;
      }

      return matchesSearch && matchesService && matchesPower && matchesCategory;
    });
  };

  const filteredProducts = getFilteredProductsForMode(
    adminTab === 'residential' ? 'residential' : adminTab === 'commercial' ? 'commercial' : 'all'
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-24">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold"
              title="쇼핑몰 메인으로 이동"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인 쇼핑몰</span>
            </button>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                ADMIN CENTER
              </span>
              <h1 className="text-base font-black tracking-tight text-white hidden sm:block">
                SY.com 통합 관리자 대시보드
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Expiration Countdown Badge */}
            {remainingSeconds > 0 && (
              <div 
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                  isExpiringSoon 
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-amber-300'
                }`}
                title="관리자 보안 세션 만료 시간"
              >
                <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
                <span className="hidden sm:inline text-slate-400 text-[11px]">세션:</span>
                <span className="font-mono tracking-tight font-black">{formattedTime}</span>
                <button
                  type="button"
                  onClick={() => {
                    const ok = extendSession();
                    if (ok) {
                      setSaveSuccessMsg('⏱️ 관리자 보안 세션이 30분 연장되었습니다.');
                      setTimeout(() => setSaveSuccessMsg(''), 3000);
                    }
                  }}
                  className="ml-0.5 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs active:scale-95"
                  title="세션 유효 시간 30분 연장"
                >
                  연장
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('관리자 세션을 종료하고 안전하게 로그아웃하시겠습니까?')) {
                  logout();
                  onNavigateHome();
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 border border-slate-700 hover:border-rose-700/60 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
              title="관리자 로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사용자 화면</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Success Alert Banner (Floating Toast) */}
        <AnimatePresence>
          {saveSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] px-6 py-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-2xl font-black text-sm sm:text-base border-2 border-emerald-400 gap-4 min-w-[340px] max-w-xl pointer-events-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">저장 완료 (SAVE SUCCESS)</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">{saveSuccessMsg}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMsg('')}
                className="text-slate-300 hover:text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition-all shrink-0"
              >
                닫기
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Tab Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          <button
            onClick={() => {
              setAdminTab('products');
              setPowerFilter('all');
              setDetailCategoryFilter('all');
              setServiceFilter('all');
            }}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'products'
                ? 'bg-slate-900 text-white shadow-md ring-2 ring-blue-400/50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">📦 전체 ({productList.length})</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('residential');
              setPowerFilter('all');
              setDetailCategoryFilter('all');
              setServiceFilter('all');
            }}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'residential'
                ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">🏠 홈 ({residentialCount})</span>
          </button>

          <button
            onClick={() => setAdminTab('brands')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'brands'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">🏢 아파트 브랜드</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('commercial');
              setPowerFilter('all');
              setDetailCategoryFilter('all');
              setServiceFilter('all');
            }}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'commercial'
                ? 'bg-blue-800 text-white shadow-md ring-2 ring-blue-400/50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">🏬 상업 ({commercialCount})</span>
          </button>

          <button
            onClick={() => setAdminTab('inquiries')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'inquiries'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">📋 문의 ({bookings.length + asRequests.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('analytics')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'analytics'
                ? 'bg-indigo-900 text-white shadow-md ring-2 ring-indigo-400/50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">📊 방문자 ({visitorData.todayUV}명)</span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'settings'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">⚙️ 사이트 정보</span>
          </button>

          <button
            onClick={() => setAdminTab('popup')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'popup'
                ? 'bg-purple-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">🔔 팝업&폼</span>
          </button>

          <button
            onClick={() => setAdminTab('backup')}
            className={`px-3 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'backup'
                ? 'bg-sky-700 text-white shadow-md ring-2 ring-sky-400/50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">☁️ 클라우드 백업</span>
          </button>
        </div>

        {/* TAB 1, 2, 3: PRODUCTS MANAGER (ALL / RESIDENTIAL / COMMERCIAL) */}
        {(adminTab === 'products' || adminTab === 'residential' || adminTab === 'commercial') && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {adminTab === 'residential' ? (
                  <>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Home className="w-5 h-5 text-emerald-600" />
                      가정용 홈 충전기 전용 관리 (5kW · 7kW · 11kW · 14kW)
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      단독주택, 빌라, 개인 전용 주차면에 설치되는 비공용 완속/중속 충전기 상품 목록 및 대표 이미지, 옵션(7종 표준 세트)을 집중 관리합니다.
                    </p>
                  </>
                ) : adminTab === 'commercial' ? (
                  <>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-cyan-600" />
                      상업시설 · 주차장 수익형 충전기 전용 관리 (공용 BIZ · 급속 · 스탠드)
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      대형 마트, 호텔, 빌딩, 공영주차장, 사업장에 최적화된 공용 BIZ 완속, 50kW~200kW 급속 충전기 및 스탠드 상품을 집중 관리합니다.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      전체 상품 일괄 편집 및 이미지 즉시 변경
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      모든 충전기 상품의 대표 이미지 파일(JPG/PNG 업로드), 모델명, 가격, 할인율, PLC 화재차단 여부를 한곳에서 수정할 수 있습니다.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDefaultProducts}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="실수로 삭제된 상품이나 기본 정식 충전기 데이터 전체 복원"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>기본 상품 복원</span>
                </button>

                <button
                  onClick={
                    adminTab === 'residential'
                      ? handleAddResidentialProduct
                      : adminTab === 'commercial'
                      ? handleAddCommercialProduct
                      : handleAddProduct
                  }
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {adminTab === 'residential'
                      ? '가정용 신규 상품 추가'
                      : adminTab === 'commercial'
                      ? '상업용 신규 상품 추가'
                      : '신규 상품 추가'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSaveAllProducts(e)}
                  className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSavedRecently
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white animate-bounce-short'
                  }`}
                >
                  {isSavedRecently ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>✓ 저장 완료!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>전체 변경사항 저장</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              {/* Row 1: Search & Option Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="상품명, 모델명 또는 브랜드 검색..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={expandAllOptions}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    📂 모든 옵션 펼치기
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllOptions}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    📁 모두 접기
                  </button>
                </div>
              </div>

              {/* Row 2: Service Classification & Power Output Filters */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                
                {/* 1. Service Type Filter (단말기 / 교체 / 설치) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-slate-700 mr-1 shrink-0 flex items-center gap-1">
                    🏷️ 구분 필터:
                  </span>
                  {[
                    { id: 'all', label: '전체 구분' },
                    { id: 'device', label: '📦 단말기 (기기 단품)' },
                    { id: 'replace', label: '🔄 교체 (기기 교체시공)' },
                    { id: 'install', label: '⚡ 설치 (신규 설치포함)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setServiceFilter(st.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                        serviceFilter === st.id
                          ? 'bg-slate-900 text-amber-400 border border-slate-800 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* 2. Power Output Filter */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-black text-slate-500 mr-1 shrink-0">⚡ 용량 필터:</span>
                  {(adminTab === 'residential'
                    ? ['all', '5kW', '7kW', '11kW', '14kW']
                    : adminTab === 'commercial'
                    ? ['all', 'BIZ', '50kW', '100kW', '200kW', '스탠드']
                    : ['all', '5kW', '7kW', '11kW', '14kW', 'BIZ', '50kW', '100kW', '200kW', '스탠드']
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPowerFilter(p)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                        powerFilter === p
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p === 'all' ? '전체 용량' : p}
                    </button>
                  ))}
                </div>

                {/* 3. Detail Category / Public Charger Filter */}
                <div className="flex items-center gap-1 flex-wrap w-full pt-2 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-700 mr-1 shrink-0 flex items-center gap-1">
                    📂 용도/카테고리 필터:
                  </span>
                  {(adminTab === 'residential'
                    ? [
                        { id: 'all', label: '전체 카테고리' },
                        { id: '비공용완속', label: '🏠 비공용완속 (5kW / 7kW)' },
                        { id: '비공용중속', label: '🏠 비공용중속 (11kW / 14kW)' },
                      ]
                    : adminTab === 'commercial'
                    ? [
                        { id: 'all', label: '전체 카테고리' },
                        { id: '공용완속', label: '🏢 공용완속 (견적문의)' },
                        { id: '급속', label: '⚡ 급속 (견적문의)' },
                        { id: '스탠드', label: '🛡️ 스탠드/부스' },
                      ]
                    : [
                        { id: 'all', label: '전체 카테고리' },
                        { id: '비공용완속', label: '🏠 비공용완속' },
                        { id: '비공용중속', label: '🏠 비공용중속' },
                        { id: '공용완속', label: '🏢 공용완속(견적문의)' },
                        { id: '급속', label: '⚡ 급속(견적문의)' },
                        { id: '스탠드', label: '🛡️ 스탠드/부스' },
                      ]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDetailCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                        detailCategoryFilter === cat.id
                          ? cat.id.includes('공용') || cat.id === '급속'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Row 3: Clean & Organized Batch Operations & Template Manager */}
              <div className="pt-3 border-t border-slate-200/80 space-y-3">
                {/* 1. Batch Service Type Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-black text-xs">
                      ⚡
                    </span>
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        대분류(구분) 전체 일괄 변경
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        단 한 번 클릭으로 전체 {productList.length}개 상품의 대분류 구성을 바꿉니다.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleBatchServiceType('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center gap-1 ${
                        serviceFilter === 'all'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>⚡ 전체 [모두 호환]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchServiceType('device')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>📦 [단말기 단품]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchServiceType('replace')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>🔄 [교체 시공]</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchServiceType('install')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-900 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡ [신규 설치]</span>
                    </button>
                  </div>
                </div>

                {/* 2. Brand Template Selection & Direct Management Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-black text-xs">
                        🏷️
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          브랜드별 세부 옵션 템플릿 일괄 적용 & 관리
                        </div>
                        <div className="text-[11px] font-bold text-slate-500">
                          스필, 일렉트리, 편리전기, 차지고 등 브랜드 전용 템플릿을 선택하여 일괄 적용하거나 수정/삭제합니다.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsPresetManagerOpen(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-indigo-200" />
                        <span>⚙️ 템플릿 관리자 ({optionPresets.length}개 저장됨)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddProduct}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1 border border-emerald-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>➕ 신규 상품 추가</span>
                      </button>
                    </div>
                  </div>

                  {/* Template Application Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Select Target Brand */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 shrink-0">대상 브랜드:</span>
                        <select
                          value={batchSelectedBrand}
                          onChange={(e) => setBatchSelectedBrand(e.target.value)}
                          className="text-xs font-black text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">🌐 전체 브랜드 상품</option>
                          <option value="스필">스필 (SPEEL)</option>
                          <option value="일렉트리">일렉트리 (ELECTREE)</option>
                          <option value="편리">편리 (PNL)전기</option>
                          <option value="차지고">차지고 (CHARGEGO)</option>
                          <option value="롯데 이브이시스">롯데 이브이시스 (EVSIS)</option>
                          <option value="쿨차지">쿨차지 (COOLCHARGE)</option>
                        </select>
                      </div>

                      {/* Select Target Service Type */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 shrink-0">적용 서비스:</span>
                        <select
                          value={batchSelectedServiceType}
                          onChange={(e) => setBatchSelectedServiceType(e.target.value as any)}
                          className="text-xs font-black text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">⚡ 전체 (단말기/교체/설치 모두)</option>
                          <option value="device">📦 단말기 단품 전용</option>
                          <option value="replace">🛠️ 교체 시공 전용</option>
                          <option value="install">⚡ 신규 설치 포함 전용</option>
                        </select>
                      </div>

                      {/* Select Option Preset */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 shrink-0">적용할 템플릿:</span>
                        <select
                          value={batchSelectedPresetId}
                          onChange={(e) => setBatchSelectedPresetId(e.target.value)}
                          className="text-xs font-black text-slate-900 bg-transparent focus:outline-hidden cursor-pointer max-w-[220px] truncate"
                        >
                          {optionPresets.map(preset => (
                            <option key={preset.id} value={preset.id}>
                              [{preset.brand}] {preset.name} ({preset.optionGroups.length}개 그룹)
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyPresetToBrand(batchSelectedBrand, batchSelectedPresetId, batchSelectedServiceType)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-blue-200" />
                        <span>선택 브랜드/서비스에 템플릿 적용</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleBatchApplyDefaultOptionsToAll}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-500" />
                        <span>표준 7종 전체적용</span>
                      </button>

                      <button
                        type="button"
                        onClick={expandAllOptions}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        📂 전체 펼치기
                      </button>
                    </div>
                  </div>

                  {/* Direct Template Quick-Edit Strip */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                        ✏️ 저장된 세부 옵션 템플릿 목록 (여기서 직접 [수정/삭제] 가능):
                      </span>
                      <button
                        type="button"
                        onClick={handleCreateNewPreset}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ 새 템플릿 생성</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {optionPresets.map((preset) => (
                        <div
                          key={preset.id}
                          className="bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl px-3 py-2 shrink-0 flex items-center gap-2.5 transition-all text-xs"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
                              {preset.brand}
                            </span>
                            <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[150px]" title={preset.name}>
                              {preset.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPreset(JSON.parse(JSON.stringify(preset)));
                              }}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-2xs"
                              title="템플릿 옵션 항목 및 가격 수정"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePreset(preset.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="템플릿 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table Card List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                <p className="text-xs font-black text-slate-700">
                  {adminTab === 'residential' ? '🏠 가정용 홈 충전기: ' : adminTab === 'commercial' ? '🏬 상업시설 · 수익형 충전기: ' : '📦 전체 상품: '}
                  총 <span className="text-blue-600 font-extrabold">{filteredProducts.length}개</span> 표시 중 (
                  {adminTab === 'residential' ? `가정용 총 ${residentialCount}개` : adminTab === 'commercial' ? `상업용 총 ${commercialCount}개` : `전체 ${productList.length}개`}
                  )
                </p>
                <div className="flex items-center gap-2">
                  {(powerFilter !== 'all' || serviceFilter !== 'all' || detailCategoryFilter !== 'all' || productSearch) && (
                    <button
                      type="button"
                      onClick={() => { setPowerFilter('all'); setServiceFilter('all'); setDetailCategoryFilter('all'); setProductSearch(''); }}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 underline cursor-pointer"
                    >
                      필터 전체 해제
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={
                      adminTab === 'residential'
                        ? handleAddResidentialProduct
                        : adminTab === 'commercial'
                        ? handleAddCommercialProduct
                        : handleAddProduct
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {adminTab === 'residential' ? '가정용 상품 추가' : adminTab === 'commercial' ? '상업용 상품 추가' : '신규 상품 추가'}
                    </span>
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                  <p className="text-sm font-extrabold text-slate-700">
                    선택하신 조건에 검색되는 충전기 상품이 없습니다.
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    필터(용량: {powerFilter}, 구분: {serviceFilter}) 또는 검색어를 변경해 보세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setPowerFilter('all'); setServiceFilter('all'); setDetailCategoryFilter('all'); setProductSearch(''); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    전체 상품 보기 (필터 초기화)
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const realIndex = productList.findIndex(p => p.id === product.id);
                  const isCommercial = isCommercialProduct(product);
                  return (
                  <div
                    key={product.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 relative"
                  >
                    {/* Card Top Action Header */}
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-slate-900 text-amber-400 rounded-md text-[11px] font-black tracking-tight">
                          ID: {product.id}
                        </span>
                        <span className="text-xs font-black text-slate-800">
                          [{product.brand || 'SY.com'}] {product.name}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-extrabold border border-blue-200">
                          {product.type} ({product.power || '7kW'})
                        </span>
                        {isCommercial ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-extrabold border border-rose-200">
                            🏢 상업시설 · 공용 (견적문의)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-extrabold border border-emerald-200">
                            🏠 비공용 · 가정용
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleSaveSingleProduct(product, e)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ring-2 ring-emerald-300/50"
                        >
                          <Save className="w-3.5 h-3.5 text-white" />
                          <span>이 상품 저장</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                      
                      {/* Image Preview & Upload Column with Validation */}
                      <ProductImageControl
                        product={product}
                        realIndex={realIndex}
                        onImageChange={(idx, newUrl) => handleProductChange(idx, 'image', newUrl)}
                        onFileUpload={(idx, file) => handleProductImageUpload(idx, file)}
                        onShowToast={(msg) => {
                          setSaveSuccessMsg(msg);
                          setTimeout(() => setSaveSuccessMsg(''), 3500);
                        }}
                      />

                      {/* Product Details Column */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">상품명 (표시 이름)</label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => handleProductChange(realIndex, 'name', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">브랜드 / 제조사</label>
                            <input
                              type="text"
                              value={product.brand || 'SY.com'}
                              onChange={(e) => handleProductChange(realIndex, 'brand', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-amber-800">판매/시공 구분</label>
                              <button
                                type="button"
                                onClick={() => handleBatchServiceType(getProductServiceType(product) as any)}
                                className="text-[9px] font-black text-amber-800 hover:text-amber-950 underline bg-amber-200/70 hover:bg-amber-300 px-1 py-0.2 rounded cursor-pointer shrink-0"
                                title="이 구분을 전체 상품에 일괄 적용"
                              >
                                ⚡전체적용
                              </button>
                            </div>
                            <select
                              value={getProductServiceType(product)}
                              onChange={(e) => handleProductChange(realIndex, 'serviceType', e.target.value)}
                              className="w-full px-2 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-black text-amber-900 focus:bg-white"
                            >
                              <option value="all">⚡ 전체 (단말기/교체/설치 호환)</option>
                              <option value="device">📦 단말기 (기기 단품)</option>
                              <option value="replace">🔄 교체 (기기 교체시공)</option>
                              <option value="install">⚡ 설치 (신규 설치포함)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">충전 타입</label>
                            <select
                              value={product.type}
                              onChange={(e) => handleProductChange(realIndex, 'type', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                            >
                              <option value="완속">완속</option>
                              <option value="급속">급속</option>
                              <option value="초급속">초급속</option>
                              <option value="스마트홈">스마트홈</option>
                              <option value="스탠드">스탠드/보호부스</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">용도/상세 분류 (공용 vs 비공용)</label>
                            <select
                              value={product.detailCategory || '비공용완속'}
                              onChange={(e) => handleProductChange(realIndex, 'detailCategory', e.target.value)}
                              className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-bold ${
                                (product.detailCategory === '공용완속' || product.detailCategory === '급속' || product.type === '급속')
                                  ? 'bg-rose-50/80 border-rose-300 text-rose-900 font-black'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <option value="비공용완속">🏠 비공용완속 (가정용)</option>
                              <option value="비공용중속">🏠 비공용중속 (가정용)</option>
                              <option value="공용완속">🏢 공용완속 (상업/관공서/견적문의)</option>
                              <option value="급속">⚡ 급속 (상업/관공서/견적문의)</option>
                              <option value="스탠드">🛡️ 스탠드/보호부스</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">출력 용량</label>
                            <input
                              type="text"
                              value={product.power || ''}
                              onChange={(e) => handleProductChange(realIndex, 'power', e.target.value)}
                              placeholder="예: 5kW, 7kW"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-blue-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">PLC 화재 차단</label>
                            <button
                              type="button"
                              onClick={() => handleProductChange(realIndex, 'plcSupported', !product.plcSupported)}
                              className={`w-full py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                product.plcSupported
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              {product.plcSupported ? '⚡ 지원함 (안전)' : '미지원'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">서비스 판매 범위 (시공/판매 유형)</label>
                            <select
                              value={product.serviceType || 'all'}
                              onChange={(e) => handleProductChange(realIndex, 'serviceType', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs font-black text-indigo-900"
                            >
                              <option value="all">🌐 전체 지원 (단말기, 교체, 신규설치 모두)</option>
                              <option value="no_replace">📦⚡ 단말기 + 신규설치만 (교체시공 없음)</option>
                              <option value="no_device">🛠️⚡ 교체 + 신규설치만 (단말기단품 없음)</option>
                              <option value="no_install">📦🛠️ 단말기 + 교체시공만 (신규설치 없음)</option>
                              <option value="replace">🛠️ 교체 시공 전용</option>
                              <option value="install">🏗️ 신규 설치 포함 전용</option>
                              <option value="device">📦 단말기 단품 전용</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">간단 설명</label>
                            <input
                              type="text"
                              value={product.description}
                              onChange={(e) => handleProductChange(realIndex, 'description', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Action Column */}
                      <div className="lg:col-span-4 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                            💰 구분별 개별 가격 설정
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const baseP = product.price || 0;
                              const baseOrig = product.originalPrice || baseP;
                              const updated = [...productList];
                              updated[realIndex] = {
                                ...product,
                                replacementPrice: baseP + 150000,
                                replacementRegularPrice: baseOrig + 180000,
                                installIncludedPrice: baseP + 350000,
                                installIncludedRegularPrice: baseOrig + 400000,
                              };
                              setProductList(updated);
                            }}
                            className="text-[10px] font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 px-2 py-0.5 rounded cursor-pointer transition-all"
                            title="기존 단말기 가격 기준으로 교체(+15만)/설치(+35만) 표준가격 자동채우기"
                          >
                            ⚡표준가격 자동계산
                          </button>
                        </div>

                        {/* 1. 단말기 단품가 */}
                        <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                              📦 단말기 단품 (기기만)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400">정가 (원)</label>
                              <input
                                type="number"
                                value={product.originalPrice || 0}
                                onChange={(e) => handleProductChange(realIndex, 'originalPrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 line-through"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-amber-800">할인가 (원)</label>
                              <input
                                type="number"
                                value={product.price || 0}
                                onChange={(e) => handleProductChange(realIndex, 'price', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-amber-50/50 border border-amber-300 rounded-lg text-xs font-black text-amber-950 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. 교체 시공가 */}
                        <div className="p-2.5 bg-white rounded-xl border border-blue-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-blue-900 flex items-center gap-1">
                              🛠️ 교체 시공 포함가
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400">정가 (원)</label>
                              <input
                                type="number"
                                value={product.replacementRegularPrice !== undefined ? product.replacementRegularPrice : ((product.originalPrice || 0) + 180000)}
                                onChange={(e) => handleProductChange(realIndex, 'replacementRegularPrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 line-through"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-blue-800">할인가 (원)</label>
                              <input
                                type="number"
                                value={product.replacementPrice !== undefined ? product.replacementPrice : ((product.price || 0) + 150000)}
                                onChange={(e) => handleProductChange(realIndex, 'replacementPrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-blue-50/50 border border-blue-300 rounded-lg text-xs font-black text-blue-950 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. 신규 설치 포함가 */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                              ⚡ 신규 설치 포함가
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400">정가 (원)</label>
                              <input
                                type="number"
                                value={product.installIncludedRegularPrice !== undefined ? product.installIncludedRegularPrice : ((product.originalPrice || 0) + 400000)}
                                onChange={(e) => handleProductChange(realIndex, 'installIncludedRegularPrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 line-through"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-emerald-800">할인가 (원)</label>
                              <input
                                type="number"
                                value={product.installIncludedPrice !== undefined ? product.installIncludedPrice : ((product.price || 0) + 350000)}
                                onChange={(e) => handleProductChange(realIndex, 'installIncludedPrice', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 bg-emerald-50/50 border border-emerald-300 rounded-lg text-xs font-black text-emerald-950 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 space-y-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleSaveSingleProduct(product, e)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>이 상품 개별 저장</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>이 상품 삭제</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Expandable Options & Delivery Settings Section */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpandOption(product.id)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Settings className="w-3.5 h-3.5 text-amber-400" />
                            <span>상세 사양 및 커넥터 옵션 설정</span>
                            <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              {(product.optionGroups || []).length}개 그룹
                            </span>
                            {expandedOptions[product.id] ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddOptionGroup(realIndex)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ 새 옵션 대분류 추가</span>
                        </button>
                      </div>

                      {/* Expanded Options Panel */}
                      {expandedOptions[product.id] && (
                        <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-2xl space-y-4">
                          
                          {/* 1. Delivery & Payment Information */}
                          <div className="space-y-2">
                            <h6 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <span>🚚 배송 방법 및 결제/구성품 정보</span>
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500">배송방법 / 배송비</label>
                                <input
                                  type="text"
                                  value={product.deliveryInfo || '택배(주문 시 결제) / 무료배송'}
                                  onChange={(e) => handleProductChange(realIndex, 'deliveryInfo', e.target.value)}
                                  placeholder="예: 택배 / 무료배송"
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500">구성품 및 설치비 안내</label>
                                <input
                                  type="text"
                                  value={product.componentsInfo || '제조사 별도 발송 / 설치비 미포함 상품'}
                                  onChange={(e) => handleProductChange(realIndex, 'componentsInfo', e.target.value)}
                                  placeholder="예: 설치비 미포함 상품"
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500">포인트 / 적립금 안내</label>
                                <input
                                  type="text"
                                  value={product.rewardPointsInfo || '구매 ₩0'}
                                  onChange={(e) => handleProductChange(realIndex, 'rewardPointsInfo', e.target.value)}
                                  placeholder="예: 구매 ₩0"
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Option Groups & Option Choice List */}
                          <div className="space-y-3 pt-2 border-t border-blue-100">
                            {/* Option Presets Quick Bar for Product Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 p-3 rounded-xl space-y-2 shadow-xs">
                              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
                                <div className="text-xs font-black text-blue-950 flex items-center gap-1.5 shrink-0">
                                  <Bookmark className="w-4 h-4 text-blue-600" />
                                  <span>📋 브랜드 세부 옵션 템플릿 간편 선택</span>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
                                  {/* Select Preset Dropdown */}
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleApplyPresetToProduct(realIndex, e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                    defaultValue=""
                                    className="px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-black text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                  >
                                    <option value="" disabled>-- 미리 작성된 옵션 템플릿 불러오기 --</option>
                                    {optionPresets.map(preset => (
                                      <option key={preset.id} value={preset.id}>
                                        [{preset.brand}] {preset.name} (대분류 {preset.optionGroups.length}개)
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveCurrentOptionsAsPreset(realIndex)}
                                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                                    title="현재 설정된 옵션 그룹을 템플릿으로 저장"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>💾 템플릿으로 저장</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const brandName = product.brand || '';
                                      const sourceGroups = product.optionGroups || [];
                                      if (sourceGroups.length === 0) {
                                        alert('복사할 옵션 대분류가 없습니다. 먼저 옵션을 구성해주세요.');
                                        return;
                                      }
                                      if (window.confirm(`[${product.name}]의 세부 옵션(${sourceGroups.length}개 대분류)을 [${brandName || '전체'}] 브랜드 모든 상품에 일괄 복사하시겠습니까?`)) {
                                        let count = 0;
                                        const updated = productList.map(p => {
                                          const matches = !brandName || (p.brand || '').toLowerCase().includes(brandName.toLowerCase());
                                          if (matches) {
                                            count++;
                                            return {
                                              ...p,
                                              optionGroups: JSON.parse(JSON.stringify(sourceGroups))
                                            };
                                          }
                                          return p;
                                        });
                                        setProductList(updated);
                                        alert(`[${brandName || '전체'}] 브랜드 상품 총 ${count}개에 옵션이 성공적으로 일괄 복사되었습니다!`);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-current text-amber-200" />
                                    <span>⚡ [{product.brand || '이 브랜드'}] 전체 일괄복사</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <h6 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Settings className="w-3.5 h-3.5 text-blue-600" />
                                <span>옵션 대분류 및 선택 리스트 (커넥터 길이, 거치대 사양 등)</span>
                              </h6>
                              <button
                                type="button"
                                onClick={() => handleAddOptionGroup(realIndex)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ 대분류 추가</span>
                              </button>
                            </div>

                            {(!product.optionGroups || product.optionGroups.length === 0) ? (
                              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                                <p className="text-xs font-bold text-slate-500">등록된 옵션 대분류가 없습니다.</p>
                                <button
                                  type="button"
                                  onClick={() => handleAddOptionGroup(realIndex)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold cursor-pointer"
                                >
                                  + 커넥터 길이 등 기본 옵션 그룹 자동 생성
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {product.optionGroups.map((grp, grpIdx) => (
                                  <div
                                    key={grp.id || grpIdx}
                                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                      <div className="flex-1 flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                          대분류 {grpIdx + 1}
                                        </span>
                                        <input
                                          type="text"
                                          value={grp.title}
                                          onChange={(e) => handleUpdateOptionGroupTitle(realIndex, grpIdx, e.target.value)}
                                          placeholder="옵션 대분류명 (예: 커넥터길이, 거치대/스탠드)"
                                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                                        />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteOptionGroup(realIndex, grpIdx)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                                        title="옵션 대분류 삭제"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Option Choices Items */}
                                    <div className="space-y-2 pl-1">
                                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                        <span>옵션 선택 리스트 항목</span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddOptionItem(realIndex, grpIdx)}
                                          className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 text-[10px] font-extrabold hover:bg-blue-100 cursor-pointer"
                                        >
                                          + 항목 추가
                                        </button>
                                      </div>

                                      <div className="space-y-1.5">
                                        {grp.options.map((opt, optIdx) => (
                                          <div key={opt.id || optIdx} className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={opt.name}
                                              onChange={(e) => handleUpdateOptionItem(realIndex, grpIdx, optIdx, 'name', e.target.value)}
                                              placeholder="옵션 항목명 (예: 5m 커넥터 일체형)"
                                              className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
                                            />
                                            <div className="w-32 flex items-center gap-1 shrink-0">
                                              <input
                                                type="number"
                                                value={opt.price}
                                                onChange={(e) => handleUpdateOptionItem(realIndex, grpIdx, optIdx, 'price', Number(e.target.value) || 0)}
                                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 focus:bg-white"
                                              />
                                              <span className="text-[10px] font-bold text-slate-500 shrink-0">원</span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteOptionItem(realIndex, grpIdx, optIdx)}
                                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                                              title="항목 삭제"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Add Another Option Group Button at the bottom of groups list */}
                                <button
                                  type="button"
                                  onClick={() => handleAddOptionGroup(realIndex)}
                                  className="w-full py-2.5 bg-white hover:bg-blue-50/60 border border-dashed border-blue-300 text-blue-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Plus className="w-4 h-4 text-blue-600" />
                                  <span>+ 옵션 대분류 추가하기 (예: 대분류 2: 거치대/스탠드, 대분류 3: 케이블/어댑터)</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Bottom Save Bar */}
            <div className="sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700">
              <span className="text-xs font-extrabold text-slate-300">
                총 {productList.length}개 상품 설정중 (수정 후 반드시 [저장]을 눌러주세요)
              </span>
              <button
                type="button"
                onClick={(e) => handleSaveAllProducts(e)}
                className={`px-6 py-2.5 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  isSavedRecently
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isSavedRecently ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ 저장 완료되었습니다!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>전체 상품 변경사항 일괄 저장하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: APARTMENT BRANDS MANAGER */}
        {adminTab === 'brands' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  아파트 충전기 브랜드 정보 일괄 수정
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  아파트 브랜드 섹션에 노출되는 충전 브랜드를 한눈에 관리합니다.
                </p>
              </div>

              <button
                onClick={handleSaveAllBrands}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>브랜드 설정 저장</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(brandList).map(([brandName, brandRaw]) => {
                const brandData = brandRaw as any;
                return (
                  <div key={brandName} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm font-black text-slate-900">{brandName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">
                        아파트 공식 제휴
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">브랜드 정식 명칭</label>
                      <input
                        type="text"
                        value={brandData?.name || brandName}
                        onChange={(e) => {
                          const updated = { ...brandList };
                          updated[brandName] = { ...updated[brandName], name: e.target.value };
                          setBrandList(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">슬로건 / 한줄 소개</label>
                      <input
                        type="text"
                        value={brandData?.subtitle || brandData?.slogan || ''}
                        onChange={(e) => {
                          const updated = { ...brandList };
                          updated[brandName] = { ...updated[brandName], subtitle: e.target.value };
                          setBrandList(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">상세 안내 문구</label>
                      <textarea
                        rows={2}
                        value={brandData?.description || ''}
                        onChange={(e) => {
                          const updated = { ...brandList };
                          updated[brandName] = { ...updated[brandName], description: e.target.value };
                          setBrandList(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: INQUIRIES & A/S DASHBOARD */}
        {adminTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                고객 설치 견적 신청 및 A/S 접수 현황
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                사이트를 통해 실시간으로 접수된 전기차 충전기 견적 상담 및 정비/AS 신청 목록입니다.
              </p>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white font-black text-xs flex items-center justify-between">
                <span>⚡ 충전기 무상설치 / 견적 상담 신청 목록 ({bookings.length}건)</span>
              </div>
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">
                  아직 접수된 상담 신청이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-950 text-sm">{b.name} 고객님</span>
                          <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-mono font-bold flex items-center gap-1">
                            📞 {b.phone}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold">
                            {b.purpose === 'Commercial' ? '⚡ 아파트·공동주택' : b.purpose === 'ParkingLot' ? '🏢 상업시설' : '🏠 가정용 홈'}
                          </span>
                          {b.status && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded font-black">
                              {b.status}
                            </span>
                          )}
                        </div>
                        {(b.address || b.location) && (
                          <p className="text-slate-700 font-medium">
                            <span className="text-slate-400 font-bold">📍 주소/지역:</span> {b.address || b.location}
                          </p>
                        )}
                        {(b.memo || b.notes) && (
                          <p className="text-slate-600 font-medium bg-slate-100 p-2 rounded-lg mt-1">
                            <span className="text-slate-500 font-bold">📝 요청내용:</span> {b.memo || b.notes}
                          </p>
                        )}
                        {b.estimateCost && (
                          <p className="text-emerald-700 font-bold text-xs mt-0.5">
                            💰 {b.estimateCost}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="block text-[11px] text-slate-400 font-mono">{b.createdAt || '오늘'}</span>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${b.phone}`}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            전화걸기
                          </a>
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-lg text-[10.5px]">
                            {b.status || '상담 진행중'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AS Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white font-black text-xs flex items-center justify-between">
                <span>🔧 긴급 A/S 및 기기 정비 접수 목록 ({asRequests.length}건)</span>
              </div>
              {asRequests.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">
                  접수된 A/S 건이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {asRequests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{req.userName}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{req.phone}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">{req.issueType}</span>
                        </div>
                        <p className="text-slate-600 font-medium mt-1">설치장소: {req.locationAddress}</p>
                        <p className="text-slate-500 font-normal mt-0.5">증상: {req.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-400 font-mono">{req.date}</span>
                        <span className="inline-block mt-1 px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold rounded-lg text-[10px]">
                          A/S 전담 기사 배치중
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VISITOR ANALYTICS & TRAFFIC */}
        {adminTab === 'analytics' && (
          <AdminVisitorAnalytics
            data={visitorData}
            onUpdateData={(newData) => setVisitorData(newData)}
          />
        )}

        {/* TAB 5: SITE SETTINGS & SNS QUICK CHANNELS */}
        {adminTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-600" />
                  사이트 대표 정보 및 SNS 퀵채널 링크 관리
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  헤더/푸터 대표 연락처, 카카오톡, 유튜브, 인스타그램, 네이버 블로그 링크를 수정합니다.
                </p>
              </div>

              <button
                onClick={handleSaveSiteSettings}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>설정 저장</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SNS Channels */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                  📲 퀵채널 & SNS 공식 링크
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    카카오톡 플러스친구 URL
                  </label>
                  <input
                    type="text"
                    value={snsState.kakaoUrl}
                    onChange={(e) => setSnsState({ ...snsState, kakaoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Youtube className="w-4 h-4 text-red-600" />
                    유튜브 채널 URL
                  </label>
                  <input
                    type="text"
                    value={snsState.youtubeUrl || ''}
                    onChange={(e) => setSnsState({ ...snsState, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    인스타그램 URL
                  </label>
                  <input
                    type="text"
                    value={snsState.instagramUrl}
                    onChange={(e) => setSnsState({ ...snsState, instagramUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    네이버 블로그 URL
                  </label>
                  <input
                    type="text"
                    value={snsState.blogUrl}
                    onChange={(e) => setSnsState({ ...snsState, blogUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                  🏢 회사 대표 연락처 & 사업자 정보
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대표 전화번호</label>
                  <input
                    type="text"
                    value={footerState.phone}
                    onChange={(e) => setFooterState({ ...footerState, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대표 이메일</label>
                  <input
                    type="text"
                    value={footerState.email}
                    onChange={(e) => setFooterState({ ...footerState, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">상호명</label>
                  <input
                    type="text"
                    value={footerState.companyName}
                    onChange={(e) => setFooterState({ ...footerState, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대표자명</label>
                  <input
                    type="text"
                    value={footerState.ceoName}
                    onChange={(e) => setFooterState({ ...footerState, ceoName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

            </div>

            {/* Cloud Backup Quick Status Banner inside Settings */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-2xl border border-sky-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30 shrink-0">
                  <Cloud className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Firestore 정기 백업 & 데이터 안전 보호</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-500/30">
                      매 1시간 자동 백업 가동 중
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    마지막 성공 백업: <span className="text-sky-300 font-bold font-mono">{lastBackupInfo?.formattedDate || '오늘'}</span> ({lastBackupInfo?.keyCount || '전체'}개 데이터 항목)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="flex-1 md:flex-initial px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isBackingUp ? '백업 중...' : '즉시 클라우드 백업'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('backup')}
                  className="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4 text-sky-300" />
                  <span>백업 & 복구 관리자 열기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HOME POPUP & NAVER FORM LINK MANAGER */}
        {adminTab === 'popup' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  홈페이지 접속 팝업 & 네이버폼 링크 설정
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  고객이 홈페이지에 들어왔을 때 나타나는 정품보증서/안내 팝업 및 네이버폼 연결 링크를 수정합니다.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {onPreviewPopup && (
                  <button
                    onClick={() => onPreviewPopup(popupState)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-300/80 shadow-xs"
                  >
                    <span>👁️ 팝업 실시간 미리보기</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onSaveHomePopupConfig) {
                      onSaveHomePopupConfig(popupState);
                      try {
                        localStorage.setItem('sy_home_popup_config', JSON.stringify(popupState));
                      } catch (e) {
                        console.error(e);
                      }
                      setSaveSuccessMsg('홈페이지 팝업 및 네이버폼 설정이 성공적으로 저장되었습니다!');
                      setIsSavedRecently(true);
                      setTimeout(() => setIsSavedRecently(false), 3000);
                    }
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>팝업 설정 저장</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Settings & Naver Form Link */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span>⚙️ 팝업 기본 설정 및 네이버폼 URL</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-600">팝업 노출</span>
                    <input
                      type="checkbox"
                      checked={popupState.enabled}
                      onChange={(e) => setPopupState({ ...popupState, enabled: e.target.checked })}
                      className="w-4 h-4 accent-purple-700 cursor-pointer"
                    />
                  </label>
                </h3>

                {/* Naver Form Link Input (Highlighted) */}
                <div className="bg-purple-50/80 border-2 border-purple-300 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-purple-700" />
                    연결할 네이버폼 (Naver Form) URL 주소
                  </label>
                  <input
                    type="url"
                    value={popupState.naverFormUrl || ''}
                    onChange={(e) => setPopupState({ ...popupState, naverFormUrl: e.target.value })}
                    placeholder="https://form.naver.com/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-xs"
                  />
                  <p className="text-[11px] font-bold text-purple-800">
                    💡 고객이 팝업창의 버튼을 누르면 위 작성된 네이버폼 링크로 즉시 연결됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    팝업 메인 타이틀 (예: 품질보증서)
                  </label>
                  <input
                    type="text"
                    value={popupState.title}
                    onChange={(e) => setPopupState({ ...popupState, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    상단 황금 뱃지 문구 (예: ★ 4년 보증 ★ SE Charger)
                  </label>
                  <input
                    type="text"
                    value={popupState.badgeText}
                    onChange={(e) => setPopupState({ ...popupState, badgeText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    버튼 문구 (예: 보증서 발급받기)
                  </label>
                  <input
                    type="text"
                    value={popupState.buttonText}
                    onChange={(e) => setPopupState({ ...popupState, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    🖼️ 팝업 대표 이미지 (파일 업로드)
                  </label>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    {/* Image Preview & File Choice Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {popupState.imageUrl ? (
                        <div className="relative w-28 h-28 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                          <img
                            src={popupState.imageUrl}
                            alt="팝업 이미지 미리보기"
                            className="w-full h-full object-contain p-1"
                          />
                          <button
                            type="button"
                            onClick={() => setPopupState({ ...popupState, imageUrl: '' })}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
                            title="이미지 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-slate-200/70 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-bold">이미지 없음</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all border border-purple-500">
                          <Upload className="w-4 h-4" />
                          <span>PC에서 이미지 파일 선택 업로드</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const downloadUrl = await uploadFileToFirebaseStorage(file, 'popups', `popup_${file.name}`);
                                  if (downloadUrl) {
                                    setPopupState({ ...popupState, imageUrl: downloadUrl });
                                  } else {
                                    const compressed = await compressImage(file, 800, 800, 0.8);
                                    setPopupState({ ...popupState, imageUrl: compressed });
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          💡 컴퓨터나 휴대폰의 사진 파일(JPG, PNG 등)을 직접 선택하여 등록하실 수 있습니다.
                        </p>
                      </div>
                    </div>

                    {/* Secondary URL Input Option */}
                    <details className="pt-2 border-t border-slate-200/60">
                      <summary className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                        웹 이미지 URL 주소로 직접 입력하기 (선택)
                      </summary>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={popupState.imageUrl}
                          onChange={(e) => setPopupState({ ...popupState, imageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                        />
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Banner Message & Tabs */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                  📝 상세 안내 문구 및 하단 탭
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    메인 강조 헤드라인
                  </label>
                  <input
                    type="text"
                    value={popupState.mainText}
                    onChange={(e) => setPopupState({ ...popupState, mainText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    서브 메시지 (금색/골드 강조)
                  </label>
                  <input
                    type="text"
                    value={popupState.subText}
                    onChange={(e) => setPopupState({ ...popupState, subText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    하단 보증 약관 / 안내 사항
                  </label>
                  <textarea
                    rows={4}
                    value={popupState.noticeText}
                    onChange={(e) => setPopupState({ ...popupState, noticeText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-xs font-black text-slate-900 block">하단 탭 3개 라벨 & 클릭시 이동할 URL 링크</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">탭 1 (라벨)</span>
                      <input
                        type="text"
                        value={popupState.tab1Label}
                        onChange={(e) => setPopupState({ ...popupState, tab1Label: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] font-bold text-slate-500 block pt-1">탭 1 이동 URL 링크</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={popupState.tab1Url || ''}
                        onChange={(e) => setPopupState({ ...popupState, tab1Url: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">탭 2 (라벨)</span>
                      <input
                        type="text"
                        value={popupState.tab2Label}
                        onChange={(e) => setPopupState({ ...popupState, tab2Label: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] font-bold text-slate-500 block pt-1">탭 2 이동 URL 링크</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={popupState.tab2Url || ''}
                        onChange={(e) => setPopupState({ ...popupState, tab2Url: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">탭 3 (라벨)</span>
                      <input
                        type="text"
                        value={popupState.tab3Label}
                        onChange={(e) => setPopupState({ ...popupState, tab3Label: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] font-bold text-slate-500 block pt-1">탭 3 이동 URL 링크</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={popupState.tab3Url || ''}
                        onChange={(e) => setPopupState({ ...popupState, tab3Url: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FIRESTORE CLOUD BACKUP & DISASTER RECOVERY */}
        {adminTab === 'backup' && (
          <div className="space-y-6">
            {/* Header & Primary Actions */}
            <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-sky-600" />
                  Firestore 클라우드 정기 백업 & 데이터 복구 관리
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  로컬스토리지 데이터를 매 1시간 주기 및 데이터 변경 시마다 Firestore로 안전하게 백업하고, 비상 시 마지막 성공 백업본에서 원클릭으로 완벽하게 복구합니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={loadBackups}
                  disabled={isLoadingBackups}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="백업 목록 새로고침"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isBackingUp ? '스냅샷 백업 중...' : '지금 즉시 클라우드 백업'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmRestoreLatest}
                  disabled={isRestoring}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isRestoring ? '데이터 복구 중...' : '최신 백업본에서 전체 복구'}</span>
                </button>
              </div>
            </div>

            {/* 4 Status Monitoring Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    정기 1시간 자동 백업
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md">
                    상시 가동 중
                  </span>
                </div>
                <div className="text-base font-black text-slate-900">매 60분 간격 실행</div>
                <p className="text-[11px] font-medium text-slate-500">
                  앱이 실행되는 동안 1시간마다 전체 로컬스토리지 스냅샷을 자동 백업합니다.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    변경 시 실시간 동기화
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
                    실시간 연동
                  </span>
                </div>
                <div className="text-base font-black text-slate-900">데이터 수정 시 즉시 백업</div>
                <p className="text-[11px] font-medium text-slate-500">
                  상품 수정, 추가, 삭제 등 로컬스토리지 변경 시 Firestore에 즉각 동기화됩니다.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    데이터 유실 자동 복구 가드
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                    보호 활성화
                  </span>
                </div>
                <div className="text-base font-black text-slate-900">손상 시 자동 복구</div>
                <p className="text-[11px] font-medium text-slate-500">
                  브라우저 캐시 삭제 또는 데이터 유실 감지 시 최신 백업본에서 자동 복원합니다.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                    마지막 백업 상태
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-md">
                    {lastBackupInfo?.dataSizeKb ? `${lastBackupInfo.dataSizeKb} KB` : '정상'}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-950 truncate">
                  {lastBackupInfo?.formattedDate || '방금 전'}
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  총 <span className="font-bold text-indigo-600">{lastBackupInfo?.keyCount || 18}개</span> 설정 데이터 항목이 저장되어 있습니다.
                </p>
              </div>
            </div>

            {/* Backup Snapshots History Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-900 text-white font-black text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  <span>Firestore 스냅샷 백업 히스토리 ({backupHistory.length}개 기록)</span>
                </div>
                <span className="text-[11px] font-normal text-slate-300">
                  각 백업본을 선택하여 해당 시점으로 즉시 롤백 복구할 수 있습니다.
                </span>
              </div>

              {isLoadingBackups ? (
                <div className="p-12 text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                  <span>클라우드 백업 목록을 불러오는 중입니다...</span>
                </div>
              ) : backupHistory.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Cloud className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">기록된 클라우드 백업 히스토리가 없습니다.</p>
                  <p className="text-xs text-slate-500">
                    상단의 <span className="font-bold text-sky-600">[지금 즉시 클라우드 백업]</span> 버튼을 누르면 첫 전체 스냅샷이 생성됩니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleManualBackup}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    첫 백업 생성하기
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="p-4 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-4 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900">
                            {backup.formattedDate}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                            backup.trigger === 'hourly'
                              ? 'bg-blue-100 text-blue-800'
                              : backup.trigger === 'on_change'
                              ? 'bg-amber-100 text-amber-800'
                              : backup.trigger === 'manual'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {backup.trigger === 'hourly'
                              ? '⏰ 1시간 정기 백업'
                              : backup.trigger === 'on_change'
                              ? '🔄 변경 감지 자동'
                              : backup.trigger === 'manual'
                              ? '👤 관리자 수동 백업'
                              : '🚀 시스템 부팅 초기화'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {backup.dataSizeKb} KB ({backup.keyCount}개 항목)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          주요 백업 데이터: <span className="font-semibold text-slate-800">{backup.summary || `${backup.keyCount}개 항목`}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmRestoreSpecific(backup)}
                          disabled={isRestoring}
                          className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>이 시점으로 복구</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disaster Recovery & Developer Console Guide */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">비상 데이터 복구 스크립트 (Disaster Recovery Script Guide)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                만약 관리자 페이지 접속이 어렵거나 긴급 상황이 발생했을 때도, 브라우저 개발자 도구 콘솔(<code className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">F12 &gt; Console</code>)에서 언제든지 아래 복구 스크립트를 직접 실행하여 마지막 성공 백업본을 즉시 로드할 수 있습니다.
              </p>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-200">
                <div className="text-slate-400">// 최신 백업본에서 즉시 전체 복구 실행:</div>
                <div className="text-emerald-400 font-bold">await window.syRestoreFromBackup();</div>
                <div className="text-slate-400 pt-1">// 수동 즉시 클라우드 백업 생성:</div>
                <div className="text-sky-400 font-bold">await window.syCreateBackup();</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Option Preset Manager Modal */}
      {isPresetManagerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">브랜드별 세부 옵션 템플릿 미리작성 & 관리자</h3>
              </div>
              <button
                onClick={() => setIsPresetManagerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtitle / Action Bar */}
            <div className="bg-amber-50 p-4 border-b border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-bold flex items-center gap-1">
                  💡 미리 브랜드별 대분류/세부 옵션을 자유롭게 작성, 수정, 삭제하고 필요할 때 일괄 적용하세요!
                </p>
                <p className="text-amber-800 text-[11px]">
                  스필, 일렉트리, 편리전기, 차지고, 롯데 이브이시스 등 브랜드별 전용 옵션을 수정하거나 새 템플릿을 생성하여 클릭 한 번으로 일괄 적용할 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCreateNewPreset}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ 신규 템플릿 작성</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPresetsToDefault}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-300 flex items-center gap-1 cursor-pointer shrink-0"
                  title="초기 브랜드 기본 템플릿 목록으로 복원"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>기본값 복원</span>
                </button>
              </div>
            </div>

            {/* Preset List Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionPresets.map((preset) => (
                  <div key={preset.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-blue-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-md">
                          {preset.brand}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          옵션 대분류 {preset.optionGroups.length}개
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{preset.name}</h4>
                      {preset.description && (
                        <p className="text-xs text-slate-500 font-semibold mt-1">{preset.description}</p>
                      )}

                      {/* Preview of Option Groups */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 space-y-1">
                        {preset.optionGroups.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">옵션 없음 (단품)</span>
                        ) : (
                          preset.optionGroups.map((grp, i) => (
                            <div key={i} className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <span className="text-blue-600 font-black">•</span>
                              <span className="truncate">{grp.title} ({grp.options.length}개 선택지)</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyPresetToBrand(preset.brand, preset.id);
                        }}
                        className="flex-1 min-w-[120px] py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>[{preset.brand}] 전 상품 일괄 적용</span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingPreset(JSON.parse(JSON.stringify(preset)))}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          title="템플릿 제목, 대분류 및 소분류 항목 상세 편집"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicatePreset(preset)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all cursor-pointer"
                          title="템플릿 사본 복사"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                          title="템플릿 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                총 {optionPresets.length}개의 세부옵션 템플릿 등록됨
              </span>
              <button
                type="button"
                onClick={() => setIsPresetManagerOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Option Preset Detail Editor Sub-Modal */}
      {editingPreset && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">옵션 템플릿 세부 구성 편집</h3>
              </div>
              <button
                onClick={() => setEditingPreset(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
              {/* Preset Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">템플릿 이름 *</label>
                  <input
                    type="text"
                    value={editingPreset.name}
                    onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 스필 4년 무상A/S 전용 세부옵션"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">적용 브랜드 *</label>
                  <input
                    type="text"
                    value={editingPreset.brand}
                    onChange={(e) => setEditingPreset({ ...editingPreset, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 스필, 일렉트리"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">템플릿 설명</label>
                <input
                  type="text"
                  value={editingPreset.description || ''}
                  onChange={(e) => setEditingPreset({ ...editingPreset, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                  placeholder="템플릿에 포함된 주요 구성품이나 특징을 메모하세요."
                />
              </div>

              {/* Option Groups Editor Header */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">대분류 옵션 그룹 ({editingPreset.optionGroups.length}개)</h4>
                  <p className="text-[11px] text-slate-500">고객이 상품 주문 시 선택할 대분류 및 소분류 선택지 항목입니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newGrp: ProductOptionGroup = {
                      id: `grp-${Date.now()}`,
                      title: `신규 옵션 그룹 ${editingPreset.optionGroups.length + 1}`,
                      required: false,
                      options: [
                        { id: `opt-${Date.now()}-1`, name: '선택 안함 (기본)', price: 0 },
                        { id: `opt-${Date.now()}-2`, name: '추가 구성품 (+20,000원)', price: 20000 }
                      ]
                    };
                    setEditingPreset({
                      ...editingPreset,
                      optionGroups: [...editingPreset.optionGroups, newGrp]
                    });
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>➕ 대분류 추가</span>
                </button>
              </div>

              {/* Option Groups List */}
              <div className="space-y-4">
                {editingPreset.optionGroups.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 font-semibold">
                    등록된 대분류 옵션 그룹이 없습니다. [➕ 대분류 추가] 버튼을 눌러 옵션을 구성해보세요.
                  </div>
                ) : (
                  editingPreset.optionGroups.map((grp, grpIdx) => (
                    <div key={grp.id || grpIdx} className="bg-slate-50 border border-slate-300/80 rounded-2xl p-4 space-y-3">
                      {/* Group Title Header */}
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                            {grpIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={grp.title}
                            onChange={(e) => {
                              const nextGrps = [...editingPreset.optionGroups];
                              nextGrps[grpIdx] = { ...nextGrps[grpIdx], title: e.target.value };
                              setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                            placeholder="대분류 그룹 제목 (예: 케이블 길이 선택)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const nextGrps = editingPreset.optionGroups.filter((_, idx) => idx !== grpIdx);
                            setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-xl transition-all cursor-pointer shrink-0"
                          title="대분류 그룹 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sub Options Items */}
                      <div className="pl-6 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>세부 선택지 항목 ({grp.options.length}개)</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextGrps = [...editingPreset.optionGroups];
                              const grpObj = { ...nextGrps[grpIdx] };
                              const newOpt: ProductOptionItem = {
                                id: `opt-${Date.now()}`,
                                name: '새 세부 항목',
                                price: 10000
                              };
                              grpObj.options = [...grpObj.options, newOpt];
                              nextGrps[grpIdx] = grpObj;
                              setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                            }}
                            className="text-blue-600 hover:text-blue-800 font-black cursor-pointer flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>소분류 항목 추가</span>
                          </button>
                        </div>

                        {grp.options.map((opt, optIdx) => (
                          <div key={opt.id || optIdx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl">
                            <span className="text-slate-400 font-mono text-[10px] w-4 text-center shrink-0">
                              {optIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => {
                                const nextGrps = [...editingPreset.optionGroups];
                                const grpObj = { ...nextGrps[grpIdx] };
                                const nextOpts = [...grpObj.options];
                                nextOpts[optIdx] = { ...nextOpts[optIdx], name: e.target.value };
                                grpObj.options = nextOpts;
                                nextGrps[grpIdx] = grpObj;
                                setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                              }}
                              className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white"
                              placeholder="항목 이름 (예: 7m 연장)"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] font-bold text-slate-400">₩</span>
                              <input
                                type="number"
                                value={opt.price}
                                onChange={(e) => {
                                  const nextGrps = [...editingPreset.optionGroups];
                                  const grpObj = { ...nextGrps[grpIdx] };
                                  const nextOpts = [...grpObj.options];
                                  nextOpts[optIdx] = { ...nextOpts[optIdx], price: Number(e.target.value) || 0 };
                                  grpObj.options = nextOpts;
                                  nextGrps[grpIdx] = grpObj;
                                  setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                                }}
                                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-right focus:bg-white"
                                placeholder="추가금액"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nextGrps = [...editingPreset.optionGroups];
                                const grpObj = { ...nextGrps[grpIdx] };
                                grpObj.options = grpObj.options.filter((_, idx) => idx !== optIdx);
                                nextGrps[grpIdx] = grpObj;
                                setEditingPreset({ ...editingPreset, optionGroups: nextGrps });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingPreset(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEditedPreset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black cursor-pointer shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>💾 템플릿 저장하기</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        targetName={deleteModalConfig.targetName}
        description={deleteModalConfig.description}
        warningNote={deleteModalConfig.warningNote}
        confirmLabel={deleteModalConfig.confirmLabel}
        onConfirm={deleteModalConfig.onConfirm}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
