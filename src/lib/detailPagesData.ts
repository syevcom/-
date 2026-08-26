/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unified Detail Page & Catalog Data Management Engine for Home, Apartment, and Commercial EV Chargers
 */

import { loadAllBrandPdfs, saveBrandPdf, deleteBrandPdf } from './indexedDb';
import { uploadFileToFirebaseStorage, db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import {
  BIZ_7KW_PLC_IMAGE,
  BIZ_11KW_STORMSHIELD_IMAGE,
  BIZ_35KW_STORMSHIELD_IMAGE
} from '../data';

export interface ProductDetailItem {
  pdfUrls?: string[];
  pdfNames?: string[];
  pdfUrl?: string;
  pdfName?: string;
  detailImages?: string[];
  specs?: Record<string, string>;
  features?: string[];
  installationGuide?: string[];
  certifications?: string[];
  warrantyInfo?: string;
  updatedAt?: string;
  deleted?: boolean;
}

// 1. Initial default detail pages for first-time onboarding
export const DEFAULT_PRODUCT_DETAILS: Record<string, ProductDetailItem> = {
  // === HOME 5kW (Slim Economy) ===
  'product-sy-ac05': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfName: 'SY-AC05 5kW 슬림 스마트 홈 충전기 상세 사양서',
    pdfUrls: [
      '/images/home-detail-speel-5kw.png'
    ],
    pdfNames: ['스필 5kW 홈충전기 상세 스펙'],
    specs: {
      '정격 전압/전류': '단상 AC 220V / 23A (60Hz)',
      '최대 충전 용량': '5kW (한전 승압 불필요 모델)',
      '커넥터 규격': '완속 5핀 (Type 1 J1772)',
      '방수/방진 등급': 'IP55 방우형 디자인',
      '특장점': '한전 기본요금 월 1만원 영구 절감 효과'
    }
  },
  'product-res-5kw-spil': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 슬림형 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'product-res-5kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 5kW 슬림형 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'product-res-5kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 5kW 개인용 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'product-res-5kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 5kW 개인용 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },

  // === HOME 7kW (Standard Bestseller) ===
  'product-sy-ac07': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfName: 'SY-AC07 7kW 스마트 홈 충전기 공식 사양서 및 상세페이지',
    pdfUrls: [
      '/images/home-detail-speel-7kw.png'
    ],
    pdfNames: [
      '스필 7kW 홈충전기 상세 스펙'
    ],
    specs: {
      '정격 전압/전류': '단상 AC 220V / 32A (60Hz)',
      '최대 충전 용량': '7kW (일반 완속 표준 규격)',
      '커넥터 규격': '완속 5핀 (Type 1 J1772 국가 표준)',
      '방수/방진 등급': 'IP55 실외/실내 전용 규격',
      '화재 감지 기술': '환경부 인증 스마트 PLC 모뎀 내장',
      '보증 기간': '국내 최초 무상 A/S 4년 보장'
    },
    features: [
      '국가 KC 안전 인증 및 전자기파 적합성 시험 100% 통과',
      '스파크 및 과열 미세 감지 오토 셧다운 3단계 안전망 탑재',
      '야간 경부하 할인 시간대 스마트 예약 충전 칩셋 내장',
      '비바람과 영하 25도 한파에 견디는 고강도 실리콘 케이블(5m/7m)'
    ]
  },
  'product-res-7kw-spil': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfName: '스필 7kW 완속 스마트홈 상세페이지',
    pdfUrls: [
      '/images/home-detail-speel-7kw.png'
    ],
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'product-res-7kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 7kW 가정용 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'product-res-7kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 7kW 가정용 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'product-res-7kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 7kW 개인용 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },

  // === HOME 11kW (3-Phase High-Power) ===
  'product-sy-ac11-bi': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfName: 'SY-AC11 11kW 3상 고속 스마트 완속 충전기 상세페이지',
    pdfUrls: [
      '/images/home-detail-speel-11kw.png'
    ],
    pdfNames: ['스필 11kW 고속형 상세 사양서'],
    specs: {
      '정격 전압/전류': '3상 4선식 AC 380V / 16A',
      '최대 충전 용량': '11kW (7kW 대비 1.5배 고속 완충)',
      '커넥터 규격': '완속 5핀 / 7핀 호환',
      '방수/방진 등급': 'IP55 옥외 전용'
    }
  },
  'product-res-11kw-spil': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 고속형 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'product-res-11kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 11kW 개인용 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'product-res-11kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 11kW 3상 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },

  // === COMMERCIAL / PARKING BIZ ===
  'product-park-7kw-plc-biz': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfName: '스마트제어 PLC 7kW BIZ 공용 충전기 사양서 및 수익형 모델 브로셔',
    pdfUrls: [
      '/images/biz-charger-7-11kw.png'
    ],
    pdfNames: ['PLC 7kW BIZ 공용 충전기 상세 사양서']
  },
  'product-park-11kw-stormshield': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfName: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 상세페이지',
    pdfUrls: [
      '/images/biz-charger-7-11kw.png'
    ],
    pdfNames: ['11kW BIZ 공용 쿨차지 스톰쉴드 사양서']
  },
  'product-park-35kw-stormshield': {
    pdfUrl: '/images/biz-charger-35kw.png',
    pdfName: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 중급속 사양서',
    pdfUrls: [
      '/images/biz-charger-35kw.png'
    ],
    pdfNames: ['35kW BIZ 공용 쿨차지 중급속 스톰쉴드 브로셔']
  },

  // === COMMERCIAL / PARKING 50kW (Rapid) ===
  'product-park-50kw-1ch-coolcharge': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서 및 수익형 모델 브로셔',
    pdfUrls: [
      '/images/biz-charger-50kw.png'
    ],
    pdfNames: [
      '쿨차지 50kW 급속 1부: 기기 제원 및 QR 간편 결제 관제'
    ],
    specs: {
      '출력 용량': '50kW 급속 (DC콤보 1채널/2채널)',
      '정격 입력': '3상 380V AC (한전 50kW 이상 증설)',
      '충전 속도': '배터리 20% -> 80% 완충 약 40분 소요',
      '결제 시스템': '신용카드 터치 + 카카오페이/QR코드 + 모바일 앱',
      '관제 연동': '24시간 무인 OCPP 1.6/2.0.1 표준 원격 관제'
    }
  },
  'product-sy-dc50': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세페이지'
  },

  // === COMMERCIAL / PARKING 100kW (High Power Rapid) ===
  'product-park-100kw-2ch': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: '100kW 2채널 동시 급속 충전기 상세페이지',
    pdfUrls: [
      '/50kw-쿨차지.png'
    ],
    pdfNames: ['100kW 2채널 동시 급속 사양서']
  },

  // === COMMERCIAL / PARKING 200kW (Ultra-Fast) ===
  'product-park-200kw-2ch': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: '200kW 초급속 수랭식 디스펜서 충전기 상세페이지',
    pdfUrls: [
      '/50kw-쿨차지.png'
    ],
    pdfNames: ['200kW 초급속 수랭식 디스펜서 사양서']
  },
  'product-sy-fc200': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: 'SY-FC200 200kW 초급속 수랭식 충전기 사양서',
    pdfUrls: ['/50kw-쿨차지.png'],
    pdfNames: ['SY-FC200 200kW 초급속 사양서']
  },
  'sy-fc200': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: 'SY-FC200 200kW 초급속 충전기 사양서',
    pdfUrls: ['/50kw-쿨차지.png']
  },
  'sy-ac05': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 슬림 스마트 홈 충전기 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'res-5kw-spil': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 슬림형 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'res-5kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 5kW 슬림형 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'res-5kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 5kW 개인용 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'res-5kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 5kW 개인용 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'sy-ac07': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 완속 스마트홈 상세페이지',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'res-7kw-spil': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 홈충전기 상세 스펙',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'res-7kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 7kW 가정용 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'res-7kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 7kW 가정용 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'res-7kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 7kW 개인용 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'sy-ac11-bi': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 고속형 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'res-11kw-spil': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 고속형 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'res-11kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 11kW 개인용 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'res-11kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 11kW 3상 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'park-7kw-plc-biz': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '스마트제어 PLC 7kW BIZ 공용 충전기 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['PLC 7kW BIZ 공용 충전기 상세 사양서']
  },
  'park-11kw-stormshield': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 상세페이지',
    pdfNames: ['11kW BIZ 공용 쿨차지 스톰쉴드 사양서']
  },
  'park-35kw-stormshield': {
    pdfUrl: '/images/biz-charger-35kw.png',
    pdfUrls: ['/images/biz-charger-35kw.png'],
    pdfName: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 중급속 사양서',
    pdfNames: ['35kW BIZ 공용 쿨차지 중급속 스톰쉴드 브로셔']
  },
  'park-50kw-1ch-coolcharge': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서']
  },
  'sy-dc50': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서'
  },
  // Commercial product name aliases for direct fallback matching
  'product-스마트제어 완속 충전기 PLC 7kW BIZ 전기차 공용': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '스마트제어 완속 충전기 7kW 상세 사양서'
  },
  'product-11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '11kw 공용 전기차 충전기 쿨차지 상세페이지'
  },
  'product-35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드': {
    pdfUrl: '/images/biz-charger-35kw.png',
    pdfUrls: ['/images/biz-charger-35kw.png'],
    pdfName: '35kw 공용 전기차 충전기 쿨차지 상세 사양서'
  },
  'product-전기차 급속 충전기 50kW 1CH 쿨차지': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kw 상세 사양서'
  }
};

