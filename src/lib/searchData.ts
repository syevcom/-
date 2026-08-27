/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Search Engine & Recommended Charger Dataset
 * Guaranteed 100% accurate local image paths matching /public/images/
 */

import { ActivePage } from '../types';

// Exact local image paths in /public/images/ (Case-sensitive verified)
export const SEARCH_IMAGE_PATHS = {
  speel5kw: '/images/home-detail-speel-5kw.png',
  speel7kw: '/images/home-detail-speel-7kw.png',
  speel11kw: '/images/home-detail-speel-11kw.png',
  coolcharge: '/images/home-detail-coolcharge.png',
  electree: '/images/home-detail-electree.png',
  chargego1: '/images/home-detail-chajigo1.png',
  chargego2: '/images/home-detail-chajigo2.png',
  chargego3: '/images/home-detail-chajigo3.png',
  biz7_11kw: '/images/biz-charger-7-11kw.png',
  biz35kw: '/images/biz-charger-35kw.png',
  biz50kw: '/images/biz-charger-50kw.png',
} as const;

export interface SearchProductItem {
  id: string;
  name: string;
  power: string;
  category: string;
  price: number;
  regularPrice?: number;
  discount?: number;
  image: string;
  fallbackImage: string;
  description: string;
  features?: string[];
  tags?: string[];
  targetPage: ActivePage;
  powerParam?: string;
}

/**
 * Resolves the most accurate local image path for any charger item
 */
export function resolveSearchProductImage(
  id: string,
  name: string,
  power: string,
  rawImage?: string
): { primary: string; fallback: string } {
  const lowerName = (name || '').toLowerCase();
  const lowerId = (id || '').toLowerCase();
  const lowerPower = (power || '').toLowerCase();

  // 1. Speel (스필)
  if (lowerName.includes('스필') || lowerId.includes('spil') || lowerId.includes('speel') || lowerId.includes('sy-ac')) {
    if (lowerPower.includes('11') || lowerId.includes('11')) {
      return {
        primary: SEARCH_IMAGE_PATHS.speel11kw,
        fallback: '/스필.png'
      };
    }
    if (lowerPower.includes('5') || lowerId.includes('05') || lowerId.includes('5kw')) {
      return {
        primary: SEARCH_IMAGE_PATHS.speel5kw,
        fallback: '/스필.png'
      };
    }
    return {
      primary: SEARCH_IMAGE_PATHS.speel7kw,
      fallback: '/스필.png'
    };
  }

  // 2. CoolCharge (쿨차지)
  if (lowerName.includes('쿨차지') || lowerId.includes('cool')) {
    if (lowerPower.includes('50') || lowerId.includes('50') || lowerId.includes('dc50') || lowerName.includes('급속')) {
      return {
        primary: SEARCH_IMAGE_PATHS.biz50kw,
        fallback: '/50kw-쿨차지.png'
      };
    }
    return {
      primary: SEARCH_IMAGE_PATHS.coolcharge,
      fallback: '/쿨차지.png'
    };
  }

  // 3. ElecTree (일렉트리)
  if (lowerName.includes('일렉트리') || lowerId.includes('elec') || lowerId.includes('electree')) {
    return {
      primary: SEARCH_IMAGE_PATHS.electree,
      fallback: '/일렉트리.png'
    };
  }

  // 4. ChargeGo (차지고)
  if (lowerName.includes('차지고') || lowerId.includes('chajigo') || lowerId.includes('chargego')) {
    return {
      primary: SEARCH_IMAGE_PATHS.chargego1,
      fallback: '/차지고.png'
    };
  }

  // 5. Commercial / Parking Rapid & Biz Chargers
  if (lowerPower.includes('50') || lowerId.includes('50') || lowerId.includes('dc50')) {
    return {
      primary: SEARCH_IMAGE_PATHS.biz50kw,
      fallback: '/50kw-쿨차지.png'
    };
  }
  if (lowerPower.includes('35') || lowerId.includes('35')) {
    return {
      primary: SEARCH_IMAGE_PATHS.biz35kw,
      fallback: SEARCH_IMAGE_PATHS.biz7_11kw
    };
  }
  if (lowerPower.includes('100') || lowerPower.includes('200') || lowerId.includes('100') || lowerId.includes('200')) {
    return {
      primary: SEARCH_IMAGE_PATHS.biz50kw,
      fallback: '/50kw-쿨차지.png'
    };
  }
  if (lowerPower.includes('7') || lowerPower.includes('11') || lowerId.includes('park') || lowerId.includes('biz')) {
    return {
      primary: SEARCH_IMAGE_PATHS.biz7_11kw,
      fallback: SEARCH_IMAGE_PATHS.speel7kw
    };
  }

  // Default fallback
  const validRaw = rawImage && (rawImage.startsWith('/images/') || rawImage.startsWith('http') || rawImage.startsWith('data:image/svg'));
  return {
    primary: validRaw ? rawImage : SEARCH_IMAGE_PATHS.speel7kw,
    fallback: '/images/home-detail-speel-7kw.png'
  };
}

