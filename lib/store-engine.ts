import {
  Rect,
  PathFlow,
  SampledPath,
  Zone,
  ZoneClassification,
  Hotspot,
  CapacityAnalysis,
  EngagedEstimate,
} from './types';

export const W = 30; // store width in metres
export const H = 20; // store height in metres
export const Q_MAX = 0.12; // shop-aisle capacity, persons / s / m of usable width
export const W_MIN = 0.4; // unusable edge margin (m)
export const DAILY = 6000; // daily visitors
export const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
export const FACTOR = [0.35, 0.5, 0.65, 0.85, 0.9, 0.7, 0.6, 0.7, 0.85, 1.0, 1.15, 1.0, 0.7];
export const PEAK_IDX = 10; // 19:00

export const STATIC_FIXTURES: Rect[] = [
  { id: 'A', x: 6, y: 5.0, w: 20, h: 1.2, label: 'Shelf row A' },
  { id: 'B', x: 6, y: 8.4, w: 20, h: 1.2, label: 'Shelf row B' },
  { id: 'C', x: 6, y: 11.8, w: 20, h: 1.2, label: 'Shelf row C' },
  { id: 'BILL', x: 18, y: 16.5, w: 9, h: 1.3, label: 'Billing counters' },
  { id: 'PILLAR', x: 14.2, y: 15.6, w: 0.6, h: 0.6, label: 'Pillar' },
];

export const DISPLAY0: Rect = { x: 3.0, y: 9.0, w: 3.0, h: 1.4, label: 'Display D1' };
export const ACTION_DISPLAY: Rect = { x: 8.5, y: 14.8, w: 3.0, h: 1.4, label: 'Display D1 (relocated)' };

export const PATHS: PathFlow[] = [
  { id: 'P1', name: 'Aisle 1 run', weight: 6.0, pts: [[2, 19.5], [2.5, 12], [2.5, 7.3], [6, 7.3], [26, 7.3], [28, 7.3], [28, 12], [25, 15.3]] },
  { id: 'P2', name: 'Aisle 2 run', weight: 5.0, pts: [[2, 19.5], [2.5, 12], [2.5, 10.7], [6, 10.7], [26, 10.7], [28, 10.7], [28, 13], [24.5, 15.3]] },
  { id: 'P3', name: 'Fresh run', weight: 4.5, pts: [[2, 19.5], [2.5, 10], [2.5, 2.5], [8, 2.5], [26, 2.5], [28, 3], [28, 12], [25.5, 15.3]] },
  { id: 'P4', name: 'Front hall', weight: 5.5, pts: [[2, 19.5], [8, 17.6], [13.5, 16.7], [20, 15.3], [23.5, 15.3]] },
];

export const ZONES: Zone[] = [
  { id: 'produce', name: 'Produce', r: [6, 0.2, 10, 4.6], visits: 2900, dwell: 48, conf: 0.9, stop: 0.42 },
  { id: 'bakery', name: 'Bakery', r: [16, 0.2, 12, 4.6], visits: 1300, dwell: 31, conf: 0.3, stop: 0.30 },
  { id: 'snacks', name: 'Snacks', r: [6, 6.2, 10, 2.2], visits: 2400, dwell: 41, conf: 0.9, stop: 0.38 },
  { id: 'bev', name: 'Beverages', r: [16, 6.2, 10, 2.2], visits: 2600, dwell: 9, conf: 0.9, stop: 0.07 },
  { id: 'dairy', name: 'Dairy', r: [6, 9.6, 10, 2.2], visits: 1000, dwell: 52, conf: 0.9, stop: 0.55 },
  { id: 'house', name: 'Household', r: [16, 9.6, 10, 2.2], visits: 420, dwell: 7, conf: 0.9, stop: 0.09 },
  { id: 'season', name: 'Seasonal', r: [26, 4.6, 4, 8.4], visits: 560, dwell: 12, conf: 0.85, stop: 0.12 },
  { id: 'entry', name: 'Entrance hall', r: [0, 13, 17, 7], visits: 5800, dwell: 11, conf: 0.95, stop: 0.06 },
  { id: 'billing', name: 'Billing', r: [17, 13, 13, 7], visits: 5200, dwell: 74, conf: 0.95, stop: 0.80 },
];

export const HOTSPOT: Hotspot = { x: 14.5, y: 15.9, r: 1.1, share: 0.12, dwell: 17 };

