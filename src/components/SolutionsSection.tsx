/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Solution, ActivePage, ProductOptionGroup, SolutionProduct } from '../types';
import { Check, ArrowRight, Zap, RefreshCw, Building2, Home, ParkingCircle, Layers, Image, FileText, Trash2, Upload, ExternalLink, X, Plus, Edit3, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, SPEEL_5KW_REPRESENTATIVE_IMAGE, SPEEL_11KW_REPRESENTATIVE_IMAGE, DEFAULT_RESIDENTIAL_OPTION_GROUPS, ELECTREE_OPTION_GROUPS, LOTTE_EVSIS_OPTION_GROUPS, CHARGEGO_OPTION_GROUPS, COOLCHARGE_OPTION_GROUPS, PUBLIC_CHARGER_OPTION_GROUPS, DEVICE_ONLY_OPTION_GROUPS, REPLACEMENT_OPTION_GROUPS, INSTALLATION_OPTION_GROUPS } from '../data';
import PdfImageRenderer from './PdfImageRenderer';
import DetailPageImage from './DetailPageImage';
import { saveBrandPdf, deleteBrandPdf, loadAllBrandPdfs } from '../lib/indexedDb';
import { compressImage } from '../lib/imageCompressor';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';
import { uploadFileToFirebaseStorage, db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { OptionPreset, INITIAL_OPTION_PRESETS } from './AdminPage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { 
  DEFAULT_BRAND_CATALOGS, 
  loadUnifiedBrandCatalogs, 
  saveUnifiedBrandCatalog, 
  deleteUnifiedBrandCatalog,
  resolveBrandCatalog,
  resolvePostImgUrl,
  loadUnifiedProductDetails, 
  saveUnifiedProductDetail, 
  deleteUnifiedProductDetail, 
  resolveDetailData, 
  DEFAULT_PRODUCT_DETAILS,
  ProductDetailItem
} from '../lib/detailPagesData';

export const BRAND_METADATA: Record<string, {
  name: string;
  slogan: string;
  description: string;
  highlights: string[];
  logoBg: string;
  icon: string;
  benefits: string[];
}> = {
  'sk일렉링크': {
    name: 'sk일렉링크 (SK electlink)',
    slogan: 'SK그룹의 신뢰도 높은 전국 최대 급속/완속 충전 네트워크',
    description: 'SK일렉링크는 대기업의 강력한 인프라와 높은 보안 수준을 바탕으로 고속 충전 및 지능형 완속 전력 제어 장치를 공급하며, 전국 1위의 가동률과 원격 고장 복구 시스템을 자랑합니다.',
    highlights: ['대기업 대규모 인프라망', '실시간 스마트 전력 분배', '24시간 무인 모니터링'],
    logoBg: 'bg-red-50 text-red-600 border-red-100',
    icon: '⚡',
    benefits: ['SK 멤버십 할인 혜택 연동', '100% 무상 설치 지원 (정부보조금)', 'PLC 화재 예방 안심 모뎀 기본 탑재']
  },
  '플러그링크': {
    name: '플러그링크 (pluglink)',
    slogan: 'IT 기술 기반의 혁신적인 스마트 로드 밸런싱 충전 기술',
    description: '플러그링크는 스마트 분배 제어 솔루션으로 한전 전력 승압 비용을 최소화하며, 깔끔한 스페이스 그레이 메탈 월박스 디자인으로 아파트 가치를 한층 드높입니다.',
    highlights: ['스마트 로드 밸런싱 특허', '스페이스 그레이 메탈 디자인', '카카오톡 연동 간편 요금 결제'],
    logoBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    icon: '🔌',
    benefits: ['단일 회선 전력 5대 분배 시공', '자가 부담금 ZERO 무상 설치', '업계 유일 100% 친환경 재생에너지 요금제']
  },
  '이엘일렉트릭': {
    name: '이엘일렉트릭 (EL Electric)',
    slogan: '온도센서 연동형 화재 안심 스마트 제어 기술의 절대 강자',
    description: '이EL일렉트릭은 완속 충전기 자체의 복합 온도 측정 센서와 과열 자동 차단 회로를 보유하여 화재 예방에 가장 안전한 1등 품질 신뢰 아파트 충전 모델입니다.',
    highlights: ['온도 센서 내장 화재 예방', '실시간 과전류 3중 차단', '안전 안심 시공 가이드 준수'],
    logoBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: '🛡️',
    benefits: ['화재 예방 충전기 우선 보조금 적용', '전기 안전 사고 책임 보증 보험 가입', '무상 현장 정밀 안전 진단']
  },
  '나이스차져': {
    name: '나이스차져 (NICE Charger)',
    slogan: 'NICE 홀딩스 금융 인프라의 투명하고 편리한 과금 수납 솔루션',
    description: '나이스차져는 국내 최고 신용평가 그룹인 NICE 그룹의 정밀 무인 금융 단말 수납 기술을 탑재하여 365일 실시간 투명한 요금 정산과 안전한 보안 인증을 완료했습니다.',
    highlights: ['금융 등급 보안 정산망', 'NICE 간편 결제 완벽 지원', '365일 24시간 CS 콜센터'],
    logoBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    icon: '💳',
    benefits: ['신용카드 단말기 탑재 가능 모델', '아파트 관리비 고지서 연동 수납', '정부 승인 공식 보조금 시공']
  },
  '에버온': {
    name: '에버온 (Everon)',
    slogan: '대한민국 누적 시공 실적 1위에 빛나는 대표 완속 파트너',
    description: '에버온은 오랜 충전 비즈니스 역사와 폭넓은 현장 데이터베이스를 기반으로 어떤 구옥/신축 아파트 주차 현장에도 완벽한 전력선 인입과 최적 충전 구역 선정을 보장합니다.',
    highlights: ['누적 설치량 1위의 노하우', '가장 저렴한 표준 충전 단가', '전국 직영 A/S 기술망 구축'],
    logoBg: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: '🌟',
    benefits: ['24시간 원격 복구 솔루션 무상 제공', '최첨단 슬림형 LED 디스플레이', '입주민 대상 100% 무상 설치 지원']
  },
  '아이파킹': {
    name: '아이파킹 EV (iParking EV)',
    slogan: '무인 주차 시스템 전국 1위 연동 고효율 충전 제어 서비스',
    description: '아이파킹 EV는 무인 주차 정산 선두 주자 파킹클라우드의 IT 기술력을 기반으로 주차 정산기, 주차장 입출입 차단 시스템과 유기적으로 연동하여 충전 요금 주차비 사전 할인 및 통합 결제 편의성을 극대화합니다.',
    highlights: ['주차관제 시스템 연동', '자동 차량 번호 인식', '주차요금 감면 혜택'],
    logoBg: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: '🚗',
    benefits: ['충전 완료 시 주차요금 즉시 자동 감면', '주차 앱 하나로 할인권 및 충전 원스톱 결제', '24시간 무인 안심 주차-충전 관제 모니터링']
  },
  'LG유플러스볼트업': {
    name: 'LG유플러스 볼트업 (VoltUp)',
    slogan: 'LG그룹의 최고 신뢰성 망 인프라 기반 프리미엄 충전망',
    description: 'LG유플러스 볼트업은 3대 통신사의 강력하고 안정적인 모바일 통신 회선을 기본 무상 장착하고, 전국 직영 24시간 철저한 원격 제어 및 현장 긴급 출동 긴급 복구 시스템으로 압도적인 운용 신뢰성을 보장합니다.',
    highlights: ['대기업 전용 통신망 연동', 'U+ 통신 요금 멤버십 할인', '24시간 관제 센터 가동'],
    logoBg: 'bg-pink-50 text-pink-600 border-pink-100',
    icon: '🔌',
    benefits: ['LG U+ 모바일 고객 충전 요금 상시 10% 추가 할인', '365일 실시간 안전 감지 및 원격 셧다운 기능', '전 입주민 자가부담금 ZERO 완전 무상 설치 시공']
  }
};

const HOME_POWER_METADATA: Record<string, {
  name: string;
  slogan: string;
  description: string;
  highlights: string[];
  logoBg: string;
  icon: string;
  benefits: string[];
  specs: { label: string; value: string }[];
}> = {
  '5kW': {
    name: '5kW 슬림형 스마트 홈 충전기',
    slogan: '단상 220V 소형 계약 전력 및 구옥 주택용 최적화 모델',
    description: '한전 승압 공사 요금이 부담스럽거나 기본 전기 요금을 절감하고 싶은 단독주택 소유주분들을 위한 실속형 충전 시스템입니다. 기존 7kW 대비 승압 추가 비용 부담 없이 간편한 전기 인입으로 야간 수면 중 안전하게 완충이 가능합니다.',
    highlights: ['승압 기본요금 절약', '플러그 앤 플레이 지원', '소형 컴팩트 디자인'],
    logoBg: 'bg-teal-50 text-teal-600 border-teal-100',
    icon: '🔋',
    benefits: ['한전 기본요금 월 약 1만원 영구 절감 효과', '자가부담 최소화 맞춤 실속 시공', '과전류/과온도 방지 오토 제어 센서'],
    specs: [
      { label: '최대 출력 용량', value: '5kW (단상 220V)' },
      { label: '완충 소요 시간', value: '84kWh 기준 약 16.5시간 (기본 야간 주차 시 충분)' },
      { label: '권장 설치 환경', value: '단독주택, 농어촌 주택, 계약전력 5kW 이하 공간' },
      { label: '케이블 길이', value: '기본 5m 고품질 난연 케이블 제공 (최대 7m 연장 가능)' }
    ]
  },
  '7kW': {
    name: '7kW 표준형 스마트 홈 충전기',
    slogan: '대한민국 보급률 1위! 가장 표준적이고 든든한 고성능 홈 충전 표준',
    description: '단독주택, 빌라, 개인 전용 차고지에 가장 많이 시공되는 베스트셀러 표준 용량입니다. 퇴근 후 주차하여 밤사이(8~10시간) 충전해 두면, 다음날 상쾌한 기분으로 100% 완전 충전된 차량을 주행할 수 있어 최상의 가성비와 충전 만족도를 자랑합니다.',
    highlights: ['대한민국 표준기 규격', '방수/방진 IP55 최고 등급', '예약 시간 충전 스마트 칩'],
    logoBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: '⚡',
    benefits: ['심야 시간 할인 전기요금 자동 예약 세팅', '100% 한전 한도 사전 대관 무료 대행', 'KC 국가안전인증 및 전자파 무해 입증'],
    specs: [
      { label: '최대 출력 용량', value: '7kW (단상 220V)' },
      { label: '완충 소요 시간', value: '84kWh 기준 약 12시간 (야간 1회 주차로 100% 완충)' },
      { label: '권장 설치 환경', value: '일반 단독주택, 신축 빌라, 개인 상가 소유 주차장' },
      { label: '케이블 길이', value: '기본 5m 고강도 내한성 실리콘 케이블 기본 탑재' }
    ]
  },
  '11kW': {
    name: '11kW 고속형 3상 프리미엄 홈 충전기',
    slogan: '3상 380V 고전력 인입 전용, 고출력 수입/대형 EV 특화 시스템',
    description: '3상 380V 동력 전기를 활용할 수 있는 단독주택이나 준공공 시설, 개인 사업장에 완벽하게 대응하는 하이엔드 모델입니다. 테슬라, 아우디 e-tron, 타이칸 등 대용량 고전압 배터리를 탑재한 수입/국산 프리미엄 전기차를 7kW 대비 최대 1.5배 이상 신속하게 완충합니다.',
    highlights: ['3상 동력 11kW 초고속 완속', '수입/대용량 EV 충전 완벽 호환', '고급 LED 지능형 디스플레이'],
    logoBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    icon: '🚀',
    benefits: ['7kW 대비 약 4.5시간 이상 시간 단축 효과', '기기 가동 상태 실시간 LED 직관 모니터링', '업계 최고 5억 생산물 배상 책임 보험 가입'],
    specs: [
      { label: '최대 출력 용량', value: '11kW (3상 380V)' },
      { label: '완충 소요 시간', value: '84kWh 기준 단 7.5시간 (급속 못지않은 완속 속도)' },
      { label: '권장 설치 환경', value: '3상 동력 전기 사용 주택, 개인 법인 사옥, 프리미엄 차고지' },
      { label: '케이블 길이', value: '기본 5m 일체형 하이그레이드 커넥터 제공' }
    ]
  }
};

export const HOME_PRODUCTS_DATA: Record<string, SolutionProduct[]> = {
  '5kW': [
    {
      id: 'sy-ac05',
      name: '스필 5kW 개인용 전기차 충전기 무상AS 4년',
      description: '[국내최초 무상A/S 4년] 가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
      regularPrice: 543636,
      price: 460000,
      discount: 15,
      serviceType: 'all',
      image:'/스필.png',
      tags: ['MD CHOICE', 'HIT'],
      hasASBadge: true,
      hasPromoRibbon: true
    },
    {
      id: 'res-5kw-coolcharge',
      name: '쿨차지 5kW 스마트 홈 충전기',
      description: '스마트 앱 연동, 야외 가혹 환경 방수/방진, 5kW 저전력 안심 충전',
      regularPrice: 450000,
      price: 380000,
      discount: 15,
      serviceType: 'all',
      image: '/쿨차지.png',
      tags: ['MD CHOICE', 'NEW']
    },
    {
      id: 'res-5kw-electree',
      name: '일렉트리 5kW 개인용 전기차 충전기',
      description: '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
      regularPrice: 436364,
      price: 370000,
      discount: 15,
      serviceType: 'all',
      image: '/일렉트리.png',
      tags: ['MD CHOICE', 'HIT']
    },
    {
      id: 'res-5kw-chargego',
      name: '차지고 5kW 개인용 전기차 충전기',
      description: '[예약충전 기능] 충전본체 분해없이 설치가능, 자가교체 가능한 커플러',
      regularPrice: 409091,
      price: 350000,
      discount: 14,
      serviceType: 'all',
      image: '/차지고.png',
      tags: ['HIT']
    }
  ],
  '7kW': [
    {
      id: 'sy-ac07',
      name: '스필 7kW 개인용 전기차 충전기 무상AS 4년',
      description: '[국내최초 무상A/S 4년] 화재 감지 자동 전력 차단 가정용 완속 충전 베스트셀러',
      regularPrice: 660000,
      price: 598000,
      discount: 10,
      serviceType: 'all',
      image: '/스필.png',
      tags: ['MD CHOICE', 'HIT'],
      hasASBadge: true,
      hasPromoRibbon: true
    },
    {
      id: 'res-7kw-chargego',
      name: '차지고 7kW 개인용 전기차 충전기',
      description: '[예약충전 기능] 차지고 7kW 가정용 완속 스마트 충전기',
      regularPrice: 550000,
      price: 490000,
      discount: 11,
      serviceType: 'all',
      image: '/차지고.png',
      tags: ['MD CHOICE', 'HIT']
    },
    {
      id: 'res-7kw-electree',
      name: '일렉트리 7kW 개인용 전기차 충전기',
      description: '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
      regularPrice: 480000,
      price: 480000,
      discount: 0,
      serviceType: 'all',
      image: '/일렉트리.png',
      tags: ['MD CHOICE', 'HIT']
    },
    {
      id: 'res-7kw-coolcharge',
      name: '쿨차지 7kW 개인용 전기차 충전기',
      description: '쿨차지 7kW 개인용 전기차 충전기 단말기 전용 모델',
      regularPrice: 660000,
      price: 650000,
      discount: 2,
      serviceType: 'all',
      image: '/쿨차지.png',
      tags: ['MD CHOICE', 'NEW']
    }
  ],
  '11kW': [
    {
      id: 'sy-ac11-bi',
      name: '스필 11kW 개인용 전기차 충전기 무상AS 4년',
      description: '[국내최초 무상A/S 4년] 3상 11kW 초고속 완속 프리미엄 특화 모델',
      regularPrice: 829000,
      price: 779000,
      discount: 6,
      serviceType: 'all',
      replacementPrice: 929000,
      replacementRegularPrice: 1029000,
      replacementDiscount: 10,
      installIncludedPrice: 1129000,
      installIncludedRegularPrice: 1229000,
      installIncludedDiscount: 8,
      image: '/스필.png',
      tags: ['MD CHOICE', 'HIT'],
      hasASBadge: true,
      hasPromoRibbon: true
    },
    {
      id: 'res-11kw-coolcharge',
      name: '쿨차지 11kW 개인용 전기차 충전기',
      description: '쿨차지 11kW 개인용 전기차 충전기 단말기 전용 모델',
      regularPrice: 800000,
      price: 800000,
      discount: 0,
      serviceType: 'all',
      image: '/쿨차지.png',
      tags: ['MD CHOICE']
    },
    {
      id: 'res-11kw-electree',
      name: '일렉트리 11kW 개인용 전기차 충전기',
      description: '3상 11kW 완속 충전기, 실내외 설치 우수한 방수/방진',
      regularPrice: 850000,
      price: 750000,
      discount: 12,
      serviceType: 'all',
      image: '/일렉트리.png',
      tags: ['HIT']
    }
  ]
};

// --- Representative SVG Images for Commercial / BIZ Public Chargers (Matching user catalogue) ---
export const BIZ_7KW_PLC_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b2d35"/><stop offset="50%" stop-color="%2317181c"/><stop offset="100%" stop-color="%230b0c0e"/></linearGradient><linearGradient id="bronzeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="30%" stop-color="%23fbbf24"/><stop offset="70%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23b45309"/></linearGradient><linearGradient id="screenG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><filter id="sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG)"/><g filter="url(%23sh)" transform="translate(160, 60)"><rect x="110" y="380" width="60" height="150" rx="6" fill="%231e293b"/><path d="M 140,510 C 140,560 60,560 60,460 C 60,360 80,480 140,490" fill="none" stroke="%230f172a" stroke-width="18" stroke-linecap="round"/><path d="M 40,60 C 40,10 240,10 240,60 L 255,270 C 255,340 220,380 140,380 C 60,380 25,340 25,270 Z" fill="url(%23bronzeG)"/><path d="M 46,65 C 46,20 234,20 234,65 L 248,265 C 248,330 215,368 140,368 C 65,368 32,330 32,265 Z" fill="url(%23bodyG)"/><rect x="68" y="70" width="144" height="150" rx="14" fill="url(%23screenG)" stroke="%23334155" stroke-width="2"/><circle cx="140" cy="130" r="38" fill="none" stroke="%23334155" stroke-width="6"/><circle cx="140" cy="130" r="38" fill="none" stroke="%2338bdf8" stroke-width="6" stroke-dasharray="160 80"/><text x="140" y="138" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="900" fill="%2338bdf8" text-anchor="middle">62%</text><g transform="translate(140, 195)"><circle cx="-36" cy="0" r="8" fill="%2338bdf8" opacity="0.9"/><circle cx="-12" cy="0" r="8" fill="%2322c55e" opacity="0.9"/><circle cx="12" cy="0" r="8" fill="%23eab308" opacity="0.9"/><circle cx="36" cy="0" r="8" fill="%23ef4444" opacity="0.9"/></g><g transform="translate(140, 275)"><rect x="-35" y="-22" width="70" height="44" rx="8" fill="none" stroke="%23ffffff" stroke-width="2.5" opacity="0.7"/><text x="0" y="-3" font-family="sans-serif" font-size="9" font-weight="800" fill="%23ffffff" text-anchor="middle" opacity="0.8">CARD</text><path d="M -15,10 Q 0,2 15,10" fill="none" stroke="%23ffffff" stroke-width="2.5" opacity="0.8"/></g><circle cx="140" cy="335" r="14" fill="%230f172a" stroke="%23475569" stroke-width="2"/><path d="M 137,329 L 143,335 L 137,341" fill="none" stroke="%2338bdf8" stroke-width="2.5" stroke-linecap="round"/></g></svg>`;

