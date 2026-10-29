import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import test from "node:test";

const SOURCE_ROOTS = ["app", "components", "src"];
const SOURCE_EXTENSIONS = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

test("pending-review images are not referenced by production source", () => {
  const audit = readFileSync("docs/product-image-audit.md", "utf8");
  const pending = [...audit.matchAll(/^\| `([^`]+)` .* `pending-review` \|$/gm)].map((match) => match[1]);
  assert.equal(pending.length, 17, "update the completion report and this expected count when the ledger changes");

  const source = SOURCE_ROOTS.flatMap(sourceFiles)
    .map((path) => `${path}\n${readFileSync(path, "utf8")}`)
    .join("\n");

  for (const asset of pending) {
    assert.ok(!source.includes(`/images/${asset}`), `${asset} is pending-review but referenced by production source`);
  }
});
