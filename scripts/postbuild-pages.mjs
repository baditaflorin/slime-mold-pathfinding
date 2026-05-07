import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const docsDir = "docs";
const indexPath = join(docsDir, "index.html");
const fallbackPath = join(docsDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error("docs/index.html was not produced");
}

const indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes("/slime-mold-pathfinding/assets/")) {
  throw new Error("built index.html is missing the GitHub Pages base path");
}

copyFileSync(indexPath, fallbackPath);
