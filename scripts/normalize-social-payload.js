#!/usr/bin/env node
/**
 * Normalize json-2 to json-1 structure:
 * - Filter source === "Social_Media"
 * - rating NaN -> null
 * - Dedupe by username + created_at + text
 * - Same key order as json-1
 * Reads from first arg path. Writes to src/lib/data/bukalapak-social-payload.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalize(inputPath) {
  let raw = fs.readFileSync(inputPath, "utf8");
  raw = raw.replace(/"rating":\s*NaN/g, '"rating": null');
  const data = JSON.parse(raw);
  const social = data.filter((x) => x.source === "Social_Media");
  const seen = new Set();
  const deduped = social.filter((x) => {
    const key = (x.username || "") + "|" + (x.created_at || "") + "|" + (x.text || "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const KEY_ORDER = [
    "source",
    "brand_entity",
    "platform",
    "username",
    "text",
    "rating",
    "likes",
    "created_at",
    "sentiment_score",
    "user_persona",
    "topic",
    "risk_flag",
    "root_cause",
  ];
  const out = deduped.map((x) => {
    const rating =
      x.rating == null || (typeof x.rating === "number" && Number.isNaN(x.rating))
        ? null
        : x.rating;
    const obj = {};
    for (const k of KEY_ORDER) {
      if (k === "rating") obj[k] = rating;
      else if (x[k] !== undefined) obj[k] = x[k];
    }
    return obj;
  });
  const outPath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "data",
    "bukalapak-social-payload.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log("Wrote", out.length, "items to", outPath);
}

const inputPath = process.argv[2] || path.join(__dirname, "temp-json2.json");
if (!fs.existsSync(inputPath)) {
  console.error("Usage: node normalize-social-payload.js <path-to-json2>");
  console.error("Expected file:", inputPath);
  process.exit(1);
}
normalize(inputPath);
