/**
 * Generate public/default-dashboard-content.json from the app's defaultDashboardContent.
 * Run from repo root: npx tsx scripts/generate-default-dashboard-json.ts
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defaultDashboardContent } from "../src/lib/dashboard-content-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outPath = resolve(root, "public/default-dashboard-content.json");

writeFileSync(outPath, JSON.stringify(defaultDashboardContent, null, 2), "utf8");
console.log("Wrote", outPath);
