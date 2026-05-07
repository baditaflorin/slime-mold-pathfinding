export type EngineKind = "webgpu" | "cpu";

export interface FoodSource {
  id: string;
  label: string;
  x: number;
  y: number;
  nodeId?: string;
  strength: number;
}

export interface TrailSnapshot {
  width: number;
  height: number;
  values: Float32Array;
}

export interface SimulationStats {
  engine: EngineKind;
  agents: number;
  fps: number;
  ticks: number;
  webgpuAvailable: boolean;
}

export interface SimulationFrame {
  trail: TrailSnapshot;
  stats: SimulationStats;
}
