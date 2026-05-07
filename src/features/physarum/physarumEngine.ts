import type { CityArtifact, CityEdge } from "../city-data/schema";
import type { FoodSource, SimulationFrame, TrailSnapshot } from "./types";
import { WebGpuDiffuser } from "./webgpuDiffuser";

interface Agent {
  x: number;
  y: number;
  angle: number;
}

export interface PhysarumEngineOptions {
  width?: number;
  height?: number;
  agentCount?: number;
}

export class PhysarumEngine {
  private readonly width: number;
  private readonly height: number;
  private readonly agents: Agent[];
  private readonly railField: Float32Array;
  private readonly scratch: Float32Array;
  private trail: Float32Array;
  private foods: FoodSource[] = [];
  private diffuser: WebGpuDiffuser | undefined;
  private engine: "cpu" | "webgpu" = "cpu";
  private ticks = 0;
  private fps = 0;
  private lastFpsTime = performance.now();
  private framesSinceFps = 0;
  private readonly random: () => number;

  constructor(
    private readonly city: CityArtifact,
    options: PhysarumEngineOptions = {},
  ) {
    this.width = options.width ?? 192;
    this.height = options.height ?? 192;
    this.random = mulberry32(hashString(city.city.slug));
    this.trail = new Float32Array(this.width * this.height);
    this.scratch = new Float32Array(this.width * this.height);
    this.railField = buildRailField(city, this.width, this.height);
    this.agents = createAgents(options.agentCount ?? 2400, city, this.random);
    this.seedTrail();
  }

  async initialize(): Promise<void> {
    try {
      this.diffuser = await WebGpuDiffuser.create(this.width, this.height);
      this.engine = "webgpu";
    } catch {
      this.diffuser = undefined;
      this.engine = "cpu";
    }
  }

  setFoods(foods: FoodSource[]) {
    this.foods = foods;
    this.seedFoodSources();
    if (foods.length > 0) {
      this.reseedAgentsNearFood();
    }
  }

  async step(): Promise<SimulationFrame> {
    this.moveAgents();
    this.addFoodGlow();

    if (this.diffuser && this.ticks % 2 === 0) {
      this.trail = await this.diffuser.diffuse(this.trail);
    } else {
      this.diffuseCPU();
    }

    this.ticks += 1;
    this.framesSinceFps += 1;
    const now = performance.now();
    if (now - this.lastFpsTime > 500) {
      this.fps = Math.round((this.framesSinceFps * 1000) / (now - this.lastFpsTime));
      this.framesSinceFps = 0;
      this.lastFpsTime = now;
    }

    return {
      trail: this.snapshot(),
      stats: {
        engine: this.engine,
        agents: this.agents.length,
        fps: this.fps,
        ticks: this.ticks,
        webgpuAvailable: Boolean(navigator.gpu),
      },
    };
  }

  snapshot(): TrailSnapshot {
    return {
      width: this.width,
      height: this.height,
      values: this.trail.slice(),
    };
  }

  private moveAgents() {
    const turnAngle = 0.42;
    const sensorAngle = 0.64;
    const speed = 0.0065;

    for (const agent of this.agents) {
      const forward = this.sense(agent, 0);
      const left = this.sense(agent, -sensorAngle);
      const right = this.sense(agent, sensorAngle);

      if (left > forward && left > right) {
        agent.angle -= turnAngle;
      } else if (right > forward && right > left) {
        agent.angle += turnAngle;
      } else {
        agent.angle += (this.random() - 0.5) * 0.18;
      }

      agent.x += Math.cos(agent.angle) * speed;
      agent.y += Math.sin(agent.angle) * speed;

      if (agent.x < 0 || agent.x > 1) {
        agent.angle = Math.PI - agent.angle;
        agent.x = clamp(agent.x, 0, 1);
      }
      if (agent.y < 0 || agent.y > 1) {
        agent.angle = -agent.angle;
        agent.y = clamp(agent.y, 0, 1);
      }

      const index = this.indexAt(agent.x, agent.y);
      this.trail[index] = Math.min(1, this.trail[index] + 0.2);
    }
  }

  private sense(agent: Agent, angleOffset: number) {
    const sensorDistance = 0.025;
    const angle = agent.angle + angleOffset;
    const x = clamp(agent.x + Math.cos(angle) * sensorDistance, 0, 1);
    const y = clamp(agent.y + Math.sin(angle) * sensorDistance, 0, 1);
    const index = this.indexAt(x, y);
    return (
      this.trail[index] * 1.1 + this.railField[index] * 0.75 + this.foodAt(x, y) * 1.8
    );
  }

  private foodAt(x: number, y: number) {
    let value = 0;
    for (const food of this.foods) {
      const distance = Math.hypot(food.x - x, food.y - y);
      value += Math.max(0, 1 - distance / 0.16) * food.strength;
    }
    return Math.min(1, value);
  }

