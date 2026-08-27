/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Zap, Check, ArrowRight, ShieldCheck, Flame, ExternalLink } from 'lucide-react';
import { PRODUCTS } from '../data';
import { HOME_PRODUCTS_DATA, PARKING_PRODUCTS_DATA } from './SolutionsSection';
import { ActivePage } from '../types';
import { searchAndRankProducts, SearchableItem } from '../lib/searchEngine';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageChange?: (page: ActivePage) => void;
  onSelectHomePower?: (power: string) => void;
  onSelectParkingCapacity?: (capacity: string) => void;
  onOpenQuoteWithPurpose?: (purpose: 'Commercial' | 'Residential' | 'ParkingLot') => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onPageChange,
  onSelectHomePower,
  onSelectParkingCapacity,
  onOpenQuoteWithPurpose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Combine all product sources into a unified list
  const allSearchableProducts = useMemo(() => {
    const list: Array<{
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
    }> = [];

    // 1. Standalone PRODUCTS from data.ts
    PRODUCTS.forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        power: p.power,
        category: p.detailCategory || p.type || '충전기',
        price: p.price,
        image: p.image,
        fallbackImage: '/스필.png',
        description: p.description,
        features: p.features,
        targetPage: 'products'
      });
    });

    // 2. HOME_PRODUCTS_DATA
    Object.entries(HOME_PRODUCTS_DATA).forEach(([powerKey, prods]) => {
      prods.forEach((hp: any) => {
        // avoid duplicates if already present
        if (!list.some(item => item.id === hp.id)) {
          list.push({
            id: hp.id,
            name: hp.name,
            power: hp.power || powerKey,
            category: `가정용 홈충전기 (${powerKey})`,
            price: hp.price,
            regularPrice: hp.regularPrice,
            discount: hp.discount,
            image: hp.image,
            fallbackImage: '/스필.png',
            description: hp.description,
            features: hp.features,
            tags: hp.tags,
            targetPage: 'sol_residential',
            powerParam: powerKey
          });
        }
      });
    });

    // 3. PARKING_PRODUCTS_DATA
    Object.entries(PARKING_PRODUCTS_DATA).forEach(([capacityKey, prods]) => {
      prods.forEach((pp: any) => {
        if (!list.some(item => item.id === pp.id)) {
          list.push({
            id: pp.id,
            name: pp.name,
            power: pp.power || capacityKey,
            category: `상업/주차장 충전기 (${capacityKey})`,
            price: pp.price,
            regularPrice: pp.regularPrice,
            discount: pp.discount,
            image: pp.image,
            fallbackImage: '/50kw-쿨차지.png',
            description: pp.description,
            features: pp.features,
            tags: pp.tags,
            targetPage: 'sol_parking',
            powerParam: capacityKey
          });
        }
      });
    });

    return list;
  }, []);

  // Filter and rank products based on search term with synonym and weighted matching
  const filteredProducts = useMemo(() => {
    return searchAndRankProducts(allSearchableProducts, searchTerm);
  }, [allSearchableProducts, searchTerm]);

  if (!isOpen) return null;

  const popularKeywords = [
    { label: '스필 7kW', query: '스필 7kw' },
    { label: '스필 11kW', query: '스필 11kw' },
    { label: '쿨차지', query: '쿨차지' },
    { label: '차지고', query: '차지고' },
    { label: '일렉트리', query: '일렉트리' },
    { label: '가정용 홈충전기', query: '가정용' },
    { label: '상업용 급속', query: '상업용 급속' },
    { label: '50kW 급속', query: '50kW' },
    { label: '화재예방 PLC', query: '화재' },
    { label: '무상 A/S 4년', query: '4년무상' },
  ];

  const handleSelectProduct = (product: typeof allSearchableProducts[0]) => {
    if (product.targetPage === 'sol_residential' && product.powerParam && onSelectHomePower) {
      onSelectHomePower(product.powerParam);
    }
    if (product.targetPage === 'sol_parking' && product.powerParam && onSelectParkingCapacity) {
      onSelectParkingCapacity(product.powerParam);
    }
    if (onPageChange) {
      onPageChange(product.targetPage);
    }
    onClose();

    // Scroll to products section after small delay
    setTimeout(() => {
      const el = document.getElementById(`product-card-${product.id}`) || document.getElementById('solutions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Search Modal Box */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[82vh]">
        {/* Header Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <Search className="w-6 h-6 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="충전기 모델명, 용량 (7kW, 11kW, 50kW), 브랜드, 화재예방 기능 검색..."
            className="w-full bg-transparent text-base sm:text-lg font-black text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-colors shrink-0"
          >
            닫기 [ESC]
          </button>
        </div>

        {/* Popular Keyword Chips */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <span className="text-[11px] font-black text-slate-400 shrink-0">추천 검색어:</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw.query}
              onClick={() => setSearchTerm(kw.query)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchTerm === kw.query
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60'
              }`}
            >
              {kw.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>
              {searchTerm ? `'${searchTerm}' 검색 결과` : '전체 추천 충전기 목록'} ({filteredProducts.length}건)
            </span>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-emerald-600 hover:underline">
                검색어 초기화
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-slate-700">검색어와 일치하는 충전기를 찾지 못했습니다.</p>
              <p className="text-xs text-slate-400 font-medium">
                '7kW', '11kW', '50kW', '화재예방' 등의 키워드로 다시 검색해 보세요.
              </p>
              {onOpenQuoteWithPurpose && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuoteWithPurpose('Residential');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-colors"
                >
                  <span>⚡ 1:1 맞춤 견적 문의하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="group bg-slate-50 hover:bg-emerald-50/70 p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all duration-200 cursor-pointer flex gap-3.5 items-center shadow-2xs hover:shadow-xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 shrink-0 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                        ⚡ {p.power}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 truncate">
                        {p.category}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {p.name}
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-black text-rose-600">
                        {p.price.toLocaleString()}원~
                      </span>
                      {p.regularPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-semibold">
                          {p.regularPrice.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-300">
            💡 어떤 충전기를 선택해야 할지 고민이신가요?
          </span>
          {onOpenQuoteWithPurpose && (
            <button
              onClick={() => {
                onClose();
                onOpenQuoteWithPurpose('Residential');
              }}
              className="px-3 py-1.5 bg-yellow-400 text-slate-950 font-black rounded-lg text-xs hover:bg-yellow-300 transition-colors"
            >
              무상 맞춤 견적 신청
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
