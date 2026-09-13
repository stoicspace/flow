import { obfuscate } from "javascript-obfuscator";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const DIST_DIR = path.resolve(__dirname, "../dist");
const OBFUSCATE_DIRS = ["main", "preload"];

function findJsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findJsFiles(full));
    } else if (path.extname(full) === ".js") {
      results.push(full);
    }
  }
  return results;
}

const targets = OBFUSCATE_DIRS.flatMap((dir) => {
  const dirPath = path.join(DIST_DIR, dir);
  try {
    return findJsFiles(dirPath);
  } catch {
    return [];
  }
});

console.log(`Obfuscating ${targets.length} files...`);

for (const file of targets) {
  const source = readFileSync(file, "utf8");
  try {
    const result = obfuscate(source, {
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.4,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      stringArrayThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.2,
      selfDefending: true,
      disableConsoleOutput: true,
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
    });
    writeFileSync(file, result.getObfuscatedCode());
    console.log(`  OK ${path.relative(DIST_DIR, file)}`);
  } catch (e: any) {
    console.error(`  FAIL ${path.relative(DIST_DIR, file)}: ${e.message}`);
  }
}

console.log("Obfuscation complete.");