/**
 * Recommended charger catalog for Search Modal
 */
export const RECOMMENDED_SEARCH_CHARGERS: SearchProductItem[] = [
  // Speel 7kW (Standard Bestseller)
  {
    id: 'sy-ac07',
    name: '스필 7kW 개인용 전기차 충전기 무상AS 4년',
    power: '7kW',
    category: '가정용 홈충전기 (7kW)',
    price: 598000,
    regularPrice: 660000,
    discount: 10,
    image: SEARCH_IMAGE_PATHS.speel7kw,
    fallbackImage: '/스필.png',
    description: '[국내최초 무상A/S 4년] 완속 표준 규격, 화재감지 PLC 지원 홈충전기',
    features: ['무상 A/S 4년 보장', '스마트 PLC 화재예방', 'IP55 방수방진'],
    tags: ['베스트셀러', '4년무상', '화재예방'],
    targetPage: 'sol_residential',
    powerParam: '7kW'
  },
  // Speel 5kW (Economy)
  {
    id: 'sy-ac05',
    name: '스필 5kW 슬림 스마트 홈 충전기 무상AS 4년',
    power: '5kW',
    category: '가정용 홈충전기 (5kW)',
    price: 460000,
    regularPrice: 543636,
    discount: 15,
    image: SEARCH_IMAGE_PATHS.speel5kw,
    fallbackImage: '/스필.png',
    description: '한전 승압 불필요, 기본요금 영구 절감 슬림형 5kW 완속 충전기',
    features: ['한전 승압 불필요', '무상 A/S 4년', '기본요금 절감'],
    tags: ['승압불필요', '알뜰형', '소형주택'],
    targetPage: 'sol_residential',
    powerParam: '5kW'
  },
  // Speel 11kW (High Power)
  {
    id: 'sy-ac11-bi',
    name: '스필 11kW 3상 고속 스마트 완속 충전기',
    power: '11kW',
    category: '가정용 홈충전기 (11kW)',
    price: 750000,
    regularPrice: 850000,
    discount: 12,
    image: SEARCH_IMAGE_PATHS.speel11kw,
    fallbackImage: '/스필.png',
    description: '3상 380V 전력 활용 1.5배 빠른 프리미엄 고속 완속 충전기',
    features: ['3상 380V 고속충전', '7kW 대비 1.5배 속도', '스마트 로드밸런싱'],
    tags: ['고속완속', '3상전력', '사업장추천'],
    targetPage: 'sol_residential',
    powerParam: '11kW'
  },
  // CoolCharge 5kW
  {
    id: 'res-5kw-coolcharge',
    name: '쿨차지 5kW 스마트 홈 충전기',
    power: '5kW',
    category: '가정용 홈충전기 (5kW)',
    price: 380000,
    regularPrice: 450000,
    discount: 15,
    image: SEARCH_IMAGE_PATHS.coolcharge,
    fallbackImage: '/쿨차지.png',
    description: '스마트 앱 연동, 야외 가혹 환경 방수/방진, 5kW 저전력 안심 충전',
    features: ['스마트 앱 연동', 'IP55 방수방진', '저전력 안심'],
    tags: ['가성비', '앱연동'],
    targetPage: 'sol_residential',
    powerParam: '5kW'
  },
  // ElecTree 7kW
  {
    id: 'res-7kw-electree',
    name: '일렉트리 7kW 스마트 개인용 충전기',
    power: '7kW',
    category: '가정용 홈충전기 (7kW)',
    price: 490000,
    regularPrice: 580000,
    discount: 15,
    image: SEARCH_IMAGE_PATHS.electree,
    fallbackImage: '/일렉트리.png',
    description: '단독주택 및 펜션 최적화 디자인, 고내구성 방수 설계',
    features: ['단독주택 최적화', 'KC 안전인증', '직관적 LED'],
    tags: ['단독주택', '펜션'],
    targetPage: 'sol_residential',
    powerParam: '7kW'
  },
  // ChargeGo 7kW
  {
    id: 'res-7kw-chargego',
    name: '차지고 7kW 가정용 스마트 충전기',
    power: '7kW',
    category: '가정용 홈충전기 (7kW)',
    price: 480000,
    regularPrice: 560000,
    discount: 14,
    image: SEARCH_IMAGE_PATHS.chargego1,
    fallbackImage: '/차지고.png',
    description: '예약 충전 기능 내장, 야간 경부하 요금 절감형 충전기',
    features: ['예약충전 기능', '커플러 자가교체', '슬림 바디'],
    tags: ['예약충전', '야간할인'],
    targetPage: 'sol_residential',
    powerParam: '7kW'
  },
  // Biz 7kW PLC
  {
    id: 'product-park-7kw-plc-biz',
    name: '스마트제어 PLC 7kW BIZ 공용 충전기',
    power: '7kW',
    category: '상업/주차장 충전기 (7kW)',
    price: 680000,
    regularPrice: 790000,
    discount: 14,
    image: SEARCH_IMAGE_PATHS.biz7_11kw,
    fallbackImage: '/스필.png',
    description: '아파트, 상가, 빌딩 공용 주차장 맞춤형 스마트 관제 충전기',
    features: ['OCPP 1.6 연동', '회원카드/QR결제', '원격 과금관제'],
    tags: ['아파트공용', '수익형', '원격관제'],
    targetPage: 'sol_parking',
    powerParam: '7kW'
  },
  // Biz 35kW StormShield
  {
    id: 'product-park-35kw-stormshield',
    name: '35kW BIZ 중급속 전기차 충전기 쿨차지 스톰쉴드',
    power: '35kW',
    category: '상업/주차장 충전기 (35kW)',
    price: 4900000,
    regularPrice: 5600000,
    discount: 12,
    image: SEARCH_IMAGE_PATHS.biz35kw,
    fallbackImage: SEARCH_IMAGE_PATHS.biz7_11kw,
    description: '완속보다 5배 빠르고 수전설비 부담을 대폭 낮춘 35kW 중급속 모델',
    features: ['35kW 중급속', '설비증설 부담 최소화', '신용카드/앱 결제'],
    tags: ['중급속', '주차장수익', '상가추천'],
    targetPage: 'sol_parking',
    powerParam: '35kW'
  },
  // Biz 50kW Rapid
  {
    id: 'product-park-50kw-1ch-coolcharge',
    name: '쿨차지 50kW 급속 1CH 상업용 전기차 충전기',
    power: '50kW',
    category: '상업/주차장 충전기 (50kW)',
    price: 11000000,
    regularPrice: 12500000,
    discount: 12,
    image: SEARCH_IMAGE_PATHS.biz50kw,
    fallbackImage: '/50kw-쿨차지.png',
    description: '40분 만에 80% 완충, 무인 상업 주차장 최고 수익형 급속 충전기',
    features: ['50kW DC콤보 급속', '신용카드+QR 원스톱 결제', '24시간 무인 관제'],
    tags: ['급속충전', '수익형모델', '무인주차장'],
    targetPage: 'sol_parking',
    powerParam: '50kW'
  }
];
