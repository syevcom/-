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
    pdfUrl: '/스필.png',
    pdfName: 'SY-AC05 5kW 슬림 스마트 홈 충전기 상세 사양서',
    pdfUrls: [
      '/스필.png'
    ],
    pdfNames: ['SY-AC05 5kW 기본요금 절약형 상세 스펙'],
    specs: {
      '정격 전압/전류': '단상 AC 220V / 23A (60Hz)',
      '최대 충전 용량': '5kW (한전 승압 불필요 모델)',
      '커넥터 규격': '완속 5핀 (Type 1 J1772)',
      '방수/방진 등급': 'IP55 방우형 디자인',
      '특장점': '한전 기본요금 월 1만원 영구 절감 효과'
    }
  },
  'product-res-5kw-spil': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 5kW 슬림형 상세페이지'
  },
  'product-res-5kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 5kW 슬림형 상세페이지'
  },
  'product-res-5kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 5kW 개인용 충전기 상세페이지'
  },
  'product-res-5kw-chargego': {
    pdfUrl: '/차지고.png',
    pdfUrls: ['/차지고.png'],
    pdfName: '차지고 5kW 개인용 충전기 상세페이지'
  },

  // === HOME 7kW (Standard Bestseller) ===
  'product-sy-ac07': {
    pdfUrl: '/스필.png',
    pdfName: 'SY-AC07 7kW 스마트 홈 충전기 공식 사양서 및 상세페이지',
    pdfUrls: [
      '/스필.png'
    ],
    pdfNames: [
      'SY-AC07 7kW 1부: 제품 외관 및 핵심 안전 제원'
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
    pdfUrl: '/스필.png',
    pdfName: '스필 7kW 완속 스마트홈 상세페이지',
    pdfUrls: [
      '/스필.png'
    ],
    pdfNames: ['스필 7kW 홈충전기 상세 스펙']
  },
  'product-res-7kw-chargego': {
    pdfUrl: '/차지고.png',
    pdfUrls: ['/차지고.png'],
    pdfName: '차지고 7kW 가정용 충전기 상세페이지'
  },
  'product-res-7kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 7kW 가정용 충전기 상세페이지'
  },
  'product-res-7kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 7kW 개인용 충전기 상세페이지'
  },

  // === HOME 11kW (3-Phase High-Power) ===
  'product-sy-ac11-bi': {
    pdfUrl: '/스필.png',
    pdfName: 'SY-AC11 11kW 3상 고속 스마트 완속 충전기 상세페이지',
    pdfUrls: [
      '/스필.png'
    ],
    pdfNames: ['SY-AC11 11kW 프리미엄 사양서'],
    specs: {
      '정격 전압/전류': '3상 4선식 AC 380V / 16A',
      '최대 충전 용량': '11kW (7kW 대비 1.5배 고속 완충)',
      '커넥터 규격': '완속 5핀 / 7핀 호환',
      '방수/방진 등급': 'IP55 옥외 전용'
    }
  },
  'product-res-11kw-spil': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 11kW 고속형 상세페이지'
  },
  'product-res-11kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 11kW 개인용 충전기 상세페이지'
  },
  'product-res-11kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 11kW 3상 충전기 상세페이지'
  },

  // === COMMERCIAL / PARKING BIZ ===
  'product-park-7kw-plc-biz': {
    pdfUrl: BIZ_7KW_PLC_IMAGE,
    pdfName: '스마트제어 PLC 7kW BIZ 공용 충전기 사양서 및 수익형 모델 브로셔',
    pdfUrls: [
      BIZ_7KW_PLC_IMAGE
    ],
    pdfNames: ['PLC 7kW BIZ 공용 충전기 상세 사양서']
  },
  'product-park-11kw-stormshield': {
    pdfUrl: BIZ_11KW_STORMSHIELD_IMAGE,
    pdfName: '11kW BIZ 공용 쿨차지 스톰쉴드 상세페이지',
    pdfUrls: [
      BIZ_11KW_STORMSHIELD_IMAGE
    ],
    pdfNames: ['11kW BIZ 공용 스톰쉴드 사양서']
  },
  'product-park-35kw-stormshield': {
    pdfUrl: BIZ_35KW_STORMSHIELD_IMAGE,
    pdfName: '35kW BIZ 공용 쿨차지 스톰쉴드 중급속 사양서',
    pdfUrls: [
      BIZ_35KW_STORMSHIELD_IMAGE
    ],
    pdfNames: ['35kW BIZ 중급속 스톰쉴드 브로셔']
  },

  // === COMMERCIAL / PARKING 50kW (Rapid) ===
  'product-park-50kw-1ch-coolcharge': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: '쿨차지 50kW 급속 충전기 상세 사양서 및 수익형 모델 브로셔',
    pdfUrls: [
      '/50kw-쿨차지.png'
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
    pdfUrl: '/50kw-쿨차지.png',
    pdfUrls: ['/50kw-쿨차지.png'],
    pdfName: 'SY-DC50 50kW 공용 급속 충전기 사양서'
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
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 5kW 슬림 스마트 홈 충전기 상세페이지'
  },
  'res-5kw-spil': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 5kW 슬림형 상세페이지'
  },
  'res-5kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 5kW 슬림형 상세페이지'
  },
  'res-5kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 5kW 개인용 충전기 상세페이지'
  },
  'res-5kw-chargego': {
    pdfUrl: '/차지고.png',
    pdfUrls: ['/차지고.png'],
    pdfName: '차지고 5kW 개인용 충전기 상세페이지'
  },
  'sy-ac07': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 7kW 완속 스마트홈 상세페이지'
  },
  'res-7kw-spil': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 7kW 홈충전기 상세 스펙'
  },
  'res-7kw-chargego': {
    pdfUrl: '/차지고.png',
    pdfUrls: ['/차지고.png'],
    pdfName: '차지고 7kW 가정용 충전기 상세페이지'
  },
  'res-7kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 7kW 가정용 충전기 상세페이지'
  },
  'res-7kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 7kW 개인용 충전기 상세페이지'
  },
  'sy-ac11-bi': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 11kW 고속형 상세페이지'
  },
  'res-11kw-spil': {
    pdfUrl: '/스필.png',
    pdfUrls: ['/스필.png'],
    pdfName: '스필 11kW 고속형 상세페이지'
  },
  'res-11kw-coolcharge': {
    pdfUrl: '/쿨차지.png',
    pdfUrls: ['/쿨차지.png'],
    pdfName: '쿨차지 11kW 개인용 충전기 상세페이지'
  },
  'res-11kw-electree': {
    pdfUrl: '/일렉트리.png',
    pdfUrls: ['/일렉트리.png'],
    pdfName: '일렉트리 11kW 3상 충전기 상세페이지'
  },
  'park-7kw-plc-biz': {
    pdfUrl: BIZ_7KW_PLC_IMAGE,
    pdfUrls: [BIZ_7KW_PLC_IMAGE],
    pdfName: '스마트제어 PLC 7kW BIZ 공용 충전기 상세 사양서'
  },
  'park-11kw-stormshield': {
    pdfUrl: BIZ_11KW_STORMSHIELD_IMAGE,
    pdfUrls: [BIZ_11KW_STORMSHIELD_IMAGE],
    pdfName: '11kW BIZ 공용 스톰쉴드 사양서'
  },
  'park-35kw-stormshield': {
    pdfUrl: BIZ_35KW_STORMSHIELD_IMAGE,
    pdfUrls: [BIZ_35KW_STORMSHIELD_IMAGE],
    pdfName: '35kW BIZ 중급속 스톰쉴드 브로셔'
  },
  'park-50kw-1ch-coolcharge': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfUrls: ['/50kw-쿨차지.png'],
    pdfName: '쿨차지 50kW 급속 충전기 상세 사양서'
  },
  'sy-dc50': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfUrls: ['/50kw-쿨차지.png'],
    pdfName: 'SY-DC50 50kW 공용 급속 충전기 사양서'
  }
};

