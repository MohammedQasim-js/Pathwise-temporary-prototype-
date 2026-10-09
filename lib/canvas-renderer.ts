import {
  W,
  NX,
  NY,
  ZONES,
  HOTSPOT,
  rectsFor,
  BASE_PATHS,
  PATHS,
  classifyZone,
  densityGrid,
  dwellGrid,
} from './store-engine';
import { Rect, LayerState, ShopperAgent, CapacityAnalysis } from './types';

export const COLORS = {
  paper: '#FAFBFD',
  ink: '#1C2540',
  wall: '#1C2540',
  shelf: '#DCE1EC',
  shelfLine: '#8B94AD',
  brand: '#5A3FD0',
  hot: '#E4572E',
  pass: '#E39A1F',
  gem: '#1F9E8E',
  dead: '#6B7390',
  unknown: '#9AA2BA',
  bad: '#D7263D',
  ok: '#1B7F4A',
};

export const CLASS_LABEL: Record<string, string> = {
  hot: 'Hot zone',
  pass: 'Pass-through',
  gem: 'Hidden gem',
  dead: 'Dead zone',
  unknown: 'Not observed',
};

function lut(stops: [number, number, number, number, number][]): Uint8ClampedArray {
  const out = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const a = stops[k];
    const b = stops[k + 1];
    const u = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
    for (let c = 0; c < 4; c++) {
      out[i * 4 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * u;
    }
  }
  return out;
}

const HEAT_LUT = lut([
  [0, 27, 31, 138, 0],
  [0.12, 58, 43, 168, 0],
  [0.3, 58, 43, 168, 95],
  [0.5, 176, 42, 143, 150],
  [0.75, 242, 107, 56, 190],
  [1, 255, 210, 63, 215],
]);

const VIOLET_LUT = lut([
  [0, 90, 63, 208, 0],
  [0.1, 90, 63, 208, 0],
  [0.45, 120, 98, 225, 120],
  [1, 70, 40, 190, 215],
]);

const CACHE: Record<string, HTMLCanvasElement> = {};