/**
 * Standard Home / Residential Product Details (Permanent Canonical Mappings)
 */
export const DEFAULT_HOME_DETAILS: Record<string, ProductDetailItem> = {
  // Spil 5kW
  'sy-ac05': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'res-5kw-spil': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'product-sy-ac05': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  'product-res-5kw-spil': {
    pdfUrl: '/images/home-detail-speel-5kw.png',
    pdfUrls: ['/images/home-detail-speel-5kw.png'],
    pdfName: '스필 5kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 5kW 홈충전기 상세 스펙']
  },
  // Spil 7kW
  'sy-ac07': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'res-7kw-spil': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'product-sy-ac07': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'product-res-7kw-spil': {
    pdfUrl: '/images/home-detail-speel-7kw.png',
    pdfUrls: ['/images/home-detail-speel-7kw.png'],
    pdfName: '스필 7kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  // Spil 11kW
  'sy-ac11-bi': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'res-11kw-spil': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'product-sy-ac11-bi': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  'product-res-11kw-spil': {
    pdfUrl: '/images/home-detail-speel-11kw.png',
    pdfUrls: ['/images/home-detail-speel-11kw.png'],
    pdfName: '스필 11kW 개인용 전기차 충전기 상세페이지',
    pdfNames: ['스필 11kW 고속형 상세 사양서']
  },
  // Electree (5kW, 7kW, 11kW)
  'res-5kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'product-res-5kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'res-7kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'product-res-7kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'res-11kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  'product-res-11kw-electree': {
    pdfUrl: '/images/home-detail-electree.png',
    pdfUrls: ['/images/home-detail-electree.png'],
    pdfName: '일렉트리 개인용 전기차 충전기 상세페이지',
    pdfNames: ['일렉트리 상세페이지']
  },
  // Koolcharge (5kW, 7kW, 11kW)
  'res-5kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'product-res-5kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'res-7kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'product-res-7kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'res-11kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  'product-res-11kw-coolcharge': {
    pdfUrl: '/images/home-detail-coolcharge.png',
    pdfUrls: ['/images/home-detail-coolcharge.png'],
    pdfName: '쿨차지 개인용 전기차 충전기 상세페이지',
    pdfNames: ['쿨차지 상세페이지']
  },
  // Chargego (5kW, 7kW - 3 pages in order)
  'res-5kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 개인용 전기차 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'product-res-5kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 개인용 전기차 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'res-7kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 개인용 전기차 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  },
  'product-res-7kw-chargego': {
    pdfUrl: '/images/home-detail-chajigo1.png',
    pdfUrls: [
      '/images/home-detail-chajigo1.png',
      '/images/home-detail-chajigo2.png',
      '/images/home-detail-chajigo3.png'
    ],
    pdfName: '차지고 개인용 전기차 충전기 상세페이지 (총 3부)',
    pdfNames: ['차지고 상세페이지 1부', '차지고 상세페이지 2부', '차지고 상세페이지 3부']
  }
};

/**
 * Standard Commercial Facility Product Details (Permanent Canonical Mappings)
 */
