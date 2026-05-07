import { useEffect, useRef } from "react";

import type { CityArtifact } from "../features/city-data/schema";
import type { FoodSource, TrailSnapshot } from "../features/physarum/types";
import type { RouteResult } from "../features/routes/extractRoutes";

interface SimulatorCanvasProps {
  city: CityArtifact | undefined;
  foods: FoodSource[];
  route: RouteResult | undefined;
  trail: TrailSnapshot | undefined;
  onDropFood: (point: { x: number; y: number }) => void;
}

export function SimulatorCanvas({
  city,
  foods,
  route,
  trail,
  onDropFood,
}: SimulatorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    draw(canvas, city, foods, route, trail);
  }, [city, foods, route, trail]);

  return (
    <div className="canvas-shell">
      <canvas
        ref={canvasRef}
        aria-label="Slime mold route map"
        className="sim-canvas"
        role="img"
        tabIndex={0}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          onDropFood({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          });
        }}
      />
    </div>
  );
}

function draw(
  canvas: HTMLCanvasElement,
  city: CityArtifact | undefined,
  foods: FoodSource[],
  route: RouteResult | undefined,
  trail: TrailSnapshot | undefined,
) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.floor(rect.width * dpr));
  const height = Math.max(420, Math.floor(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  const cssWidth = width / dpr;
  const cssHeight = height / dpr;
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawBackground(ctx, cssWidth, cssHeight);

  if (trail) {
    drawTrail(ctx, trail, cssWidth, cssHeight);
  }

  if (city) {
    drawLayers(ctx, city, cssWidth, cssHeight);
    drawEdges(ctx, city, cssWidth, cssHeight);
    if (route) {
      drawRoute(ctx, city, route, cssWidth, cssHeight);
    }
    drawNodes(ctx, city, foods, cssWidth, cssHeight);
  }

  drawFoods(ctx, foods, cssWidth, cssHeight);
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#101820");
  gradient.addColorStop(0.45, "#18242a");
  gradient.addColorStop(1, "#111619");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: TrailSnapshot,
  width: number,
  height: number,
) {
  const image = new ImageData(trail.width, trail.height);
  for (let index = 0; index < trail.values.length; index += 1) {
    const value = Math.min(1, Math.max(0, trail.values[index]));
    const offset = index * 4;
    image.data[offset] = Math.floor(40 + value * 210);
    image.data[offset + 1] = Math.floor(120 + value * 120);
    image.data[offset + 2] = Math.floor(130 - value * 70);
    image.data[offset + 3] = Math.floor(value * 210);
  }
  const buffer = document.createElement("canvas");
  buffer.width = trail.width;
  buffer.height = trail.height;
  const bufferContext = buffer.getContext("2d");
  if (!bufferContext) {
    return;
  }
  bufferContext.putImageData(image, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(buffer, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}

function drawLayers(
  ctx: CanvasRenderingContext2D,
  city: CityArtifact,
  width: number,
  height: number,
) {
  for (const layer of city.layers) {
    ctx.beginPath();
    layer.points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    if (layer.kind === "water" || layer.kind === "park") {
      ctx.closePath();
      ctx.fillStyle =
        layer.kind === "water" ? "rgba(54, 125, 145, 0.22)" : "rgba(91, 135, 89, 0.22)";
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(99, 179, 237, 0.46)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  city: CityArtifact,
  width: number,
  height: number,
) {
  const nodeById = new Map(city.nodes.map((node) => [node.id, node]));
  ctx.lineCap = "round";
  for (const edge of city.edges) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) {
      continue;
    }
    ctx.strokeStyle =
      edge.mode === "metro" ? "rgba(138, 180, 248, 0.45)" : "rgba(209, 213, 219, 0.28)";
    ctx.lineWidth = edge.mode === "waterbus" ? 1.8 : 2.2;
    ctx.beginPath();
    ctx.moveTo(from.x * width, from.y * height);
    ctx.lineTo(to.x * width, to.y * height);
    ctx.stroke();
  }
}

function drawRoute(
  ctx: CanvasRenderingContext2D,
  city: CityArtifact,
  route: RouteResult,
  width: number,
  height: number,
) {
  const nodeById = new Map(city.nodes.map((node) => [node.id, node]));
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(248, 210, 74, 0.55)";
  ctx.shadowBlur = 16;
  for (const edge of route.edges) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) {
      continue;
    }
    ctx.strokeStyle = "#f8d24a";
    ctx.lineWidth = 3 + edge.trailScore * 4;
    ctx.beginPath();
    ctx.moveTo(from.x * width, from.y * height);
    ctx.lineTo(to.x * width, to.y * height);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  city: CityArtifact,
  foods: FoodSource[],
  width: number,
  height: number,
) {
  const foodNodeIds = new Set(foods.map((food) => food.nodeId));
  ctx.textAlign = "center";
  ctx.font = "11px Inter, system-ui, sans-serif";

  for (const node of city.nodes) {
    const x = node.x * width;
    const y = node.y * height;
    ctx.fillStyle = foodNodeIds.has(node.id) ? "#f8d24a" : "#ecfdf5";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, foodNodeIds.has(node.id) ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(245, 247, 251, 0.78)";
    ctx.fillText(node.label, x, y - 10);
  }
}

function drawFoods(
  ctx: CanvasRenderingContext2D,
  foods: FoodSource[],
  width: number,
  height: number,
) {
  for (const food of foods) {
    const x = food.x * width;
    const y = food.y * height;
    const gradient = ctx.createRadialGradient(x, y, 3, x, y, 22);
    gradient.addColorStop(0, "rgba(248, 210, 74, 0.95)");
    gradient.addColorStop(1, "rgba(248, 210, 74, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
}
