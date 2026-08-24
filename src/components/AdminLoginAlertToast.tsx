/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Bell, X, ChevronRight, Phone, Calendar, Sparkles } from 'lucide-react';
import { AdminNotification } from '../types';

interface AdminLoginAlertToastProps {
  notifications: AdminNotification[];
  onNavigateToAdmin: (tab?: string) => void;
  onOpenNotificationCenter: () => void;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export const AdminLoginAlertToast: React.FC<AdminLoginAlertToastProps> = ({
  notifications,
  onNavigateToAdmin,
  onOpenNotificationCenter,
  onMarkAsRead,
  onClose
}) => {
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;
  const latest = unreadNotifications[0];

  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 12000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible || unreadCount === 0 || !latest) return null;

  return (
    <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50 max-w-[420px] w-[92vw] sm:w-auto animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400/90 ring-4 ring-amber-400/20 flex flex-col gap-2.5 relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 shrink-0 font-black shadow-xs">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-amber-400">
              🚨 [실시간 접수 알림]
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[10px] border border-amber-400/40">
              신규 {unreadCount}건
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-200">
            <span className="font-extrabold text-sm text-white">
              {latest.customerName} 고객님
            </span>
            {latest.customerPhone && (
              <span className="font-mono text-amber-300 font-bold text-xs flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {latest.customerPhone}
              </span>
            )}
          </div>

          <p className="text-slate-300 font-medium line-clamp-2 text-[11.5px] leading-relaxed">
            {latest.title || latest.memo || '새로운 시공 및 무료 상담 신청이 도착했습니다.'}
          </p>

          {latest.location && (
            <p className="text-[11px] text-slate-400 truncate">
              📍 {latest.location}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => {
              onMarkAsRead(latest.id);
              onNavigateToAdmin('inquiries');
              setIsVisible(false);
              onClose();
            }}
            className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-md"
          >
            <span>관리자에서 확인</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onOpenNotificationCenter();
              setIsVisible(false);
              onClose();
            }}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            전체 알림 ({unreadCount})
          </button>
        </div>

      </div>
    </div>
  );
};