export const DEFAULT_COMMERCIAL_DETAILS: Record<string, ProductDetailItem> = {
  'park-7kw-plc-biz': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '스마트제어 완속 충전기 PLC 7kW BIZ 전기차 공용 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['스마트제어 PLC 7kW BIZ 공용 충전기 상세 사양서']
  },
  'product-park-7kw-plc-biz': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '스마트제어 완속 충전기 PLC 7kW BIZ 전기차 공용 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['스마트제어 PLC 7kW BIZ 공용 충전기 상세 사양서']
  },
  'park-11kw-stormshield': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 상세페이지',
    pdfNames: ['11kW BIZ 공용 쿨차지 스톰쉴드 사양서']
  },
  'product-park-11kw-stormshield': {
    pdfUrl: '/images/biz-charger-7-11kw.png',
    pdfUrls: ['/images/biz-charger-7-11kw.png'],
    pdfName: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 상세페이지',
    pdfNames: ['11kW BIZ 공용 쿨차지 스톰쉴드 사양서']
  },
  'park-35kw-stormshield': {
    pdfUrl: '/images/biz-charger-35kw.png',
    pdfUrls: ['/images/biz-charger-35kw.png'],
    pdfName: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 중급속 사양서',
    pdfNames: ['35kW BIZ 공용 쿨차지 중급속 스톰쉴드 브로셔']
  },
  'product-park-35kw-stormshield': {
    pdfUrl: '/images/biz-charger-35kw.png',
    pdfUrls: ['/images/biz-charger-35kw.png'],
    pdfName: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드 중급속 사양서',
    pdfNames: ['35kW BIZ 공용 쿨차지 중급속 스톰쉴드 브로셔']
  },
  'park-50kw-1ch-coolcharge': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서']
  },
  'product-park-50kw-1ch-coolcharge': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서 및 수익형 모델 브로셔',
    pdfNames: ['전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서']
  },
  'sy-dc50': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서',
    pdfNames: ['SY-DC50 50kW 공용 급속 충전기 사양서']
  },
  'product-sy-dc50': {
    pdfUrl: '/images/biz-charger-50kw.png',
    pdfUrls: ['/images/biz-charger-50kw.png'],
    pdfName: '전기차 급속 충전기 50kW 1CH 쿨차지 상세 사양서',
    pdfNames: ['SY-DC50 50kW 공용 급속 충전기 사양서']
  }
};

/**
 * Direct image URL mapping for PostImages gallery links to guarantee
 * instant, zero-CORS high-resolution rendering in <img> and PDF viewers.
 */
export const POSTIMG_URL_MAP: Record<string, string> = {
  // Brand Catalogs (Apartment)
  'https://postimg.cc/mcrQ4yZt': 'https://i.postimg.cc/nL4Tv36Y/SKilleglingkeu-beulosyueo-26-01-09-(1).png',
  'https://postimg.cc/dkkrkQTH': 'https://i.postimg.cc/DZ5gN8fT/peulleogeulingkeuyeong-eobbeulosyeo-gongtong-250529.png',
  'https://postimg.cc/phw8DNfX': 'https://i.postimg.cc/qqRLH4gn/iel-illegteulig-hoesasogaeseo-260121.png',
  'https://postimg.cc/sB2pz4fR': 'https://i.postimg.cc/yNmnFLwW/2-NICEinpeula(ju)-naiseuchajeo-jeongicha-wansogchungjeongi-jeanseo.png',
  'https://postimg.cc/XBgKKjnC': 'https://i.postimg.cc/hvkCBvwp/(KOR)-2026-ebeoon-Company-Brochure-(1).png',
  'https://postimg.cc/McGywmZz': 'https://i.postimg.cc/cJRTQFVt/i-PARKING-EV-yeong-eob-yong-pyojunjeanseo-2602-yogeum-insang-ban-yeong.png',
  'https://postimg.cc/nsLvxGFw': 'https://i.postimg.cc/s2YKpTty/LGyupeulleoseubolteueob-jeanseo-260701.png',
  
  // Commercial Facility Chargers
  'https://postimg.cc/N5JJZDwR': '/images/biz-charger-7-11kw.png',
  'https://postimg.cc/D4zQgVmk': '/images/biz-charger-35kw.png',
  'https://postimg.cc/N2084hLv': '/images/biz-charger-50kw.png',

  // Home / Residential Chargers
  'https://postimg.cc/zyNvZCSg': '/images/home-detail-speel-7kw.png',
  'https://postimg.cc/FYvz5ygk': '/images/home-detail-speel-5kw.png',
  'https://postimg.cc/fVsyncjX': '/images/home-detail-speel-11kw.png',
  'https://postimg.cc/PCHJsWzx': '/images/home-detail-electree.png',
  'https://postimg.cc/CR41FRm2': '/images/home-detail-coolcharge.png',
  'https://postimg.cc/4YGyk6b6': '/images/home-detail-chajigo1.png',
  'https://postimg.cc/LJVXHJNY': '/images/home-detail-chajigo2.png',
  'https://postimg.cc/G4j2c4qs': '/images/home-detail-chajigo3.png',

  // Direct PostImages Legacy Mappings (Auto-upgrade prior URLs in caches to local high-res files)
  'https://i.postimg.cc/Nj9HXbKp/seupil7sangsepeiji.png': '/images/home-detail-speel-7kw.png',
  'https://i.postimg.cc/50hsLj3Z/seupil7sangsepeiji.png': '/images/home-detail-speel-7kw.png',
  'https://i.postimg.cc/t4Zx6Dsk/seupil5sangsepeiji.png': '/images/home-detail-speel-5kw.png',
  'https://i.postimg.cc/prKqZxGq/seupil5sangsepeiji.png': '/images/home-detail-speel-5kw.png',
  'https://i.postimg.cc/9QR791Dx/seupil11sangsepeiji.png': '/images/home-detail-speel-11kw.png',
  'https://i.postimg.cc/FRMT31Zw/seupil11sangsepeiji.png': '/images/home-detail-speel-11kw.png',
  'https://i.postimg.cc/qvPCxnnp/kulchaji.png': '/images/home-detail-coolcharge.png',
  'https://i.postimg.cc/C5bmNYPW/kulchaji.png': '/images/home-detail-coolcharge.png',
  'https://i.postimg.cc/13nqFM8p/illegteuli.png': '/images/home-detail-electree.png',
  'https://i.postimg.cc/bwDtnLZB/chajigo1.png': '/images/home-detail-chajigo1.png',
  'https://i.postimg.cc/d1b5rDBp/chajigo1.png': '/images/home-detail-chajigo1.png',
  'https://i.postimg.cc/T3zWJmb9/chajigo2.png': '/images/home-detail-chajigo2.png',
  'https://i.postimg.cc/br13T8CM/chajigo2.png': '/images/home-detail-chajigo2.png',
  'https://i.postimg.cc/sgkZ4SWK/chajigo3.png': '/images/home-detail-chajigo3.png',
  'https://i.postimg.cc/90yJpV8K/chajigo3.png': '/images/home-detail-chajigo3.png',
  'https://i.postimg.cc/02xfsTH0/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/kg906Y1Y/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/nZ9WvZ4g/plc-klchaji-7kw.png': '/images/biz-charger-7-11kw.png',
  'https://i.postimg.cc/yxmf7sHd/35kw-kulchaji.png': '/images/biz-charger-35kw.png',
  'https://i.postimg.cc/BQsg0rwn/35kw-kulchaji.png': '/images/biz-charger-35kw.png',
  'https://i.postimg.cc/qqsmp4Tq/50kw-kulchaji.png': '/images/biz-charger-50kw.png',
  'https://i.postimg.cc/X738bRDp/50kw-kulchaji.png': '/images/biz-charger-50kw.png'
};

