/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Layers, 
  Menu as MenuIcon, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Save, 
  X, 
  Eye, 
  Check, 
  Maximize2, 
  Minimize2, 
  Grid, 
  Columns,
  MessageSquare,
  ChevronRight,
  Sun,
  Layout
} from 'lucide-react';
import { MobileDesignConfig, DEFAULT_MOBILE_DESIGN_CONFIG } from '../types';

interface MobileDesignCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MobileDesignConfig;
  onSave: (config: MobileDesignConfig) => void;
}

export function MobileDesignCenterModal({
  isOpen,
  onClose,
  config,
  onSave
}: MobileDesignCenterModalProps) {
  const [localConfig, setLocalConfig] = useState<MobileDesignConfig>(config || DEFAULT_MOBILE_DESIGN_CONFIG);
  const [activeTab, setActiveTab] = useState<'hero' | 'header' | 'quickpanel' | 'layout'>('hero');
  const [showSaveToast, setShowSaveToast] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof MobileDesignConfig>(key: K, value: MobileDesignConfig[K]) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    // Instant live preview
    onSave(updated);
  };

  const handleApplyPreset = (presetName: 'default' | 'compact' | 'visual' | 'largeMenu') => {
    let preset: MobileDesignConfig;
    switch (presetName) {
      case 'compact':
        preset = {
          ...localConfig,
          heroMobileHeight: 380,
          heroMobilePaddingY: 24,
          heroMobileTitleSize: 'sm',
          heroMobileDescSize: 'sm',
          heroMobileBgOverlay: 60,
          headerMobileHeight: 58,
          headerMobileMenuBtnSize: 'md',
          headerMobileLogoHeight: 32,
          quickPanelDefaultCollapsed: true,
          mobileContentPadding: 12,
          mobileCardColumns: 2,
          mobileCardSpacing: 12,
        };
        break;
      case 'visual':
        preset = {
          ...localConfig,
          heroMobileHeight: 560,
          heroMobilePaddingY: 48,
          heroMobileTitleSize: 'lg',
          heroMobileDescSize: 'md',
          heroMobileBgOverlay: 50,
          headerMobileHeight: 64,
          headerMobileMenuBtnSize: 'lg',
          headerMobileLogoHeight: 38,
          quickPanelDefaultCollapsed: true,
          mobileContentPadding: 16,
          mobileCardColumns: 1,
          mobileCardSpacing: 16,
        };
        break;
      case 'largeMenu':
        preset = {
          ...localConfig,
          heroMobileHeight: 460,
          heroMobilePaddingY: 32,
          heroMobileTitleSize: 'md',
          heroMobileDescSize: 'sm',
          heroMobileBgOverlay: 55,
          headerMobileHeight: 72,
          headerMobileMenuBtnSize: 'xl',
          headerMobileLogoHeight: 42,
          headerMobileFontSize: 'lg',
          quickPanelDefaultCollapsed: true,
          mobileContentPadding: 16,
          mobileCardColumns: 1,
          mobileCardSpacing: 16,
        };
        break;
      case 'default':
      default:
        preset = { ...DEFAULT_MOBILE_DESIGN_CONFIG };
        break;
    }
    setLocalConfig(preset);
    onSave(preset);
  };

  const handleSaveAndClose = () => {
    onSave(localConfig);
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      onClose();
    }, 400);
  };

  const handleReset = () => {
    if (confirm('모바일 디자인 설정을 기본 권장값으로 초기화하시겠습니까?')) {
      setLocalConfig(DEFAULT_MOBILE_DESIGN_CONFIG);
      onSave(DEFAULT_MOBILE_DESIGN_CONFIG);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="mobile-design-center-modal"
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  모바일 디자인 센터
                </h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  실시간 맞춤 조절
                </span>
              </div>
              <p className="text-xs text-slate-300">
                스마트폰 화면에서 배경 크기, 메뉴바 크기, 퀵패널 접힘 등을 자유롭게 변경하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            원클릭 추천 스타일:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleApplyPreset('default')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-300/80 shadow-2xs transition-all cursor-pointer"
            >
              🌟 밸런스 기본형
            </button>
            <button
              onClick={() => handleApplyPreset('compact')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-300/80 shadow-2xs transition-all cursor-pointer"
            >
              📱 컴팩트 (한눈에 보기)
            </button>
            <button
              onClick={() => handleApplyPreset('largeMenu')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 rounded-lg text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
            >
              🔍 큰 메뉴바 & 큰 글씨
            </button>
            <button
              onClick={() => handleApplyPreset('visual')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-300/80 shadow-2xs transition-all cursor-pointer"
            >
              ✨ 와이드 비주얼
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 shrink-0 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('hero')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'hero'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. 홈 / 배경 크기</span>
          </button>
          <button
            onClick={() => setActiveTab('header')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'header'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MenuIcon className="w-4 h-4" />
            <span>2. 상단 메뉴바 크기</span>
          </button>
          <button
            onClick={() => setActiveTab('quickpanel')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'quickpanel'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>3. 우측 퀵패널 (접힘)</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'layout'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>4. 상품 카드 & 여백</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: HERO & BACKGROUND */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
                <span className="text-emerald-700 font-bold text-lg">💡</span>
                <div className="text-xs text-emerald-950 font-medium">
                  모바일 화면에서 첫 화면(메인 배경)의 높이와 여백을 줄이면 스크롤 없이도 핵심 내용과 버튼이 한눈에 들어옵니다.
                </div>
              </div>

              {/* 1. Mobile Hero Height */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>📱 모바일 메인 배경 높이</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.heroMobileHeight}px
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {[380, 440, 480, 560, 650].map((h) => (
                      <button
                        key={h}
                        onClick={() => handleChange('heroMobileHeight', h)}
                        className={`px-2 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                          localConfig.heroMobileHeight === h
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={300}
                  max={750}
                  step={10}
                  value={localConfig.heroMobileHeight}
                  onChange={(e) => handleChange('heroMobileHeight', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>300px (아주 컴팩트)</span>
                  <span>480px (권장)</span>
                  <span>750px (풀스크린)</span>
                </div>
              </div>

              {/* 2. Hero Padding Top/Bottom */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>↕️ 모바일 텍스트 상하 여백(패딩)</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.heroMobilePaddingY}px
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {[20, 32, 44, 60].map((p) => (
                      <button
                        key={p}
                        onClick={() => handleChange('heroMobilePaddingY', p)}
                        className={`px-2 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                          localConfig.heroMobilePaddingY === p
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}px
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={12}
                  max={80}
                  step={4}
                  value={localConfig.heroMobilePaddingY}
                  onChange={(e) => handleChange('heroMobilePaddingY', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* 3. Hero Title Size on Mobile */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-sm font-black text-slate-900 block">
                  🔤 모바일 메인 타이틀 글씨 크기
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sm', label: '작게 (24px)', desc: '텍스트가 많을 때' },
                    { id: 'md', label: '보통 (28px)', desc: '권장 기본값' },
                    { id: 'lg', label: '크게 (34px)', desc: '강조형' },
                    { id: 'xl', label: '아주 크게 (40px)', desc: '임팩트형' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChange('heroMobileTitleSize', item.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        localConfig.heroMobileTitleSize === item.id
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-black'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Background Overlay Darkness */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>🌑 배경 이미지 어둡기 (글자 가독성 보호)</span>
                    <span className="text-xs bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.heroMobileBgOverlay}%
                    </span>
                  </label>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={5}
                  value={localConfig.heroMobileBgOverlay}
                  onChange={(e) => handleChange('heroMobileBgOverlay', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>10% (밝은 원본 이미지)</span>
                  <span>55% (권장 대비)</span>
                  <span>85% (매우 어둡게)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEADER & MENU BAR */}
          {activeTab === 'header' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
                <span className="text-amber-700 font-bold text-lg">🔍</span>
                <div className="text-xs text-amber-950 font-medium">
                  "메뉴바가 너무 작아서 안 보여요" 문제를 해결하기 위해 <strong>메뉴바 높이</strong>와 <strong>햄버거 메뉴 버튼 크기</strong>를 확대할 수 있습니다.
                </div>
              </div>

              {/* 1. Header Bar Height */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>📏 모바일 상단 메뉴바(헤더) 높이</span>
                    <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.headerMobileHeight}px
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {[54, 62, 68, 76].map((h) => (
                      <button
                        key={h}
                        onClick={() => handleChange('headerMobileHeight', h)}
                        className={`px-2.5 py-1 text-xs rounded font-black cursor-pointer transition-all ${
                          localConfig.headerMobileHeight === h
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={50}
                  max={82}
                  step={2}
                  value={localConfig.headerMobileHeight}
                  onChange={(e) => handleChange('headerMobileHeight', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* 2. Menu Icon / Button Size */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-sm font-black text-slate-900 block">
                  🍔 햄버거 메뉴 및 검색 버튼 크기 (터치 영역)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sm', label: '작게 (34px)', desc: '슬림 컴팩트' },
                    { id: 'md', label: '보통 (40px)', desc: '기본 크기' },
                    { id: 'lg', label: '큼직하게 (46px)', desc: '🌟 터치 편함' },
                    { id: 'xl', label: '매우 큼직 (52px)', desc: '눈에 확 띔' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChange('headerMobileMenuBtnSize', item.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        localConfig.headerMobileMenuBtnSize === item.id
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 text-amber-950 font-black'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Logo Height on Mobile */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>🏢 모바일 로고 크기(높이)</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.headerMobileLogoHeight}px
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {[28, 34, 40, 48].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange('headerMobileLogoHeight', s)}
                        className={`px-2 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                          localConfig.headerMobileLogoHeight === s
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min={26}
                  max={56}
                  step={2}
                  value={localConfig.headerMobileLogoHeight}
                  onChange={(e) => handleChange('headerMobileLogoHeight', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          )}

          {/* TAB 3: QUICK FLOATING PANEL */}
          {activeTab === 'quickpanel' && (
            <div className="space-y-6">
              <div className="bg-purple-50/70 border border-purple-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
                <span className="text-purple-700 font-bold text-lg">⚡</span>
                <div className="text-xs text-purple-950 font-medium">
                  우측 SNS/카카오톡 퀵패널이 화면 내용을 가리지 않도록 <strong>모바일에서 기본으로 접어두기</strong> 설정이 적용되어 있습니다.
                </div>
              </div>

              {/* 1. Default Collapsed State */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">모바일에서 퀵패널 기본 접어두기</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    접혀있을 때는 작고 깔끔한 미니 토글 버튼만 표시되어 화면을 가리지 않습니다.
                  </div>
                </div>
                <button
                  onClick={() => handleChange('quickPanelDefaultCollapsed', !localConfig.quickPanelDefaultCollapsed)}
                  className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative p-1 ${
                    localConfig.quickPanelDefaultCollapsed ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      localConfig.quickPanelDefaultCollapsed ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Quick Panel Button Size */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-sm font-black text-slate-900 block">
                  🔘 퀵패널 아이콘 크기
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sm', label: '작게 (34px)', desc: '화면 가림 최소화' },
                    { id: 'md', label: '보통 (42px)', desc: '권장 기본 크기' },
                    { id: 'lg', label: '크게 (50px)', desc: '클릭하기 쉬움' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChange('quickPanelMobileSize', item.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        localConfig.quickPanelMobileSize === item.id
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/20 text-purple-950 font-black'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Quick Panel Position */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-sm font-black text-slate-900 block">
                  📍 퀵패널 위치
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'right-bottom', label: '우측 하단', desc: '엄지손가락 터치 편함' },
                    { id: 'right-center', label: '우측 중앙', desc: '하단 바와 겹침 방지' },
                    { id: 'right-top', label: '우측 상단', desc: '헤더 아래쪽' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChange('quickPanelPosition', item.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        localConfig.quickPanelPosition === item.id
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/20 text-purple-950 font-black'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT & CARDS */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* 1. Mobile Content Padding */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>📐 모바일 화면 좌우 여백</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      {localConfig.mobileContentPadding}px
                    </span>
                  </label>
                  <div className="flex gap-1">
                    {[10, 14, 16, 20].map((p) => (
                      <button
                        key={p}
                        onClick={() => handleChange('mobileContentPadding', p)}
                        className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                          localConfig.mobileContentPadding === p
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}px
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  step={2}
                  value={localConfig.mobileContentPadding}
                  onChange={(e) => handleChange('mobileContentPadding', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* 2. Mobile Card Columns */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-sm font-black text-slate-900 block">
                  🗂️ 충전기 상품 카드 모바일 배치
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('mobileCardColumns', 1)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                      localConfig.mobileCardColumns === 1
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black">1줄에 1개씩 큼직하게</div>
                      <div className="text-[10px] text-slate-500">사진과 스펙이 큼직하게 보임 (권장)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleChange('mobileCardColumns', 2)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                      localConfig.mobileCardColumns === 2
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Columns className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black">1줄에 2개씩 컴팩트하게</div>
                      <div className="text-[10px] text-slate-500">한 화면에 많은 상품을 표시</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Mobile Sticky Bottom Action Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">모바일 하단 빠른 상담/전화 고정바</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    화면 맨 아래에 '전화상담', '카카오톡', '무료견적' 버튼을 고정합니다.
                  </div>
                </div>
                <button
                  onClick={() => handleChange('showMobileStickyBottom', !localConfig.showMobileStickyBottom)}
                  className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative p-1 ${
                    localConfig.showMobileStickyBottom ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      localConfig.showMobileStickyBottom ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 복원</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-all"
            >
              닫기
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>설정 저장 완료</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
