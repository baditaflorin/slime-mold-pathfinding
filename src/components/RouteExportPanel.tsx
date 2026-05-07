import { Download, GitGraph, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import type { CityArtifact } from "../features/city-data/schema";
import { routeResultToDot, type RouteResult } from "../features/routes/extractRoutes";

interface RouteExportPanelProps {
  city: CityArtifact | undefined;
  route: RouteResult | undefined;
}

export function RouteExportPanel({ city, route }: RouteExportPanelProps) {
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dot = useMemo(() => {
    if (!city || !route) {
      return "";
    }
    return routeResultToDot(city, route);
  }, [city, route]);

  async function renderGraph() {
    if (!dot) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { renderGraphvizSVG } = await import("../features/graphviz/renderGraphviz");
      setSvg(await renderGraphvizSVG(dot));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "GraphViz render failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="route-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Route graph</p>
          <h2>GraphViz</h2>
        </div>
        <button
          className="icon-button primary"
          disabled={!dot || loading}
          type="button"
          onClick={renderGraph}
          title="Render"
          aria-label="Render GraphViz route graph"
        >
          {loading ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <GitGraph size={18} />
          )}
        </button>
      </div>

      <textarea readOnly aria-label="DOT route graph" value={dot} />
      {error ? <p className="error-text">{error}</p> : null}
      <div className="graph-output" aria-live="polite">
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
      </div>
      <a
        className="text-button"
        download="physarum-route.dot"
        href={`data:text/vnd.graphviz;charset=utf-8,${encodeURIComponent(dot)}`}
      >
        <Download size={15} aria-hidden="true" />
        DOT
      </a>
    </aside>
  );
}