export const BIZ_11KW_STORMSHIELD_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="bodyBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><filter id="sh2" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.2"/></filter></defs><rect width="600" height="600" fill="url(%23bgG2)"/><g filter="url(%23sh2)" transform="translate(180, 50)"><rect x="90" y="30" width="60" height="490" fill="%230f172a" rx="4"/><rect x="40" y="20" width="160" height="40" rx="8" fill="url(%23bodyBlue)"/><text x="120" y="45" font-family="sans-serif" font-size="13" font-weight="900" fill="%23ffffff" text-anchor="middle">전기차충전소</text><rect x="50" y="80" width="140" height="190" rx="28" fill="%2318181b" stroke="%2338bdf8" stroke-width="3"/><rect x="75" y="105" width="90" height="95" rx="10" fill="%2309090b" stroke="%2327272a" stroke-width="1.5"/><circle cx="120" cy="142" r="22" fill="none" stroke="%2338bdf8" stroke-width="4"/><text x="120" y="147" font-family="sans-serif" font-size="12" font-weight="900" fill="%2338bdf8" text-anchor="middle">11kW</text><g transform="translate(120, 235)"><rect x="-24" y="-14" width="48" height="28" rx="6" fill="none" stroke="%23ffffff" stroke-width="2" opacity="0.6"/><text x="0" y="3" font-family="sans-serif" font-size="8" font-weight="800" fill="%23ffffff" text-anchor="middle" opacity="0.8">RFID</text></g><rect x="70" y="295" width="100" height="60" rx="12" fill="%2327272a" stroke="%233f3f46" stroke-width="2"/><text x="120" y="330" font-family="sans-serif" font-size="10" font-weight="900" fill="%23a1a1aa" text-anchor="middle">KOOL CHARGE</text><path d="M 120,355 C 120,440 40,440 40,360 C 40,290 80,410 120,420" fill="none" stroke="%2309090b" stroke-width="16" stroke-linecap="round"/><rect x="30" y="500" width="180" height="25" rx="6" fill="%231e293b"/></g></svg>`;

export const BIZ_35KW_STORMSHIELD_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG3" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="metalBox" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="50%" stop-color="%23f1f5f9"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient><filter id="sh3" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG3)"/><g filter="url(%23sh3)" transform="translate(100, 80)"><rect x="0" y="0" width="400" height="440" rx="20" fill="url(%23metalBox)" stroke="%2394a3b8" stroke-width="3"/><g transform="translate(35, 45)"><path d="M 0,0 C 10,-8 20,8 30,0 C 20,8 10,-8 0,0 Z" fill="%23ea580c"/><text x="40" y="6" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="%23ea580c" letter-spacing="1">KOOL CHARGE</text></g><rect x="35" y="85" width="200" height="150" rx="10" fill="%230f172a" stroke="%23334155" stroke-width="2"/><text x="135" y="145" font-family="sans-serif" font-size="18" font-weight="900" fill="%2338bdf8" text-anchor="middle">35kW BIZ</text><text x="135" y="175" font-family="sans-serif" font-size="13" font-weight="800" fill="%2322c55e" text-anchor="middle">스톰쉴드 공용</text><g transform="translate(260, 95)"><line x1="0" y1="0" x2="100" y2="0" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="20" x2="100" y2="20" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="40" x2="100" y2="40" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="60" x2="100" y2="60" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="80" x2="100" y2="80" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(135, 275)"><rect x="-70" y="-18" width="140" height="36" rx="8" fill="%231e293b"/><text x="0" y="5" font-family="sans-serif" font-size="11" font-weight="800" fill="%2394a3b8" text-anchor="middle">CARD TOUCH / RFID</text></g><g transform="translate(135, 360)"><circle cx="0" cy="0" r="26" fill="%23ef4444" stroke="%23991b1b" stroke-width="3"/><circle cx="0" cy="0" r="16" fill="%23b91c1c"/><text x="0" y="42" font-family="sans-serif" font-size="9" font-weight="900" fill="%23475569" text-anchor="middle">EMERGENCY SWITCH</text></g><g transform="translate(310, 240)"><rect x="-35" y="0" width="70" height="150" rx="14" fill="%231e293b" stroke="%230f172a" stroke-width="3"/><rect x="-25" y="20" width="50" height="50" rx="8" fill="%230f172a"/><path d="M 0,150 C 0,220 -80,220 -80,180" fill="none" stroke="%230f172a" stroke-width="22" stroke-linecap="round"/></g></g></svg>`;

