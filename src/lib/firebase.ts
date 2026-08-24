import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export const CMS_COLLECTION = 'sy_cms_data';
export const BACKUP_COLLECTION = 'sy_cms_backups';
export const LATEST_BACKUP_DOC_ID = 'latest_snapshot';

// Excluded user session, auth credentials and private state keys (MUST NOT be synced to Firestore or shared)
export const NON_SYNCABLE_KEYS = new Set([
  'sy_logged_user',
  'sy_user',
  'sy_saved_login_id',
  'sy_saved_login_password',
  'sy_remember_auth',
  'sy_admin_password',
  'sy_registered_users',
  'sy_admin_notifications'
]);

// Helper to check if a key should be synced & backed up
export function shouldSyncKey(key: string): boolean {
  if (!key.startsWith('sy_')) return false;
  if (NON_SYNCABLE_KEYS.has(key)) return false;
  return true;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'restoring';

export interface SyncEngineStatus {
  state: SyncState;
  lastSyncedTime: string;
  lastBackupInfo: {
    formattedDate: string;
    keyCount: number;
    trigger: string;
    dataSizeKb: number;
  } | null;
  pendingCount: number;
  isOnline: boolean;
  totalSyncedKeys: number;
  productsCount: number;
  detailsCount: number;
  lastErrorMessage?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  isoDate: string;
  formattedDate: string;
  trigger: 'hourly' | 'on_change' | 'manual' | 'boot' | 'import';
  keyCount: number;
  dataSizeKb: number;
  summary: string;
  data?: string; // JSON stringified Record<string, string>
}

// Global runtime state
let isSyncing = false;
let isRestoring = false;
let currentSyncState: SyncState = 'idle';
let lastErrorMessage = '';
let backupDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let hourlyIntervalTimer: ReturnType<typeof setInterval> | null = null;
let cmsSnapshotUnsubscribe: Unsubscribe | null = null;
const pendingWriteQueue = new Map<string, { value: string | null; timestamp: number }>();
let queueFlushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Format timestamp into Korean readable date string
 */
export function formatBackupDate(date: Date = new Date()): string {
  try {
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return date.toISOString();
  }
}

/**
 * Notify sync state change across the app
 */
function updateSyncState(newState: SyncState, errorMsg: string = '') {
  currentSyncState = newState;
  if (errorMsg) lastErrorMessage = errorMsg;
  window.dispatchEvent(new CustomEvent('sy_sync_status_changed', {
    detail: getSyncEngineStatus()
  }));
}

/**
 * Get count of registered products and custom detail pages
 */
export function getProductAndDetailStats(): { productsCount: number; detailsCount: number } {
  let productsCount = 0;
  let detailsCount = 0;

  try {
    // 1. Check main product list
    const p12 = localStorage.getItem('sy_cms_products_v12') || localStorage.getItem('sy_cms_products');
    if (p12) {
      const parsed = JSON.parse(p12);
      if (Array.isArray(parsed)) productsCount += parsed.length;
    }
    // 2. Check solution products
    const homeProds = localStorage.getItem('sy_cms_home_products_v6_fixed');
    if (homeProds) {
      const parsed = JSON.parse(homeProds);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.values(parsed).forEach((arr: any) => {
          if (Array.isArray(arr)) productsCount += arr.length;
        });
      }
    }
    const parkProds = localStorage.getItem('sy_cms_parking_products_v6_fixed') || localStorage.getItem('sy_cms_parking_products_v5_fixed');
    if (parkProds) {
      const parsed = JSON.parse(parkProds);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.values(parsed).forEach((arr: any) => {
          if (Array.isArray(arr)) productsCount += arr.length;
        });
      }
    }

    // Count custom detail pages
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sy_prod_detail_') || key.startsWith('sy_custom_detail_') || key === 'sy_product_details_custom' || key === 'sy_cms_product_details_v1')) {
        detailsCount++;
      }
    }
  } catch {}

  return { productsCount, detailsCount };
}

