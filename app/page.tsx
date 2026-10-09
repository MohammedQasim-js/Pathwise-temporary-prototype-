'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/components/ui/header';
import { FloorView } from '@/components/views/floor-view';
import { ReportView } from '@/components/views/report-view';
import { PlanView } from '@/components/views/plan-view';
import {
  PEAK_IDX,
  DISPLAY0,
  analyzeCapacity,
} from '@/lib/store-engine';
import { Rect, ReplayState } from '@/lib/types';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'floor' | 'report' | 'plan'>('floor');
  const [hour, setHour] = useState<number>(PEAK_IDX);
  const [display, setDisplay] = useState<Rect>({ ...DISPLAY0 });
  const [replayState, setReplayState] = useState<ReplayState | null>(null);
  const [themeOverride, setThemeOverride] = useState<'dark' | 'light' | null>(null);

  // Subscribe to system preference
  const subscribeTheme = useCallback((callback: () => void) => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  }, []);

  const getThemeSnapshot = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const getThemeServerSnapshot = () => false;

  const systemDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const darkMode = themeOverride !== null ? themeOverride === 'dark' : systemDark;

  // Synchronize document classes with external DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setThemeOverride((prev) => {
      const current = prev !== null ? prev === 'dark' : systemDark;
      return current ? 'light' : 'dark';
    });
  };

  // Live capacity analysis on current display position and hour
  const analysis = useMemo(() => {
    return analyzeCapacity(display, hour);
  }, [display, hour]);

  // Baseline capacity analysis on original DISPLAY0 position and hour
  const baseAnalysis = useMemo(() => {
    return analyzeCapacity(DISPLAY0, hour);
  }, [hour]);

  // Evidence replay trigger
  const handleStartReplay = (segName: string) => {
    const pathsCrossing = analysis.paths.map((p) =>
      p.samples.some((s) => s.seg === segName)
    );
    setHour(PEAK_IDX);
    setReplayState({
      seg: segName,
      paths: pathsCrossing,
      t: 0,
      len: 10,
    });
  };

  const handleCloseReplay = () => {
    setReplayState(null);
  };

  return (
    <div
      suppressHydrationWarning
      className="max-w-[1360px] mx-auto px-4 sm:px-6 pb-12 transition-colors duration-200"
    >
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <main suppressHydrationWarning>
        <AnimatePresence mode="wait">
          {currentTab === 'floor' && (
            <motion.div
              key="floor"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <FloorView
                hour={hour}
                onHourChange={setHour}
                display={display}
                onDisplayChange={setDisplay}
                analysis={analysis}
                baseAnalysis={baseAnalysis}
                replayState={replayState}
                onStartReplay={handleStartReplay}
                onCloseReplay={handleCloseReplay}
              />
            </motion.div>
          )}

          {currentTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <ReportView />
            </motion.div>
          )}

          {currentTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <PlanView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