export function resolvePostImgUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (POSTIMG_URL_MAP[trimmed]) {
    return POSTIMG_URL_MAP[trimmed];
  }
  for (const [pageUrl, directUrl] of Object.entries(POSTIMG_URL_MAP)) {
    const rawCode = pageUrl.split('/').pop() || '';
    if (rawCode && trimmed.includes(rawCode)) {
      return directUrl;
    }
  }
  return trimmed;
}

// 2. Initial brand catalogs for Apartment category with direct official links
export const DEFAULT_BRAND_CATALOGS: Record<string, { pdfUrl?: string; pdfName?: string; description?: string; deleted?: boolean }> = {
  'sk일렉링크': {
    pdfUrl: 'https://i.postimg.cc/nL4Tv36Y/SKilleglingkeu-beulosyueo-26-01-09-(1).png',
    pdfName: 'SK일렉링크 아파트 공식 브로셔 및 무상 설치 제안서'
  },
  'SK일렉링크': {
    pdfUrl: 'https://i.postimg.cc/nL4Tv36Y/SKilleglingkeu-beulosyueo-26-01-09-(1).png',
    pdfName: 'SK일렉링크 아파트 공식 브로셔 및 무상 설치 제안서'
  },
  '플러그링크': {
    pdfUrl: 'https://i.postimg.cc/DZ5gN8fT/peulleogeulingkeuyeong-eobbeulosyeo-gongtong-250529.png',
    pdfName: '플러그링크 스마트 로드밸런싱 아파트 공식 카탈로그'
  },
  '이엘일렉트릭': {
    pdfUrl: 'https://i.postimg.cc/qqRLH4gn/iel-illegteulig-hoesasogaeseo-260121.png',
    pdfName: '이엘일렉트릭 화재안심 완속 충전기 공식 브로셔'
  },
  '나이스차져': {
    pdfUrl: 'https://i.postimg.cc/yNmnFLwW/2-NICEinpeula(ju)-naiseuchajeo-jeongicha-wansogchungjeongi-jeanseo.png',
    pdfName: '나이스차져 금융 인프라 기반 전기차 완속충전기 제안서'
  },
  '에버온': {
    pdfUrl: 'https://i.postimg.cc/hvkCBvwp/(KOR)-2026-ebeoon-Company-Brochure-(1).png',
    pdfName: '에버온 전국 1위 완속 충전 인프라 공식 회사소개서 및 카탈로그'
  },
  '아이파킹': {
    pdfUrl: 'https://i.postimg.cc/cJRTQFVt/i-PARKING-EV-yeong-eob-yong-pyojunjeanseo-2602-yogeum-insang-ban-yeong.png',
    pdfName: '아이파킹 EV 무인 주차관제 연동 충전 솔루션 제안서'
  },
  'LG유플러스볼트업': {
    pdfUrl: 'https://i.postimg.cc/s2YKpTty/LGyupeulleoseubolteueob-jeanseo-260701.png',
    pdfName: 'LG유플러스 볼트업(VoltUp) 프리미엄 충전망 제안서'
  },
  'LG유플러스 볼트업': {
    pdfUrl: 'https://i.postimg.cc/s2YKpTty/LGyupeulleoseubolteueob-jeanseo-260701.png',
    pdfName: 'LG유플러스 볼트업(VoltUp) 프리미엄 충전망 제안서'
  }
};

/**
 * Helper to get set of deleted detail keys from persistent storage
 */
function getDeletedDetailKeys(): Set<string> {
  const set = new Set<string>();
  try {
    const raw = localStorage.getItem('sy_cms_deleted_product_details');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach(k => set.add(k));
      }
    }
  } catch (e) {}
  return set;
}

function getDeletedBrandKeys(): Set<string> {
  const set = new Set<string>();
  try {
    const raw = localStorage.getItem('sy_cms_deleted_brand_catalogs');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach(k => set.add(k));
      }
    }
  } catch (e) {}
  return set;
}

/**
 * Loads and merges all product detail records across Firestore, localStorage, IndexedDB, and Defaults,
 * STRICTLY respecting user deletions so deleted items are NEVER resurrected.
 */
export async function loadUnifiedProductDetails(): Promise<Record<string, ProductDetailItem>> {
  const deletedKeys = getDeletedDetailKeys();
  const merged: Record<string, ProductDetailItem> = {};

  // 1. Seed defaults ONLY for keys that have NOT been deleted by the user
  Object.keys(DEFAULT_PRODUCT_DETAILS).forEach((k) => {
    if (!deletedKeys.has(k)) {
      merged[k] = { ...DEFAULT_PRODUCT_DETAILS[k] };
    }
  });

  // 2. Read from Firestore 'productDetails' collection (Direct cloud source of truth)
  try {
    const snap = await getDocs(collection(db, 'productDetails'));
    snap.forEach(d => {
      const key = d.id;
      const data = d.data() as ProductDetailItem;
      if (deletedKeys.has(key) || data?.deleted) {
        merged[key] = {
          ...merged[key],
          deleted: true,
          pdfUrls: [],
          pdfNames: [],
          pdfUrl: '',
          pdfName: ''
        };
      } else if (data && !data.deleted) {
        merged[key] = {
          ...merged[key],
          ...data,
          deleted: false
        };
      }
    });
  } catch (firestoreErr) {
    console.warn('Could not read productDetails from Firestore:', firestoreErr);
  }

  // 3. Read from localStorage (synced with Firestore)
  try {
    const localStr = localStorage.getItem('sy_cms_product_details');
    if (localStr) {
      const parsed = JSON.parse(localStr);
      Object.keys(parsed).forEach((k) => {
        if (parsed[k]?.deleted || deletedKeys.has(k)) {
          merged[k] = {
            ...merged[k],
            deleted: true,
            pdfUrls: [],
            pdfNames: [],
            pdfUrl: '',
            pdfName: ''
          };
        } else {
          merged[k] = { ...merged[k], ...parsed[k] };
        }
      });
    }
  } catch (err) {
    console.warn('Error parsing sy_cms_product_details from localStorage:', err);
  }

  // 4. Read from local IndexedDB for large cached assets
  try {
    const idbData = await loadAllBrandPdfs();
    Object.keys(idbData).forEach((k) => {
      if (k.startsWith('product-')) {
        if (deletedKeys.has(k) || merged[k]?.deleted) {
          merged[k] = {
            deleted: true,
            pdfUrls: [],
            pdfNames: [],
            pdfUrl: '',
            pdfName: ''
          };
          return;
        }
        const item = idbData[k];
        const existing = merged[k] || {};
        merged[k] = {
          ...existing,
          pdfUrl: item.pdfUrl || existing.pdfUrl,
          pdfName: item.pdfName || existing.pdfName,
          pdfUrls: item.pdfUrls && item.pdfUrls.length > 0 ? item.pdfUrls : existing.pdfUrls,
          pdfNames: item.pdfNames && item.pdfNames.length > 0 ? item.pdfNames : existing.pdfNames
        };
      }
    });
  } catch (err) {
    console.warn('Error reading product details from IndexedDB:', err);
  }

  return merged;
}

