import {
  CircleDollarSign,
  GitBranch,
  GitCommitHorizontal,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ControlPanel } from "./components/ControlPanel";
import { RouteExportPanel } from "./components/RouteExportPanel";
import { SimulatorCanvas } from "./components/SimulatorCanvas";
import { StatusStrip } from "./components/StatusStrip";
import type {
  CityArtifact,
  CityIndexEntry,
  CityNode,
} from "./features/city-data/schema";
import { useCity, useCityIndex, useCityMeta } from "./features/city-data/useCityData";
import type { FoodSource } from "./features/physarum/types";
import { usePhysarumSimulation } from "./features/physarum/usePhysarumSimulation";
import { extractRouteNetwork, nearestNode } from "./features/routes/extractRoutes";

const STORAGE_KEY = "slime-mold-pathfinding:selected-city";

export function App() {
  const cityIndex = useCityIndex();
  const [selectedSlug, setSelectedSlug] = useState(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const selectedEntry = useMemo(() => {
    const cities = cityIndex.data?.cities ?? [];
    return cities.find((city) => city.slug === selectedSlug) ?? cities[0];
  }, [cityIndex.data?.cities, selectedSlug]);
  const cityQuery = useCity(selectedEntry);
  const metaQuery = useCityMeta(selectedEntry);
  const [foods, setFoods] = useState<FoodSource[]>([]);
  const [running, setRunning] = useState(true);
  const city = cityQuery.data;
  const simulation = usePhysarumSimulation(city, foods, running);
  const route = useMemo(
    () =>
      city ? extractRouteNetwork(city, foods, simulation.frame?.trail) : undefined,
    [city, foods, simulation.frame?.trail],
  );

  useEffect(() => {
    if (selectedEntry) {
      localStorage.setItem(STORAGE_KEY, selectedEntry.slug);
    }
  }, [selectedEntry]);

  useEffect(() => {
    if (city && foods.length === 0) {
      const preset = city.presets[0];
      if (preset) {
        setFoods(foodSourcesFromNodes(city, preset.nodeIds));
      }
    }
  }, [city, foods.length]);

  function handleSelectCity(entry: CityIndexEntry) {
    setSelectedSlug(entry.slug);
    setFoods([]);
  }

  function handleAddNode(node: CityNode) {
    setFoods((current) => {
      if (current.some((food) => food.nodeId === node.id)) {
        return current.filter((food) => food.nodeId !== node.id);
      }
      return current.concat(foodFromNode(node));
    });
  }

  function handleCanvasFood(point: { x: number; y: number }) {
    if (!city) {
      return;
    }
    const snapped = nearestNode(city.nodes, point);
    setFoods((current) =>
      current.concat({
        id: `custom-${Date.now()}`,
        label: snapped.label,
        nodeId: snapped.id,
        x: point.x,
        y: point.y,
        strength: 1,
      }),
    );
  }

  function handlePreset(nodeIds: string[]) {
    if (city) {
      setFoods(foodSourcesFromNodes(city, nodeIds));
      setRunning(true);
    }
  }

  const appReady = city && simulation.ready && simulation.frame;

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Physarum polycephalum simulator</p>
          <h1>Slime Mold Pathfinding</h1>
        </div>
        <nav aria-label="Project links" className="top-links">
          <a href={__REPOSITORY_URL__} rel="noreferrer" target="_blank">
            <GitBranch size={18} aria-hidden="true" />
            <span>GitHub</span>
          </a>
          <a href={__PAYPAL_URL__} rel="noreferrer" target="_blank">
            <CircleDollarSign size={18} aria-hidden="true" />
            <span>PayPal</span>
          </a>
          <span className="version-pill">
            v{__APP_VERSION__}
            <a
              href={`${__REPOSITORY_URL__}/commit/${__GIT_COMMIT__}`}
              rel="noreferrer"
              target="_blank"
              aria-label={`Commit ${__GIT_COMMIT__}`}
            >
              <GitCommitHorizontal size={16} aria-hidden="true" />
              {__GIT_COMMIT__}
            </a>
          </span>
        </nav>
      </header>

      <section className="workspace" aria-busy={!appReady}>
        <ControlPanel
          city={city}
          cityEntries={cityIndex.data?.cities ?? []}
          selectedEntry={selectedEntry}
          foods={foods}
          loading={cityIndex.isLoading || cityQuery.isLoading}
          error={cityIndex.error ?? cityQuery.error}
          onSelectCity={handleSelectCity}
          onAddNode={handleAddNode}
          onPreset={handlePreset}
          onClearFoods={() => setFoods([])}
          actions={
            <div className="control-actions">
              <button
                className="icon-button primary"
                type="button"
                onClick={() => setRunning((value) => !value)}
                title={running ? "Pause" : "Run"}
                aria-label={running ? "Pause simulation" : "Run simulation"}
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  if (city) {
                    setFoods(
                      foodSourcesFromNodes(city, city.presets[0]?.nodeIds ?? []),
                    );
                  }
                }}
                title="Reset"
                aria-label="Reset food sources"
              >
                <RotateCcw size={18} />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setFoods([])}
                title="Clear"
                aria-label="Clear food sources"
              >
                <Trash2 size={18} />
              </button>
            </div>
          }
        />

        <div className="map-column">
          <SimulatorCanvas
            city={city}
            foods={foods}
            route={route}
            trail={simulation.frame?.trail}
            onDropFood={handleCanvasFood}
          />
          <StatusStrip
            city={city}
            meta={metaQuery.data}
            foods={foods}
            route={route}
            stats={simulation.frame?.stats}
            ready={simulation.ready}
          />
        </div>

        <RouteExportPanel city={city} route={route} />
      </section>

      <footer className="footer-bar">
        <span>
          <MapPin size={15} aria-hidden="true" />
          {selectedEntry
            ? `${selectedEntry.name} · ${selectedEntry.nodeCount} nodes · ${selectedEntry.edgeCount} edges`
            : "Loading city data"}
        </span>
        <span>{city?.source.attribution}</span>
      </footer>
    </main>
  );
}

function foodSourcesFromNodes(city: CityArtifact, nodeIds: string[]) {
  const nodeById = new Map(city.nodes.map((node) => [node.id, node]));
  return nodeIds
    .map((nodeID) => nodeById.get(nodeID))
    .filter((node): node is CityNode => Boolean(node))
    .map(foodFromNode);
}

function foodFromNode(node: CityNode): FoodSource {
  return {
    id: `node-${node.id}`,
    label: node.label,
    nodeId: node.id,
    x: node.x,
    y: node.y,
    strength: node.kind === "airport" ? 1.2 : 1,
  };
}
