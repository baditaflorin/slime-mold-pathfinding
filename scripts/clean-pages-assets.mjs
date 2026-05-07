import { rmSync } from "node:fs";

for (const path of ["docs/assets", "docs/404.html"]) {
  rmSync(path, { force: true, recursive: true });
}
