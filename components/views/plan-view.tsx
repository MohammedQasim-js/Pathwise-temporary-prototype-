'use client';

import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Clock,
  Layers,
  Shield,
  Workflow,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ModelItem {
  title: string;
  status: 'To build' | 'Built on dummy data' | 'Stretch';
  hours: string;
  approach: string;
  data: string;
  target: string;
}

const MODELS: ModelItem[] = [
  {
    title: 'Person detector',
    status: 'To build',
    hours: 'H3–12',
    approach: 'Pretrained YOLO11 or RT-DETR; fine-tune only if time allows',
    data: 'COCO weights; CrowdHuman and a few labelled frames as a stretch',
    target: 'Recall of 0.90 or better at 8–10 FPS',
  },
  {
    title: 'Multi-object tracker',
    status: 'To build',
    hours: 'H3–12',
    approach: 'ByteTrack first; BoT-SORT with appearance features if IDs switch',
    data: 'Our own footage plus a public pedestrian clip',
    target: 'IDF1 of 0.80 or better on a short labelled clip',
  },
  {
    title: 'Camera calibration',
    status: 'To build',
    hours: 'H3–12',
    approach: 'Click-to-calibrate homography (4+ points), lens undistortion if needed',
    data: 'One floor plan and reference points per camera',
    target: 'Floor-plan error of 0.3 m or less at check points',
  },
  {
    title: 'Staff versus shopper filter',
    status: 'To build',
    hours: 'H12–24',
    approach: 'Simple rules: staff-only zones, path length, uniform colour cue',
    data: 'Labelled tracks from our footage',
    target: '90% accuracy or better on a small sample',
  },
  {
    title: 'Zone and dwell engine',
    status: 'To build',
    hours: 'H12–24',
    approach: 'State machine with hysteresis for enter, dwell and exit',
    data: 'Zones we draw, manual stopwatch timings',
    target: 'Dwell error of 3–5 s or less',
  },
  {
    title: 'Bottleneck and dead-zone model',
    status: 'Built on dummy data',
    hours: 'H24–36',
    approach: 'Capacity-versus-demand score with observation confidence',
    data: 'Tracks from our footage; capacity set by hand',
    target: 'Flags match a manual walk-through',
  },
  {
    title: 'Zone discovery',
    status: 'Built on dummy data',
    hours: 'H24–36',
    approach: 'DBSCAN on stop events; flags unmapped hotspots',
    data: 'Stop events from the tracker',
    target: 'Hotspots match what we see on video',
  },
  {
    title: 'What-if layout simulator',
    status: 'Built on dummy data',
    hours: 'H24–36',
    approach: 'Capacity model on real flow; agent simulation is a later step',
    data: 'Flow measured from our footage',
    target: 'Direction of change matches common sense checks',
  },
  {
    title: 'Layout action report',
    status: 'Built on dummy data',
    hours: 'H24–36',
    approach: 'Rules rank actions; text is built from computed metrics only',
    data: 'Outputs of the models above',
    target: 'Three actions, each with evidence',
  },
  {
    title: 'Privacy and edge layer',
    status: 'To build',
    hours: 'Throughout',
    approach: 'Anonymous temporary IDs, metadata only, no faces, no raw video kept',
    data: 'Nothing personal is stored',
    target: 'Zero biometric fields in storage',
  },
  {
    title: 'Dense-crowd counting',
    status: 'Stretch',
    hours: 'If time allows',
    approach: 'Density-map model (DM-Count or CSRNet) where people overlap too much',
    data: 'ShanghaiTech, UCF-QNRF, JHU-Crowd++ weights',
    target: 'Count error within 15% on a crowded clip',
  },
  {
    title: 'Cross-camera matching',
    status: 'Stretch',
    hours: 'After hackathon',
    approach: 'Appearance embeddings (OSNet) plus floor-plan position & time gating',
    data: 'Two overlapping camera views',
    target: 'Same person keeps one ID across cameras',
  },
];

const PHASES = [
  {
    hours: 'H0–3',
    title: 'Setup',
    desc: 'Repo, footage, roles and data contract. Interface and decision logic already prototyped.',
    accent: 'border-[#5A3FD0]',
  },
  {
    hours: 'H3–12',
    title: 'Foundations',
    desc: 'Detector and tracker on real footage, camera calibration, API and storage. Checkpoint: real tracks move on floor.',
    accent: 'border-[#5A3FD0]',
  },
  {
    hours: 'H12–24',
    title: 'Core analytics',
    desc: 'Zones, dwell engine, heat map, dashboard wired to live data. Checkpoint: heat map & dwell table from video.',
    accent: 'border-[#5A3FD0]',
  },
  {
    hours: 'H24–36',
    title: 'Intelligence',
    desc: 'Bottlenecks, dead zones, what-if, action report. Checkpoint: feature freeze, complete working MVP.',
    accent: 'border-[#5A3FD0]',
  },
  {
    hours: 'H36–48',
    title: 'Harden and demo',
    desc: 'Validate against manual counts, fix bugs, record backup demo, rehearse pitch, submit by H46.',
    accent: 'border-[#E39A1F]',
  },
];

