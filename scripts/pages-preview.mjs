import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const port = Number.parseInt(process.env.PORT ?? "4174", 10);
const base = "/slime-mold-pathfinding/";
const docsDir = join(process.cwd(), "docs");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  if (requestUrl.pathname === "/") {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  if (!requestUrl.pathname.startsWith(base)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const relative = requestUrl.pathname.slice(base.length) || "index.html";
  const safePath = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(docsDir, safePath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(docsDir, "404.html");
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extname(filePath)) ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Pages preview: http://127.0.0.1:${port}${base}\n`);
});
