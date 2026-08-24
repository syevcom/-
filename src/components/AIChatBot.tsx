/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, RefreshCw, ChevronRight, PhoneCall, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatBotProps {
  onOpenQuote: () => void;
  onNavigateToSol?: (sol: 'residential' | 'commercial' | 'parking') => void;
  onNavigateToProducts?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export default function AIChatBot({ onOpenQuote, onNavigateToSol, onNavigateToProducts }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: ChatMessage[] = [
    {
      id: '1',
      sender: 'ai',
      text: '안녕하세요! SY.com 전기차 충전 솔루션 AI 상담원입니다. ⚡\n\n가정용 홈충전기(5kW/7kW/11kW), 아파트 보조금, 한전 계량기 대행 신청, 설치 비용 등 궁금하신 점을 말씀해 주세요!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '📋 무료 방문 견적 신청', action: onOpenQuote },
        { label: '🏠 가정용 홈충전기 알아보기', action: () => onNavigateToSol?.('residential') }
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    '🏡 가정용 7kW/5kW 충전기 추천',
    '🏢 아파트 보조금 신청 절차',
    '💰 총 설치 비용 및 한전 불입금',
    '⚡ 5kW vs 7kW 차이점'
  ];

  const generateAIResponse = (userQuery: string): { responseText: string; actions?: Array<{ label: string; action: () => void }> } => {
    const q = userQuery.toLowerCase();

    if (q.includes('5kw') || q.includes('7kw') || q.includes('11kw') || q.includes('추천') || q.includes('차이')) {
      return {
        responseText: '🔌 **전력용량별 충전기 안내**\n\n• **5kW (안전 완속):** 계약 전력 부담이 적고 기존 주택 누진세 걱정 없는 가성비 모델\n• **7kW (표준 완속):** 가정용 및 단독주택에 가장 널리 쓰이며 1시간에 약 40~50km 충전 (약 7~8시간 완충)\n• **11kW (고속 완속):** 3상 전력이 인입된 건물/사업장에 추천하며 빠른 완속 충전 지원\n\nSY.com에서는 화재 감지 자동 차단 기능이 탑재된 최신형 기기를 공급합니다.',
        actions: [
          { label: '📋 내 차에 맞는 견적 산출', action: onOpenQuote },
          { label: '🛒 상품 전체보기', action: () => onNavigateToProducts?.() }
        ]
      };
    }

    if (q.includes('아파트') || q.includes('보조금') || q.includes('공동주택')) {
      return {
        responseText: '🏢 **아파트 및 공동주택 보조금 지원**\n\n환경부 무상 보조금 사업을 통해 아파트 단지 내 입주민 공용 충전기 무료 설치 및 지자체 보조금 연계가 가능합니다.\n\n• **설치 비용:** 단지 조건 충족 시 무상 설치\n• **관리:** 24시간 실시간 정산 및 모니터링 연동\n• **신청 절차:** 입주자대표회의 동의 ➔ SY.com 현장조사 ➔ 무상 설치',
        actions: [
          { label: '🏢 아파트 솔루션 보기', action: () => onNavigateToSol?.('commercial') },
          { label: '📞 대표번호 1588-0000 상담', action: () => alert('대표 상담 센터 1588-0000으로 연결됩니다.') }
        ]
      };
    }

    if (q.includes('비용') || q.includes('가격') || q.includes('한전') || q.includes('불입금') || q.includes('얼마')) {
      return {
        responseText: '💰 **설치 비용 & 한전 불입금 안내**\n\n• **기기 및 시공 비용:** 기본 자재 + 1:1 맞춤 설치 시 약 60만 원대부터 (기종 및 거리별 상이)\n• **한전 불입금:** 한전에 납부하는 전력 가공 불입금은 계량기 신설 시 한전 규정 정액이 부과됩니다.\n• **무료 혜택:** SY.com은 한전 계량기 대행 신청 및 내선 설계 인건비를 **100% 무료**로 서비스해 드립니다!',
        actions: [
          { label: '📝 맞춤 견적 확인하기', action: onOpenQuote }
        ]
      };
    }

    if (q.includes('견적') || q.includes('신청') || q.includes('방문') || q.includes('상담')) {
      return {
        responseText: '📋 **실시간 무료 방문 견적 안내**\n\n전국 어디서나 전문 엔지니어가 직접 방문하여 설치 공간, 분전함 거리, 최적 충전기 기종을 친절하게 상담해 드립니다.\n\n지금 [무료 방문 견적 신청] 버튼을 누르시면 1분 만에 접수가 완료됩니다!',
        actions: [
          { label: '✨ 1분 무료 견적 신청하기', action: onOpenQuote }
        ]
      };
    }

    if (q.includes('안녕') || q.includes('반가') || q.includes('hi') || q.includes('hello')) {
      return {
        responseText: '안녕하세요! 반갑습니다. 😊 SY.com 친절 AI 상담원입니다. 어떤 도움이 필요하신가요?',
        actions: [
          { label: '🏡 가정용 충전기', action: () => onNavigateToSol?.('residential') },
          { label: '📋 견적 신청', action: onOpenQuote }
        ]
      };
    }

    return {
      responseText: `문의해 주신 "${userQuery}" 내용에 대해 답변드립니다!\n\nSY.com은 전국 24개 전담 설치 서비스망을 보유한 전기차 충전 전문 기업입니다. 더 상세한 1:1 맞춤 견적이나 특수 설치 환경(화재감지 차단기, 볼라드, 가공배선 등)은 아래 견적 신청을 이용해 주시면 전문 직원이 직통 전화로 친절히 안내해 드립니다.`,
      actions: [
        { label: '📋 1:1 맞춤 견적 신청', action: onOpenQuote },
        { label: '📞 1588-0000 직통 전화', action: () => alert('1588-0000 연결 (평일 09:00~18:00)') }
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { responseText, actions } = generateAIResponse(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      {/* Mobile Backdrop to close by tapping outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[85] sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-16 sm:bottom-6 right-2.5 sm:right-6 z-[90] flex flex-col items-end">
        {/* Floating Chat Trigger Button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2 group"
            >
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-full text-xs font-bold shadow-lg border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AI 24시 실시간 상담</span>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                id="btn-ai-chat-open"
                className="relative p-3 sm:p-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full shadow-2xl shadow-emerald-500/40 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                aria-label="Open AI 1:1 Live Chat"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded AI Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-[calc(100vw-20px)] max-w-[345px] sm:w-[380px] h-[450px] max-h-[64vh] sm:h-[530px] sm:max-h-[78vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden ring-1 ring-black/10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-3.5 sm:px-4 py-3 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900"></span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1 truncate">
                      <span>SY.com AI 24시 상담</span>
                      <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shrink-0">LIVE</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">실시간 충전기 & 보조금 상담</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleResetChat}
                    title="대화 초기화"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    id="btn-ai-chat-close"
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title="상담창 닫기"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="text-[11px]">닫기</span>
                  </button>
                </div>
              </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-md'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* Actions attached to message */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 ml-9 max-w-[85%]">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={act.action}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 font-semibold flex items-center gap-1.5 shadow-sm">
                    <span>AI 상담원이 답변 작성 중</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/60 rounded-full text-[11px] text-slate-700 font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="궁금한 내용을 입력하세요..."
                className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
