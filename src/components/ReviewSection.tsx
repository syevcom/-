/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Review } from '../types';
import { REVIEWS } from '../data';
import { X, Check, Plus, Edit3, Trash2, Upload, Image as ImageIcon, Clipboard } from 'lucide-react';
import { compressImage } from '../lib/imageCompressor';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';

interface ReviewSectionProps {
  reviews?: Review[];
  isEditMode?: boolean;
  onOpenCms?: (tab: 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support') => void;
  onDeleteReview?: (id: string) => void;
  onSaveReviews?: (reviews: Review[]) => void;
}

export default function ReviewSection({
  reviews = [],
  isEditMode = false,
  onOpenCms,
  onDeleteReview,
  onSaveReviews
}: ReviewSectionProps) {
  // Fallback to REVIEWS if provided reviews is empty
  const displayReviews = (reviews && reviews.length > 0) ? reviews : REVIEWS;

  // Sort reviews by date descending (newest first)
  const sortedReviews = [...displayReviews].sort((a, b) => {
    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
  });

  // Inline edit state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [formReview, setFormReview] = useState<Partial<Review>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Helper function to process image files into Data URL with compression
  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WEBP 등)만 업로드할 수 있습니다.');
      return;
    }
    try {
      const compressed = await compressImage(file, 1200, 900, 0.85);
      setFormReview((prev) => ({ ...prev, afterImg: compressed }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormReview((prev) => ({ ...prev, afterImg: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Listen for global Clipboard Paste (Ctrl+V) when modal is open
  useEffect(() => {
    if (!editingReview && !isCreating) return;

    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [editingReview, isCreating]);

  const handleStartEdit = (rev: Review) => {
    setEditingReview(rev);
    setIsCreating(false);
    setFormReview({ ...rev });
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingReview(null);
    setFormReview({
      id: `rev-${Date.now()}`,
      title: '',
      location: '경기 성남시 분당구',
      category: 'Residential',
      date: new Date().toISOString().split('T')[0],
      rating: 5,
      beforeImg: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      author: '고객 후기',
      interview: '설치가 매우 빠르고 만족스럽습니다.',
      details: '7kW 완속 스마트 월박스 시공 완료',
      coordinates: { x: 50, y: 50 },
      blogUrl: '',
      blogName: '네이버 블로그',
      isBlogImported: true
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReview.title) {
      alert('후기 제목을 입력해주세요.');
      return;
    }

    let updatedList: Review[] = [];
    if (isCreating) {
      const newRev = formReview as Review;
      updatedList = [newRev, ...displayReviews];
    } else if (editingReview) {
      updatedList = displayReviews.map((r) => (r.id === editingReview.id ? ({ ...r, ...formReview } as Review) : r));
    }

    try {
      localStorage.setItem('sy_cms_reviews', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Failed to save to localStorage', err);
    }
    if (onSaveReviews) {
      onSaveReviews(updatedList);
    }
    window.dispatchEvent(new Event('sy_cms_products_update'));
    window.dispatchEvent(new Event('storage'));

    setEditingReview(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-12 pt-6 md:pt-8 pb-12 relative group/review">
      {isEditMode && onOpenCms && (
        <button
          onClick={() => onOpenCms('review')}
          className="absolute top-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          ✏️ 전체 CMS 후기 설정
        </button>
      )}

      {/* Top Header Copy */}
      <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100/80 inline-block">
          Installation Gallery
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          "전국 방방곡곡 다양한 공간에서 <br className="hidden sm:inline" />
          SY.com의 검증된 충전 솔루션이 함께합니다."
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          지자체 관공서부터 대기업 지식산업센터, 단독주택까지 실제 설치 고객님들이 직접 전해주시는 생생한 시공 후기입니다.
        </p>
      </section>

      {/* Grid of Other review cards list (Chronological - Sorted Newest First with blog Cover Thumbnail) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider">전국 생생한 시공후기 목록</h4>
          {isEditMode && (
            <button
              onClick={handleStartCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 후기 추가</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedReviews.map((rev) => {
            return (
              <div
                key={rev.id}
                id={`card-review-list-${rev.id}`}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm transition-all cursor-pointer flex flex-col justify-between group/card hover:shadow-lg relative"
              >
                <div className="space-y-3">
                  {/* Blog / Case Study Thumbnail Cover Image */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={getOptimizedImageUrl(rev.afterImg, { width: 600, format: 'webp' })}
                      alt={rev.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {rev.isBlogImported ? (
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {rev.blogName || '네이버 블로그'}
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        시공사례
                      </div>
                    )}

                    {/* Admin Action Overlay Buttons */}
                    {isEditMode && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(rev);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1"
                          title="이 후기 수정"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>수정</span>
                        </button>
                        {onDeleteReview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('정말 이 후기를 삭제하시겠습니까?')) {
                                onDeleteReview(rev.id);
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-[10px] shadow-md transition-transform hover:scale-105 cursor-pointer"
                            title="이 후기 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-slate-500 font-extrabold block uppercase">
                        {rev.location ? rev.location.split(' ')[0] : ''} {rev.location ? rev.location.split(' ')[1] : ''}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {rev.date}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-950 block line-clamp-2 leading-snug group-hover/card:text-emerald-700 transition-colors">
                      {rev.title}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  {/* Direct Blog / Detail Link Button */}
                  {rev.blogUrl ? (
                    <a
                      href={rev.blogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-[11px] font-black rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer group/btn"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover/btn:bg-white" />
                      <span>네이버 블로그 글 보기 🔗</span>
                    </a>
                  ) : (
                    <div className="w-full py-1 px-2 bg-slate-50 text-slate-500 text-[10px] font-extrabold rounded-xl text-center">
                      시공 완료 현장
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* In-Place Edit / Create Modal for Admin */}
      {(editingReview || isCreating) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setEditingReview(null);
                setIsCreating(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✏️
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isCreating ? '새 설치후기 등록' : '설치후기 즉시 수정'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isCreating ? '새로운 시공사례 후기를 등록합니다.' : '현장에서 직접 후기 내용을 수정할 수 있습니다.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">후기 제목</label>
                <input
                  type="text"
                  value={formReview.title || ''}
                  onChange={(e) => setFormReview({ ...formReview, title: e.target.value })}
                  placeholder="예: [네이버 블로그] 분당 단독주택 7kW 전기차 충전기 시공후기!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">설치 지역</label>
                <input
                  type="text"
                  value={formReview.location || ''}
                  onChange={(e) => setFormReview({ ...formReview, location: e.target.value })}
                  placeholder="예: 경기 성남시 분당구"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">설치 완료일</label>
                  <input
                    type="text"
                    value={formReview.date || ''}
                    onChange={(e) => setFormReview({ ...formReview, date: e.target.value })}
                    placeholder="2026-06-29"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">구분</label>
                  <select
                    value={formReview.category || 'Residential'}
                    onChange={(e) => setFormReview({ ...formReview, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Residential">주거 전용</option>
                    <option value="Commercial">기업/관공서</option>
                    <option value="ParkingLot">수익형 주차장</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>대표 시공 이미지</span>
                  <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Clipboard className="w-3 h-3 text-emerald-600" />
                    <span>캡처 후 Ctrl+V 가능</span>
                  </span>
                </label>

                <div className="space-y-2">
                  {/* Dropzone & Paste Container */}
                  <div
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleProcessFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/90 scale-[0.99]'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 hover:border-emerald-400'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessFile(file);
                      }}
                    />

                    {formReview.afterImg ? (
                      <div className="relative group/preview w-full flex flex-col items-center gap-2">
                        <img
                          src={formReview.afterImg}
                          alt="대표 시공 이미지 미리보기"
                          className="max-h-40 max-w-full object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                            ✓ 이미지 적용됨 (클릭하여 파일 변경 또는 Ctrl+V 캡처 붙여넣기)
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormReview({ ...formReview, afterImg: '' });
                            }}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 py-2">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          캡처 이미지 <span className="text-emerald-600 font-black underline">Ctrl+V 붙여넣기</span> 또는 <span className="text-emerald-600 font-black underline">클릭하여 파일 선택</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          화면 캡처 도구(Win+Shift+S / Cmd+Ctrl+Shift+4) 사용 후 <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[9px] font-bold">Ctrl + V</kbd>를 누르시면 사진이 자동 첨부됩니다.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">또는 이미지 URL 직접 입력:</span>
                    <input
                      type="text"
                      value={formReview.afterImg || ''}
                      onChange={(e) => setFormReview({ ...formReview, afterImg: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[10px] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">블로그 원문 URL (연동 시)</label>
                <input
                  type="text"
                  value={formReview.blogUrl || ''}
                  onChange={(e) => setFormReview({ ...formReview, blogUrl: e.target.value, isBlogImported: !!e.target.value })}
                  placeholder="https://blog.naver.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>저장 완료</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

