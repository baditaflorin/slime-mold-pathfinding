import { Activity, Database, Network, Timer } from "lucide-react";

import type { ArtifactMeta, CityArtifact } from "../features/city-data/schema";
import type { FoodSource, SimulationStats } from "../features/physarum/types";
import type { RouteResult } from "../features/routes/extractRoutes";

interface StatusStripProps {
  city: CityArtifact | undefined;
  meta: ArtifactMeta | undefined;
  foods: FoodSource[];
  route: RouteResult | undefined;
  stats: SimulationStats | undefined;
  ready: boolean;
}

export function StatusStrip({
  city,
  meta,
  foods,
  route,
  stats,
  ready,
}: StatusStripProps) {
  return (
    <div className="status-strip">
      <span>
        <Activity size={15} aria-hidden="true" />
        {ready ? `${stats?.engine ?? "cpu"} · ${stats?.fps ?? 0} fps` : "initializing"}
      </span>
      <span>
        <Network size={15} aria-hidden="true" />
        {route?.edges.length ?? 0} route edges
      </span>
      <span>
        <Timer size={15} aria-hidden="true" />
        {stats?.ticks ?? 0} ticks
      </span>
      <span>
        <Database size={15} aria-hidden="true" />
        {city?.schemaVersion ?? "v1"} · {foods.length} food
      </span>
      <span>{meta ? `data ${relativeDate(meta.generatedAt)}` : "data pending"}</span>
    </div>
  );
}

function relativeDate(isoDate: string) {
  const generated = new Date(isoDate).getTime();
  const days = Math.max(0, Math.round((Date.now() - generated) / 86_400_000));
  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
}
