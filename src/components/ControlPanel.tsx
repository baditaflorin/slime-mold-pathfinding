import { MapPinned, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import type {
  CityArtifact,
  CityIndexEntry,
  CityNode,
} from "../features/city-data/schema";
import type { FoodSource } from "../features/physarum/types";

interface ControlPanelProps {
  city: CityArtifact | undefined;
  cityEntries: CityIndexEntry[];
  selectedEntry: CityIndexEntry | undefined;
  foods: FoodSource[];
  loading: boolean;
  error: Error | null;
  actions: ReactNode;
  onSelectCity: (entry: CityIndexEntry) => void;
  onAddNode: (node: CityNode) => void;
  onPreset: (nodeIds: string[]) => void;
  onClearFoods: () => void;
}

export function ControlPanel({
  city,
  cityEntries,
  selectedEntry,
  foods,
  loading,
  error,
  actions,
  onSelectCity,
  onAddNode,
  onPreset,
  onClearFoods,
}: ControlPanelProps) {
  const selectedFoodIds = new Set(foods.map((food) => food.nodeId));

  return (
    <aside className="control-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">City graph</p>
          <h2>{city?.city.name ?? "Loading"}</h2>
        </div>
        {actions}
      </div>

      {error ? <p className="error-text">{error.message}</p> : null}

      <label className="field-label" htmlFor="city-select">
        City
      </label>
      <select
        id="city-select"
        value={selectedEntry?.slug ?? ""}
        disabled={loading}
        onChange={(event) => {
          const entry = cityEntries.find((item) => item.slug === event.target.value);
          if (entry) {
            onSelectCity(entry);
          }
        }}
      >
        {cityEntries.map((entry) => (
          <option key={entry.slug} value={entry.slug}>
            {entry.name}
          </option>
        ))}
      </select>

      <section className="panel-section">
        <div className="section-title">
          <MapPinned size={16} aria-hidden="true" />
          <h3>Presets</h3>
        </div>
        <div className="preset-list">
          {city?.presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPreset(preset.nodeIds)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-title">
          <Plus size={16} aria-hidden="true" />
          <h3>Food sources</h3>
        </div>
        <div className="source-list">
          {city?.nodes.map((node) => (
            <button
              key={node.id}
              className={selectedFoodIds.has(node.id) ? "selected" : ""}
              type="button"
              onClick={() => onAddNode(node)}
            >
              <span>{node.label}</span>
              <small>{node.kind}</small>
            </button>
          ))}
        </div>
        <button className="text-button" type="button" onClick={onClearFoods}>
          <Trash2 size={15} aria-hidden="true" />
          Clear all
        </button>
      </section>
    </aside>
  );
}
