/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password / ID change mode state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeMsg, setChangeMsg] = useState('');

  // Reset fields on modal open
  React.useEffect(() => {
    if (isOpen) {
      setAdminId('');
      setPassword('');
      setError('');
      setSuccess('');
      setIsChangingPassword(false);
      setCurrentPass('');
      setNewAdminId('');
      setNewPass('');
      setConfirmPass('');
      setChangeMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedId = localStorage.getItem('sy_admin_id') || 'syevcom';
    const savedPassword = localStorage.getItem('sy_admin_password') || 'syev.com123!';

    const inputId = adminId.trim();
    const inputPass = password.trim();

    // Strict validation: only exact custom saved credentials or official syevcom credentials
    const isValidId = inputId === savedId || inputId === 'syevcom';
    const isValidPassword = inputPass === savedPassword || inputPass === 'syev.com123!';

    if (isValidId && isValidPassword) {
      setSuccess('관리자 인증에 성공했습니다.');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
        setSuccess('');
        setPassword('');
      }, 1000);
    } else {
      setError('관리자 아이디 또는 비밀번호가 일치하지 않습니다. 올바른 정보를 입력해 주세요.');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMsg('');

    const savedPassword = localStorage.getItem('sy_admin_password') || 'syev.com123!';

    if (currentPass !== savedPassword && currentPass !== 'syev.com123!') {
      setChangeMsg('❌ 현재 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (newAdminId.trim()) {
      localStorage.setItem('sy_admin_id', newAdminId.trim());
    }

    if (newPass.trim()) {
      if (newPass !== confirmPass) {
        setChangeMsg('❌ 새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      localStorage.setItem('sy_admin_password', newPass.trim());
    }

    setChangeMsg('✅ 관리자 계정 정보가 성공적으로 변경되었습니다!');
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPass('');
      setNewAdminId('');
      setNewPass('');
      setConfirmPass('');
      setChangeMsg('');
    }, 1800);
  };

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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm tracking-tight">SY.com 전용 관리자 로그인</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">ADMIN SECURE SYSTEM ACCESS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        {!isChangingPassword ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed">
              <span className="block font-black text-blue-700 mb-1">🔒 관리자 전용 보안 로그인</span>
              일반 방문자에게는 관리자 메뉴가 노출되지 않습니다. 관리자 권한을 가진 사용자만 부여된 <strong>아이디와 비밀번호</strong>로 로그인하여 시스템을 관리할 수 있습니다.
            </div>

            {/* Admin ID Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">관리자 아이디 (ID)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="관리자 아이디 입력"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-bold transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Admin Password Field */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-bold text-slate-700">관리자 비밀번호</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Feedback Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl"
                >
                  ⚠️ {error}
                </motion.p>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              관리자 홈페이지 접속 및 CMS 열기
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs font-semibold text-amber-900 leading-relaxed flex items-start gap-2">
              <span className="text-base leading-none">⚙️</span>
              <div>
                <span className="block font-black text-amber-900 mb-0.5">관리자 계정 및 비밀번호 변경</span>
                전용 관리자 아이디 및 비밀번호를 원하는 계정 정보로 변경할 수 있습니다.
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">현재 비밀번호 확인</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="현재 사용 중인 비밀번호 입력"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">새 관리자 아이디 (변경 시에만 입력)</label>
                <input
                  type="text"
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  placeholder="새로 사용할 관리자 아이디 입력"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">새 비밀번호 (변경 시에만 입력)</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="변경할 새 비밀번호"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold"
                />
              </div>

              {newPass && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold"
                  />
                </div>
              )}
            </div>

            {changeMsg && (
              <p
                className={`text-xs font-black p-2.5 rounded-xl border ${
                  changeMsg.startsWith('✅')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {changeMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setChangeMsg('');
                }}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                정보 변경 저장
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

