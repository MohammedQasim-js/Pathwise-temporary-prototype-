'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentTab: 'floor' | 'report' | 'plan';
  onTabChange: (tab: 'floor' | 'report' | 'plan') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  currentTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
}: HeaderProps) {
  return (
    <header className="flex items-center gap-5 py-4 flex-wrap border-b border-[#D9DFEC] dark:border-[#2B3352] mb-4">
      <div className="flex items-center gap-3">
        <svg
          width="36"
          height="36"
          viewBox="0 0 34 34"
          aria-hidden="true"
          className="shrink-0 drop-shadow-sm"
        >
          <rect width="34" height="34" rx="9" fill="#5A3FD0" />
          <path
            d="M7 25c0-6 4-7 8-8s6-2 6-6"
            stroke="#FFD23F"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M12 27c3-1 6-3 9-3s5 1 6-3"
            stroke="#F26B38"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="25" cy="9" r="3.2" fill="#fff" />
        </svg>
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-d)] font-bold text-2xl tracking-tight text-[#1C2540] dark:text-[#E8EBF6]">
            Pathwise
          </span>
          <span className="hidden sm:inline-block text-sm text-[#5E678A] dark:text-[#A2ABC8] pl-3 border-l border-[#D9DFEC] dark:border-[#2B3352]">
            See the path. Fix the floor.
          </span>
        </div>
      </div>

      <div
        className="flex gap-1 bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-full p-1 sm:ml-auto shadow-xs"
        role="tablist"
        aria-label="Sections"
        suppressHydrationWarning
      >
        <button
          type="button"
          role="tab"
          id="tab-floor"
          aria-selected={currentTab === 'floor'}
          onClick={() => onTabChange('floor')}
          suppressHydrationWarning
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            currentTab === 'floor'
              ? 'bg-[#5A3FD0] text-white shadow-xs'
              : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
          }`}
        >
          Floor
        </button>
        <button
          type="button"
          role="tab"
          id="tab-report"
          aria-selected={currentTab === 'report'}
          onClick={() => onTabChange('report')}
          suppressHydrationWarning
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            currentTab === 'report'
              ? 'bg-[#5A3FD0] text-white shadow-xs'
              : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
          }`}
        >
          Action report
        </button>
        <button
          type="button"
          role="tab"
          id="tab-plan"
          aria-selected={currentTab === 'plan'}
          onClick={() => onTabChange('plan')}
          suppressHydrationWarning
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            currentTab === 'plan'
              ? 'bg-[#5A3FD0] text-white shadow-xs'
              : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
          }`}
        >
          Build plan
        </button>
      </div>

      <div className="flex items-center gap-2" suppressHydrationWarning>
        <span className="bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544] rounded-full px-3 py-1 font-semibold text-xs border border-[#FBEFD6] dark:border-[#3A2F17]/50">
          Prototype · dummy data
        </span>
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          suppressHydrationWarning
          className="p-1.5 rounded-full border border-[#D9DFEC] dark:border-[#2B3352] text-[#5E678A] dark:text-[#A2ABC8] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-[#F2B544]" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