/**
 * Get current sync engine status
 */
export function getSyncEngineStatus(): SyncEngineStatus {
  let lastBackupInfo = null;
  try {
    const raw = localStorage.getItem('sy_last_backup_info');
    if (raw) lastBackupInfo = JSON.parse(raw);
  } catch {}

  const { productsCount, detailsCount } = getProductAndDetailStats();
  const localKeys = collectLocalCmsData();

  return {
    state: currentSyncState,
    lastSyncedTime: localStorage.getItem('sy_last_sync_time') || formatBackupDate(),
    lastBackupInfo,
    pendingCount: pendingWriteQueue.size,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    totalSyncedKeys: Object.keys(localKeys).length,
    productsCount,
    detailsCount,
    lastErrorMessage
  };
}

/**
 * React Hook to subscribe to real-time sync engine updates
 */
export function useFirestoreSyncStatus(): SyncEngineStatus {
  const [status, setStatus] = useState<SyncEngineStatus>(getSyncEngineStatus);

  useEffect(() => {
    const handleStatusChange = () => {
      setStatus(getSyncEngineStatus());
    };

    window.addEventListener('sy_sync_status_changed', handleStatusChange);
    window.addEventListener('sy_cms_backup_completed', handleStatusChange);
    window.addEventListener('sy_cms_data_sync_completed', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const interval = setInterval(handleStatusChange, 2000);

    return () => {
      window.removeEventListener('sy_sync_status_changed', handleStatusChange);
      window.removeEventListener('sy_cms_backup_completed', handleStatusChange);
      window.removeEventListener('sy_cms_data_sync_completed', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  return status;
}

/**
 * Collect all sy_ prefixed data from localStorage
 */
export function collectLocalCmsData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && shouldSyncKey(key)) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        data[key] = val;
      }
    }
  }
  return data;
}

/**
 * Creates a full snapshot backup of all local storage CMS data into Firestore.
 * Saves to both 'latest_snapshot' and a timestamped history document.
 */
