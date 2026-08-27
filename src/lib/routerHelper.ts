import { ActivePage, Product, SolutionProduct } from '../types';
import { PRODUCTS } from '../data';
import { HOME_PRODUCTS_DATA, PARKING_PRODUCTS_DATA } from '../components/SolutionsSection';

export interface RouteState {
  page: ActivePage;
  tab?: string;
  detail?: string | null;
  modal?: string | null;
  purpose?: 'Commercial' | 'Residential' | 'ParkingLot';
  power?: string;
  brand?: string;
  legalTab?: 'refund' | 'terms' | 'privacy' | 'escrow';
}

/**
 * Searches across all product sources (PRODUCTS, HOME_PRODUCTS_DATA, PARKING_PRODUCTS_DATA, CMS)
 * to resolve a product by ID, slug, or matching name.
 */
export function findProductByIdOrSlug(idOrSlug: string): (SolutionProduct | Product) | null {
  if (!idOrSlug) return null;
  const target = idOrSlug.trim().toLowerCase();

  // 1. Check in PRODUCTS (from data.ts)
  const inProducts = PRODUCTS.find(p => 
    p.id?.toLowerCase() === target || 
    p.name?.toLowerCase().includes(target) ||
    (target.includes('50kw') && (p.id === 'park-50kw-1ch-coolcharge' || p.id === 'sy-dc50')) ||
    (target.includes('5kw') && target.includes('스필') && (p.id === 'sy-ac05' || p.id === 'res-5kw-spil')) ||
    (target.includes('7kw') && target.includes('스필') && (p.id === 'sy-ac07' || p.id === 'res-7kw-spil')) ||
    (target.includes('11kw') && target.includes('스필') && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil'))
  );
  if (inProducts) return inProducts;

  // 2. Check in HOME_PRODUCTS_DATA
  for (const powerKey of Object.keys(HOME_PRODUCTS_DATA)) {
    const list = HOME_PRODUCTS_DATA[powerKey] || [];
    const matched = list.find(p => 
      p.id?.toLowerCase() === target ||
      p.name?.toLowerCase().includes(target) ||
      (target === 'speel-5kw' && (p.id === 'sy-ac05' || p.id === 'res-5kw-spil')) ||
      (target === 'speel-7kw' && (p.id === 'sy-ac07' || p.id === 'res-7kw-spil')) ||
      (target === 'speel-11kw' && (p.id === 'sy-ac11-bi' || p.id === 'res-11kw-spil'))
    );
    if (matched) return matched;
  }

  // 3. Check in PARKING_PRODUCTS_DATA
  for (const capKey of Object.keys(PARKING_PRODUCTS_DATA)) {
    const list = PARKING_PRODUCTS_DATA[capKey] || [];
    const matched = list.find(p => 
      p.id?.toLowerCase() === target ||
      p.name?.toLowerCase().includes(target) ||
      (target.includes('50kw') && (p.id === 'park-50kw-1ch-coolcharge' || p.id === 'sy-dc50'))
    );
    if (matched) return matched;
  }

  // 4. Check in LocalStorage CMS products
  try {
    const saved = localStorage.getItem('sy_cms_products_v12');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      const matched = parsed.find(p => 
        p.id?.toLowerCase() === target ||
        p.name?.toLowerCase().includes(target)
      );
      if (matched) return matched;
    }
  } catch (e) {}

  return null;
}

/**
 * Parses current window.location.search into structured RouteState
 */
