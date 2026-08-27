/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { Check, ShieldCheck, Cpu, Activity, ShoppingBag, Eye, Building2, Home, LayoutGrid, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';
import ProductDetailModal from './ProductDetailModal';

interface ProductsSectionProps {
  onOpenQuoteWithPurpose: (purpose: 'Commercial' | 'Residential' | 'ParkingLot', memoText?: string) => void;
  products: Product[];
  isEditMode?: boolean;
  onOpenCms?: (tab: 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support') => void;
  onAddToCart?: (product: Product, selectedOptions?: { groupTitle: string; optionName: string; optionPrice: number }[], totalPrice?: number) => void;
  onPageChange?: (page: any) => void;
  onOpenPayment?: (items: CartItem[]) => void;
  detailProduct?: Product | null;
  onSelectDetailProduct?: (product: Product | null) => void;
}

export const isResidentialProduct = (p: Product) => {
  const cat = p.detailCategory || '';
  const pwr = (p.power || '').toLowerCase().replace(/\s+/g, '');
  const type = (p.type || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  if (cat === '공용완속' || cat === '급속' || cat === '스탠드') return false;
  if (pwr.includes('biz') || pwr.includes('35kw') || pwr.includes('50kw') || pwr.includes('100kw') || pwr.includes('200kw')) return false;
  if (type.includes('급속') || type.includes('초급속')) return false;
  if (id.startsWith('park-') || id.startsWith('comm-') || id.startsWith('sy-dc') || id.startsWith('sy-fc') || id.startsWith('sy-biz') || id.startsWith('sy-stand')) return false;
  if ((name.includes('공용') && !name.includes('비공용') && !name.includes('개인용')) || name.includes('수익형') || name.includes('관공서') || name.includes('조달상품') || name.includes('초급속') || name.includes('주차장')) return false;

  return true;
};

export const isCommercialProduct = (p: Product) => !isResidentialProduct(p);

export default function ProductsSection({ 
  onOpenQuoteWithPurpose,
  products,
  isEditMode = false,
  onOpenCms,
  onAddToCart,
  onPageChange,
  onOpenPayment,
  detailProduct: detailProductProp,
  onSelectDetailProduct
}: ProductsSectionProps) {
  // Main Category Tab: 'residential' (아파트/가정용) vs 'commercial' (상업시설/공용) vs 'all' (전체)
  const [mainTab, setMainTab] = useState<'all' | 'residential' | 'commercial'>('all');
  const [subFilter, setSubFilter] = useState<string>('전체');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [internalDetailModalProduct, setInternalDetailModalProduct] = useState<Product | null>(null);

  const detailModalProduct = detailProductProp !== undefined ? detailProductProp : internalDetailModalProduct;

  const setDetailModalProduct = (prod: Product | null) => {
    if (onSelectDetailProduct) {
      onSelectDetailProduct(prod);
    } else {
      setInternalDetailModalProduct(prod);
    }
  };

  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const currentSelected = safeProducts.length > 0 
    ? (safeProducts.find(p => p && p.id === selectedProductId) || safeProducts[0]) 
    : null;

  const residentialProducts = safeProducts.filter(isResidentialProduct);
  const commercialProducts = safeProducts.filter(isCommercialProduct);

  const getPurposeByProductType = (type: string, isComm?: boolean) => {
    if (isComm) return 'Commercial';
    if (type === '스마트홈') return 'Residential';
    if (type === '완속') return 'Residential';
    if (type === '급속' || type === '초급속') return 'ParkingLot';
    return 'Residential';
  };

  const formatPrice = (price?: number) => {
    return price ? `${price.toLocaleString()}원` : '별도 견적 문의';
  };

  // Helper to choose color of the round power badge based on capacity
  const getPowerBadgeColor = (power: string) => {
    if (power.includes('7kW')) return 'bg-indigo-600';
    if (power.includes('11kW')) return 'bg-cyan-600';
    if (power.includes('35kW')) return 'bg-amber-600';
    if (power.includes('50kW')) return 'bg-teal-600';
    if (power.includes('200kW')) return 'bg-pink-600';
    return 'bg-slate-700';
  };

  // Sub-filter options based on mainTab
  const getSubFilterOptions = () => {
    if (mainTab === 'residential') {
      return [
        { key: '전체', label: '전체 가정용' },
        { key: '7kW', label: '7kW 완속' },
        { key: '11kW', label: '11kW 완속' },
        { key: '14kW', label: '14kW 중속' },
      ];
    }
    if (mainTab === 'commercial') {
      return [
        { key: '전체', label: '전체 상업용 (4종)' },
        { key: '7kW', label: '7kW BIZ' },
        { key: '11kW', label: '11kW BIZ' },
        { key: '35kW', label: '35kW 중속' },
        { key: '50kW', label: '50kW 급속' },
      ];
    }
    return [
      { key: '전체', label: '전체상품' },
      { key: '비공용완속', label: '비공용완속' },
      { key: '비공용중속', label: '비공용중속' },
      { key: '공용완속', label: '공용완속' },
      { key: '급속', label: '급속충전기' },
    ];
  };

  const filterProductList = (list: Product[]) => {
    if (subFilter === '전체') return list;
    return list.filter((p) => {
      if (mainTab === 'residential' || mainTab === 'commercial') {
        const pwr = (p.power || '').toLowerCase().replace(/\s+/g, '');
        const target = subFilter.toLowerCase().replace(/\s+/g, '');
        return pwr.includes(target) || (p.name && p.name.toLowerCase().includes(target));
      }
      return p.detailCategory === subFilter || (p.power && p.power.includes(subFilter));
    });
  };

  // Render individual product card
  const renderProductCard = (p: Product, isCommercial: boolean) => (
    <div
      key={p.id}
      onClick={() => setSelectedProductId(p.id)}
      id={`card-product-${p.id}`}
      className={`group rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between cursor-pointer bg-white ${
        currentSelected?.id === p.id
          ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/5'
          : 'border-slate-200 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div>
        {/* Product Image Box */}
        <div className="relative h-36 sm:h-56 bg-slate-50 overflow-hidden flex items-center justify-center p-2 sm:p-3">
          <img
            src={getOptimizedImageUrl(p.image, { width: 600, format: 'webp' })}
            alt={p.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Brand Logo / Category indicator - Top Right overlay */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col items-end gap-1">
            <span className={`font-black text-[9px] sm:text-[11px] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-2xs border flex items-center gap-1 tracking-tight ${
              isCommercial 
                ? 'bg-amber-500 text-white border-amber-600' 
                : 'bg-[#e8f321] text-slate-950 border-yellow-300'
            }`}>
              {isCommercial ? '🏬 상업용' : '🏠 가정용'}
            </span>
          </div>

          {/* Circular Power Badge - Overlaps Bottom Left corner */}
          <div className={`absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-8 h-8 sm:w-14 sm:h-14 flex flex-col items-center justify-center text-[9px] sm:text-xs text-white font-black rounded-full shadow-md backdrop-blur-xs ${getPowerBadgeColor(p.power)}`}>
            <span className="leading-none">{p.power}</span>
          </div>

          {p.plcSupported && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white font-extrabold text-[8px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1 shadow-2xs">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              PLC
            </span>
          )}
        </div>

        {/* Product Body */}
        <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-3">
          <h4 className="text-xs sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors break-words whitespace-normal leading-snug">
            {p.name}
          </h4>
          
          {/* Price Label */}
          <div className="pt-0.5 pb-0.5 space-y-0.5">
            {isCommercial ? (
              <div className="text-xs sm:text-lg font-black text-rose-600 flex items-baseline gap-1">
                <span>견적문의</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 sm:gap-2">
                  {p.originalPrice && (
                    <span className="text-[9px] sm:text-xs text-slate-400 font-bold line-through">
                      ₩{p.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {p.discountRate && (
                    <span className="text-[8px] sm:text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded-full">
                      {p.discountRate}% OFF
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-lg font-black text-slate-950 flex items-baseline gap-1">
                  <span>{formatPrice(p.price)}</span>
                  {p.price ? <span className="text-[9px] sm:text-xs text-slate-400 font-normal hidden sm:inline">(설치 포함)</span> : null}
                </div>
              </>
            )}
            <div className={`w-6 sm:w-8 h-0.5 mt-0.5 sm:mt-1 rounded-full ${isCommercial ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
          </div>

          <p className="text-[10px] sm:text-sm text-slate-500 leading-relaxed font-medium break-words whitespace-normal">
            {p.description}
          </p>

          {/* Features short-bullets on sm and up */}
          <div className="hidden sm:block pt-2 border-t border-slate-100 space-y-1.5">
            {p.features.slice(0, 2).map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="break-words whitespace-normal">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-2.5 sm:p-5 pt-0 mt-1 space-y-1.5 sm:space-y-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDetailModalProduct(p);
          }}
          className="w-full py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-black transition-all cursor-pointer border border-blue-200 flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          <span>상세보기</span>
        </button>

        <div className="flex gap-1 sm:gap-2">
          {isCommercial ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuoteWithPurpose('Commercial', `[상업시설/주차장] ${p.name} 무료 견적 문의`);
              }}
              id={`btn-product-quote-${p.id}`}
              className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            >
              견적요청
            </button>
          ) : (
            <>
              {onAddToCart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailModalProduct(p);
                  }}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-0.5 sm:gap-1 shrink-0"
                  title="옵션선택 및 담기"
                >
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="hidden sm:inline">담기</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQuoteWithPurpose(getPurposeByProductType(p.type, false), `[가정용/아파트] ${p.name} 무료 견적 문의`);
                }}
                id={`btn-product-quote-${p.id}`}
                className="w-full py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                견적요청
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 py-12 relative group/products">
      {isEditMode && onOpenCms && (
        <button
          onClick={() => onOpenCms('products')}
          className="absolute top-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          ✏️ 신제품 라인업 실시간 편집
        </button>
      )}

      {/* Promo banner highlighting high-tech features */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-4">
          <span className="text-blue-400 font-bold text-sm tracking-wider uppercase bg-blue-400/10 px-3 py-1.5 rounded-md border border-blue-400/20">
            SY.com EXCLUSIVE SAFETY TECH
          </span>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            화재 감지 알람 및 차세대 PLC 모뎀 기본 탑재! <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">아파트·가정용 & 상업시설 맞춤 충전 라인업</span>
          </h3>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-2xl font-bold">
            전기자동차 충전 중 발생하는 과열 및 과충전 트러블을 실시간 감시하는 PLC 모뎀을 장착하여, 가정집부터 대형 상업 주차장까지 화재 우려 없는 100% 안심 환경을 제공합니다.
          </p>
        </div>

        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 md:flex-initial text-center min-w-[140px]">
            <Cpu className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <span className="text-xs text-slate-400 block font-bold">화재예방 인증</span>
            <span className="text-sm font-black text-white block mt-0.5">PLC 모뎀 탑재</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 md:flex-initial text-center min-w-[140px]">
            <Activity className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs text-slate-400 block font-bold">스마트 부하제어</span>
            <span className="text-sm font-black text-white block mt-0.5">전력 자동 조절</span>
          </div>
        </div>
      </section>

      {/* Main Category Selector (Segmented Control: 아파트/가정용 vs 상업시설 vs 전체) */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-2 max-w-2xl w-full">
            <button
              onClick={() => { setMainTab('residential'); setSubFilter('전체'); }}
              id="btn-tab-residential"
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'residential'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 아파트 · 가정용 ({residentialProducts.length})</span>
            </button>

            <button
              onClick={() => { setMainTab('commercial'); setSubFilter('전체'); }}
              id="btn-tab-commercial"
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'commercial'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏬 상업시설 · 공용 (4종)</span>
            </button>

            <button
              onClick={() => { setMainTab('all'); setSubFilter('전체'); }}
              id="btn-tab-all"
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>📦 전체보기 ({safeProducts.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-filter chips */}
        <div className="flex flex-wrap gap-2 justify-center items-center pt-1">
          {getSubFilterOptions().map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubFilter(tab.key)}
              id={`btn-subfilter-${tab.key}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
                subFilter === tab.key
                  ? mainTab === 'commercial' 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display Area */}
      {mainTab === 'all' && subFilter === '전체' ? (
        // Divided Sections when in "All" view
        <div className="space-y-12">
          {/* 1. Apartment / Residential Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-blue-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                  <Home className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900">🏠 아파트 · 단독주택 가정용 충전기</h3>
                  <p className="text-xs text-slate-500 font-bold">개인 전용 완속/중속 충전기 (단말기 단품 구매 및 신규설치 가능)</p>
                </div>
              </div>
              <button 
                onClick={() => { setMainTab('residential'); setSubFilter('전체'); }}
                className="text-xs font-black text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
              >
                가정용만 모아보기 &gt;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {residentialProducts.map((p) => renderProductCard(p, false))}
            </div>
          </div>

          {/* 2. Commercial / Business Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                  <Building2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900">🏬 상업시설 · 주차장 공용 BIZ 충전기 (4종)</h3>
                  <p className="text-xs text-slate-500 font-bold">수익형 매장, 상가, 빌딩, 관공서 주차장 전용 공용완속/중속/급속 라인업</p>
                </div>
              </div>
              <button 
                onClick={() => { setMainTab('commercial'); setSubFilter('전체'); }}
                className="text-xs font-black text-amber-600 hover:text-amber-800 cursor-pointer flex items-center gap-1"
              >
                상업시설만 모아보기 &gt;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {commercialProducts.map((p) => renderProductCard(p, true))}
            </div>
          </div>
        </div>
      ) : (
        // Filtered Grid Display
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filterProductList(
            mainTab === 'residential' 
              ? residentialProducts 
              : mainTab === 'commercial' 
                ? commercialProducts 
                : safeProducts
          ).map((p) => renderProductCard(p, isCommercialProduct(p)))}
        </div>
      )}

      {/* Product Detail & Option Selector Modal */}
      <ProductDetailModal
        product={detailModalProduct}
        isOpen={!!detailModalProduct}
        onClose={() => setDetailModalProduct(null)}
        onAddToCart={onAddToCart}
        onOpenQuoteWithPurpose={onOpenQuoteWithPurpose}
        onOpenPayment={onOpenPayment}
      />
    </div>
  );
}