// 2. Initial brand catalogs for Apartment category
export const DEFAULT_BRAND_CATALOGS: Record<string, { pdfUrl?: string; pdfName?: string; description?: string; deleted?: boolean }> = {
  'sk일렉링크': {
    pdfUrl: '/스필.png',
    pdfName: 'SK일렉링크 아파트 공식 브로셔 및 무상 설치 제안서'
  },
  '플러그링크': {
    pdfUrl: '/쿨차지.png',
    pdfName: '플러그링크 스마트 로드밸런싱 아파트 공식 카탈로그'
  },
  '이엘일렉트릭': {
    pdfUrl: '/일렉트리.png',
    pdfName: '이엘일렉트릭 화재안심 완속 충전기 공식 브로셔'
  },
  '나이스차져': {
    pdfUrl: '/차지고.png',
    pdfName: '나이스차져 금융 인프라 기반 전기차 충전 카탈로그'
  },
  '에버온': {
    pdfUrl: '/스필.png',
    pdfName: '에버온 전국 1위 완속 충전 인프라 공식 카탈로그'
  },
  'NICE인프라': {
    pdfUrl: '/차지고.png',
    pdfName: 'NICE인프라 아파트 완속/급속 솔루션 브로셔'
  },
  '아이파킹': {
    pdfUrl: '/50kw-쿨차지.png',
    pdfName: '아이파킹 EV 무인 주차관제 연동 충전 솔루션'
  },
  'LG유플러스볼트업': {
    pdfUrl: '/쿨차지.png',
    pdfName: 'LG유플러스 볼트업(VoltUp) 프리미엄 충전망 브로셔'
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
      if (deletedKeys.has(key)) return;
      const data = d.data() as ProductDetailItem;
      if (data && !data.deleted) {
        merged[key] = {
          ...merged[key],
          ...data
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
          delete merged[k];
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
        if (deletedKeys.has(k)) {
          delete merged[k];
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

  // Final cleanup: ensure no deleted keys slip through
  deletedKeys.forEach(k => {
    delete merged[k];
  });

  return merged;
}

/**
 * Saves a product detail item to all storage layers (Firestore, localStorage, IndexedDB) and clears any prior deletion flag.
 */
export async function saveUnifiedProductDetail(productId: string, detailData: ProductDetailItem): Promise<void> {
  const key = productId.startsWith('product-') ? productId : `product-${productId}`;

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
    if (deletedKeys.has(key)) {
      deletedKeys.delete(key);
      localStorage.setItem('sy_cms_deleted_product_details', JSON.stringify(Array.from(deletedKeys)));
    }
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

  // 1. Record in persistent deleted list
  try {
    const deletedKeys = getDeletedDetailKeys();
    deletedKeys.add(key);
    // Also record alias if applicable
    if (productId.startsWith('product-')) {
      deletedKeys.add(productId.replace('product-', ''));
    } else {
      deletedKeys.add(productId);
    }
    localStorage.setItem('sy_cms_deleted_product_details', JSON.stringify(Array.from(deletedKeys)));
  } catch (e) {}

  // 2. Delete from Firestore collection 'productDetails'
  try {
    await deleteDoc(doc(db, 'productDetails', key));
  } catch (e) {}

  // 3. Delete from IndexedDB
  try {
    await deleteBrandPdf(key);
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
    parsed[key] = {
      deleted: true,
      pdfUrls: [],
      pdfNames: [],
      pdfUrl: '',
      pdfName: '',
      specs: {},
      features: [],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('sy_cms_product_details', JSON.stringify(parsed));
  } catch (e) {}

  // 5. Dispatch update events to all active views
  window.dispatchEvent(new Event('sy_cms_product_details_update'));
  window.dispatchEvent(new Event('sy_cms_data_sync_completed'));
}

/**
 * Loads and merges all brand catalogs across Firestore, localStorage, IndexedDB, and Defaults,
 * strictly honoring user deletions.
 */
export async function loadUnifiedBrandCatalogs(): Promise<Record<string, { pdfUrl?: string; pdfName?: string; deleted?: boolean }>> {
  const deletedKeys = getDeletedBrandKeys();
  const merged: Record<string, { pdfUrl?: string; pdfName?: string; deleted?: boolean }> = {};

  // 1. Defaults (only non-deleted)
  Object.keys(DEFAULT_BRAND_CATALOGS).forEach(k => {
    if (!deletedKeys.has(k)) {
      merged[k] = { ...DEFAULT_BRAND_CATALOGS[k] };
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
        merged[bKey] = {
          ...merged[bKey],
          pdfUrl: data.pdfUrl || merged[bKey]?.pdfUrl,
          pdfName: data.pdfName || merged[bKey]?.pdfName
        };
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
          merged[k] = { ...merged[k], ...parsed[k] };
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
        merged[k] = {
          ...merged[k],
          pdfUrl: item.pdfUrl || merged[k]?.pdfUrl,
          pdfName: item.pdfName || merged[k]?.pdfName
        };
      }
    });
  } catch (e) {}

  deletedKeys.forEach(k => {
    delete merged[k];
  });

  return merged;
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


function sanitizeItemUrls(item: ProductDetailItem): ProductDetailItem {
  if (!item) return item;
  const filteredUrls = (item.pdfUrls || []).filter(u => u && !u.includes('unsplash.com'));
  const filteredUrl = (item.pdfUrl && !item.pdfUrl.includes('unsplash.com')) ? item.pdfUrl : undefined;
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
 */
export function resolveDetailData(
  product: { id?: string; name?: string; power?: string; type?: string; image?: string; specs?: Record<string, string>; features?: string[] },
  detailsMap: Record<string, ProductDetailItem> = {}
): ProductDetailItem {
  if (!product) return {};

  const id = product.id || '';
  const name = product.name || '';
  const deletedKeys = getDeletedDetailKeys();

  if (deletedKeys.has(`product-${id}`) || deletedKeys.has(id)) {
    return {};
  }

  const directKey = id.startsWith('product-') ? id : `product-${id}`;
  const rawId = id.replace('product-', '');

  // 1. Direct ID match in loaded detailsMap
  if (detailsMap[directKey] && !detailsMap[directKey].deleted) {
    const item = sanitizeItemUrls(detailsMap[directKey]);
    const hasFiles = (item.pdfUrls && item.pdfUrls.length > 0) || !!item.pdfUrl;
    if (hasFiles || (item.specs && Object.keys(item.specs).length > 0)) {
      return item;
    }
  }

  if (detailsMap[rawId] && !detailsMap[rawId].deleted) {
    const item = sanitizeItemUrls(detailsMap[rawId]);
    const hasFiles = (item.pdfUrls && item.pdfUrls.length > 0) || !!item.pdfUrl;
    if (hasFiles || (item.specs && Object.keys(item.specs).length > 0)) {
      return item;
    }
  }

  // 2. Direct Name match in detailsMap
  if (name) {
    const nameKey = `product-${name.trim()}`;
    if (!deletedKeys.has(nameKey) && detailsMap[nameKey] && !detailsMap[nameKey].deleted) {
      const item = sanitizeItemUrls(detailsMap[nameKey]);
      const hasFiles = (item.pdfUrls && item.pdfUrls.length > 0) || !!item.pdfUrl;
      if (hasFiles || (item.specs && Object.keys(item.specs).length > 0)) {
        return item;
      }
    }
  }

  // 3. Fallback to DEFAULT_PRODUCT_DETAILS
  if (DEFAULT_PRODUCT_DETAILS[directKey] && !DEFAULT_PRODUCT_DETAILS[directKey].deleted) {
    return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[directKey]);
  }
  if (DEFAULT_PRODUCT_DETAILS[rawId] && !DEFAULT_PRODUCT_DETAILS[rawId].deleted) {
    return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[rawId]);
  }
  if (name) {
    const nameKey = `product-${name.trim()}`;
    if (DEFAULT_PRODUCT_DETAILS[nameKey] && !DEFAULT_PRODUCT_DETAILS[nameKey].deleted) {
      return sanitizeItemUrls(DEFAULT_PRODUCT_DETAILS[nameKey]);
    }
  }

  // 4. Guaranteed static asset fallback using product.image & product.specs
  if (product.image && !product.image.includes('unsplash.com')) {
    return {
      pdfUrl: product.image,
      pdfUrls: [product.image],
      pdfNames: [`${name || '전기차 충전기'} 공식 상세 이미지`],
      specs: product.specs || {},
      features: product.features || []
    };
  }

  return {};
}