/**
 * Saves a product detail item to all storage layers (Firestore, localStorage, IndexedDB) and clears any prior deletion flag.
 */
export async function saveUnifiedProductDetail(productId: string, detailData: ProductDetailItem): Promise<void> {
  const key = productId.startsWith('product-') ? productId : `product-${productId}`;
  const rawId = productId.replace(/^product-/, '');

  // 1. Upload any base64 Data URLs to Firebase Storage
  let processedData = { ...detailData };
  if (processedData.pdfUrl && processedData.pdfUrl.startsWith('data:')) {
    try {
      processedData.pdfUrl = await uploadFileToFirebaseStorage(processedData.pdfUrl, 'product-details', `${key}_main_doc`);
    } catch (err) {
      console.warn('Failed to upload pdfUrl to Firebase Storage:', err);
    }
  }

  if (processedData.pdfUrls && processedData.pdfUrls.length > 0) {
    try {
      const uploadedUrls = await Promise.all(
        processedData.pdfUrls.map(async (url, idx) => {
          if (url && url.startsWith('data:')) {
            const fileName = processedData.pdfNames?.[idx] || `${key}_doc_${idx}`;
            return await uploadFileToFirebaseStorage(url, 'product-details', fileName);
          }
          return url;
        })
      );
      processedData.pdfUrls = uploadedUrls;
      if (!processedData.pdfUrl && uploadedUrls.length > 0) {
        processedData.pdfUrl = uploadedUrls[0];
      }
    } catch (err) {
      console.warn('Failed to upload pdfUrls to Firebase Storage:', err);
    }
  }

  // 2. Clear deletion flag
  try {
    const deletedKeys = getDeletedDetailKeys();
    deletedKeys.delete(key);
    deletedKeys.delete(rawId);
    deletedKeys.delete(productId);
    localStorage.setItem('sy_cms_deleted_product_details', JSON.stringify(Array.from(deletedKeys)));
  } catch (e) {}

  // 3. Save to IndexedDB (for quick offline cache)
  try {
    await saveBrandPdf(key, {
      pdfUrl: processedData.pdfUrl,
      pdfName: processedData.pdfName,
      pdfUrls: processedData.pdfUrls,
      pdfNames: processedData.pdfNames
    });
  } catch (err) {
    console.error('IndexedDB save failed:', err);
  }

  const updatedPayload: ProductDetailItem = {
    ...processedData,
    deleted: false,
    updatedAt: new Date().toISOString()
  };

  // 4. Save to Firestore collection 'productDetails'
  try {
    const docRef = doc(db, 'productDetails', key);
    await setDoc(docRef, updatedPayload, { merge: true });
    if (rawId !== key) {
      await setDoc(doc(db, 'productDetails', rawId), updatedPayload, { merge: true });
    }
  } catch (firestoreErr) {
    console.warn('Firestore productDetails write failed:', firestoreErr);
  }

  // 5. Save to localStorage (triggers global CMS syncing)
  try {
    let currentMap: Record<string, ProductDetailItem> = {};
    const localStr = localStorage.getItem('sy_cms_product_details');
    if (localStr) {
      try {
        currentMap = JSON.parse(localStr);
      } catch (e) {}
    }

    currentMap[key] = {
      ...currentMap[key],
      ...updatedPayload
    };
    currentMap[rawId] = {
      ...currentMap[rawId],
      ...updatedPayload
    };

    localStorage.setItem('sy_cms_product_details', JSON.stringify(currentMap));
  } catch (err) {
    console.error('Failed to save product detail to localStorage:', err);
  }

  // 6. Dispatch global refresh events
  window.dispatchEvent(new Event('sy_cms_product_details_update'));
  window.dispatchEvent(new Event('sy_cms_data_sync_completed'));
}

/**
 * Permanently deletes a product detail item from all layers (Firestore, IndexedDB, localStorage)
 * and records it in sy_cms_deleted_product_details to ensure built-in defaults NEVER return.
 */
export async function deleteUnifiedProductDetail(productId: string): Promise<void> {
  const key = productId.startsWith('product-') ? productId : `product-${productId}`;
  const rawId = productId.replace(/^product-/, '');

  // 1. Record in persistent deleted list
  try {
    const deletedKeys = getDeletedDetailKeys();
    deletedKeys.add(key);
    deletedKeys.add(rawId);
    deletedKeys.add(productId);
    localStorage.setItem('sy_cms_deleted_product_details', JSON.stringify(Array.from(deletedKeys)));
  } catch (e) {}

  const deletePayload: ProductDetailItem = {
    deleted: true,
    pdfUrls: [],
    pdfNames: [],
    pdfUrl: '',
    pdfName: '',
    specs: {},
    features: [],
    updatedAt: new Date().toISOString()
  };

  // 2. Persist deleted marker to Firestore collection 'productDetails'
  try {
    await setDoc(doc(db, 'productDetails', key), deletePayload, { merge: true });
    if (rawId !== key) {
      await setDoc(doc(db, 'productDetails', rawId), deletePayload, { merge: true });
    }
  } catch (e) {
    console.warn('Firestore productDetails delete marker failed:', e);
  }

  // 3. Delete from IndexedDB
  try {
    await deleteBrandPdf(key);
    if (rawId !== key) {
      await deleteBrandPdf(rawId);
    }
  } catch (e) {}

  // 4. Mark as deleted/empty in localStorage sy_cms_product_details
  try {
    const localStr = localStorage.getItem('sy_cms_product_details');
    let parsed: Record<string, ProductDetailItem> = {};
    if (localStr) {
      try {
        parsed = JSON.parse(localStr);
      } catch (e) {}
    }
    parsed[key] = deletePayload;
    parsed[rawId] = deletePayload;
    localStorage.setItem('sy_cms_product_details', JSON.stringify(parsed));
  } catch (e) {}

  // 5. Dispatch update events to all active views
  window.dispatchEvent(new Event('sy_cms_product_details_update'));
  window.dispatchEvent(new Event('sy_cms_data_sync_completed'));
}

/**
 * Loads and merges all brand catalogs across Firestore, localStorage, IndexedDB, and Defaults,
 * strictly honoring user deletions and prioritizing official direct catalog links.
 */
