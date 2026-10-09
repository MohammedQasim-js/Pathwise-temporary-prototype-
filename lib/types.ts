export interface Rect {
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface PathFlow {
  id: string;
  name: string;
  weight: number;
  pts: [number, number][];
}

export interface SampledPathPoint {
  x: number;
  y: number;
  ux: number;
  uy: number;
  s: number;
}

export interface SampledPath {
  samples: SampledPathPoint[];
  length: number;
}

export type ZoneClassification = 'hot' | 'pass' | 'gem' | 'dead' | 'unknown';

export interface Zone {
  id: string;
  name: string;
  r: [number, number, number, number]; // [x, y, w, h] in metres
  visits: number;
  dwell: number;
  conf: number;
  stop: number;
}

export interface Hotspot {
  x: number;
  y: number;
  r: number;
  share: number;
  dwell: number;
}

export interface SegmentAnalysis {
  name: string;
  U: number;
  worst: {
    x: number;
    y: number;
    s: number;
    width: number;
    flow: number;
    U: number;
    ratio: number;
    seg: string;
  };
  status: 'bottleneck' | 'watch' | 'ok';
  slow: number; // percentage speed drop
}

export interface CapacityAnalysis {
  paths: {
    samples: {
      x: number;
      y: number;
      s: number;
      width: number;
      flow: number;
      U: number;
      ratio: number;
      seg: string;
    }[];
    length: number;
  }[];
  segs: SegmentAnalysis[];
  worstU: number;
  nBottleneck: number;
  nWatch: number;
}

export interface EngagedEstimate {
  pass: number;
  low: number;
  mid: number;
  high: number;
}

export interface LayerState {
  heat: boolean;
  dwell: boolean;
  flow: boolean;
  zones: boolean;
  conf: boolean;
}

export interface ShopperAgent {
  pi: number;
  s: number;
  off: number;
  v: number;
  pause: number;
  stops: number[];
  x: number;
  y: number;
  slow: boolean;
}

export interface ReplayState {
  seg: string;
  paths: boolean[];
  t: number;
  len: number;
}
