/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivePage = 'home' | 'about' | 'products' | 'solutions' | 'review' | 'support' | 'sol_residential' | 'sol_commercial' | 'sol_parking' | 'admin' | 'cart' | 'checkout' | 'mypage';

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'B2C' | 'B2B';
  phone?: string;
  profileImage?: string;
  businessNumber?: string;
  companyName?: string;
  isAdmin?: boolean;
  role?: 'admin' | 'user';
}

export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionGroup {
  id: string;
  title: string;
  required?: boolean;
  options: ProductOptionItem[];
}

export interface Product {
  id: string;
  name: string;
  type: '완속' | '급속' | '초급속' | '스마트홈' | '스탠드';
  power: string;
  features: string[];
  specs?: { [key: string]: string };
  image: string;
  images?: string[];
  description: string;
  plcSupported?: boolean;
  price?: number;
  originalPrice?: number;
  discountRate?: number;
  brand?: string;
  manufacturer?: string;
  origin?: string;
  modelName?: string;
  certNumber?: string;
  deliveryInfo?: string;
  componentsInfo?: string;
  rewardPointsInfo?: string;
  detailCategory?: '비공용완속' | '비공용중속' | '공용완속' | '급속' | '스탠드';
  serviceType?: string;
  replacementPrice?: number;
  replacementRegularPrice?: number;
  replacementDiscount?: number;
  installIncludedPrice?: number;
  installIncludedRegularPrice?: number;
  installIncludedDiscount?: number;
  optionGroups?: ProductOptionGroup[];
  deviceOptionGroups?: ProductOptionGroup[];
  replaceOptionGroups?: ProductOptionGroup[];
  installOptionGroups?: ProductOptionGroup[];
}

export interface SolutionProduct {
  id: string;
  name: string;
  description: string;
  regularPrice: number;
  price: number;
  discount: number;
  power?: string;
  type?: string;
  brand?: string;
  replacementPrice?: number;
  replacementRegularPrice?: number;
  replacementDiscount?: number;
  installIncludedPrice?: number;
  installIncludedRegularPrice?: number;
  installIncludedDiscount?: number;
  serviceType?: string;
  image: string;
  images?: string[];
  tags: string[];
  hasASBadge?: boolean;
  hasPromoRibbon?: boolean;
  summaryInfo?: string;
  deliveryMethod?: string;
  shippingFee?: string;
  paymentMethod?: string;
  optionLabel?: string;
  options?: { id: string; label: string; price: number }[];
  optionGroups?: ProductOptionGroup[];
  deviceOptionGroups?: ProductOptionGroup[];
  replaceOptionGroups?: ProductOptionGroup[];
  installOptionGroups?: ProductOptionGroup[];
}

export interface Solution {
  id: string;
  title: string;
  category: 'Commercial' | 'Residential' | 'ParkingLot';
  subtitle: string;
  description: string;
  target: string;
  recommendedPower: string;
  benefits: string[];
  subsidyProcess: string[];
  image: string;
  detailImageUrl?: string;
  blueprintImageUrl?: string;
  recommendedProducts?: string[];
  bannerMode?: 'cover' | 'unfold';
  detailMode?: 'scroll' | 'unfold';
}

