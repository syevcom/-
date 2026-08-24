/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Calendar, 
  Wrench, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Copy
} from 'lucide-react';
import { AdminNotification, ActivePage } from '../types';

interface AdminNotificationCenterProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  onNavigateToAdmin: (tab?: string) => void;
  isBannerDismissed: boolean;
  onDismissBanner: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateToAdmin,
  isBannerDismissed,
  onDismissBanner,
  isOpen,
  onClose
}) => {
  const [filterType, setFilterType] = useState<'all' | 'booking' | 'as' | 'inquiry'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const latestUnread = notifications.find(n => !n.isRead) || notifications[0];

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'booking') return n.type === 'booking' || n.type === 'consultation' || n.type === 'order';
    if (filterType === 'as') return n.type === 'as';
    if (filterType === 'inquiry') return n.type === 'inquiry';
    return true;
  });

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatRelativeTime = (timestamp: number, createdAtStr?: string) => {
    if (!timestamp) return createdAtStr || '최근';
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return createdAtStr || new Date(timestamp).toLocaleDateString('ko-KR');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'booking':
      case 'consultation':
      case 'order':
        return {
          label: '📅 시공·실측 예약',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Calendar className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'as':
        return {
          label: '🔧 긴급 A/S',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Wrench className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'inquiry':
      default:
        return {
          label: '💬 1:1 상담문의',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
        };
    }
  };

  return (
    <>
      {/* 1. Top Alert Sticky Banner (Only when there are unread items and not dismissed) */}
      {!isBannerDismissed && unreadCount > 0 && latestUnread && (
        <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b-2 border-amber-400 shadow-xl relative z-40 transition-all">
          <div className="max-w-[1550px] mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            {/* Left: Highlight Pill & Latest Request Preview */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[280px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black shrink-0 animate-pulse">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>신규 접수 {unreadCount}건</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold truncate">
                <span className="text-amber-200 font-extrabold truncate">
                  [{latestUnread.customerName} 고객님]
                </span>
                <span className="text-slate-300 truncate hidden sm:inline">
                  {latestUnread.title || latestUnread.memo || '새로운 상담 및 예약이 접수되었습니다.'}
                </span>
                {latestUnread.customerPhone && (
                  <span className="text-slate-400 font-mono text-xs hidden md:inline">
                    ({latestUnread.customerPhone})
                  </span>
                )}
                <span className="text-slate-400 text-[11px] shrink-0 font-normal">
                  • {formatRelativeTime(latestUnread.timestamp, latestUnread.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onNavigateToAdmin('inquiries');
                  if (latestUnread) onMarkAsRead(latestUnread.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span>📋 관리자에서 확인</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onMarkAllAsRead}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                title="모든 알림 읽음 처리"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onDismissBanner}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="알림 배너 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification Popover / Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onClose}
          />

          {/* Popover Panel (Top-right aligned on desktop, slide-down on mobile) */}
          <div className="absolute top-16 right-2 sm:right-6 md:right-12 w-[95vw] sm:w-[480px] max-w-[500px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">실시간 예약 &amp; 상담 알림 센터</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                        {unreadCount}건 미확인
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    고객님의 무료 시공 실측, 견적 및 긴급 A/S 신청 내역
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  전체 ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterType('booking')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    filterType === 'booking'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  예약·상담
                </button>
                <button
                  onClick={() => setFilterType('as')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    filterType === 'as'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  A/S
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>모두 읽음</span>
                </button>
              )}
            </div>

            {/* Notification List Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 divide-y-0">
              {filteredNotifications.length === 0 ? (
                <div className="py-14 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">접수된 알림 내역이 없습니다.</p>
                  <p className="text-xs text-slate-400">고객이 상담이나 예약을 신청하면 여기에 실시간으로 표시됩니다.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const badge = getTypeBadge(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onMarkAsRead(notif.id);
                        onNavigateToAdmin('inquiries');
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${
                        !notif.isRead
                          ? 'bg-amber-50/60 border-amber-200/90 shadow-xs hover:bg-amber-50 hover:border-amber-300 ring-1 ring-amber-300/50'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse ring-2 ring-white" />
                      )}

                      {/* Card Header: Type Badge & Relative Time */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-black flex items-center gap-1 ${badge.bg}`}>
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          {notif.status && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                              {notif.status}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatRelativeTime(notif.timestamp, notif.createdAt)}
                        </span>
                      </div>

                      {/* Customer Name & Phone */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          {notif.customerName} 고객님
                        </h4>

                        {notif.customerPhone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${notif.customerPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors"
                              title="전화 걸기"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{notif.customerPhone}</span>
                            </a>
                            <button
                              onClick={(e) => handleCopyPhone(notif.customerPhone, e)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="번호 복사"
                            >
                              {copiedPhone === notif.customerPhone ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Location & Details */}
                      {notif.location && (
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mb-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{notif.location}</span>
                        </p>
                      )}

                      {notif.memo && (
                        <div className="p-2 rounded-xl bg-slate-100/80 text-xs text-slate-700 font-medium line-clamp-2 mt-1.5">
                          {notif.memo}
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span className="text-blue-600 group-hover:underline flex items-center gap-0.5">
                          관리자 상세 보기
                          <ChevronRight className="w-3 h-3" />
                        </span>

                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notif.id);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            읽음 표시
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => {
                  onNavigateToAdmin('inquiries');
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <span>관리자 센터 전체 내역 확인</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-3 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