export const DWELL_SPOTS: [number, number, number][] = [
  [11, 2.5, 0.8],
  [10, 7.3, 0.9],
  [11, 10.7, 0.85],
  [23, 15, 1.0],
  [14.5, 15.9, 0.6],
  [21, 7.3, 0.12],
  [28.2, 8, 0.18],
  [22, 2.5, 0.3],
];

export const DWELL_SPOTS_FOR_AGENTS: [number, number, number][] = DWELL_SPOTS.map((d) => [
  d[0],
  d[1],
  Math.min(1, d[2]),
]);

export function classifyZone(z: Zone): ZoneClassification {
  if (z.conf < 0.5) return 'unknown';
  const hiT = z.visits / DAILY >= 0.30;
  const hiD = z.dwell >= 30;
  if (hiT && hiD) return 'hot';
  if (hiT) return 'pass';
  if (hiD) return 'gem';
  return 'dead';
}

export function rectsFor(d: Rect): Rect[] {
  return [...STATIC_FIXTURES, { id: 'D1', x: d.x, y: d.y, w: d.w, h: d.h, label: 'Display D1' }];
}

export function isBlocked(x: number, y: number, rects: Rect[]): boolean {
  if (x < 0.05 || y < 0.05 || x > W - 0.05 || y > H - 0.05) return true;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  }
  return false;
}

export function samplePath(p: PathFlow, step = 0.5): SampledPath {
  const out: SampledPath['samples'] = [];
  let s = 0;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i];
    const b = p.pts[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const n = Math.max(1, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({ x: a[0] + dx * t, y: a[1] + dy * t, ux, uy, s: s + len * t });
    }
    s += len;
  }
  const l = p.pts[p.pts.length - 1];
  out.push({ x: l[0], y: l[1], ux: out[out.length - 1]?.ux || 0, uy: out[out.length - 1]?.uy || 0, s });
  return { samples: out, length: s };
}

export const BASE_PATHS = PATHS.map((p) => samplePath(p, 0.5));

export function distToPath(p: PathFlow, x: number, y: number): number {
  let best = 1e9;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i];
    const b = p.pts[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
    best = Math.min(best, Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy)));
  }
  return best;
}

export function segName(x: number, y: number): string {
  if (x >= 2.5 && x <= 8 && y >= 8.8 && y <= 12.2) return 'Aisle 2 entrance';
  if (x < 6 && y < 13) return 'Left cross-aisle';
  if (y >= 13 && x >= 17) return 'Billing approach';
  if (y >= 13) return 'Entrance hall';
  if (x >= 26) return 'Right cross-aisle';
  if (y < 5) return 'Fresh corridor';
  if (y < 8.4) return 'Aisle 1';
  if (y < 11.8) return 'Aisle 2';
  return 'Mid hall';
}

export function ray(x: number, y: number, nx: number, ny: number, rects: Rect[]): number {
  let d = 0;
  while (d < 4) {
    d += 0.1;
    if (isBlocked(x + nx * d, y + ny * d, rects)) return d - 0.1;
  }
  return 4;
}

export function analyzeCapacity(disp: Rect, hIdx: number): CapacityAnalysis {
  const rects = rectsFor(disp);
  const f = FACTOR[hIdx];
  const paths: CapacityAnalysis['paths'] = [];

  BASE_PATHS.forEach((bp) => {
    const snapped = bp.samples.map((s) => {
      let x = s.x;
      let y = s.y;
      const nx = -s.uy;
      const ny = s.ux;

      if (isBlocked(x, y, rects)) {
        let found = false;
        for (let k = 1; k <= 40 && !found; k++) {
          for (let sg = -1; sg <= 1; sg += 2) {
            const tx = x + nx * 0.1 * k * sg;
            const ty = y + ny * 0.1 * k * sg;
            if (!isBlocked(tx, ty, rects)) {
              x = tx;
              y = ty;
              found = true;
              break;
            }
          }
        }
      }

      const width = ray(x, y, nx, ny, rects) + ray(x, y, -nx, -ny, rects);
      let flowSum = 0;
      for (let q = 0; q < PATHS.length; q++) {
        if (distToPath(PATHS[q], x, y) < Math.max(width / 2, 1) + 0.3) {
          flowSum += PATHS[q].weight;
        }
      }

      const cap = Q_MAX * Math.max(width - W_MIN, 0.05) * 60;
      const U = Math.min(3, (flowSum * f) / cap);
      return {
        x,
        y,
        s: s.s,
        width,
        flow: flowSum * f,
        U,
        ratio: 1 / (1 + 0.6 * Math.pow(U, 4)),
        seg: segName(x, y),
      };
    });
    paths.push({ samples: snapped, length: bp.length });
  });

  const segsRecord: Record<string, { name: string; U: number; worst: CapacityAnalysis['paths'][0]['samples'][0] }> = {};

  paths.forEach((p) => {
    p.samples.forEach((s) => {
      if (s.y > 18.5) return; // door area is not a layout issue
      const g = segsRecord[s.seg] || (segsRecord[s.seg] = { name: s.seg, U: 0, worst: s });
      if (s.U > g.U) {
        g.U = s.U;
        g.worst = s;
      }
    });
  });

  const list = Object.keys(segsRecord)
    .map((k) => segsRecord[k])
    .sort((a, b) => b.U - a.U)
    .map((g) => ({
      name: g.name,
      U: g.U,
      worst: g.worst,
      status: (g.U >= 1 ? 'bottleneck' : g.U >= 0.8 ? 'watch' : 'ok') as 'bottleneck' | 'watch' | 'ok',
      slow: (1 - g.worst.ratio) * 100,
    }));

  return {
    paths,
    segs: list,
    worstU: list.length ? list[0].U : 0,
    nBottleneck: list.filter((g) => g.status === 'bottleneck').length,
    nWatch: list.filter((g) => g.status === 'watch').length,
  };
}

