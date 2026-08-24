/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ShieldCheck, Network } from 'lucide-react';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';

interface AboutSectionProps {
  aboutConfig: {
    ceoName: string;
    ceoRole: string;
    ceoGreeting: string;
    ceoMessage1: string;
    ceoMessage2: string;
    ceoMessage3: string;
    ceoImage: string;
  };
  isEditMode?: boolean;
  onOpenCms?: (tab: 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support') => void;
}

export default function AboutSection({
  aboutConfig,
  isEditMode = false,
  onOpenCms
}: AboutSectionProps) {
  return (
    <div className="space-y-10 sm:space-y-16 py-6 sm:py-12 pb-24 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Intro Hero banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-6 sm:p-10 md:p-14 border border-slate-800 shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-950 to-slate-950" />
        <div className="relative max-w-4xl space-y-3 sm:space-y-5">
          <span className="text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-wider block">Corporate Profile</span>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-snug sm:leading-tight">
            대한민국 전기차 충전 인프라의 기준,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              SY.com이 만들어 가고 있습니다.
            </span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-base md:text-lg leading-relaxed font-medium sm:font-semibold">
            SY.com은 충전기 하드웨어 설계부터 정부 무상 보조금 지원 컨설팅, 한전 배선 허가, 정밀 시공 및 전국 실시간 AS망 구축까지 모든 단계를 원스톱으로 제공하는 친환경 모빌리티 솔루션 전문 기업입니다.
          </p>
        </div>
      </section>

      {/* CEO Message */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center relative group/about">
        {isEditMode && onOpenCms && (
          <button
            onClick={() => onOpenCms('about')}
            className="absolute top-2 right-2 z-30 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            ✏️ 대표자 및 회사 소개 실시간 편집
          </button>
        )}

        <div className="md:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-64 sm:h-80 md:h-[420px]">
          <img 
            src={getOptimizedImageUrl(aboutConfig.ceoImage, { width: 800, format: 'webp' })} 
            alt="SY.com CEO" 
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-5 sm:p-6 text-white">
            <p className="font-extrabold text-lg sm:text-xl">{aboutConfig.ceoName}</p>
            <p className="text-xs sm:text-sm text-emerald-400 font-bold">{aboutConfig.ceoRole}</p>
          </div>
        </div>
        <div className="md:col-span-7 space-y-4 sm:space-y-6">
          <span className="text-emerald-600 font-bold text-xs sm:text-sm tracking-wider uppercase block">CEO Greeting</span>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-snug">
            {aboutConfig.ceoGreeting}
          </h3>
          <div className="text-slate-700 text-xs sm:text-base md:text-lg leading-relaxed space-y-3 sm:space-y-5 font-semibold sm:font-bold">
            <p>{aboutConfig.ceoMessage1}</p>
            <p>{aboutConfig.ceoMessage2}</p>
            <p>{aboutConfig.ceoMessage3}</p>
          </div>
        </div>
      </section>

      {/* Corporate Vision & Values */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-emerald-600 font-bold text-sm tracking-wider uppercase">Our Core Value</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">SY.com이 지켜가는 2대 약속</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6.5 h-6.5" />
            </div>
            <h4 className="text-lg font-black text-slate-900">1. 타협 없는 화재안전 예방</h4>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-bold">
              화재감지 알람 및 PLC 탑재 충전기로 안심 충전 환경을 실현합니다. 다중 온도 센서와 배상 책임 10억원 보험으로 안심을 보장합니다.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6.5 h-6.5" />
            </div>
            <h4 className="text-lg font-black text-slate-900">2. 원스톱 고객 행정 면제</h4>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-bold">
              한전 불입금 조회, 설치 동의서 패키지, 지자체 무상 국고 보조금 신청 대행까지 복잡한 서류 절차는 SY.com 전문가가 전부 대행합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