function gridCanvas(
  grid: Float32Array,
  max: number,
  table: Uint8ClampedArray
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = NX;
  c.height = NY;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const img = ctx.createImageData(NX, NY);
  for (let i = 0; i < grid.length; i++) {
    const v = Math.max(0, Math.min(1, grid[i] / max));
    const k = Math.round(v * 255);
    img.data[i * 4] = table[k * 4];
    img.data[i * 4 + 1] = table[k * 4 + 1];
    img.data[i * 4 + 2] = table[k * 4 + 2];
    img.data[i * 4 + 3] = table[k * 4 + 3];
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fg: string,
  bg: string,
  font: string,
  size: number
): number {
  ctx.font = `600 ${size}px ${font}`;
  const tw = ctx.measureText(text).width;
  const pw = size * 0.6;
  const h = size * 1.7;
  drawRoundedRect(ctx, x, y - h / 2, tw + pw * 2, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, x + pw, y + 0.5);
  return tw + pw * 2;
}

export interface DrawState {
  hour: number;
  layers: LayerState;
  disp: Rect;
  analysis: CapacityAnalysis;
  font: string;
  agents: ShopperAgent[];
  selectedZone: string | null;
  pulse: number;
  dragging: boolean;
  hoverDisplay: boolean;
  editable: boolean;
}

export function renderFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  st: DrawState
) {
  const S = w / W;
  const F = st.font || 'sans-serif';
  const L = st.layers;
  const px = (m: number) => m * S;

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, w, h);

  // Heat layer
  if (L.heat) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const kd = 'd' + st.hour;
    if (!CACHE[kd]) {
      CACHE[kd] = gridCanvas(densityGrid(st.hour), 1, HEAT_LUT);
    }
    ctx.drawImage(CACHE[kd], 0, 0, w, h);
  }

  // Dwell layer
  if (L.dwell) {
    ctx.imageSmoothingEnabled = true;
    const kw = 'w' + st.hour;
    if (!CACHE[kw]) {
      CACHE[kw] = gridCanvas(dwellGrid(st.hour), 1.1, VIOLET_LUT);
    }
    ctx.drawImage(CACHE[kw], 0, 0, w, h);
  }

  // Low confidence / coverage hatch
  if (L.conf) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(px(16), px(0), px(14), px(4.6));
    ctx.clip();
    ctx.fillStyle = 'rgba(154,162,186,0.22)';
    ctx.fillRect(px(16), 0, px(14), px(4.6));
    ctx.strokeStyle = 'rgba(28,37,64,0.35)';
    ctx.lineWidth = 1;
    for (let k = -h; k < w + h; k += 9) {
      ctx.beginPath();
      ctx.moveTo(px(16) + k - px(16), px(4.6));
      ctx.lineTo(px(16) + k - px(16) + px(4.6), 0);
      ctx.stroke();
    }
    ctx.restore();
    const fs2 = Math.max(10, S * 0.4);
    drawChip(
      ctx,
      'Camera blind spot: shown as unknown, never as dead',
      px(16.4),
      px(4.3),
      '#fff',
      '#4A5273',
      F,
      fs2
    );
  }

  // Zones
  ZONES.forEach((z) => {
    const cls = classifyZone(z);
    const col = (COLORS as Record<string, string>)[cls] || COLORS.dead;
    const r = z.r;
    const sel = st.selectedZone === z.id;

    if (L.zones || sel) {
      ctx.fillStyle = col;
      ctx.globalAlpha = sel ? 0.32 : 0.15;
      ctx.fillRect(px(r[0]), px(r[1]), px(r[2]), px(r[3]));
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col;
      ctx.lineWidth = sel ? 3.5 : 1.5;
      ctx.setLineDash(cls === 'unknown' ? [6, 4] : []);
      ctx.strokeRect(px(r[0]), px(r[1]), px(r[2]), px(r[3]));
      ctx.setLineDash([]);
    }

    const fs = Math.max(10, S * 0.42);
    if (L.zones) {
      const cx = px(r[0]) + 6;
      const cy = px(r[1]) + fs * 1.2;
      drawChip(ctx, z.name, cx, cy, '#fff', col, F, fs);
      if (S > 26) {
        ctx.font = `500 ${fs * 0.9}px ${F}`;
        ctx.fillStyle = COLORS.ink;
        ctx.textAlign = 'left';
        ctx.fillText(CLASS_LABEL[cls] || cls, cx + 2, cy + fs * 1.5);
      }
    } else {
      ctx.font = `500 ${fs}px ${F}`;
      ctx.fillStyle = 'rgba(28,37,64,0.62)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.name, px(r[0]) + 8, px(r[1]) + fs * 1.2);
    }
  });

  // Exterior wall architecture
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.wall;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

  // Fixtures and Shelves
  rectsFor(st.disp).forEach((r) => {
    if (r.id === 'D1') return;
    ctx.fillStyle = r.id === 'BILL' ? '#C9D0E2' : COLORS.shelf;
    ctx.strokeStyle = COLORS.shelfLine;
    ctx.lineWidth = 1.2;
    if (r.id === 'PILLAR') {
      ctx.fillStyle = COLORS.ink;
      ctx.strokeStyle = COLORS.ink;
    }
    ctx.fillRect(px(r.x), px(r.y), px(r.w), px(r.h));
    ctx.strokeRect(px(r.x), px(r.y), px(r.w), px(r.h));
    if (r.id !== 'PILLAR' && S > 22 && r.label) {
      ctx.font = `500 ${Math.max(9, S * 0.3)}px ${F}`;
      ctx.fillStyle = '#5F688A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.label, px(r.x + r.w / 2), px(r.y + r.h / 2));
    }
  });

  // Flows / Journeys
  if (L.flow) {
    BASE_PATHS.forEach((bp, i) => {
      ctx.strokeStyle = 'rgba(90,63,208,0.55)';
      ctx.lineWidth = Math.max(1.5, PATHS[i].weight * 0.45);
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      bp.samples.forEach((s, j) => {
        if (j === 0) ctx.moveTo(px(s.x), px(s.y));
        else ctx.lineTo(px(s.x), px(s.y));
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Flow direction chevrons
      for (let j = 6; j < bp.samples.length; j += 12) {
        const s = bp.samples[j];
        const a = Math.atan2(s.uy, s.ux);
        const x = px(s.x);
        const y = px(s.y);
        const q = Math.max(5, S * 0.22);
        ctx.fillStyle = COLORS.brand;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
        ctx.lineTo(x + Math.cos(a + 2.5) * q, y + Math.sin(a + 2.5) * q);
        ctx.lineTo(x + Math.cos(a - 2.5) * q, y + Math.sin(a - 2.5) * q);
        ctx.fill();
      }
    });
  }

  // Unmapped Hotspot
  if (L.zones) {
    const hs = HOTSPOT;
    ctx.strokeStyle = COLORS.brand;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(px(hs.x), px(hs.y), px(hs.r), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    drawChip(
      ctx,
      `Unmapped hotspot · ${Math.round(hs.share * 100)}% of stops`,
      px(hs.x) - px(1.2),
      px(hs.y) + px(1.9),
      '#fff',
      COLORS.brand,
      F,
      Math.max(10, S * 0.38)
    );
  }

  // Entrance door mark
  ctx.font = `600 ${Math.max(10, S * 0.4)}px ${F}`;
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Entrance', px(0.6), px(19.35));

  // Display D1 (with drag / hover effects)
  const d = st.disp;
  const hover = st.dragging || st.hoverDisplay;
  ctx.save();
  ctx.shadowColor = 'rgba(28,37,64,0.35)';
  ctx.shadowBlur = hover ? 14 : 6;
  ctx.shadowOffsetY = 3;
  drawRoundedRect(ctx, px(d.x), px(d.y), px(d.w), px(d.h), 5);
  ctx.fillStyle = COLORS.brand;
  ctx.fill();
  ctx.restore();

  ctx.font = `700 ${Math.max(11, S * 0.42)}px ${F}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    st.editable ? 'D1 · drag me' : 'Display D1',
    px(d.x + d.w / 2),
    px(d.y + d.h / 2)
  );

  // Bottleneck indicators & pulse rings
  st.analysis.segs.forEach((g) => {
    if (g.status === 'ok') return;
    const col = g.status === 'bottleneck' ? COLORS.bad : COLORS.pass;
    const x = px(g.worst.x);
    const y = px(g.worst.y);
    const pulse = st.pulse || 0;
    const rad = px(1.1) + pulse * px(0.25);

    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1 - pulse * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = col;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.arc(x, y, px(1.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawChip(
      ctx,
      `${g.status === 'bottleneck' ? 'Bottleneck ' : 'Watch '} ${g.U.toFixed(2)}`,
      Math.max(6, x - px(1.2)),
      y - px(1.9),
      '#fff',
      col,
      F,
      Math.max(10, S * 0.38)
    );
  });

  // Shopper Agents (anonymous dots)
  (st.agents || []).forEach((a) => {
    ctx.beginPath();
    ctx.arc(px(a.x), px(a.y), Math.max(3, S * 0.2), 0, Math.PI * 2);
    ctx.fillStyle = a.slow ? COLORS.bad : COLORS.ink;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  });

  ctx.restore();
}
