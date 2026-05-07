import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
};

function gitCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return process.env.VITE_GIT_COMMIT ?? "local";
  }
}

export default defineConfig({
  base: "/slime-mold-pathfinding/",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_APP_VERSION ?? packageJson.version,
    ),
    __GIT_COMMIT__: JSON.stringify(process.env.VITE_GIT_COMMIT ?? gitCommit()),
    __REPOSITORY_URL__: JSON.stringify(
      "https://github.com/baditaflorin/slime-mold-pathfinding",
    ),
    __PAYPAL_URL__: JSON.stringify("https://www.paypal.com/paypalme/florinbadita"),
  },
  build: {
    outDir: "docs",
    emptyOutDir: false,
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      input: resolve(process.cwd(), "index.html"),
      output: {
        manualChunks(id) {
          if (id.includes("@hpcc-js/wasm")) {
            return "graphviz-wasm";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    exclude: ["node_modules/**", "tests/smoke/**", "docs/assets/**"],
  },
});