export async function loadUnifiedBrandCatalogs(): Promise<Record<string, { pdfUrl?: string; pdfName?: string; deleted?: boolean }>> {
  const deletedKeys = getDeletedBrandKeys();
  const merged: Record<string, { pdfUrl?: string; pdfName?: string; deleted?: boolean }> = {};

  // 1. Defaults (only non-deleted)
  Object.keys(DEFAULT_BRAND_CATALOGS).forEach(k => {
    if (!deletedKeys.has(k)) {
      const def = DEFAULT_BRAND_CATALOGS[k];
      merged[k] = {
        ...def,
        pdfUrl: resolvePostImgUrl(def.pdfUrl)
      };
    }
  });

  // 2. Read from Firestore 'brandCatalogs' collection (Single Source of Truth for guest & all devices)
  try {
    const snap = await getDocs(collection(db, 'brandCatalogs'));
    snap.forEach(d => {
      const bKey = d.id;
      if (deletedKeys.has(bKey)) return;
      const data = d.data() as { pdfUrl?: string; pdfName?: string; deleted?: boolean };
      if (data && !data.deleted && (data.pdfUrl || data.pdfName)) {
        const rawUrl = resolvePostImgUrl(data.pdfUrl);
        // Do not override official catalog with old local static placeholders
        const isOldPlaceholder = rawUrl === '/스필.png' || rawUrl === '/쿨차지.png' || rawUrl === '/일렉트리.png' || rawUrl === '/차지고.png' || rawUrl === '/50kw-쿨차지.png';
        if (!isOldPlaceholder || !merged[bKey]?.pdfUrl) {
          merged[bKey] = {
            ...merged[bKey],
            pdfUrl: rawUrl || merged[bKey]?.pdfUrl,
            pdfName: data.pdfName || merged[bKey]?.pdfName
          };
        }
      }
    });
  } catch (firestoreErr) {
    console.warn('Could not read brandCatalogs from Firestore, falling back to local storage:', firestoreErr);
  }

  // 3. Read from localStorage
  try {
    const localStr = localStorage.getItem('sy_cms_brand_catalogs');
    if (localStr) {
      const parsed = JSON.parse(localStr);
      Object.keys(parsed).forEach((k) => {
        if (parsed[k]?.deleted || deletedKeys.has(k)) {
          delete merged[k];
        } else {
          const rawUrl = resolvePostImgUrl(parsed[k]?.pdfUrl);
          const isOldPlaceholder = rawUrl === '/스필.png' || rawUrl === '/쿨차지.png' || rawUrl === '/일렉트리.png' || rawUrl === '/차지고.png' || rawUrl === '/50kw-쿨차지.png';
          if (!isOldPlaceholder || !merged[k]?.pdfUrl) {
            merged[k] = {
              ...merged[k],
              ...parsed[k],
              pdfUrl: rawUrl || merged[k]?.pdfUrl
            };
          }
        }
      });
    }
  } catch (e) {}

  // 4. Read from IndexedDB
  try {
    const idbData = await loadAllBrandPdfs();
    Object.keys(idbData).forEach((k) => {
      if (!k.startsWith('product-')) {
        if (deletedKeys.has(k)) {
          delete merged[k];
          return;
        }
        const item = idbData[k];
        const rawUrl = resolvePostImgUrl(item.pdfUrl);
        const isOldPlaceholder = rawUrl === '/스필.png' || rawUrl === '/쿨차지.png' || rawUrl === '/일렉트리.png' || rawUrl === '/차지고.png' || rawUrl === '/50kw-쿨차지.png';
        if (!isOldPlaceholder || !merged[k]?.pdfUrl) {
          merged[k] = {
            ...merged[k],
            pdfUrl: rawUrl || merged[k]?.pdfUrl,
            pdfName: item.pdfName || merged[k]?.pdfName
          };
        }
      }
    });
  } catch (e) {}

  // 5. Ensure all defaults exist if not explicitly deleted
  Object.keys(DEFAULT_BRAND_CATALOGS).forEach(k => {
    if (!deletedKeys.has(k) && (!merged[k] || !merged[k].pdfUrl)) {
      const def = DEFAULT_BRAND_CATALOGS[k];
      merged[k] = {
        ...def,
        pdfUrl: resolvePostImgUrl(def.pdfUrl)
      };
    }
  });

  deletedKeys.forEach(k => {
    delete merged[k];
  });

  return merged;
}

/**
 * Resolves brand catalog data with 1st priority given to official direct PDF/image links.
 */
export function resolveBrandCatalog(brandKey: string, brandCatalogsMap?: Record<string, { pdfUrl?: string; pdfName?: string; deleted?: boolean }>): { pdfUrl?: string; pdfName?: string } {
  if (!brandKey) return {};
  const normalizedKey = brandKey.trim();
  const deletedKeys = getDeletedBrandKeys();
  if (deletedKeys.has(normalizedKey)) {
    return {};
  }

  const lookupKeys = [
    normalizedKey,
    normalizedKey.toLowerCase(),
    normalizedKey.replace(/\s+/g, ''),
    normalizedKey.toLowerCase().replace(/\s+/g, '')
  ];

  // 1. Direct from loaded map
  if (brandCatalogsMap) {
    for (const key of lookupKeys) {
      const item = brandCatalogsMap[key];
      if (item && !item.deleted && item.pdfUrl) {
        return {
          pdfUrl: resolvePostImgUrl(item.pdfUrl),
          pdfName: item.pdfName || DEFAULT_BRAND_CATALOGS[key]?.pdfName || DEFAULT_BRAND_CATALOGS[normalizedKey]?.pdfName
        };
      }
    }
    // Check partial key matches in map
    for (const [mapKey, item] of Object.entries(brandCatalogsMap)) {
      if (item && !item.deleted && item.pdfUrl) {
        const cleanedMapKey = mapKey.toLowerCase().replace(/\s+/g, '');
        const cleanedTargetKey = normalizedKey.toLowerCase().replace(/\s+/g, '');
        if (cleanedMapKey.includes(cleanedTargetKey) || cleanedTargetKey.includes(cleanedMapKey)) {
          return {
            pdfUrl: resolvePostImgUrl(item.pdfUrl),
            pdfName: item.pdfName || DEFAULT_BRAND_CATALOGS[mapKey]?.pdfName || DEFAULT_BRAND_CATALOGS[normalizedKey]?.pdfName
          };
        }
      }
    }
  }

  // 2. Direct from DEFAULT_BRAND_CATALOGS
  for (const key of lookupKeys) {
    const def = DEFAULT_BRAND_CATALOGS[key];
    if (def && !def.deleted && def.pdfUrl) {
      return {
        pdfUrl: resolvePostImgUrl(def.pdfUrl),
        pdfName: def.pdfName
      };
    }
  }

  // 3. Partial match in DEFAULT_BRAND_CATALOGS
  const cleanedTarget = normalizedKey.toLowerCase().replace(/\s+/g, '');
  for (const [defKey, defVal] of Object.entries(DEFAULT_BRAND_CATALOGS)) {
    if (defVal && !defVal.deleted && defVal.pdfUrl) {
      const cleanedDefKey = defKey.toLowerCase().replace(/\s+/g, '');
      if (cleanedDefKey.includes(cleanedTarget) || cleanedTarget.includes(cleanedDefKey)) {
        return {
          pdfUrl: resolvePostImgUrl(defVal.pdfUrl),
          pdfName: defVal.pdfName
        };
      }
    }
  }

  return {};
}