export function parseCurrentRoute(): RouteState {
  if (typeof window === 'undefined') {
    return { page: 'home' };
  }

  const params = new URLSearchParams(window.location.search);
  const rawPage = params.get('page');
  const rawTab = params.get('tab');
  const rawDetail = params.get('detail') || params.get('product');
  const rawModal = params.get('modal');
  const rawPurpose = params.get('purpose') as 'Commercial' | 'Residential' | 'ParkingLot' | null;
  const rawPower = params.get('power');
  const rawBrand = params.get('brand');
  const rawLegalTab = params.get('legalTab') as any;

  let page: ActivePage = 'home';
  let tab = rawTab || undefined;

  // 1. Evaluate tab query param (e.g. ?tab=biz, ?tab=home, ?tab=commercial, ?tab=parking)
  if (rawTab) {
    const t = rawTab.toLowerCase();
    if (t === 'home' || t === 'residential' || t === 'house' || t === 'sol_residential') {
      page = 'sol_residential';
      tab = 'home';
    } else if (t === 'biz' || t === 'commercial' || t === 'apt' || t === 'sol_commercial') {
      page = 'sol_commercial';
      tab = 'commercial';
    } else if (t === 'parking' || t === 'public' || t === 'sol_parking') {
      page = 'sol_parking';
      tab = 'parking';
    } else if (t === 'about') {
      page = 'about';
    } else if (t === 'products') {
      page = 'products';
    } else if (t === 'review' || t === 'reviews') {
      page = 'review';
    } else if (t === 'support' || t === 'faq') {
      page = 'support';
    } else if (t === 'cart') {
      page = 'cart';
    } else if (t === 'admin') {
      page = 'admin';
    } else if (t === 'mypage') {
      page = 'mypage';
    }
  }

  // 2. Evaluate explicit page query param (e.g. ?page=about, ?page=solutions)
  if (rawPage) {
    const p = rawPage.toLowerCase();
    if (p === 'solutions') {
      if (tab === 'commercial' || tab === 'biz' || tab === 'apt') {
        page = 'sol_commercial';
      } else if (tab === 'parking' || tab === 'public') {
        page = 'sol_parking';
      } else {
        page = 'sol_residential';
      }
    } else {
      const validPages: ActivePage[] = [
        'home', 'about', 'products', 'solutions', 'review', 'support',
        'sol_residential', 'sol_commercial', 'sol_parking', 'admin', 'cart', 'checkout', 'mypage'
      ];
      if (validPages.includes(rawPage as ActivePage)) {
        page = rawPage as ActivePage;
      }
    }
  }

  return {
    page,
    tab,
    detail: rawDetail || null,
    modal: rawModal || null,
    purpose: rawPurpose || undefined,
    power: rawPower || undefined,
    brand: rawBrand || undefined,
    legalTab: rawLegalTab || undefined,
  };
}

/**
 * Builds standard query string or pathname based on target RouteState
 */
export function buildRouteUrl(state: RouteState): string {
  const params = new URLSearchParams();

  if (state.page === 'sol_residential') {
    params.set('page', 'solutions');
    params.set('tab', 'home');
  } else if (state.page === 'sol_commercial') {
    params.set('page', 'solutions');
    params.set('tab', 'commercial');
  } else if (state.page === 'sol_parking') {
    params.set('page', 'solutions');
    params.set('tab', 'parking');
  } else if (state.page === 'solutions') {
    params.set('page', 'solutions');
    if (state.tab) params.set('tab', state.tab);
  } else if (state.page && state.page !== 'home') {
    params.set('page', state.page);
    if (state.tab) params.set('tab', state.tab);
  }

  if (state.detail) {
    params.set('detail', state.detail);
  }
  if (state.modal) {
    params.set('modal', state.modal);
  }
  if (state.purpose) {
    params.set('purpose', state.purpose);
  }
  if (state.power) {
    params.set('power', state.power);
  }
  if (state.brand) {
    params.set('brand', state.brand);
  }
  if (state.legalTab) {
    params.set('legalTab', state.legalTab);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : window.location.pathname;
}

/**
 * Safely updates browser history (pushState) with route state
 */
export function pushRoute(state: RouteState): void {
  if (typeof window === 'undefined') return;
  const url = buildRouteUrl(state);
  const currentUrl = window.location.pathname + window.location.search;
  if (url !== currentUrl) {
    window.history.pushState(state, '', url);
  }
}

/**
 * Safely replaces browser history (replaceState) with route state
 */
export function replaceRoute(state: RouteState): void {
  if (typeof window === 'undefined') return;
  const url = buildRouteUrl(state);
  window.history.replaceState(state, '', url);
}
