import { describe, expect, it } from "vitest";

import tokyoJson from "../docs/data/v1/cities/tokyo.json";
import { cityArtifactSchema } from "../src/features/city-data/schema";
import type { FoodSource, TrailSnapshot } from "../src/features/physarum/types";
import {
  extractRouteNetwork,
  routeResultToDot,
} from "../src/features/routes/extractRoutes";

const tokyo = cityArtifactSchema.parse(tokyoJson);

describe("route extraction", () => {
  it("connects selected food sources through the city graph", () => {
    const foods: FoodSource[] = ["tokyo", "shinjuku", "shibuya", "ueno"].map(
      (nodeID) => {
        const node = tokyo.nodes.find((candidate) => candidate.id === nodeID);
        if (!node) {
          throw new Error(`missing node ${nodeID}`);
        }
        return {
          id: `node-${node.id}`,
          label: node.label,
          nodeId: node.id,
          x: node.x,
          y: node.y,
          strength: 1,
        };
      },
    );
    const trail: TrailSnapshot = {
      width: 16,
      height: 16,
      values: new Float32Array(16 * 16).fill(0.5),
    };

    const route = extractRouteNetwork(tokyo, foods, trail);
    expect(route.terminalNodeIds).toHaveLength(4);
    expect(route.edges.length).toBeGreaterThan(0);
    expect(route.totalCost).toBeGreaterThan(0);

    const dot = routeResultToDot(tokyo, route);
    expect(dot).toContain("graph PhysarumRoutes");
    expect(dot).toContain("Tokyo");
  });
});
