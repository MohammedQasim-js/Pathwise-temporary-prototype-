'use client';

import React, { useState } from 'react';
import {
  PEAK_IDX,
  HOURS,
  ZONES,
  HOTSPOT,
  DISPLAY0,
  ACTION_DISPLAY,
  DISPLAY_STOP_RATE,
  analyzeCapacity,
  estimateEngaged,
  passersby,
  formatNumber,
} from '@/lib/store-engine';
import { Printer, Copy, Check, TrendingUp, AlertOctagon } from 'lucide-react';

export function ReportView() {
  const [copied, setCopied] = useState(false);

  // Compute baseline and recommended fix metrics at peak
  const base = analyzeCapacity(DISPLAY0, PEAK_IDX);
  const fix = analyzeCapacity(ACTION_DISPLAY, PEAK_IDX);

  const a2 = base.segs.find((g) => g.name === 'Aisle 2 entrance') || base.segs[0];
  const a2f = fix.segs.find((g) => g.name === 'Aisle 2 entrance') || fix.segs[0];

  const e0 = estimateEngaged(DISPLAY0, base, PEAK_IDX);
  const e1 = estimateEngaged(ACTION_DISPLAY, fix, PEAK_IDX);

  const bev = ZONES.find((z) => z.id === 'bev')!;
  const passBev = passersby(16, 7.3, 1.5, PEAK_IDX);
  const lift = passBev * (DISPLAY_STOP_RATE - bev.stop);

  const pillarPass = passersby(HOTSPOT.x, HOTSPOT.y, 2.5, PEAK_IDX);
  const pillarEngaged = pillarPass * DISPLAY_STOP_RATE;

  // Find hours where Aisle 2 is congested
  const congestedHours = HOURS.filter((_, i) => {
    const an = analyzeCapacity(DISPLAY0, i);
    const seg = an.segs.find((g) => g.name === 'Aisle 2 entrance');
    return seg && seg.U >= 0.8;
  });

  const span = congestedHours.length
    ? `from ${String(congestedHours[0]).padStart(2, '0')}:00 to ${String(
        congestedHours[congestedHours.length - 1] + 1
      ).padStart(2, '0')}:00`
    : 'at no hour';

  const hz = ZONES.find((z) => z.id === 'house')!;
  const se = ZONES.find((z) => z.id === 'season')!;

  const handleCopySummary = () => {
    const summary = `Pathwise layout action report (dummy data)
1. Move display D1 out of the Aisle 2 entrance: utilisation ${a2.U.toFixed(
      2
    )} to ${a2f.U.toFixed(2)}
2. Add a promo end-cap in Beverages: +${formatNumber(
      lift * 0.65
    )} to +${formatNumber(lift * 1.35)} engaged shoppers an hour
3. Use the pillar hotspot: ${formatNumber(
      pillarEngaged * 0.65
    )} to +${formatNumber(pillarEngaged * 1.35)} engaged shoppers an hour`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        },
        () => {}
      );
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-[920px] mx-auto bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-6 sm:p-10 shadow-xs">
      {/* Top action toolbar (hidden when printing) */}
      <div className="flex justify-end gap-2.5 pb-6 border-b border-[#D9DFEC] dark:border-[#2B3352] mb-6 print:hidden">
        <button
          type="button"
          onClick={handleCopySummary}
          className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-[#1C2540] dark:text-[#E8EBF6] hover:bg-[#F4F6FB] dark:hover:bg-[#222841] transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Copied to clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#5E678A] dark:text-[#A2ABC8]" />
              <span>Copy summary</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-[#5A3FD0] hover:bg-[#4C33B8] text-white rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print or save as PDF</span>
        </button>
      </div>

      {/* Report Header */}
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-d)] font-bold text-3xl sm:text-4xl text-[#1C2540] dark:text-[#E8EBF6] tracking-tight">
          Layout action report
        </h1>
        <p className="text-xs sm:text-sm text-[#5E678A] dark:text-[#A2ABC8]">
          Week of 28 Sep to 4 Oct 2026 · Demo Mart, Mumbai · every number here is dummy data
        </p>
        <p className="text-sm text-[#1C2540] dark:text-[#E8EBF6] leading-relaxed max-w-[68ch] pt-2">
          Pathwise ranked this week’s findings by how much they cost you and how easy
          they are to fix. Each action shows the evidence, the change to make, and what
          the layout model expects to happen.
        </p>
      </div>

      {/* Top 4 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-7">
        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-3.5">
          <b className="font-[family-name:var(--font-d)] font-bold text-3xl text-[#1C2540] dark:text-[#E8EBF6] block mb-1">
            {base.nBottleneck}
          </b>
          <span className="text-xs text-[#5E678A] dark:text-[#A2ABC8]">
            Bottleneck at peak, {base.nWatch} on watch
          </span>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-3.5">
          <b className="font-[family-name:var(--font-d)] font-bold text-3xl text-[#1C2540] dark:text-[#E8EBF6] block mb-1">
            2
          </b>
          <span className="text-xs text-[#5E678A] dark:text-[#A2ABC8]">
            Dead zones identified
          </span>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-3.5">
          <b className="font-[family-name:var(--font-d)] font-bold text-3xl text-[#1C2540] dark:text-[#E8EBF6] block mb-1">
            1
          </b>
          <span className="text-xs text-[#5E678A] dark:text-[#A2ABC8]">
            Unmapped pillar hotspot
          </span>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-3.5">
          <b className="font-[family-name:var(--font-d)] font-bold text-3xl text-[#1C2540] dark:text-[#E8EBF6] block mb-1">
            1
          </b>
          <span className="text-xs text-[#5E678A] dark:text-[#A2ABC8]">
            Blind spot (excluded from rank)
          </span>
        </div>
      </div>

      {/* Action 1 */}
      <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_270px] gap-6">
        <div>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-xl text-[#1C2540] dark:text-[#E8EBF6] flex items-center gap-2.5 mb-3">
            <span className="inline-flex w-7 h-7 rounded-full bg-[#5A3FD0] text-white items-center justify-center text-sm font-bold shrink-0">
              1
            </span>
            <span>Move display D1 out of the Aisle 2 entrance</span>
          </h3>

          <dl className="space-y-2 text-xs sm:text-sm">
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Problem</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                At 19:00 the passage at the Aisle 2 entrance is {a2.worst.width.toFixed(1)} m wide for about {formatNumber(a2.worst.flow * 60)} shoppers an hour. Demand is {Math.round(a2.U * 100)}% of capacity.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Evidence</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                Walking speed falls about {Math.round(a2.slow)}% at the choke point. The passage is above 80% of capacity {span}.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Change</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                Relocate D1 to the entrance hall, about 8.5 m inside the main doors.
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-4 self-start">
          <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] font-medium">
            Simulated impact
          </div>
          <div className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1B7F4A] dark:text-[#58D08B] my-1">
            {a2.U.toFixed(2)} → {a2f.U.toFixed(2)}
          </div>
          <div className="text-xs text-[#1C2540] dark:text-[#E8EBF6] leading-relaxed">
            Utilisation at choke point. Trade-off: engaged shoppers at D1 shift from
            ~{formatNumber(e0.mid)} to ~{formatNumber(e1.mid)}/hr (range{' '}
            {formatNumber(e1.low)}–{formatNumber(e1.high)}). Actions 2 and 3 recover that
            dwell exposure.
          </div>
          <div className="flex gap-2 flex-wrap mt-3 pt-2 border-t border-[#D9DFEC]/50 dark:border-[#2B3352]/50">
            <span className="bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Confidence: High
            </span>
            <span className="bg-[#F4F6FB] dark:bg-[#222841] border border-[#5A3FD0]/30 text-[#5A3FD0] dark:text-[#8F7DFF] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Effort: &lt; 1 hour
            </span>
          </div>
        </div>
      </div>

      {/* Action 2 */}
      <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_270px] gap-6">
        <div>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-xl text-[#1C2540] dark:text-[#E8EBF6] flex items-center gap-2.5 mb-3">
            <span className="inline-flex w-7 h-7 rounded-full bg-[#5A3FD0] text-white items-center justify-center text-sm font-bold shrink-0">
              2
            </span>
            <span>Give Beverages a reason to stop</span>
          </h3>

          <dl className="space-y-2 text-xs sm:text-sm">
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Problem</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                {Math.round((bev.visits / 6000) * 100)}% of visitors walk through Beverages, but only {Math.round(bev.stop * 100)}% stop, for {bev.dwell}s on average.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Evidence</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                It is a pass-through zone: extremely high volume traffic, but almost no customer dwell.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Change</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                Add an impulse promotional end-cap display at the mouth of Aisle 1 where the traffic flow makes a 90° turn.
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-4 self-start">
          <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] font-medium">
            Simulated impact
          </div>
          <div className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1B7F4A] dark:text-[#58D08B] my-1">
            +{formatNumber(lift * 0.65)} to +{formatNumber(lift * 1.35)}
          </div>
          <div className="text-xs text-[#1C2540] dark:text-[#E8EBF6] leading-relaxed">
            Extra engaged shoppers per hour at peak, applying the store’s calibrated
            end-cap conversion rate of {Math.round(DISPLAY_STOP_RATE * 100)}%.
          </div>
          <div className="flex gap-2 flex-wrap mt-3 pt-2 border-t border-[#D9DFEC]/50 dark:border-[#2B3352]/50">
            <span className="bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Confidence: Medium
            </span>
            <span className="bg-[#F4F6FB] dark:bg-[#222841] border border-[#5A3FD0]/30 text-[#5A3FD0] dark:text-[#8F7DFF] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Effort: Half a day
            </span>
          </div>
        </div>
      </div>

      {/* Action 3 */}
      <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_270px] gap-6">
        <div>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-xl text-[#1C2540] dark:text-[#E8EBF6] flex items-center gap-2.5 mb-3">
            <span className="inline-flex w-7 h-7 rounded-full bg-[#5A3FD0] text-white items-center justify-center text-sm font-bold shrink-0">
              3
            </span>
            <span>Use the pillar: shoppers already stop there</span>
          </h3>

          <dl className="space-y-2 text-xs sm:text-sm">
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Problem</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                {Math.round(HOTSPOT.share * 100)}% of all store dwell stops happen at the entrance hall pillar, and no merchandise or signage is currently located there.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Evidence</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                Shoppers pause ~{HOTSPOT.dwell}s. Found automatically by DBSCAN cluster analysis because the spot sits outside every mapped department.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Change</dt>
              <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                Install a wrapped pillar shelving stand or promotional pegboard.
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-4 self-start">
          <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] font-medium">
            Simulated impact
          </div>
          <div className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1B7F4A] dark:text-[#58D08B] my-1">
            {formatNumber(pillarEngaged * 0.65)} to {formatNumber(pillarEngaged * 1.35)}
          </div>
          <div className="text-xs text-[#1C2540] dark:text-[#E8EBF6] leading-relaxed">
            Engaged customer interactions per hour converted into measurable,
            monetized retail placement.
          </div>
          <div className="flex gap-2 flex-wrap mt-3 pt-2 border-t border-[#D9DFEC]/50 dark:border-[#2B3352]/50">
            <span className="bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Confidence: Medium
            </span>
            <span className="bg-[#F4F6FB] dark:bg-[#222841] border border-[#5A3FD0]/30 text-[#5A3FD0] dark:text-[#8F7DFF] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Effort: &lt; 1 hour
            </span>
          </div>
        </div>
      </div>

      {/* Watchlist Section */}
      <h2 className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1C2540] dark:text-[#E8EBF6] mt-8 mb-4">
        Watchlist
      </h2>

      <div className="space-y-4">
        {/* Watchlist 1 */}
        <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_270px] gap-6">
          <div>
            <h3 className="font-[family-name:var(--font-d)] font-bold text-lg text-[#1C2540] dark:text-[#E8EBF6] mb-2">
              Household and Seasonal look dead, but check the cause first
            </h3>
            <dl className="space-y-2 text-xs sm:text-sm">
              <div>
                <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Evidence</dt>
                <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                  Only {Math.round((hz.visits / 6000) * 100)}% and{' '}
                  {Math.round((se.visits / 6000) * 100)}% of visitors enter them,
                  staying {hz.dwell}s and {se.dwell}s respectively.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Why wait</dt>
                <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                  Household sits directly behind the Aisle 2 bottleneck. Fix Action 1
                  first and re-measure for 2 weeks before rearranging stock.
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-4 self-start">
            <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] font-medium">
              Recommended action
            </div>
            <div className="font-[family-name:var(--font-d)] font-bold text-xl text-[#1C2540] dark:text-[#E8EBF6] my-1">
              Re-measure post fix
            </div>
            <span className="inline-block mt-2 bg-[#E5E8F1] dark:bg-[#2A3049] text-[#555E7E] dark:text-[#A7B0CF] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Confidence: Low
            </span>
          </div>
        </div>

        {/* Watchlist 2 */}
        <div className="border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_270px] gap-6">
          <div>
            <h3 className="font-[family-name:var(--font-d)] font-bold text-lg text-[#1C2540] dark:text-[#E8EBF6] mb-2">
              Bakery is a camera blind spot
            </h3>
            <dl className="space-y-2 text-xs sm:text-sm">
              <div>
                <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Evidence</dt>
                <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                  Only about 30% of the Bakery department is covered reliably by
                  overhead surveillance cameras.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#5E678A] dark:text-[#A2ABC8]">Change</dt>
                <dd className="text-[#1C2540] dark:text-[#E8EBF6] mt-0.5">
                  Re-aim existing overhead camera or install a secondary sensor.
                  Pathwise excludes it from dead-zone rankings until visual coverage
                  improves.
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#F4F6FB] dark:bg-[#222841] rounded-xl p-4 self-start">
            <div className="text-xs text-[#5E678A] dark:text-[#A2ABC8] font-medium">
              Recommended action
            </div>
            <div className="font-[family-name:var(--font-d)] font-bold text-xl text-[#1C2540] dark:text-[#E8EBF6] my-1">
              Fix camera angle
            </div>
            <span className="inline-block mt-2 bg-[#E5E8F1] dark:bg-[#2A3049] text-[#6B7390] dark:text-[#A2ABC8] rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Not observed
            </span>
          </div>
        </div>
      </div>

      <p className="text-2xs text-[#5E678A] dark:text-[#A2ABC8] mt-8 pt-4 border-t border-[#D9DFEC] dark:border-[#2B3352]">
        Estimates come from a capacity-versus-demand model and a typical stop rate on
        dummy data. Production reports show confidence ranges calibrated on each store’s
        own footage.
      </p>
    </div>
  );
}
