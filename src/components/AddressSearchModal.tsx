import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Loader2, RefreshCw, Building2 } from 'lucide-react';

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onresize?: (size: { width: number; height: number }) => void;
        width?: string | number;
        height?: string | number;
        autoMapping?: boolean;
        animation?: boolean;
        focusInput?: boolean;
        shorthand?: boolean;
      }) => {
        embed: (element: HTMLElement | null, options?: { autoClose?: boolean }) => void;
        open: () => void;
      };
    };
  }
}

export interface DaumPostcodeData {
  zonecode: string; // 5자리 새우편번호
  address: string; // 기본 주소
  addressType: 'R' | 'J'; // R: 도로명, J: 지번
  bname: string; // 법정동/법정리 이름
  bname1: string;
  bname2: string;
  sido: string;
  sigungu: string;
  sigunguCode: string;
  userSelectedType: 'R' | 'J';
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  buildingName: string; // 건물명
  apartment: 'Y' | 'N';
  autoRoadAddress: string;
  autoJibunAddress: string;
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (data: {
    zonecode: string;
    address: string;
    roadAddress: string;
    jibunAddress: string;
    buildingName: string;
    fullAddress: string;
  }) => void;
  title?: string;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onSelectAddress,
  title = '주소 검색'
}: AddressSearchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptError, setIsScriptError] = useState(false);

  // Direct manual input state (for fallback if user wants or script blocked)
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualZonecode, setManualZonecode] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualDetail, setManualDetail] = useState('');

  const loadDaumScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.daum && window.daum.Postcode) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById('daum-postcode-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'daum-postcode-script';
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      setIsLoading(true);
      setIsScriptError(false);
      setIsManualMode(false);
      return;
    }

    const initPostcode = async () => {
      setIsLoading(true);
      setIsScriptError(false);

      const success = await loadDaumScript();
      if (!isMounted) return;

      if (!success || !window.daum?.Postcode) {
        setIsLoading(false);
        setIsScriptError(true);
        return;
      }

      // Small delay to ensure containerRef is rendered and has dimensions
      setTimeout(() => {
        if (!isMounted || !containerRef.current || !window.daum?.Postcode) return;

        try {
          // Clear any previous contents in the container
          containerRef.current.innerHTML = '';

          new window.daum.Postcode({
            oncomplete: (data: DaumPostcodeData) => {
              // Extract selected address format
              let selectedAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
              if (!selectedAddr) {
                selectedAddr = data.address || data.roadAddress || data.jibunAddress;
              }

              // Extract extra building/neighborhood info
              let extraAddr = '';
              if (data.userSelectedType === 'R') {
                if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                  extraAddr += data.bname;
                }
                if (data.buildingName !== '' && data.apartment === 'Y') {
                  extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                } else if (data.buildingName !== '') {
                  extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
              }

              const fullAddressStr = extraAddr ? `${selectedAddr} (${extraAddr})` : selectedAddr;

              onSelectAddress({
                zonecode: data.zonecode,
                address: selectedAddr,
                roadAddress: data.roadAddress || selectedAddr,
                jibunAddress: data.jibunAddress || selectedAddr,
                buildingName: data.buildingName || '',
                fullAddress: fullAddressStr,
              });

              onClose();
            },
            width: '100%',
            height: '100%',
            autoMapping: true,
            animation: false,
            focusInput: true,
            shorthand: false
          }).embed(containerRef.current, {
            autoClose: false
          });

          setIsLoading(false);
        } catch (err) {
          console.error('Daum Postcode embed error:', err);
          setIsLoading(false);
          setIsScriptError(true);
        }
      }, 50);
    };

    initPostcode();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      alert('주소를 입력해 주세요.');
      return;
    }

    const full = manualDetail.trim() 
      ? `${manualAddress.trim()} ${manualDetail.trim()}`
      : manualAddress.trim();

    onSelectAddress({
      zonecode: manualZonecode.trim() || '00000',
      address: manualAddress.trim(),
      roadAddress: manualAddress.trim(),
      jibunAddress: manualAddress.trim(),
      buildingName: manualDetail.trim(),
      fullAddress: full,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[580px] max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white flex justify-between items-center shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-blue-100 font-medium">카카오·행정안전부 공식 우편번호 및 주소 검색 서비스</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 bg-white overflow-hidden flex flex-col">
          {!isManualMode ? (
            <>
              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs font-black text-slate-700">공식 주소 검색 서비스를 불러오는 중입니다...</p>
                </div>
              )}

              {/* Error / Offline Fallback Notice */}
              {isScriptError && (
                <div className="p-6 text-center flex-1 flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-black text-slate-800">주소 서비스 연결에 실패했습니다.</p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    네트워크 환경에 따라 주소 직접 입력 모드를 사용하실 수 있습니다.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        setIsScriptError(false);
                        loadDaumScript().then((res) => {
                          if (!res) setIsScriptError(true);
                          setIsLoading(false);
                        });
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer"
                    >
                      다시 시도
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer"
                    >
                      주소 직접 입력
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Daum / Kakao Postcode Embed Container */}
              <div 
                ref={containerRef} 
                className="w-full h-full flex-1 bg-white"
                style={{ width: '100%', height: '100%', minHeight: '440px' }}
              />
            </>
          ) : (
            /* Direct Manual Input Fallback Form */
            <form onSubmit={handleManualSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-900 font-bold space-y-1">
                <p className="flex items-center gap-1 font-black">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  주소 직접 입력 모드
                </p>
                <p className="text-[11px] text-blue-700 font-normal">
                  설치 희망지의 도로명 주소 또는 지번 주소를 입력해 주세요.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">우편번호 (선택)</label>
                <input
                  type="text"
                  value={manualZonecode}
                  onChange={(e) => setManualZonecode(e.target.value)}
                  placeholder="예: 06236"
                  className="w-full sm:w-40 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">
                  기본 주소 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="예: 서울특별시 강남구 테헤란로 152"
                  required
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">건물명 / 상세주소 (선택)</label>
                <input
                  type="text"
                  value={manualDetail}
                  onChange={(e) => setManualDetail(e.target.value)}
                  placeholder="예: 강남파이낸스센터 10층"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer"
                >
                  주소 검색으로 돌아가기
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  주소 적용하기
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 font-medium shrink-0">
          {!isManualMode ? (
            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              주소가 검색되지 않으시나요? 직접 입력하기
            </button>
          ) : (
            <span className="text-slate-400">정확한 주소를 입력해 주시면 신속한 설치 상담이 가능합니다.</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer ml-auto"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