export interface Review {
  id: string;
  title: string;
  location: string;
  category: 'Commercial' | 'Residential' | 'ParkingLot';
  date: string;
  rating: number;
  beforeImg: string;
  afterImg: string;
  author: string;
  interview: string;
  details: string;
  coordinates: { x: number; y: number }; // Percentage for interactive visual map
  blogUrl?: string;
  isBlogImported?: boolean;
  blogName?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Booking {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  location: string;
  address?: string;
  purpose: 'Commercial' | 'Residential' | 'ParkingLot';
  memo?: string;
  notes?: string;
  status: '접수대기' | '상담예약완료' | '시공설계중' | '시공완료';
  createdAt: string;
  estimateCost?: string;
  isRead?: boolean;
}

export interface ASRequest {
  id: string;
  userId: string;
  userName?: string;
  phone?: string;
  productName?: string;
  serialNumber?: string;
  symptom?: string;
  issueType?: string;
  locationAddress?: string;
  description?: string;
  date?: string;
  status: '접수완료' | '기사배정' | '처리완료';
  createdAt: string;
  isRead?: boolean;
}

export interface AdminNotification {
  id: string;
  type: 'booking' | 'consultation' | 'as' | 'order' | 'inquiry';
  title: string;
  customerName: string;
  customerPhone: string;
  location?: string;
  memo?: string;
  estimateCost?: string;
  purpose?: string;
  status?: string;
  createdAt: string;
  timestamp: number;
  isRead: boolean;
  targetId?: string;
}

export interface DailyVisitorRecord {
  date: string;
  uniqueVisitors: number;
  pageViews: number;
  mobileVisitors: number;
  desktopVisitors: number;
  inquiryConversions: number;
  hourlyDistribution: number[];
}

export interface VisitorLogEntry {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  page: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ip: string;
  referrer: string;
}

export interface VisitorAnalyticsData {
  todayUV: number;
  todayPV: number;
  yesterdayUV: number;
  yesterdayPV: number;
  thisMonthUV: number;
  totalAllTimeUV: number;
  totalAllTimePV: number;
  dailyRecords: DailyVisitorRecord[];
  recentLogs: VisitorLogEntry[];
  pagePopularity: { pageName: string; views: number; percentage: number }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  power: string;
  type: string;
  image: string;
  quantity: number;
  price?: number;
  selectedOptions?: { groupTitle: string; optionName: string; optionPrice: number }[];
  addedAt: string;
}

export interface HeaderConfig {
  inquiryTitlePc: string;
  shortcutCommercialPc: string;
  shortcutResidentialPc: string;
  shortcutParkingPc: string;
  inquiryTitleMobile: string;
  shortcutCommercialMobile: string;
  shortcutResidentialMobile: string;
  shortcutParkingMobile: string;
  syncMobileWithPc: boolean;
}

export interface MobileDesignConfig {
  // Hero & Background
  heroMobileHeight: number; // in px (e.g. 480)
  heroMobilePaddingY: number; // in px (e.g. 36)
  heroMobileTitleSize: 'sm' | 'md' | 'lg' | 'xl';
  heroMobileDescSize: 'sm' | 'md' | 'lg';
  heroMobileBgOverlay: number; // 0 to 90 %
  heroMobileBgPosition: 'center' | 'top' | 'bottom';
  
  // Header & Menu Bar
  headerMobileHeight: number; // in px (e.g. 64)
  headerMobileLogoHeight: number; // in px (e.g. 38)
  headerMobileMenuBtnSize: 'sm' | 'md' | 'lg' | 'xl';
  headerMobileFontSize: 'sm' | 'md' | 'lg';
  
  // Quick Floating SNS / Action Panel
  quickPanelDefaultCollapsed: boolean;
  quickPanelMobileSize: 'sm' | 'md' | 'lg';
  quickPanelPosition: 'right-bottom' | 'right-center' | 'right-top';
  
  // Layout & Cards
  mobileContentPadding: number; // in px (e.g. 16)
  mobileCardColumns: 1 | 2;
  mobileCardSpacing: number; // in px (e.g. 16)
  
  // Bottom Sticky Bar
  showMobileStickyBottom: boolean;
  mobileStickyBottomHeight: number; // in px (e.g. 60)
}

export const DEFAULT_MOBILE_DESIGN_CONFIG: MobileDesignConfig = {
  heroMobileHeight: 480,
  heroMobilePaddingY: 36,
  heroMobileTitleSize: 'md',
  heroMobileDescSize: 'sm',
  heroMobileBgOverlay: 55,
  heroMobileBgPosition: 'center',
  headerMobileHeight: 64,
  headerMobileLogoHeight: 36,
  headerMobileMenuBtnSize: 'lg',
  headerMobileFontSize: 'md',
  quickPanelDefaultCollapsed: true,
  quickPanelMobileSize: 'md',
  quickPanelPosition: 'right-bottom',
  mobileContentPadding: 16,
  mobileCardColumns: 1,
  mobileCardSpacing: 16,
  showMobileStickyBottom: true,
  mobileStickyBottomHeight: 60
};
