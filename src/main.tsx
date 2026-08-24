import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null, errorInfo: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndReset = () => {
    try {
      // Clear localStorage except crucial credentials if any
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/90 backdrop-blur border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white">화면을 불러오는 중 문제가 발생했습니다</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                임시 저장된 캐시 데이터 충돌 또는 브라우저 로딩 오류일 수 있습니다. 아래 버튼을 눌러 복구해 주세요.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/70 border border-slate-700/60 rounded-2xl p-4 text-left overflow-hidden">
                <p className="text-[11px] font-bold text-rose-400 mb-1">오류 메시지:</p>
                <p className="text-xs font-mono text-slate-200 break-words font-semibold">
                  {this.state.error.message || String(this.state.error)}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2.5">
                    <summary className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer font-bold select-none">
                      상세 스택 로그 보기
                    </summary>
                    <pre className="text-[10px] font-mono text-slate-400 mt-2 p-2 bg-slate-900 rounded-lg overflow-x-auto max-h-40 leading-tight">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                🔄 새로고침
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReset}
                className="flex-1 py-3.5 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                🧹 캐시 완전 초기화 및 복구
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

