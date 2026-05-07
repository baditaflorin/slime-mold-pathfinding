import { describe, expect, it } from "vitest";

import index from "../docs/data/v1/cities/index.json";
import tokyo from "../docs/data/v1/cities/tokyo.json";
import { cityArtifactSchema, cityIndexSchema } from "../src/features/city-data/schema";

describe("city data contract", () => {
  it("parses the published city index", () => {
    const parsed = cityIndexSchema.parse(index);
    expect(parsed.schemaVersion).toBe("v1");
    expect(parsed.cities.map((city) => city.slug)).toContain("tokyo");
  });

  it("parses a published city artifact", () => {
    const parsed = cityArtifactSchema.parse(tokyo);
    expect(parsed.nodes.length).toBeGreaterThan(10);
    expect(parsed.edges.length).toBeGreaterThan(10);
  });
});
