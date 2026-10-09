'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  W,
  H,
  FACTOR,
  PATHS,
  BASE_PATHS,
  DWELL_SPOTS_FOR_AGENTS,
  isBlocked,
  rectsFor,
} from '@/lib/store-engine';
import {
  renderFloor,
  DrawState,
} from '@/lib/canvas-renderer';
import {
  Rect,
  LayerState,
  CapacityAnalysis,
  ShopperAgent,
  ReplayState,
} from '@/lib/types';
import { X } from 'lucide-react';

interface FloorCanvasProps {
  hour: number;
  layers: LayerState;
  display: Rect;
  analysis: CapacityAnalysis;
  selectedZone: string | null;
  isEditable: boolean;
  isPaused: boolean;
  replayState: ReplayState | null;
  onDisplayChange: (newDisp: Rect) => void;
  onCloseReplay: () => void;
}

export function FloorCanvas({
  hour,
  layers,
  display,
  analysis,
  selectedZone,
  isEditable,
  isPaused,
  replayState,
  onDisplayChange,
  onCloseReplay,
}: FloorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverDisplay, setHoverDisplay] = useState(false);
  const [replayTimeStr, setReplayTimeStr] = useState<string>('18:42:00');
  const grabOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  const agentsRef = useRef<ShopperAgent[]>([]);
  const accumulatorsRef = useRef<number[]>([0, 0, 0, 0]);
  const replayTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(-1);

  // Initialize random values on mount outside render
  useEffect(() => {
    accumulatorsRef.current = PATHS.map(() => Math.random());
    lastTimeRef.current = performance.now();
  }, []);

  // Pre-calculate stops for agent spawning
  const stopsRef = useRef<number[][]>([]);
  useEffect(() => {
    stopsRef.current = PATHS.map((_, i) => {
      const list: { s: number; p: number }[] = [];
      DWELL_SPOTS_FOR_AGENTS.forEach((d) => {
        let bestS = 0;
        let bd = 1e9;
        BASE_PATHS[i].samples.forEach((s) => {
          const dd = Math.hypot(s.x - d[0], s.y - d[1]);
          if (dd < bd) {
            bd = dd;
            bestS = s.s;
          }
        });
        if (bd < 1.4) list.push({ s: bestS, p: d[2] });
      });
      return list.sort((a, b) => a.s - b.s).map((x) => x.s);
    });
  }, []);

  const spawnAgent = useCallback((pi: number) => {
    const stops = (stopsRef.current[pi] || []).filter(() => Math.random() < 0.7);
    agentsRef.current.push({
      pi,
      s: 0,
      off: (Math.random() - 0.5) * 0.7,
      v: 1.0 + Math.random() * 0.3,
      pause: 0,
      stops: [...stops],
      x: 0,
      y: 0,
      slow: false,
    });
  }, []);

  const stepSimulation = useCallback(
    (dt: number) => {
      const f = FACTOR[hour];
      const rep = replayState;
      const SIM = 4.5;

      PATHS.forEach((p, i) => {
        if (rep && !rep.paths[i]) return;
        accumulatorsRef.current[i] +=
          ((p.weight * f) / 60) * SIM * dt * (rep ? 2.2 : 1);
        while (accumulatorsRef.current[i] >= 1) {
          accumulatorsRef.current[i] -= 1;
          if (agentsRef.current.length < 160) {
            spawnAgent(i);
          }
        }
      });

      const currentDisp = display;
      const currentRects = rectsFor(currentDisp);

      agentsRef.current = agentsRef.current.filter((a) => {
        const path = analysis.paths[a.pi];
        if (!path) return false;
        const idx = Math.min(
          path.samples.length - 1,
          Math.floor(a.s / 0.5)
        );
        const sm = path.samples[idx];
        if (!sm) return false;

        if (a.pause > 0) {
          a.pause -= dt;
        } else {
          a.s += a.v * SIM * sm.ratio * dt;
          if (a.stops.length && a.s >= a.stops[0]) {
            a.stops.shift();
            a.pause = 1.0 + Math.random() * 2.2;
          }
        }

        a.slow = sm.ratio < 0.8;
        const b = BASE_PATHS[a.pi]?.samples[idx] || sm;
        const ox = -b.uy * a.off;
        const oy = b.ux * a.off;
        let x = sm.x + ox;
        let y = sm.y + oy;

        if (isBlocked(x, y, currentRects)) {
          x = sm.x;
          y = sm.y;
        }

        a.x = x;
        a.y = y;
        return a.s < path.length;
      });
    },
    [analysis, display, hour, replayState, spawnAgent]
  );

  // Seed initial agents on load
  useEffect(() => {
    for (let i = 0; i < 60; i++) {
      stepSimulation(0.25);
    }
  }, [stepSimulation]);

  // Handle Canvas Resize and DPI Scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const clientWidth = entry.contentRect.width;
        if (clientWidth > 0) {
          canvas.width = Math.round(clientWidth * dpr);
          canvas.height = Math.round((clientWidth * dpr * 2) / 3);
        }
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      pulseRef.current = (Math.sin(time * 0.0024) + 1) / 2;

      if (!isPaused && !document.hidden) {
        stepSimulation(dt);
        if (replayState) {
          replayTimerRef.current += dt;
          if (replayTimerRef.current > replayState.len) {
            replayTimerRef.current = 0;
          }
          const sec = Math.min(
            119,
            Math.floor((replayTimerRef.current / replayState.len) * 120)
          );
          if (sec !== lastSecondRef.current) {
            lastSecondRef.current = sec;
            const mins = 42 + Math.floor(sec / 60);
            const secs = sec % 60;
            setReplayTimeStr(
              `18:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            );
          }
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const font =
            typeof window !== 'undefined'
              ? getComputedStyle(document.body).fontFamily || 'sans-serif'
              : 'sans-serif';

          const drawState: DrawState = {
            hour,
            layers,
            disp: display,
            analysis,
            font,
            agents: agentsRef.current,
            selectedZone,
            pulse: isPaused ? 0.2 : pulseRef.current,
            dragging: isDragging,
            hoverDisplay,
            editable: isEditable,
          };

          renderFloor(ctx, canvas.width, canvas.height, drawState);
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    analysis,
    display,
    hour,
    hoverDisplay,
    isDragging,
    isEditable,
    isPaused,
    layers,
    replayState,
    selectedZone,
    stepSimulation,
  ]);

  // Pointer interaction for moving Display D1
  const toMetres = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const isOnDisplay = (m: { x: number; y: number }) => {
    const d = display;
    return (
      m.x >= d.x - 0.3 &&
      m.x <= d.x + d.w + 0.3 &&
      m.y >= d.y - 0.3 &&
      m.y <= d.y + d.h + 0.3
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEditable) return;
    const m = toMetres(e);
    if (isOnDisplay(m)) {
      grabOffsetRef.current = { dx: m.x - display.x, dy: m.y - display.y };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const m = toMetres(e);
    if (!isDragging) {
      setHoverDisplay(isEditable && isOnDisplay(m));
      return;
    }
    if (!grabOffsetRef.current) return;

    const nx = Math.round((m.x - grabOffsetRef.current.dx) * 4) / 4;
    const ny = Math.round((m.y - grabOffsetRef.current.dy) * 4) / 4;
    const clampedX = Math.max(0.2, Math.min(W - display.w - 0.2, nx));
    const clampedY = Math.max(0.2, Math.min(H - display.h - 0.2, ny));

    onDisplayChange({
      ...display,
      x: clampedX,
      y: clampedY,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    grabOffsetRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-[#FAFBFD] border border-[#D9DFEC] dark:border-[#2B3352] shadow-inner select-none"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Store floor plan with live shopper movement, heat map and flagged bottlenecks"
        className={`block w-full h-auto aspect-3/2 transition-cursor ${
          isEditable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Evidence Replay Bar Overlay */}
      {replayState && (
        <div className="absolute top-2.5 left-2.5 right-2.5 bg-[#1C2540]/95 text-white backdrop-blur-md rounded-lg px-3 py-2 flex items-center justify-between text-xs sm:text-sm border border-white/10 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4572E] animate-ping" />
            <span className="font-semibold text-white">Evidence replay</span>
            <span className="text-[#A2ABC8]">·</span>
            <span className="text-amber-300 font-medium">{replayState.seg}</span>
            <span className="text-[#A2ABC8] hidden md:inline">·</span>
            <span className="font-mono text-emerald-400 hidden md:inline">
              {replayTimeStr}
            </span>
            <span className="text-[#A2ABC8] text-xs hidden lg:inline">
              (anonymous dots, no video stored)
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseReplay}
            className="ml-3 shrink-0 bg-white hover:bg-slate-100 text-[#1C2540] rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close replay</span>
          </button>
        </div>
      )}
    </div>
  );
}
