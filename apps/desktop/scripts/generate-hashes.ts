import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const DIST_DIR = path.resolve(__dirname, "../dist");
const OUTPUT = path.resolve(__dirname, "../resources/integrity-hashes.json");
const RESOURCES_DIR = path.resolve(__dirname, "../resources");

function hashFile(filePath: string): string {
  const content = readFileSync(filePath);
  return "sha256:" + createHash("sha256").update(content).digest("hex");
}

// Ensure resources dir exists
if (!existsSync(RESOURCES_DIR)) {
  const { mkdirSync } = await import("fs");
  mkdirSync(RESOURCES_DIR, { recursive: true });
}

const hashes: Record<string, string> = {};

for (const file of ["main/index.js", "preload/index.js"]) {
  const fullPath = path.join(DIST_DIR, file);
  if (existsSync(fullPath)) {
    hashes[file] = hashFile(fullPath);
  }
}

writeFileSync(OUTPUT, JSON.stringify(hashes, null, 2));
console.log(`Generated hashes for ${Object.keys(hashes).length} files → ${OUTPUT}`);
