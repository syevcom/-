/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActivePage } from '../types';
import { Info, Zap, Settings, MapPin, HelpCircle, Home, Building2, Building, ClipboardCheck } from 'lucide-react';

interface NavbarProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  categoryLabels?: {
    home: string;
    about: string;
    products: string;
    solutions: string;
    review: string;
    support: string;
    sol_residential?: string;
    sol_commercial?: string;
    sol_parking?: string;
  };
}

export default function Navbar({ 
  activePage, 
  onPageChange,
  categoryLabels = {
    home: '홈',
    about: '회사소개',
    products: '가정용',
    solutions: '아파트',
    review: '설치후기',
    support: '상업시설'
  }
}: NavbarProps) {
  // Ordered: 홈, 회사소개, 아파트, 가정용 홈, 상업시설 수익형, 설치후기, 고객지원
  const menuItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: categoryLabels.home || '홈', icon: <Home className="w-4 h-4" /> },
    { id: 'about', label: categoryLabels.about || '회사소개', icon: <Info className="w-4 h-4" /> },
    { id: 'sol_commercial', label: categoryLabels.sol_commercial || '아파트', icon: <Building className="w-4 h-4 text-blue-600" /> },
    { id: 'sol_residential', label: categoryLabels.sol_residential || '가정용 홈', icon: <Home className="w-4 h-4 text-emerald-600" /> },
    { id: 'sol_parking', label: categoryLabels.sol_parking || '상업시설 수익형', icon: <MapPin className="w-4 h-4 text-blue-600" /> },
    { id: 'review', label: categoryLabels.review || '설치후기', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'support', label: '고객지원', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  return (
    <nav className="bg-white text-slate-700 py-2 sm:py-0 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-10 sm:h-14 items-center">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                id={`btn-nav-${item.id}`}
                className={`px-4 sm:px-6 py-2.5 sm:py-0 sm:h-14 text-xs sm:text-[15px] font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-black'
                    : 'border-transparent text-slate-600 hover:text-blue-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
