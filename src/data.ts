/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Solution, Review, FAQ, ProductOptionGroup } from './types';

export const PUBLIC_CHARGER_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-public-connector-length',
    title: '커넥터길이',
    required: true,
    options: [
      { id: 'opt-connector-5m', name: '5M', price: 0 },
      { id: 'opt-connector-7m', name: '7M (+30,000원)', price: 30000 }
    ]
  }
];

// 1. 단말기 단품 전용 옵션 (기기 본체만 구매 시 커넥터/케이블 사양 위주)
export const DEVICE_ONLY_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-cable-length-device',
    title: '충전케이블 커넥터 길이 선택',
    required: false,
    options: [
      { id: 'cable-5m', name: '5m 커넥터 일체형 (기본)', price: 0 },
      { id: 'cable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'cable-10m', name: '10m 연장 커넥터 (+60,000원)', price: 60000 }
    ]
  },
  {
    id: 'grp-mount-type',
    title: '벽부형 거치 브라켓 및 거치 고리',
    required: false,
    options: [
      { id: 'mount-basic', name: '기본 벽부형 거치 브라켓 포함 (무상)', price: 0 },
      { id: 'mount-portable', name: '휴대용/이동형 케이블 거치 고리 추가 (+15,000원)', price: 15000 }
    ]
  }
];

// 2. 기존 충전기 교체 시공 전용 옵션
export const REPLACEMENT_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-cable-length-replace',
    title: '충전케이블 커넥터 길이 선택',
    required: false,
    options: [
      { id: 'cable-5m', name: '5m 커넥터 일체형 (기본)', price: 0 },
      { id: 'cable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'cable-10m', name: '10m 연장 커넥터 (+60,000원)', price: 60000 }
    ]
  },
  {
    id: 'grp-old-charger-removal',
    title: '기존 충전기 철거 및 회수 옵션',
    required: false,
    options: [
      { id: 'remove-free', name: '기존 충전기 철거 후 무상 회수 (추가금 없음)', price: 0 },
      { id: 'remove-keep', name: '기존 충전기 철거 후 고객 보관 (+20,000원)', price: 20000 }
    ]
  },
  {
    id: 'grp-replace-stand',
    title: '기존 거치대/하이박스 재활용 여부',
    required: false,
    options: [
      { id: 'stand-reuse', name: '기존 벽면/거치대 그대로 사용', price: 0 },
      { id: 'stand-new-hibox', name: '신규 계량기용 보호 하이박스 교체 (+50,000원)', price: 50000 },
      { id: 'stand-new-steel', name: '신규 앙카식 스틸 고급 스탠드 설치 (+150,000원)', price: 150000 }
    ]
  }
];

// 3. 신규 설치 포함 전용 옵션 (전기공사 + 한전대행 포함)
export const INSTALLATION_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-cable-length-install',
    title: '충전케이블 커넥터 길이 선택',
    required: false,
    options: [
      { id: 'cable-5m', name: '5m 커넥터 일체형 (기본)', price: 0 },
      { id: 'cable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'cable-10m', name: '10m 연장 커넥터 (+60,000원)', price: 60000 }
    ]
  },
  {
    id: 'grp-wiring-distance',
    title: '배선 시공 거리 옵션 (기본 5m 초과시)',
    required: false,
    options: [
      { id: 'wire-5m', name: '기본 배선 시공 (5m 이내 - 추가금 없음)', price: 0 },
      { id: 'wire-10m', name: '배선 10m 이내 연장 (+50,000원)', price: 50000 },
      { id: 'wire-15m', name: '배선 15m 이내 연장 (+100,000원)', price: 100000 },
      { id: 'wire-20m', name: '배선 20m 이내 연장 (+150,000원)', price: 150000 }
    ]
  },
  {
    id: 'grp-install-structures',
    title: '설치 환경별 부자재 / 거치 형태',
    required: false,
    options: [
      { id: 'struct-none', name: '벽부형 기본 설치', price: 0 },
      { id: 'struct-hibox', name: '보호 하이박스 추가 (+50,000원)', price: 50000 },
      { id: 'struct-canopy', name: '아크릴 빗물 차단 캐노피 (+80,000원)', price: 80000 },
      { id: 'struct-stand', name: '스틸 자립형 고급 스탠드 (+150,000원)', price: 150000 }
    ]
  },
  {
    id: 'grp-install-safety',
    title: '주차장 안전 용품 추가 선택',
    required: false,
    options: [
      { id: 'safety-none', name: '선택 안함', price: 0 },
      { id: 'safety-bollard', name: '스텐 앙카식 I형 보호 볼라드 (+70,000원)', price: 70000 },
      { id: 'safety-stopper', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 },
      { id: 'safety-sign', name: '충전구역 알루미늄 표지판 (+35,000원)', price: 35000 }
    ]
  }
];

