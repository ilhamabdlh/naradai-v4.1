/**
 * Raw source content untuk instance Bukalapak (Source Contents tab).
 * Data di-map dari payload: source, platform, username, text, created_at, sentiment_score (0-100), topic, risk_flag, likes, rating (opsional).
 */
import type { RawSourceContentItem } from "./dashboard-content-types";

export interface BukalapakRawPayloadItem {
  source: string;
  brand_entity?: string;
  platform: string;
  username: string;
  text: string;
  rating?: number | null;
  likes: number;
  created_at: string;
  sentiment_score: number;
  user_persona?: string;
  topic: string;
  risk_flag: string;
  root_cause?: string;
}

function sentimentScoreToNorm(score: number): number {
  if (typeof score !== "number" || isNaN(score)) return 0;
  return (score / 100) * 2 - 1;
}

function opportunityFromSentiment(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function dateOnly(createdAt: string): string {
  if (!createdAt) return "";
  const part = createdAt.slice(0, 10);
  return part || createdAt.split(" ")[0] || "";
}

function normalizeSource(source: string): "Social_Media" | "App_Review" | "News_Articles" {
  if (source === "App_Review") return "App_Review";
  if (source === "Social_Media") return "Social_Media";
  return "News_Articles";
}

export function mapBukalapakPayloadItem(item: BukalapakRawPayloadItem, index: number): RawSourceContentItem {
  const sentiment = sentimentScoreToNorm(item.sentiment_score);
  const opportunity = opportunityFromSentiment(item.sentiment_score);
  const rating = typeof item.rating === "number" && !isNaN(item.rating) ? item.rating : undefined;
  return {
    id: `bl-raw-${index + 1}`,
    source: normalizeSource(item.source),
    platform: item.platform || "",
    author: item.username || "",
    content: item.text || "",
    date: dateOnly(item.created_at),
    sentiment,
    cluster: item.topic || "Other",
    risk: item.risk_flag || "Low",
    opportunity,
    engagement: typeof item.likes === "number" ? item.likes : 0,
    ...(rating !== undefined && { rating }),
  };
}

/** Payload raw tab Social Media (di-import dari JSON). */
import socialPayload from "./data/bukalapak-social-payload.json";
/** Payload raw tab Reviews (App_Review dari Google Play / App Store). */
import reviewsPayload from "./data/bukalapak-reviews-payload.json";

const BUKALAPAK_RAW_PAYLOAD: BukalapakRawPayloadItem[] = [
  ...(socialPayload as BukalapakRawPayloadItem[]),
  ...(reviewsPayload as BukalapakRawPayloadItem[]),
];

export const bukalapakRawSourceContents: RawSourceContentItem[] = BUKALAPAK_RAW_PAYLOAD.map(mapBukalapakPayloadItem);
