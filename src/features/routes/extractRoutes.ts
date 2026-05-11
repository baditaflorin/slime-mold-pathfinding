import type { CityArtifact, CityEdge, CityNode } from "../city-data/schema";
import type { FoodSource, TrailSnapshot } from "../physarum/types";

export interface RouteEdge extends CityEdge {
  trailScore: number;
  routeCost: number;
}

export interface RouteResult {
  terminalNodeIds: string[];
  nodeIds: string[];
  edges: RouteEdge[];
  totalCost: number;
}

interface AdjacentEdge {
  edge: CityEdge;
  other: string;
}

interface DijkstraResult {
  cost: number;
  edgeIds: string[];
}

export function extractRouteNetwork(
  city: CityArtifact,
  foods: FoodSource[],
  trail: TrailSnapshot | undefined,
): RouteResult {
  const terminals = unique(
    foods
      .map((food) => food.nodeId ?? nearestNode(city.nodes, food).id)
      .filter(Boolean),
  );

  if (terminals.length < 2) {
    return { terminalNodeIds: terminals, nodeIds: terminals, edges: [], totalCost: 0 };
  }

  const edgeById = new Map(city.edges.map((edge) => [edge.id, edge]));
  const adjacency = buildAdjacency(city.edges);
  const connected = new Set<string>([terminals[0]]);
  const remaining = new Set(terminals.slice(1));
  const selectedEdgeIds = new Set<string>();
  let totalCost = 0;

  // Cache full single-source shortest-path trees keyed by start node. The
  // previous implementation called shortestPath for every (connected, remaining)
  // pair on every iteration — O(k³ · V²) for k terminals and V nodes. Now each
  // start node is expanded at most once and the inner loop is a hash-map lookup.
  const ssspCache = new Map<string, ShortestPathTree>();
  const treeFor = (start: string) => {
    let tree = ssspCache.get(start);
    if (!tree) {
      tree = dijkstraTree(city, adjacency, start, trail);
      ssspCache.set(start, tree);
    }
    return tree;
  };

  while (remaining.size > 0) {
    let bestTarget = "";
    let bestPath: DijkstraResult | undefined;

    for (const from of connected) {
      const tree = treeFor(from);
      for (const to of remaining) {
        const cost = tree.distances.get(to);
        if (cost === undefined || !Number.isFinite(cost)) {
          continue;
        }
        if (!bestPath || cost < bestPath.cost) {
          bestTarget = to;
          bestPath = { cost, edgeIds: tracebackEdges(tree.previous, from, to) };
        }
      }
    }

    if (!bestPath || bestTarget === "") {
      break;
    }

    bestPath.edgeIds.forEach((edgeID) => selectedEdgeIds.add(edgeID));
    totalCost += bestPath.cost;
    connected.add(bestTarget);
    remaining.delete(bestTarget);
  }

  const routeEdges = [...selectedEdgeIds]
    .map((edgeID) => edgeById.get(edgeID))
    .filter((edge): edge is CityEdge => Boolean(edge))
    .map((edge) => {
      const trailScore = sampleEdgeTrail(city, edge, trail);
      return {
        ...edge,
        trailScore,
        routeCost: edge.weight / (0.35 + trailScore),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const routeNodeIds = unique(
    routeEdges.flatMap((edge) => [edge.from, edge.to]).concat(terminals),
  ).sort();

  return {
    terminalNodeIds: terminals,
    nodeIds: routeNodeIds,
    edges: routeEdges,
    totalCost,
  };
}

export function nearestNode(nodes: CityNode[], point: { x: number; y: number }) {
  return nodes.reduce((best, node) => {
    const bestDistance = squaredDistance(best, point);
    const nextDistance = squaredDistance(node, point);
    return nextDistance < bestDistance ? node : best;
  }, nodes[0]);
}

export function routeResultToDot(city: CityArtifact, route: RouteResult): string {
  const nodeById = new Map(city.nodes.map((node) => [node.id, node]));
  const terminalSet = new Set(route.terminalNodeIds);
  const lines = [
    "graph PhysarumRoutes {",
    '  graph [layout=neato, overlap=false, splines=true, bgcolor="transparent"];',
    '  node [shape=circle, style=filled, fontname="Inter", fontsize=10, color="#0f172a", fillcolor="#f8fafc"];',
    '  edge [fontname="Inter", fontsize=8, color="#14b8a6", penwidth=2.2];',
  ];

  for (const nodeID of route.nodeIds) {
    const node = nodeById.get(nodeID);
    if (!node) {
      continue;
    }
    const fill = terminalSet.has(nodeID) ? "#f8d24a" : "#e2e8f0";
    lines.push(
      `  "${escapeDot(node.id)}" [label="${escapeDot(node.label)}", pos="${(
        node.x * 10
      ).toFixed(2)},${((1 - node.y) * 7).toFixed(2)}!", fillcolor="${fill}"];`,
    );
  }

  for (const edge of route.edges) {
    lines.push(
      `  "${escapeDot(edge.from)}" -- "${escapeDot(edge.to)}" [label="${escapeDot(
        edge.name,
      )}", penwidth="${(1.4 + edge.trailScore * 4).toFixed(2)}"];`,
    );
  }

  lines.push("}");
  return lines.join("\n");
}

interface ShortestPathTree {
  distances: Map<string, number>;
  previous: Map<string, { node: string; edgeID: string }>;
}

// Single-source shortest paths from `start` to all reachable nodes, using a
// binary-heap priority queue. Edge cost is the trail-weighted edge weight.
// Complexity is O((V + E) log V) per call versus the previous O(V²).
function dijkstraTree(
  city: CityArtifact,
  adjacency: Map<string, AdjacentEdge[]>,
  start: string,
  trail: TrailSnapshot | undefined,
): ShortestPathTree {
  const distances = new Map<string, number>();
  const previous = new Map<string, { node: string; edgeID: string }>();
  const heap = new MinHeap<{ node: string; cost: number }>((a, b) => a.cost - b.cost);
  distances.set(start, 0);
  heap.push({ node: start, cost: 0 });

  while (heap.size > 0) {
    const current = heap.pop()!;
    const currentDist = distances.get(current.node) ?? Number.POSITIVE_INFINITY;
    // Stale heap entry (we relaxed this node to a lower distance after pushing).
    if (current.cost > currentDist) {
      continue;
    }
    for (const adjacent of adjacency.get(current.node) ?? []) {
      const trailScore = sampleEdgeTrail(city, adjacent.edge, trail);
      const stepCost = adjacent.edge.weight / (0.35 + trailScore);
      const nextDistance = current.cost + stepCost;
      const knownDistance = distances.get(adjacent.other) ?? Number.POSITIVE_INFINITY;
      if (nextDistance < knownDistance) {
        distances.set(adjacent.other, nextDistance);
        previous.set(adjacent.other, {
          node: current.node,
          edgeID: adjacent.edge.id,
        });
        heap.push({ node: adjacent.other, cost: nextDistance });
      }
    }
  }

  return { distances, previous };
}

function tracebackEdges(
  previous: Map<string, { node: string; edgeID: string }>,
  start: string,
  goal: string,
): string[] {
  const edgeIds: string[] = [];
  let cursor = goal;
  while (cursor !== start) {
    const step = previous.get(cursor);
    if (!step) {
      return [];
    }
    edgeIds.push(step.edgeID);
    cursor = step.node;
  }
  return edgeIds.reverse();
}

// Simple binary min-heap. Kept local to this module — the rest of the codebase
// does not need a generic priority queue.
class MinHeap<T> {
  private readonly data: T[] = [];
  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.data.length;
  }

  push(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.compare(this.data[index], this.data[parent]) < 0) {
        [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
        index = parent;
      } else {
        return;
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.data.length;
    for (;;) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) return;
      [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
      index = smallest;
    }
  }
}

function sampleEdgeTrail(
  city: CityArtifact,
  edge: CityEdge,
  trail: TrailSnapshot | undefined,
): number {
  if (!trail) {
    return 0.5;
  }
  const from = city.nodes.find((node) => node.id === edge.from);
  const to = city.nodes.find((node) => node.id === edge.to);
  if (!from || !to) {
    return 0;
  }

  let sum = 0;
  const samples = 9;
  for (let index = 0; index < samples; index += 1) {
    const t = index / (samples - 1);
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const gridX = Math.min(trail.width - 1, Math.max(0, Math.round(x * trail.width)));
    const gridY = Math.min(trail.height - 1, Math.max(0, Math.round(y * trail.height)));
    sum += trail.values[gridY * trail.width + gridX] ?? 0;
  }
  return Math.max(0.05, Math.min(1, sum / samples));
}

function buildAdjacency(edges: CityEdge[]) {
  const adjacency = new Map<string, AdjacentEdge[]>();
  for (const edge of edges) {
    const fromEdges = adjacency.get(edge.from) ?? [];
    fromEdges.push({ edge, other: edge.to });
    adjacency.set(edge.from, fromEdges);

    const toEdges = adjacency.get(edge.to) ?? [];
    toEdges.push({ edge, other: edge.from });
    adjacency.set(edge.to, toEdges);
  }
  return adjacency;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function squaredDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return (first.x - second.x) ** 2 + (first.y - second.y) ** 2;
}

function escapeDot(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