export async function createFirestoreBackup(
  trigger: 'hourly' | 'on_change' | 'manual' | 'boot' | 'import' = 'manual'
): Promise<{ success: boolean; keyCount: number; timestamp: number; message: string; backupDoc?: BackupMetadata }> {
  try {
    updateSyncState('syncing');
    const localData = collectLocalCmsData();
    const keys = Object.keys(localData);
    const keyCount = keys.length;

    // Safety guard: Do not overwrite with an empty backup if we have no local keys
    if (keyCount === 0) {
      console.warn('[SY Backup] Skipped backup: No local sy_ data to back up.');
      updateSyncState('idle');
      return { success: false, keyCount: 0, timestamp: Date.now(), message: '백업할 로컬 데이터가 없습니다.' };
    }

    const now = new Date();
    const timestamp = now.getTime();
    const isoDate = now.toISOString();
    const formattedDate = formatBackupDate(now);
    const serializedData = JSON.stringify(localData);
    const dataSizeKb = Math.round((new Blob([serializedData]).size / 1024) * 10) / 10;

    // Summarize core components
    const summaryItems: string[] = [];
    if (localData['sy_cms_products'] || localData['sy_cms_products_v12']) summaryItems.push('상품 등록 데이터');
    if (localData['sy_cms_home_products_v6_fixed'] || localData['sy_cms_parking_products_v6_fixed']) summaryItems.push('솔루션 상품');
    if (localData['sy_cms_option_presets']) summaryItems.push('옵션 템플릿');
    if (localData['sy_cms_brand_catalogs']) summaryItems.push('브랜드 카탈로그');
    if (localData['sy_cms_hero']) summaryItems.push('메인 배너');
    if (localData['sy_cms_reviews']) summaryItems.push('리뷰');
    if (localData['sy_cms_quote_config']) summaryItems.push('견적문의 설정');
    const summary = summaryItems.length > 0 ? summaryItems.join(', ') : `${keyCount}개 항목 전체 백업`;

    const backupDoc: BackupMetadata = {
      id: `backup_${timestamp}`,
      timestamp,
      isoDate,
      formattedDate,
      trigger,
      keyCount,
      dataSizeKb,
      summary,
      data: serializedData
    };

    // 1. Save as the latest snapshot for fast O(1) recovery
    await setDoc(doc(db, BACKUP_COLLECTION, LATEST_BACKUP_DOC_ID), backupDoc);

    // 2. Also record into history document
    await setDoc(doc(db, BACKUP_COLLECTION, backupDoc.id), backupDoc);

    // Save local metadata cache for quick UI display
    try {
      localStorage.setItem('sy_last_backup_time', isoDate);
      localStorage.setItem('sy_last_backup_info', JSON.stringify({
        formattedDate,
        keyCount,
        trigger,
        dataSizeKb
      }));
      localStorage.setItem('sy_last_sync_time', formattedDate);
    } catch {}

    updateSyncState('synced');
    console.log(`[SY Backup] ✅ [${trigger.toUpperCase()}] Firestore 백업 완료: ${formattedDate} (${keyCount}개 키, ${dataSizeKb} KB)`);
    window.dispatchEvent(new CustomEvent('sy_cms_backup_completed', { detail: backupDoc }));

    return {
      success: true,
      keyCount,
      timestamp,
      message: `${formattedDate} 기준 클라우드 백업 완료 (${keyCount}개 데이터, ${dataSizeKb} KB 저장됨)`,
      backupDoc
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    updateSyncState('error', msg);
    console.error('[SY Backup] ❌ Firestore 백업 실패:', error);
    return {
      success: false,
      keyCount: 0,
      timestamp: Date.now(),
      message: `백업 중 오류가 발생했습니다: ${msg}`
    };
  }
}

/**
 * Triggers a debounced backup on change (waits 2.5 seconds of idle time before writing snapshot)
 */
export function scheduleOnChangeBackup() {
  if (backupDebounceTimer) {
    clearTimeout(backupDebounceTimer);
  }
  backupDebounceTimer = setTimeout(() => {
    createFirestoreBackup('on_change').catch(err => {
      console.warn('[SY Backup] On-change backup notice:', err);
    });
  }, 2500);
}

/**
 * Fetch backup history list from Firestore (most recent first)
 */
export async function getBackupHistory(limitCount: number = 30): Promise<BackupMetadata[]> {
  try {
    const q = query(
      collection(db, BACKUP_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const history: BackupMetadata[] = [];
    
    snapshot.forEach(docSnap => {
      if (docSnap.id !== LATEST_BACKUP_DOC_ID) {
        const data = docSnap.data() as BackupMetadata;
        // Don't keep heavy data string in memory for list overview
        const { data: _, ...meta } = data;
        history.push(meta);
      }
    });

    return history;
  } catch (error) {
    console.warn('[SY Backup] 백업 히스토리 조회 실패:', error);
    return [];
  }
}

/**
 * Dispatch all application state update events to refresh React UI
 */
export function triggerAllCmsUpdateEvents() {
  const events = [
    'sy_sync_status_changed',
    'sy_cms_data_sync_completed',
    'sy_cms_products_update',
    'sy_cms_hero_update',
    'sy_cms_reviews_update',
    'sy_cms_notices_update',
    'sy_cms_faqs_update',
    'sy_cms_support_update',
    'sy_cms_product_details_update',
    'sy_cms_brand_catalogs_update',
    'sy_cms_option_presets_update',
    'sy_cms_home_popup_update',
    'sy_cms_mobile_design_update',
    'sy_cms_header_update',
    'sy_cms_footer_update',
    'sy_cms_sns_update',
    'sy_cms_terms_update',
    'sy_cms_quote_update'
  ];
  events.forEach(eventName => {
    window.dispatchEvent(new Event(eventName));
  });
}

/**
 * Apply a dictionary of keys directly to localStorage and Firestore
 */
function applyRestoredData(parsedData: Record<string, string>): number {
  const restoredKeysList = Object.keys(parsedData);
  let count = 0;

  restoredKeysList.forEach(key => {
    if (shouldSyncKey(key) && typeof parsedData[key] === 'string') {
      try {
        localStorage.setItem(key, parsedData[key]);
        count++;
      } catch (e) {
        console.warn(`[SY Backup] Error restoring key ${key}:`, e);
      }
    }
  });

  // Also push restored keys to Firestore CMS collection
  for (const key of restoredKeysList) {
    if (shouldSyncKey(key) && typeof parsedData[key] === 'string') {
      setDoc(doc(db, CMS_COLLECTION, key), {
        value: parsedData[key],
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    }
  }

  return count;
}

/**
 * RESTORE SCRIPT: Restores localStorage data from the latest successful Firestore backup.
 * Use this whenever data loss is detected or when requested by admin.
 */
export async function restoreFromLatestBackup(): Promise<{
  success: boolean;
  restoredKeys: number;
  message: string;
  backupDate?: string;
}> {
  if (isRestoring) {
    return { success: false, restoredKeys: 0, message: '복구 작업이 이미 진행 중입니다.' };
  }

  isRestoring = true;
  updateSyncState('restoring');
  try {
    console.log('[SY Backup] 🔄 최신 Firestore 백업본으로부터 데이터 복구 시작...');

    // 1. Try reading the latest_snapshot document first
    let backupSnap = await getDoc(doc(db, BACKUP_COLLECTION, LATEST_BACKUP_DOC_ID));
    let backupData = backupSnap.exists() ? (backupSnap.data() as BackupMetadata) : null;

    // 2. If latest_snapshot is not found, fallback to querying most recent timestamped backup
    if (!backupData || !backupData.data) {
      const q = query(
        collection(db, BACKUP_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        backupData = querySnap.docs[0].data() as BackupMetadata;
      }
    }

    if (!backupData || !backupData.data) {
      console.warn('[SY Backup] ⚠️ Firestore에 복구 가능한 유효한 백업본이 존재하지 않습니다.');
      updateSyncState('error', 'Firestore에 저장된 백업본이 없습니다.');
      return {
        success: false,
        restoredKeys: 0,
        message: 'Firestore에 저장된 백업본이 없습니다.'
      };
    }

    // 3. Parse and restore data into localStorage
    const parsedData: Record<string, string> = JSON.parse(backupData.data);
    const count = applyRestoredData(parsedData);

    console.log(`[SY Backup] 🎉 데이터 복구 완료! (${count}개 항목 복구됨, 백업일시: ${backupData.formattedDate})`);
    
    // 4. Notify all components to re-render with restored state
    triggerAllCmsUpdateEvents();
    updateSyncState('synced');

    return {
      success: true,
      restoredKeys: count,
      backupDate: backupData.formattedDate,
      message: `성공적으로 ${count}개 데이터 항목을 [${backupData.formattedDate}] 백업본에서 복구했습니다.`
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[SY Backup] ❌ 데이터 복구 실패:', error);
    updateSyncState('error', msg);
    return {
      success: false,
      restoredKeys: 0,
      message: `복구 중 오류 발생: ${msg}`
    };
  } finally {
    isRestoring = false;
    triggerAllCmsUpdateEvents();
  }
}

/**
 * RESTORE SCRIPT: Restores localStorage data from a specific historical backup doc ID.
 */
export async function restoreFromSpecificBackup(backupDocId: string): Promise<{
  success: boolean;
  restoredKeys: number;
  message: string;
  backupDate?: string;
}> {
  if (isRestoring) {
    return { success: false, restoredKeys: 0, message: '복구가 이미 진행 중입니다.' };
  }

  isRestoring = true;
  updateSyncState('restoring');
  try {
    const snap = await getDoc(doc(db, BACKUP_COLLECTION, backupDocId));
    if (!snap.exists()) {
      updateSyncState('error', '해당 백업 문서를 찾을 수 없습니다.');
      return { success: false, restoredKeys: 0, message: '해당 백업 문서를 찾을 수 없습니다.' };
    }

    const backupData = snap.data() as BackupMetadata;
    if (!backupData.data) {
      updateSyncState('error', '백업 데이터 내용이 비어있습니다.');
      return { success: false, restoredKeys: 0, message: '백업 데이터 내용이 비어있습니다.' };
    }

    const parsedData: Record<string, string> = JSON.parse(backupData.data);
    const count = applyRestoredData(parsedData);

    triggerAllCmsUpdateEvents();
    updateSyncState('synced');

    return {
      success: true,
      restoredKeys: count,
      backupDate: backupData.formattedDate,
      message: `성공적으로 ${count}개 데이터 항목을 [${backupData.formattedDate}] 백업본에서 롤백 복구했습니다.`
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    updateSyncState('error', msg);
    return {
      success: false,
      restoredKeys: 0,
      message: `복구 오류: ${msg}`
    };
  } finally {
    isRestoring = false;
    triggerAllCmsUpdateEvents();
  }
}

/**
 * Restore from raw JSON text or uploaded JSON backup file
 */
export async function restoreFromRawJson(jsonString: string): Promise<{
  success: boolean;
  restoredKeys: number;
  message: string;
}> {
  if (isRestoring) {
    return { success: false, restoredKeys: 0, message: '복구가 이미 진행 중입니다.' };
  }

  isRestoring = true;
  updateSyncState('restoring');
  try {
    let parsedData: Record<string, string>;
    try {
      const parsed = JSON.parse(jsonString);
      // Support both direct dict or { data: dict } structure
      if (parsed.data && typeof parsed.data === 'string') {
        parsedData = JSON.parse(parsed.data);
      } else if (parsed.data && typeof parsed.data === 'object') {
        parsedData = parsed.data;
      } else {
        parsedData = parsed;
      }
    } catch {
      throw new Error('올바른 JSON 백업 파일 형식이 아닙니다.');
    }

    const count = applyRestoredData(parsedData);

    // Save as an import backup snapshot in Firestore
    await createFirestoreBackup('import');

    triggerAllCmsUpdateEvents();
    updateSyncState('synced');

    return {
      success: true,
      restoredKeys: count,
      message: `백업 파일로부터 ${count}개의 상품 및 설정 데이터를 성공적으로 복원했습니다!`
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    updateSyncState('error', msg);
    return {
      success: false,
      restoredKeys: 0,
      message: `파일 복원 실패: ${msg}`
    };
  } finally {
    isRestoring = false;
    triggerAllCmsUpdateEvents();
  }
}

/**
 * Export full backup as downloadable JSON file (Disaster Recovery)
 */
export function exportBackupToJsonFile(): void {
  try {
    const data = collectLocalCmsData();
    const now = new Date();
    const formatted = formatBackupDate(now).replace(/[: ]/g, '_');
    const { productsCount, detailsCount } = getProductAndDetailStats();

    const payload = {
      app: 'SY_DOT_COM_CMS',
      exportDate: now.toISOString(),
      formattedDate: formatBackupDate(now),
      stats: {
        productsCount,
        detailsCount,
        keysCount: Object.keys(data).length
      },
      data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SY_COM_CMS_Backup_${formatted}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('백업 파일 내보내기 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Verify Data Integrity
 */
export function verifyDataIntegrity(): {
  isHealthy: boolean;
  issues: string[];
  stats: {
    totalKeys: number;
    totalProducts: number;
    totalCustomDetails: number;
    totalOptionPresets: number;
    totalBrands: number;
    approximateSizeKb: number;
  };
} {
  const issues: string[] = [];
  const localData = collectLocalCmsData();
  const keys = Object.keys(localData);
  const totalKeys = keys.length;
  let totalProducts = 0;
  let totalCustomDetails = 0;
  let totalOptionPresets = 0;
  let totalBrands = 0;

  // 1. Check products
  try {
    const p = localData['sy_cms_products_v12'] || localData['sy_cms_products'];
    if (p) {
      const arr = JSON.parse(p);
      if (Array.isArray(arr)) totalProducts += arr.length;
    } else {
      issues.push('⚠️ 메인 상품 목록 데이터 키가 비어있습니다.');
    }
  } catch {
    issues.push('❌ 메인 상품 목록 JSON 구조가 손상되었습니다.');
  }

  // 2. Check solution products
  try {
    const home = localData['sy_cms_home_products_v6_fixed'];
    if (home) {
      const parsed = JSON.parse(home);
      Object.values(parsed).forEach((arr: any) => {
        if (Array.isArray(arr)) totalProducts += arr.length;
      });
    }
    const park = localData['sy_cms_parking_products_v6_fixed'] || localData['sy_cms_parking_products_v5_fixed'];
    if (park) {
      const parsed = JSON.parse(park);
      Object.values(parsed).forEach((arr: any) => {
        if (Array.isArray(arr)) totalProducts += arr.length;
      });
    }
  } catch {
    issues.push('⚠️ 솔루션 충전기 상품 JSON 검증 중 이상이 발견되었습니다.');
  }

  // 3. Check Option Presets
  try {
    const presets = localData['sy_cms_option_presets'];
    if (presets) {
      const arr = JSON.parse(presets);
      if (Array.isArray(arr)) totalOptionPresets = arr.length;
    }
  } catch {
    issues.push('⚠️ 옵션 템플릿 프리셋 데이터에 오류가 있습니다.');
  }

  // 4. Check Brands
  try {
    const brands = localData['sy_cms_brand_catalogs'];
    if (brands) {
      const arr = JSON.parse(brands);
      if (Array.isArray(arr)) totalBrands = arr.length;
    }
  } catch {}

  // 5. Count custom detail pages
  keys.forEach(k => {
    if (k.startsWith('sy_prod_detail_') || k.startsWith('sy_custom_detail_')) {
      totalCustomDetails++;
    }
  });

  const serialized = JSON.stringify(localData);
  const approximateSizeKb = Math.round((new Blob([serialized]).size / 1024) * 10) / 10;

  return {
    isHealthy: issues.length === 0,
    issues,
    stats: {
      totalKeys,
      totalProducts,
      totalCustomDetails,
      totalOptionPresets,
      totalBrands,
      approximateSizeKb
    }
  };
}

/**
 * Real-time load & sync on app initialization
 */
export async function loadFromFirestore(): Promise<void> {
  if (isSyncing || isRestoring) return;
  isSyncing = true;
  updateSyncState('syncing');
  try {
    const querySnapshot = await getDocs(collection(db, CMS_COLLECTION));
    const firebaseKeys = new Set<string>();

    querySnapshot.forEach((document) => {
      const key = document.id;
      const data = document.data();

      // If a non-syncable private session / credential key exists in Firestore, purge it immediately
      if (NON_SYNCABLE_KEYS.has(key)) {
        deleteDoc(doc(db, CMS_COLLECTION, key)).catch(() => {});
        return;
      }

      if (shouldSyncKey(key) && data && typeof data.value === 'string') {
        localStorage.setItem(key, data.value);
        firebaseKeys.add(key);
      }
    });

    // Clean up any insecure locally saved passwords
    localStorage.removeItem('sy_saved_login_password');

    // Check if Firestore was empty or missing keys, but localStorage had them -> seed Firestore
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldSyncKey(key) && !firebaseKeys.has(key)) {
        const value = localStorage.getItem(key);
        if (value) {
          await setDoc(doc(db, CMS_COLLECTION, key), {
            value,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    // Safety Data Loss Check: If both Firestore CMS and localStorage have 0 or empty critical keys,
    // automatically attempt to restore from latest backup snapshot!
    const localKeysCount = Object.keys(collectLocalCmsData()).length;
    if (localKeysCount <= 1) {
      console.warn('[SY Backup] 로컬/실시간 데이터 유실 감지됨. 최신 백업본에서 자동 복구 시도...');
      await restoreFromLatestBackup();
    } else {
      // Create a boot snapshot backup
      createFirestoreBackup('boot').catch(() => {});
    }

    // Set last sync timestamp
    const nowFormatted = formatBackupDate();
    localStorage.setItem('sy_last_sync_time', nowFormatted);
    updateSyncState('synced');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[SY Backup] Firestore 초기 로드 알림 (로컬 캐시 우선 사용):', error);
    updateSyncState('error', msg);
  } finally {
    isSyncing = false;
    triggerAllCmsUpdateEvents();
  }
}

/**
 * Flush queued pending writes to Firestore
 */
async function flushPendingWrites() {
  if (pendingWriteQueue.size === 0) return;
  
  updateSyncState('syncing');
  const entries = Array.from(pendingWriteQueue.entries());
  pendingWriteQueue.clear();

  for (const [key, item] of entries) {
    try {
      if (item.value === null) {
        await deleteDoc(doc(db, CMS_COLLECTION, key));
      } else {
        await setDoc(doc(db, CMS_COLLECTION, key), {
          value: item.value,
          updatedAt: new Date(item.timestamp).toISOString()
        });
      }
    } catch (error) {
      console.error(`[SY Sync] Error writing ${key} to Firestore:`, error);
      // Requeue failed write for retry
      pendingWriteQueue.set(key, item);
    }
  }

  const nowFormatted = formatBackupDate();
  try {
    localStorage.setItem('sy_last_sync_time', nowFormatted);
  } catch {}

  if (pendingWriteQueue.size === 0) {
    updateSyncState('synced');
    scheduleOnChangeBackup();
  } else {
    updateSyncState('error', '일부 데이터 동기화 재시도 대기 중');
  }
}

/**
 * Save single key change to Firestore in real-time (with asynchronous queued batching)
 */
export function saveToFirestore(key: string, value: string): void {
  if (isRestoring || !shouldSyncKey(key)) return;

  pendingWriteQueue.set(key, { value, timestamp: Date.now() });
  updateSyncState('syncing');

  if (queueFlushTimer) clearTimeout(queueFlushTimer);
  queueFlushTimer = setTimeout(() => {
    flushPendingWrites();
  }, 400);
}

/**
 * Delete single key from Firestore
 */
export function deleteFromFirestore(key: string): void {
  if (isRestoring || !shouldSyncKey(key)) return;

  pendingWriteQueue.set(key, { value: null, timestamp: Date.now() });
  updateSyncState('syncing');

  if (queueFlushTimer) clearTimeout(queueFlushTimer);
  queueFlushTimer = setTimeout(() => {
    flushPendingWrites();
  }, 400);
}

/**
 * Start the 1-hour periodic recurring backup schedule
 */
export function startHourlyBackupSchedule() {
  if (hourlyIntervalTimer) {
    clearInterval(hourlyIntervalTimer);
  }
  
  // 1 hour in milliseconds = 3600000 ms (60 * 60 * 1000)
  const ONE_HOUR_MS = 60 * 60 * 1000;
  
  hourlyIntervalTimer = setInterval(() => {
    console.log('[SY Backup] ⏰ 매 1시간 정기 백업 프로세스 실행 중...');
    createFirestoreBackup('hourly').catch(err => {
      console.error('[SY Backup] 정기 1시간 백업 실패:', err);
    });
  }, ONE_HOUR_MS);

  console.log('[SY Backup] ⏱️ Firestore 1시간 주기 정기 백업 스케줄러 활성화됨.');
}

/**
 * Listen to live real-time changes on Firestore CMS collection for multi-tab / cloud sync
 */
export function setupRealtimeCmsListener() {
  if (cmsSnapshotUnsubscribe) {
    cmsSnapshotUnsubscribe();
  }

  try {
    cmsSnapshotUnsubscribe = onSnapshot(collection(db, CMS_COLLECTION), (snapshot) => {
      if (isSyncing || isRestoring) return;

      let changedCount = 0;
      snapshot.docChanges().forEach((change) => {
        const key = change.doc.id;
        if (!shouldSyncKey(key)) return;

        if (change.type === 'added' || change.type === 'modified') {
          const cloudVal = change.doc.data()?.value;
          const localVal = localStorage.getItem(key);
          if (typeof cloudVal === 'string' && cloudVal !== localVal) {
            // Apply without re-triggering saveToFirestore
            try {
              const prevIsSyncing = isSyncing;
              isSyncing = true;
              localStorage.setItem(key, cloudVal);
              isSyncing = prevIsSyncing;
              changedCount++;
            } catch {}
          }
        } else if (change.type === 'removed') {
          if (localStorage.getItem(key) !== null) {
            try {
              const prevIsSyncing = isSyncing;
              isSyncing = true;
              localStorage.removeItem(key);
              isSyncing = prevIsSyncing;
              changedCount++;
            } catch {}
          }
        }
      });

      if (changedCount > 0) {
        console.log(`[SY Sync] ⚡ Firestore 실시간 변경사항 ${changedCount}개 로컬에 동기화됨.`);
        triggerAllCmsUpdateEvents();
      }
    }, (error) => {
      console.warn('[SY Sync] 실시간 리스너 알림 (로컬 저장소 모드 지속):', error);
    });
  } catch (err) {
    console.warn('[SY Sync] 실시간 리스너 설정 오류:', err);
  }
}

/**
 * Global Interception Setup for localStorage
 */
export function setupFirebaseStorageSync() {
  // Hook localStorage.setItem
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, [key, value]);
    if (shouldSyncKey(key) && !isSyncing && !isRestoring) {
      saveToFirestore(key, value);
    }
  };

  // Hook localStorage.removeItem
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key) {
    originalRemoveItem.apply(this, [key]);
    if (shouldSyncKey(key) && !isSyncing && !isRestoring) {
      deleteFromFirestore(key);
    }
  };

  // Hook localStorage.clear
  const originalClear = localStorage.clear;
  localStorage.clear = function () {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldSyncKey(key)) {
        keysToDelete.push(key);
      }
    }
    originalClear.apply(this);
    if (!isSyncing && !isRestoring) {
      keysToDelete.forEach(key => deleteFromFirestore(key));
    }
  };

  // Start periodic hourly scheduler
  startHourlyBackupSchedule();

  // Start real-time snapshot listener
  setupRealtimeCmsListener();

  // Expose backup & restore scripts globally on window for admin / debugging recovery
  if (typeof window !== 'undefined') {
    (window as any).syBackupManager = {
      createBackup: createFirestoreBackup,
      restoreLatest: restoreFromLatestBackup,
      restoreById: restoreFromSpecificBackup,
      restoreFromJson: restoreFromRawJson,
      exportJson: exportBackupToJsonFile,
      getHistory: getBackupHistory,
      getStatus: getSyncEngineStatus,
      verifyIntegrity: verifyDataIntegrity,
      collectData: collectLocalCmsData
    };
    (window as any).syRestoreFromBackup = restoreFromLatestBackup;
    (window as any).syCreateBackup = () => createFirestoreBackup('manual');
    (window as any).syExportBackup = exportBackupToJsonFile;
    (window as any).syVerifyData = verifyDataIntegrity;
  }
}
