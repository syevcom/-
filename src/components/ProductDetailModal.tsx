/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { X, Share2, Heart, Star, Check, ShoppingBag, ShieldCheck, ChevronRight, ChevronLeft, Plus, FileText, Info } from 'lucide-react';
import { Product, CartItem, ProductOptionGroup } from '../types';
import { DEFAULT_RESIDENTIAL_OPTION_GROUPS, PUBLIC_CHARGER_OPTION_GROUPS, DEVICE_ONLY_OPTION_GROUPS, REPLACEMENT_OPTION_GROUPS, INSTALLATION_OPTION_GROUPS } from '../data';
import { resolveDetailData, loadUnifiedProductDetails, DEFAULT_PRODUCT_DETAILS, ProductDetailItem } from '../lib/detailPagesData';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';
import PdfImageRenderer from './PdfImageRenderer';
import DetailPageImage from './DetailPageImage';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, selectedOptions?: { groupTitle: string; optionName: string; optionPrice: number }[], totalPrice?: number) => void;
  onOpenQuoteWithPurpose?: (purpose: 'Commercial' | 'Residential' | 'ParkingLot', memoText?: string) => void;
  onSelectCategoryQuick?: (typeOrKw: string) => void;
  onOpenPayment?: (items: CartItem[]) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenQuoteWithPurpose,
  onSelectCategoryQuick,
  onOpenPayment
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  // Selected option state: map of optionGroupId -> optionItemId
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string>>({});
  const [selectedOptionQuantities, setSelectedOptionQuantities] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState(false);

  const [selectedDisplayImage, setSelectedDisplayImage] = useState<string>(product?.image || '');
  const [unifiedDetailsMap, setUnifiedDetailsMap] = useState<Record<string, ProductDetailItem>>(() => {
    const base: Record<string, ProductDetailItem> = { ...DEFAULT_PRODUCT_DETAILS };
    try {
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('sy_cms_product_details') : null;
      if (localStr) {
        const parsed = JSON.parse(localStr);
        return { ...base, ...parsed };
      }
    } catch (e) {}
    return base;
  });

  // Load merged product details
  useEffect(() => {
    let isMounted = true;
    loadUnifiedProductDetails().then((data) => {
      if (isMounted) {
        setUnifiedDetailsMap(data);
      }
    });

    const handleSync = () => {
      loadUnifiedProductDetails().then((data) => {
        if (isMounted) {
          setUnifiedDetailsMap(data);
        }
      });
    };

    window.addEventListener('sy_cms_product_details_update', handleSync);
    window.addEventListener('sy_cms_data_sync_completed', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('sy_cms_product_details_update', handleSync);
      window.removeEventListener('sy_cms_data_sync_completed', handleSync);
    };
  }, []);

  const resolvedDetail = useMemo(() => {
    if (!product) return {};
    return resolveDetailData(product, unifiedDetailsMap);
  }, [product, unifiedDetailsMap]);

  useEffect(() => {
    if (product) {
      setSelectedDisplayImage(product.image || '');
    }
  }, [product?.id, product?.image]);

  const getProductOptionGroups = (p: Product) => {
    const cat = p.detailCategory || '';
    const name = p.name || '';
    const id = p.id || '';
    const type = p.type || '';

    const isResidential =
      (cat as string) === '비공용완속' ||
      (cat as string) === '비공용중속' ||
      (cat as string) === '가정용' ||
      id.startsWith('res-') ||
      id.startsWith('sy-ac') ||
      id.startsWith('home-') ||
      name.includes('개인용') ||
      name.includes('가정용') ||
      name.includes('홈') ||
      name.includes('비공용');

    const isPublic = !isResidential && (
      cat === '공용완속' ||
      cat === '급속' ||
      type === '급속' ||
      type === '초급속' ||
      (name.includes('공용') && !name.includes('개인용') && !name.includes('가정용')) ||
      name.includes('수익형') ||
      name.includes('관공서') ||
      name.includes('조달상품') ||
      id.startsWith('park-') ||
      id.startsWith('comm-') ||
      id.startsWith('sol-comm') ||
      id.startsWith('sol-park')
    );

    if (isPublic) {
      if (p.optionGroups && p.optionGroups.length === 1) return p.optionGroups;
      return PUBLIC_CHARGER_OPTION_GROUPS;
    }

    const st = p.serviceType || 'device';
    if (st === 'device' || st === '단말기 단품') {
      if (p.deviceOptionGroups && p.deviceOptionGroups.length > 0) return p.deviceOptionGroups;
      if (p.optionGroups && p.optionGroups.length > 0) return p.optionGroups;
      return DEVICE_ONLY_OPTION_GROUPS;
    }
    if (st === 'replace' || st === '교체 시공') {
      if (p.replaceOptionGroups && p.replaceOptionGroups.length > 0) return p.replaceOptionGroups;
      return REPLACEMENT_OPTION_GROUPS;
    }
    if (st === 'install' || st === '신규 설치 포함') {
      if (p.installOptionGroups && p.installOptionGroups.length > 0) return p.installOptionGroups;
      return INSTALLATION_OPTION_GROUPS;
    }

    return p.optionGroups && p.optionGroups.length > 0 ? p.optionGroups : DEFAULT_RESIDENTIAL_OPTION_GROUPS;
  };

  // Dynamic additional option groups state
  const [activeOptionGroups, setActiveOptionGroups] = useState<ProductOptionGroup[]>(() => {
    if (!product) return DEFAULT_RESIDENTIAL_OPTION_GROUPS;
    return getProductOptionGroups(product);
  });

  useEffect(() => {
    if (product) {
      setActiveOptionGroups(getProductOptionGroups(product));
    }
  }, [product]);

  // State for adding a new custom option group
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newOpt1Name, setNewOpt1Name] = useState('');
  const [newOpt1Price, setNewOpt1Price] = useState(0);

  const handleAddNewOptionGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    const newGrp: ProductOptionGroup = {
      id: `custom-grp-${Date.now()}`,
      title: newGroupTitle.trim(),
      required: false,
      options: [
        { id: `opt-none-${Date.now()}`, name: '선택 안함', price: 0 }
      ]
    };

    if (newOpt1Name.trim()) {
      newGrp.options.push({
        id: `opt-1-${Date.now()}`,
        name: `${newOpt1Name.trim()}${newOpt1Price > 0 ? ` (+${newOpt1Price.toLocaleString()}원)` : ''}`,
        price: Number(newOpt1Price)
      });
    }

    setActiveOptionGroups((prev) => [...prev, newGrp]);
    setIsAddingGroup(false);
    setNewGroupTitle('');
    setNewOpt1Name('');
    setNewOpt1Price(0);
  };

  const primaryOptionGroup = activeOptionGroups[0];
  const secondaryOptionGroups = activeOptionGroups.slice(1);

  const isCommercial = useMemo(() => {
    if (!product) return false;
    const cat = product.detailCategory || '';
    const name = product.name || '';
    const id = product.id || '';
    const type = product.type || '';

    // Explicit residential checks
    if (
      (cat as string) === '비공용완속' ||
      (cat as string) === '비공용중속' ||
      (cat as string) === '가정용' ||
      id.startsWith('res-') ||
      id.startsWith('sy-ac') ||
      id.startsWith('home-') ||
      name.includes('개인용') ||
      name.includes('가정용') ||
      name.includes('홈') ||
      name.includes('비공용')
    ) {
      return false;
    }

    const isPublicCat = cat === '공용완속' || cat === '급속';
    const isQuickType = type === '급속' || type === '초급속';
    const isCommName =
      name.includes('수익형') ||
      name.includes('상업') ||
      name.includes('관공서') ||
      name.includes('조달상품') ||
      (name.includes('공용') && !name.includes('비공용') && !name.includes('개인용') && !name.includes('가정용'));
    const isParkId =
      id.startsWith('park-') ||
      id.startsWith('comm-') ||
      id.startsWith('sol-comm') ||
      id.startsWith('sol-park') ||
      id.startsWith('sy-dc') ||
      id.startsWith('sy-fc') ||
      id.startsWith('sy-biz');

    return isPublicCat || isQuickType || isCommName || isParkId;
  }, [product]);

  // Default value fallbacks matching user screenshots
  const brandName = product.brand || (isCommercial ? '쿨차지' : '스필');
  const manufacturer = product.manufacturer || '스필일렉트릭';
  const origin = product.origin || '대한민국';
  const modelName = product.modelName || 'DO-EVC-SEC7-C/K';
  const certNumber = product.certNumber || 'XD070158-25001A';
  const deliveryInfo = product.deliveryInfo || '직접배송(주문 시 결제)\n무료배송';
  const componentsInfo = product.componentsInfo || '제조사 별도 발송 / 설치비 미포함 상품';
  const rewardPointsInfo = product.rewardPointsInfo || (isCommercial ? '구매 견적문의(전화문의)' : '구매 ₩0');
  const descriptionTag = product.description || '[국내최초 무상A/S 4년] 가정용충전기,공장용충전기,회사용충전기,창고용충전기';

  const basePrice = product.price || 598000;
  const originalPrice = product.originalPrice || (product.price ? Math.round(product.price * 1.1) : 660000);
  const discountRate = product.discountRate || (originalPrice > basePrice ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 10);

  // Calculate sum of selected option prices
  const selectedOptionDetails = useMemo(() => {
    if (!activeOptionGroups) return [];
    const result: { groupTitle: string; optionName: string; optionPrice: number; groupId: string }[] = [];

    activeOptionGroups.forEach((grp) => {
      const selectedItemId = selectedOptionsMap[grp.id];
      if (selectedItemId) {
        const item = grp.options.find((o) => o.id === selectedItemId);
        if (item && item.name !== '선택 안함') {
          result.push({
            groupId: grp.id,
            groupTitle: grp.title,
            optionName: item.name,
            optionPrice: item.price
          });
        }
      }
    });

    return result;
  }, [activeOptionGroups, selectedOptionsMap]);

  const optionsTotalPrice = useMemo(() => {
    return selectedOptionDetails.reduce((sum, opt) => sum + opt.optionPrice, 0);
  }, [selectedOptionDetails]);

  const handleOptionChange = (groupId: string, optionItemId: string) => {
    setSelectedOptionsMap((prev) => ({
      ...prev,
      [groupId]: optionItemId
    }));
    if (optionItemId) {
      setSelectedOptionQuantities((prev) => ({ ...prev, [groupId]: 1 }));
    } else {
      setSelectedOptionQuantities((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    }
  };

  const handleRemoveSelectedOption = (groupId: string) => {
    setSelectedOptionsMap((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
    setSelectedOptionQuantities((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  const handleOptionQtyChange = (groupId: string, delta: number) => {
    setSelectedOptionQuantities((prev) => ({
      ...prev,
      [groupId]: Math.max(1, (prev[groupId] || 1) + delta)
    }));
  };

  const selectedOptionBoxes = useMemo(() => {
    if (!activeOptionGroups) return [];
    const boxes: {
      groupId: string;
      groupTitle: string;
      optionName: string;
      optionPrice: number;
      quantity: number;
      totalPrice: number;
      isPrimary: boolean;
    }[] = [];

    activeOptionGroups.forEach((grp, idx) => {
      const selectedOptId = selectedOptionsMap[grp.id];
      if (!selectedOptId) return;

      const opt = grp.options.find((o) => o.id === selectedOptId);
      if (!opt || opt.name === '선택 안함') return;

      const isPrimary = idx === 0;
      const qty = selectedOptionQuantities[grp.id] || 1;
      const unitPrice = isPrimary ? (basePrice + opt.price) : opt.price;
      const boxTotal = unitPrice * qty;

      boxes.push({
        groupId: grp.id,
        groupTitle: grp.title,
        optionName: opt.name,
        optionPrice: opt.price,
        quantity: qty,
        totalPrice: boxTotal,
        isPrimary
      });
    });

    return boxes;
  }, [activeOptionGroups, selectedOptionsMap, selectedOptionQuantities, basePrice]);

  const modalTotalPrice = selectedOptionBoxes.length > 0
    ? selectedOptionBoxes.reduce((sum, b) => sum + b.totalPrice, 0)
    : (basePrice + optionsTotalPrice) * quantity;

  const totalPrice = modalTotalPrice;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(
        product,
        selectedOptionDetails.map(o => ({ groupTitle: o.groupTitle, optionName: o.optionName, optionPrice: o.optionPrice })),
        totalPrice
      );
      setAddedSuccessMsg(true);
      setTimeout(() => setAddedSuccessMsg(false), 2500);
    }
  };

  const handleBuyNow = () => {
    if (onOpenPayment && product) {
      const buyNowItem = {
        id: `buy-${Date.now()}`,
        productId: product.id,
        name: product.name,
        power: product.power,
        type: product.type,
        image: product.image,
        quantity: quantity,
        price: totalPrice / quantity,
        selectedOptions: selectedOptionDetails.map(o => ({ groupTitle: o.groupTitle, optionName: o.optionName, optionPrice: o.optionPrice })),
        addedAt: new Date().toISOString()
      };
      onClose();
      onOpenPayment([buyNowItem]);
    } else {
      handleRequestQuote();
    }
  };

  const handleRequestQuote = () => {
    const purpose = product.type === '스마트홈' || product.type === '완속' ? 'Residential' : 'Commercial';
    let memo = `[상품] ${product.name}\n[수량] ${quantity}개\n[총금액] ${totalPrice.toLocaleString()}원`;
    if (selectedOptionDetails.length > 0) {
      memo += `\n[선택 옵션]:\n` + selectedOptionDetails.map(o => `- ${o.groupTitle}: ${o.optionName}`).join('\n');
    }
    if (onOpenQuoteWithPurpose) {
      onOpenQuoteWithPurpose(purpose, memo);
    }
    onClose();
  };

  const handleQuickNav = (catOrKw: string) => {
    onClose();
    if (onSelectCategoryQuick) {
      onSelectCategoryQuick(catOrKw);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-auto min-h-screen sm:min-h-0 border-0 sm:border border-slate-200">
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer shadow-xs"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-7 md:p-8 space-y-6 max-h-screen sm:max-h-[88vh] overflow-y-auto">
          
          {/* Top Breadcrumb & Category Quick Bar (Screenshot 1 top right: 홈 / 가정용 홈 충전기) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 pr-10">
            <button
              onClick={() => handleQuickNav('sol_residential')}
              className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>홈</span>
              <span className="text-slate-300">/</span>
              <span className="font-extrabold text-slate-800 underline underline-offset-2">가정용 홈 충전기</span>
            </button>

            {/* Quick Filter Buttons to switch back directly */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">빠른이동:</span>
              {[
                { id: '교체 시공', label: '🛠️ 교체시공' },
                { id: '11kW', label: '⚡ 11kW' },
                { id: '7kW', label: '⚡ 7kW' },
                { id: '5kW', label: '⚡ 5kW' },
                { id: '단말기 단품', label: '📦 단품' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleQuickNav(btn.id)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-[11px] font-black transition-all cursor-pointer whitespace-nowrap"
                  title={`${btn.label} (으)로 이동`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top Title & Subtitle matching Screenshot 1 */}
          <div className="space-y-3 border-b border-slate-100 pb-4 pr-8 sm:pr-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug break-words whitespace-normal">
              {product.name}
            </h2>
            <div className="text-xs sm:text-sm text-slate-500 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="break-words whitespace-normal leading-relaxed text-slate-600 font-medium">{descriptionTag}</span>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button 
                  onClick={() => alert('상품 링크가 복사되었습니다!')} 
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs font-bold"
                >
                  <Share2 className="w-4 h-4" />
                  <span>공유</span>
                </button>
                <button 
                  onClick={() => setIsLiked(!isLiked)} 
                  className={`flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold ${isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                  <span>찜</span>
                </button>
              </div>
            </div>

            {/* Mobile & Desktop Quick Jump Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 border-t border-slate-100 pt-2.5 [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('detail-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>상세 카탈로그</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const specsEl = document.getElementById('detail-specs-section');
                  if (specsEl) {
                    specsEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    document.getElementById('detail-catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <Info className="w-3.5 h-3.5" />
                <span>제원 사양표</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('detail-option-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>옵션/구매</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('detail-delivery-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>4년 A/S & 시공</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* Left: Product Image & Badges */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                <DetailPageImage
                  src={selectedDisplayImage || product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
                
                {product.plcSupported && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PLC 화재예방 모뎀
                  </span>
                )}

                <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 font-black text-xs px-2.5 py-1 rounded-md">
                  {product.power}
                </span>
              </div>

              {/* Dynamic Gallery Thumbnails */}
              {product.images && product.images.length > 0 && (() => {
                const gallery = product.images;
                const activeUrl = selectedDisplayImage || product.image;
                const currIdx = Math.max(0, gallery.findIndex(url => url === activeUrl));

                const handlePrevModalImg = () => {
                  const pIdx = (currIdx - 1 + gallery.length) % gallery.length;
                  setSelectedDisplayImage(gallery[pIdx]);
                };

                const handleNextModalImg = () => {
                  const nIdx = (currIdx + 1) % gallery.length;
                  setSelectedDisplayImage(gallery[nIdx]);
                };

                return (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handlePrevModalImg}
                      className="w-8 h-12 border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="이전 사진"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-800" />
                    </button>

                    <div className="flex items-center gap-2 overflow-x-auto py-1 flex-1 [&::-webkit-scrollbar]:hidden">
                      {gallery.map((imgUrl, idx) => {
                        const isCurrentlyActive = activeUrl === imgUrl;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedDisplayImage(imgUrl)}
                            className={`w-12 h-12 flex items-center justify-center p-1 bg-white cursor-pointer transition-all shrink-0 ${
                              isCurrentlyActive ? 'border-2 border-slate-900 shadow-2xs' : 'border border-slate-300 hover:border-slate-500'
                            }`}
                            title="클릭하여 이미지 크게 보기"
                          >
                            <DetailPageImage 
                              src={getOptimizedImageUrl(imgUrl, { width: 120, format: 'webp' })} 
                              alt={`gallery thumbnail ${idx + 1}`} 
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain" 
                            />
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextModalImg}
                      className="w-8 h-12 border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="다음 사진"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-800" />
                    </button>
                  </div>
                );
              })()}

              {/* Highlighting bullets */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-black text-slate-700">핵심 시공 특장점</div>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 font-bold">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pricing & Meta Detail Table (Screenshot 1 Layout) */}
            <div className="md:col-span-7 space-y-5">
              
              {/* Pricing Display */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                {(() => {
                  if (isCommercial) {
                    return (
                      <div className="space-y-0.5">
                        <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
                          별도문의
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-400 line-through">
                          ₩{originalPrice.toLocaleString()}
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                          ₩{basePrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Circular Discount Rate Badge matching screenshot 1 */}
                      {discountRate > 0 && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md border border-slate-800">
                          {discountRate}%
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Metadata Details Table matching screenshot 1 & user commercial screenshot */}
              {isCommercial ? (
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">적립혜택</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal leading-relaxed">
                      구매 <span className="text-blue-600 font-black">별도문의 (상담 시 안내)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">배송</span>
                    <div className="col-span-8 sm:col-span-9 space-y-0.5 break-words whitespace-normal leading-relaxed">
                      <div className="font-extrabold text-slate-800">직접배송(주문 시 결제)</div>
                      <div className="text-slate-500 font-bold text-xs">무료배송 / 본사 직영 시공</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">상품정보</span>
                    <span className="col-span-8 sm:col-span-9 text-slate-600 font-medium flex items-center gap-1 cursor-pointer hover:text-slate-900 break-words whitespace-normal">
                      하단 공식 사양서 및 카탈로그 참조 <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">브랜드</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{brandName}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">청약철회</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal leading-relaxed">
                      전자상거래법 제17조 준수 (배송/착공 전 7일 이내 무상취소 가능)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">적립혜택</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal leading-relaxed">{rewardPointsInfo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">배송</span>
                    <div className="col-span-8 sm:col-span-9 space-y-0.5 break-words whitespace-normal leading-relaxed">
                      <div className="font-extrabold text-slate-800">{deliveryInfo}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">상품정보</span>
                    <span className="col-span-8 sm:col-span-9 text-slate-600 font-medium flex items-center gap-1 cursor-pointer hover:text-slate-900 break-words whitespace-normal">
                      하단 공식 사양서 및 카탈로그 참조 <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">상품후기</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 flex flex-wrap items-center gap-1">
                      <span>1명</span>
                      <span className="flex text-amber-400">
                        {'★'.repeat(5)}
                      </span>
                      <span className="text-slate-500 font-bold text-xs">(5/5 만점 리뷰)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">브랜드</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{brandName}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">구성품</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal leading-relaxed">{componentsInfo}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">원산지</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{origin}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">제조사</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{manufacturer}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-100 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">모델명</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{modelName}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 py-1.5 items-start">
                    <span className="col-span-4 sm:col-span-3 text-slate-400 font-bold shrink-0">인증번호</span>
                    <span className="col-span-8 sm:col-span-9 font-extrabold text-slate-800 break-words whitespace-normal">{certNumber}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Options Selection Section matching Screenshot 2 */}
          <div id="detail-option-section" className="pt-4 border-t border-slate-200 space-y-4 scroll-mt-6">
            
            {/* 1. 상품옵션 (Primary Option) */}
            {primaryOptionGroup && (
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-3 text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
                  {primaryOptionGroup.title}
                </label>
                <div className="col-span-9">
                  <select
                    value={selectedOptionsMap[primaryOptionGroup.id] || ''}
                    onChange={(e) => handleOptionChange(primaryOptionGroup.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                  >
                    <option value="">- [필수] 옵션을 선택해 주세요 -</option>
                    {primaryOptionGroup.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name.includes('(') ? opt.name : `${opt.name}${opt.price > 0 ? ` (+${opt.price.toLocaleString()}원)` : ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 2. 추가구성 (Secondary Option Groups) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-900 tracking-wide">
                  추가구성 ({secondaryOptionGroups.length}개 항목)
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingGroup(!isAddingGroup)}
                  className="text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>옵션 추가하기</span>
                </button>
              </div>

              {/* Add New Option Group Inline Form */}
              {isAddingGroup && (
                <form onSubmit={handleAddNewOptionGroup} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 animate-fadeIn">
                  <span className="text-xs font-black text-emerald-950 block">➕ 새 추가구성 옵션 그룹 만들기</span>
                  <div>
                    <input
                      type="text"
                      placeholder="예: 보조케이블 5M / 스탠드높이 연장 / 접지봉"
                      value={newGroupTitle}
                      onChange={(e) => setNewGroupTitle(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="옵션명 (예: 연장케이블 포함)"
                      value={newOpt1Name}
                      onChange={(e) => setNewOpt1Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="number"
                      placeholder="추가금액 (원)"
                      value={newOpt1Price || ''}
                      onChange={(e) => setNewOpt1Price(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingGroup(false)}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white cursor-pointer shadow-xs"
                    >
                      옵션 저장하기
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {secondaryOptionGroups.map((grp) => (
                  <div key={grp.id}>
                    <select
                      value={selectedOptionsMap[grp.id] || ''}
                      onChange={(e) => handleOptionChange(grp.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                    >
                      <option value="">- {grp.title} -</option>
                      {grp.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Options List Box (Matches screenshot) */}
            {selectedOptionBoxes.length > 0 ? (
              <div className="space-y-2.5 pt-2">
                {selectedOptionBoxes.map((box) => (
                  <div key={box.groupId} className="bg-[#f9f9f9] border border-[#e5e5e5] p-3.5 sm:p-4 space-y-3 font-sans">
                    <div className="text-xs sm:text-sm font-medium text-slate-800">
                      {box.groupTitle} : <span className="font-bold text-slate-900">{box.optionName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Stepper */}
                      <div className="inline-flex items-center border border-[#d9d9d9] bg-white">
                        <button
                          type="button"
                          onClick={() => handleOptionQtyChange(box.groupId, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold select-none border-r border-[#d9d9d9] cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <span className="w-9 sm:w-10 text-center font-bold text-xs sm:text-sm text-slate-900">
                          {box.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOptionQtyChange(box.groupId, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 font-bold select-none border-l border-[#d9d9d9] cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          ₩{box.totalPrice.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedOption(box.groupId)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#d9d9d9] bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer text-xs font-bold"
                          title="옵션 삭제"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback Quantity Selector */
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-black text-slate-900">수량</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base transition-colors cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="px-5 py-1.5 font-black text-slate-950 text-sm sm:text-base min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base transition-colors cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    (최소주문수량 1개 이상)
                  </span>
                </div>
              </div>
            )}

            {/* Total Price Section matching Screenshot bottom right */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-500">
                총 {selectedOptionBoxes.length > 0 ? selectedOptionBoxes.reduce((s, b) => s + b.quantity, 0) : quantity}개
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-slate-900">총 상품금액</span>
                {isCommercial ? (
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                    견적문의(전화문의)
                  </span>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    ₩{totalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Feedback notification when added to cart */}
            {addedSuccessMsg && (
              <div className="p-3 bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl text-center shadow-md animate-bounce">
                ✅ 장바구니에 상품과 옵션이 성공적으로 담겼습니다!
              </div>
            )}

            {/* Actions Bar */}
            {isCommercial ? (
              <div className="pt-2">
                <button
                  onClick={handleRequestQuote}
                  className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20 active:scale-98"
                >
                  <span>📋 온라인 견적서 신청</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-4 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>장바구니 담기</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-98"
                >
                  <span>⚡ 바로 구매 / 결제</span>
                </button>

                <button
                  onClick={handleRequestQuote}
                  className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20 active:scale-98"
                >
                  <span>📋 무료 견적 문의</span>
                </button>
              </div>
            )}

          </div>

          {/* Detailed Product Specifications & High-Resolution Catalog Brochure */}
          <div id="detail-catalog-section" className="pt-8 border-t-2 border-slate-900/10 space-y-6">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  상품 공식 상세페이지 및 제원 사양서
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {product.power ? `${product.power} 고효율 안심 충전 라인업` : '환경부/한전 표준 규격'}
              </span>
            </div>

            {/* Detailed Spec Table */}
            {resolvedDetail.specs && Object.keys(resolvedDetail.specs).length > 0 && (
              <div id="detail-specs-section" className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>공식 상세 제원표 (Specification)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {Object.entries(resolvedDetail.specs).map(([specKey, specVal]) => (
                    <div key={specKey} className="bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-400">{specKey}</span>
                      <span className="font-extrabold text-slate-800 break-words whitespace-normal mt-0.5 leading-snug">{specVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail Catalog & Multi-page PDF/Images Renderer */}
            {(() => {
              const detailUrls = (resolvedDetail.pdfUrls && resolvedDetail.pdfUrls.length > 0)
                ? resolvedDetail.pdfUrls
                : (resolvedDetail.pdfUrl ? [resolvedDetail.pdfUrl] : []);
              const detailNames = resolvedDetail.pdfNames || [];

              if (detailUrls.length === 0) {
                return (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-black text-slate-700">등록된 공식 상세페이지 이미지가 없습니다.</p>
                    <p className="text-xs text-slate-400 font-medium">관리자(CMS) 모드에서 상세페이지 이미지 및 브로셔 PDF를 등록하실 수 있습니다.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4 w-full max-w-[860px] mx-auto">
                  {detailUrls.map((url, idx) => (
                    <div key={idx} className="w-full max-w-[860px] mx-auto rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-none sm:shadow-sm bg-white">
                      <PdfImageRenderer
                        fileUrl={url}
                        fileName={detailNames[idx] || `${product.name} 상세페이지 이미지 ${idx + 1}`}
                        brandName={product.name}
                        isAdmin={false}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Delivery, Warranty & Installation Guide Section */}
            <div id="detail-delivery-section" className="pt-6 space-y-4">
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm sm:text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>에스와이 4년 무상 A/S 보증 및 전문 설치 안내</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>4년 무상 품질보증 A/S</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      에스와이에서 구매 및 시공된 모든 충전기는 4년간 무상 품질보증을 지원하며, 24시간 긴급 A/S 접수 및 직영 기술팀의 신속한 현장 점검 서비스를 제공합니다.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>한전 불입금 & 인입 공사 안내</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      전기차 충전기 신규 설치 시 한국전력공사 계량기 신설(한전불입금) 및 전기 안전검사 대행 업무를 원스톱으로 지원해 드립니다.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>전국 직영 전문 시공</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      국가공인 전기공사업 면허 보유 직영 시공팀이 방문하여 누전차단기 규격 검토, 케이블 포설, 접지공사까지 안전 기준을 완벽하게 준수합니다.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>교환 및 반품 규정</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      제품 수령 후 7일 이내 미개봉 상품에 한하여 교환 및 반품이 가능하며, 이미 시공이 완료되었거나 고객 과실로 훼손된 제품은 반품이 제한될 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="block sm:hidden sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between gap-2.5">
            {/* Price & Like */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title="찜하기"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-600' : ''}`} />
              </button>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400">총 상품금액</span>
                {isCommercial ? (
                  <span className="text-base font-black text-rose-600 leading-tight">견적문의</span>
                ) : (
                  <span className="text-base font-black text-slate-950 leading-tight">
                    ₩{totalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              {isCommercial ? (
                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="w-full py-3 px-4 bg-slate-900 active:bg-slate-800 text-white rounded-xl font-black text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>📋 견적 신청</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="py-3 px-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-black text-xs transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>담기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 py-3 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 active:from-blue-700 active:to-indigo-700 text-white rounded-xl font-black text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>⚡ 바로구매</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
