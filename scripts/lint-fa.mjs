#!/usr/bin/env node
/**
 * Flags Arabic Yeh/Kaf and ASCII quotes inside fa: string literals.
 * Usage: node scripts/lint-fa.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const targets = ["data", "src"];
const ARABIC_YEH = /\u064A/; // ي
const ARABIC_KAF = /\u0643/; // ك
let errors = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "out") continue;
      walk(p);
    } else if (/\.(ts|tsx|js|mjs|md)$/.test(name)) {
      check(p);
    }
  }
}

function check(file) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (!line.includes("fa:") && !line.includes("fa：")) {
      // still scan fa template chunks loosely
      if (!/\bfa\b/.test(line) && !file.includes("fa-style")) return;
    }
    if (ARABIC_YEH.test(line)) {
      console.error(`${file}:${i + 1}: Arabic Yeh (ي) — use Persian ی`);
      errors++;
    }
    if (ARABIC_KAF.test(line)) {
      console.error(`${file}:${i + 1}: Arabic Kaf (ك) — use Persian ک`);
      errors++;
    }
    // ASCII " inside fa: "..." values
    const faMatch = line.match(/fa:\s*"([^"]*)"/);
    if (faMatch && /"/.test(faMatch[1] ?? "")) {
      console.error(`${file}:${i + 1}: ASCII quote inside fa string`);
      errors++;
    }
    const faMatch2 = line.match(/fa:\s*'([^']*)'/);
    if (faMatch2 && /"/.test(faMatch2[1] ?? "")) {
      console.error(`${file}:${i + 1}: ASCII " inside fa string`);
      errors++;
    }
  });
}

for (const t of targets) walk(join(root, t));
walk(join(root, "docs"));

if (errors > 0) {
  console.error(`\nfa-lint: ${errors} issue(s)`);
  process.exit(1);
}
console.log("fa-lint: ok");
