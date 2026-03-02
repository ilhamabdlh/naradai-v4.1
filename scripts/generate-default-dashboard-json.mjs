#!/usr/bin/env node
/**
 * Generate public/default-dashboard-content.json from the app's defaultDashboardContent.
 * Run from repo root: node scripts/generate-default-dashboard-json.mjs
 * Requires: run from project root; uses dynamic import of the store (Vite/Node may need to resolve .ts)
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function main() {
  let defaultDashboardContent;
  try {
    // Try ESM import (Vite/build may have compiled to dist; we need source)
    const storePath = resolve(root, "src/lib/dashboard-content-store.ts");
    const mod = await import(storePath);
    defaultDashboardContent = mod.defaultDashboardContent;
  } catch (e) {
    console.error("Import failed (Node may not load .ts directly). Falling back to inline default.");
    defaultDashboardContent = getInlineDefault();
  }
  if (!defaultDashboardContent) {
    defaultDashboardContent = getInlineDefault();
  }
  const outPath = resolve(root, "public/default-dashboard-content.json");
  writeFileSync(outPath, JSON.stringify(defaultDashboardContent, null, 2), "utf8");
  console.log("Wrote", outPath);
}

function getInlineDefault() {
  return {
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: true,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [],
    priorityActions: [],
    outletSatisfaction: [],
    risks: [],
    opportunities: [],
    competitiveIssues: [],
    competitiveKeyInsights: [],
    whatsHappeningSentimentTrends: [],
    whatsHappeningKeyEvents: [],
    whatsHappeningTopTopics: [],
    whatsHappeningAITopicAnalysis: [],
    whatsHappeningTopicTrendsData: [],
    whatsHappeningAITrendAnalysis: [],
    whatsHappeningWordCloud: [],
    whatsHappeningClusters: [],
    whatsHappeningHashtags: [],
    whatsHappeningAccounts: [],
    whatsHappeningContents: [],
    whatsHappeningKOLMatrix: [],
    whatsHappeningAIKOLAnalysis: [],
    whatsHappeningShareOfPlatform: [],
    competitiveMatrixItems: [],
    competitiveQuadrantAnalysis: [],
    competitiveSentimentScores: [],
    competitiveVolumeOfMentions: [],
    competitiveShareOfVoice: [],
    competitiveBrandLabels: {
      yourBrand: "Your Brand",
      competitorA: "Competitor A",
      competitorB: "Competitor B",
      competitorC: "Competitor C",
      competitorD: "Competitor D",
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