  private diffuseCPU() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const index = y * this.width + x;
        const left = this.trail[y * this.width + Math.max(0, x - 1)];
        const right = this.trail[y * this.width + Math.min(this.width - 1, x + 1)];
        const up = this.trail[Math.max(0, y - 1) * this.width + x];
        const down = this.trail[Math.min(this.height - 1, y + 1) * this.width + x];
        const average = (left + right + up + down) * 0.25;
        this.scratch[index] = clamp(
          (this.trail[index] * 0.76 + average * 0.24) * 0.966,
          0,
          1,
        );
      }
    }
    this.trail.set(this.scratch);
  }

  private addFoodGlow() {
    for (const food of this.foods) {
      for (let ring = 0; ring < 24; ring += 1) {
        const angle = (ring / 24) * Math.PI * 2;
        const radius = 0.004 + this.random() * 0.018;
        const x = clamp(food.x + Math.cos(angle) * radius, 0, 1);
        const y = clamp(food.y + Math.sin(angle) * radius, 0, 1);
        const index = this.indexAt(x, y);
        this.trail[index] = Math.min(1, this.trail[index] + 0.22 * food.strength);
      }
    }
  }

  private seedTrail() {
    for (let index = 0; index < this.trail.length; index += 1) {
      this.trail[index] = this.railField[index] * 0.22 + this.random() * 0.015;
    }
  }

  private seedFoodSources() {
    for (const food of this.foods) {
      for (let index = 0; index < 80; index += 1) {
        const angle = this.random() * Math.PI * 2;
        const radius = this.random() * 0.035;
        const x = clamp(food.x + Math.cos(angle) * radius, 0, 1);
        const y = clamp(food.y + Math.sin(angle) * radius, 0, 1);
        this.trail[this.indexAt(x, y)] = Math.min(
          1,
          this.trail[this.indexAt(x, y)] + 0.5,
        );
      }
    }
  }

  private reseedAgentsNearFood() {
    for (let index = 0; index < this.agents.length; index += 7) {
      const food = this.foods[index % this.foods.length];
      if (!food) {
        continue;
      }
      this.agents[index] = {
        x: clamp(food.x + (this.random() - 0.5) * 0.04, 0, 1),
        y: clamp(food.y + (this.random() - 0.5) * 0.04, 0, 1),
        angle: this.random() * Math.PI * 2,
      };
    }
  }

  private indexAt(x: number, y: number) {
    const gridX = Math.min(this.width - 1, Math.max(0, Math.floor(x * this.width)));
    const gridY = Math.min(this.height - 1, Math.max(0, Math.floor(y * this.height)));
    return gridY * this.width + gridX;
  }
}

function buildRailField(city: CityArtifact, width: number, height: number) {
  const field = new Float32Array(width * height);
  for (const edge of city.edges) {
    rasterizeEdge(city, edge, width, height, field);
  }
  blurField(field, width, height, 5);
  return field;
}

function rasterizeEdge(
  city: CityArtifact,
  edge: CityEdge,
  width: number,
  height: number,
  field: Float32Array,
) {
  const from = city.nodes.find((node) => node.id === edge.from);
  const to = city.nodes.find((node) => node.id === edge.to);
  if (!from || !to) {
    return;
  }
  const steps = Math.max(8, Math.ceil(Math.hypot(from.x - to.x, from.y - to.y) * 260));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const gridX = Math.min(width - 1, Math.max(0, Math.floor(x * width)));
    const gridY = Math.min(height - 1, Math.max(0, Math.floor(y * height)));
    field[gridY * width + gridX] = 1;
  }
}

function blurField(field: Float32Array, width: number, height: number, passes: number) {
  const scratch = new Float32Array(field.length);
  for (let pass = 0; pass < passes; pass += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        const left = field[y * width + Math.max(0, x - 1)];
        const right = field[y * width + Math.min(width - 1, x + 1)];
        const up = field[Math.max(0, y - 1) * width + x];
        const down = field[Math.min(height - 1, y + 1) * width + x];
        scratch[index] = Math.max(
          field[index] * 0.72,
          (left + right + up + down) * 0.08,
        );
      }
    }
    field.set(scratch);
  }
}

function createAgents(
  count: number,
  city: CityArtifact,
  random: () => number,
): Agent[] {
  return Array.from({ length: count }, (_, index) => {
    const anchor = city.nodes[index % city.nodes.length];
    return {
      x: clamp(anchor.x + (random() - 0.5) * 0.1, 0, 1),
      y: clamp(anchor.y + (random() - 0.5) * 0.1, 0, 1),
      angle: random() * Math.PI * 2,
    };
  });
}

function mulberry32(seed: number) {
  return function next() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