export const BIZ_50KW_COOLCHARGE_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG4" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="cabinetG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="50%" stop-color="%23f1f5f9"/><stop offset="100%" stop-color="%23e2e8f0"/></linearGradient><linearGradient id="orangeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient><filter id="sh4" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG4)"/><g filter="url(%23sh4)" transform="translate(160, 40)"><rect x="0" y="20" width="280" height="490" rx="16" fill="url(%23cabinetG)" stroke="%2394a3b8" stroke-width="3"/><rect x="20" y="50" width="240" height="30" rx="6" fill="%230f172a"/><text x="140" y="70" font-family="'Arial Black', sans-serif" font-size="13" font-weight="900" fill="%23f97316" text-anchor="middle">KOOL CHARGE</text><rect x="35" y="100" width="210" height="230" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="55" y="120" width="170" height="190" rx="8" fill="url(%23orangeG)"/><rect x="62" y="127" width="156" height="176" rx="6" fill="%23020617"/><text x="140" y="195" font-family="sans-serif" font-size="28" font-weight="900" fill="%2338bdf8" text-anchor="middle">50kW</text><text x="140" y="235" font-family="sans-serif" font-size="14" font-weight="800" fill="%23ffffff" text-anchor="middle">급속 1CH</text><g transform="translate(140, 380)"><rect x="-45" y="0" width="90" height="90" rx="12" fill="%230f172a" stroke="%23334155" stroke-width="3"/><circle cx="0" cy="45" r="22" fill="%231e293b" stroke="%23475569" stroke-width="2"/><path d="M 0,90 C 0,160 -80,160 -80,110" fill="none" stroke="%230f172a" stroke-width="20" stroke-linecap="round"/></g><rect x="-10" y="505" width="300" height="20" rx="4" fill="%230f172a"/></g></svg>`;

export const PARKING_PRODUCTS_DATA: Record<string, SolutionProduct[]> = {
  '공용 BIZ 충전기': [
    {
      id: 'park-7kw-plc-biz',
      name: '스마트제어 완속 충전기 PLC 7kW BIZ 전기차 공용',
      description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
      regularPrice: 0,
      price: 0,
      discount: 0,
      power: '7kW',
      serviceType: 'all',
      image: BIZ_7KW_PLC_IMAGE,
      tags: ['BEST', 'HIT'],
      optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
    },
    {
      id: 'park-11kw-stormshield',
      name: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드',
      description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
      regularPrice: 0,
      price: 0,
      discount: 0,
      power: '11kW',
      serviceType: 'all',
      image: BIZ_11KW_STORMSHIELD_IMAGE,
      tags: ['BEST', 'HIT'],
      optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
    },
    {
      id: 'park-35kw-stormshield',
      name: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드',
      description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
      regularPrice: 0,
      price: 0,
      discount: 0,
      power: '35kW',
      serviceType: 'all',
      image: BIZ_35KW_STORMSHIELD_IMAGE,
      tags: ['MD CHOICE'],
      optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
    },
    {
      id: 'park-50kw-1ch-coolcharge',
      name: '전기차 급속 충전기 50kW 1CH 쿨차지',
      description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
      regularPrice: 0,
      price: 0,
      discount: 0,
      power: '50kW',
      serviceType: 'all',
      image:'/50kw-쿨차지.png',
      tags: ['MD CHOICE', '급속'],
      hasPromoRibbon: true,
      optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
    }
  ]
};

interface SolutionsSectionProps {
  key?: React.Key;
  onOpenQuoteWithPurpose: (purpose: 'Commercial' | 'Residential' | 'ParkingLot') => void;
  solutions: Solution[];
  isEditMode?: boolean;
  onOpenCms?: (tab: 'brand' | 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support' | 'sync') => void;
  onPageChange?: (page: ActivePage) => void;
  defaultActiveTab?: 'ALL' | 'Commercial' | 'Residential' | 'ParkingLot';
  selectedAptBrand?: string;
  onSelectAptBrand?: (brand: string) => void;
  selectedHomePower?: string;
  onSelectHomePower?: (power: string) => void;
  selectedHomeServiceType?: string;
  onSelectHomeServiceType?: (serviceType: string) => void;
  selectedParkingCapacity?: string;
  onSelectParkingCapacity?: (capacity: string) => void;
  onAddToCart?: (product: any, selectedOptions?: { groupTitle: string; optionName: string; optionPrice: number }[], customPrice?: number, customQuantity?: number) => void;
  onOpenCartModal?: () => void;
  onOpenPayment?: (items: any[]) => void;
  user?: any;
  activeDetailProduct?: SolutionProduct | null;
  onSelectDetailProduct?: (product: SolutionProduct | null) => void;
}

export default function SolutionsSection({ 
  onOpenQuoteWithPurpose,
  solutions,
  isEditMode = false,
  user,
  onOpenCms,
  onPageChange,
  defaultActiveTab = 'ALL',
  selectedAptBrand = 'sk일렉링크',
  onSelectAptBrand,
  selectedHomePower = '7kW',
  onSelectHomePower,
  selectedHomeServiceType = '단말기 단품',
  onSelectHomeServiceType,
  selectedParkingCapacity = '공용 BIZ 충전기',
  onSelectParkingCapacity,
  onAddToCart,
  onOpenCartModal,
  onOpenPayment,
  activeDetailProduct: activeDetailProductProp,
  onSelectDetailProduct
 }: SolutionsSectionProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const u = localStorage.getItem('sy_user') || localStorage.getItem('sy_logged_user');
      if (u) {
        const parsed = JSON.parse(u);
        return Boolean(parsed.isAdmin || parsed.email === 'sy.car.com@gmail.com' || parsed.role === 'admin');
      }
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const u = localStorage.getItem('sy_user') || localStorage.getItem('sy_logged_user');
        if (u) {
          const parsed = JSON.parse(u);
          setIsAdminLoggedIn(Boolean(parsed.isAdmin || parsed.email === 'sy.car.com@gmail.com' || parsed.role === 'admin'));
          return;
        }
      } catch (e) {}
      setIsAdminLoggedIn(false);
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    window.addEventListener('sy_auth_state_changed', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('sy_auth_state_changed', checkAdmin);
    };
  }, []);

  const canEdit = isEditMode || isAdminLoggedIn || Boolean(user?.isAdmin || user?.email === 'sy.car.com@gmail.com' || user?.role === 'admin');

  const [activeTab, setActiveTab] = useState<'ALL' | 'Commercial' | 'Residential' | 'ParkingLot'>(defaultActiveTab);
  
  useEffect(() => {
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, string>>({});
  const [visualViewerMode, setVisualViewerMode] = useState<Record<string, 'product' | 'catalog'>>({});
  const [solutionTabs, setSolutionTabs] = useState<Record<string, 'specs' | 'infographic'>>({});
  const [localBannerModes, setLocalBannerModes] = useState<Record<string, 'cover' | 'unfold'>>({});
  const [localDetailModes, setLocalDetailModes] = useState<Record<string, 'scroll' | 'unfold'>>({});
  const [sortBy, setSortBy] = useState<'new' | 'priceAsc' | 'priceDesc' | 'popular'>('new');
  const [internalActiveDetailProduct, setInternalActiveDetailProduct] = useState<SolutionProduct | null>(null);

  const activeDetailProduct = activeDetailProductProp !== undefined ? activeDetailProductProp : internalActiveDetailProduct;

  const setActiveDetailProduct = (prodOrUpdater: SolutionProduct | null | ((prev: SolutionProduct | null) => SolutionProduct | null)) => {
    let nextVal: SolutionProduct | null;
    if (typeof prodOrUpdater === 'function') {
      nextVal = prodOrUpdater(activeDetailProduct);
    } else {
      nextVal = prodOrUpdater;
    }
    if (onSelectDetailProduct) {
      onSelectDetailProduct(nextVal);
    } else {
      setInternalActiveDetailProduct(nextVal);
    }
  };
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetailItem>>(() => {
    // Immediate fallback initialization so incognito/guest modes render instantly without waiting for Firestore
    const base: Record<string, ProductDetailItem> = { ...DEFAULT_PRODUCT_DETAILS };
    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('sy_cms_product_details') : null;
      if (localStr) {
        const parsed = JSON.parse(localStr);
        return { ...base, ...parsed };
      }
    } catch (e) {}
    return base;
  });
  
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string>>({});
  const [selectedOptionQuantities, setSelectedOptionQuantities] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const getOptionGroupsForProduct = (prod: SolutionProduct | null, serviceTypeParam?: string): ProductOptionGroup[] => {
    if (!prod) return [];

    const id = prod.id || '';
    const name = prod.name || '';
    const cat = (prod as any).detailCategory || '';
    const type = (prod as any).type || '';

    const isResidential =
      cat === '비공용완속' ||
      cat === '비공용중속' ||
      cat === '가정용' ||
      id.startsWith('res-') ||
      id.startsWith('sy-ac') ||
      id.startsWith('home-') ||
      name.includes('개인용') ||
      name.includes('가정용') ||
      name.includes('홈') ||
      name.includes('비공용');

    const isPublicCharger = !isResidential && (
      cat === '공용완속' ||
      cat === '급속' ||
      type === '급속' ||
      type === '초급속' ||
      id.startsWith('park-') ||
      id.startsWith('comm-') ||
      id.startsWith('sol-comm') ||
      id.startsWith('sol-park') ||
      (name.includes('공용') && !name.includes('개인용') && !name.includes('가정용')) ||
      name.includes('수익형') ||
      name.includes('관공서') ||
      name.includes('조달상품')
    );

    if (isPublicCharger) {
      return PUBLIC_CHARGER_OPTION_GROUPS;
    }

    const st = serviceTypeParam || selectedHomeServiceType || '단말기 단품';

    if ((st === '단말기 단품' || st === 'device') && prod.deviceOptionGroups && prod.deviceOptionGroups.length > 0) {
      return prod.deviceOptionGroups;
    }
    if ((st === '교체 시공' || st === 'replace') && prod.replaceOptionGroups && prod.replaceOptionGroups.length > 0) {
      return prod.replaceOptionGroups;
    }
    if ((st === '신규 설치 포함' || st === 'install') && prod.installOptionGroups && prod.installOptionGroups.length > 0) {
      return prod.installOptionGroups;
    }

    if (prod.optionGroups && prod.optionGroups.length > 0) {
      return prod.optionGroups;
    }

    if (st === '단말기 단품' || st === 'device') {
      return DEVICE_ONLY_OPTION_GROUPS;
    }
    if (st === '교체 시공' || st === 'replace') {
      return REPLACEMENT_OPTION_GROUPS;
    }
    if (st === '신규 설치 포함' || st === 'install') {
      return INSTALLATION_OPTION_GROUPS;
    }

    return DEFAULT_RESIDENTIAL_OPTION_GROUPS;
  };

  const getCardImage = (prod: SolutionProduct | null): string => {
    if (!prod) return '';
    try {
      const savedMain = localStorage.getItem('sy_cms_products_v12');
      if (savedMain) {
        const parsedMain = JSON.parse(savedMain);
        const matched = parsedMain.find((mp: any) => 
          (mp.id && prod.id && mp.id === prod.id) || 
          (mp.name && prod.name && mp.name.trim().toLowerCase() === prod.name.trim().toLowerCase()) ||
          ((prod.id === 'park-50kw-1ch-coolcharge' || prod.id === 'sy-dc50' || (prod.name && prod.name.toLowerCase().includes('50kw'))) && (mp.id === 'park-50kw-1ch-coolcharge' || mp.id === 'sy-dc50' || (mp.name && mp.name.toLowerCase().includes('50kw')))) ||
          ((prod.id === 'sy-ac11-bi' || prod.id === 'res-11kw-spil') && (mp.id === 'sy-ac11-bi' || mp.id === 'res-11kw-spil')) ||
          ((prod.id === 'sy-ac07' || prod.id === 'res-7kw-spil') && (mp.id === 'sy-ac07' || mp.id === 'res-7kw-spil')) ||
          ((prod.id === 'sy-ac05' || prod.id === 'res-5kw-spil') && (mp.id === 'sy-ac05' || mp.id === 'res-5kw-spil'))
        );
        if (matched?.image && matched.image.trim()) {
          return matched.image.trim();
        }
      }
    } catch (e) {}

    if (prod.image && prod.image.trim()) {
      return prod.image.trim();
    }
    return '';
  };

  useEffect(() => {
    if (activeDetailProduct) {
      setSelectedOptionsMap({});
      setSelectedOptionQuantities({});
      setSelectedConnector('');
      setQuantity(1);
    }
  }, [activeDetailProduct?.id]);

  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editRegularPrice, setEditRegularPrice] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editDelivery, setEditDelivery] = useState('');
  const [editShipping, setEditShipping] = useState('');
  const [editPayment, setEditPayment] = useState('');
  const [editOptionLabel, setEditOptionLabel] = useState('');
  const [editOptions, setEditOptions] = useState<{ id: string; label: string; price: number }[]>([]);
  const [editActiveOptionTab, setEditActiveOptionTab] = useState<'device' | 'replace' | 'install'>('device');
  const [editDeviceOptionGroups, setEditDeviceOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [editReplaceOptionGroups, setEditReplaceOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [editInstallOptionGroups, setEditInstallOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [isDraggingProductImage, setIsDraggingProductImage] = useState(false);

  // Option Preset Template state for detail editor
  const [optionPresetsList, setOptionPresetsList] = useState<OptionPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Left side image picker states
  const [isLeftImagePickerOpen, setIsLeftImagePickerOpen] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [isLeftImageDragging, setIsLeftImageDragging] = useState(false);
  const [selectedDisplayImage, setSelectedDisplayImage] = useState<string>('');

  useEffect(() => {
    if (activeDetailProduct) {
      setSelectedDisplayImage(activeDetailProduct.image || '');
    }
  }, [activeDetailProduct?.id, activeDetailProduct?.image]);

  const handleApplyLeftImageChange = (newImgUrl: string) => {
    if (!activeDetailProduct || !newImgUrl.trim()) return;
    const finalUrl = newImgUrl.trim();
    const currentList = activeDetailProduct.images && activeDetailProduct.images.length > 0
      ? activeDetailProduct.images
      : (activeDetailProduct.image ? [activeDetailProduct.image] : []);
    const updatedList = currentList.includes(finalUrl) ? currentList : [finalUrl, ...currentList];

    updateProductDetails(activeDetailProduct.id, {
      image: finalUrl,
      images: updatedList
    });
    setEditImage(finalUrl);
    setSelectedDisplayImage(finalUrl);
    setToastMessage('📷 메인 충전기 이미지가 변경되었습니다!');
    setTimeout(() => setToastMessage(null), 3000);
    setIsLeftImagePickerOpen(false);
    setCustomImageUrlInput('');
  };

  const handleAddGalleryImage = (newImgUrl: string) => {
    if (!activeDetailProduct || !newImgUrl.trim()) return;
    const finalUrl = newImgUrl.trim();
    const currentList = activeDetailProduct.images && activeDetailProduct.images.length > 0
      ? activeDetailProduct.images
      : (activeDetailProduct.image ? [activeDetailProduct.image] : []);

    const updatedList = currentList.includes(finalUrl) ? currentList : [...currentList, finalUrl];
    const mainImg = activeDetailProduct.image || finalUrl;

    updateProductDetails(activeDetailProduct.id, {
      images: updatedList,
      image: mainImg
    });
    setSelectedDisplayImage(finalUrl);
    setToastMessage('📷 추가 사진이 정상적으로 등록되었습니다!');
    setTimeout(() => setToastMessage(null), 3000);
    setCustomImageUrlInput('');
  };

  const handleRemoveGalleryImage = (imgUrlToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeDetailProduct) return;
    const currentList = activeDetailProduct.images && activeDetailProduct.images.length > 0
      ? activeDetailProduct.images
      : [activeDetailProduct.image];

    const updatedList = currentList.filter(url => url !== imgUrlToRemove);
    let newMainImage = activeDetailProduct.image;

    if (imgUrlToRemove === activeDetailProduct.image) {
      newMainImage = updatedList.length > 0 ? updatedList[0] : '';
    }

    updateProductDetails(activeDetailProduct.id, {
      images: updatedList,
      image: newMainImage
    });

    if (selectedDisplayImage === imgUrlToRemove) {
      setSelectedDisplayImage(newMainImage);
    }
    setToastMessage('🗑️ 사진이 삭제되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSetMainImage = (imgUrl: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeDetailProduct) return;
    updateProductDetails(activeDetailProduct.id, { image: imgUrl });
    setSelectedDisplayImage(imgUrl);
    setToastMessage('⭐ 메인 사진으로 설정되었습니다!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setSelectedConnector('');
    setQuantity(1);
    setIsDetailEditing(false);
  }, [activeDetailProduct]);

  useEffect(() => {
    if (activeDetailProduct) {
      setEditName(activeDetailProduct.name || '');
      setEditImage(activeDetailProduct.image || '');
      setEditSummary(activeDetailProduct.summaryInfo || activeDetailProduct.description || '');
      setEditPrice(activeDetailProduct.price || 0);
      setEditRegularPrice(activeDetailProduct.regularPrice || 0);
      setEditDiscount(activeDetailProduct.discount || 0);
      setEditDelivery(activeDetailProduct.deliveryMethod || '택배');
      setEditShipping(activeDetailProduct.shippingFee || '무료');
      setEditPayment(activeDetailProduct.paymentMethod || '무통장입금');
      setEditOptionLabel(activeDetailProduct.optionLabel || '커넥터길이');
      setEditOptions(activeDetailProduct.options || [
        { id: '5m', label: '5m 커넥터 일체형 (기본 장착)', price: 0 },
        { id: '7m', label: '7m 연장형 (+30,000원)', price: 30000 },
        { id: '10m', label: '10m 최장 전용선 (+50,000원)', price: 50000 }
      ]);
      setEditDeviceOptionGroups(getOptionGroupsForProduct(activeDetailProduct, '단말기 단품'));
      setEditReplaceOptionGroups(getOptionGroupsForProduct(activeDetailProduct, '교체 시공'));
      setEditInstallOptionGroups(getOptionGroupsForProduct(activeDetailProduct, '신규 설치 포함'));

      // Load saved option presets from localStorage or default
      try {
        const savedPresets = localStorage.getItem('sy_cms_option_presets_v2');
        if (savedPresets) {
          const parsed = JSON.parse(savedPresets);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOptionPresetsList(parsed);
          } else {
            setOptionPresetsList(INITIAL_OPTION_PRESETS);
          }
        } else {
          setOptionPresetsList(INITIAL_OPTION_PRESETS);
        }
      } catch (e) {
        setOptionPresetsList(INITIAL_OPTION_PRESETS);
      }
    }
  }, [activeDetailProduct, isDetailEditing]);

  const handleSaveProductDetails = () => {
    if (!activeDetailProduct) return;
    updateProductDetails(activeDetailProduct.id, {
      name: editName,
      image: editImage,
      description: editSummary,
      summaryInfo: editSummary,
      price: editPrice,
      regularPrice: editRegularPrice,
      discount: editDiscount,
      deliveryMethod: editDelivery,
      shippingFee: editShipping,
      paymentMethod: editPayment,
      optionLabel: editOptionLabel,
      options: editOptions,
      deviceOptionGroups: editDeviceOptionGroups,
      replaceOptionGroups: editReplaceOptionGroups,
      installOptionGroups: editInstallOptionGroups
    });
    setIsDetailEditing(false);
    setToastMessage('💾 서비스 유형별 상품 옵션 및 상세정보가 성공적으로 저장되었습니다!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const ensureDefaultHomeProducts = (parsed: Record<string, SolutionProduct[]>) => {
    const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
    const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
    const REMOVED_SET = new Set([
      'res-7kw-chargego',
      'park-11kw-spil',
      'res-7kw-convenient',
      'res-7kw-safe',
      'res-7kw-hyundai',
      'res-7kw-pylon',
      'res-5kw-convenient',
      'res-5kw-safe',
      'sy-canopy-01',
      'sy-stand-01',
      'res-5kw-evsis',
      'sy-home07',
      'res-7kw-evsis',
      'res-11kw-evsis'
    ]);
    
    const isLotteProduct = (p: any) => {
      if (!p) return false;
      const id = String(p.id || '').toLowerCase();
      const name = String(p.name || '').toLowerCase();
      const brand = String(p.brand || '').toLowerCase();
      const mfr = String(p.manufacturer || '').toLowerCase();
      return id.includes('evsis') || name.includes('롯데') || name.includes('evsis') || name.includes('이브이시스') || brand.includes('롯데') || brand.includes('evsis') || brand.includes('이브이시스') || mfr.includes('롯데') || mfr.includes('evsis');
    };

    const result: Record<string, SolutionProduct[]> = {};
    let modified = false;

    let savedMainList: any[] = [];
    try {
      const savedMain = localStorage.getItem('sy_cms_products_v12');
      if (savedMain) savedMainList = JSON.parse(savedMain);
    } catch (e) {}

    const getCanonicalProductImage = (prodId?: string, prodName?: string) => {
      const s = `${prodId || ''} ${prodName || ''}`.toLowerCase();
      if (s.includes('50kw') || s.includes('급속') || s.includes('dc50')) return '/50kw-쿨차지.png';
      if (s.includes('스필') || s.includes('sy-ac')) return '/스필.png';
      if (s.includes('쿨차지') || s.includes('coolcharge')) return '/쿨차지.png';
      if (s.includes('일렉트리') || s.includes('electree')) return '/일렉트리.png';
      if (s.includes('차지고') || s.includes('chargego')) return '/차지고.png';
      return '/스필.png';
    };

    const findMainImage = (prodId: string, prodName?: string) => {
      if (!savedMainList.length) return '';
      const m = savedMainList.find((mp: any) =>
        (mp.id && prodId && mp.id === prodId) ||
        (mp.name && prodName && mp.name.trim().toLowerCase() === prodName.trim().toLowerCase()) ||
        ((prodId === 'sy-ac11-bi' || prodId === 'res-11kw-spil') && (mp.id === 'sy-ac11-bi' || mp.id === 'res-11kw-spil')) ||
        ((prodId === 'sy-ac07' || prodId === 'res-7kw-spil') && (mp.id === 'sy-ac07' || mp.id === 'res-7kw-spil')) ||
        ((prodId === 'sy-ac05' || prodId === 'res-5kw-spil') && (mp.id === 'sy-ac05' || mp.id === 'res-5kw-spil'))
      );
      const img = m?.image?.trim() || '';
      if (img && !img.includes('unsplash.com')) return img;
      return '';
    };

    Object.keys(HOME_PRODUCTS_DATA).forEach((cat) => {
      // First clean up any removed items in existing parsed list
      const existingRaw = parsed[cat] || HOME_PRODUCTS_DATA[cat] || [];
      const cleanedExisting = existingRaw
        .filter(p => p && !REMOVED_SET.has(p.id) && !deletedSet.has(p.id) && !isLotteProduct(p))
        .map(p => {
          let currentImage = p.image || '';
          if (!currentImage || currentImage.includes('unsplash.com')) {
            const canonical = getCanonicalProductImage(p.id, p.name);
            modified = true;
            return { ...p, image: canonical };
          }
          const mainImg = findMainImage(p.id, p.name);
          if (mainImg && p.image !== mainImg) {
            modified = true;
            return { ...p, image: mainImg };
          }
          return p;
        });
      
      if (cleanedExisting.length !== existingRaw.length) {
        modified = true;
      }

      const existingList = [...cleanedExisting];
      HOME_PRODUCTS_DATA[cat].forEach((defaultProd) => {
        if (!REMOVED_SET.has(defaultProd.id) && !deletedSet.has(defaultProd.id)) {
          const exists = existingList.some(p => 
            p.id === defaultProd.id || 
            (p.name && p.name.trim() === defaultProd.name.trim()) || 
            ((defaultProd.id === 'sy-ac11-bi' || defaultProd.id === 'res-11kw-spil') && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil')) ||
            ((defaultProd.id === 'sy-ac07' || defaultProd.id === 'res-7kw-spil') && (p.id === 'sy-ac07' || p.id === 'res-7kw-spil')) ||
            ((defaultProd.id === 'sy-ac05' || defaultProd.id === 'res-5kw-spil') && (p.id === 'sy-ac05' || p.id === 'res-5kw-spil'))
          );
          if (!exists) {
            const mainImg = findMainImage(defaultProd.id, defaultProd.name);
            existingList.unshift({
              ...defaultProd,
              image: mainImg || defaultProd.image
            });
            modified = true;
          }
        }
      });
      result[cat] = existingList;
    });

    if (parsed) {
      Object.keys(parsed).forEach((cat) => {
        if (!result[cat]) {
          result[cat] = (parsed[cat] || []).filter((p: any) => p && !REMOVED_SET.has(p.id) && !deletedSet.has(p.id) && !isLotteProduct(p));
        }
      });
    }

    if (modified) {
      try {
        localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(result));
      } catch (e) {}
    }

    return result;
  };

  const [homeProducts, setHomeProducts] = useState<Record<string, SolutionProduct[]>>(() => {
    const saved = localStorage.getItem('sy_cms_home_products_v6_fixed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return ensureDefaultHomeProducts(parsed);
      } catch (e) {
        return ensureDefaultHomeProducts(HOME_PRODUCTS_DATA);
      }
    }
    return ensureDefaultHomeProducts(HOME_PRODUCTS_DATA);
  });

  const ensureDefaultParkingProducts = (parsed: Record<string, SolutionProduct[]>) => {
    const savedDeleted = localStorage.getItem('sy_cms_deleted_product_ids');
    const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
    const REMOVED_SET = new Set([
      'sy-ac11',
      'park-11kw-convenient',
      'sy-fc200'
    ]);

    const result: Record<string, SolutionProduct[]> = {};
    let modified = false;

    Object.keys(PARKING_PRODUCTS_DATA).forEach((cat) => {
      const defaultList = PARKING_PRODUCTS_DATA[cat] || [];
      const rawCurrent = parsed && parsed[cat] ? parsed[cat] : defaultList;
      const cleanedCurrent = rawCurrent.filter(p => p && !REMOVED_SET.has(p.id) && !deletedSet.has(p.id));

      if (cleanedCurrent.length !== rawCurrent.length) {
        modified = true;
      }

      const mergedList: SolutionProduct[] = [];
      const seenIds = new Set<string>();

      // Preserve existing user customizations (including custom images!)
      cleanedCurrent.forEach(existing => {
        if (!existing) return;
        const normalizedExisting = { ...existing };
        if (normalizedExisting.id === 'sy-dc50') {
          normalizedExisting.id = 'park-50kw-1ch-coolcharge';
        }
        if (seenIds.has(normalizedExisting.id)) return;
        seenIds.add(normalizedExisting.id);
        const def = defaultList.find(d => 
          d.id === normalizedExisting.id || 
          (d.name && normalizedExisting.name && d.name.trim() === normalizedExisting.name.trim()) ||
          ((d.id === 'park-50kw-1ch-coolcharge' || d.id === 'sy-dc50') && (normalizedExisting.id === 'park-50kw-1ch-coolcharge' || normalizedExisting.id === 'sy-dc50' || (normalizedExisting.name && normalizedExisting.name.includes('50kW'))))
        );
        if (def) {
          seenIds.add(def.id);
        }

        let customImgFromMain = '';
        try {
          const savedMain = localStorage.getItem('sy_cms_products_v12');
          if (savedMain) {
            const parsedMain = JSON.parse(savedMain);
            const m = parsedMain.find((mp: any) =>
              (mp.id && normalizedExisting.id && mp.id === normalizedExisting.id) ||
              (mp.name && normalizedExisting.name && mp.name.trim() === normalizedExisting.name.trim()) ||
              ((normalizedExisting.id === 'park-50kw-1ch-coolcharge' || normalizedExisting.id === 'sy-dc50' || (normalizedExisting.name && normalizedExisting.name.toLowerCase().includes('50kw'))) && (mp.id === 'park-50kw-1ch-coolcharge' || mp.id === 'sy-dc50' || (mp.name && mp.name.toLowerCase().includes('50kw'))))
            );
            if (m?.image && m.image.trim()) {
              customImgFromMain = m.image.trim();
            }
          }
        } catch (e) {}

        const finalImage = customImgFromMain || normalizedExisting.image || def?.image || '';

        mergedList.push({
          ...(def || {}),
          ...normalizedExisting,
          image: finalImage,
          discount: normalizedExisting.discount !== undefined ? normalizedExisting.discount : (def?.discount || 0),
          regularPrice: normalizedExisting.regularPrice !== undefined ? normalizedExisting.regularPrice : (def?.regularPrice || 0),
          price: normalizedExisting.price !== undefined ? normalizedExisting.price : (def?.price || 0)
        });
      });

      // Add default chargers if they haven't been added yet and aren't deleted
      defaultList.forEach(def => {
        const isAlreadyAdded = seenIds.has(def.id) || mergedList.some(m => 
          m.id === def.id || 
          (m.name && def.name && m.name.trim() === def.name.trim()) ||
          ((def.id === 'park-50kw-1ch-coolcharge' || def.id === 'sy-dc50') && (m.id === 'park-50kw-1ch-coolcharge' || m.id === 'sy-dc50' || (m.name && m.name.toLowerCase().includes('50kw'))))
        );
        if (!REMOVED_SET.has(def.id) && !deletedSet.has(def.id) && !isAlreadyAdded) {
          seenIds.add(def.id);
          mergedList.push({ ...def });
          modified = true;
        }
      });

      result[cat] = mergedList;
    });

    if (parsed) {
      Object.keys(parsed).forEach((cat) => {
        if (!result[cat]) {
          result[cat] = (parsed[cat] || []).filter((p: any) => p && !REMOVED_SET.has(p.id) && !deletedSet.has(p.id));
        }
      });
    }

    if (modified) {
      try {
        localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(result));
        localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(result));
      } catch (e) {}
    }

    return result;
  };

  const [parkingProducts, setParkingProducts] = useState<Record<string, SolutionProduct[]>>(() => {
    const saved = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
    if (saved) {
      try {
        return ensureDefaultParkingProducts(JSON.parse(saved));
      } catch (e) {
        return ensureDefaultParkingProducts(PARKING_PRODUCTS_DATA);
      }
    }
    return ensureDefaultParkingProducts(PARKING_PRODUCTS_DATA);
  });

  // Real-time synchronization listener for CMS updates
  useEffect(() => {
    const handleProductsUpdate = () => {
      const savedHome = localStorage.getItem('sy_cms_home_products_v6_fixed');
      if (savedHome) {
        try { setHomeProducts(ensureDefaultHomeProducts(JSON.parse(savedHome))); } catch (e) {}
      }
      const savedParking = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
      if (savedParking) {
        try { setParkingProducts(ensureDefaultParkingProducts(JSON.parse(savedParking))); } catch (e) {}
      }
    };

    window.addEventListener('sy_cms_products_update', handleProductsUpdate);
    window.addEventListener('storage', handleProductsUpdate);
    return () => {
      window.removeEventListener('sy_cms_products_update', handleProductsUpdate);
      window.removeEventListener('storage', handleProductsUpdate);
    };
  }, []);

  // Product CRUD states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SolutionProduct | null>(null);
  const [editingProductType, setEditingProductType] = useState<'home' | 'parking'>('home');
  const [editingCategory, setEditingCategory] = useState<string>('7kW');

  // Product Form states
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormRegularPrice, setProdFormRegularPrice] = useState(0);
  const [prodFormPrice, setProdFormPrice] = useState(0);
  const [prodFormReplacementPrice, setProdFormReplacementPrice] = useState(0);
  const [prodFormReplacementRegularPrice, setProdFormReplacementRegularPrice] = useState(0);
  const [prodFormInstallIncludedPrice, setProdFormInstallIncludedPrice] = useState(0);
  const [prodFormInstallIncludedRegularPrice, setProdFormInstallIncludedRegularPrice] = useState(0);
  const [prodFormDiscount, setProdFormDiscount] = useState(0);
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormTags, setProdFormTags] = useState('');
  const [prodFormHasASBadge, setProdFormHasASBadge] = useState(false);
  const [prodFormHasPromoRibbon, setProdFormHasPromoRibbon] = useState(false);
  const [isDraggingProdImage, setIsDraggingProdImage] = useState(false);

  // Sync to activeDetailProduct if it changed or was updated in real-time
  useEffect(() => {
    if (activeDetailProduct) {
      // Find up-to-date info if it was edited
      let found: SolutionProduct | undefined = undefined;
      Object.values(homeProducts).forEach((arr) => {
        const typedArr = arr as SolutionProduct[];
        const match = typedArr.find(p => p.id === activeDetailProduct.id || (p.name && activeDetailProduct.name && p.name.trim() === activeDetailProduct.name.trim()));
        if (match) found = match;
      });
      if (!found) {
        Object.values(parkingProducts).forEach((arr) => {
          const typedArr = arr as SolutionProduct[];
          const match = typedArr.find(p => p.id === activeDetailProduct.id || (p.name && activeDetailProduct.name && p.name.trim() === activeDetailProduct.name.trim()));
          if (match) found = match;
        });
      }
      if (found) {
        setActiveDetailProduct(found);
      }
    }
  }, [homeProducts, parkingProducts]);

  // Automatically exit detail view when sub-nav filters or tabs change
  useEffect(() => {
    if (activeDetailProduct) {
      setActiveDetailProduct(null);
    }
  }, [selectedHomeServiceType, selectedHomePower, selectedAptBrand, selectedParkingCapacity]);

  const saveHomeProducts = (data: Record<string, SolutionProduct[]>) => {
    setHomeProducts(data);
    try {
      localStorage.setItem('sy_cms_home_products_v6_fixed', JSON.stringify(data));
      window.dispatchEvent(new Event('sy_cms_products_update'));
    } catch (e) {
      console.error('Failed to save home products to localStorage:', e);
    }
  };

  const saveParkingProducts = (data: Record<string, SolutionProduct[]>) => {
    setParkingProducts(data);
    try {
      localStorage.setItem('sy_cms_parking_products_v5_fixed', JSON.stringify(data));
      localStorage.setItem('sy_cms_parking_products_v6_fixed', JSON.stringify(data));
      window.dispatchEvent(new Event('sy_cms_products_update'));
    } catch (e) {
      console.error('Failed to save parking products to localStorage:', e);
    }
  };

  const updateProductDetails = (productId: string, updatedFields: Partial<SolutionProduct>) => {
    let foundInHome = false;
    let foundInParking = false;

    // Check homeProducts
    const updatedHome = { ...homeProducts };
    Object.keys(updatedHome).forEach((category) => {
      const arr = [...(updatedHome[category] || [])];
      const index = arr.findIndex(p => 
        p.id === productId || 
        (p.name && updatedFields.name && p.name.trim() === updatedFields.name.trim()) || 
        (activeDetailProduct && (p.id === activeDetailProduct.id || (p.name && activeDetailProduct.name && p.name.trim() === activeDetailProduct.name.trim()))) ||
        ((productId === 'sy-ac11-bi' || productId === 'res-11kw-spil') && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil'))
      );
      if (index !== -1) {
        arr[index] = { ...arr[index], ...updatedFields };
        updatedHome[category] = arr;
        foundInHome = true;
      }
    });
    if (foundInHome) {
      saveHomeProducts(updatedHome);
    }

    // Check parkingProducts
    const updatedParking = { ...parkingProducts };
    Object.keys(updatedParking).forEach((category) => {
      const arr = [...(updatedParking[category] || [])];
      const index = arr.findIndex(p => 
        p.id === productId || 
        (p.name && updatedFields.name && p.name.trim() === updatedFields.name.trim()) || 
        (activeDetailProduct && (p.id === activeDetailProduct.id || (p.name && activeDetailProduct.name && p.name.trim() === activeDetailProduct.name.trim()))) ||
        ((productId === 'park-50kw-1ch-coolcharge' || productId === 'sy-dc50' || (activeDetailProduct && (activeDetailProduct.id === 'park-50kw-1ch-coolcharge' || activeDetailProduct.name?.includes('50kW')))) && (p.id === 'park-50kw-1ch-coolcharge' || p.id === 'sy-dc50' || (p.name && p.name.includes('50kW'))))
      );
      if (index !== -1) {
        arr[index] = { ...arr[index], ...updatedFields };
        updatedParking[category] = arr;
        foundInParking = true;
      }
    });
    if (foundInParking) {
      saveParkingProducts(updatedParking);
    }

    setActiveDetailProduct(prev => {
      if (!prev) return prev;
      const isMatch = prev.id === productId || 
        (prev.name && updatedFields.name && prev.name.trim() === updatedFields.name.trim()) ||
        (activeDetailProduct && (prev.id === activeDetailProduct.id || (prev.name && activeDetailProduct.name && prev.name.trim() === activeDetailProduct.name.trim()))) ||
        ((productId === 'park-50kw-1ch-coolcharge' || productId === 'sy-dc50') && (prev.id === 'park-50kw-1ch-coolcharge' || prev.id === 'sy-dc50' || (prev.name && prev.name.includes('50kW'))));
      return isMatch ? { ...prev, ...updatedFields } : prev;
    });

    // Sync to sy_cms_products_v12 and sy_cms_products
    try {
      const savedProds = localStorage.getItem('sy_cms_products_v12');
      if (savedProds) {
        const parsedProds: any[] = JSON.parse(savedProds);
        const updatedProds = parsedProds.map(p => {
          if (
            p.id === productId || 
            (p.name && updatedFields.name && p.name.trim() === updatedFields.name.trim()) || 
            (activeDetailProduct && (p.id === activeDetailProduct.id || (p.name && p.name.trim() === activeDetailProduct.name.trim()))) || 
            ((productId === 'sy-ac11-bi' || productId === 'res-11kw-spil') && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil')) ||
            ((productId === 'park-50kw-1ch-coolcharge' || productId === 'sy-dc50' || (activeDetailProduct && (activeDetailProduct.id === 'park-50kw-1ch-coolcharge' || activeDetailProduct.name?.includes('50kW')))) && (p.id === 'park-50kw-1ch-coolcharge' || p.id === 'sy-dc50' || (p.name && p.name.includes('50kW'))))
          ) {
            return {
              ...p,
              name: updatedFields.name !== undefined ? updatedFields.name : p.name,
              image: updatedFields.image !== undefined ? updatedFields.image : p.image,
              description: updatedFields.description !== undefined ? updatedFields.description : p.description,
              price: updatedFields.price !== undefined ? updatedFields.price : p.price,
              originalPrice: updatedFields.regularPrice !== undefined ? updatedFields.regularPrice : p.originalPrice,
              discountRate: updatedFields.discount !== undefined ? updatedFields.discount : p.discountRate,
              replacementPrice: updatedFields.replacementPrice !== undefined ? updatedFields.replacementPrice : p.replacementPrice,
              replacementRegularPrice: updatedFields.replacementRegularPrice !== undefined ? updatedFields.replacementRegularPrice : p.replacementRegularPrice,
              installIncludedPrice: updatedFields.installIncludedPrice !== undefined ? updatedFields.installIncludedPrice : p.installIncludedPrice,
              installIncludedRegularPrice: updatedFields.installIncludedRegularPrice !== undefined ? updatedFields.installIncludedRegularPrice : p.installIncludedRegularPrice,
              serviceType: updatedFields.serviceType !== undefined ? updatedFields.serviceType : p.serviceType,
              deliveryInfo: updatedFields.deliveryMethod !== undefined ? updatedFields.deliveryMethod : p.deliveryInfo,
              componentsInfo: updatedFields.shippingFee !== undefined ? updatedFields.shippingFee : p.componentsInfo,
              rewardPointsInfo: updatedFields.paymentMethod !== undefined ? updatedFields.paymentMethod : p.rewardPointsInfo,
              optionGroups: updatedFields.optionGroups !== undefined ? updatedFields.optionGroups : p.optionGroups
            };
          }
          return p;
        });
        localStorage.setItem('sy_cms_products_v12', JSON.stringify(updatedProds));
        localStorage.setItem('sy_cms_products', JSON.stringify(updatedProds));
      }
    } catch (e) {
      console.error('Error syncing updateProductDetails to sy_cms_products_v12:', e);
    }
  };

  const [brands, setBrands] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = {};
    let deletedBrandKeys: string[] = [];
    try {
      const raw = localStorage.getItem('sy_cms_deleted_brand_catalogs');
      if (raw) deletedBrandKeys = JSON.parse(raw);
    } catch (e) {}

    Object.keys(BRAND_METADATA).forEach(k => {
      const isDeleted = deletedBrandKeys.includes(k);
      const def = DEFAULT_BRAND_CATALOGS[k];
      base[k] = {
        ...BRAND_METADATA[k],
        pdfUrl: isDeleted ? undefined : resolvePostImgUrl(def?.pdfUrl),
        pdfName: isDeleted ? undefined : def?.pdfName
      };
    });

    const saved = localStorage.getItem('sy_cms_brands');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, any> = {};
        Object.keys(parsed).forEach(k => {
          if (k === 'nice인프라' || k === 'NICE인프라' || k.includes('현대엔지니어링')) return;
          const rawUrl = resolvePostImgUrl(parsed[k]?.pdfUrl);
          const isOldPlaceholder = rawUrl === '/스필.png' || rawUrl === '/쿨차지.png' || rawUrl === '/일렉트리.png' || rawUrl === '/차지고.png' || rawUrl === '/50kw-쿨차지.png';
          cleaned[k] = {
            ...parsed[k],
            pdfUrl: (!isOldPlaceholder && rawUrl) ? rawUrl : base[k]?.pdfUrl,
            pdfName: parsed[k]?.pdfName || base[k]?.pdfName
          };
        });
        const merged = { ...base, ...cleaned };
        delete merged['nice인프라'];
        delete merged['NICE인프라'];
        delete merged['현대엔지니어링'];
        delete merged['현대엔지니어링(E-pit)'];
        return merged;
      } catch (e) {
        return base;
      }
    }
    return base;
  });

  // Load merged catalogs and product details across IndexedDB, localStorage, and Firestore with live real-time sync
  useEffect(() => {
    let isMounted = true;
    const loadAllCatalogsAndDetails = async () => {
      try {
        const [brandCats, prodDetails] = await Promise.all([
          loadUnifiedBrandCatalogs(),
          loadUnifiedProductDetails()
        ]);

        if (isMounted) {
          setBrands(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(brandKey => {
              const cat = brandCats[brandKey] || resolveBrandCatalog(brandKey, brandCats);
              const def = DEFAULT_BRAND_CATALOGS[brandKey] || DEFAULT_BRAND_CATALOGS[brandKey.toLowerCase()];
              const isDeleted = (cat as { deleted?: boolean })?.deleted;
              updated[brandKey] = {
                ...updated[brandKey],
                pdfUrl: isDeleted ? undefined : (cat?.pdfUrl || def?.pdfUrl || updated[brandKey]?.pdfUrl),
                pdfName: isDeleted ? undefined : (cat?.pdfName || def?.pdfName || updated[brandKey]?.pdfName)
              };
            });
            return updated;
          });

          setProductDetails(prodDetails);
        }
      } catch (err) {
        console.error('Error loading brand catalogs and product details:', err);
      }
    };
    loadAllCatalogsAndDetails();

    const handleDetailsUpdate = () => {
      loadAllCatalogsAndDetails();
    };

    window.addEventListener('sy_cms_brand_catalogs_update', handleDetailsUpdate);
    window.addEventListener('sy_cms_product_details_update', handleDetailsUpdate);
    window.addEventListener('sy_cms_data_sync_completed', handleDetailsUpdate);

    // Real-time Firestore onSnapshot listener for instant sync on guest and mobile devices
    let unsubscribeBrandCatalogs: (() => void) | undefined;
    let unsubscribeProductDetails: (() => void) | undefined;

    try {
      unsubscribeBrandCatalogs = onSnapshot(collection(db, 'brandCatalogs'), (snapshot) => {
        if (!isMounted) return;
        setBrands(prev => {
          const updated = { ...prev };
          snapshot.forEach(docSnap => {
            const brandKey = docSnap.id;
            const data = docSnap.data() as { pdfUrl?: string; pdfName?: string; deleted?: boolean };
            if (data && !data.deleted && (data.pdfUrl || data.pdfName)) {
              if (updated[brandKey]) {
                updated[brandKey] = {
                  ...updated[brandKey],
                  pdfUrl: data.pdfUrl,
                  pdfName: data.pdfName
                };
              }
            } else if (data?.deleted) {
              if (updated[brandKey]) {
                updated[brandKey] = {
                  ...updated[brandKey],
                  pdfUrl: undefined,
                  pdfName: undefined
                };
              }
            }
          });
          return updated;
        });
      }, (err) => {
        console.warn('brandCatalogs real-time listener error:', err);
      });
    } catch (e) {
      console.warn('Failed to attach brandCatalogs snapshot listener:', e);
    }

    try {
      unsubscribeProductDetails = onSnapshot(collection(db, 'productDetails'), (snapshot) => {
        if (!isMounted) return;
        setProductDetails(prev => {
          const updated = { ...prev };
          snapshot.forEach(docSnap => {
            const key = docSnap.id;
            const data = docSnap.data() as any;
            if (data && !data.deleted) {
              updated[key] = {
                ...updated[key],
                ...data,
                deleted: false
              };
            } else if (data?.deleted) {
              updated[key] = {
                ...updated[key],
                deleted: true,
                pdfUrls: [],
                pdfNames: [],
                pdfUrl: '',
                pdfName: ''
              };
            }
          });
          return updated;
        });
      }, (err) => {
        console.warn('productDetails real-time listener error:', err);
      });
    } catch (e) {
      console.warn('Failed to attach productDetails snapshot listener:', e);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('sy_cms_brand_catalogs_update', handleDetailsUpdate);
      window.removeEventListener('sy_cms_product_details_update', handleDetailsUpdate);
      window.removeEventListener('sy_cms_data_sync_completed', handleDetailsUpdate);
      if (unsubscribeBrandCatalogs) unsubscribeBrandCatalogs();
      if (unsubscribeProductDetails) unsubscribeProductDetails();
    };
  }, []);


  const [isDraggingProductPdf, setIsDraggingProductPdf] = useState<Record<string, boolean>>({});

  const handleProductPdfUpload = async (productId: string, fileInput: FileList | File[] | File) => {
    const fileArray = fileInput instanceof FileList ? Array.from(fileInput) : Array.isArray(fileInput) ? fileInput : [fileInput];
    if (fileArray.length === 0) return;

    const validFiles = fileArray.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf') || f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('PDF 파일 또는 이미지 파일(PNG/JPG/JPEG)만 업로드할 수 있습니다.');
      return;
    }

    try {
      const key = `product-${productId}`;
      const existing = productDetails[key] || {};
      const existingUrls = existing.pdfUrls && existing.pdfUrls.length > 0
        ? existing.pdfUrls
        : (existing.pdfUrl ? [existing.pdfUrl] : []);
      const existingNames = existing.pdfNames && existing.pdfNames.length > 0
        ? existing.pdfNames
        : (existing.pdfName ? [existing.pdfName] : []);

      const newAssets: { url: string; name: string }[] = [];
      for (const file of validFiles) {
        const downloadUrl = await uploadFileToFirebaseStorage(file, 'product-details', `${productId}_${file.name}`);
        if (downloadUrl) {
          newAssets.push({ url: downloadUrl, name: file.name });
        } else {
          // Fallback to FileReader if offline
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newAssets.push({ url: dataUrl, name: file.name });
        }
      }

      const updatedUrls = [...existingUrls, ...newAssets.map(a => a.url)];
      const updatedNames = [...existingNames, ...newAssets.map(a => a.name)];

      const updatedObj = {
        pdfUrls: updatedUrls,
        pdfNames: updatedNames,
        pdfUrl: updatedUrls[0],
        pdfName: updatedNames[0]
      };

      await saveUnifiedProductDetail(key, updatedObj);
      setProductDetails(prev => ({
        ...prev,
        [key]: updatedObj
      }));
    } catch (err) {
      console.error('Error uploading product files to Firebase Storage:', err);
      alert('파일 업로드 도중 오류가 발생했습니다.');
    }
  };

  const handleDeleteProductSingleFile = async (productId: string, index: number) => {
    const key = `product-${productId}`;
    const rawId = productId.replace(/^product-/, '');
    const currentDetail = resolveDetailData(
      activeDetailProduct || { id: productId },
      productDetails
    );

    const existingUrls = currentDetail.pdfUrls && currentDetail.pdfUrls.length > 0
      ? currentDetail.pdfUrls
      : (currentDetail.pdfUrl ? [currentDetail.pdfUrl] : []);
    const existingNames = currentDetail.pdfNames && currentDetail.pdfNames.length > 0
      ? currentDetail.pdfNames
      : (currentDetail.pdfName ? [currentDetail.pdfName] : []);

    if (existingUrls.length === 0) return;

    const updatedUrls = existingUrls.filter((_, i) => i !== index);
    const updatedNames = existingNames.filter((_, i) => i !== index);

    if (updatedUrls.length === 0) {
      await deleteUnifiedProductDetail(key);
      await deleteUnifiedProductDetail(rawId);
      setProductDetails(prev => ({
        ...prev,
        [key]: { deleted: true, pdfUrls: [], pdfNames: [], pdfUrl: '', pdfName: '' },
        [rawId]: { deleted: true, pdfUrls: [], pdfNames: [], pdfUrl: '', pdfName: '' }
      }));
    } else {
      const updatedObj = {
        pdfUrls: updatedUrls,
        pdfNames: updatedNames,
        pdfUrl: updatedUrls[0],
        pdfName: updatedNames[0],
        deleted: false
      };
      await saveUnifiedProductDetail(key, updatedObj);
      setProductDetails(prev => ({
        ...prev,
        [key]: updatedObj,
        [rawId]: updatedObj
      }));
    }
  };

  const confirmDeleteProductSingleFile = (productId: string, index: number, fileName?: string) => {
    setDeleteModalConfig({
      isOpen: true,
      title: '상세페이지 파일 삭제 확인',
      targetName: fileName || `상세페이지 이미지 #${index + 1}`,
      description: '선택하신 상세페이지 이미지/PDF 파일을 상세페이지 목록에서 삭제하시겠습니까?',
      warningNote: '삭제 시 상세페이지 목록에서 즉시 제거되며, 다시 업로드할 때까지 노출되지 않습니다.',
      confirmLabel: '파일 삭제',
      onConfirm: () => handleDeleteProductSingleFile(productId, index)
    });
  };

  const handleReorderProductFile = async (productId: string, fromIndex: number, toIndex: number) => {
    const key = `product-${productId}`;
    const rawId = productId.replace(/^product-/, '');
    const currentDetail = resolveDetailData(
      activeDetailProduct || { id: productId },
      productDetails
    );

    const existingUrls = [...(currentDetail.pdfUrls && currentDetail.pdfUrls.length > 0 ? currentDetail.pdfUrls : (currentDetail.pdfUrl ? [currentDetail.pdfUrl] : []))];
    const existingNames = [...(currentDetail.pdfNames && currentDetail.pdfNames.length > 0 ? currentDetail.pdfNames : (currentDetail.pdfName ? [currentDetail.pdfName] : []))];

    if (toIndex < 0 || toIndex >= existingUrls.length) return;

    const [movedUrl] = existingUrls.splice(fromIndex, 1);
    const [movedName] = existingNames.splice(fromIndex, 1);

    existingUrls.splice(toIndex, 0, movedUrl);
    existingNames.splice(toIndex, 0, movedName);

    const updatedObj = {
      pdfUrls: existingUrls,
      pdfNames: existingNames,
      pdfUrl: existingUrls[0],
      pdfName: existingNames[0],
      deleted: false
    };
    await saveUnifiedProductDetail(key, updatedObj);
    setProductDetails(prev => ({
      ...prev,
      [key]: updatedObj,
      [rawId]: updatedObj
    }));
  };

  const handleDeleteProductPdf = async (productId: string) => {
    const key = `product-${productId}`;
    const rawId = productId.replace(/^product-/, '');
    try {
      await deleteUnifiedProductDetail(key);
      await deleteUnifiedProductDetail(rawId);
      setProductDetails(prev => ({
        ...prev,
        [key]: { deleted: true, pdfUrls: [], pdfNames: [], pdfUrl: '', pdfName: '' },
        [rawId]: { deleted: true, pdfUrls: [], pdfNames: [], pdfUrl: '', pdfName: '' }
      }));
    } catch (dbError) {
      console.error('Failed to delete product detail:', dbError);
    }
  };

  const confirmDeleteProductPdf = (productId: string, prodName?: string) => {
    setDeleteModalConfig({
      isOpen: true,
      title: '상세페이지 전체 삭제 확인',
      targetName: prodName ? `${prodName} 상세페이지 전체` : '등록된 상세페이지 전체',
      description: '등록된 모든 상세페이지 이미지와 PDF 문서를 전체 삭제하시겠습니까?',
      warningNote: '삭제 시 등록된 모든 상세페이지가 즉시 삭제되며, 새로운 상세페이지 이미지를 언제든 다시 등록하실 수 있습니다.',
      confirmLabel: '상세페이지 전체 삭제',
      onConfirm: () => handleDeleteProductPdf(productId)
    });
  };

  const startAddProduct = (type: 'home' | 'parking', category: string) => {
    setEditingProduct(null);
    setEditingProductType(type);
    setEditingCategory(category);
    
    setProdFormName('');
    setProdFormRegularPrice(500000);
    setProdFormPrice(400000);
    setProdFormReplacementPrice(550000);
    setProdFormReplacementRegularPrice(680000);
    setProdFormInstallIncludedPrice(750000);
    setProdFormInstallIncludedRegularPrice(900000);
    setProdFormDiscount(20);
    setProdFormImage('/스필.png');
    setProdFormTags(type === 'home' ? 'MD CHOICE, HIT' : 'BEST, HIT');
    setProdFormHasASBadge(type === 'home');
    setProdFormHasPromoRibbon(false);
    
    setIsProductModalOpen(true);
  };

  const startEditProduct = (product: SolutionProduct, type: 'home' | 'parking', category: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setActiveDetailProduct(null);
    setEditingProduct(product);
    setEditingProductType(type);
    setEditingCategory(category);

    setProdFormName(product.name || '');
    const baseP = product.price || 0;
    const baseReg = product.regularPrice || baseP;

    setProdFormRegularPrice(baseReg);
    setProdFormPrice(baseP);

    const repP = (product as any).replacementPrice !== undefined ? (product as any).replacementPrice : (baseP ? baseP + 150000 : 0);
    const repRegP = (product as any).replacementRegularPrice !== undefined ? (product as any).replacementRegularPrice : (baseReg ? baseReg + 180000 : 0);
    const instP = (product as any).installIncludedPrice !== undefined ? (product as any).installIncludedPrice : (baseP ? baseP + 350000 : 0);
    const instRegP = (product as any).installIncludedRegularPrice !== undefined ? (product as any).installIncludedRegularPrice : (baseReg ? baseReg + 400000 : 0);

    setProdFormReplacementPrice(repP);
    setProdFormReplacementRegularPrice(repRegP);
    setProdFormInstallIncludedPrice(instP);
    setProdFormInstallIncludedRegularPrice(instRegP);

    setProdFormDiscount(product.discount || 0);
    setProdFormImage(product.image || '');
    setProdFormTags(product.tags ? product.tags.join(', ') : '');
    setProdFormHasASBadge(!!product.hasASBadge);
    setProdFormHasPromoRibbon(!!product.hasPromoRibbon);

    setIsProductModalOpen(true);
  };

  const executeDeleteProduct = (productId: string, type: 'home' | 'parking', category: string) => {
    if (type === 'home') {
      const updated = { ...homeProducts };
      if (updated[category]) {
        updated[category] = updated[category].filter(p => p.id !== productId);
        saveHomeProducts(updated);
      }
    } else {
      const updated = { ...parkingProducts };
      if (updated[category]) {
        updated[category] = updated[category].filter(p => p.id !== productId);
        saveParkingProducts(updated);
      }
    }

    try {
      const savedMain = localStorage.getItem('sy_cms_products_v12');
      if (savedMain) {
        const mainArr = JSON.parse(savedMain);
        const nextMain = mainArr.filter((p: any) => p.id !== productId);
        localStorage.setItem('sy_cms_products_v12', JSON.stringify(nextMain));
        localStorage.setItem('sy_cms_products', JSON.stringify(nextMain));
      }
    } catch (e) {}

    window.dispatchEvent(new Event('sy_cms_products_update'));
    setToastMessage('🗑️ 상품이 성공적으로 삭제되었습니다.');
  };

  const deleteProduct = (productId: string, type: 'home' | 'parking', category: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const list = type === 'home' ? (homeProducts[category] || []) : (parkingProducts[category] || []);
    const targetProd = list.find(p => p.id === productId);
    const prodName = targetProd ? targetProd.name : productId;

    setDeleteModalConfig({
      isOpen: true,
      title: '충전기 상품 삭제 확인',
      targetName: prodName,
      description: `정말 '${prodName}' 충전기 상품을 솔루션 및 관리자 목록에서 삭제하시겠습니까?`,
      warningNote: '삭제된 상품은 고객 쇼핑몰 및 관리자 페이지에서 즉시 제외됩니다.',
      confirmLabel: '상품 삭제',
      onConfirm: () => executeDeleteProduct(productId, type, category)
    });
  };

  const saveProductForm = () => {
    if (!prodFormName.trim()) {
      alert('상품명을 입력해 주세요.');
      return;
    }

    const tagsArray = prodFormTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const calculatedDiscount = prodFormRegularPrice > 0 
      ? Math.round(((prodFormRegularPrice - prodFormPrice) / prodFormRegularPrice) * 100)
      : prodFormDiscount;

    const repDiscount = prodFormReplacementRegularPrice > 0
      ? Math.round(((prodFormReplacementRegularPrice - prodFormReplacementPrice) / prodFormReplacementRegularPrice) * 100)
      : 0;

    const instDiscount = prodFormInstallIncludedRegularPrice > 0
      ? Math.round(((prodFormInstallIncludedRegularPrice - prodFormInstallIncludedPrice) / prodFormInstallIncludedRegularPrice) * 100)
      : 0;

    let targetId = '';

    if (editingProduct) {
      targetId = editingProduct.id;
      // Edit mode
      if (editingProductType === 'home') {
        const updated = { ...homeProducts };
        if (updated[editingCategory]) {
          updated[editingCategory] = updated[editingCategory].map(p => {
            if (p.id === editingProduct.id) {
              return {
                ...p,
                name: prodFormName,
                regularPrice: Number(prodFormRegularPrice),
                price: Number(prodFormPrice),
                discount: calculatedDiscount,
                replacementPrice: Number(prodFormReplacementPrice),
                replacementRegularPrice: Number(prodFormReplacementRegularPrice),
                replacementDiscount: repDiscount,
                installIncludedPrice: Number(prodFormInstallIncludedPrice),
                installIncludedRegularPrice: Number(prodFormInstallIncludedRegularPrice),
                installIncludedDiscount: instDiscount,
                serviceType: 'all',
                image: prodFormImage,
                tags: tagsArray,
                hasASBadge: prodFormHasASBadge,
                hasPromoRibbon: prodFormHasPromoRibbon
              };
            }
            return p;
          });
          saveHomeProducts(updated);
        }
      } else {
        const updated = { ...parkingProducts };
        let found = false;
        Object.keys(updated).forEach(cat => {
          updated[cat] = updated[cat].map(p => {
            const isMatch = p.id === editingProduct.id || 
              (p.name && editingProduct.name && p.name.trim() === editingProduct.name.trim()) || 
              ((editingProduct.id === 'park-50kw-1ch-coolcharge' || editingProduct.id === 'sy-dc50') && (p.id === 'park-50kw-1ch-coolcharge' || p.id === 'sy-dc50' || (p.name && p.name.includes('50kW'))));
            if (isMatch) {
              found = true;
              return {
                ...p,
                name: prodFormName,
                regularPrice: Number(prodFormRegularPrice),
                price: Number(prodFormPrice),
                discount: calculatedDiscount,
                replacementPrice: Number(prodFormReplacementPrice),
                replacementRegularPrice: Number(prodFormReplacementRegularPrice),
                replacementDiscount: repDiscount,
                installIncludedPrice: Number(prodFormInstallIncludedPrice),
                installIncludedRegularPrice: Number(prodFormInstallIncludedRegularPrice),
                installIncludedDiscount: instDiscount,
                serviceType: 'all',
                image: prodFormImage,
                tags: tagsArray,
                hasASBadge: prodFormHasASBadge,
                hasPromoRibbon: prodFormHasPromoRibbon
              };
            }
            return p;
          });
        });
        saveParkingProducts(updated);
      }
    } else {
      // Add mode
      const newId = `${editingProductType === 'home' ? 'res' : 'park'}-custom-${Date.now()}`;
      targetId = newId;
      const newProduct: SolutionProduct = {
        id: newId,
        name: prodFormName,
        description: editingProductType === 'home' ? '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기' : '상업용 간편 QR 정산 연동 부가수익 창출',
        regularPrice: Number(prodFormRegularPrice),
        price: Number(prodFormPrice),
        discount: calculatedDiscount,
        replacementPrice: Number(prodFormReplacementPrice),
        replacementRegularPrice: Number(prodFormReplacementRegularPrice),
        replacementDiscount: repDiscount,
        installIncludedPrice: Number(prodFormInstallIncludedPrice),
        installIncludedRegularPrice: Number(prodFormInstallIncludedRegularPrice),
        installIncludedDiscount: instDiscount,
        serviceType: 'all',
        image: prodFormImage,
        tags: tagsArray,
        hasASBadge: prodFormHasASBadge,
        hasPromoRibbon: prodFormHasPromoRibbon,
        optionGroups: JSON.parse(JSON.stringify(DEFAULT_RESIDENTIAL_OPTION_GROUPS))
      };

      if (editingProductType === 'home') {
        const updated = { ...homeProducts };
        if (!updated[editingCategory]) updated[editingCategory] = [];
        updated[editingCategory] = [...updated[editingCategory], newProduct];
        saveHomeProducts(updated);
      } else {
        const updated = { ...parkingProducts };
        if (!updated[editingCategory]) updated[editingCategory] = [];
        updated[editingCategory] = [...updated[editingCategory], newProduct];
        saveParkingProducts(updated);
      }
    }

    // Also update main products in sy_cms_products_v12
    try {
      const savedMain = localStorage.getItem('sy_cms_products_v12');
      if (savedMain) {
        const mainArr = JSON.parse(savedMain);
        const matchIdx = mainArr.findIndex((mp: any) =>
          mp.id === targetId ||
          (mp.name && prodFormName && mp.name.trim() === prodFormName.trim()) ||
          ((targetId === 'sy-ac07' || targetId === 'res-7kw-spil') && (mp.id === 'sy-ac07' || mp.id === 'res-7kw-spil')) ||
          ((targetId === 'sy-ac05' || targetId === 'res-5kw-spil') && (mp.id === 'sy-ac05' || mp.id === 'res-5kw-spil')) ||
          ((targetId === 'sy-ac11-bi' || targetId === 'res-11kw-spil') && (mp.id === 'sy-ac11-bi' || mp.id === 'res-11kw-spil')) ||
          ((targetId === 'park-50kw-1ch-coolcharge' || targetId === 'sy-dc50' || (prodFormName && prodFormName.toLowerCase().includes('50kw'))) && (mp.id === 'park-50kw-1ch-coolcharge' || mp.id === 'sy-dc50' || (mp.name && mp.name.toLowerCase().includes('50kw'))))
        );
        if (matchIdx !== -1) {
          mainArr[matchIdx] = {
            ...mainArr[matchIdx],
            name: prodFormName,
            price: Number(prodFormPrice),
            originalPrice: Number(prodFormRegularPrice),
            discountRate: calculatedDiscount,
            replacementPrice: Number(prodFormReplacementPrice),
            replacementRegularPrice: Number(prodFormReplacementRegularPrice),
            installIncludedPrice: Number(prodFormInstallIncludedPrice),
            installIncludedRegularPrice: Number(prodFormInstallIncludedRegularPrice),
            serviceType: 'all',
            image: prodFormImage || mainArr[matchIdx].image,
          };
        } else {
          mainArr.push({
            id: targetId,
            name: prodFormName,
            type: editingProductType === 'parking' ? '급속' : '완속',
            power: editingCategory || '7kW',
            features: prodFormTags ? prodFormTags.split(',').map(t => t.trim()).filter(Boolean) : ['MD CHOICE'],
            image: prodFormImage || '/스필.png',
            description: '',
            price: Number(prodFormPrice),
            originalPrice: Number(prodFormRegularPrice),
            discountRate: calculatedDiscount,
            replacementPrice: Number(prodFormReplacementPrice),
            replacementRegularPrice: Number(prodFormReplacementRegularPrice),
            installIncludedPrice: Number(prodFormInstallIncludedPrice),
            installIncludedRegularPrice: Number(prodFormInstallIncludedRegularPrice),
            brand: '에스와이',
            serviceType: 'all',
            optionGroups: []
          });
        }
        localStorage.setItem('sy_cms_products_v12', JSON.stringify(mainArr));
        localStorage.setItem('sy_cms_products', JSON.stringify(mainArr));
      }
    } catch (err) {}

    window.dispatchEvent(new Event('sy_cms_products_update'));
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const [isDraggingPdf, setIsDraggingPdf] = useState<Record<string, boolean>>({});

  const handlePdfUpload = async (brandKey: string, file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      alert('PDF 파일 또는 이미지 파일(PNG/JPG/JPEG)만 업로드할 수 있습니다.');
      return;
    }

    try {
      const downloadUrl = await uploadFileToFirebaseStorage(file, 'brand-catalogs', `${brandKey}_${file.name}`);
      let finalUrl = downloadUrl;
      if (!finalUrl) {
        // Fallback to FileReader if offline
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      await saveUnifiedBrandCatalog(brandKey, finalUrl, file.name);

      setBrands(prev => ({
        ...prev,
        [brandKey]: {
          ...prev[brandKey],
          pdfUrl: finalUrl,
          pdfName: file.name
        }
      }));
    } catch (dbError) {
      console.error('Failed to upload/save brand catalog:', dbError);
      alert('카탈로그 파일 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePdf = async (brandKey: string) => {
    try {
      await deleteUnifiedBrandCatalog(brandKey);

      setBrands(prev => {
        const updated = {
          ...prev,
          [brandKey]: {
            ...prev[brandKey],
            pdfUrl: undefined,
            pdfName: undefined
          }
        };

        try {
          const lightweight: Record<string, any> = {};
          Object.keys(updated).forEach(k => {
            lightweight[k] = {
              ...updated[k],
              pdfUrl: undefined,
              pdfName: undefined
            };
          });
          localStorage.setItem('sy_cms_brands', JSON.stringify(lightweight));
        } catch (storageError) {
          console.error('Failed to update localStorage on delete:', storageError);
        }
        return updated;
      });

      window.dispatchEvent(new Event('sy_cms_brand_catalogs_update'));
    } catch (dbError) {
      console.error('Failed to delete brand catalog:', dbError);
    }
  };

  const confirmDeleteBrandPdf = (brandKey: string, brandName?: string) => {
    setDeleteModalConfig({
      isOpen: true,
      title: '브랜드 브로셔 삭제 확인',
      targetName: brandName ? `${brandName} 공식 브로셔` : `${brandKey} 공식 브로셔`,
      description: `선택하신 '${brandName || brandKey}' 아파트 공식 브로셔 및 카탈로그 문서를 삭제하시겠습니까?`,
      warningNote: '삭제 시 아파트 브랜드 솔루션 화면에서 브로셔 뷰어가 비활성화됩니다.',
      confirmLabel: '브로셔 삭제',
      onConfirm: () => handleDeletePdf(brandKey)
    });
  };

  const filteredSolutions = solutions.filter(sol => {
    if (activeTab === 'ALL') return true;
    return sol.category === activeTab;
  });

  const getTabIcon = (category: string) => {
    switch (category) {
      case 'Commercial':
        return <Building2 className="w-4 h-4 shrink-0" />;
      case 'Residential':
        return <Home className="w-4 h-4 shrink-0" />;
      case 'ParkingLot':
        return <ParkingCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Layers className="w-4 h-4 shrink-0" />;
    }
  };

  if (activeDetailProduct) {
    const isResidentialProduct = activeDetailProduct.id.startsWith('res-') || activeDetailProduct.id.startsWith('sy-') || activeDetailProduct.name.includes('개인용') || activeDetailProduct.name.includes('가정용') || !activeDetailProduct.id.startsWith('park-');
    const productPurpose = isResidentialProduct ? 'Residential' : 'ParkingLot';
    const detailData = resolveDetailData(activeDetailProduct, productDetails);
    
    // Extract power to display correct specs dynamically
    let powerKey = '7kW';
    if (activeDetailProduct.name.includes('5kW')) powerKey = '5kW';
    else if (activeDetailProduct.name.includes('11kW')) powerKey = '11kW';
    else if (activeDetailProduct.name.includes('50kW')) powerKey = '50kW 급속';
    else if (activeDetailProduct.name.includes('100kW')) powerKey = '100kW+ 초급속';

    const formatPrice = (val: number) => val.toLocaleString() + '원';

    const currentOptionGroups = getOptionGroupsForProduct(activeDetailProduct);
    const primaryOptionGroup = currentOptionGroups[0] || null;
    const secondaryOptionGroups = currentOptionGroups.slice(1);

    const handleOptionSelect = (groupId: string, optionId: string) => {
      setSelectedOptionsMap(prev => ({ ...prev, [groupId]: optionId }));
      if (optionId) {
        setSelectedOptionQuantities(prev => ({ ...prev, [groupId]: 1 }));
      } else {
        setSelectedOptionQuantities(prev => {
          const next = { ...prev };
          delete next[groupId];
          return next;
        });
      }
    };

    const handleRemoveOption = (groupId: string) => {
      setSelectedOptionsMap(prev => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
      setSelectedOptionQuantities(prev => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    };

    const handleOptionQtyChange = (groupId: string, delta: number) => {
      setSelectedOptionQuantities(prev => ({
        ...prev,
        [groupId]: Math.max(1, (prev[groupId] || 1) + delta)
      }));
    };

    // Calculate selected option boxes
    const selectedOptionBoxes = currentOptionGroups.reduce((acc, grp, idx) => {
      const selectedOptId = selectedOptionsMap[grp.id];
      if (!selectedOptId) return acc;

      const foundOpt = grp.options.find(o => o.id === selectedOptId);
      if (!foundOpt || foundOpt.name === '선택 안함') return acc;

      const isPrimary = idx === 0;
      const qty = selectedOptionQuantities[grp.id] || 1;
      const unitPrice = isPrimary ? (activeDetailProduct.price + foundOpt.price) : foundOpt.price;
      const boxTotal = unitPrice * qty;

      acc.push({
        groupId: grp.id,
        groupTitle: grp.title,
        optionName: foundOpt.name,
        optionPrice: foundOpt.price,
        quantity: qty,
        totalPrice: boxTotal,
        isPrimary
      });
      return acc;
    }, [] as { groupId: string; groupTitle: string; optionName: string; optionPrice: number; quantity: number; totalPrice: number; isPrimary: boolean }[]);

    const calculatedTotalPrice = selectedOptionBoxes.length > 0
      ? selectedOptionBoxes.reduce((sum, b) => sum + b.totalPrice, 0)
      : activeDetailProduct.price * quantity;

    const handleBuyNow = () => {
      if (primaryOptionGroup && primaryOptionGroup.required && !selectedOptionsMap[primaryOptionGroup.id]) {
        setToastMessage(`⚠️ [필수] ${primaryOptionGroup.title} 옵션을 선택해 주세요.`);
        return;
      }

      const optionDetails = selectedOptionBoxes.map(b => ({ groupTitle: b.groupTitle, optionName: b.optionName, optionPrice: b.optionPrice }));

      if (onOpenPayment) {
        const unitPrice = calculatedTotalPrice > 0 ? calculatedTotalPrice / quantity : activeDetailProduct.price;
        const buyNowItem = {
          id: `buy-${Date.now()}`,
          productId: activeDetailProduct.id,
          name: activeDetailProduct.name,
          power: powerKey || '7kW',
          type: activeDetailProduct.type || '완속',
          image: selectedDisplayImage || activeDetailProduct.image,
          quantity: quantity,
          price: unitPrice,
          selectedOptions: optionDetails,
          addedAt: new Date().toISOString()
        };
        onOpenPayment([buyNowItem]);
      } else {
        setToastMessage('✅ 바로 무료 시공 상담 및 예약 페이지로 이동합니다.');
        setTimeout(() => {
          onOpenQuoteWithPurpose(productPurpose);
        }, 500);
      }
    };

    const handleBulkInquiry = () => {
      setToastMessage('📋 대량 구매 및 설치 특별 견적 문의서로 이동합니다.');
      setTimeout(() => {
        onOpenQuoteWithPurpose(productPurpose === 'Residential' ? 'Residential' : 'Commercial');
      }, 500);
    };

    const handleAddToCart = () => {
      if (primaryOptionGroup && primaryOptionGroup.required && !selectedOptionsMap[primaryOptionGroup.id]) {
        setToastMessage(`⚠️ [필수] ${primaryOptionGroup.title} 옵션을 선택해 주세요.`);
        return;
      }

      const unitPrice = calculatedTotalPrice > 0 ? calculatedTotalPrice / quantity : activeDetailProduct.price;
      const optionDetails = selectedOptionBoxes.map(b => ({ groupTitle: b.groupTitle, optionName: b.optionName, optionPrice: b.optionPrice }));
      if (onAddToCart) {
        onAddToCart(activeDetailProduct, optionDetails, unitPrice, quantity);
      }

      setToastMessage(`🛒 [${activeDetailProduct.name}] 장바구니에 담겼습니다!`);
    };

    const handleAddToWishlist = () => {
      setToastMessage(`❤️ 관심 상품으로 등록되었습니다.`);
    };

    return (
      <div className="py-4 sm:py-8 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 animate-fadeIn relative">
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-md"
            >
              <span>{toastMessage}</span>
              {onOpenCartModal && toastMessage.includes('장바구니에') && (
                <button
                  type="button"
                  onClick={onOpenCartModal}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[11px] font-black cursor-pointer transition-colors"
                >
                  장바구니 열기 →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back navigation & Category indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveDetailProduct(null)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            ← 전체 상품 리스트로 돌아가기
          </button>
        </div>

        {/* Admin CMS Product Edit Control Bar */}
        {isEditMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛠️</span>
              <div>
                <p className="text-xs font-black text-amber-900">관리자 상품 상세 편집 모드</p>
                <p className="text-[11px] text-amber-700 font-medium">상품명, 가격, 요약설명, 커넥터 옵션, 배송 사양 등을 자유롭게 수정할 수 있습니다.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailEditing(!isDetailEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                isDetailEditing 
                  ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700' 
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              {isDetailEditing ? '💾 편집 취소 (상세보기 확인)' : '✍️ 상품 정보 및 옵션 편집하기'}
            </button>
          </div>
        )}

        {isDetailEditing ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h4 className="text-base sm:text-lg font-black text-slate-900">상품 상세 정보 및 커넥터 옵션 직접 수정</h4>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailEditing(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductDetails}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                >
                  저장하기
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Section: Basic product fields */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase block">
                  기본 상품 정보 (Basic Info)
                </span>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">상품명</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
                    placeholder="상품명을 입력해 주세요"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 font-bold">상품 대표 이미지</label>
                  
                  {editImage ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-4">
                      <img 
                        src={getOptimizedImageUrl(editImage, { width: 400, format: 'webp' })} 
                        alt="Preview" 
                        className="max-h-40 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById('product-image-file-input');
                            fileInput?.click();
                          }}
                          className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-black hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                        >
                          이미지 변경
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditImage('')}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-black hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingProductImage(true);
                      }}
                      onDragLeave={() => {
                        setIsDraggingProductImage(false);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setIsDraggingProductImage(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          try {
                            const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', file.name);
                            if (downloadUrl) {
                              setEditImage(downloadUrl);
                            } else {
                              const reader = new FileReader();
                              reader.onloadend = () => setEditImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        } else {
                          alert('이미지 파일(PNG, JPG, JPEG, GIF 등)만 업로드할 수 있습니다.');
                        }
                      }}
                      onClick={() => document.getElementById('product-image-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                        isDraggingProductImage
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-extrabold text-slate-700">
                        클릭하거나 이미지를 드래그하여 드롭하세요
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        지원형식: PNG, JPG, JPEG, WebP, GIF
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    id="product-image-file-input"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', file.name);
                          if (downloadUrl) {
                            setEditImage(downloadUrl);
                          } else {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  />

                  {/* Optional URL Input field at the bottom */}
                  <div className="pt-1">
                    <details className="group">
                      <summary className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer list-none flex items-center gap-1 font-bold">
                        <span className="transition-transform group-open:rotate-90">▶</span>
                        이미지 링크(URL) 직접 입력하기
                      </summary>
                      <div className="mt-2 pl-3 border-l-2 border-slate-200">
                        <input
                          type="text"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          placeholder="https://example.com/image.jpg 형식의 URL 직접 입력"
                        />
                      </div>
                    </details>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">상품 요약 정보 (설명)</label>
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    placeholder="상품에 대한 간단한 설명을 적어주세요"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">정상 가격 (원)</label>
                    <input
                      type="number"
                      value={editRegularPrice}
                      onChange={(e) => setEditRegularPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">공급 혜택가 (원)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">할인율 (%)</label>
                    <input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Section: Specs & Custom Options */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase block">
                  상세 사양 및 커넥터 옵션 설정
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">배송방법</label>
                    <input
                      type="text"
                      value={editDelivery}
                      onChange={(e) => setEditDelivery(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 font-bold">배송비</label>
                    <input
                      type="text"
                      value={editShipping}
                      onChange={(e) => setEditShipping(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Service Type Option Group Tab Editor */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">서비스 유형별 옵션 설정</span>
                    <span className="text-[10px] text-slate-500 font-bold">서비스별로 다른 상세 옵션을 제공합니다</span>
                  </div>

                  {/* Saved Option Presets Quick Bar */}
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                        <span>🔖</span>
                        <span>저장된 옵션 템플릿 불러오기 / 적용</span>
                        <span className="text-[10px] text-amber-800 font-bold">({optionPresetsList.length}개)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentGrp = editActiveOptionTab === 'device'
                            ? editDeviceOptionGroups
                            : editActiveOptionTab === 'replace'
                            ? editReplaceOptionGroups
                            : editInstallOptionGroups;

                          if (currentGrp.length === 0) {
                            alert('저장할 옵션 그룹이 없습니다.');
                            return;
                          }
                          const defaultName = `${editName || '상품'} 전용 옵션`;
                          const presetName = prompt('현재 탭의 옵션들을 새로운 템플릿으로 저장합니다.\n템플릿 이름을 입력해 주세요:', defaultName);
                          if (presetName && presetName.trim()) {
                            const newPreset: OptionPreset = {
                              id: `preset-${Date.now()}`,
                              name: presetName.trim(),
                              brand: activeDetailProduct?.brand || '스필',
                              description: `${editName} 기준 옵션 (${currentGrp.length}개 그룹)`,
                              optionGroups: JSON.parse(JSON.stringify(currentGrp))
                            };
                            const updated = [...optionPresetsList, newPreset];
                            localStorage.setItem('sy_cms_option_presets_v2', JSON.stringify(updated));
                            setOptionPresetsList(updated);
                            setSelectedPresetId(newPreset.id);
                            alert(`'${presetName.trim()}' 템플릿이 저장되었습니다!`);
                          }
                        }}
                        className="text-[10px] font-black text-amber-800 hover:text-amber-950 underline cursor-pointer"
                      >
                        + 현재 옵션을 템플릿으로 저장
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        value={selectedPresetId}
                        onChange={(e) => setSelectedPresetId(e.target.value)}
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- 적용할 옵션 템플릿 선택 --</option>
                        {optionPresetsList.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            [{preset.brand || '일반'}] {preset.name} ({preset.optionGroups.length}개 그룹)
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedPresetId) {
                              alert('적용할 템플릿을 선택해 주세요.');
                              return;
                            }
                            const preset = optionPresetsList.find(p => p.id === selectedPresetId);
                            if (!preset) return;

                            const cloned = JSON.parse(JSON.stringify(preset.optionGroups));
                            if (editActiveOptionTab === 'device') setEditDeviceOptionGroups(cloned);
                            else if (editActiveOptionTab === 'replace') setEditReplaceOptionGroups(cloned);
                            else setEditInstallOptionGroups(cloned);

                            const tabName = editActiveOptionTab === 'device' ? '단말기 단품' : editActiveOptionTab === 'replace' ? '교체 시공' : '신규 설치';
                            alert(`'${preset.name}' 템플릿이 [${tabName}] 탭에 적용되었습니다!`);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer transition-all"
                        >
                          현재 탭에 적용
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedPresetId) {
                              alert('적용할 템플릿을 선택해 주세요.');
                              return;
                            }
                            const preset = optionPresetsList.find(p => p.id === selectedPresetId);
                            if (!preset) return;

                            if (confirm(`'${preset.name}' 템플릿을 [단말기 단품, 교체 시공, 신규 설치] 3개 탭 전체에 일괄 적용하시겠습니까?`)) {
                              const cloned1 = JSON.parse(JSON.stringify(preset.optionGroups));
                              const cloned2 = JSON.parse(JSON.stringify(preset.optionGroups));
                              const cloned3 = JSON.parse(JSON.stringify(preset.optionGroups));
                              setEditDeviceOptionGroups(cloned1);
                              setEditReplaceOptionGroups(cloned2);
                              setEditInstallOptionGroups(cloned3);
                              alert(`'${preset.name}' 템플릿이 모든 서비스 탭에 적용되었습니다!`);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer transition-all"
                        >
                          전체 탭에 적용
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs for Service Types */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setEditActiveOptionTab('device')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${editActiveOptionTab === 'device' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      📦 단말기 단품
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditActiveOptionTab('replace')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${editActiveOptionTab === 'replace' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🛠️ 교체 시공
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditActiveOptionTab('install')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${editActiveOptionTab === 'install' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ⚡ 신규 설치
                    </button>
                  </div>

                  {/* Option Groups Editor for active tab */}
                  {(() => {
                    const currentGroups = editActiveOptionTab === 'device'
                      ? editDeviceOptionGroups
                      : editActiveOptionTab === 'replace'
                      ? editReplaceOptionGroups
                      : editInstallOptionGroups;

                    const setCurrentGroups = (updated: ProductOptionGroup[]) => {
                      if (editActiveOptionTab === 'device') setEditDeviceOptionGroups(updated);
                      else if (editActiveOptionTab === 'replace') setEditReplaceOptionGroups(updated);
                      else setEditInstallOptionGroups(updated);
                    };

                    return (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-700">
                            {editActiveOptionTab === 'device' && '📦 단말기 단품 옵션 그룹'}
                            {editActiveOptionTab === 'replace' && '🛠️ 교체 시공 옵션 그룹'}
                            {editActiveOptionTab === 'install' && '⚡ 신규 설치 포함 옵션 그룹'}
                            ({currentGroups.length}개)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newGrp: ProductOptionGroup = {
                                id: `grp-${Date.now()}`,
                                title: '새 옵션 그룹',
                                required: false,
                                options: [{ id: `opt-${Date.now()}`, name: '새 항목', price: 0 }]
                              };
                              setCurrentGroups([...currentGroups, newGrp]);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black border border-blue-200 cursor-pointer"
                          >
                            + 옵션 그룹 추가
                          </button>
                        </div>

                        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                          {currentGroups.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-400 font-bold bg-white rounded-xl border border-dashed border-slate-200">
                              등록된 옵션 그룹이 없습니다. [+ 옵션 그룹 추가]를 누르세요.
                            </div>
                          ) : (
                            currentGroups.map((grp, gIdx) => (
                              <div key={grp.id} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 shadow-2xs">
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <input
                                    type="text"
                                    value={grp.title}
                                    onChange={(e) => {
                                      const copy = [...currentGroups];
                                      copy[gIdx] = { ...copy[gIdx], title: e.target.value };
                                      setCurrentGroups(copy);
                                    }}
                                    className="flex-1 text-xs font-black text-slate-900 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white"
                                    placeholder="옵션 그룹명 (예: 충전케이블 길이)"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = [...currentGroups];
                                      copy[gIdx].options.push({
                                        id: `opt-${Date.now()}`,
                                        name: '새 옵션 항목',
                                        price: 0
                                      });
                                      setCurrentGroups(copy);
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md"
                                  >
                                    + 항목
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = currentGroups.filter((_, i) => i !== gIdx);
                                      setCurrentGroups(copy);
                                    }}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-md text-xs font-bold"
                                    title="그룹 삭제"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="space-y-1.5 pl-1">
                                  {grp.options.map((opt, oIdx) => (
                                    <div key={opt.id} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={opt.name}
                                        onChange={(e) => {
                                          const copy = [...currentGroups];
                                          const opts = [...copy[gIdx].options];
                                          opts[oIdx] = { ...opts[oIdx], name: e.target.value };
                                          copy[gIdx] = { ...copy[gIdx], options: opts };
                                          setCurrentGroups(copy);
                                        }}
                                        className="flex-[2] text-[11px] font-medium border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:bg-white"
                                        placeholder="옵션명"
                                      />
                                      <div className="flex-1 flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={opt.price}
                                          onChange={(e) => {
                                            const copy = [...currentGroups];
                                            const opts = [...copy[gIdx].options];
                                            opts[oIdx] = { ...opts[oIdx], price: Number(e.target.value) };
                                            copy[gIdx] = { ...copy[gIdx], options: opts };
                                            setCurrentGroups(copy);
                                          }}
                                          className="w-full text-[11px] font-bold text-right border border-slate-200 rounded-md px-1.5 py-1 bg-slate-50 focus:bg-white"
                                          placeholder="추가금"
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold">원</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...currentGroups];
                                          const opts = copy[gIdx].options.filter((_, i) => i !== oIdx);
                                          copy[gIdx] = { ...copy[gIdx], options: opts };
                                          setCurrentGroups(copy);
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-500 rounded text-[10px]"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsDetailEditing(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveProductDetails}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-500/15"
              >
                💾 설정 저장하기
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Image & Gallery Thumbnail Strip */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Product Image Container with Drag&Drop & Change Image Overlay */}
            <div
              onDragOver={(e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setIsLeftImageDragging(true);
              }}
              onDragLeave={() => {
                if (!isEditMode) return;
                setIsLeftImageDragging(false);
              }}
              onDrop={async (e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setIsLeftImageDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  try {
                    const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', file.name);
                    if (downloadUrl) {
                      handleApplyLeftImageChange(downloadUrl);
                    } else {
                      const reader = new FileReader();
                      reader.onloadend = () => handleApplyLeftImageChange(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                } else {
                  alert('이미지 파일(PNG, JPG, WebP 등)만 올릴 수 있습니다.');
                }
              }}
              className={`relative aspect-square bg-[#f3f4f6] rounded-2xl border transition-all flex items-center justify-center p-8 overflow-hidden shadow-xs group ${
                isLeftImageDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' : 'border-slate-200/80 hover:border-emerald-300'
              }`}
            >
              <DetailPageImage
                src={selectedDisplayImage || activeDetailProduct.image}
                alt={activeDetailProduct.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain max-h-[380px] hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlaid Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <div className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] tracking-wide shadow-sm uppercase border border-emerald-500">
                  {powerKey} 공식 승인 기기
                </div>
                {activeDetailProduct.hasASBadge && (
                  <div className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] tracking-wide shadow-sm border border-rose-500">
                    무상 A/S 4년 보장
                  </div>
                )}
              </div>

              {/* Top Right Direct Image Change Button (Admin Only) */}
              {isEditMode && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => setIsLeftImagePickerOpen(!isLeftImagePickerOpen)}
                    className="px-3.5 py-2 bg-slate-900/90 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                    title="대표 충전기 및 갤러리 사진 편집 (관리자 전용)"
                  >
                    <span>📷 사진 관리</span>
                  </button>
                </div>
              )}

              {/* Drag & Drop Indicator Overlay (Admin Only) */}
              {isEditMode && isLeftImageDragging && (
                <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 p-4 text-center animate-fadeIn">
                  <Upload className="w-12 h-12 mb-2 text-emerald-300 animate-bounce" />
                  <p className="font-black text-sm">여기에 이미지를 놓으면 바로 대표 사진으로 등록됩니다!</p>
                  <p className="text-xs text-emerald-200 mt-1">PNG, JPG, WebP, GIF 지원</p>
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              id="left-image-direct-file-input"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', file.name);
                    if (downloadUrl) {
                      handleApplyLeftImageChange(downloadUrl);
                    } else {
                      const reader = new FileReader();
                      reader.onloadend = () => handleApplyLeftImageChange(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            />
            <input
              type="file"
              id="left-image-add-gallery-file-input"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const downloadUrl = await uploadFileToFirebaseStorage(file, 'products', file.name);
                    if (downloadUrl) {
                      handleAddGalleryImage(downloadUrl);
                    } else {
                      const reader = new FileReader();
                      reader.onloadend = () => handleAddGalleryImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            />

            {/* Expandable Image Change Editor Drawer */}
            {isLeftImagePickerOpen && (
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🖼️</span>
                    <h4 className="text-xs sm:text-sm font-black text-white">상품 프로필 및 갤러리 사진 관리</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLeftImagePickerOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Option 1: File Upload */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-emerald-400 block">1. 컴퓨터에서 사진 업로드</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('left-image-direct-file-input')?.click()}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>대표 사진으로 등록</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('left-image-add-gallery-file-input')?.click()}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/50 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>추가 사진으로 등록</span>
                    </button>
                  </div>
                </div>

                {/* Option 2: Image URL Input */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-black text-emerald-400 block">2. 이미지 링크 (URL) 입력</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      placeholder="https://example.com/charger.jpg"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyLeftImageChange(customImageUrlInput)}
                      className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      대표로 적용
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage(customImageUrlInput)}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      갤러리 추가
                    </button>
                  </div>
                </div>

                {/* Option 3: Preset Sample Gallery */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="text-[11px] font-black text-slate-300 block">3. 추천 충전기 샘플 이미지</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: '스필', url: '/스필.png' },
                      { name: '쿨차지', url: '/쿨차지.png' },
                      { name: '일렉트리', url: '/일렉트리.png' },
                      { name: '차지고', url: '/차지고.png' },
                    ].map((preset, idx) => (
                      <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-1.5 flex flex-col items-center gap-1 group">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center p-1">
                          <DetailPageImage 
                            src={getOptimizedImageUrl(preset.url, { width: 200, format: 'webp' })} 
                            alt={preset.name} 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">{preset.name}</span>
                        <div className="flex gap-1 w-full pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleApplyLeftImageChange(preset.url)}
                            className="flex-1 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-extrabold rounded-md text-center"
                          >
                            대표
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddGalleryImage(preset.url)}
                            className="flex-1 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[8px] font-extrabold rounded-md text-center"
                          >
                            +추가
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail Gallery Row with Navigation Arrows */}
            {(() => {
              const galleryImages = (activeDetailProduct.images && activeDetailProduct.images.length > 0)
                ? activeDetailProduct.images
                : (activeDetailProduct.image ? [activeDetailProduct.image] : []);

              const activeImgUrl = selectedDisplayImage || activeDetailProduct.image;
              const currentIndex = Math.max(0, galleryImages.findIndex(img => img === activeImgUrl));

              const handlePrevImage = () => {
                if (galleryImages.length === 0) return;
                const prevIdx = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                setSelectedDisplayImage(galleryImages[prevIdx]);
              };

              const handleNextImage = () => {
                if (galleryImages.length === 0) return;
                const nextIdx = (currentIndex + 1) % galleryImages.length;
                setSelectedDisplayImage(galleryImages[nextIdx]);
              };

              return (
                <div className="flex items-center gap-2 mt-3 w-full">
                  {/* Left Arrow Navigation Button */}
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="w-10 h-14 border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer shrink-0"
                    title="이전 사진"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>

                  {/* Thumbnail Cards */}
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1 [&::-webkit-scrollbar]:hidden">
                    {galleryImages.map((thumbUrl, tIdx) => {
                      const isMain = thumbUrl === activeDetailProduct.image;
                      const isCurrentlyActive = activeImgUrl === thumbUrl;

                      return (
                        <div
                          key={tIdx}
                          onClick={() => setSelectedDisplayImage(thumbUrl)}
                          className={`w-14 h-14 flex items-center justify-center p-1 bg-white cursor-pointer transition-all relative group shrink-0 ${
                            isCurrentlyActive ? 'border-2 border-slate-900 shadow-2xs' : 'border border-slate-300 hover:border-slate-500'
                          }`}
                          title="클릭하여 크게 보기"
                        >
                          <DetailPageImage 
                            src={getOptimizedImageUrl(thumbUrl, { width: 140, format: 'webp' })} 
                            alt={`gallery thumbnail ${tIdx + 1}`} 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain" 
                          />

                          {/* Hover Action Overlay in Edit Mode */}
                          {canEdit && (
                            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1 z-20">
                              <button
                                type="button"
                                onClick={(e) => handleRemoveGalleryImage(thumbUrl, e)}
                                className="self-end bg-rose-600 hover:bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer"
                                title="사진 삭제"
                              >
                                ✕
                              </button>
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={(e) => handleSetMainImage(thumbUrl, e)}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-extrabold py-0.5 rounded-md truncate shadow-xs cursor-pointer"
                                  title="메인 사진으로 설정"
                                >
                                  메인 설정
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Image Button in Edit Mode */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => document.getElementById('left-image-add-gallery-file-input')?.click()}
                        className="w-14 h-14 border border-dashed border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-emerald-700 transition-all shrink-0"
                        title="컴퓨터에서 사진 추가 등록"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span className="text-[9px] font-black">추가</span>
                      </button>
                    )}
                  </div>

                  {/* Right Arrow Navigation Button */}
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="w-10 h-14 border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer shrink-0"
                    title="다음 사진"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>

                  {/* Image Change Trigger Button in Gallery Row (Admin Only) */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsLeftImagePickerOpen(!isLeftImagePickerOpen)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-black border border-slate-300 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>📷 편집</span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* RIGHT: Spec Detail Block */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Row: Breadcrumb & Title */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-extrabold tracking-wider">
                {canEdit ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      startEditProduct(
                        activeDetailProduct,
                        isResidentialProduct ? 'home' : 'parking',
                        isResidentialProduct ? selectedHomePower : selectedParkingCapacity,
                        e
                      );
                    }}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>✏️ 상품 정보 및 이미지 수정</span>
                  </button>
                ) : <div />}
                <span>홈 / {productPurpose === 'Residential' ? '가정용 홈 충전기' : '공용 BIZ 충전기'}</span>
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words whitespace-normal">
                  {activeDetailProduct.name}
                </h3>
                {activeDetailProduct.discount && activeDetailProduct.discount > 0 && !activeDetailProduct.id.startsWith('park-') ? (
                  <div className="w-10 h-10 rounded-full bg-stone-950 text-white font-extrabold text-xs flex items-center justify-center shadow-md shrink-0">
                    {activeDetailProduct.discount}%
                  </div>
                ) : null}
              </div>
            </div>

            {/* Bold boundary divider */}
            <div className="border-t-2 border-slate-900 my-2"></div>

            {/* Specification Grid (Matches styling from user screenshot) */}
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-12 gap-y-3.5 text-xs">
                <div className="col-span-3 font-extrabold text-slate-600 self-start shrink-0">상품요약정보</div>
                <div className="col-span-9 text-slate-700 font-medium leading-relaxed break-words whitespace-normal">
                  {activeDetailProduct.description || `${powerKey} 고안전 초고속 탑재 스마트 전기차 충전 솔루션`}
                </div>

                <div className="col-span-12 border-t border-slate-100 my-1"></div>

                <div className="col-span-3 font-extrabold text-slate-600 self-center">B2B공급가</div>
                <div className="col-span-9 flex flex-col justify-center">
                  {(() => {
                    const isResidential =
                      productPurpose === 'Residential' ||
                      (activeDetailProduct as any).detailCategory === '비공용완속' ||
                      (activeDetailProduct as any).detailCategory === '비공용중속' ||
                      (activeDetailProduct as any).detailCategory === '가정용' ||
                      activeDetailProduct.id.startsWith('res-') ||
                      activeDetailProduct.id.startsWith('sy-ac') ||
                      activeDetailProduct.id.startsWith('home-') ||
                      activeDetailProduct.name.includes('개인용') ||
                      activeDetailProduct.name.includes('가정용') ||
                      activeDetailProduct.name.includes('홈') ||
                      activeDetailProduct.name.includes('비공용');

                    const isPublicCharger = !isResidential && (
                      activeDetailProduct.id.startsWith('park-') ||
                      activeDetailProduct.id.startsWith('comm-') ||
                      activeDetailProduct.id.startsWith('sol-comm') ||
                      activeDetailProduct.id.startsWith('sol-park') ||
                      (activeDetailProduct.name.includes('공용') && !activeDetailProduct.name.includes('개인용') && !activeDetailProduct.name.includes('가정용')) ||
                      activeDetailProduct.name.includes('상업') ||
                      activeDetailProduct.name.includes('수익형') ||
                      activeDetailProduct.name.includes('관공서') ||
                      activeDetailProduct.name.includes('조달상품') ||
                      (activeDetailProduct as any).type === '급속' ||
                      (activeDetailProduct as any).type === '초급속' ||
                      (activeDetailProduct as any).detailCategory === '공용완속' ||
                      (activeDetailProduct as any).detailCategory === '급속' ||
                      productPurpose === 'ParkingLot'
                    );

                    if (isPublicCharger) {
                      return (
                        <div className="text-blue-600 font-black text-lg sm:text-2xl tracking-tight leading-tight flex items-center gap-2">
                          <span>별도문의</span>
                        </div>
                      );
                    }

                    const regPrice = activeDetailProduct.regularPrice || (activeDetailProduct as any).originalPrice || (
                      activeDetailProduct.discount && activeDetailProduct.discount > 0 && activeDetailProduct.discount < 100
                        ? Math.round((activeDetailProduct.price / (1 - activeDetailProduct.discount / 100)) / 100) * 100
                        : activeDetailProduct.price
                    );
                    return (
                      <div className="space-y-0.5">
                        {regPrice > activeDetailProduct.price && (
                          <div className="text-xs sm:text-sm font-bold text-slate-400 line-through decoration-slate-400">
                            ₩{regPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-blue-600 font-black text-lg sm:text-2xl tracking-tight leading-tight flex items-center gap-2">
                          <span>₩{activeDetailProduct.price.toLocaleString()}</span>
                          {regPrice > activeDetailProduct.price && (
                            <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              {Math.round(((regPrice - activeDetailProduct.price) / regPrice) * 100)}% 할인
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="col-span-12 border-t border-slate-100 my-1"></div>

                {(() => {
                  const isResidential =
                    productPurpose === 'Residential' ||
                    (activeDetailProduct as any).detailCategory === '비공용완속' ||
                    (activeDetailProduct as any).detailCategory === '비공용중속' ||
                    (activeDetailProduct as any).detailCategory === '가정용' ||
                    activeDetailProduct.id.startsWith('res-') ||
                    activeDetailProduct.id.startsWith('sy-ac') ||
                    activeDetailProduct.id.startsWith('home-') ||
                    activeDetailProduct.name.includes('개인용') ||
                    activeDetailProduct.name.includes('가정용') ||
                    activeDetailProduct.name.includes('홈') ||
                    activeDetailProduct.name.includes('비공용');

                  const isPublicCharger = !isResidential && (
                    activeDetailProduct.id.startsWith('park-') ||
                    activeDetailProduct.id.startsWith('comm-') ||
                    activeDetailProduct.id.startsWith('sol-comm') ||
                    activeDetailProduct.id.startsWith('sol-park') ||
                    (activeDetailProduct.name.includes('공용') && !activeDetailProduct.name.includes('개인용') && !activeDetailProduct.name.includes('가정용')) ||
                    activeDetailProduct.name.includes('상업') ||
                    activeDetailProduct.name.includes('수익형') ||
                    activeDetailProduct.name.includes('관공서') ||
                    activeDetailProduct.name.includes('조달상품') ||
                    (activeDetailProduct as any).type === '급속' ||
                    (activeDetailProduct as any).type === '초급속' ||
                    (activeDetailProduct as any).detailCategory === '공용완속' ||
                    (activeDetailProduct as any).detailCategory === '급속' ||
                    productPurpose === 'ParkingLot'
                  );

                  if (isPublicCharger) {
                    return (
                      <>
                        <div className="col-span-3 font-extrabold text-slate-600 self-center">적립혜택</div>
                        <div className="col-span-9 text-slate-800 font-extrabold">
                          구매 <span className="text-blue-600 font-black">별도문의 (상담 시 안내)</span>
                        </div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">배송/시공</div>
                        <div className="col-span-9 text-slate-800 font-extrabold">
                          본사 직영 배송 및 현장 무료 실측 / <span className="text-emerald-600 font-bold">무료 상담</span>
                        </div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">상품정보</div>
                        <div className="col-span-9 text-slate-700 font-medium">우측 '자세히' 참조</div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">브랜드</div>
                        <div className="col-span-9 text-slate-800 font-extrabold">{activeDetailProduct.brand || '쿨차지'}</div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">시공방식</div>
                        <div className="col-span-9 text-slate-800 font-extrabold text-emerald-700">본사 직영 책임시공 (외주/중개 없음)</div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">시공일정</div>
                        <div className="col-span-9 text-slate-800 font-extrabold">
                          신청 후 24시간 내 엔지니어 1:1 상담 · 7일 내 착공
                          <span className="block text-[10.5px] text-slate-500 font-medium mt-0.5">※ 한전 인입/현장 여건에 따라 협의 조정 가능</span>
                        </div>
                        <div className="col-span-12 border-t border-slate-100 my-1"></div>

                        <div className="col-span-3 font-extrabold text-slate-600 self-center">청약철회</div>
                        <div className="col-span-9 text-slate-800 font-extrabold">전자상거래법 준수 (착공 전 100% 무상취소 가능)</div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="col-span-3 font-extrabold text-slate-600 self-center">배송방법</div>
                      <div className="col-span-9 text-slate-700 font-medium">택배</div>

                      <div className="col-span-12 border-t border-slate-100 my-1"></div>

                      <div className="col-span-3 font-extrabold text-slate-600 self-center">배송비</div>
                      <div className="col-span-9 text-slate-700 font-medium">무료</div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="border-t border-slate-200 my-4"></div>

            {/* Options Interactive Block */}
            <div className="space-y-4">
              {/* 1. 상품옵션 (Primary Option) */}
              {primaryOptionGroup && (
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 text-xs font-black text-slate-900 tracking-wide">
                    {primaryOptionGroup.title}
                  </div>
                  <div className="col-span-9">
                    <select
                      value={selectedOptionsMap[primaryOptionGroup.id] || ''}
                      onChange={(e) => handleOptionSelect(primaryOptionGroup.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                    >
                      <option value="">- [필수] 옵션을 선택해 주세요 -</option>
                      {primaryOptionGroup.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name.includes('(') ? opt.name : `${opt.name}${opt.price > 0 ? ` (+${opt.price.toLocaleString()}원)` : ''}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 2. 추가구성 (Secondary Option Groups) */}
              {secondaryOptionGroups.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-black text-slate-900 tracking-wide">
                    추가구성
                  </div>
                  <div className="space-y-2">
                    {secondaryOptionGroups.map((grp) => (
                      <select
                        key={grp.id}
                        value={selectedOptionsMap[grp.id] || ''}
                        onChange={(e) => handleOptionSelect(grp.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                      >
                        <option value="">- {grp.title} -</option>
                        {grp.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} {opt.price > 0 ? `(+${opt.price.toLocaleString()}원)` : ''}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Options List Box (Matches screenshot) */}
              {selectedOptionBoxes.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  {selectedOptionBoxes.map((box) => (
                    <div key={box.groupId} className="bg-[#f9f9f9] border border-[#e5e5e5] p-3.5 sm:p-4 space-y-3 font-sans">
                      <div className="text-xs sm:text-sm font-medium text-slate-800">
                        {box.groupTitle} : <span className="font-bold text-slate-900">{box.optionName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-[#d9d9d9] bg-white">
                          <button
                            type="button"
                            onClick={() => handleOptionQtyChange(box.groupId, -1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold select-none border-r border-[#d9d9d9] cursor-pointer text-sm"
                          >
                            -
                          </button>
                          <span className="w-9 sm:w-10 text-center font-bold text-xs sm:text-sm text-slate-900">
                            {box.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOptionQtyChange(box.groupId, 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold select-none border-l border-[#d9d9d9] cursor-pointer text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-bold text-slate-900">
                            ₩{box.totalPrice.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(box.groupId)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#d9d9d9] bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer text-xs font-bold"
                            title="옵션 삭제"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback Quantity Controls if no option box is selected */
                <div className="grid grid-cols-12 gap-2 items-center pt-2">
                  <div className="col-span-3 text-xs font-black text-slate-600">수량</div>
                  <div className="col-span-9">
                    <div className="flex flex-col space-y-1">
                      <div className="inline-flex items-center border border-slate-300 rounded-none w-max overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold border-r border-slate-300 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold border-l border-slate-300 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        (최소주문수량 1개 이상)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/80 my-4"></div>

            {/* Dynamic Total Price Block */}
            {(() => {
              const isResidential =
                productPurpose === 'Residential' ||
                (activeDetailProduct as any).detailCategory === '비공용완속' ||
                (activeDetailProduct as any).detailCategory === '비공용중속' ||
                (activeDetailProduct as any).detailCategory === '가정용' ||
                activeDetailProduct.id.startsWith('res-') ||
                activeDetailProduct.id.startsWith('sy-ac') ||
                activeDetailProduct.id.startsWith('home-') ||
                activeDetailProduct.name.includes('개인용') ||
                activeDetailProduct.name.includes('가정용') ||
                activeDetailProduct.name.includes('홈') ||
                activeDetailProduct.name.includes('비공용');

              const isCommercialProduct = !isResidential && (
                activeDetailProduct.id.startsWith('park-') ||
                activeDetailProduct.id.startsWith('comm-') ||
                activeDetailProduct.id.startsWith('sol-comm') ||
                activeDetailProduct.id.startsWith('sol-park') ||
                (activeDetailProduct.name.includes('공용') && !activeDetailProduct.name.includes('개인용') && !activeDetailProduct.name.includes('가정용')) ||
                activeDetailProduct.name.includes('상업') ||
                activeDetailProduct.name.includes('수익형') ||
                activeDetailProduct.name.includes('관공서') ||
                activeDetailProduct.name.includes('조달상품') ||
                (activeDetailProduct as any).type === '급속' ||
                (activeDetailProduct as any).type === '초급속' ||
                (activeDetailProduct as any).detailCategory === '공용완속' ||
                (activeDetailProduct as any).detailCategory === '급속' ||
                productPurpose === 'ParkingLot'
              );

              return (
                <>
                  <div className="flex items-center justify-end gap-3 py-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-700">총 상품금액</span>
                    {isCommercialProduct ? (
                      <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                        견적문의(전화문의)
                      </span>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        ₩{calculatedTotalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Shopping Action Buttons */}
                  {isCommercialProduct ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleBulkInquiry}
                          className="flex-[2] py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black rounded-xl text-center select-none cursor-pointer transition-all active:scale-99 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20"
                        >
                          <span>📋 온라인 견적서 신청</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToWishlist}
                          className="flex-1 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl text-center select-none cursor-pointer transition-all active:scale-99"
                        >
                          관심상품
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleBuyNow}
                          className="flex-[2] py-4 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-black rounded-xl tracking-wider text-center select-none cursor-pointer transition-all border border-stone-950 shadow-md shadow-stone-900/10 active:scale-99"
                        >
                          바로구매
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl text-center select-none cursor-pointer transition-all active:scale-99"
                        >
                          장바구니
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToWishlist}
                          className="flex-1 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl text-center select-none cursor-pointer transition-all active:scale-99"
                        >
                          관심상품
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleBulkInquiry}
                        className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black py-3.5 tracking-wider text-center rounded-xl cursor-pointer select-none transition-all active:scale-99 shadow-xs"
                      >
                        대량구매문의
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
        )}

        {/* BOTTOM: Long Catalog Brochure Details */}
        <div className="border-t border-slate-200/80 pt-4 sm:pt-6">
          <div className="bg-white rounded-xl sm:rounded-3xl border-0 sm:border border-slate-200/80 p-0 sm:p-6 space-y-4 shadow-none sm:shadow-sm">
            {(() => {
              const detailUrls: string[] = detailData?.pdfUrls && detailData.pdfUrls.length > 0
                ? detailData.pdfUrls
                : (detailData?.pdfUrl ? [detailData.pdfUrl] : []);
              const detailNames: string[] = detailData?.pdfNames && detailData.pdfNames.length > 0
                ? detailData.pdfNames
                : (detailData?.pdfName ? [detailData.pdfName] : []);

              if (detailUrls.length > 0) {
                if (!isEditMode) {
                  return (
                    <div className="space-y-4 w-full max-w-[860px] mx-auto">
                      {detailUrls.map((url, idx) => (
                        <div key={idx} className="w-full max-w-[860px] mx-auto">
                          <PdfImageRenderer 
                            fileUrl={url} 
                            fileName={detailNames[idx] || `${activeDetailProduct.name} 상세페이지 이미지 ${idx + 1}`} 
                            brandName={activeDetailProduct.name} 
                            isAdmin={false}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold">
                          총 {detailUrls.length}장 이미지/PDF 등록됨
                        </span>
                        <p className="text-xs text-slate-300 font-medium">
                          긴 상세페이지를 여러 장으로 분할하여 순서대로 등록 및 관리하실 수 있습니다.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => document.getElementById(`product-detail-add-more-${activeDetailProduct.id}`)?.click()}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          이미지/PDF 추가 등록
                        </button>
                        <input
                          type="file"
                          id={`product-detail-add-more-${activeDetailProduct.id}`}
                          multiple
                          accept="application/pdf, image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleProductPdfUpload(activeDetailProduct.id, e.target.files);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => confirmDeleteProductPdf(activeDetailProduct.id, activeDetailProduct.name)}
                          className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all border border-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          전체 삭제
                        </button>
                      </div>
                    </div>

                    {/* List of images */}
                    <div className="space-y-4">
                      {detailUrls.map((url, idx) => (
                        <div key={idx} className="border border-slate-200 bg-slate-50/60 rounded-2xl p-4 space-y-3 relative shadow-2xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate max-w-[200px] sm:max-w-[320px]">
                                {detailNames[idx] || `상세페이지 이미지 #${idx + 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderProductFile(activeDetailProduct.id, idx, idx - 1)}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-700 cursor-pointer transition-all"
                                title="위로 이동"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === detailUrls.length - 1}
                                onClick={() => handleReorderProductFile(activeDetailProduct.id, idx, idx + 1)}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-700 cursor-pointer transition-all"
                                title="아래로 이동"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDeleteProductSingleFile(activeDetailProduct.id, idx, detailNames[idx])}
                                className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                삭제
                              </button>
                            </div>
                          </div>

                          <PdfImageRenderer 
                            fileUrl={url} 
                            fileName={detailNames[idx] || `${activeDetailProduct.name} 상세페이지 이미지 ${idx + 1}`} 
                            brandName={activeDetailProduct.name} 
                            isAdmin={true}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Drag-and-Drop Dropzone at Bottom */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: true }));
                      }}
                      onDragLeave={() => {
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: false }));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: false }));
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleProductPdfUpload(activeDetailProduct.id, e.dataTransfer.files);
                        }
                      }}
                      onClick={() => document.getElementById(`product-detail-upload-bottom-${activeDetailProduct.id}`)?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                        isDraggingProductPdf[activeDetailProduct.id]
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="file"
                        id={`product-detail-upload-bottom-${activeDetailProduct.id}`}
                        multiple
                        accept="application/pdf, image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleProductPdfUpload(activeDetailProduct.id, e.target.files);
                          }
                        }}
                      />
                      <Upload className="w-6 h-6 text-blue-600 mb-1" />
                      <p className="text-xs font-bold text-slate-800">
                        <span className="text-blue-600 font-extrabold">+ 이미지/PDF 파일 여러 장 추가 업로드하기</span> (드래그하여 드롭하거나 클릭하여 한꺼번에 선택 가능)
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {isEditMode ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: true }));
                      }}
                      onDragLeave={() => {
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: false }));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingProductPdf(prev => ({ ...prev, [activeDetailProduct.id]: false }));
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleProductPdfUpload(activeDetailProduct.id, e.dataTransfer.files);
                        }
                      }}
                      onClick={() => document.getElementById(`product-detail-upload-${activeDetailProduct.id}`)?.click()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
                        isDraggingProductPdf[activeDetailProduct.id]
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="file"
                        id={`product-detail-upload-${activeDetailProduct.id}`}
                        multiple
                        accept="application/pdf, image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleProductPdfUpload(activeDetailProduct.id, e.target.files);
                          }
                        }}
                      />
                      <Upload className="w-10 h-10 text-slate-400 mb-3 animate-pulse" />
                      <p className="text-xs sm:text-sm font-black text-slate-800">
                        여기에 <span className="text-blue-600">[{activeDetailProduct.name}]</span> 제품의 상세 설명 이미지(PNG, JPG, JPEG) 여러 장 또는 카탈로그 PDF를 드래그하거나 클릭하여 등록해 주세요.
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold mt-2">
                        💡 <span className="text-blue-600 font-extrabold">여러 장 다중 등록 지원</span>: 파일이 길어서 2장 이상 분할된 경우, 파일 여러 개를 동시에 선택하여 업로드하면 완벽하게 연결되어 표시됩니다!
                      </p>
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <p className="text-xs sm:text-sm text-slate-800 font-extrabold">본 제품의 고화질 상세 설명 이미지가 업로드 준비 중입니다.</p>
                      <p className="text-[11px] text-slate-500 font-bold max-w-sm leading-relaxed mx-auto">
                        1분 무료 자격 심사 상담 신청을 완료해 주시면, 담당 엔지니어가 카탈로그 사양서 전달 및 지자체 지원금 승인 조회를 신속하게 진행해 드립니다.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenQuoteWithPurpose(productPurpose)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs mt-2"
                      >
                        ⚡ 실시간 무상설치 자격 문의하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10 relative group/solutions">
      {isEditMode && onOpenCms && (
        <button
          onClick={() => onOpenCms('solutions')}
          className="absolute top-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          ✏️ 용도별 솔루션 실시간 편집
        </button>
      )}

      {/* Modern responsive category menu (목차) - Only show when no specific default tab is defined */}
      {defaultActiveTab === 'ALL' && (
        <div className="space-y-4 text-center">
          <span className="text-blue-600 font-black text-sm uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            SOLUTIONS DIRECTORY
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            어떤 공간에 충전기를 설치하시겠습니까?
          </h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-bold">
            설치 현장 용도에 맞춰 보조금 신청 절차와 권장 기기 라인업을 한눈에 비교해 보세요.
          </p>

          {/* Tab Selection Row */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex flex-wrap sm:flex-nowrap justify-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl max-w-full overflow-x-auto scrollbar-none shadow-inner border border-slate-200/50">
              <button
                onClick={() => {
                  setActiveTab('ALL');
                  onPageChange?.('solutions');
                }}
                className={`px-5 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[44px] ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>전체 솔루션</span>
              </button>
              {solutions.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() => {
                    setActiveTab(sol.category);
                    if (sol.category === 'Commercial') onPageChange?.('sol_commercial');
                    else if (sol.category === 'Residential') onPageChange?.('sol_residential');
                    else if (sol.category === 'ParkingLot') onPageChange?.('sol_parking');
                  }}
                  className={`px-5 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[44px] ${
                    activeTab === sol.category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {getTabIcon(sol.category)}
                  <span>{sol.category === 'Commercial' ? '아파트' : sol.category === 'Residential' ? '가정용 홈' : '상업시설 수익형'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category detail block cards */}
      <div className="space-y-10 sm:space-y-16">
        {filteredSolutions.map((sol, index) => {
          return (
            <section
              key={sol.id}
              id={`solution-section-${sol.id}`}
              className="p-3 sm:p-8 md:p-10 bg-white border-0 sm:border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-none sm:shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="space-y-6">
                {/* 1. Header Text & Benefits Block (Top) */}
                <div className="space-y-4 px-1 sm:px-0">
                  <div className="space-y-1.5">
                    <span className="text-emerald-700 font-bold text-xs sm:text-sm tracking-wider uppercase block">
                      {sol.category === 'Commercial' ? '🏢 아파트·공동주택·공용시설 맞춤' : sol.category === 'Residential' ? '🏡 가정용·홈·개인소유지' : '🅿️ 상업시설·수익형 주차장'}
                    </span>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-snug">
                      {sol.title}
                    </h3>
                  </div>
                  
                  {sol.category === 'ParkingLot' && (
                    <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal whitespace-pre-line max-w-3xl pt-1">
                      {sol.description}
                    </p>
                  )}
                </div>

                {sol.category === 'Commercial' && (() => {
                  const brandData = brands[selectedAptBrand] || brands['sk일렉링크'] || BRAND_METADATA['sk일렉링크'];
                  const resolvedCatalog = resolveBrandCatalog(selectedAptBrand, brands);
                  const activePdfUrl = brandData?.pdfUrl || resolvedCatalog.pdfUrl || DEFAULT_BRAND_CATALOGS[selectedAptBrand]?.pdfUrl;
                  const activePdfName = brandData?.pdfName || resolvedCatalog.pdfName || DEFAULT_BRAND_CATALOGS[selectedAptBrand]?.pdfName || `${brandData?.name || selectedAptBrand} 공식 브로셔`;
                  return (
                    <div id="apt-brand-section" className="p-3 sm:p-6 md:p-8 bg-white text-slate-900 rounded-2xl sm:rounded-3xl border-0 sm:border border-slate-200/90 space-y-4 sm:space-y-6 shadow-none sm:shadow-2xs relative overflow-hidden group/brand">
                      {/* Top Gradient Line Accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
                      
                      <div className="space-y-4 border-b border-slate-200/80 pb-5 relative z-10">
                        {/* Top Info Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl">{brandData.icon}</span>
                              <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase block bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                                SY.com 아파트 브랜드 공식 파트너
                              </span>
                            </div>
                            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              {brandData.name}
                            </h4>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                              {brandData.slogan}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 self-start sm:self-auto shrink-0 shadow-2xs">
                            <span>🏢 아파트 브랜드 선택 ({Object.keys(brands).length}개)</span>
                          </div>
                        </div>

                        {/* Full-Width Horizontal Brand Selector with Scroll Buttons */}
                        <div className="relative flex items-center gap-2 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                          {/* Left Navigation Arrow */}
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById('apt-brand-scroll-container');
                              if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                            }}
                            className="p-2.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl transition-all shadow-2xs shrink-0 border border-slate-200 cursor-pointer active:scale-95"
                            title="왼쪽 브랜드 보기"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Scrollable Container */}
                          <div
                            id="apt-brand-scroll-container"
                            className="flex gap-2 overflow-x-auto py-1.5 scroll-smooth w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500 cursor-grab active:cursor-grabbing"
                          >
                            {Object.keys(brands).map((b) => {
                              const isSel = selectedAptBrand === b;
                              return (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    onSelectAptBrand?.(b);
                                    setTimeout(() => {
                                      const el = document.getElementById('apt-brand-section');
                                      if (el) {
                                        const yOffset = -110;
                                        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                        window.scrollTo({ top: y, behavior: 'smooth' });
                                      }
                                    }, 50);
                                  }}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                    isSel
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/20 scale-102 ring-1 ring-emerald-600'
                                      : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 border border-slate-200/80'
                                  }`}
                                >
                                  {b}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Navigation Arrow */}
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById('apt-brand-scroll-container');
                              if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                            }}
                            className="p-2.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl transition-all shadow-2xs shrink-0 border border-slate-200 cursor-pointer active:scale-95"
                            title="오른쪽 브랜드 보기"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-4">
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                            {brandData.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {brandData.highlights.map((hl) => (
                              <span key={hl} className="text-xs font-semibold bg-emerald-50/80 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200/70">
                                ✓ {hl}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/80">
                          <span className="text-xs font-bold text-amber-700 tracking-wider uppercase block">
                            🎁 SY.com 무상 설치 공식 혜택
                          </span>
                          <div className="space-y-2">
                            {brandData.benefits.map((benefit, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                                <span className="font-medium leading-relaxed">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Brand PDF Catalog & Inline Document Viewer */}
                      <div className="border-0 sm:border border-slate-200/80 bg-transparent sm:bg-slate-50/50 rounded-none sm:rounded-2xl p-0 sm:p-4 space-y-4 relative z-10">
                        {isEditMode && activePdfUrl && (
                          <div className="flex justify-end border-b border-slate-200 pb-2">
                            <button
                              type="button"
                              onClick={() => confirmDeleteBrandPdf(selectedAptBrand, brandData.name)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                            >
                              <Trash2 className="w-3 h-3" />
                              브로셔 삭제
                            </button>
                          </div>
                        )}

                        {activePdfUrl ? (
                          <div className="space-y-2">
                            <PdfImageRenderer 
                              fileUrl={activePdfUrl} 
                              fileName={activePdfName || 'catalog.pdf'} 
                              brandName={brandData.name} 
                              isAdmin={isEditMode}
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {isEditMode ? (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingPdf(prev => ({ ...prev, [selectedAptBrand]: true }));
                                }}
                                onDragLeave={() => {
                                  setIsDraggingPdf(prev => ({ ...prev, [selectedAptBrand]: false }));
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingPdf(prev => ({ ...prev, [selectedAptBrand]: false }));
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) {
                                    handlePdfUpload(selectedAptBrand, file);
                                  }
                                }}
                                onClick={() => document.getElementById(`pdf-file-input-${selectedAptBrand}`)?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                                  isDraggingPdf[selectedAptBrand]
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-emerald-400'
                                }`}
                              >
                                <input
                                  type="file"
                                  id={`pdf-file-input-${selectedAptBrand}`}
                                  accept="application/pdf, image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePdfUpload(selectedAptBrand, file);
                                    }
                                  }}
                                />
                                <Upload className="w-7 h-7 text-emerald-600 mb-2" />
                                <p className="text-xs font-bold text-slate-800">
                                  여기에 <span className="text-emerald-700 font-extrabold">[{brandData.name}]</span> 브랜드 카탈로그 PDF 또는 이미지 파일을 드래그하거나 클릭하여 업로드
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                  PDF 파일 또는 이미지 형식(PNG, JPG, JPEG) 모두 완벽 지원 및 자동 고선명 실시간 렌더링
                                </p>
                              </div>
                            ) : (
                              <div className="py-8 text-center bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center space-y-1.5">
                                <FileText className="w-6 h-6 text-slate-400" />
                                <p className="text-xs text-slate-700 font-bold">현재 등록된 브랜드 공식 카탈로그가 없습니다.</p>
                                <p className="text-[10px] text-slate-500">우측 상단의 '실시간 편집 모드'를 활성화하면 PDF 또는 이미지 브로셔를 직접 등록하실 수 있습니다.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                          <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
                            지금 문의하시면 <span className="text-emerald-800 font-bold">{brandData.name}</span> 정부 및 지자체 무상 지원 자격을 즉시 심사 매칭해 드립니다.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenQuoteWithPurpose('Commercial')}
                          className="w-full md:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-1 shrink-0 shadow-2xs border border-yellow-300"
                        >
                          ⚡ {selectedAptBrand} 무상설치 문의하기
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {sol.category === 'Residential' && (() => {
                  const rawProductsList = homeProducts[selectedHomePower] || [];
                  
                  // Filter products by serviceType if specified or zero price
                  const productsList = rawProductsList.filter(p => {
                    const st = (p.serviceType as string) || 'all';
                    if (selectedHomeServiceType === '단말기 단품') {
                      if (st === 'replace' || st === 'no_device') return false;
                      if (st === 'install' && !p.price) return false;
                      if (p.price === 0 && !p.price) return false;
                    } else if (selectedHomeServiceType === '교체 시공') {
                      if (st === 'no_replace') return false;
                      const repPrice = (p as any).replacementPrice !== undefined ? (p as any).replacementPrice : (p.price ? p.price + 150000 : 0);
                      if (repPrice === 0) return false;
                    } else if (selectedHomeServiceType === '신규 설치 포함') {
                      if (st === 'no_install') return false;
                      const instPrice = (p as any).installIncludedPrice !== undefined ? (p as any).installIncludedPrice : (p.price ? p.price + 350000 : 0);
                      if (instPrice === 0) return false;
                    }
                    return true;
                  });
                  
                  // Helper function to calculate price and badge for the active service type
                  const getProductPricing = (p: SolutionProduct) => {
                    if (selectedHomeServiceType === '교체 시공') {
                      const price = (p as any).replacementPrice || p.price + 150000;
                      const regularPrice = (p as any).replacementRegularPrice || p.regularPrice + 180000;
                      const discount = (p as any).replacementDiscount !== undefined ? (p as any).replacementDiscount : Math.round((1 - price / regularPrice) * 100);
                      return { price, regularPrice, discount, label: '교체 시공 포함' };
                    }
                    if (selectedHomeServiceType === '신규 설치 포함') {
                      const price = (p as any).installIncludedPrice || p.price + 350000;
                      const regularPrice = (p as any).installIncludedRegularPrice || p.regularPrice + 400000;
                      const discount = (p as any).installIncludedDiscount !== undefined ? (p as any).installIncludedDiscount : Math.round((1 - price / regularPrice) * 100);
                      return { price, regularPrice, discount, label: '신규 설치 포함' };
                    }
                    // Default: '단말기 단품'
                    return {
                      price: p.price,
                      regularPrice: p.regularPrice,
                      discount: p.discount,
                      label: '단말기 단품'
                    };
                  };

                  // Sort productsList based on sortBy
                  const sortedProducts = [...productsList].sort((a, b) => {
                    const priceA = getProductPricing(a).price;
                    const priceB = getProductPricing(b).price;
                    if (sortBy === 'priceAsc') return priceA - priceB;
                    if (sortBy === 'priceDesc') return priceB - priceA;
                    if (sortBy === 'popular') {
                      const scoreA = (a.tags.includes('MD CHOICE') ? 2 : 0) + (a.tags.includes('HIT') ? 1 : 0);
                      const scoreB = (b.tags.includes('MD CHOICE') ? 2 : 0) + (b.tags.includes('HIT') ? 1 : 0);
                      return scoreB - scoreA;
                    }
                    return 0; // 'new' keeps default order
                  });

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Step 1 & Step 2 Category Selection Box (Shortened, icons removed for sleek mobile view) */}
                      <div id="home-options-section" className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-2xs border border-slate-200/90 space-y-3 sm:space-y-4 relative overflow-hidden">
                        {/* Accent Top Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 sm:pb-3 pt-0.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                가정용 맞춤 옵션
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-lg md:text-xl font-black tracking-tight mt-1 text-slate-900">
                              시공 방식과 충전 용량을 선택하세요
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 self-start sm:self-auto text-xs">
                            <span className="text-[11px] font-medium text-slate-500">선택:</span>
                            <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                              {selectedHomeServiceType} • {selectedHomePower}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {/* Service / Price Category Selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                              구매 및 시공 방식
                            </label>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              {[
                                { id: '단말기 단품', name: '단말기 단품', desc: '기기만 구매' },
                                { id: '교체 시공', name: '교체 시공', desc: '기존 기기 교체' },
                                { id: '신규 설치 포함', name: '설치 포함 (신규)', desc: '한전+전체시공' },
                              ].map((st) => {
                                const active = selectedHomeServiceType === st.id;
                                return (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => {
                                      onSelectHomeServiceType?.(st.id);
                                      setTimeout(() => {
                                        const el = document.getElementById('home-options-section');
                                        if (el) {
                                          const yOffset = -110;
                                          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                          window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                      }, 50);
                                    }}
                                    className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                                      active
                                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs scale-[1.02]'
                                        : 'bg-slate-50 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 border-slate-200/90'
                                    }`}
                                  >
                                    <span className="text-xs sm:text-sm font-bold block leading-tight break-words whitespace-normal w-full">{st.name}</span>
                                    <span className={`text-[10px] block mt-0.5 leading-none ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                                      {st.desc}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Power Capacity Selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                              충전 용량
                            </label>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              {[
                                { kw: '5kW', label: '5kW', desc: '실속형' },
                                { kw: '7kW', label: '7kW', desc: '표준 완속' },
                                { kw: '11kW', label: '11kW', desc: '3상 고속' },
                              ].map((pow) => {
                                const active = selectedHomePower === pow.kw;
                                return (
                                  <button
                                    key={pow.kw}
                                    type="button"
                                    onClick={() => {
                                      onSelectHomePower?.(pow.kw);
                                      setTimeout(() => {
                                        const el = document.getElementById('home-options-section');
                                        if (el) {
                                          const yOffset = -110;
                                          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                          window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                      }, 50);
                                    }}
                                    className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                                      active
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-2xs scale-[1.02]'
                                        : 'bg-slate-50 hover:bg-amber-50/60 text-slate-700 hover:text-amber-800 border-slate-200/90'
                                    }`}
                                  >
                                    <span className="text-xs sm:text-sm font-bold block leading-tight">{pow.label}</span>
                                    <span className={`text-[10px] block mt-0.5 leading-none ${active ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                                      {pow.desc}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Section Header */}
                      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                            <span>홈충전기 {selectedHomePower}</span>
                            <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                              {selectedHomeServiceType}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            총 {sortedProducts.length}개 상품
                          </span>
                          
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => startAddProduct('home', selectedHomePower)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer ml-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              추가
                            </button>
                          )}
                        </div>
                        
                        {/* Sorting select */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 border border-slate-300 rounded-xl text-xs font-black bg-white text-slate-700 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                          >
                            <option value="new">신상품</option>
                            <option value="popular">인기상품순</option>
                            <option value="priceAsc">낮은가격순</option>
                            <option value="priceDesc">높은가격순</option>
                          </select>
                        </div>
                      </div>

                      {/* Products Grid: 2 per row on mobile (grid-cols-2) */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                        {sortedProducts.map((p) => {
                          const pricing = getProductPricing(p);
                          const cardImg = getCardImage(p);
                          const formatPrice = (val: number) => val.toLocaleString() + '원';
                          return (
                            <div
                              key={p.id}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button, a, input, select')) return;
                                setActiveDetailProduct({
                                  ...p,
                                  image: cardImg,
                                  price: pricing.price,
                                  regularPrice: pricing.regularPrice,
                                  discount: pricing.discount,
                                  description: `[${selectedHomeServiceType} • ${selectedHomePower}] ${p.description || ''}`
                                });
                              }}
                              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                            >
                              <div>
                                {/* Top Image Area */}
                                <div className="relative aspect-square bg-slate-100/60 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden border-b border-slate-100">
                                  {/* Dynamic Image */}
                                  <img
                                    src={getOptimizedImageUrl(cardImg, { width: 500, format: 'webp' })}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  />
                                  
                                  {/* Round Power Badge (Left overlay) */}
                                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[9px] sm:text-[11px] flex items-center justify-center border border-blue-200 shadow-2xs ring-2 sm:ring-4 ring-blue-500/10">
                                    {selectedHomePower}
                                  </div>

                                  {/* Black discount circular badge (Right overlay) */}
                                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white font-extrabold text-[9px] sm:text-[11px] flex items-center justify-center shadow-xs">
                                    {pricing.discount}%
                                  </div>

                                  {/* Service Type Ribbon Badge */}
                                  <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-2xs z-10 flex items-center gap-1">
                                    <span>{pricing.label}</span>
                                  </div>

                                  {/* Left visual ribbons/badges */}
                                  {p.hasASBadge && (
                                    <div className="absolute top-10 sm:top-15 left-2 sm:left-3 bg-rose-500 text-white font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow-2xs z-10 animate-pulse">
                                      무상A/S 4년
                                    </div>
                                  )}
                                </div>

                                {/* Body Information */}
                                <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
                                  <h5 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug break-words whitespace-normal">
                                    {p.name}
                                  </h5>
                                  
                                  {/* Price Section */}
                                  <div className="pt-0.5">
                                    {(p.name.includes('공용') || p.name.includes('수익형') || p.name.includes('관공서') || p.name.includes('조달상품')) && !p.name.includes('개인용') && !p.name.includes('가정용') ? (
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-xs sm:text-base font-black text-rose-600">
                                          견적문의
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        {pricing.regularPrice > pricing.price ? (
                                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium line-through block leading-none mb-0.5">
                                            ₩{pricing.regularPrice.toLocaleString()}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] sm:text-[10px] text-transparent block leading-none mb-0.5 select-none">
                                            -
                                          </span>
                                        )}
                                        <div className="flex flex-wrap items-baseline gap-1">
                                          <span className="text-xs sm:text-base font-black text-rose-600">
                                            ₩{pricing.price.toLocaleString()}
                                          </span>
                                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                                            ({selectedHomeServiceType === '단말기 단품' ? '단품' : selectedHomeServiceType === '교체 시공' ? '교체' : '설치'})
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Footer Badges and Direct CTA */}
                              <div className="p-2.5 sm:p-4 pt-0 space-y-1.5 sm:space-y-3">
                                {p.tags && p.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-1.5 sm:pt-3">
                                    {p.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className={`text-[8px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded ${
                                          tag === 'MD CHOICE'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : tag === 'HIT'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {canEdit && (
                                  <div className="flex gap-1 mt-1 pt-1 border-t border-slate-100">
                                    <button
                                      onClick={(e) => startEditProduct(p, 'home', selectedHomePower, e)}
                                      className="flex-1 py-1 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg text-[9px] sm:text-[10px] font-black border border-amber-200/50 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      수정
                                    </button>
                                    <button
                                      onClick={(e) => deleteProduct(p.id, 'home', selectedHomePower, e)}
                                      className="flex-1 py-1 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[9px] sm:text-[10px] font-black border border-rose-200/50 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {sol.category === 'ParkingLot' && (() => {
                  const productsList = parkingProducts[selectedParkingCapacity] || [];
                  
                  // Sort productsList based on sortBy
                  const sortedProducts = [...productsList].sort((a, b) => {
                    if (sortBy === 'priceAsc') return a.price - b.price;
                    if (sortBy === 'priceDesc') return b.price - a.price;
                    if (sortBy === 'popular') {
                      const scoreA = (a.tags.includes('BEST') ? 2 : 0) + (a.tags.includes('HIT') ? 1 : 0);
                      const scoreB = (b.tags.includes('BEST') ? 2 : 0) + (b.tags.includes('HIT') ? 1 : 0);
                      return scoreB - scoreA;
                    }
                    return 0; // 'new' keeps default order
                  });

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Product Section Header */}
                      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                            수익형 충전기 {selectedParkingCapacity}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            총 {sortedProducts.length}개 상품
                          </span>
                          
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => startAddProduct('parking', selectedParkingCapacity)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer ml-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              추가
                            </button>
                          )}
                        </div>
                        
                        {/* Sorting select */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 border border-slate-300 rounded-xl text-xs font-black bg-white text-slate-700 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                          >
                            <option value="new">신상품</option>
                            <option value="popular">인기상품순</option>
                            <option value="priceAsc">낮은가격순</option>
                            <option value="priceDesc">높은가격순</option>
                          </select>
                        </div>
                      </div>

                      {/* Products Grid: 2 per row on mobile (grid-cols-2) */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                        {sortedProducts.map((p) => {
                          const formatPrice = (val: number) => val.toLocaleString() + '원';
                          const cardImg = getCardImage(p);
                          return (
                            <div
                              key={p.id}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button, a, input, select')) return;
                                setActiveDetailProduct({ ...p, image: cardImg });
                              }}
                              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                            >
                              <div>
                                {/* Top Image Area */}
                                <div className="relative aspect-square bg-slate-100/60 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden border-b border-slate-100">
                                  {/* Dynamic Image */}
                                  <img
                                    src={getOptimizedImageUrl(cardImg, { width: 500, format: 'webp' })}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  />
                                  
                                  {/* Round Power Badge (Left overlay) */}
                                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2.5 h-7 sm:h-10 rounded-full bg-blue-50 text-indigo-600 font-extrabold text-[8px] sm:text-[10px] flex items-center justify-center border border-indigo-200 shadow-2xs ring-2 sm:ring-4 ring-indigo-500/10 whitespace-nowrap">
                                    {p.power || p.name.match(/\d+kW/i)?.[0] || selectedParkingCapacity.split(' ')[0]}
                                  </div>

                                  {/* Black discount circular badge (Right overlay) */}
                                  {p.discount && p.discount > 0 ? (
                                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white font-extrabold text-[9px] sm:text-[11px] flex items-center justify-center shadow-xs">
                                      {p.discount}%
                                    </div>
                                  ) : null}

                                  {/* Left visual ribbons/badges */}
                                  {p.hasPromoRibbon && (
                                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-2xs z-10">
                                      수익성 최고
                                    </div>
                                  )}
                                </div>

                                {/* Body Information */}
                                <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
                                  <h5 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug break-words whitespace-normal">
                                    {p.name}
                                  </h5>
                                  
                                  {p.description && (
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed break-words whitespace-normal">
                                      {p.description}
                                    </p>
                                  )}
                                  
                                  {/* Price Section */}
                                  <div className="pt-0.5">
                                    <span className="text-xs sm:text-base font-black text-blue-600 block">
                                      별도문의
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Badges and Direct CTA */}
                              <div className="p-2.5 sm:p-4 pt-0 space-y-1.5 sm:space-y-3">
                                {p.tags && p.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-1.5 sm:pt-3">
                                    {p.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className={`text-[8px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded ${
                                          tag === 'BEST'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : tag === 'HIT'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {isEditMode && (
                                  <div className="flex gap-1 mt-1 pt-1 border-t border-slate-100">
                                    <button
                                      onClick={(e) => startEditProduct(p, 'parking', selectedParkingCapacity, e)}
                                      className="flex-1 py-1 sm:py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg text-[9px] sm:text-[10px] font-black border border-amber-200/50 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      수정
                                    </button>
                                    <button
                                      onClick={(e) => deleteProduct(p.id, 'parking', selectedParkingCapacity, e)}
                                      className="flex-1 py-1 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[9px] sm:text-[10px] font-black border border-rose-200/50 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 정부 보조금 및 설치 대행 프로세스 (01단계 ~ 04단계) */}
                {sol.category !== 'Residential' && (
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      정부 보조금 및 설치 대행 프로세스 (원스톱 무료 대행 서비스)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                      {sol.subsidyProcess.map((step, sIdx) => (
                        <div key={step} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs relative flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 block mb-1">0{sIdx+1}단계</span>
                            <span className="font-bold leading-relaxed block text-slate-800 text-xs sm:text-[11px]">{step.split(': ')[1]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sol.category !== 'Residential' && (
                  <div className="pt-3 pb-6 flex flex-col items-center justify-center text-center gap-3 py-6 border-b border-slate-100">
                    <button
                      onClick={() => onOpenQuoteWithPurpose(sol.category)}
                      id={`btn-solution-cta-${sol.id}`}
                      className="w-full sm:w-auto min-w-[280px] sm:min-w-[420px] py-4 px-10 font-bold shadow-xs rounded-2xl text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    >
                      <span>{sol.subtitle} 맞춤 상담 예약하기</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 animate-pulse" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      * 국고 보조금 예산 마감 전 신청을 적극 권장드립니다.
                    </span>
                  </div>
                )}


              </div>
            </section>
          );
        })}
      </div>


      {/* 3. Product Create / Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] z-10 font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {editingProductType === 'home' ? '가정용 홈 충전기' : '수익형 충전기'} ({editingCategory})
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {editingProduct ? '상품 정보 수정하기' : '새 상품 등록하기'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-700 text-sm">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">상품명</label>
                  <input
                    type="text"
                    value={prodFormName}
                    onChange={(e) => setProdFormName(e.target.value)}
                    placeholder="예: SK일렉링크 7kW 프리미엄 충전기"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-xs"
                  />
                </div>

                {/* Pricing Fields according to Service Type */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      💰 시공/판매 구분별 가격 설정
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const baseP = Number(prodFormPrice) || 0;
                        const baseReg = Number(prodFormRegularPrice) || baseP;
                        setProdFormReplacementPrice(baseP + 150000);
                        setProdFormReplacementRegularPrice(baseReg + 180000);
                        setProdFormInstallIncludedPrice(baseP + 350000);
                        setProdFormInstallIncludedRegularPrice(baseReg + 400000);
                      }}
                      className="text-[10px] font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 px-2 py-0.5 rounded cursor-pointer transition-all"
                      title="단말기 단품 가격 기준으로 교체(+15만)/설치(+35만) 자동채우기"
                    >
                      ⚡표준가격 자동계산
                    </button>
                  </div>

                  {/* 1. 단말기 단품 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    selectedHomeServiceType === '단말기 단품'
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                        📦 단말기 단품 (기기만)
                      </span>
                      {selectedHomeServiceType === '단말기 단품' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          👈 메인 화면 선택 중
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">정가 (원)</label>
                        <input
                          type="number"
                          value={prodFormRegularPrice}
                          onChange={(e) => setProdFormRegularPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-500 line-through"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-amber-800">특가 판매가 (원)</label>
                        <input
                          type="number"
                          value={prodFormPrice}
                          onChange={(e) => setProdFormPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-xs font-black text-amber-900 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. 교체 시공 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    selectedHomeServiceType === '교체 시공'
                      ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-400/30'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                        🔄 교체 시공 (기존 기기 교체)
                      </span>
                      {selectedHomeServiceType === '교체 시공' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          👈 메인 화면 선택 중
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">정가 (원)</label>
                        <input
                          type="number"
                          value={prodFormReplacementRegularPrice}
                          onChange={(e) => setProdFormReplacementRegularPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-500 line-through"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-blue-800">특가 판매가 (원)</label>
                        <input
                          type="number"
                          value={prodFormReplacementPrice}
                          onChange={(e) => setProdFormReplacementPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-mono text-xs font-black text-blue-900 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. 신규 설치 포함 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    selectedHomeServiceType === '신규 설치 포함'
                      ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/30'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                        ⚡ 신규 설치 포함 (한전대행+전체시공)
                      </span>
                      {selectedHomeServiceType === '신규 설치 포함' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          👈 메인 화면 선택 중
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">정가 (원)</label>
                        <input
                          type="number"
                          value={prodFormInstallIncludedRegularPrice}
                          onChange={(e) => setProdFormInstallIncludedRegularPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-500 line-through"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-emerald-800">특가 판매가 (원)</label>
                        <input
                          type="number"
                          value={prodFormInstallIncludedPrice}
                          onChange={(e) => setProdFormInstallIncludedPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono text-xs font-black text-emerald-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Image File Upload & URL */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-800">📸 대표 이미지 업로드 / 변경</label>
                    <button
                      type="button"
                      onClick={() => {
                        const urls = [
                          '/스필.png',
                          '/쿨차지.png',
                          '/일렉트리.png',
                          '/차지고.png',
                          '/50kw-쿨차지.png'
                        ];
                        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                        setProdFormImage(randomUrl);
                      }}
                      className="text-[10px] text-blue-600 font-black hover:underline cursor-pointer"
                    >
                      🎲 기본 이미지 적용
                    </button>
                  </div>

                  {/* File Upload Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingProdImage(true); }}
                    onDragLeave={() => setIsDraggingProdImage(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDraggingProdImage(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const compressed = await compressImage(file, 1200, 1200, 0.85);
                        setProdFormImage(compressed);
                      }
                    }}
                    onClick={() => document.getElementById('prod-form-image-file-input')?.click()}
                    className={`p-4 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isDraggingProdImage ? 'border-blue-500 bg-blue-100/70' : 'border-blue-300 bg-white hover:bg-blue-50/50 hover:border-blue-500'
                    }`}
                  >
                    <input
                      type="file"
                      id="prod-form-image-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file, 1200, 1200, 0.85);
                          setProdFormImage(compressed);
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 text-blue-600 animate-bounce" />
                    <span className="text-xs font-black text-slate-900">
                      📁 내 컴퓨터에서 이미지 파일 선택 / 드래그 업로드
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      PNG, JPG, WebP 이미지 파일 지원 (자동 고화질 압축 저장)
                    </span>
                  </div>

                  {/* Image URL Input */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">또는 외부 이미지 웹 URL 입력:</span>
                    <input
                      type="text"
                      value={prodFormImage}
                      onChange={(e) => setProdFormImage(e.target.value)}
                      placeholder="/스필.png 또는 이미지 URL"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                    />
                  </div>

                  {/* Preview */}
                  {prodFormImage && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                        <img
                          src={getOptimizedImageUrl(prodFormImage, { width: 200, format: 'webp' })}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = '/스필.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-extrabold text-emerald-600 block">✓ 대표 이미지 설정됨</span>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{prodFormImage.slice(0, 45)}...</p>
                        <button
                          type="button"
                          onClick={() => setProdFormImage('')}
                          className="mt-0.5 text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          이미지 초기화
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={prodFormTags}
                    onChange={(e) => setProdFormTags(e.target.value)}
                    placeholder="예: MD CHOICE, HIT, BEST"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-xs"
                  />
                </div>

                {/* Checkboxes */}
                <div className="pt-2 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFormHasASBadge}
                      onChange={(e) => setProdFormHasASBadge(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="text-left">
                      <span className="text-xs font-black text-slate-800 block">무상 A/S 4년</span>
                      <span className="text-[10px] text-slate-400 block font-bold">배지 노출 여부</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFormHasPromoRibbon}
                      onChange={(e) => setProdFormHasPromoRibbon(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="text-left">
                      <span className="text-xs font-black text-slate-800 block">기획상품 리본</span>
                      <span className="text-[10px] text-slate-400 block font-bold">리본 배지 노출 여부</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveProductForm}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-slate-900/10"
                >
                  {editingProduct ? '수정 완료' : '등록 완료'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Delete Confirmation Modal */}
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
}