/**
 * Saves a brand catalog item to Firestore, IndexedDB, and localStorage, and clears any deletion flag.
 */
export async function saveUnifiedBrandCatalog(brandKey: string, pdfUrl: string, pdfName: string): Promise<void> {
  // 1. Upload base64 catalog to Firebase Storage if needed
  let finalPdfUrl = pdfUrl;
  if (finalPdfUrl && finalPdfUrl.startsWith('data:')) {
    try {
      finalPdfUrl = await uploadFileToFirebaseStorage(finalPdfUrl, 'brand-catalogs', `${brandKey}_catalog`);
    } catch (err) {
      console.warn('Failed to upload brand catalog to Firebase Storage:', err);
    }
  }

  try {
    const deletedKeys = getDeletedBrandKeys();
    if (deletedKeys.has(brandKey)) {
      deletedKeys.delete(brandKey);
      localStorage.setItem('sy_cms_deleted_brand_catalogs', JSON.stringify(Array.from(deletedKeys)));
    }
  } catch (e) {}

  // 2. Save to Firestore collection 'brandCatalogs' for instant multi-device / guest availability
  try {
    const brandDocRef = doc(db, 'brandCatalogs', brandKey);
    await setDoc(brandDocRef, {
      brandKey,
      pdfUrl: finalPdfUrl,
      pdfName,
      deleted: false,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save brand catalog to Firestore:', err);
  }

  // 3. Save to IndexedDB (local offline cache)
  try {
    await saveBrandPdf(brandKey, { pdfUrl: finalPdfUrl, pdfName });
  } catch (e) {}

  // 4. Save to localStorage
  try {
    let currentMap: Record<string, any> = {};
    const localStr = localStorage.getItem('sy_cms_brand_catalogs');
    if (localStr) {
      try {
        currentMap = JSON.parse(localStr);
      } catch (e) {}
    }
    currentMap[brandKey] = { pdfUrl: finalPdfUrl, pdfName, deleted: false, updatedAt: new Date().toISOString() };
    localStorage.setItem('sy_cms_brand_catalogs', JSON.stringify(currentMap));
  } catch (e) {}

  window.dispatchEvent(new Event('sy_cms_brand_catalogs_update'));
  window.dispatchEvent(new Event('sy_cms_product_details_update'));
  window.dispatchEvent(new Event('sy_cms_data_sync_completed'));
}

/**
 * Permanently deletes a brand catalog from Firestore, IndexedDB, and localStorage.
 */
export async function deleteUnifiedBrandCatalog(brandKey: string): Promise<void> {
  try {
    const deletedKeys = getDeletedBrandKeys();
    deletedKeys.add(brandKey);
    localStorage.setItem('sy_cms_deleted_brand_catalogs', JSON.stringify(Array.from(deletedKeys)));
  } catch (e) {}

  // 1. Delete from Firestore collection 'brandCatalogs'
  try {
    await deleteDoc(doc(db, 'brandCatalogs', brandKey));
  } catch (e) {}

  // 2. Delete from IndexedDB
  try {
    await deleteBrandPdf(brandKey);
  } catch (e) {}

  // 3. Mark as deleted in localStorage
  try {
    let currentMap: Record<string, any> = {};
    const localStr = localStorage.getItem('sy_cms_brand_catalogs');
    if (localStr) {
      try {
        currentMap = JSON.parse(localStr);
      } catch (e) {}
    }
    currentMap[brandKey] = { deleted: true, pdfUrl: '', pdfName: '', updatedAt: new Date().toISOString() };
    localStorage.setItem('sy_cms_brand_catalogs', JSON.stringify(currentMap));
  } catch (e) {}

  window.dispatchEvent(new Event('sy_cms_brand_catalogs_update'));
  window.dispatchEvent(new Event('sy_cms_product_details_update'));
  window.dispatchEvent(new Event('sy_cms_data_sync_completed'));
}


function isOldOrPlaceholderUrl(url?: string | null): boolean {
  if (!url) return true;
  const u = url.trim();
  return u === '/스필.png' || u === '/쿨차지.png' || u === '/일렉트리.png' || u === '/차지고.png' || u === '/50kw-쿨차지.png' || u.includes('unsplash.com') || u.startsWith('data:image/svg');
}

function sanitizeItemUrls(item: ProductDetailItem): ProductDetailItem {
  if (!item) return item;
  const rawUrls = item.pdfUrls && item.pdfUrls.length > 0 
    ? item.pdfUrls 
    : (item.pdfUrl ? [item.pdfUrl] : []);
    
  const filteredUrls = rawUrls
    .filter(u => u && !u.includes('unsplash.com'))
    .map(u => resolvePostImgUrl(u));

  const filteredUrl = item.pdfUrl && !item.pdfUrl.includes('unsplash.com') 
    ? resolvePostImgUrl(item.pdfUrl) 
    : (filteredUrls[0] || undefined);

  return {
    ...item,
    pdfUrl: filteredUrl,
    pdfUrls: filteredUrls.length > 0 ? filteredUrls : (filteredUrl ? [filteredUrl] : undefined)
  };
}

/**
 * Intelligent resolver for any product detail:
 * Checks exact key and custom uploaded data FIRST.
 * Seamlessly resolves defaults and static assets for guest/mobile/incognito visitors.
 * STRICTLY respects user deletion states.
 */
export function resolveDetailData(
  product: { id?: string; name?: string; power?: string; type?: string; image?: string; specs?: Record<string, string>; features?: string[] },
  detailsMap: Record<string, ProductDetailItem> = {}
): ProductDetailItem {
  if (!product) return {};

  const id = product.id || '';
  const name = product.name || '';
  const directKey = id.startsWith('product-') ? id : `product-${id}`;
  const rawId = id.replace(/^product-/, '');
  const nameKey = name ? `product-${name.trim()}` : '';

  const deletedKeys = getDeletedDetailKeys();

  // If explicitly deleted by user (in local deletedKeys or marked deleted in detailsMap)
  const isDeleted = (
    deletedKeys.has(directKey) ||
    deletedKeys.has(rawId) ||
    deletedKeys.has(id) ||
    (nameKey && deletedKeys.has(nameKey)) ||
    detailsMap[directKey]?.deleted === true ||
    detailsMap[rawId]?.deleted === true ||
    detailsMap[id]?.deleted === true ||
    (nameKey && detailsMap[nameKey]?.deleted === true)
  );

  if (isDeleted) {
    return {
      deleted: true,
      pdfUrls: [],
      pdfNames: [],
      pdfUrl: '',
      pdfName: '',
      specs: {},
      features: []
    };
  }

  // Check if this product corresponds to any canonical commercial charger
  const isCommercial7kw = id === 'park-7kw-plc-biz' || (name.includes('스마트제어') && (name.includes('7kW') || name.includes('7kw') || name.includes('완속')));
  const isCommercial11kw = id === 'park-11kw-stormshield' || ((name.includes('11kW') || name.includes('11kw')) && (name.includes('쿨차지') || name.includes('스톰쉴드') || name.includes('공용')));
  const isCommercial35kw = id === 'park-35kw-stormshield' || ((name.includes('35kW') || name.includes('35kw')) && (name.includes('쿨차지') || name.includes('스톰쉴드') || name.includes('공용') || name.includes('중급속')));
  const isCommercial50kw = id === 'park-50kw-1ch-coolcharge' || id === 'sy-dc50' || ((name.includes('50kW') || name.includes('50kw')) && (name.includes('쿨차지') || name.includes('급속') || name.includes('1CH') || name.includes('1ch')));

  let commercialFallback: ProductDetailItem | null = null;
  if (isCommercial7kw) commercialFallback = DEFAULT_COMMERCIAL_DETAILS['park-7kw-plc-biz'];
  else if (isCommercial11kw) commercialFallback = DEFAULT_COMMERCIAL_DETAILS['park-11kw-stormshield'];
  else if (isCommercial35kw) commercialFallback = DEFAULT_COMMERCIAL_DETAILS['park-35kw-stormshield'];
  else if (isCommercial50kw) commercialFallback = DEFAULT_COMMERCIAL_DETAILS['park-50kw-1ch-coolcharge'];

  // Check if this product corresponds to canonical Home / Residential chargers
  let homeFallback: ProductDetailItem | null = null;
  const isSpil = name.includes('스필') || id.includes('spil') || id.startsWith('sy-ac') || id.startsWith('product-sy-ac');
  const isElectree = name.includes('일렉트리') || id.includes('electree');
  const isCoolcharge = (name.includes('쿨차지') || id.includes('coolcharge')) && !isCommercial11kw && !isCommercial35kw && !isCommercial50kw;
  const isChargego = name.includes('차지고') || id.includes('chargego');

  if (isSpil) {
    if (name.includes('5kW') || name.includes('5kw') || id.includes('5kw') || id === 'sy-ac05' || id === 'product-sy-ac05') {
      homeFallback = DEFAULT_HOME_DETAILS['sy-ac05'];
    } else if (name.includes('11kW') || name.includes('11kw') || id.includes('11kw') || id === 'sy-ac11-bi' || id === 'product-sy-ac11-bi') {
      homeFallback = DEFAULT_HOME_DETAILS['sy-ac11-bi'];
    } else {
      homeFallback = DEFAULT_HOME_DETAILS['sy-ac07'];
    }
  } else if (isElectree) {
    homeFallback = DEFAULT_HOME_DETAILS['res-7kw-electree'];
  } else if (isCoolcharge) {
    homeFallback = DEFAULT_HOME_DETAILS['res-7kw-coolcharge'];
  } else if (isChargego) {
    homeFallback = DEFAULT_HOME_DETAILS['res-7kw-chargego'];
  }

  // 1. Direct ID match in loaded detailsMap (if valid and not old placeholder)
  if (detailsMap[directKey] && !detailsMap[directKey].deleted) {
    const item = sanitizeItemUrls(detailsMap[directKey]);
    const hasValidFiles = (item.pdfUrls && item.pdfUrls.length > 0 && !item.pdfUrls.some(u => isOldOrPlaceholderUrl(u))) || (!!item.pdfUrl && !isOldOrPlaceholderUrl(item.pdfUrl));
    if (hasValidFiles) {
      return item;
    }
  }

  if (detailsMap[rawId] && !detailsMap[rawId].deleted) {
    const item = sanitizeItemUrls(detailsMap[rawId]);
    const hasValidFiles = (item.pdfUrls && item.pdfUrls.length > 0 && !item.pdfUrls.some(u => isOldOrPlaceholderUrl(u))) || (!!item.pdfUrl && !isOldOrPlaceholderUrl(item.pdfUrl));
    if (hasValidFiles) {
      return item;
    }
  }

  // 2. Direct Name match in detailsMap
  if (nameKey && detailsMap[nameKey] && !detailsMap[nameKey].deleted) {
    const item = sanitizeItemUrls(detailsMap[nameKey]);
    const hasValidFiles = (item.pdfUrls && item.pdfUrls.length > 0 && !item.pdfUrls.some(u => isOldOrPlaceholderUrl(u))) || (!!item.pdfUrl && !isOldOrPlaceholderUrl(item.pdfUrl));
    if (hasValidFiles) {
      return item;
    }
  }

  // 3. If it is one of the commercial solutions, guarantee the fixed official detail page
  if (commercialFallback) {
    return sanitizeItemUrls(commercialFallback);
  }

  // 4. If it is one of the home solutions, guarantee the fixed official detail page
  if (homeFallback) {
    return sanitizeItemUrls(homeFallback);
  }

  // 5. Fallback to DEFAULT_PRODUCT_DETAILS (Only if NOT deleted)
  if (DEFAULT_PRODUCT_DETAILS[directKey] && !DEFAULT_PRODUCT_DETAILS[directKey].deleted) {
    return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[directKey]);
  }
  if (DEFAULT_PRODUCT_DETAILS[rawId] && !DEFAULT_PRODUCT_DETAILS[rawId].deleted) {
    return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[rawId]);
  }
  if (nameKey && DEFAULT_PRODUCT_DETAILS[nameKey] && !DEFAULT_PRODUCT_DETAILS[nameKey].deleted) {
    return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[nameKey]);
  }

  // 6. If still no detail image but the product has an image, provide it as a fallback image
  if (product.image && !isDeleted) {
    return {
      pdfUrl: product.image,
      pdfUrls: [product.image],
      pdfName: `${product.name || '제품'} 상세 정보`,
      pdfNames: [`${product.name || '제품'} 상세 정보`],
      deleted: false
    };
  }

  return {};
}

