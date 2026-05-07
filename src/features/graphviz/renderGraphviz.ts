import { Graphviz } from "@hpcc-js/wasm/graphviz";

let graphvizPromise: Promise<Graphviz> | undefined;

export async function renderGraphvizSVG(dot: string): Promise<string> {
  graphvizPromise ??= Graphviz.load();
  const graphviz = await graphvizPromise;
  return graphviz.layout(dot, "svg", "neato");
}