export function passersby(x: number, y: number, r: number, hIdx: number): number {
  let t = 0;
  PATHS.forEach((p) => {
    if (distToPath(p, x, y) <= r) {
      t += p.weight * FACTOR[hIdx] * 60;
    }
  });
  return t;
}

export const DISPLAY_STOP_RATE = 0.12;

export function estimateEngaged(disp: Rect, an: CapacityAnalysis, hIdx: number): EngagedEstimate {
  const cx = disp.x + disp.w / 2;
  const cy = disp.y + disp.h / 2;
  const pass = passersby(cx, cy, 2.5, hIdx);
  let U = 0;
  an.segs.forEach((g) => {
    if (Math.hypot(g.worst.x - cx, g.worst.y - cy) < 3.5) {
      U = Math.max(U, g.U);
    }
  });
  const penalty = 1 - 0.5 * Math.max(0, Math.min(1, (U - 0.8) / 0.4));
  const mid = pass * DISPLAY_STOP_RATE * penalty;
  return { pass, low: mid * 0.65, mid, high: mid * 1.35 };
}

// Gaussian-splat grids for heat layers
export const CELL = 0.4;
export const NX = Math.round(W / CELL);
export const NY = Math.round(H / CELL);

export function splat(points: [number, number, number][], sigma: number, scale: number): Float32Array {
  const g = new Float32Array(NX * NY);
  const inv = 1 / (2 * sigma * sigma);
  const rad = Math.ceil((sigma * 3) / CELL);

  points.forEach((p) => {
    const cx = Math.floor(p[0] / CELL);
    const cy = Math.floor(p[1] / CELL);
    for (let j = cy - rad; j <= cy + rad; j++) {
      for (let i = cx - rad; i <= cx + rad; i++) {
        if (i < 0 || j < 0 || i >= NX || j >= NY) continue;
        const dx = (i + 0.5) * CELL - p[0];
        const dy = (j + 0.5) * CELL - p[1];
        g[j * NX + i] += p[2] * Math.exp(-(dx * dx + dy * dy) * inv) * scale;
      }
    }
  });
  return g;
}

// Compute normalization constant for density grid
let HEAT_K = 1;
export function densityGrid(hIdx: number): Float32Array {
  const pts: [number, number, number][] = [];
  const f = FACTOR[hIdx];
  BASE_PATHS.forEach((bp, i) => {
    bp.samples.forEach((s) => {
      pts.push([s.x, s.y, PATHS[i].weight * f]);
    });
  });
  return splat(pts, 0.9, HEAT_K);
}

// Initial calibration
(() => {
  const g = densityGrid(PEAK_IDX);
  let m = 0;
  for (let i = 0; i < g.length; i++) m = Math.max(m, g[i]);
  HEAT_K = m > 0 ? 1 / m : 1;
})();

export function dwellGrid(hIdx: number): Float32Array {
  const f = FACTOR[hIdx];
  return splat(
    DWELL_SPOTS.map((d) => [d[0], d[1], d[2] * f] as [number, number, number]),
    1.2,
    1.0
  );
}

export function confAt(x: number, y: number): number {
  return x >= 16 && y <= 4.6 ? 0.3 : 1;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

export function formatHour(idx: number): string {
  return String(HOURS[idx]).padStart(2, '0') + ':00';
}
