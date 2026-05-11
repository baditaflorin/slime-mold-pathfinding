import { describe, expect, it } from "vitest";

import type { CityArtifact } from "../src/features/city-data/schema";
import type { FoodSource } from "../src/features/physarum/types";
import { extractRouteNetwork } from "../src/features/routes/extractRoutes";

// Generates a synthetic grid-graph city of `gridSize` × `gridSize` nodes,
// with each interior node 4-connected to its grid neighbours. This is the
// stress fixture for shortest-path scaling.
function makeGridCity(gridSize: number): CityArtifact {
  const nodes = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const id = `n_${row}_${col}`;
      nodes.push({
        id,
        label: id,
        x: col / (gridSize - 1),
        y: row / (gridSize - 1),
        category: "stop",
      });
    }
  }
  const edges = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const here = `n_${row}_${col}`;
      if (col + 1 < gridSize) {
        const east = `n_${row}_${col + 1}`;
        edges.push({
          id: `${here}-${east}`,
          from: here,
          to: east,
          name: "row",
          weight: 1,
          category: "rail",
        });
      }
      if (row + 1 < gridSize) {
        const south = `n_${row + 1}_${col}`;
        edges.push({
          id: `${here}-${south}`,
          from: here,
          to: south,
          name: "col",
          weight: 1,
          category: "rail",
        });
      }
    }
  }
  return {
    city: { slug: "grid", name: "Grid", country: "synthetic" },
    nodes,
    edges,
    metadata: { source: "synthetic", generatedAt: "2026-05-11T00:00:00Z" },
  } as unknown as CityArtifact;
}

describe("extractRouteNetwork scaling", () => {
  it("returns within reasonable time on a 50x50 grid with 8 terminals", () => {
    const grid = makeGridCity(50); // 2500 nodes, ~5000 edges
    const terminals = [
      "n_0_0",
      "n_0_49",
      "n_49_0",
      "n_49_49",
      "n_25_25",
      "n_10_40",
      "n_40_10",
      "n_30_20",
    ];
    const foods: FoodSource[] = terminals.map((nodeId, index) => {
      const [row, col] = nodeId.split("_").slice(1).map(Number);
      return {
        id: `food-${index}`,
        label: nodeId,
        nodeId,
        x: col / 49,
        y: row / 49,
        strength: 1,
      };
    });

    const start = performance.now();
    const route = extractRouteNetwork(grid, foods, undefined);
    const elapsed = performance.now() - start;

    // The previous O(k² · V²) implementation would take >5 seconds on this
    // graph. The heap-based, source-cached version should be comfortably under
    // 1 second on any modern machine; 3s is a generous CI margin.
    expect(elapsed).toBeLessThan(3000);
    expect(route.terminalNodeIds.length).toBe(8);
    expect(route.edges.length).toBeGreaterThan(0);
    expect(route.totalCost).toBeGreaterThan(0);
  });
});
