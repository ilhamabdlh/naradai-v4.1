#!/usr/bin/env node
/**
 * Import data dari file export JSON (export-from-browser) ke MongoDB.
 * Satu collection per chart/content; instances & schedulers terpisah.
 *
 * Pakai: MONGODB_URI=mongodb://... [EXPORT_JSON_PATH=./naradai-export-....json] node import-to-mongodb.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "naradai_v4";
const EXPORT_JSON_PATH =
  process.env.EXPORT_JSON_PATH ||
  resolve(__dirname, "naradai-export-" + new Date().toISOString().slice(0, 10) + ".json");

// DashboardContentStore key -> { collection, useItems }
const DASHBOARD_COLLECTIONS = [
  { storeKey: "featureVisibility", collection: "feature_visibility", useItems: false },
  { storeKey: "statsOverview", collection: "stats_overview", useItems: true },
  { storeKey: "priorityActions", collection: "priority_actions", useItems: true },
  { storeKey: "outletSatisfaction", collection: "outlet_satisfaction", useItems: true },
  { storeKey: "risks", collection: "risks", useItems: true },
  { storeKey: "opportunities", collection: "opportunities", useItems: true },
  { storeKey: "competitiveIssues", collection: "competitive_issues", useItems: true },
  { storeKey: "competitiveKeyInsights", collection: "competitive_key_insights", useItems: true },
  { storeKey: "whatsHappeningSentimentTrends", collection: "sentiment_trends", useItems: true },
  { storeKey: "whatsHappeningKeyEvents", collection: "key_events", useItems: true },
  { storeKey: "whatsHappeningTopTopics", collection: "top_topics", useItems: true },
  { storeKey: "whatsHappeningAITopicAnalysis", collection: "ai_topic_analysis", useItems: true },
  { storeKey: "whatsHappeningTopicTrendsData", collection: "topic_trends_data", useItems: true },
  { storeKey: "whatsHappeningAITrendAnalysis", collection: "ai_trend_analysis", useItems: true },
  { storeKey: "whatsHappeningWordCloud", collection: "word_cloud", useItems: true },
  { storeKey: "whatsHappeningClusters", collection: "conversation_clusters", useItems: true },
  { storeKey: "whatsHappeningHashtags", collection: "hashtags", useItems: true },
  { storeKey: "whatsHappeningAccounts", collection: "top_accounts", useItems: true },
  { storeKey: "whatsHappeningContents", collection: "top_contents", useItems: true },
  { storeKey: "whatsHappeningKOLMatrix", collection: "kol_matrix", useItems: true },
  { storeKey: "whatsHappeningAIKOLAnalysis", collection: "ai_kol_analysis", useItems: true },
  { storeKey: "whatsHappeningShareOfPlatform", collection: "share_of_platform", useItems: true },
  { storeKey: "competitiveMatrixItems", collection: "competitive_matrix_items", useItems: true },
  { storeKey: "competitiveQuadrantAnalysis", collection: "competitive_quadrant_analysis", useItems: true },
  { storeKey: "competitiveSentimentScores", collection: "competitive_sentiment_scores", useItems: true },
  { storeKey: "competitiveVolumeOfMentions", collection: "competitive_volume_mentions", useItems: true },
  { storeKey: "competitiveShareOfVoice", collection: "competitive_share_of_voice", useItems: true },
  { storeKey: "competitiveBrandLabels", collection: "competitive_brand_labels", useItems: false },
];

function loadExport() {
  try {
    const raw = readFileSync(EXPORT_JSON_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error("File export tidak ditemukan:", EXPORT_JSON_PATH);
      console.error("Set EXPORT_JSON_PATH atau letakkan file naradai-export-YYYY-MM-DD.json di folder ini.");
    } else {
      console.error("Gagal baca/parse JSON:", e.message);
    }
    process.exit(1);
  }
}

function buildDocChart(instanceId, items, snapshotAt) {
  const now = new Date();
  return {
    instanceId,
    snapshotAt: snapshotAt || now,
    items: Array.isArray(items) ? items : [],
    createdAt: now,
    updatedAt: now,
  };
}

function buildDocFeatureVisibility(instanceId, featureVisibility) {
  const now = new Date();
  const vis = featureVisibility || {};
  return {
    instanceId,
    statsOverview: vis.statsOverview !== false,
    actionRecommendations: vis.actionRecommendations !== false,
    outletSatisfaction: vis.outletSatisfaction !== false,
    risksOpportunities: vis.risksOpportunities !== false,
    competitiveAnalysis: vis.competitiveAnalysis !== false,
    recentInsights: vis.recentInsights !== false,
    updatedAt: now,
  };
}

function buildDocBrandLabels(instanceId, competitiveBrandLabels) {
  const now = new Date();
  const labels = competitiveBrandLabels || {};
  return {
    instanceId,
    yourBrand: labels.yourBrand ?? "",
    competitorA: labels.competitorA ?? "",
    competitorB: labels.competitorB ?? "",
    competitorC: labels.competitorC ?? "",
    competitorD: labels.competitorD ?? "",
    updatedAt: now,
  };
}

async function run() {
  const data = loadExport();
  const instances = data.instances || [];
  const schedulers = data.schedulers || {};
  const dashboardContent = data.dashboardContent || {};

  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI (mis. mongodb://localhost:27017)");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const now = new Date();

    // 1. Instances
    if (instances.length > 0) {
      const coll = db.collection("instances");
      for (const inst of instances) {
        await coll.replaceOne(
          { id: inst.id },
          {
            id: inst.id,
            name: inst.name ?? inst.id,
            createdAt: now,
            updatedAt: now,
          },
          { upsert: true }
        );
      }
      console.log("instances: upserted", instances.length);
    }

    // 2. Schedulers (satu doc per scheduler)
    const schedulerEntries = Object.entries(schedulers);
    if (schedulerEntries.length > 0) {
      const coll = db.collection("schedulers");
      for (const [schedulerId, state] of schedulerEntries) {
        await coll.replaceOne(
          { schedulerId },
          {
            schedulerId,
            projectId: state.projectId ?? schedulerId,
            config: state.config ?? {},
            startTime: state.startTime ?? null,
            endTime: state.endTime ?? null,
            days: state.days ?? 0,
            createdAt: state.createdAt ? new Date(state.createdAt) : now,
            lastTriggered: state.lastTriggered ? new Date(state.lastTriggered) : null,
            triggerCount: state.triggerCount ?? 0,
            isActive: state.isActive ?? false,
            updatedAt: now,
          },
          { upsert: true }
        );
      }
      console.log("schedulers: upserted", schedulerEntries.length);
    }

    // 3. Dashboard: satu collection per chart per instance
    const instanceIds = Object.keys(dashboardContent);
    for (const instanceId of instanceIds) {
      const store = dashboardContent[instanceId];
      if (!store || typeof store !== "object") continue;

      const snapshotAt = data.exportedAt ? new Date(data.exportedAt) : now;

      for (const { storeKey, collection, useItems } of DASHBOARD_COLLECTIONS) {
        const value = store[storeKey];
        const coll = db.collection(collection);

        if (collection === "feature_visibility") {
          const doc = buildDocFeatureVisibility(instanceId, value);
          await coll.replaceOne({ instanceId }, doc, { upsert: true });
          continue;
        }
        if (collection === "competitive_brand_labels") {
          const doc = buildDocBrandLabels(instanceId, value);
          await coll.replaceOne({ instanceId }, doc, { upsert: true });
          continue;
        }

        const doc = buildDocChart(instanceId, useItems ? value : undefined, snapshotAt);
        await coll.replaceOne({ instanceId }, doc, { upsert: true });
      }
      console.log("dashboard collections for instance:", instanceId);
    }

    console.log("Import selesai. Database:", DB_NAME);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
