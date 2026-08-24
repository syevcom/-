/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyVisitorRecord, VisitorAnalyticsData, VisitorLogEntry } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

export const VISITOR_DAILY_COLLECTION = 'sy_visitor_daily';
export const VISITOR_LOGS_COLLECTION = 'sy_visitor_logs';
const LOCAL_STORAGE_CACHE_KEY = 'sy_visitor_analytics_cache';
const CLIENT_UUID_KEY = 'sy_visitor_client_uuid';
const DAY_VISITED_KEY_PREFIX = 'sy_visited_day_';

// Helper to format Date to YYYY-MM-DD
export function formatDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get or generate a persistent anonymous client UUID
export function getOrCreateClientUUID(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let uuid = localStorage.getItem(CLIENT_UUID_KEY);
    if (!uuid) {
      uuid = `client_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(CLIENT_UUID_KEY, uuid);
    }
    return uuid;
  } catch {
    return `client_${Date.now()}`;
  }
}

// Real device detection
export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'tablet';
  }
  if (/(iphone|ipod|((?:android)?.*?mobile)|blackberry|iemobile|opera mini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Real browser detection
export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  if (ua.includes('KAKAOTALK')) return 'KakaoTalk InApp';
  if (ua.includes('NAVER')) return 'Naver InApp';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Edg/')) return 'MS Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg')) return 'Google Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Apple Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  return 'Web Browser';
}

// Real referrer parsing
export function parseReferrer(): string {
  if (typeof document === 'undefined' || !document.referrer) {
    return '직접 접속 (URL / 북마크)';
  }
  const ref = document.referrer.toLowerCase();
  try {
    const url = new URL(document.referrer);
    const host = url.hostname;
    if (host.includes('naver.com')) return '네이버 검색 / 포털';
    if (host.includes('google.com') || host.includes('google.co.kr')) return '구글 검색 (Google)';
    if (host.includes('daum.net')) return '다음 검색 (Daum)';
    if (host.includes('kakao.com')) return '카카오톡 / 다음';
    if (host.includes('instagram.com')) return '인스타그램 (Instagram)';
    if (host.includes('youtube.com')) return '유튜브 (YouTube)';
    if (host.includes('facebook.com')) return '페이스북 (Facebook)';
    return `외부 사이트 (${host})`;
  } catch {
    return ref.slice(0, 30);
  }
}

// Create an empty fresh data structure
export function createEmptyAnalyticsData(): VisitorAnalyticsData {
  const todayKey = formatDateKey(new Date());
  return {
    todayUV: 0,
    todayPV: 0,
    yesterdayUV: 0,
    yesterdayPV: 0,
    thisMonthUV: 0,
    totalAllTimeUV: 0,
    totalAllTimePV: 0,
    dailyRecords: [
      {
        date: todayKey,
        uniqueVisitors: 0,
        pageViews: 0,
        mobileVisitors: 0,
        desktopVisitors: 0,
        inquiryConversions: 0,
        hourlyDistribution: new Array(24).fill(0)
      }
    ],
    recentLogs: [],
    pagePopularity: []
  };
}

// Read cached analytics from localStorage for zero-latency initial UI
export function getVisitorAnalytics(): VisitorAnalyticsData {
  if (typeof window === 'undefined') return createEmptyAnalyticsData();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (saved) {
      const parsed: VisitorAnalyticsData = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.dailyRecords)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Analytics] Error reading local analytics cache:', e);
  }
  return createEmptyAnalyticsData();
}

// Save cached analytics to localStorage
export function saveVisitorAnalytics(data: VisitorAnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Analytics] Error saving local analytics cache:', e);
  }
}

/**
 * 100% REAL CLOUD TRACKER:
 * Records a real page hit and unique visitor into Firestore and updates local cache.
 */
export async function recordVisitorHit(pageName: string): Promise<VisitorAnalyticsData> {
  const todayKey = formatDateKey(new Date());
  const now = new Date();
  const currentHour = now.getHours();
  const device = detectDevice();
  const browser = detectBrowser();
  const referrer = parseReferrer();
  const clientUUID = getOrCreateClientUUID();

  // 1. Check if this client is a unique visitor today
  const visitedDayKey = `${DAY_VISITED_KEY_PREFIX}${todayKey}`;
  let isUniqueToday = false;
  try {
    if (!localStorage.getItem(visitedDayKey)) {
      localStorage.setItem(visitedDayKey, '1');
      isUniqueToday = true;
    }
  } catch {
    isUniqueToday = true;
  }

  // 2. Read existing local cached data
  const currentData = getVisitorAnalytics();
  let todayRec = currentData.dailyRecords.find(r => r.date === todayKey);
  if (!todayRec) {
    todayRec = {
      date: todayKey,
      uniqueVisitors: 0,
      pageViews: 0,
      mobileVisitors: 0,
      desktopVisitors: 0,
      inquiryConversions: 0,
      hourlyDistribution: new Array(24).fill(0)
    };
    currentData.dailyRecords.push(todayRec);
  }

  // 3. Increment counters
  if (isUniqueToday) {
    todayRec.uniqueVisitors += 1;
    currentData.todayUV = todayRec.uniqueVisitors;
    currentData.thisMonthUV += 1;
    currentData.totalAllTimeUV += 1;

    if (device === 'mobile' || device === 'tablet') {
      todayRec.mobileVisitors += 1;
    } else {
      todayRec.desktopVisitors += 1;
    }
  }

  todayRec.pageViews += 1;
  currentData.todayPV = todayRec.pageViews;
  currentData.totalAllTimePV += 1;

  if (Array.isArray(todayRec.hourlyDistribution) && todayRec.hourlyDistribution.length === 24) {
    todayRec.hourlyDistribution[currentHour] = (todayRec.hourlyDistribution[currentHour] || 0) + 1;
  }

  // 4. Create new real log entry
  const maskedId = clientUUID.slice(0, 10) + '...';
  const newLog: VisitorLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    date: todayKey,
    time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    page: pageName || '메인 홈',
    device,
    browser: `${browser} (${device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : 'PC'})`,
    ip: `고객 ID: ${maskedId}`,
    referrer
  };

  currentData.recentLogs = [newLog, ...(currentData.recentLogs || []).slice(0, 49)];

  // 5. Update page popularity ranking
  let pageItem = currentData.pagePopularity.find(p => p.pageName === pageName);
  if (pageItem) {
    pageItem.views += 1;
  } else if (pageName) {
    currentData.pagePopularity.push({ pageName, views: 1, percentage: 0 });
  }

  const totalPopViews = currentData.pagePopularity.reduce((acc, p) => acc + p.views, 0) || 1;
  currentData.pagePopularity = currentData.pagePopularity.map(p => ({
    ...p,
    percentage: Math.round((p.views / totalPopViews) * 100)
  })).sort((a, b) => b.views - a.views);

  // Save immediate local cache
  saveVisitorAnalytics(currentData);

  // 6. Asynchronously sync to Firestore collections (Real Cloud Persistence)
  try {
    const dailyDocRef = doc(db, VISITOR_DAILY_COLLECTION, todayKey);
    const dailySnap = await getDoc(dailyDocRef);

    if (dailySnap.exists()) {
      const serverData = dailySnap.data() as any;
      const updatedUV = (serverData.uniqueVisitors || 0) + (isUniqueToday ? 1 : 0);
      const updatedPV = (serverData.pageViews || 0) + 1;
      const updatedMobile = (serverData.mobileVisitors || 0) + (isUniqueToday && (device === 'mobile' || device === 'tablet') ? 1 : 0);
      const updatedDesktop = (serverData.desktopVisitors || 0) + (isUniqueToday && device === 'desktop' ? 1 : 0);
      
      const serverHourly = Array.isArray(serverData.hourlyDistribution) && serverData.hourlyDistribution.length === 24
        ? [...serverData.hourlyDistribution]
        : new Array(24).fill(0);
      serverHourly[currentHour] = (serverHourly[currentHour] || 0) + 1;

      await updateDoc(dailyDocRef, {
        uniqueVisitors: updatedUV,
        pageViews: updatedPV,
        mobileVisitors: updatedMobile,
        desktopVisitors: updatedDesktop,
        hourlyDistribution: serverHourly,
        updatedAt: now.toISOString()
      });
    } else {
      const initialHourly = new Array(24).fill(0);
      initialHourly[currentHour] = 1;

      await setDoc(dailyDocRef, {
        date: todayKey,
        uniqueVisitors: isUniqueToday ? 1 : 0,
        pageViews: 1,
        mobileVisitors: isUniqueToday && (device === 'mobile' || device === 'tablet') ? 1 : 0,
        desktopVisitors: isUniqueToday && device === 'desktop' ? 1 : 0,
        tabletVisitors: 0,
        inquiryConversions: 0,
        hourlyDistribution: initialHourly,
        updatedAt: now.toISOString()
      });
    }

    // Save access log to Firestore
    const logDocRef = doc(db, VISITOR_LOGS_COLLECTION, newLog.id);
    await setDoc(logDocRef, newLog).catch(() => {});
  } catch (err) {
    console.warn('[Analytics] Notice on Firestore visitor sync:', err);
  }

  // Notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sy_visitor_hit_recorded', { detail: currentData }));
  }

  return currentData;
}

/**
 * 100% REAL CLOUD FETCHER:
 * Fetches all actual records from Firestore `sy_visitor_daily` and `sy_visitor_logs`.
 */
export async function fetchRealVisitorAnalyticsFromFirestore(): Promise<VisitorAnalyticsData> {
  const todayKey = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  const thisMonthPrefix = todayKey.slice(0, 7); // "YYYY-MM"

  try {
    // 1. Fetch all daily documents from Firestore
    const dailySnap = await getDocs(collection(db, VISITOR_DAILY_COLLECTION));
    const dailyRecordsMap = new Map<string, DailyVisitorRecord>();

    dailySnap.forEach(docSnap => {
      const d = docSnap.data() as any;
      if (d.date) {
        dailyRecordsMap.set(d.date, {
          date: d.date,
          uniqueVisitors: Number(d.uniqueVisitors) || 0,
          pageViews: Number(d.pageViews) || 0,
          mobileVisitors: Number(d.mobileVisitors) || 0,
          desktopVisitors: Number(d.desktopVisitors) || 0,
          inquiryConversions: Number(d.inquiryConversions) || 0,
          hourlyDistribution: Array.isArray(d.hourlyDistribution) && d.hourlyDistribution.length === 24
            ? d.hourlyDistribution
            : new Array(24).fill(0)
        });
      }
    });

    // If today's doc is not in Firestore yet, check local cache or initialize with 0
    if (!dailyRecordsMap.has(todayKey)) {
      const localCached = getVisitorAnalytics();
      const localToday = localCached.dailyRecords.find(r => r.date === todayKey);
      dailyRecordsMap.set(todayKey, localToday || {
        date: todayKey,
        uniqueVisitors: 0,
        pageViews: 0,
        mobileVisitors: 0,
        desktopVisitors: 0,
        inquiryConversions: 0,
        hourlyDistribution: new Array(24).fill(0)
      });
    }

    // Sort daily records chronologically
    const sortedDailyRecords = Array.from(dailyRecordsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // 2. Calculate real aggregate statistics
    const todayRec = dailyRecordsMap.get(todayKey) || { uniqueVisitors: 0, pageViews: 0 };
    const yesterdayRec = dailyRecordsMap.get(yesterdayKey) || { uniqueVisitors: 0, pageViews: 0 };

    let totalAllTimeUV = 0;
    let totalAllTimePV = 0;
    let thisMonthUV = 0;

    sortedDailyRecords.forEach(r => {
      totalAllTimeUV += r.uniqueVisitors;
      totalAllTimePV += r.pageViews;
      if (r.date.startsWith(thisMonthPrefix)) {
        thisMonthUV += r.uniqueVisitors;
      }
    });

    // 3. Fetch latest 50 real visitor logs from Firestore
    let recentLogs: VisitorLogEntry[] = [];
    try {
      const logsQuery = query(
        collection(db, VISITOR_LOGS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const logsSnap = await getDocs(logsQuery);
      logsSnap.forEach(docSnap => {
        recentLogs.push(docSnap.data() as VisitorLogEntry);
      });
    } catch (e) {
      console.warn('[Analytics] Using local logs fallback:', e);
      recentLogs = getVisitorAnalytics().recentLogs || [];
    }

    // 4. Calculate page popularity from real logs
    const pageHitsMap: Record<string, number> = {};
    recentLogs.forEach(log => {
      if (log.page) {
        pageHitsMap[log.page] = (pageHitsMap[log.page] || 0) + 1;
      }
    });

    const totalLogHits = recentLogs.length || 1;
    const pagePopularity = Object.entries(pageHitsMap)
      .map(([pageName, views]) => ({
        pageName,
        views,
        percentage: Math.round((views / totalLogHits) * 100)
      }))
      .sort((a, b) => b.views - a.views);

    const resultData: VisitorAnalyticsData = {
      todayUV: todayRec.uniqueVisitors,
      todayPV: todayRec.pageViews,
      yesterdayUV: yesterdayRec.uniqueVisitors,
      yesterdayPV: yesterdayRec.pageViews,
      thisMonthUV,
      totalAllTimeUV,
      totalAllTimePV,
      dailyRecords: sortedDailyRecords,
      recentLogs,
      pagePopularity
    };

    // Cache the real Firestore results locally
    saveVisitorAnalytics(resultData);

    return resultData;
  } catch (error) {
    console.error('[Analytics] Error fetching real visitor analytics from Firestore:', error);
    return getVisitorAnalytics();
  }
}

/**
 * GOOGLE ANALYTICS 4 & NAVER ANALYTICS TAG INJECTION
 * Allows the website owner to enter their official GA4 Measurement ID (G-XXXXXXXXXX) or Naver ID.
 */
export function initExternalAnalytics(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const ga4Id = localStorage.getItem('sy_ga4_measurement_id')?.trim();
    if (ga4Id && ga4Id.startsWith('G-')) {
      const existingScript = document.getElementById('sy-ga4-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'sy-ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'sy-ga4-inline';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}');
        `;
        document.head.appendChild(inlineScript);
        console.log(`[Analytics] ✅ Google Analytics 4 (${ga4Id}) 공식 태그가 연결되었습니다.`);
      }
    }

    const naverId = localStorage.getItem('sy_naver_analytics_id')?.trim();
    if (naverId) {
      const existingNaver = document.getElementById('sy-naver-script');
      if (!existingNaver) {
        const script = document.createElement('script');
        script.id = 'sy-naver-script';
        script.async = true;
        script.src = 'https://wcs.naver.net/wcslog.js';
        script.onload = () => {
          try {
            if ((window as any).wcs) {
              if (!(window as any).wcs_add) (window as any).wcs_add = {};
              (window as any).wcs_add['wa'] = naverId;
              (window as any).wcs_do();
            }
          } catch {}
        };
        document.head.appendChild(script);
        console.log(`[Analytics] ✅ 네이버 프리미엄 로그분석 (${naverId}) 공식 태그가 연결되었습니다.`);
      }
    }
  } catch (e) {
    console.warn('[Analytics] External analytics tag injection notice:', e);
  }
}