export function PlanView() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-d)] font-bold text-3xl sm:text-4xl text-[#1C2540] dark:text-[#E8EBF6] tracking-tight">
          Build plan
        </h1>
        <p className="text-sm text-[#5E678A] dark:text-[#A2ABC8] max-w-[70ch] mt-1.5 leading-relaxed">
          This prototype runs on dummy shopper paths and is our head start. During the
          48-hour build we replace the dummy paths with tracks from real footage.
          Below is what we build and when.
        </p>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Working Now */}
        <div className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 shadow-xs">
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B] mb-2">
            Working now
          </span>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-lg text-[#1C2540] dark:text-[#E8EBF6]">
            Interface & decision logic
          </h3>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[#5E678A] dark:text-[#A2ABC8] list-disc pl-4">
            <li>Interactive heat map, shopper journeys, zone types</li>
            <li>Dynamic bottleneck score ($U$) & live alerts</li>
            <li>What-if drag simulator & ranked action report</li>
          </ul>
        </div>

        {/* Tested Separately */}
        <div className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 shadow-xs">
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#F4F6FB] dark:bg-[#222841] text-[#5A3FD0] dark:text-[#8F7DFF] mb-2">
            Tested separately
          </span>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-lg text-[#1C2540] dark:text-[#E8EBF6]">
            Analytics code
          </h3>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[#5E678A] dark:text-[#A2ABC8] list-disc pl-4">
            <li>DBSCAN zone discovery found unmapped pillar hotspot</li>
            <li>What-if model flagged display that choked Aisle 2</li>
            <li>Gaussian density splatting calibrated at peak hour</li>
          </ul>
        </div>

        {/* Built in 48 Hours */}
        <div className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-5 shadow-xs">
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544] mb-2">
            Built in the 48 hours
          </span>
          <h3 className="font-[family-name:var(--font-d)] font-bold text-lg text-[#1C2540] dark:text-[#E8EBF6]">
            Computer vision models
          </h3>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[#5E678A] dark:text-[#A2ABC8] list-disc pl-4">
            <li>YOLO11 person detector & ByteTrack on real footage</li>
            <li>Interactive 4-point camera-to-floor calibration</li>
            <li>Staff uniform color filter & dwell hysteresis engine</li>
          </ul>
        </div>
      </div>

      {/* Models to Build */}
      <div>
        <h2 className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1C2540] dark:text-[#E8EBF6] mb-4">
          Models to build
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODELS.map((m) => {
            const statusBadge =
              m.status === 'Built on dummy data'
                ? 'bg-[#DDF3E6] dark:bg-[#16352A] text-[#1B7F4A] dark:text-[#58D08B]'
                : m.status === 'To build'
                ? 'bg-[#FBEFD6] dark:bg-[#3A2F17] text-[#B87500] dark:text-[#F2B544]'
                : 'bg-[#E5E8F1] dark:bg-[#2A3049] text-[#6B7390] dark:text-[#A2ABC8]';

            return (
              <div
                key={m.title}
                className="bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-2xs font-bold ${statusBadge}`}
                  >
                    {m.status}
                  </span>
                  <span className="inline-block rounded-full px-2 py-0.5 text-2xs font-semibold bg-[#F4F6FB] dark:bg-[#222841] text-[#5A3FD0] dark:text-[#8F7DFF]">
                    {m.hours}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-d)] font-bold text-base text-[#1C2540] dark:text-[#E8EBF6]">
                  {m.title}
                </h3>

                <dl className="mt-2.5 space-y-1 text-xs grid grid-cols-[70px_1fr] gap-x-2">
                  <dt className="text-[#5E678A] dark:text-[#A2ABC8] font-medium">Approach</dt>
                  <dd className="text-[#1C2540] dark:text-[#E8EBF6]">{m.approach}</dd>

                  <dt className="text-[#5E678A] dark:text-[#A2ABC8] font-medium">Data</dt>
                  <dd className="text-[#1C2540] dark:text-[#E8EBF6]">{m.data}</dd>

                  <dt className="text-[#5E678A] dark:text-[#A2ABC8] font-medium">Target</dt>
                  <dd className="text-[#1C2540] dark:text-[#E8EBF6] font-medium text-emerald-600 dark:text-emerald-400">
                    {m.target}
                  </dd>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* 48-Hour Plan */}
      <div>
        <h2 className="font-[family-name:var(--font-d)] font-bold text-2xl text-[#1C2540] dark:text-[#E8EBF6] mb-4">
          48-hour plan timeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PHASES.map((p, idx) => (
            <div
              key={p.hours}
              className={`bg-white dark:bg-[#1A1F31] border border-[#D9DFEC] dark:border-[#2B3352] rounded-2xl p-4 shadow-xs relative flex flex-col justify-between`}
            >
              <div>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-2xs font-bold bg-[#F4F6FB] dark:bg-[#222841] text-[#5A3FD0] dark:text-[#8F7DFF] mb-2">
                  {p.hours}
                </span>
                <h3 className="font-[family-name:var(--font-d)] font-bold text-sm text-[#1C2540] dark:text-[#E8EBF6]">
                  {p.title}
                </h3>
                <p className="text-2xs text-[#5E678A] dark:text-[#A2ABC8] mt-1.5 leading-relaxed">
                  {p.desc}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#D9DFEC]/50 dark:border-[#2B3352]/50 text-2xs font-mono text-[#5E678A] dark:text-[#A2ABC8]">
                Phase 0{idx + 1}
              </div>
            </div>
          ))}
        </div>
        <p className="text-2xs text-[#5E678A] dark:text-[#A2ABC8] mt-3">
          Hours are counted from the start of the hackathon. Targets are goals to validate,
          not final commercial results.
        </p>
      </div>
    </div>
  );
}
