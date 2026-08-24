/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Save
} from 'lucide-react';
import { DailyVisitorRecord, VisitorAnalyticsData, VisitorLogEntry } from '../types';
import { 
  fetchRealVisitorAnalyticsFromFirestore, 
  initExternalAnalytics, 
  saveVisitorAnalytics 
} from '../lib/visitorAnalytics';

interface AdminVisitorAnalyticsProps {
  data: VisitorAnalyticsData;
  onUpdateData: (newData: VisitorAnalyticsData) => void;
}

export const AdminVisitorAnalytics: React.FC<AdminVisitorAnalyticsProps> = ({
  data,
  onUpdateData
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 14 | 30>(14);
  const [activeSubTab, setActiveSubTab] = useState<'trend' | 'hourly' | 'devices' | 'logs' | 'integrations'>('trend');
  const [selectedBar, setSelectedBar] = useState<DailyVisitorRecord | null>(null);
  const [filterPage, setFilterPage] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // External analytics IDs
  const [ga4Id, setGa4Id] = useState<string>(() => {
    return localStorage.getItem('sy_ga4_measurement_id') || '';
  });
  const [naverId, setNaverId] = useState<string>(() => {
    return localStorage.getItem('sy_naver_analytics_id') || '';
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Load real records from Firestore on mount
  useEffect(() => {
    loadCloudData();

    // Listen for live hits
    const handleHit = (e: any) => {
      if (e.detail) {
        onUpdateData(e.detail);
      }
    };
    window.addEventListener('sy_visitor_hit_recorded', handleHit);
    return () => window.removeEventListener('sy_visitor_hit_recorded', handleHit);
  }, []);

  const loadCloudData = async () => {
    setIsRefreshing(true);
    try {
      const realData = await fetchRealVisitorAnalyticsFromFirestore();
      onUpdateData(realData);
      setLastSyncTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Failed to load cloud analytics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter daily records according to period
  const displayRecords = (data.dailyRecords || []).slice(-periodDays);

  // Calculate statistics
  const maxUV = Math.max(...displayRecords.map((r) => r.uniqueVisitors), 1);
  const totalPeriodUV = displayRecords.reduce((acc, r) => acc + r.uniqueVisitors, 0);
  const totalPeriodPV = displayRecords.reduce((acc, r) => acc + r.pageViews, 0);
  const avgDailyUV = Math.round(totalPeriodUV / (displayRecords.length || 1));
  const avgDailyPV = Math.round(totalPeriodPV / (displayRecords.length || 1));

  // Diff with yesterday
  const uvDiff = data.todayUV - data.yesterdayUV;
  const uvDiffPercent = data.yesterdayUV > 0 ? Math.round((uvDiff / data.yesterdayUV) * 100) : 0;

  // Device Totals across display period
  const totalMobile = displayRecords.reduce((acc, r) => acc + (r.mobileVisitors || 0), 0);
  const totalDesktop = displayRecords.reduce((acc, r) => acc + (r.desktopVisitors || 0), 0);
  const totalDevices = totalMobile + totalDesktop || 1;
  const mobilePercent = Math.round((totalMobile / totalDevices) * 100);
  const desktopPercent = 100 - mobilePercent;

  // Hourly Aggregation for Today
  const todayKey = data.dailyRecords[data.dailyRecords.length - 1]?.date;
  const todayRecord = data.dailyRecords.find((r) => r.date === todayKey) || data.dailyRecords[data.dailyRecords.length - 1];
  const hourlyData = todayRecord?.hourlyDistribution || new Array(24).fill(0);
  const maxHourly = Math.max(...hourlyData, 1);

  // Filtered Logs
  const filteredLogs = (data.recentLogs || []).filter((log) => {
    if (filterPage === 'all') return true;
    return log.page.includes(filterPage);
  });

  const handleSaveExternalAnalytics = () => {
    localStorage.setItem('sy_ga4_measurement_id', ga4Id.trim());
    localStorage.setItem('sy_naver_analytics_id', naverId.trim());
    initExternalAnalytics();
    setSaveSuccessMsg('외부 애널리틱스 설정이 성공적으로 저장 및 적용되었습니다.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDownloadCSV = () => {
    const headers = ['날짜', '실제순방문자수(UV)', '실제페이지뷰(PV)', '모바일접속', 'PC접속', '상담전환수'];
    const rows = data.dailyRecords.map((r) => [
      r.date,
      r.uniqueVisitors,
      r.pageViews,
      r.mobileVisitors,
      r.desktopVisitors,
      r.inquiryConversions
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sy_real_visitor_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">실제 방문자 통계 분석 대시보드</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firestore 실서버 실시간 연동 (100% 실제 데이터)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              가공되거나 지어낸 숫자 없이, 사이트에 실제로 접속한 방문자(UV)와 페이지뷰(PV)를 클라우드 DB에서 실시간 집계합니다.
              {lastSyncTime && <span className="ml-2 text-indigo-300 font-mono">(최근 동기화: {lastSyncTime})</span>}
            </p>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadCloudData}
            disabled={isRefreshing}
            className={`px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer ${
              isRefreshing ? 'opacity-70' : ''
            }`}
            title="Firestore 실시간 동기화"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isRefreshing ? '클라우드 동기화 중...' : '실시간 새로고침'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV 엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* 1. Core Key Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Visitors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-indigo-600" />
              오늘 실제 순 방문자 (Today UV)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black">
              실시간
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {data.todayUV.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              페이지뷰: <b className="text-slate-800">{data.todayPV.toLocaleString()} PV</b>
            </span>
            <span
              className={`font-black flex items-center gap-0.5 ${
                uvDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {uvDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {uvDiff >= 0 ? `+${uvDiff}` : uvDiff}명
            </span>
          </div>
        </div>

        {/* Card 2: Yesterday Visitors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              어제 실제 총 방문자 (Yesterday)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black">
              마감
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {data.yesterdayUV.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>어제 페이지뷰:</span>
            <b className="text-slate-800">{data.yesterdayPV.toLocaleString()} PV</b>
          </div>
        </div>

        {/* Card 3: This Month Visitors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              이번 달 실제 누적 방문자
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black">
              당월 누적
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {data.thisMonthUV.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>일평균 방문자:</span>
            <b className="text-emerald-700 font-bold">약 {avgDailyUV}명 / 일</b>
          </div>
        </div>

        {/* Card 4: Total All-Time Visitors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-600">
              <Globe className="w-4 h-4 text-amber-600" />
              사이트 총 누적 방문수
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black">
              Total
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {data.totalAllTimeUV.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500">명</span>
          </div>

          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>누적 총 페이지뷰:</span>
            <b className="text-amber-800 font-bold">{data.totalAllTimePV.toLocaleString()} PV</b>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('trend')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'trend'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>📈 일별 방문자 추이 차트</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hourly')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'hourly'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>⏰ 시간대별 트래픽 분포</span>
          </button>

          <button
            onClick={() => setActiveSubTab('devices')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'devices'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>📱 기기·유입 경로 분석</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'logs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>📋 실시간 접속 로그</span>
          </button>

          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'integrations'
                ? 'bg-indigo-900 text-white shadow-sm ring-2 ring-indigo-400/50'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>🌐 GA4 / 네이버 분석 연동</span>
          </button>
        </div>

        {/* Period Selector (when trend is active) */}
        {activeSubTab === 'trend' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPeriodDays(7)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                periodDays === 7 ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 7일
            </button>
            <button
              onClick={() => setPeriodDays(14)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                periodDays === 14 ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 14일
            </button>
            <button
              onClick={() => setPeriodDays(30)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                periodDays === 30 ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 30일
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Tab 1: Daily Visitor Trend Bar Chart */}
      {activeSubTab === 'trend' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>일별 실제 방문자 수 (UV) 및 페이지뷰 (PV)</span>
                <span className="text-xs font-normal text-slate-500">
                  (조회 기간: 최근 {displayRecords.length}일 기록)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                막대 위에 마우스를 올리거나 터치하면 해당 일자의 세부 방문자 수와 접속 기기 비율을 확인하실 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span className="text-slate-700">순 방문자 (UV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-200" />
                <span className="text-slate-700">페이지뷰 (PV)</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-slate-200 relative">
              {/* Background Reference Lines */}
              <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>최고 {maxUV}명</span>
              </div>
              <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>기준선 ({Math.round(maxUV / 2)}명)</span>
              </div>

              {/* Day Bars */}
              {displayRecords.map((rec) => {
                const heightPercent = maxUV > 0 ? Math.max(10, Math.round((rec.uniqueVisitors / maxUV) * 100)) : 10;
                const isSelected = selectedBar?.date === rec.date;
                const isToday = rec.date === todayKey;

                return (
                  <div
                    key={rec.date}
                    onClick={() => setSelectedBar(rec)}
                    onMouseEnter={() => setSelectedBar(rec)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative z-10"
                  >
                    {/* Floating Tooltip on Hover/Select */}
                    {(isSelected || isToday) && (
                      <div
                        className={`absolute -top-12 z-30 px-2 py-1 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] font-bold whitespace-nowrap pointer-events-none transition-all ${
                          isToday && !isSelected ? 'opacity-90' : 'opacity-100 ring-2 ring-indigo-400'
                        }`}
                      >
                        <span className="text-amber-300 font-extrabold">{rec.date.slice(5)}</span> : {rec.uniqueVisitors}명
                        <span className="text-slate-300 font-normal ml-1">({rec.pageViews}PV)</span>
                      </div>
                    )}

                    {/* Bar Stack */}
                    <div className="w-full max-w-[42px] flex flex-col items-center justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 relative ${
                          isToday
                            ? 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-indigo-400 shadow-md ring-2 ring-indigo-400/80'
                            : isSelected
                            ? 'bg-indigo-700 shadow-lg ring-2 ring-slate-900'
                            : rec.uniqueVisitors > 0
                            ? 'bg-indigo-600 hover:bg-indigo-500'
                            : 'bg-slate-200'
                        }`}
                      >
                        <div className="absolute top-1 inset-x-0 flex justify-center text-[10px] text-white font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                          {rec.uniqueVisitors}
                        </div>
                      </div>
                    </div>

                    {/* X-axis Date Label */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-[10.5px] block font-mono ${
                          isToday
                            ? 'font-black text-indigo-700 underline'
                            : isSelected
                            ? 'font-black text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {rec.date.slice(5)}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded-sm">
                          오늘
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Bar Details Box */}
          {selectedBar && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                  {selectedBar.date.slice(8)}일
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {selectedBar.date} 실제 접속 통계
                  </h4>
                  <p className="text-xs text-slate-600">
                    순 방문자 <b>{selectedBar.uniqueVisitors}명</b> | 총 페이지뷰 <b>{selectedBar.pageViews}건</b> | 상담 접수 <b>{selectedBar.inquiryConversions || 0}건</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>모바일: {selectedBar.mobileVisitors || 0}명</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-slate-700" />
                  <span>PC: {selectedBar.desktopVisitors || 0}명</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Table Summary */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">방문 일자</th>
                  <th className="p-3 text-right">실제 순 방문자 (UV)</th>
                  <th className="p-3 text-right">실제 페이지뷰 (PV)</th>
                  <th className="p-3 text-right">모바일 접속</th>
                  <th className="p-3 text-right">PC 접속</th>
                  <th className="p-3 text-right">상담/견적 전환</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...displayRecords].reverse().map((rec) => {
                  const isToday = rec.date === todayKey;
                  return (
                    <tr
                      key={rec.date}
                      className={`hover:bg-slate-50 transition-colors ${
                        isToday ? 'bg-indigo-50/40 font-bold' : ''
                      }`}
                    >
                      <td className="p-3 flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">{rec.date}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                            오늘
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-black text-indigo-700">
                        {rec.uniqueVisitors.toLocaleString()}명
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700">
                        {rec.pageViews.toLocaleString()}회
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        {rec.mobileVisitors.toLocaleString()}명
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        {rec.desktopVisitors.toLocaleString()}명
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700">
                        {rec.inquiryConversions || 0}건
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Main Tab 2: Hourly Traffic Distribution */}
      {activeSubTab === 'hourly' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>오늘 시간대별 실제 방문 트래픽 현황 (00시 ~ 23시)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">
                실제 기록
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              오늘 하루 동안 실제 방문자가 접속한 시간대(시간별 페이지 조회수)를 실시간으로 집계합니다.
            </p>
          </div>

          <div className="h-60 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-200 pt-6">
            {hourlyData.map((hits, hour) => {
              const heightPercent = maxHourly > 0 ? Math.max(6, Math.round((hits / maxHourly) * 100)) : 6;
              const currentHour = new Date().getHours();
              const isCurrent = hour === currentHour;

              return (
                <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div
                    className={`absolute -top-7 px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20`}
                  >
                    {hour}시 : {hits}회 조회
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isCurrent
                        ? 'bg-amber-500 shadow-md ring-2 ring-amber-300'
                        : hits > 0
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-slate-200'
                    }`}
                  />

                  <span
                    className={`text-[9px] sm:text-[10px] mt-1.5 block font-mono ${
                      isCurrent ? 'font-black text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              현재 시간은 <b>{new Date().getHours()}시</b>이며, 시간대별 막대는 오늘 사이트를 방문한 실제 사용자들의 접속 시각에 따라 자동으로 누적됩니다.
            </span>
          </div>
        </div>
      )}

      {/* 4. Main Tab 3: Devices & Inflow Channels */}
      {activeSubTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Device Ratio */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              접속 기기별 점유율 (Mobile vs PC)
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    스마트폰 모바일 (Mobile)
                  </span>
                  <span className="font-black text-indigo-700">{mobilePercent}% ({totalMobile.toLocaleString()}명)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${mobilePercent}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-slate-700" />
                    PC 데스크톱 (Desktop)
                  </span>
                  <span className="font-black text-slate-800">{desktopPercent}% ({totalDesktop.toLocaleString()}명)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${desktopPercent}%` }}
                    className="h-full bg-gradient-to-r from-slate-700 to-slate-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium">
              💡 실제 고객의 접속 기기 정보를 분석하여 모바일 환경과 PC 환경에 맞춤형 UI 최적화를 진행할 수 있습니다.
            </div>
          </div>

          {/* Right: Popular Pages */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              실제 방문 페이지 순위
            </h3>

            <div className="space-y-3 pt-1">
              {(data.pagePopularity || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs">
                  아직 기록된 페이지 조회 데이터가 없습니다.
                </div>
              ) : (
                data.pagePopularity.map((page, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        {page.pageName}
                      </span>
                      <span className="text-emerald-700 font-extrabold shrink-0">
                        {page.views}회 ({page.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${page.percentage}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Tab 4: Real-Time Live Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>실제 방문자 접속 로그 (최근 50건)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                실제 사용자가 페이지를 이동할 때마다 Firestore 클라우드 데이터베이스에 실시간 기록된 원본 로그입니다.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">페이지 필터:</span>
              <select
                value={filterPage}
                onChange={(e) => setFilterPage(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold cursor-pointer"
              >
                <option value="all">전체 페이지 보기</option>
                <option value="홈">홈 스토어</option>
                <option value="아파트">아파트/상업용</option>
                <option value="견적">견적 계산기</option>
                <option value="A/S">A/S 고객센터</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">접속 시간</th>
                  <th className="p-3">방문 페이지</th>
                  <th className="p-3">기기 / 브라우저</th>
                  <th className="p-3">익명 클라이언트 ID</th>
                  <th className="p-3">유입 경로 (Referrer)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                      기록된 실시간 접속 로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="p-3 font-bold text-indigo-700">
                        {log.page}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {log.device === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          {log.browser}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {log.ip}
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {log.referrer}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Main Tab 5: External Analytics Integration (GA4 & Naver) */}
      {activeSubTab === 'integrations' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                공식 외부 웹로그 분석기 연동 설정 (Google Analytics & 네이버)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                공식 트래커 지원
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              에스와이닷컴 자체 실시간 통계 외에도, 구글 애널리틱스(GA4) 및 네이버 프리미엄 로그분석 공식 태그를 입력하시면 사이트 헤더에 스크립트가 자동 주입됩니다.
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Analytics 4 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Google Analytics 4 (GA4)
                </span>
                <span className="text-[11px] font-bold text-slate-500">측정 ID 형식: G-XXXXXXXXXX</span>
              </div>
              <p className="text-xs text-slate-600">
                구글 애널리틱스 관리자 페이지 &gt; 데이터 스트림에서 발급받은 <b>측정 ID</b>를 입력하세요.
              </p>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="예: G-AB12CD34EF"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>연동 시 공식 <code>gtag.js</code> 추적 코드가 사이트 전체에 자동 로드됩니다.</span>
              </div>
            </div>

            {/* Naver Analytics */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  네이버 프리미엄 로그분석
                </span>
                <span className="text-[11px] font-bold text-slate-500">발급 ID 형식: wa-XXXXXX</span>
              </div>
              <p className="text-xs text-slate-600">
                네이버 검색광고 또는 네이버 프리미엄 로그분석 서비스에서 발급받은 <b>분석 ID(wa)</b>를 입력하세요.
              </p>
              <input
                type="text"
                value={naverId}
                onChange={(e) => setNaverId(e.target.value)}
                placeholder="예: wa-1234567890"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>네이버 광고 성과 및 네이버 검색 유입 키워드를 공식 분석할 수 있습니다.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveExternalAnalytics}
              className="px-6 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>외부 분석 태그 설정 저장 및 적용</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
          <span className="font-bold">100% 무가공 실제 집계:</span>
          <span>모든 통계는 가짜 데이터나 시뮬레이션 없이 Firestore 클라우드 데이터베이스에 실시간 누적 기록됩니다.</span>
        </div>
        <span className="font-mono text-indigo-700 font-bold">
          DB Collection: sy_visitor_daily &amp; sy_visitor_logs
        </span>
      </div>
    </div>
  );
};
