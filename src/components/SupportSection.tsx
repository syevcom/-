/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Bell, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface Notice {
  id: string;
  title: string;
  date: string;
  important: boolean;
}

interface SupportSectionProps {
  onOpenMyPageAS: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  faqs: FAQ[];
  notices: Notice[];
  isEditMode?: boolean;
  onOpenCms?: (tab: 'hero' | 'about' | 'products' | 'solutions' | 'review' | 'support') => void;
  onAddInquiry?: (inquiry: { name: string; phone: string; title: string; memo: string }) => void;
}

export default function SupportSection({ 
  onOpenMyPageAS, 
  onOpenAuth, 
  isLoggedIn,
  faqs,
  notices,
  isEditMode = false,
  onOpenCms,
  onAddInquiry
}: SupportSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState<'전체' | '보조금/비용' | '화재안전' | '설치과정' | '전기안전'>('전체');

  // 1:1 online inquiry form state
  const [title, setTitle] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Filter FAQs
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const safeNotices = Array.isArray(notices) ? notices : [];

  const filteredFaqs = safeFaqs.filter((faq) => {
    if (!faq) return false;
    const q = faq.question || '';
    const a = faq.answer || '';
    const matchesSearch = q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = faqCategory === '전체' || faq.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError('');

    if (!title || !contact || !message) {
      setInquiryError('제목, 연락처, 상세 내용을 정확히 기재해 주세요.');
      return;
    }

    if (onAddInquiry) {
      onAddInquiry({
        name: contact.includes('@') ? contact.split('@')[0] : '온라인문의 고객',
        phone: contact,
        title,
        memo: `[1:1 온라인 문의] ${title} - ${message}`
      });
    }

    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setTitle('');
      setContact('');
      setMessage('');
    }, 2500);
  };

  const handleASButton = () => {
    if (isLoggedIn) {
      onOpenMyPageAS();
    } else {
      alert('전국 긴급 A/S 접수는 본인 확인용 회원 로그인이 필수입니다. 1초 간편 로그인 후 즉시 접수됩니다.');
      onOpenAuth();
    }
  };

  return (
    <div className="space-y-16 py-12 relative group/support">
      {isEditMode && onOpenCms && (
        <button
          onClick={() => onOpenCms('support')}
          className="absolute top-2 right-2 z-30 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        >
          ✏️ 공지사항 및 FAQ 실시간 편집
        </button>
      )}

      {/* Notices Board Section (Top widget) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="text-base font-black text-slate-950 uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <Bell className="w-5 h-5 text-blue-600 shrink-0" />
          SY.com 정식 공지사항 &amp; 새소식
        </h3>

        <div className="space-y-3">
          {safeNotices.map((not) => (
            <div
              key={not.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                {not.important && (
                  <span className="bg-rose-50 border border-rose-100 text-rose-600 font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">
                    중요
                  </span>
                )}
                <span className="text-sm sm:text-base font-bold text-slate-800 truncate">{not.title}</span>
              </div>
              <span className="text-xs text-slate-400 font-bold shrink-0">{not.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-blue-600 font-bold text-sm tracking-wider uppercase block">Frequently Asked Questions</span>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">자주 묻는 질문 (FAQ)</h3>
          <p className="text-sm sm:text-base text-slate-500 font-medium">궁금하신 전기차 화재 안전성 및 보조금 심사 자격을 빠르게 찾아보세요.</p>
        </div>

        {/* Search & Categories */}
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="예: 보조금, 화재, 안전, 아파트, 계량기..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-faq-search"
              className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {(['전체', '보조금/비용', '화재안전', '설치과정', '전기안전'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                id={`btn-faq-cat-${cat}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  faqCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">검색 결과에 맞는 자주 묻는 질문이 없습니다.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = selectedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setSelectedFaq(isOpen ? null : faq.id)}
                    id={`btn-faq-toggle-${faq.id}`}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {faq.category}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-800 truncate">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>                    <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                      >
                        <div className="p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed font-bold space-y-2">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Online 1:1 Query card */}
      <section className="max-w-3xl mx-auto w-full">
        {/* 1:1 Inquiry Form */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider block">Online Customer Desk</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">온라인 1:1 고객지원실</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-normal font-semibold">
              설치 보조금 자격 검수 이외의 사업 제휴, OEM 충전기 제조 문의, 단체 공급 입찰 제안 등 궁금하신 내용을 편하게 남겨 주시면 24시간 이내에 성실히 서면 또는 유선 회신을 드립니다.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {inquirySuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">1:1 온라인 접수가 완료되었습니다.</h4>
                <p className="text-slate-500 text-xs mt-1.5 font-bold">남겨 주신 연락처로 담당 부서에서 신속히 안내 회신을 전달하겠습니다.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {inquiryError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-bold">
                    {inquiryError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">문의 제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 지식산업센터 단체 주차장 시공 협약 제안"
                    id="input-support-title"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">회신받으실 연락처 / 이메일</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="예: 010-1234-5678 또는 name@corp.com"
                    id="input-support-contact"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">문의 내용 상세</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="세부적인 현장 상황 및 문의 세부 제안 내용을 간략히 작성해 주세요."
                    rows={4}
                    id="textarea-support-message"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-800 resize-none font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-bold leading-normal">동의 사항: 수집된 고객 연락정보는 1:1 온라인 고객 상담 답변 및 회신 용도로만 안전하게 일시 저장 후 파기됩니다.</span>
                </div>

                <button
                  type="submit"
                  id="btn-support-submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  온라인 1:1 문의 접수하기
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
