'use client';

import React, { useState } from 'react';
import {
  HOURS,
  FACTOR,
  PEAK_IDX,
  ZONES,
  HOTSPOT,
  DISPLAY0,
  ACTION_DISPLAY,
  formatNumber,
  formatHour,
  classifyZone,
  estimateEngaged,
} from '@/lib/store-engine';
import {
  Rect,
  LayerState,
  CapacityAnalysis,
  ReplayState,
  Zone,
} from '@/lib/types';
import { FloorCanvas } from '@/components/canvas/floor-canvas';
import {
  Activity,
  AlertTriangle,
  Layers,
  Sparkles,
  RotateCcw,
  Eye,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface FloorViewProps {
  hour: number;
  onHourChange: (hour: number) => void;
  display: Rect;
  onDisplayChange: (disp: Rect) => void;
  analysis: CapacityAnalysis;
  baseAnalysis: CapacityAnalysis;
  replayState: ReplayState | null;
  onStartReplay: (seg: string) => void;
  onCloseReplay: () => void;
}

export function FloorView({
  hour,
  onHourChange,
  display,
  onDisplayChange,
  analysis,
  baseAnalysis,
  replayState,
  onStartReplay,
  onCloseReplay,
}: FloorViewProps) {
  // Layer states
  const [layers, setLayers] = useState<LayerState>({
    heat: true,
    dwell: false,
    flow: false,
    zones: false,
    conf: false,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [panelTab, setPanelTab] = useState<'alerts' | 'zones' | 'whatif'>('alerts');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const toggleLayer = (layerKey: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const isPeak = hour === PEAK_IDX;
  const currentFactor = FACTOR[hour];
  const peakFactor = FACTOR[PEAK_IDX];
  const footfallPctOfPeak = Math.round((currentFactor / peakFactor) * 100);

  // What-if comparison metrics
  const isMoved =
    Math.abs(display.x - DISPLAY0.x) + Math.abs(display.y - DISPLAY0.y) > 0.01;
  const e0 = estimateEngaged(DISPLAY0, baseAnalysis, hour);
  const e1 = estimateEngaged(display, analysis, hour);
  const worstNew = analysis.segs[0] || { name: 'Main aisle', U: 0, slow: 0 };
  const worstOld = baseAnalysis.segs[0] || { name: 'Main aisle', U: 0, slow: 0 };

  const causeText = (g: CapacityAnalysis['segs'][0]) => {
    const cx = display.x + display.w / 2;
    const cy = display.y + display.h / 2;
    const near = Math.hypot(g.worst.x - cx, g.worst.y - cy) < 2.6;
    return near
      ? 'Display D1 is sitting in the passage and narrows it.'
      : 'The passage is narrow for the number of people using it.';
  };

  const handleTestFix = () => {
    onDisplayChange({ ...ACTION_DISPLAY });
    setPanelTab('whatif');
  };

  const handleApplyPreset = (preset: 'reset' | 'entry' | 'aisle') => {
    if (preset === 'reset') {
      onDisplayChange({ ...DISPLAY0 });
    } else if (preset === 'entry') {
      onDisplayChange({ ...ACTION_DISPLAY });
    } else {
      onDisplayChange({ x: 14, y: 6.2, w: 3, h: 1.4, label: 'Display D1 (Aisle 1)' });
    }
  };

  const handleSelectZone = (zoneId: string) => {
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    } else {
      setSelectedZone(zoneId);
      if (!layers.zones) {
        setLayers((prev) => ({ ...prev, zones: true }));
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_392px] gap-4 items-start">
      {/* Left Column: Canvas & Controls */}
      <div className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-3 shadow-xs">
        {/* Layer Toolbar */}
        <div className="flex flex-wrap gap-2 items-center pb-3">
          <span className="text-xs font-semibold text-[#5E678A] dark:text-[#A2ABC8] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Layers:
          </span>

          <button
            type="button"
            onClick={() => toggleLayer('heat')}
            aria-pressed={layers.heat}
            className={`border rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              layers.heat
                ? 'bg-[#1C2540] dark:bg-white text-white dark:text-[#1C2540] border-[#1C2540] dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#1A1F31] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352] hover:border-gray-400'
            }`}
          >
            Foot-traffic heat
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('dwell')}
            aria-pressed={layers.dwell}
            className={`border rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              layers.dwell
                ? 'bg-[#1C2540] dark:bg-white text-white dark:text-[#1C2540] border-[#1C2540] dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#1A1F31] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352] hover:border-gray-400'
            }`}
          >
            Dwell hotspots
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('flow')}
            aria-pressed={layers.flow}
            className={`border rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              layers.flow
                ? 'bg-[#1C2540] dark:bg-white text-white dark:text-[#1C2540] border-[#1C2540] dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#1A1F31] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352] hover:border-gray-400'
            }`}
          >
            Journeys
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('zones')}
            aria-pressed={layers.zones}
            className={`border rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              layers.zones
                ? 'bg-[#1C2540] dark:bg-white text-white dark:text-[#1C2540] border-[#1C2540] dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#1A1F31] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352] hover:border-gray-400'
            }`}
          >
            Zone types
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('conf')}
            aria-pressed={layers.conf}
            className={`border rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              layers.conf
                ? 'bg-[#1C2540] dark:bg-white text-white dark:text-[#1C2540] border-[#1C2540] dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#1A1F31] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352] hover:border-gray-400'
            }`}
          >
            Coverage
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-pressed={!isPaused}
            className={`ml-auto border rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !isPaused
                ? 'bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B] border-[#1B7F4A]/30'
                : 'bg-[#F4F6FB] dark:bg-[#222841] text-[#5E678A] dark:text-[#A2ABC8] border-[#D9DFEC] dark:border-[#2B3352]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !isPaused ? 'bg-[#1B7F4A] animate-pulse' : 'bg-gray-400'
              }`}
            />
            {isPaused ? 'Live view paused' : 'Live view on'}
          </button>
        </div>

        {/* Store Floor Plan Canvas */}
        <FloorCanvas
          hour={hour}
          layers={layers}
          display={display}
          analysis={analysis}
          selectedZone={selectedZone}
          isEditable={panelTab === 'whatif'}
          isPaused={isPaused}
          replayState={replayState}
          onDisplayChange={onDisplayChange}
          onCloseReplay={onCloseReplay}
        />

        {/* Time Footfall Timeline Controls */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-end pt-3.5 pb-1 px-1">
          <div>
            <div className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1C2540] dark:text-[#E8EBF6] leading-none">
              {formatHour(hour)}
            </div>
            <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-0.5">
              {isPeak
                ? 'Busiest hour of the day (Peak)'
                : `Footfall ${footfallPctOfPeak}% of peak`}
            </div>
          </div>

          <div
            className="flex items-end gap-1 sm:gap-1.5 h-11"
            aria-label="Footfall by hour"
          >
            {FACTOR.map((f, i) => {
              const heightPct = Math.round((f / 1.15) * 100);
              const isActive = i === hour;
              return (
                <button
                  key={i}
                  type="button"
                  style={{ height: `${heightPct}%` }}
                  aria-label={`${formatHour(i)} footfall index ${f.toFixed(2)}`}
                  aria-pressed={isActive}
                  onClick={() => onHourChange(i)}
                  className={`flex-1 rounded-t transition-all ${
                    isActive
                      ? 'bg-[#5A3FD0] dark:bg-[#8F7DFF] ring-2 ring-[#5A3FD0]/30'
                      : 'bg-[#D9DFEC] dark:bg-[#2B3352] hover:bg-[#A2ABC8]'
                  }`}
                  title={`${formatHour(i)}: Footfall index ${f.toFixed(2)}`}
                />
              );
            })}
          </div>

          <div className="col-span-2 pt-1">
            <input
              type="range"
              id="hour-slider"
              min="0"
              max={HOURS.length - 1}
              step="1"
              value={hour}
              onChange={(e) => onHourChange(Number(e.target.value))}
              aria-label="Hour of day scrub"
              className="w-full accent-[#5A3FD0] dark:accent-[#8F7DFF] cursor-pointer"
            />
          </div>
        </div>

        {/* Floor Map Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2.5 px-1 text-xs text-[#5E678A] dark:text-[#A2ABC8] border-t border-[#D9DFEC] dark:border-[#2B3352] mt-2">
          {layers.heat && (
            <span className="flex items-center gap-1">
              <span>Fewer</span>
              <span className="inline-block w-20 h-2 rounded bg-linear-to-r from-[#3A2BA8] via-[#B02A8F] via-[#F26B38] to-[#FFD23F]" />
              <span>More shoppers</span>
            </span>
          )}

          {layers.dwell && (
            <span className="flex items-center gap-1.5">
              <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#5A3FD0]" />
              <span>Where people stop</span>
            </span>
          )}

          {layers.zones && (
            <>
              <span className="flex items-center gap-1">
                <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#E4572E]" />
                <span>Hot zone</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#E39A1F]" />
                <span>Pass-through</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#1F9E8E]" />
                <span>Hidden gem</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#6B7390]" />
                <span>Dead zone</span>
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block w-2.5 h-2.5 rounded-xs bg-[#9AA2BA]" />
                <span>Not observed</span>
              </span>
            </>
          )}

          <span className="flex items-center gap-1.5">
            <i className="inline-block w-2.5 h-2.5 rounded-full bg-[#1C2540] dark:bg-white" />
            <span>Shopper (anonymous dot)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block w-2.5 h-2.5 rounded-full bg-[#D7263D]" />
            <span>Slowed by congestion</span>
          </span>
        </div>
      </div>

      {/* Right Column: Insights & Simulation Panel */}
      <aside
        className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-2 shadow-xs"
        aria-label="Insights"
      >
        {/* Segmented Control Tabs */}
        <div
          className="flex bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-1 gap-1 mb-2"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={panelTab === 'alerts'}
            onClick={() => setPanelTab('alerts')}
            className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              panelTab === 'alerts'
                ? 'bg-white dark:bg-[#1A1F31] text-[#1C2540] dark:text-[#E8EBF6] shadow-xs'
                : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
            }`}
          >
            Alerts
            {analysis.nBottleneck > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#FBE0E4] dark:bg-[#3C1D26] text-[#C81E36] dark:text-[#FF6B80] rounded-full text-2xs font-bold">
                {analysis.nBottleneck}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={panelTab === 'zones'}
            onClick={() => setPanelTab('zones')}
            className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              panelTab === 'zones'
                ? 'bg-white dark:bg-[#1A1F31] text-[#1C2540] dark:text-[#E8EBF6] shadow-xs'
                : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
            }`}
          >
            Zones
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={panelTab === 'whatif'}
            onClick={() => setPanelTab('whatif')}
            className={`flex-1 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              panelTab === 'whatif'
                ? 'bg-white dark:bg-[#1A1F31] text-[#1C2540] dark:text-[#E8EBF6] shadow-xs'
                : 'text-[#5E678A] dark:text-[#A2ABC8] hover:text-[#1C2540] dark:hover:text-[#E8EBF6]'
            }`}
          >
            What-if
          </button>
        </div>

        {/* Panel Content Body */}
        <div className="p-1 sm:p-2 max-h-[750px] overflow-y-auto space-y-3">
          {/* TAB 1: ALERTS */}
          {panelTab === 'alerts' && (
            <div className="space-y-3">
              {/* Chokepoints / Bottlenecks */}
              {analysis.segs
                .filter((g) => g.status !== 'ok')
                .map((g) => {
                  const isBottleneck = g.status === 'bottleneck';
                  return (
                    <div
                      key={g.name}
                      className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-3 bg-white dark:bg-[#1A1F31] shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isBottleneck
                              ? 'bg-[#FBE0E4] dark:bg-[#3C1D26] text-[#C81E36] dark:text-[#FF6B80]'
                              : 'bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544]'
                          }`}
                        >
                          {isBottleneck ? 'Bottleneck' : 'Watch'}
                        </span>
                        <span className="text-xs font-mono text-[#5E678A] dark:text-[#A2ABC8]">
                          Utilisation {g.U.toFixed(2)}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-[#1C2540] dark:text-[#E8EBF6]">
                        {g.name}{' '}
                        {isBottleneck
                          ? `is choking at ${formatHour(hour)}`
                          : 'is close to its limit'}
                      </h4>

                      <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1.5 leading-relaxed">
                        Demand is <strong>{Math.round(g.U * 100)}%</strong> of capacity.
                        The usable passage is {g.worst.width.toFixed(1)} m wide for about{' '}
                        <strong>{formatNumber(g.worst.flow * 60)}</strong> shoppers an
                        hour. Walking speed drops about{' '}
                        <strong className="text-[#C81E36] dark:text-[#FF6B80]">
                          {Math.round(g.slow)}%
                        </strong>
                        .
                      </p>

                      <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1 italic">
                        {causeText(g)}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-[#D9DFEC]/50 dark:border-[#2B3352]/50">
                        <button
                          type="button"
                          onClick={() => onStartReplay(g.name)}
                          className="border border-[#D9DFEC] dark:border-[#2B3352] bg-white dark:bg-[#1A1F31] rounded-full px-3 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors"
                        >
                          Replay evidence
                        </button>
                        {isBottleneck && (
                          <button
                            type="button"
                            onClick={handleTestFix}
                            className="bg-[#5A3FD0] hover:bg-[#4C33B8] text-white rounded-full px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Test a fix</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* No Bottlenecks Info */}
              {!analysis.segs.some((g) => g.status !== 'ok') && (
                <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-3 bg-[#DDF3E6]/40 dark:bg-[#16352A]/40">
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B]">
                    All clear
                  </span>
                  <h4 className="font-semibold text-sm text-[#1C2540] dark:text-[#E8EBF6] mt-1.5">
                    No bottlenecks at {formatHour(hour)}
                  </h4>
                  <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1">
                    Every passage is under 80% of its capacity. Try scrubbing to the
                    19:00 peak hour.
                  </p>
                </div>
              )}

              {/* Dead Zones */}
              {ZONES.filter((z) => classifyZone(z) === 'dead').map((z) => {
                const pct = Math.round((z.visits / 6000) * 100);
                return (
                  <div
                    key={z.id}
                    className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-3 bg-white dark:bg-[#1A1F31]"
                  >
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#E5E8F1] dark:bg-[#2A3049] text-[#555E7E] dark:text-[#A7B0CF]">
                      Dead zone
                    </span>
                    <h4 className="font-semibold text-sm text-[#1C2540] dark:text-[#E8EBF6] mt-1.5">
                      {z.name} is mostly ignored
                    </h4>
                    <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1">
                      Only {pct}% of visitors enter it and they stay {z.dwell}s on average.
                    </p>
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => handleSelectZone(z.id)}
                        className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-full px-3 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors"
                      >
                        {selectedZone === z.id ? 'Unfocus' : 'Show on map'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Unmapped Hotspot */}
              <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-3 bg-white dark:bg-[#1A1F31]">
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#F4F6FB] dark:bg-[#222841] text-[#5A3FD0] dark:text-[#8F7DFF]">
                  Unmapped hotspot
                </span>
                <h4 className="font-semibold text-sm text-[#1C2540] dark:text-[#E8EBF6] mt-1.5">
                  People keep stopping by the pillar
                </h4>
                <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1">
                  {Math.round(HOTSPOT.share * 100)}% of all customer stops happen here,
                  about {HOTSPOT.dwell}s each, and no zone covers it. It is an unmonetized
                  promotional placement spot.
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setLayers((prev) => ({ ...prev, zones: true }))}
                    className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-full px-3 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors"
                  >
                    Show on map
                  </button>
                </div>
              </div>

              {/* Blind Spot */}
              <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-3 bg-white dark:bg-[#1A1F31]">
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#E5E8F1] dark:bg-[#2A3049] text-[#6B7390] dark:text-[#A2ABC8]">
                  Blind spot
                </span>
                <h4 className="font-semibold text-sm text-[#1C2540] dark:text-[#E8EBF6] mt-1.5">
                  Bakery is not seen well enough
                </h4>
                <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] mt-1">
                  Camera coverage is only about 30% there, so Pathwise reports it as
                  unknown instead of mischaracterizing it as dead.
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setLayers((prev) => ({ ...prev, conf: true }))}
                    className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-full px-3 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors"
                  >
                    Show coverage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ZONES */}
          {panelTab === 'zones' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9DFEC] dark:border-[#2B3352]">
                      <th className="pb-2 font-semibold text-[#5E678A] dark:text-[#A2ABC8]">
                        Zone
                      </th>
                      <th className="pb-2 font-semibold text-[#5E678A] dark:text-[#A2ABC8]">
                        Type
                      </th>
                      <th className="pb-2 font-semibold text-[#5E678A] dark:text-[#A2ABC8] text-right">
                        Visitors
                      </th>
                      <th className="pb-2 font-semibold text-[#5E678A] dark:text-[#A2ABC8] text-right">
                        Dwell
                      </th>
                      <th className="pb-2 font-semibold text-[#5E678A] dark:text-[#A2ABC8] text-right">
                        Seen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9DFEC] dark:divide-[#2B3352]">
                    {[...ZONES]
                      .sort((a, b) => b.visits - a.visits)
                      .map((z) => {
                        const c = classifyZone(z);
                        const isSelected = selectedZone === z.id;
                        const pct = Math.round((z.visits / 6000) * 100);
                        const badgeStyle = {
                          hot: 'bg-[#FCE7E0] dark:bg-[#3A2420] text-[#E4572E] dark:text-[#FF8359]',
                          pass: 'bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544]',
                          gem: 'bg-[#D9F1ED] dark:bg-[#17342F] text-[#14796D] dark:text-[#4CC9B8]',
                          dead: 'bg-[#E5E8F1] dark:bg-[#2A3049] text-[#555E7E] dark:text-[#A7B0CF]',
                          unknown: 'bg-[#E5E8F1] dark:bg-[#2A3049] text-[#6B7390] dark:text-[#A2ABC8]',
                        }[c];

                        return (
                          <tr
                            key={z.id}
                            onClick={() => handleSelectZone(z.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#F4F6FB] dark:bg-[#222841]'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-2.5 font-medium text-[#1C2540] dark:text-[#E8EBF6]">
                              {z.name}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-2xs font-bold ${badgeStyle}`}
                              >
                                {c === 'hot'
                                  ? 'Hot'
                                  : c === 'pass'
                                  ? 'Pass'
                                  : c === 'gem'
                                  ? 'Gem'
                                  : c === 'dead'
                                  ? 'Dead'
                                  : 'Not seen'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#1C2540] dark:text-[#E8EBF6]">
                              {pct}%
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#1C2540] dark:text-[#E8EBF6]">
                              {z.dwell}s
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#5E678A] dark:text-[#A2ABC8]">
                              {Math.round(z.conf * 100)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="text-2xs text-[#5E678A] dark:text-[#A2ABC8] mt-3 leading-relaxed">
                A zone is busy when ≥30% of daily visitors enter it, and sticky when
                they stay ≥30s. Zones seen less than half the time are marked not
                observed. Click a row to highlight on map.
              </p>
            </div>
          )}

          {/* TAB 3: WHAT-IF SIMULATOR */}
          {panelTab === 'whatif' && (
            <div className="space-y-3">
              <p className="text-xs text-[#5E678A] dark:text-[#A2ABC8] leading-relaxed">
                Drag <strong>display D1</strong> on the floor map to test a layout change
                in real time before touching physical shelves.
              </p>

              {/* Presets Bar */}
              <div className="bg-[#F4F6FB] dark:bg-[#222841] border border-[#D9DFEC] dark:border-[#2B3352] rounded-xl p-2">
                <div className="text-2xs font-semibold text-[#5E678A] dark:text-[#A2ABC8] mb-1.5">
                  Layout presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('reset')}
                    className="border border-[#D9DFEC] dark:border-[#2B3352] bg-white dark:bg-[#1A1F31] rounded-full px-2.5 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('entry')}
                    className="bg-[#5A3FD0] hover:bg-[#4C33B8] text-white rounded-full px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Move to entrance hall
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('aisle')}
                    className="border border-[#D9DFEC] dark:border-[#2B3352] bg-white dark:bg-[#1A1F31] rounded-full px-2.5 py-1 text-xs font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Push into Aisle 1
                  </button>
                </div>
              </div>

              {/* Dynamic Verdict Banner */}
              {!isMoved ? (
                <div className="rounded-xl p-3 text-xs bg-[#F4F6FB] dark:bg-[#222841] text-[#5E678A] dark:text-[#A2ABC8] border border-[#D9DFEC] dark:border-[#2B3352]">
                  Drag display D1 on the map, or try a preset. Pathwise re-runs the
                  passage capacity model as you move it.
                </div>
              ) : analysis.nBottleneck < baseAnalysis.nBottleneck ? (
                <div className="rounded-xl p-3 text-xs bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B] border border-[#1B7F4A]/20 leading-relaxed">
                  <strong>✓ This clears the bottleneck!</strong> The busiest passage is
                  now <strong>{worstNew.name}</strong> at {worstNew.U.toFixed(2)}.
                  <div className="mt-1 text-2xs opacity-90">
                    Trade-off: exposure changes from {formatNumber(e0.mid)} to{' '}
                    {formatNumber(e1.mid)} engaged shoppers/hr.
                  </div>
                </div>
              ) : analysis.nBottleneck > baseAnalysis.nBottleneck ||
                analysis.worstU > baseAnalysis.worstU + 0.05 ? (
                <div className="rounded-xl p-3 text-xs bg-[#FBE0E4] dark:bg-[#3C1D26] text-[#C81E36] dark:text-[#FF6B80] border border-[#C81E36]/20 leading-relaxed">
                  <strong>⚠️ This makes things worse.</strong> {worstNew.name} reaches{' '}
                  {Math.min(worstNew.U, 3).toFixed(2)}
                  {worstNew.U >= 2.9 ? ' and is effectively blocked.' : '.'}
                </div>
              ) : (
                <div className="rounded-xl p-3 text-xs bg-[#F4F6FB] dark:bg-[#222841] text-[#5E678A] dark:text-[#A2ABC8] border border-[#D9DFEC] dark:border-[#2B3352]">
                  No meaningful change to congestion at this hour.
                </div>
              )}

              {/* 4 Stat Tiles */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-2.5">
                  <div className="text-2xs text-[#5E678A] dark:text-[#A2ABC8]">
                    Worst passage
                  </div>
                  <div
                    className={`font-[family-name:var(--font-d)] font-bold text-lg mt-0.5 ${
                      worstNew.U < worstOld.U
                        ? 'text-[#1B7F4A] dark:text-[#58D08B]'
                        : worstNew.U > worstOld.U + 0.05
                        ? 'text-[#C81E36] dark:text-[#FF6B80]'
                        : 'text-[#1C2540] dark:text-[#E8EBF6]'
                    }`}
                  >
                    {Math.min(worstNew.U, 3).toFixed(2)}
                    <span className="font-normal text-2xs text-[#5E678A] dark:text-[#A2ABC8] ml-1">
                      was {worstOld.U.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-2.5">
                  <div className="text-2xs text-[#5E678A] dark:text-[#A2ABC8]">
                    Bottlenecks flagged
                  </div>
                  <div className="font-[family-name:var(--font-d)] font-bold text-lg mt-0.5 text-[#1C2540] dark:text-[#E8EBF6]">
                    {analysis.nBottleneck}
                    <span className="font-normal text-2xs text-[#5E678A] dark:text-[#A2ABC8] ml-1">
                      was {baseAnalysis.nBottleneck}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-2.5">
                  <div className="text-2xs text-[#5E678A] dark:text-[#A2ABC8]">
                    Speed at worst spot
                  </div>
                  <div className="font-[family-name:var(--font-d)] font-bold text-lg mt-0.5 text-[#1C2540] dark:text-[#E8EBF6]">
                    −{Math.round(worstNew.slow)}%
                    <span className="font-normal text-2xs text-[#5E678A] dark:text-[#A2ABC8] ml-1">
                      was −{Math.round(worstOld.slow)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-2.5">
                  <div className="text-2xs text-[#5E678A] dark:text-[#A2ABC8]">
                    Engaged at D1 / hr
                  </div>
                  <div className="font-[family-name:var(--font-d)] font-bold text-lg mt-0.5 text-[#1C2540] dark:text-[#E8EBF6]">
                    {formatNumber(e1.mid)}
                    <span className="font-normal text-2xs text-[#5E678A] dark:text-[#A2ABC8] block">
                      {formatNumber(e1.low)}–{formatNumber(e1.high)} (was {formatNumber(e0.mid)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Congestion by Passage Comparison */}
              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-1">
                  <h5 className="font-semibold text-xs text-[#1C2540] dark:text-[#E8EBF6]">
                    Congestion by passage
                  </h5>
                  <span className="text-2xs text-[#5E678A] dark:text-[#A2ABC8]">
                    Dark tick: Before | Bar: After
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {baseAnalysis.segs
                    .map((g) => {
                      const curSeg =
                        analysis.segs.find((s) => s.name === g.name) || g;
                      return { name: g.name, b: g.U, a: curSeg.U };
                    })
                    .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b))
                    .slice(0, 5)
                    .map((r) => {
                      const barCol =
                        r.a >= 1
                          ? 'bg-[#C81E36]'
                          : r.a >= 0.8
                          ? 'bg-[#B87500]'
                          : 'bg-[#14796D]';
                      const widthPct = Math.min(100, (r.a / 1.5) * 100);
                      const beforePct = Math.min(99, (r.b / 1.5) * 100);
                      const limitPct = (1.0 / 1.5) * 100;

                      return (
                        <div
                          key={r.name}
                          className="grid grid-cols-[100px_1fr_36px] gap-2 items-center text-xs"
                        >
                          <span
                            className="truncate text-[#5E678A] dark:text-[#A2ABC8]"
                            title={r.name}
                          >
                            {r.name}
                          </span>
                          <div className="relative h-2.5 bg-[#F4F6FB] dark:bg-[#222841] rounded-full overflow-visible">
                            {/* After bar */}
                            <div
                              className={`absolute left-0 top-0 bottom-0 rounded-full ${barCol}`}
                              style={{ width: `${widthPct}%` }}
                            />
                            {/* Capacity Limit Line (1.0) */}
                            <span
                              className="absolute -top-1 -bottom-1 w-[2px] bg-[#C81E36]/70 z-10"
                              style={{ left: `${limitPct}%` }}
                              title="Capacity threshold (1.0)"
                            />
                            {/* Before Tick */}
                            <span
                              className="absolute -top-1 -bottom-1 w-[2px] bg-[#1C2540] dark:bg-white z-10"
                              style={{ left: `${beforePct}%` }}
                              title={`Before: ${r.b.toFixed(2)}`}
                            />
                          </div>
                          <span className="font-mono text-right text-2xs text-[#1C2540] dark:text-[#E8EBF6]">
                            {Math.min(r.a, 3).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <p className="text-2xs text-[#5E678A] dark:text-[#A2ABC8] pt-1">
                Estimates come from a capacity-versus-demand model on dummy data. In
                production the model is calibrated on each store’s own footage and shown
                with ranges.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