export const DEFAULT_RESIDENTIAL_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-cable-length',
    title: '충전선 길이 선택',
    required: false,
    options: [
      { id: 'cable-5m', name: '5m (기본)', price: 0 },
      { id: 'cable-7m', name: '7m (+30,000원)', price: 30000 },
      { id: 'cable-10m', name: '10m (+60,000원)', price: 60000 }
    ]
  },
  {
    id: 'grp-hibox',
    title: '하이박스 선택',
    required: false,
    options: [
      { id: 'hibox-none', name: '선택 안함', price: 0 },
      { id: 'hibox-standard', name: '계량기용 보호 하이박스 (+50,000원)', price: 50000 }
    ]
  },
  {
    id: 'grp-canopy',
    title: '캐노피 선택',
    required: false,
    options: [
      { id: 'canopy-none', name: '선택 안함', price: 0 },
      { id: 'canopy-acrylic', name: '빗물/자외선 차단 아크릴 캐노피 (+80,000원)', price: 80000 }
    ]
  },
  {
    id: 'grp-stand',
    title: '스탠드 선택',
    required: false,
    options: [
      { id: 'stand-none', name: '선택 안함', price: 0 },
      { id: 'stand-steel', name: '앙카식 스틸 고급 스탠드 (+150,000원)', price: 150000 }
    ]
  },
  {
    id: 'grp-bollard',
    title: '스텐 304 앙카식 I형 볼라드 선택',
    required: false,
    options: [
      { id: 'bollard-none', name: '선택 안함', price: 0 },
      { id: 'bollard-i', name: '스텐 304 앙카식 I형 볼라드 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'grp-stopper',
    title: '스토퍼 선택',
    required: false,
    options: [
      { id: 'stopper-none', name: '선택 안함', price: 0 },
      { id: 'stopper-rubber', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
    ]
  },
  {
    id: 'grp-signboard',
    title: '충전구역 표지판 선택',
    required: false,
    options: [
      { id: 'sign-none', name: '선택 안함', price: 0 },
      { id: 'sign-aluminum', name: '충전구역 알루미늄 표지판 (+35,000원)', price: 35000 }
    ]
  }
];

export const ELECTREE_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'ele-grp-cable',
    title: '충전선 길이 선택',
    required: false,
    options: [
      { id: 'ecable-5m', name: '5m 표준 커넥터 (기본)', price: 0 },
      { id: 'ecable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'ecable-10m', name: '10m 롱타입 커넥터 (+55,000원)', price: 55000 }
    ]
  },
  {
    id: 'ele-grp-hibox',
    title: '하이박스 선택',
    required: false,
    options: [
      { id: 'ehibox-none', name: '선택 안함', price: 0 },
      { id: 'ehibox-ip56', name: '일렉트리 IP56 전용 하이박스 (+45,000원)', price: 45000 }
    ]
  },
  {
    id: 'ele-grp-canopy',
    title: '캐노피 선택',
    required: false,
    options: [
      { id: 'ecanopy-none', name: '선택 안함', price: 0 },
      { id: 'ecanopy-std', name: '일렉트리 아크릴/차양 캐노피 (+80,000원)', price: 80000 }
    ]
  },
  {
    id: 'ele-grp-stand',
    title: '스탠드 선택',
    required: false,
    options: [
      { id: 'estand-none', name: '선택 안함 (벽걸이)', price: 0 },
      { id: 'estand-base', name: '일렉트리 전용 세이프티 스탠드 (+130,000원)', price: 130000 }
    ]
  },
  {
    id: 'ele-grp-bollard',
    title: '스텐 304 앙카식 I형 볼라드 선택',
    required: false,
    options: [
      { id: 'ebollard-none', name: '선택 안함', price: 0 },
      { id: 'ebollard-i', name: '스텐 304 앙카식 I형 볼라드 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'ele-grp-stopper',
    title: '스토퍼 선택',
    required: false,
    options: [
      { id: 'estopper-none', name: '선택 안함', price: 0 },
      { id: 'estopper-pair', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
    ]
  },
  {
    id: 'ele-grp-signboard',
    title: '충전구역 표지판 선택',
    required: false,
    options: [
      { id: 'esign-none', name: '선택 안함', price: 0 },
      { id: 'esign-al', name: '알루미늄 충전구역 표지판 (+35,000원)', price: 35000 }
    ]
  }
];

export const COOLCHARGE_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'cool-grp-cable',
    title: '충전선 길이 선택',
    required: false,
    options: [
      { id: 'coolcable-5m', name: '5m 표준 커넥터 (기본)', price: 0 },
      { id: 'coolcable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'coolcable-10m', name: '10m 롱타입 커넥터 (+55,000원)', price: 55000 }
    ]
  },
  {
    id: 'cool-grp-hibox',
    title: '하이박스 선택',
    required: false,
    options: [
      { id: 'coolhibox-none', name: '선택 안함', price: 0 },
      { id: 'coolhibox-std', name: '쿨차지 방수 하이박스 (+45,000원)', price: 45000 }
    ]
  },
  {
    id: 'cool-grp-canopy',
    title: '캐노피 선택',
    required: false,
    options: [
      { id: 'coolcanopy-none', name: '선택 안함', price: 0 },
      { id: 'coolcanopy-std', name: '쿨차지 전용 아크릴 캐노피 (+80,000원)', price: 80000 }
    ]
  },
  {
    id: 'cool-grp-stand',
    title: '스탠드 선택',
    required: false,
    options: [
      { id: 'coolstand-none', name: '선택 안함 (벽걸이)', price: 0 },
      { id: 'coolstand-std', name: '쿨차지 자립형 스탠드 (+130,000원)', price: 130000 }
    ]
  },
  {
    id: 'cool-grp-bollard',
    title: '스텐 304 앙카식 I형 볼라드 선택',
    required: false,
    options: [
      { id: 'coolbollard-none', name: '선택 안함', price: 0 },
      { id: 'coolbollard-i', name: '스텐 304 앙카식 I형 볼라드 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'cool-grp-stopper',
    title: '스토퍼 선택',
    required: false,
    options: [
      { id: 'coolstopper-none', name: '선택 안함', price: 0 },
      { id: 'coolstopper-pair', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
    ]
  },
  {
    id: 'cool-grp-signboard',
    title: '충전구역 표지판 선택',
    required: false,
    options: [
      { id: 'coolsign-none', name: '선택 안함', price: 0 },
      { id: 'coolsign-al', name: '알루미늄 충전구역 표지판 (+35,000원)', price: 35000 }
    ]
  }
];

export const CHARGEGO_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'chg-grp-cable',
    title: '충전선 길이 선택',
    required: false,
    options: [
      { id: 'chgcable-5m', name: '5m 표준 커넥터 (기본)', price: 0 },
      { id: 'chgcable-7m', name: '7m 연장 커넥터 (+30,000원)', price: 30000 },
      { id: 'chgcable-10m', name: '10m 롱타입 커넥터 (+55,000원)', price: 55000 }
    ]
  },
  {
    id: 'chg-grp-hibox',
    title: '하이박스 선택',
    required: false,
    options: [
      { id: 'chghibox-none', name: '선택 안함', price: 0 },
      { id: 'chghibox-std', name: '차지고 방수 하이박스 (+45,000원)', price: 45000 }
    ]
  },
  {
    id: 'chg-grp-canopy',
    title: '캐노피 선택',
    required: false,
    options: [
      { id: 'chgcanopy-none', name: '선택 안함', price: 0 },
      { id: 'chgcanopy-std', name: '차지고 전용 아크릴 캐노피 (+80,000원)', price: 80000 }
    ]
  },
  {
    id: 'chg-grp-stand',
    title: '스탠드 선택',
    required: false,
    options: [
      { id: 'chgstand-none', name: '선택 안함 (벽걸이)', price: 0 },
      { id: 'chgstand-std', name: '차지고 자립형 스탠드 (+130,000원)', price: 130000 }
    ]
  },
  {
    id: 'chg-grp-bollard',
    title: '스텐 304 앙카식 I형 볼라드 선택',
    required: false,
    options: [
      { id: 'chgbollard-none', name: '선택 안함', price: 0 },
      { id: 'chgbollard-i', name: '스텐 304 앙카식 I형 볼라드 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'chg-grp-stopper',
    title: '스토퍼 선택',
    required: false,
    options: [
      { id: 'chgstopper-none', name: '선택 안함', price: 0 },
      { id: 'chgstopper-pair', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
    ]
  },
  {
    id: 'chg-grp-signboard',
    title: '충전구역 표지판 선택',
    required: false,
    options: [
      { id: 'chgsign-none', name: '선택 안함', price: 0 },
      { id: 'chgsign-al', name: '알루미늄 충전구역 표지판 (+35,000원)', price: 35000 }
    ]
  }
];

export const LOTTE_EVSIS_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'lotte-grp-cable',
    title: '충전선 길이 선택',
    required: false,
    options: [
      { id: 'lotte-cable-5m', name: '5m 정품 케이블 (기본)', price: 0 },
      { id: 'lotte-cable-7m', name: '7m 연장 케이블 (+35,000원)', price: 35000 },
      { id: 'lotte-cable-10m', name: '10m 최고급 롱 케이블 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'lotte-grp-hibox',
    title: '하이박스(시공포함) 선택',
    required: false,
    options: [
      { id: 'lotte-hibox-none', name: '선택 안함', price: 0 },
      { id: 'lotte-hibox-std', name: '롯데 이브이시스 정품 방수/방진 하이박스 (+50,000원)', price: 50000 }
    ]
  },
  {
    id: 'lotte-grp-canopy',
    title: '캐노피(시공포함) 선택',
    required: false,
    options: [
      { id: 'lotte-canopy-none', name: '선택 안함', price: 0 },
      { id: 'lotte-canopy-std', name: '롯데 이브이시스 차양/아크릴 캐노피 (+80,000원)', price: 80000 }
    ]
  },
  {
    id: 'lotte-grp-stand',
    title: '스탠드(시공포함) 선택',
    required: false,
    options: [
      { id: 'lotte-stand-none', name: '선택 안함 (벽부형 기본)', price: 0 },
      { id: 'lotte-stand-std', name: '롯데 자립형 프리미엄 스탠드 (+180,000원)', price: 180000 }
    ]
  },
  {
    id: 'lotte-grp-bollard',
    title: 'I형 볼라드(시공포함) 선택',
    required: false,
    options: [
      { id: 'lotte-bollard-none', name: '선택 안함', price: 0 },
      { id: 'lotte-bollard-i', name: '스텐 304 I형 안전 볼라드 (+70,000원)', price: 70000 }
    ]
  },
  {
    id: 'lotte-grp-stopper',
    title: '스토퍼(시공포함) 선택',
    required: false,
    options: [
      { id: 'lotte-stopper-none', name: '선택 안함', price: 0 },
      { id: 'lotte-stopper-rubber', name: '고무 주차 스토퍼 1쌍 (+25,000원)', price: 25000 }
    ]
  },
  {
    id: 'lotte-grp-signboard',
    title: '충전구역 표지판 선택',
    required: false,
    options: [
      { id: 'lotte-sign-none', name: '선택 안함', price: 0 },
      { id: 'lotte-sign-al', name: '알루미늄 충전구역 표지판 (+35,000원)', price: 35000 }
    ]
  },
  {
    id: 'lotte-grp-distance',
    title: '추가거리공사 선택',
    required: false,
    options: [
      { id: 'lotte-dist-none', name: '선택 안함 (기본 10m 이내)', price: 0 },
      { id: 'lotte-dist-add', name: '추가거리공사 (m당 +20,000원)', price: 20000 }
    ]
  },
  {
    id: 'lotte-grp-meter',
    title: '사설계량기 선택',
    required: false,
    options: [
      { id: 'lotte-meter-none', name: '선택 안함', price: 0 },
      { id: 'lotte-meter-std', name: '사설 계량기 설치(시공포함) (+150,000원)', price: 150000 }
    ]
  }
];

export const SPEEL_5KW_REPRESENTATIVE_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23ebebeb"/><stop offset="100%" stop-color="%23e5e5e5"/></linearGradient><linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233a3d43"/><stop offset="35%" stop-color="%23232529"/><stop offset="100%" stop-color="%23131416"/></linearGradient><linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e2024"/><stop offset="100%" stop-color="%230f1012"/></linearGradient><filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%23000000" flood-opacity="0.18"/></filter><filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="%23000000" flood-opacity="0.08"/></filter><filter id="blueGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="800" height="800" fill="url(%23bgGrad)"/><g transform="translate(140, 130)" filter="url(%23badgeShadow)"><circle cx="0" cy="0" r="76" fill="%23ffffff"/><circle cx="0" cy="0" r="66" fill="%23ecebff"/><circle cx="0" cy="0" r="54" fill="%236862f6"/><text x="0" y="11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="%23ffffff" text-anchor="middle">5kW</text></g><g transform="translate(140, 310)" filter="url(%23badgeShadow)"><circle cx="0" cy="0" r="76" fill="%23ffffff"/><circle cx="0" cy="0" r="66" fill="%23fde8ea"/><circle cx="0" cy="0" r="54" fill="%23f75466"/><text x="0" y="-6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="%23ffffff" text-anchor="middle">무상A/S</text><text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="%23ffffff" text-anchor="middle">4년</text></g><g transform="translate(35, 755)" opacity="0.45"><circle cx="0" cy="0" r="11" fill="none" stroke="%23333333" stroke-width="2.5"/><line x1="8" y1="8" x2="16" y2="16" stroke="%23333333" stroke-width="3" stroke-linecap="round"/></g><rect x="425" y="650" width="34" height="150" fill="%231c1d20" rx="4"/><rect x="495" y="650" width="34" height="150" fill="%231c1d20" rx="4"/><g filter="url(%23dropShadow)"><path d="M 330,200 Q 480,140 630,200 Q 660,215 660,250 L 660,600 Q 660,670 595,695 L 480,725 L 365,695 Q 300,670 300,600 L 300,250 Q 300,215 330,200 Z" fill="url(%23bodyGrad)" stroke="%23454850" stroke-width="1.5"/><path d="M 330,200 Q 480,140 630,200" fill="none" stroke="%23606470" stroke-width="2" opacity="0.6"/><path d="M 335,225 Q 480,175 625,225 Q 640,240 640,270 L 640,580 Q 640,645 580,675 L 480,700 L 380,675 Q 320,645 320,580 L 320,270 Q 320,240 335,225 Z" fill="url(%23faceGrad)" stroke="%2318191c" stroke-width="2"/><path d="M 340,240 Q 480,190 620,240 L 620,380 Q 480,540 480,540 Q 480,540 340,380 Z" fill="%23151619" stroke="%2326282d" stroke-width="1.5" opacity="0.8"/><g transform="translate(480, 310)"><rect x="-44" y="-28" width="88" height="56" rx="10" fill="none" stroke="%23ffffff" stroke-width="4.5"/><text x="18" y="-4" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="0.5">CARD</text><path d="M -22,14 Q -12,4 -2,14" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M -27,20 Q -12,6 3,20" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M -32,26 Q -12,8 8,26" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/></g><g transform="translate(480, 440)"><path d="M -60,-80 L 0,-10 L 60,-80 M 0,-10 L 0,90" fill="none" stroke="%230075ff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" filter="url(%23blueGlow)"/><path d="M -60,-80 L 0,-10 L 60,-80 M 0,-10 L 0,90" fill="none" stroke="%2300b0ff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M -60,-80 L 0,-10 L 60,-80 M 0,-10 L 0,90" fill="none" stroke="%23e0f4ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g><g transform="translate(605, 620)"><path d="M -28,-14 L -18,-14 L -23,-3 L -15,-3 L -26,14 L -21,3 L -29,3 Z" fill="%23ffffff"/><text x="-5" y="4" font-family="'Arial Black', sans-serif" font-size="28" font-style="italic" font-weight="900" fill="%23ffffff" text-anchor="start">e</text><text x="-20" y="20" font-family="sans-serif" font-size="10" font-weight="800" fill="%23b0b5c0" text-anchor="start" letter-spacing="2">CHARGER</text></g></g></svg>`;
export const SPEEL_11KW_REPRESENTATIVE_IMAGE = '/스필.png';

export const BIZ_7KW_PLC_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b2d35"/><stop offset="50%" stop-color="%2317181c"/><stop offset="100%" stop-color="%230b0c0e"/></linearGradient><linearGradient id="bronzeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="30%" stop-color="%23fbbf24"/><stop offset="70%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23b45309"/></linearGradient><linearGradient id="screenG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%23020617"/></linearGradient><filter id="sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG)"/><g filter="url(%23sh)" transform="translate(160, 60)"><rect x="110" y="380" width="60" height="150" rx="6" fill="%231e293b"/><path d="M 140,510 C 140,560 60,560 60,460 C 60,360 80,480 140,490" fill="none" stroke="%230f172a" stroke-width="18" stroke-linecap="round"/><path d="M 40,60 C 40,10 240,10 240,60 L 255,270 C 255,340 220,380 140,380 C 60,380 25,340 25,270 Z" fill="url(%23bronzeG)"/><path d="M 46,65 C 46,20 234,20 234,65 L 248,265 C 248,330 215,368 140,368 C 65,368 32,330 32,265 Z" fill="url(%23bodyG)"/><rect x="68" y="70" width="144" height="150" rx="14" fill="url(%23screenG)" stroke="%23334155" stroke-width="2"/><circle cx="140" cy="130" r="38" fill="none" stroke="%23334155" stroke-width="6"/><circle cx="140" cy="130" r="38" fill="none" stroke="%2338bdf8" stroke-width="6" stroke-dasharray="160 80"/><text x="140" y="138" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="900" fill="%2338bdf8" text-anchor="middle">62%</text><g transform="translate(140, 195)"><circle cx="-36" cy="0" r="8" fill="%2338bdf8" opacity="0.9"/><circle cx="-12" cy="0" r="8" fill="%2322c55e" opacity="0.9"/><circle cx="12" cy="0" r="8" fill="%23eab308" opacity="0.9"/><circle cx="36" cy="0" r="8" fill="%23ef4444" opacity="0.9"/></g><g transform="translate(140, 275)"><rect x="-35" y="-22" width="70" height="44" rx="8" fill="none" stroke="%23ffffff" stroke-width="2.5" opacity="0.7"/><text x="0" y="-3" font-family="sans-serif" font-size="9" font-weight="800" fill="%23ffffff" text-anchor="middle" opacity="0.8">CARD</text><path d="M -15,10 Q 0,2 15,10" fill="none" stroke="%23ffffff" stroke-width="2.5" opacity="0.8"/></g><circle cx="140" cy="335" r="14" fill="%230f172a" stroke="%23475569" stroke-width="2"/><path d="M 137,329 L 143,335 L 137,341" fill="none" stroke="%2338bdf8" stroke-width="2.5" stroke-linecap="round"/></g></svg>`;

export const BIZ_11KW_STORMSHIELD_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="bodyBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><filter id="sh2" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.2"/></filter></defs><rect width="600" height="600" fill="url(%23bgG2)"/><g filter="url(%23sh2)" transform="translate(180, 50)"><rect x="90" y="30" width="60" height="490" fill="%230f172a" rx="4"/><rect x="40" y="20" width="160" height="40" rx="8" fill="url(%23bodyBlue)"/><text x="120" y="45" font-family="sans-serif" font-size="13" font-weight="900" fill="%23ffffff" text-anchor="middle">전기차충전소</text><rect x="50" y="80" width="140" height="190" rx="28" fill="%2318181b" stroke="%2338bdf8" stroke-width="3"/><rect x="75" y="105" width="90" height="95" rx="10" fill="%2309090b" stroke="%2327272a" stroke-width="1.5"/><circle cx="120" cy="142" r="22" fill="none" stroke="%2338bdf8" stroke-width="4"/><text x="120" y="147" font-family="sans-serif" font-size="12" font-weight="900" fill="%2338bdf8" text-anchor="middle">11kW</text><g transform="translate(120, 235)"><rect x="-24" y="-14" width="48" height="28" rx="6" fill="none" stroke="%23ffffff" stroke-width="2" opacity="0.6"/><text x="0" y="3" font-family="sans-serif" font-size="8" font-weight="800" fill="%23ffffff" text-anchor="middle" opacity="0.8">RFID</text></g><rect x="70" y="295" width="100" height="60" rx="12" fill="%2327272a" stroke="%233f3f46" stroke-width="2"/><text x="120" y="330" font-family="sans-serif" font-size="10" font-weight="900" fill="%23a1a1aa" text-anchor="middle">KOOL CHARGE</text><path d="M 120,355 C 120,440 40,440 40,360 C 40,290 80,410 120,420" fill="none" stroke="%2309090b" stroke-width="16" stroke-linecap="round"/><rect x="30" y="500" width="180" height="25" rx="6" fill="%231e293b"/></g></svg>`;

export const BIZ_35KW_STORMSHIELD_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG3" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="metalBox" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="50%" stop-color="%23f1f5f9"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient><filter id="sh3" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG3)"/><g filter="url(%23sh3)" transform="translate(100, 80)"><rect x="0" y="0" width="400" height="440" rx="20" fill="url(%23metalBox)" stroke="%2394a3b8" stroke-width="3"/><g transform="translate(35, 45)"><path d="M 0,0 C 10,-8 20,8 30,0 C 20,8 10,-8 0,0 Z" fill="%23ea580c"/><text x="40" y="6" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="%23ea580c" letter-spacing="1">KOOL CHARGE</text></g><rect x="35" y="85" width="200" height="150" rx="10" fill="%230f172a" stroke="%23334155" stroke-width="2"/><text x="135" y="145" font-family="sans-serif" font-size="18" font-weight="900" fill="%2338bdf8" text-anchor="middle">35kW BIZ</text><text x="135" y="175" font-family="sans-serif" font-size="13" font-weight="800" fill="%2322c55e" text-anchor="middle">스톰쉴드 공용</text><g transform="translate(260, 95)"><line x1="0" y1="0" x2="100" y2="0" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="20" x2="100" y2="20" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="40" x2="100" y2="40" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="60" x2="100" y2="60" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/><line x1="0" y1="80" x2="100" y2="80" stroke="%2364748b" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(135, 275)"><rect x="-70" y="-18" width="140" height="36" rx="8" fill="%231e293b"/><text x="0" y="5" font-family="sans-serif" font-size="11" font-weight="800" fill="%2394a3b8" text-anchor="middle">CARD TOUCH / RFID</text></g><g transform="translate(135, 360)"><circle cx="0" cy="0" r="26" fill="%23ef4444" stroke="%23991b1b" stroke-width="3"/><circle cx="0" cy="0" r="16" fill="%23b91c1c"/><text x="0" y="42" font-family="sans-serif" font-size="9" font-weight="900" fill="%23475569" text-anchor="middle">EMERGENCY SWITCH</text></g><g transform="translate(310, 240)"><rect x="-35" y="0" width="70" height="150" rx="14" fill="%231e293b" stroke="%230f172a" stroke-width="3"/><rect x="-25" y="20" width="50" height="50" rx="8" fill="%230f172a"/><path d="M 0,150 C 0,220 -80,220 -80,180" fill="none" stroke="%230f172a" stroke-width="22" stroke-linecap="round"/></g></g></svg>`;

export const BIZ_50KW_COOLCHARGE_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bgG4" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23e2e8f0"/></radialGradient><linearGradient id="cabinetG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="50%" stop-color="%23f1f5f9"/><stop offset="100%" stop-color="%23e2e8f0"/></linearGradient><linearGradient id="orangeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient><filter id="sh4" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><rect width="600" height="600" fill="url(%23bgG4)"/><g filter="url(%23sh4)" transform="translate(160, 40)"><rect x="0" y="20" width="280" height="490" rx="16" fill="url(%23cabinetG)" stroke="%2394a3b8" stroke-width="3"/><rect x="20" y="50" width="240" height="30" rx="6" fill="%230f172a"/><text x="140" y="70" font-family="'Arial Black', sans-serif" font-size="13" font-weight="900" fill="%23f97316" text-anchor="middle">KOOL CHARGE</text><rect x="35" y="100" width="210" height="230" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="55" y="120" width="170" height="190" rx="8" fill="url(%23orangeG)"/><rect x="62" y="127" width="156" height="176" rx="6" fill="%23020617"/><text x="140" y="195" font-family="sans-serif" font-size="28" font-weight="900" fill="%2338bdf8" text-anchor="middle">50kW</text><text x="140" y="235" font-family="sans-serif" font-size="14" font-weight="800" fill="%23ffffff" text-anchor="middle">급속 1CH</text><g transform="translate(140, 380)"><rect x="-45" y="0" width="90" height="90" rx="12" fill="%230f172a" stroke="%23334155" stroke-width="3"/><circle cx="0" cy="45" r="22" fill="%231e293b" stroke="%23475569" stroke-width="2"/><path d="M 0,90 C 0,160 -80,160 -80,110" fill="none" stroke="%230f172a" stroke-width="20" stroke-linecap="round"/></g><rect x="-10" y="505" width="300" height="20" rx="4" fill="%230f172a"/></g></svg>`;

export const PRODUCTS: Product[] = [
  // --- 5kW Products ---
  {
    id: 'sy-ac05',
    name: '스필 5kW 개인용 전기차 충전기 무상AS 4년',
    type: '완속',
    power: '5kW',
    price: 460000,
    originalPrice: 543636,
    discountRate: 15,
    brand: '스필',
    manufacturer: '스필일렉트릭',
    origin: '대한민국',
    modelName: 'DO-EVC-SEC5-C/K',
    certNumber: 'XD070158-25000A',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    rewardPointsInfo: '구매 ₩0',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: [
      '국내최초 무상 A/S 4년 보장',
      '화재 감지 자동 전력 차단',
      '승압 비용 부담 최소화 5kW 세팅',
      '스마트 부하 분배 (Dynamic Load Balancing)',
      'IP55 방수/방진 등급'
    ],
    specs: {
      '정격 입력': 'Single Phase AC 220V ± 10%, 50/60Hz',
      '충전 커넥터': 'Type 5핀 (국내 표준)',
      '통신 방식': 'LTE / Wi-Fi / Ethernet',
      '크기': '280 x 420 x 140 mm',
      '인증': 'KC 안전인증 및 계량 형식 승인 완료'
    },
    image: '/스필.png',
    description: '[국내최초 무상A/S 4년] 가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기에 최적화된 5kW 스마트 완속 충전기입니다.',
    plcSupported: true,
    optionGroups: DEFAULT_RESIDENTIAL_OPTION_GROUPS
  },
  {
    id: 'res-5kw-coolcharge',
    name: '쿨차지 5kW 스마트 홈 충전기',
    type: '완속',
    power: '5kW',
    price: 380000,
    originalPrice: 450000,
    discountRate: 15,
    brand: '쿨차지',
    manufacturer: '쿨차지',
    origin: '대한민국',
    modelName: 'COOL-5KW-SMART',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['스마트 앱 연동 충전', '야외 가혹 환경 방수/방진', '5kW 저전력 안심 충전'],
    image: '/쿨차지.png',
    description: '스마트 앱 연동, 야외 가혹 환경 방수/방진, 5kW 저전력 안심 충전',
    optionGroups: COOLCHARGE_OPTION_GROUPS
  },
  {
    id: 'res-5kw-electree',
    name: '일렉트리 5kW 개인용 전기차 충전기',
    type: '완속',
    power: '5kW',
    price: 370000,
    originalPrice: 436364,
    discountRate: 15,
    brand: '일렉트리',
    manufacturer: '일렉트리',
    origin: '대한민국',
    modelName: 'ELE-5KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['승압 부담 적은 5kW 출력', '실내외 설치 우수한 방수/방진', '직관적 LED 충전 표시'],
    image: '/일렉트리.png',
    description: '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
    optionGroups: ELECTREE_OPTION_GROUPS
  },
  {
    id: 'res-5kw-chargego',
    name: '차지고 5kW 개인용 전기차 충전기',
    type: '완속',
    power: '5kW',
    price: 350000,
    originalPrice: 409091,
    discountRate: 14,
    brand: '차지고',
    manufacturer: '차지고',
    origin: '대한민국',
    modelName: 'CHG-5KW-RES',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['예약충전 기능', '충전본체 분해없이 설치가능', '자가교체 가능한 커플러'],
    image: '/차지고.png',
    description: '[예약충전 기능] 충전본체 분해없이 설치가능, 자가교체 가능한 커플러',
    optionGroups: CHARGEGO_OPTION_GROUPS
  },

  // --- 7kW Products ---
  {
    id: 'sy-ac07',
    name: '스필 7kW 개인용 전기차 충전기 무상AS 4년',
    type: '완속',
    power: '7kW',
    price: 598000,
    originalPrice: 660000,
    discountRate: 10,
    brand: '스필',
    manufacturer: '스필일렉트릭',
    origin: '대한민국',
    modelName: 'DO-EVC-SEC7-C/K',
    certNumber: 'XD070158-25001A',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    rewardPointsInfo: '구매 ₩0',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: [
      '국내최초 무상 A/S 4년 보장',
      '화재 감지 자동 전력 차단',
      'PLC 모뎀 탑재 (화재 예방 충전)',
      '스마트 부하 분배 (Dynamic Load Balancing)',
      'IP55 방수/방진 등급'
    ],
    specs: {
      '정격 입력': 'Single Phase AC 220V ± 10%, 50/60Hz',
      '충전 커넥터': 'Type 5핀 (국내 표준)',
      '통신 방식': 'LTE / Wi-Fi / Ethernet',
      '크기': '280 x 420 x 140 mm',
      '인증': 'KC 안전인증 및 계량 형식 승인 완료'
    },
    image: '/스필.png',
    description: '[국내최초 무상A/S 4년] 화재 감지 자동 전력 차단 가정용 완속 충전 베스트셀러',
    plcSupported: true,
    optionGroups: DEFAULT_RESIDENTIAL_OPTION_GROUPS
  },
  {
    id: 'res-7kw-chargego',
    name: '차지고 7kW 개인용 전기차 충전기',
    type: '완속',
    power: '7kW',
    price: 490000,
    originalPrice: 550000,
    discountRate: 11,
    brand: '차지고',
    manufacturer: '차지고',
    origin: '대한민국',
    modelName: 'CG-7KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['스마트 모바일 앱 연결 및 예약 충전', 'KC 안전인증 및 정밀 전력 측정', 'IP65 최고등급 방수/방진 구조'],
    image: '/차지고.png',
    description: '[예약충전 기능] 차지고 7kW 가정용 완속 스마트 충전기',
    optionGroups: CHARGEGO_OPTION_GROUPS
  },
  {
    id: 'res-7kw-electree',
    name: '일렉트리 7kW 개인용 전기차 충전기',
    type: '완속',
    power: '7kW',
    price: 480000,
    originalPrice: 480000,
    discountRate: 0,
    brand: '일렉트리',
    manufacturer: '일렉트리',
    origin: '대한민국',
    modelName: 'ELE-7KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['승압 부담 적은 7kW 출력', '실내외 설치 우수한 방수/방진', '직관적 LED 충전 표시'],
    image: '/일렉트리.png',
    description: '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
    optionGroups: ELECTREE_OPTION_GROUPS
  },
  {
    id: 'res-7kw-coolcharge',
    name: '쿨차지 7kW 개인용 전기차 충전기',
    type: '완속',
    power: '7kW',
    price: 650000,
    originalPrice: 660000,
    discountRate: 2,
    brand: '쿨차지',
    manufacturer: '쿨차지',
    origin: '대한민국',
    modelName: 'COOL-7KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용완속',
    serviceType: 'device',
    features: ['스마트 쿨링 시스템', '스마트폰 어플 연동 지원', 'IP65 높은 고방수 설계'],
    image: '/쿨차지.png',
    description: '쿨차지 7kW 개인용 전기차 충전기 단말기 전용 모델',
    optionGroups: COOLCHARGE_OPTION_GROUPS
  },

  // --- 11kW Products ---
  {
    id: 'sy-ac11-bi',
    name: '스필 11kW 개인용 전기차 충전기 무상AS 4년',
    type: '완속',
    power: '11kW',
    price: 779000,
    originalPrice: 829000,
    discountRate: 7,
    brand: '스필',
    manufacturer: '스필일렉트릭',
    origin: '대한민국',
    modelName: 'DO-EVC-SEC11-C/K',
    certNumber: 'XD070158-25002B',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    rewardPointsInfo: '구매 ₩0',
    detailCategory: '비공용중속',
    serviceType: 'all',
    replacementPrice: 929000,
    replacementRegularPrice: 1029000,
    installIncludedPrice: 1129000,
    installIncludedRegularPrice: 1229000,
    features: ['국내최초 무상A/S 4년', '3상 11kW 초고속 완속 프리미엄 특화 모델'],
    image: '/스필.png',
    description: '[국내최초 무상A/S 4년] 3상 11kW 초고속 완속 프리미엄 특화 모델',
    plcSupported: true,
    optionGroups: DEFAULT_RESIDENTIAL_OPTION_GROUPS
  },
  {
    id: 'res-11kw-coolcharge',
    name: '쿨차지 11kW 개인용 전기차 충전기',
    type: '완속',
    power: '11kW',
    price: 800000,
    originalPrice: 800000,
    discountRate: 0,
    brand: '쿨차지',
    manufacturer: '쿨차지',
    origin: '대한민국',
    modelName: 'COOL-11KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용중속',
    serviceType: 'device',
    features: ['스마트 쿨링 시스템', '스마트폰 어플 연동 지원', 'IP65 높은 고방수 설계'],
    image: '/쿨차지.png',
    description: '쿨차지 11kW 개인용 전기차 충전기 단말기 전용 모델',
    optionGroups: COOLCHARGE_OPTION_GROUPS
  },
  {
    id: 'res-11kw-electree',
    name: '일렉트리 11kW 개인용 전기차 충전기',
    type: '완속',
    power: '11kW',
    price: 750000,
    originalPrice: 850000,
    discountRate: 12,
    brand: '일렉트리',
    manufacturer: '일렉트리',
    origin: '대한민국',
    modelName: 'ELE-11KW-HOME',
    deliveryInfo: '택배(주문 시 결제) / 무료배송',
    componentsInfo: '제조사 별도 발송 / 설치비 미포함 상품',
    detailCategory: '비공용중속',
    serviceType: 'device',
    features: ['3상 11kW 완속 충전기', '실내외 설치 우수한 방수/방진', '직관적 LED 충전 표시'],
    image: '/일렉트리.png',
    description: '가정용충전기, 공장용충전기, 회사용충전기, 창고용충전기',
    optionGroups: ELECTREE_OPTION_GROUPS
  },

  // --- 공용 BIZ / 상업시설 수익형 충전기 (정확히 4개만 구성 및 동기화) ---
  {
    id: 'park-7kw-plc-biz',
    name: '스마트제어 완속 충전기 PLC 7kW BIZ 전기차 공용',
    type: '완속',
    power: '7kW',
    price: 0,
    originalPrice: 0,
    discountRate: 0,
    brand: '스마트제어',
    manufacturer: '스마트제어(주)',
    origin: '대한민국',
    modelName: 'PLC-7KW-BIZ',
    deliveryInfo: '무료배송 (전문 시공팀 방문)',
    componentsInfo: '공용 완속 스탠드 / 벽걸이 호환',
    detailCategory: '공용완속',
    serviceType: 'all',
    features: ['BEST', 'HIT', '화재감지 PLC 모뎀 탑재', '무인운영 충전사업형 모델'],
    image: BIZ_7KW_PLC_IMAGE,
    description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
    plcSupported: true,
    optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
  },
  {
    id: 'park-11kw-stormshield',
    name: '11kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드',
    type: '완속',
    power: '11kW',
    price: 0,
    originalPrice: 0,
    discountRate: 0,
    brand: '쿨차지',
    manufacturer: '쿨차지(주)',
    origin: '대한민국',
    modelName: 'COOL-11KW-STORM',
    deliveryInfo: '무료배송 (전문 시공팀 방문)',
    componentsInfo: '공용 완속 스탠드 / 벽걸이 호환',
    detailCategory: '공용완속',
    serviceType: 'all',
    features: ['BEST', 'HIT', '스톰쉴드 옥외 특화 방수방진', '스마트 QR/RFID 원격 결제'],
    image: BIZ_11KW_STORMSHIELD_IMAGE,
    description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
    plcSupported: true,
    optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
  },
  {
    id: 'park-35kw-stormshield',
    name: '35kW BIZ 공용 전기차 충전기 쿨차지 스톰쉴드',
    type: '완속',
    power: '35kW',
    price: 0,
    originalPrice: 0,
    discountRate: 0,
    brand: '쿨차지',
    manufacturer: '쿨차지(주)',
    origin: '대한민국',
    modelName: 'COOL-35KW-STORM',
    deliveryInfo: '무료배송 (전문 시공팀 방문)',
    componentsInfo: '공용 중급속 스탠드 / 벽걸이 호환',
    detailCategory: '공용완속',
    serviceType: 'all',
    features: ['MD CHOICE', '35kW 고출력 중속 충전', '비상정지 스위치 / 스톰쉴드 강화 외장'],
    image: BIZ_35KW_STORMSHIELD_IMAGE,
    description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
    plcSupported: true,
    optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
  },
  {
    id: 'park-50kw-1ch-coolcharge',
    name: '전기차 급속 충전기 50kW 1CH 쿨차지',
    type: '급속',
    power: '50kW',
    price: 0,
    originalPrice: 0,
    discountRate: 0,
    brand: '쿨차지',
    manufacturer: '쿨차지(주)',
    origin: '대한민국',
    modelName: 'COOL-50KW-1CH',
    deliveryInfo: '무료배송 (전문 시공팀 방문)',
    componentsInfo: '공용 급속 일체형 캐비닛',
    detailCategory: '급속',
    serviceType: 'all',
    features: ['MD CHOICE', '급속', '30분 80% 고속 충전', '수익성 최고 충전사업자 솔루션'],
    image: '/50kw-쿨차지.png',
    description: '펜션,카페,모텔,상가,식당,주차장,공공시설,상업시설,숙박시설,주차시설,창고시설 등 무인운영 충전사업형 모델',
    plcSupported: true,
    optionGroups: PUBLIC_CHARGER_OPTION_GROUPS
  }
];

export const SOLUTIONS: Solution[] = [
  {
    id: 'sol-commercial',
    title: '아파트 단지 공용 안심 솔루션',
    category: 'Commercial',
    subtitle: '아파트 단지, 공동주택, 입주민 공용 구역',
    description: '아파트 입주민 전용 및 공용 충전 공간의 갈등과 부족 문제를 완벽히 해결해 드립니다.\n환경부 무상 보조금 신청부터 복잡한 관리사무소 협의 및 입주자 동의 절차까지 원스톱 대행해 드립니다.',
    target: '아파트 동대표회, 아파트 입주자 대표 회의, 관리사무소 소장 및 주민 위원회',
    recommendedPower: '공용 완속(11kW 화재감지형) + 공용 급속(50kW~100kW)',
    benefits: [
      '환경부 무상 보조금 전액 매칭 지원 및 신청 서류 대행',
      '입주자 전용 RFID 충전 카드 발급 및 모바일 터치 자동 과금',
      '화재 조기 감지 및 충전 도중 과열 시 3단계 자동 충전 셧다운 연동',
      '전국 최저 수준의 아파트 특화 경부하 심야 충전 요금 자동 셋업'
    ],
    subsidyProcess: [
      '1단계: 아파트 입주민 30초 상담 신청 및 담당 전문 설계 컨설턴트 무료 배정',
      '2단계: 아파트 단지 주차 구역 무료 실사 및 도면 설계, 한전 계약 전력 진단',
      '3단계: 환경부 무상 설치 보조금 정식 서류 신청 및 행정 승인 대행',
      '4단계: 정식 면허 보유 전문 시공팀의 소음/먼지 최소화 특허 안전 보강 공사'
    ],
    image: '/스필.png',
    detailImageUrl: '/스필.png',
    blueprintImageUrl: '/스필.png',
    recommendedProducts: ['sy-ac11', 'sy-dc50', 'sy-fc200']
  },
  {
    id: 'sol-residential',
    title: '가정용 홈 안심 솔루션',
    category: 'Residential',
    subtitle: '단독주택, 빌라, 개인용 비공용 주차장',
    description: '집에 도착하는 즉시 나만의 전용 주차 공간에서 가장 저렴하고 안전하게 충전하세요.\n무단 도용 방지 안심 인증과 심야 경부하 예약 충전으로 전기차 누진세 걱정을 완벽히 해결해 드립니다.',
    target: '단독주택 소유주, 빌라 거주자, 개인 전용 차고를 보유한 전기차 오너',
    recommendedPower: '개인용/비공용 스마트홈 완속(7kW)',
    benefits: [
      '업계 최초 플러그 과열/과부하 스파크 자동 정밀 전류 차단 모듈 탑재',
      '예약 충전 시스템으로 누진 요금 구역을 피해 가장 저렴한 심야 시간 예약 충전',
      '한전 수급 불입금 납부 대행 및 한전 정식 계량기 신규 개설 원스톱 진행',
      '비바람과 자외선에 뛰어난 IP55 실외 맞춤 설치 및 전용 스탠드 제공'
    ],
    subsidyProcess: [
      '1단계: 주거 형태 및 주차 공간 사진 업로드 (또는 30초 간편 상담)',
      '2단계: 거주 환경 분석 후 아파트/빌라 협의회 전용 맞춤 카탈로그 제공',
      '3단계: 한전 불입금 납부 및 한전 계량기 수급 정식 신청',
      '4단계: 깔끔하고 안전한 케이블 트레이 및 특허 세이프티 가드 시공'
    ],
    image: '/스필.png',
    detailImageUrl: '/스필.png',
    blueprintImageUrl: '/스필.png',
    recommendedProducts: ['sy-ac07', 'res-7kw-electree']
  },
  {
    id: 'sol-parkinglot',
    title: '상업시설 수익형 솔루션',
    category: 'ParkingLot',
    subtitle: '상가 빌딩, 대형 마트, 호텔, 병원, 유료 주차장',
    description: '유휴 주차 공간을 매달 안정적인 수입이 발생하는 수익형 자산으로 전환해 드립니다.',
    target: '종합 상가, 프랜차이즈 및 대형 음식점 소유주, 호텔/리조트 대표, 오피스 빌딩 건물주 및 자산 관리자',
    recommendedPower: '급속(100kW) + 초급속(200kW) 복합 수익형 구성',
    benefits: [
      '상업 빌딩 내 입점 매장 구매 고객 대상 충전 할인 쿠폰 및 무료 주차 연동',
      '초기 기기 및 설치 비용 전액 무상 지원 매칭 보조금 프로그램 연동 지원',
      '24시간 무인 모바일 스마트 관제 센터를 통한 오류 원격 자동 감지 복구',
      '국가 표준 화재 안심 시험 통과 모델 적용 및 10억 원 영업 배상 보험 무상 가입'
    ],
    subsidyProcess: [
      '1단계: 건물 주차장 주소 입력 및 예상 연간 충전 수익 리포트 무료 발급',
      '2단계: 유휴 계약 전력 한도 조회 및 충전기 최적 배치 수량 시뮬레이션',
      '3단계: 충전 인프라 무상 지원 보조금 매칭 신청',
      '4단계: 통합 모바일 앱 등록 및 충전 전용 안내선, LED 보강 등 디자인 시공'
    ],
    image: '/50kw-쿨차지.png',
    detailImageUrl: '/50kw-쿨차지.png',
    blueprintImageUrl: '/50kw-쿨차지.png',
    recommendedProducts: ['sy-ac11', 'sy-dc50', 'sy-fc200']
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    title: '강남 대형 오피스 타워 고효율 주차장 시공',
    location: '서울 강남구 테헤란로 OOO 타워',
    category: 'ParkingLot',
    date: '2026-05-14',
    rating: 5,
    beforeImg: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600',
    afterImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600',
    author: '김태우 관리소장',
    interview: '처음엔 입주민들의 화재 우려와 한도 전력 문제 때문에 고민이 많았습니다. SY.com에서 스마트 전력 부하 관리와 PLC 탑재 화재 안심 충전기를 제안해 주셔서 건물 관리위원회도 쉽게 통과했습니다. 설치 후 매달 충전기 자체에서 발생하는 부가 수익도 짭짤해 아주 만족스럽습니다.',
    details: '급속 100kW 2대, 완속 11kW 6대 시공. 스마트 부하 매칭으로 빌딩 최대 전력을 한전 규제치 이내로 컨트롤.',
    coordinates: { x: 35, y: 48 },
    blogUrl: 'https://blog.naver.com/sy_car_com/223490181201',
    isBlogImported: true,
    blogName: '네이버 블로그'
  },
  {
    id: 'rev-2',
    title: 'RE100 추진 물류창고 화물차 급속 충전 솔루션',
    location: '경기 여주 OOO 물류센터',
    category: 'Commercial',
    date: '2026-06-02',
    rating: 5,
    beforeImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    afterImg: 'https://images.unsplash.com/photo-1620859309999-ed665c53a1ed?auto=format&fit=crop&q=80&w=600',
    author: '박정훈 인프라본부장',
    interview: '화물 트럭들이 야간에 일제히 충전해야 해서 안정성이 최우선이었습니다. SY.com의 200kW 초급속 수랭식 디스펜서 충전기를 도입한 뒤 배송 출발 지연이 0%로 줄었습니다. 지자체 보조금도 80% 지원받아 대폭적인 설비 절감을 거뒀습니다.',
    details: '초급속 200kW 3대 설치. 대형 전기 트럭 전전류 충전 안정성 테스트 100% 통과.',
    coordinates: { x: 42, y: 55 },
    blogUrl: 'https://blog.naver.com/sy_car_com/223490181201',
    isBlogImported: true,
    blogName: '네이버 블로그'
  },
  {
    id: 'rev-3',
    title: '단독주택 주차장 개인 스마트홈 충전기 설치',
    location: '제주 애월읍 OOO 펜션 및 주택',
    category: 'Residential',
    date: '2026-06-20',
    rating: 5,
    beforeImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
    afterImg: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=600',
    author: '이지은 건축주',
    interview: '단독주택이라 한전에서 전기 신설 신청을 직접 해야 하는 줄 알고 눈앞이 캄캄했는데, SY.com에서 기사님이 현장 견적 내러 오셔서 원스톱으로 서류 신청부터 시공까지 사흘 만에 다 끝내주셨어요. 북유럽풍 벽걸이형 디자인도 집 외관과 찰떡이라 펜션 손님들도 다들 예쁘다고 칭찬해요!',
    details: 'SY-Home07 7kW 월박스 설치. 한전 인입선 신설 및 야간 저렴한 예약 충전 연동 셋업 완료.',
    coordinates: { x: 25, y: 88 },
    blogUrl: 'https://blog.naver.com/sy_car_com/223490181201',
    isBlogImported: true,
    blogName: '네이버 블로그'
  },
  {
    id: 'rev-4',
    title: '종합 상가 주차 면적 유휴 공간 수익 극대화',
    location: '부산 해운대구 센텀 OOO 타운',
    category: 'ParkingLot',
    date: '2026-06-25',
    rating: 5,
    beforeImg: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600',
    afterImg: 'https://images.unsplash.com/photo-1695653422718-97d137aac987?auto=format&fit=crop&q=80&w=600',
    author: '최현우 건물관리 대표',
    interview: '공실 상가 주차 구역이라 방치되어 있었는데 충전소로 바꾸고 나니 건물을 오가는 통행량 자체가 크게 늘었습니다. 충전하러 온 차량 고객들이 상가 식음료 매장을 추가 이용하는 낙수 효과도 엄청나며, 정산도 완전히 자동화되어 관리비 인건비 부담이 전혀 없습니다.',
    details: '급속 50kW 1대, 완속 7kW 4대 설치. LED 안내 패널 및 충전 주차 도색 완비.',
    coordinates: { x: 68, y: 72 },
    blogUrl: 'https://blog.naver.com/sy_car_com/223490181201',
    isBlogImported: true,
    blogName: '네이버 블로그'
  },
  {
    id: 'rev-blog-seed',
    title: '[네이버 블로그] 분당 단독주택 7kW 전기차 충전기 무상보조금 전액지원 설치후기!',
    location: '경기 성남시 분당구',
    category: 'Residential',
    date: '2026-06-29',
    rating: 5,
    beforeImg: 'https://images.unsplash.com/photo-1521500857785-5a827418b62c?auto=format&fit=crop&q=80&w=600',
    afterImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600',
    author: '블로거 달콤한초코',
    interview: '드디어 블로그에 자랑하고 싶던 전기차 홈충전기를 에스와이코리아(SY.com)에서 국고지원금 매칭 받아서 대만족하며 완공했어요! 복잡한 한전 보조금 서류 신청부터 대행까지 전부 무상으로 처리해주셔서 저는 그냥 구경만 했네요. 상세한 내용은 제 네이버 블로그 글에서 직접 확인하세요!',
    details: '7kW 완속 스마트 월박스 시공 완료. 환경부 화재예방 PLC 탑재 적용 모델 선정.',
    coordinates: { x: 38, y: 52 },
    blogUrl: 'https://blog.naver.com/sy_car_com/223490181201',
    isBlogImported: true,
    blogName: '네이버 블로그'
  }
];

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: '충전기 설치 시 정말 정부 보조금 신청을 지원해 주나요?',
    answer: '네, 그렇습니다! SY.com은 환경부 승인 및 공식 보조금 사업 파트너로서 매년 지자체별/환경부별 남은 예산을 모니터링하여 우선적으로 보조금 혜택을 선점할 수 있도록 복잡한 구비 서류 작성과 행정 신고 절차를 무상으로 전부 대행해 드립니다. 개인 주택뿐만 아니라 기업용 대규모 단지 보조금 신청도 완벽 지원합니다.',
    category: '보조금/비용'
  },
  {
    id: 'faq-2',
    question: '최근 이슈가 되는 전기차 화재가 걱정되는데, 안전 기술이 적용되어 있나요?',
    answer: 'SY.com은 최고의 전기차 화재 안전 기술력을 탑재하고 있습니다. 자사 모든 신제품 모델에는 최고 사양의 과열 센서 및 전기 스파크(아크) 미세 차단 알고리즘이 내장되어 있습니다. 특히 SY-AC07/AC11 모델에는 환경부 공식 화재 감지용 핵심 모듈인 PLC 모뎀이 기본 탑재되어, 차량의 배터리 충전 상태(SoC)를 실시간 모니터링하여 만충 도달 전 또는 이상 고열 시 충전을 강제로 종료시키는 다중 예방 안전망을 구축하고 있습니다.',
    category: '화재안전'
  },
  {
    id: 'faq-3',
    question: '아파트나 다세대 주택의 경우 입주민 동의 절차가 필요하지 않나요?',
    answer: '맞습니다. 공동주택 주차 공간의 경우 관리사무소 협의 및 주민대표위원회 승인이 선결 과제입니다. SY.com은 이를 위해 다년간 축적한 전문 상담 자료를 보완 제공합니다. 입주민들이 가장 걱정하시는 전기료 공용화 우려를 씻어줄 RFID 개인별 결제 시스템 자료 및 정부 화재예방 특허 증빙서류를 묶은 전용 동의 설명서 패키지를 상담 직후 전달드리며, 필요시 기술 지원 상담사가 원격 및 방문 설명 협조를 드립니다.',
    category: '설치과정'
  },
  {
    id: 'faq-4',
    question: '한전 계량기 신설은 무엇이며 추가 요금이 발생하나요?',
    answer: '전기차 충전기는 기본 가정용 또는 상업용 가전제품과 달리 전력 소모량이 매우 큽니다(최소 7,000W 이상). 이에 따라 별도의 계량기를 한전에 신청하여 독립적인 전용 요금제를 매칭해야 누진세를 피하고 요금을 절감할 수 있습니다. SY.com에서는 이 한전 신청 접수 및 내선 설비 설계 일체를 자체 공인 전력기술팀이 무료로 대행하며, 국가가 부과하는 한전 불입금 외 설계 인건비는 받지 않습니다.',
    category: '전기안전'
  },
  {
    id: 'faq-5',
    question: '설치 후 사후관리(A/S) 기간과 전국 네트워크는 어떻게 되나요?',
    answer: 'SY.com은 전국 8개 광역본부 산하 24개의 전담 기술 정비 서비스망을 상시 보유하고 있습니다. 설치 후 무상 A/S 기간은 기본 2년(연장 시 최대 5년)이 보장되며, 24시간 원격 모니터링을 통해 고장 신호 감지 시 방문 기사가 출동하기 전에 1차 소프트웨어 자동 리셋 복구 처리를 진행합니다. 현장 처리가 필요한 경우 접수 당일 또는 익일 오전까지 100% 방문 수리를 원칙으로 삼고 있습니다.',
    category: '사후관리(A/S)'
  }
];

export const NOTICES = [
  {
    id: 1,
    title: '[긴급] 2026년 하반기 지자체별 전기차 충전기 무상 보조금 한도 조기 소진 안내 (마감 임박)',
    date: '2026-06-25',
    important: true
  },
  {
    id: 2,
    title: 'SY.com 업계 최초 화재감지 차세대 PLC 모뎀 완속 충전기 11kW KC 형식승인 획득',
    date: '2026-06-18',
    important: false
  },
  {
    id: 3,
    title: '[서비스] 장마철 및 폭염 대비 야외 전기차 충전기 무상 침수방지 방진캡 안전 점검 캠페인 안내',
    date: '2026-06-10',
    important: false
  },
  {
    id: 4,
    title: 'B2B 파트너 대상: 유휴 주차 면적 수익 전환 원격 관제 플랫폼 (SY-OCS v2.1) 업데이트 배포',
    date: '2026-05-30',
    important: false
  }
];
