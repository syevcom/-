import React, { useState } from 'react';
import { X, User as UserIcon, ShoppingBag, FileText, Wrench, LogOut, Building, Phone, Mail, Clock, CheckCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CartItem, Booking, ASRequest } from '../types';

interface MyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  cartItems: CartItem[];
  bookings: Booking[];
  asRequests?: ASRequest[];
  onOpenCartModal: () => void;
  onOpenQuoteModal: () => void;
  isEditMode?: boolean;
  onUpdateUserProfileImage?: (newImage: string) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export default function MyPageModal({
  isOpen,
  onClose,
  user,
  onLogout,
  cartItems,
  bookings,
  asRequests = [],
  onOpenCartModal,
  onOpenQuoteModal,
  isEditMode = false,
  onUpdateUserProfileImage,
  onUpdateUser,
}: MyPageModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'cart'>('profile');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  if (!isOpen || !user) return null;

  // Filter bookings for current user (matched by email/phone or all if not matched)
  const myBookings = bookings.filter((b) => b.userId === user.id || b.name === user.name);

  const handleProfileImageChangeClick = () => {
    if (!isEditMode) {
      setProfileMessage('🔒 프로필 이미지 변경은 관리자(Admin) 권한이 필요합니다. 상단 관리자 아이콘을 통해 관리자로 로그인해 주세요.');
      setTimeout(() => setProfileMessage(null), 4000);
      return;
    }

    // Trigger file picker if admin
    const fileInput = document.getElementById('mypage-profile-image-input');
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
      setProfileMessage('✅ 프로필 이미지가 성공적으로 변경되었습니다!');
      setTimeout(() => setProfileMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Handler for Profile Picture (Ctrl+V / Cmd+V)
  const handlePasteImage = (e: React.ClipboardEvent) => {
    if (!isEditMode) {
      setProfileMessage('🔒 프로필 이미지 변경은 관리자(Admin) 권한이 필요합니다.');
      setTimeout(() => setProfileMessage(null), 3000);
      return;
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onPaste={handlePasteImage}
    >
      <input
        type="file"
        id="mypage-profile-image-input"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFileSelected(file);
        }}
      />

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={handleProfileImageChangeClick}
              className={`relative w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 flex items-center justify-center font-bold text-lg cursor-pointer group ${
                user.profileImage ? 'bg-slate-800' : 'bg-emerald-500/20 text-emerald-400'
              }`}
              title={isEditMode ? '클릭하여 프로필 이미지 변경 (또는 Ctrl+V 캡처 이미지 붙여넣기)' : '프로필 이미지 (관리자 전용 변경)'}
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-black text-white text-center leading-tight">
                {isEditMode ? '사진 변경' : '🔒 관리자 전용'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg tracking-tight">{user.name} 님</h3>
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  {user.type === 'B2B' ? '기업/사업자 B2B' : '개인 B2C'}
                </span>
                {isEditMode && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                    Admin 관리자
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>내 계정 프로필</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-3 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>신청/견적 내역 ({myBookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`pb-3 px-3 font-extrabold text-xs transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cart'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>장바구니 ({cartItems.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {profileMessage && (
                <div className={`p-3 rounded-2xl text-xs font-black shadow-sm ${profileMessage.includes('🔒') || profileMessage.includes('⚠️') ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}>
                  {profileMessage}
                </div>
              )}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    기본 회원 정보
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingInfo) {
                        if (!editName.trim()) return alert('이름을 입력해 주세요.');
                        const updated = { ...user, name: editName, email: editEmail };
                        onUpdateUser?.(updated);
                        localStorage.setItem('sy_logged_user', JSON.stringify(updated));
                        setIsEditingInfo(false);
                        setProfileMessage('✅ 회원 정보가 성공적으로 변경되었습니다!');
                        setTimeout(() => setProfileMessage(null), 3000);
                      } else {
                        setEditName(user.name);
                        setEditEmail(user.email);
                        setIsEditingInfo(true);
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {isEditingInfo ? '저장 완료' : '정보 수정'}
                  </button>
                </div>

                {isEditingInfo ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block text-[11px]">이름 / 담당자</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block text-[11px]">이메일 주소</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">이름 / 담당자</span>
                      <p className="font-extrabold text-slate-900">{user.name}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">이메일 주소</span>
                      <p className="font-extrabold text-slate-900">{user.email}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                      <span className="text-slate-400 font-bold block text-[11px]">회원 구분</span>
                      <p className="font-extrabold text-emerald-700">{user.type === 'B2B' ? '기업/법인 (B2B)' : '개인/아파트 (B2C)'}</p>
                    </div>
                    {user.companyName && (
                      <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                        <span className="text-slate-400 font-bold block text-[11px]">회사/법인명</span>
                        <p className="font-extrabold text-slate-900">{user.companyName}</p>
                      </div>
                    )}
                    {user.businessNumber && (
                      <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                        <span className="text-slate-400 font-bold block text-[11px]">사업자 등록번호</span>
                        <p className="font-extrabold text-slate-900">{user.businessNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuoteModal();
                  }}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-emerald-900 block">⚡ 전기차 충전기 무료 견적 신청</span>
                    <span className="text-[11px] text-emerald-700">전문가 현장 방문 및 최적 솔루션 제안</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCartModal();
                  }}
                  className="p-4 bg-slate-100 hover:bg-slate-200/80 border border-slate-250 rounded-2xl text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block">🛒 장바구니 확인하기 ({cartItems.length})</span>
                    <span className="text-[11px] text-slate-600">담아둔 충전기 목록 관리</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <h4 className="font-black">내 설치 상담 및 견적 신청 목록</h4>
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuoteModal();
                  }}
                  className="text-emerald-600 hover:underline font-extrabold cursor-pointer"
                >
                  + 새 견적 신청
                </button>
              </div>

              {myBookings.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">신청하신 견적/설치 내역이 없습니다.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenQuoteModal();
                    }}
                    className="mt-2 text-xs font-black text-emerald-600 underline cursor-pointer"
                  >
                    지금 바로 무료 견적 신청하기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          {b.purpose === 'Commercial' ? '상업시설' : b.purpose === 'Residential' ? '아파트/주택' : '주차장'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        📍 {b.location} ({b.name} / {b.phone})
                      </div>
                      {b.memo && <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">{b.memo}</p>}
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                        <Clock className="w-3 h-3" />
                        <span>신청일시: {b.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <h4 className="font-black">장바구니 담긴 충전기 ({cartItems.length})</h4>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">장바구니에 담긴 충전기 모델이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                            {item.type} · {item.power}
                          </span>
                          <h5 className="text-xs font-black text-slate-900">{item.name}</h5>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        수량: <span className="font-black text-emerald-700">{item.quantity}개</span>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCartModal();
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all text-center block"
                  >
                    장바구니 상세 관리 및 원클릭 견적 신청
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
