import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShoppingBag, 
  FileText, 
  Wrench, 
  LogOut, 
  Building, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Edit3, 
  ArrowLeft, 
  Camera, 
  Sparkles,
  CreditCard,
  Printer,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, CartItem, Booking, ASRequest, ActivePage } from '../types';

interface MyProfilePageProps {
  user: User | null;
  onLogout: () => void;
  cartItems: CartItem[];
  bookings: Booking[];
  asRequests?: ASRequest[];
  onPageChange: (page: ActivePage) => void;
  onOpenQuoteModal: () => void;
  isEditMode?: boolean;
  onUpdateUserProfileImage?: (newImage: string) => void;
  onUpdateUser?: (updatedUser: User) => void;
  onOpenAuthModal?: () => void;
}

export function MyProfilePage({
  user,
  onLogout,
  cartItems,
  bookings,
  asRequests = [],
  onPageChange,
  onOpenQuoteModal,
  isEditMode = false,
  onUpdateUserProfileImage,
  onUpdateUser,
  onOpenAuthModal
}: MyProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'cart' | 'as'>('profile');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editType, setEditType] = useState<'B2C' | 'B2B'>(user?.type || 'B2C');
  const [editCompanyName, setEditCompanyName] = useState(user?.companyName || '');
  const [editBusinessNumber, setEditBusinessNumber] = useState(user?.businessNumber || '');
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<Booking | null>(null);

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <UserIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          마이페이지 서비스를 이용하시려면 구글, 네이버 간편 로그인 또는 이메일 로그인을 진행해 주세요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onPageChange('home')}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-sm transition-all cursor-pointer"
          >
            홈으로 이동
          </button>
          <button
            onClick={onOpenAuthModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            로그인 / 회원가입
          </button>
        </div>
      </div>
    );
  }

  // Filter bookings for current user
  const myBookings = bookings.filter((b) => b.userId === user.id || b.name === user.name);
  const myAsRequests = asRequests.filter((a) => a.userId === user.id);

  // Social Login Provider Detection
  const getSocialProviderBadge = () => {
    if (user.isAdmin || user.role === 'admin' || user.email === 'sy.car.com@gmail.com') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          최고 관리자
        </span>
      );
    }
    if (user.id.includes('google')) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Google 계정 연동
        </span>
      );
    }
    if (user.id.includes('naver')) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Naver 계정 연동
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
        SY.com 정회원
      </span>
    );
  };

  const handleProfileImageChangeClick = () => {
    const fileInput = document.getElementById('myprofile-page-image-input');
    if (fileInput) fileInput.click();
  };

  const handleImageFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, JPEG)만 선택해 주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      onUpdateUserProfileImage?.(dataUrl);
      setProfileMessage('✅ 프로필 사진이 변경되었습니다!');
      setTimeout(() => setProfileMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageFileSelected(file);
          break;
        }
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50/70 pb-20"
      onPaste={handlePasteImage}
    >
      <input
        type="file"
        id="myprofile-page-image-input"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFileSelected(file);
        }}
      />

      {/* Top Breadcrumb & Title Section */}
      <div className="bg-slate-900 text-white pt-8 pb-14 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-4">
            <button 
              onClick={() => onPageChange('home')}
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>홈으로</span>
            </button>
            <span>/</span>
            <span className="text-emerald-400 font-extrabold">마이 프로필</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>마이 프로필</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                  My Profile Page
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                회원 프로필 정보, 전기차 충전기 설치 신청/견적 내역 및 장바구니 관리
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onPageChange('home');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8">
        {/* User Hero Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div 
              onClick={handleProfileImageChangeClick}
              className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-slate-100 flex items-center justify-center font-black text-2xl text-emerald-600 cursor-pointer group shrink-0 shadow-md"
              title="클릭하여 프로필 이미지 변경 (또는 이미지 클립보드 붙여넣기)"
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-9 h-9 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-black text-white text-center">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>사진 변경</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.name} 님</h2>
                <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase">
                  {user.type === 'B2B' ? '기업/법인 B2B' : '개인/아파트 B2C'}
                </span>
                {getSocialProviderBadge()}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 md:pt-0 md:border-0">
            {user.isAdmin && (
              <button
                onClick={() => onPageChange('admin')}
                className="flex-1 sm:flex-none px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-2xl text-xs shadow-md border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔧 관리자 대시보드</span>
              </button>
            )}
            <button
              onClick={onOpenQuoteModal}
              className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>새 설치 견적 신청</span>
            </button>
          </div>
        </div>

        {/* Dashboard Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => setActiveTab('bookings')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${activeTab === 'bookings' ? 'text-emerald-100' : 'text-slate-400'}`}>
                신청 / 견적 내역
              </span>
              <FileText className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black">{myBookings.length} <span className="text-xs font-bold">건</span></span>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-emerald-200' : 'text-slate-300'}`} />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('cart')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${activeTab === 'cart' ? 'text-emerald-100' : 'text-slate-400'}`}>
                장바구니 담은 상품
              </span>
              <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black">{cartItems.length} <span className="text-xs font-bold">개</span></span>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'cart' ? 'text-emerald-200' : 'text-slate-300'}`} />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('as')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'as'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${activeTab === 'as' ? 'text-emerald-100' : 'text-slate-400'}`}>
                A/S 및 고객문의
              </span>
              <Wrench className={`w-5 h-5 ${activeTab === 'as' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black">{myAsRequests.length} <span className="text-xs font-bold">건</span></span>
              <ChevronRight className={`w-4 h-4 ${activeTab === 'as' ? 'text-emerald-200' : 'text-slate-300'}`} />
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>회원 프로필 설정</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>신청 / 견적 내역 ({myBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`py-3 px-5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'cart'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>장바구니 ({cartItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('as')}
              className={`py-3 px-5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'as'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>A/S 및 문의 이력 ({myAsRequests.length})</span>
            </button>
          </div>

          {/* Tab 1: Profile & Account Settings */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 space-y-6">
              {profileMessage && (
                <div className={`p-4 rounded-2xl text-xs font-black shadow-xs ${
                  profileMessage.includes('🔒') || profileMessage.includes('⚠️') 
                    ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}>
                  {profileMessage}
                </div>
              )}

              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    기본 회원 상세 정보
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingInfo) {
                        if (!editName.trim()) return alert('이름을 입력해 주세요.');
                        const updated: User = { 
                          ...user, 
                          name: editName, 
                          email: editEmail,
                          type: editType,
                          companyName: editType === 'B2B' ? editCompanyName : undefined,
                          businessNumber: editType === 'B2B' ? editBusinessNumber : undefined
                        };
                        onUpdateUser?.(updated);
                        localStorage.setItem('sy_logged_user', JSON.stringify(updated));
                        setIsEditingInfo(false);
                        setProfileMessage('✅ 회원 정보가 성공적으로 변경되었습니다!');
                        setTimeout(() => setProfileMessage(null), 3000);
                      } else {
                        setEditName(user.name);
                        setEditEmail(user.email);
                        setEditType(user.type || 'B2C');
                        setEditCompanyName(user.companyName || '');
                        setEditBusinessNumber(user.businessNumber || '');
                        setIsEditingInfo(true);
                      }
                    }}
                    className="text-xs font-extrabold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingInfo ? '저장 완료' : '정보 수정'}</span>
                  </button>
                </div>

                {isEditingInfo ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-2">
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="text-slate-500 font-bold block text-[11px]">이름 / 담당자 수정</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="text-slate-500 font-bold block text-[11px]">이메일 주소 수정</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                      <label className="text-slate-500 font-bold block text-[11px]">회원 구분 선택</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as 'B2C' | 'B2B')}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="B2C">개인 / 아파트 (B2C)</option>
                        <option value="B2B">기업 / 법인 (B2B)</option>
                      </select>
                    </div>
                    {editType === 'B2B' && (
                      <>
                        <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                          <label className="text-slate-500 font-bold block text-[11px]">회사 / 법인명 입력</label>
                          <input
                            type="text"
                            placeholder="예: 에스와이(주)"
                            value={editCompanyName}
                            onChange={(e) => setEditCompanyName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                          <label className="text-slate-500 font-bold block text-[11px]">사업자 등록번호 입력</label>
                          <input
                            type="text"
                            placeholder="000-00-00000"
                            value={editBusinessNumber}
                            onChange={(e) => setEditBusinessNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">이름 / 담당자</span>
                      <p className="font-extrabold text-slate-900 text-sm">{user.name}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">이메일 주소</span>
                      <p className="font-extrabold text-slate-900 text-sm">{user.email}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">회원 구분</span>
                      <p className="font-extrabold text-emerald-700 text-sm">
                        {user.type === 'B2B' ? '기업/법인 (B2B)' : '개인/아파트 (B2C)'}
                      </p>
                    </div>
                    {user.companyName && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-slate-400 font-bold block text-[11px]">회사/법인명</span>
                        <p className="font-extrabold text-slate-900 text-sm">{user.companyName}</p>
                      </div>
                    )}
                    {user.businessNumber && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-slate-400 font-bold block text-[11px]">사업자 등록번호</span>
                        <p className="font-extrabold text-slate-900 text-sm">{user.businessNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connected Accounts & Security Info */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  계정 연동 및 보안
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                        G
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Google 계정</p>
                        <p className="text-[11px] text-slate-400">
                          {user.id.includes('google') ? '연동 완료됨' : '미연동'}
                        </p>
                      </div>
                    </div>
                    {user.id.includes('google') ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        연동중
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        미연동
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-black text-xs flex items-center justify-center">
                        N
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Naver 계정</p>
                        <p className="text-[11px] text-slate-400">
                          {user.id.includes('naver') ? '연동 완료됨' : '미연동'}
                        </p>
                      </div>
                    </div>
                    {user.id.includes('naver') ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        연동중
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        미연동
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Bookings & Quotes */}
          {activeTab === 'bookings' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">전기차 충전기 설치 / 견적 신청 내역</h3>
                  <p className="text-xs text-slate-500 mt-0.5">고객님이 신청하신 충전기 설치 견적 및 현장 조사 신청 현황입니다.</p>
                </div>
                <button
                  onClick={onOpenQuoteModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  + 견적 추가 신청
                </button>
              </div>

              {myBookings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-extrabold text-slate-700">접수된 설치 신청/견적 내역이 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">지금 바로 30초 간편 설치 견적을 신청해 보세요.</p>
                  <button
                    onClick={onOpenQuoteModal}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    무료 설치 견적 신청하기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((b) => (
                    <div key={b.id} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 hover:border-emerald-300 transition-all space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                            {b.purpose === 'Commercial' ? '아파트/공동주택' : b.purpose === 'ParkingLot' ? '상업시설/주차장' : '가정용/개인홈'}
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-bold">ID: {b.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-slate-500">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '최근 접수'}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full">
                            {b.status || '접수 완료'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold block">신청자명</span>
                          <p className="font-extrabold text-slate-900">{b.name} ({b.phone})</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">설치희망 주소</span>
                          <p className="font-extrabold text-slate-900 truncate">{b.location || '주소 미입력'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block">신청 구분</span>
                          <p className="font-extrabold text-slate-900">
                            {b.purpose === 'Residential' ? '가정용 홈' : b.purpose === 'Commercial' ? '아파트용' : '상업시설 수익형'}
                          </p>
                        </div>
                      </div>

                      {b.memo && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                          <span className="font-extrabold text-slate-800">요청 메모: </span>
                          {b.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Cart Items */}
          {activeTab === 'cart' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">장바구니 담은 상품 목록</h3>
                  <p className="text-xs text-slate-500 mt-0.5">현재 장바구니에 담겨 있는 충전기 및 옵션 상품입니다.</p>
                </div>
                <button
                  onClick={() => onPageChange('cart')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  장바구니 상세 페이지 이동 ➔
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-extrabold text-slate-700">장바구니에 담긴 상품이 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">SY.com의 최신 스마트 전기차 충전기 라인업을 둘러보세요.</p>
                  <button
                    onClick={() => onPageChange('products')}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    충전기 상품 둘러보기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-slate-200 shrink-0 bg-white flex items-center justify-center text-xl">
                            ⚡
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {item.power || '완속'} · {item.type || '충전기'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{item.name}</h4>
                          <p className="text-xs text-slate-500">수량: {item.quantity || 1}개</p>
                        </div>
                      </div>

                      <div className="text-right w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                        <p className="text-xs text-slate-400">금액</p>
                        <p className="font-black text-emerald-700 text-base">
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()} 원
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onPageChange('cart')}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      장바구니 무료 상담/신청 진행
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: AS & Support History */}
          {activeTab === 'as' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">A/S 및 1:1 고객지원 내역</h3>
                  <p className="text-xs text-slate-500 mt-0.5">전기차 충전기 유지보수 및 기술 지원 접수 내역입니다.</p>
                </div>
                <button
                  onClick={() => onPageChange('support')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  + A/S 문의 신청
                </button>
              </div>

              {myAsRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-extrabold text-slate-700">접수된 A/S 및 문의 내역이 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">충전기 장애나 유지보수가 필요하신 경우 언제든 접수해 주세요.</p>
                  <button
                    onClick={() => onPageChange('support')}
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    A/S 센터 이동
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAsRequests.map((a) => (
                    <div key={a.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-mono text-xs text-slate-400">ID: {a.id}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                          {a.status || '접수완료'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {a.productName} {a.serialNumber ? `(S/N: ${a.serialNumber})` : ''}
                      </h4>
                      <p className="text-xs text-slate-600">증상: {a.symptom}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
