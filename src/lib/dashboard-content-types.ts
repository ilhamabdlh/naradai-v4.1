export interface StatItem {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
}

export interface SourceContentPost {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: number;
  timestamp: string;
  engagement?: { likes: number; replies: number; retweets: number };
}

export interface PriorityActionItem {
  id: string;
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  impact: string;
  effort: string;
  recommendation: string;
  category: string;
  quadrantColor: string;
  relatedIssues: string[];
  metrics: { mentions: number; sentiment: number | string; trend: string };
  /** Nama pengguna / author untuk Source Content (ditampilkan di modal detail). */
  sourceUsername?: string;
  /** Konten sumber sebagai string (jika satu post) atau pakai sourceContent array. */
  sourceContent?: SourceContentPost[] | string;
  createdAt?: string;
  expiredAt?: string;
}

export interface OutletItem {
  id: string;
  name: string;
  location: string;
  status: "critical" | "warning" | "good";
  satisfaction: number;
  issues: string[];
  coords: { x: number; y: number };
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  probability: number;
  impact: string;
  trend: string;
  supportingContents: number;
  indicators: { label: string; value: number; change: number }[];
  metrics?: Record<string, number>;
  mitigation?: string[];
  sourceContent?: SourceContentPost[];
  createdAt?: string;
  expiredAt?: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  potential: string;
  confidence: number;
  timeframe: string;
  category: string;
  trend: string;
  supportingContents: number;
  metrics: Record<string, number>;
  recommendations: string[];
  sourceContent?: SourceContentPost[];
  createdAt?: string;
  expiredAt?: string;
}

export interface CompetitiveIssueItem {
  id: string;
  issue: string;
  category: string;
  yourSentiment: number;
  competitorMedianSentiment: number;
  yourMentions: number;
  competitorMedianMentions: number;
  relativeSentiment: number;
  relativeMentions: number;
}

export interface KeyInsightItem {
  id: string;
  type: "critical" | "strength" | "insight";
  title: string;
  description: string;
  bullets: string[];
}

export interface SentimentTrendItem {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface TopTopicItem {
  topic: string;
  mentions: number;
  sentiment: number;
}

export interface WordCloudItem {
  text: string;
  weight: number;
  sentiment: "positive" | "negative" | "neutral";
}

export interface KeyEventItem {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface AITopicAnalysisItem {
  id: string;
  type: "critical" | "opportunity" | "insight" | "trend";
  title: string;
  description: string;
}

export interface TopicTrendsOverTimeRow {
  date: string;
  packaging?: number;
  customerService?: number;
  productQuality?: number;
  shipping?: number;
  [key: string]: number | string | undefined;
}

export interface AITrendAnalysisItem {
  id: string;
  type: "critical" | "warning" | "insight" | "observation";
  title: string;
  description: string;
}

export interface ConversationClusterItem {
  id: string;
  theme: string;
  size: number;
  sentiment: number;
  trend: "up" | "down" | "stable" | "upward" | "downward";
  keywords: string[];
}

export interface TopHashtagItem {
  id: string;
  tag: string;
  conversations?: number;
  likes: number;
  comments: number;
}

export interface TopAccountItem {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers?: number;
  conversations: number;
  likes?: number;
  replies?: number;
}

export interface TopContentItem {
  id: string;
  title: string;
  platform: string;
  author: string;
  likes?: number;
  comments?: number;
}

export interface KOLMatrixItem {
  id: string;
  name: string;
  followers: number;
  positivity: number;
  engagement: number;
  color: string;
  category: string;
}

export interface AIKOLAnalysisItem {
  id: string;
  type: "critical" | "opportunity" | "insight";
  title: string;
  description: string;
}

/** Nilai per platform: number (legacy) atau [mention, percentage] */
export type ShareOfPlatformValue = number | [number, string];

export interface ShareOfPlatformRow {
  date: string;
  twitter?: ShareOfPlatformValue;
  instagram?: ShareOfPlatformValue;
  facebook?: ShareOfPlatformValue;
  tiktok?: ShareOfPlatformValue;
  googleplay?: ShareOfPlatformValue;
  appstore?: ShareOfPlatformValue;
  youtube?: ShareOfPlatformValue;
  reddit?: ShareOfPlatformValue;
}

export interface CompetitiveMatrixItem {
  id: string;
  name: string;
  mentions: number;
  positivePercentage: number;
  size: number;
  color: string;
}

export interface QuadrantAnalysisItem {
  id: string;
  label: string;
  brands: string;
  note: string;
}

export type CompetitiveHeatmapRow = { issue: string } & Record<string, number | string | undefined>;

export interface ShareOfVoiceRow {
  date: string;
  yourBrand: number;
  competitorA: number;
  competitorB: number;
  competitorC: number;
  competitorD: number;
}

/** Satu item raw content untuk tab Source Contents (Social / Reviews / News). */
export interface RawSourceContentItem {
  id: string;
  source: "Social_Media" | "App_Review" | "News_Articles";
  platform: string;
  author: string;
  content: string;
  date: string;
  sentiment: number;
  cluster: string;
  risk: string;
  opportunity: string;
  engagement: number;
  rating?: number;
}

export interface CompetitiveBrandLabels {
  yourBrand: string;
  competitorA: string;
  competitorB: string;
  competitorC: string;
  competitorD: string;
}

export type FeatureVisibilityKey =
  | "statsOverview"
  | "actionRecommendations"
  | "outletSatisfaction"
  | "risksOpportunities"
  | "competitiveAnalysis"
  | "recentInsights";

export type FeatureVisibility = Record<FeatureVisibilityKey, boolean>;

export interface DashboardContentStore {
  featureVisibility: FeatureVisibility;
  statsOverview: StatItem[];
  priorityActions: PriorityActionItem[];
  outletSatisfaction: OutletItem[];
  risks: RiskItem[];
  opportunities: OpportunityItem[];
  competitiveIssues: CompetitiveIssueItem[];
  competitiveKeyInsights: KeyInsightItem[];
  whatsHappeningSentimentTrends: SentimentTrendItem[];
  whatsHappeningKeyEvents: KeyEventItem[];
  whatsHappeningTopTopics: TopTopicItem[];
  whatsHappeningAITopicAnalysis: AITopicAnalysisItem[];
  whatsHappeningTopicTrendsData: TopicTrendsOverTimeRow[];
  whatsHappeningAITrendAnalysis: AITrendAnalysisItem[];
  whatsHappeningWordCloud: WordCloudItem[];
  whatsHappeningClusters: ConversationClusterItem[];
  whatsHappeningHashtags: TopHashtagItem[];
  whatsHappeningAccounts: TopAccountItem[];
  whatsHappeningContents: TopContentItem[];
  whatsHappeningKOLMatrix: KOLMatrixItem[];
  whatsHappeningAIKOLAnalysis: AIKOLAnalysisItem[];
  whatsHappeningShareOfPlatform: ShareOfPlatformRow[];
  competitiveMatrixItems: CompetitiveMatrixItem[];
  competitiveQuadrantAnalysis: QuadrantAnalysisItem[];
  competitiveSentimentScores: CompetitiveHeatmapRow[];
  competitiveVolumeOfMentions: CompetitiveHeatmapRow[];
  competitiveShareOfVoice: ShareOfVoiceRow[];
  competitiveBrandLabels?: CompetitiveBrandLabels;
  /** Raw content untuk tab Source Contents (Social Media, Reviews, News). */
  rawSourceContents?: RawSourceContentItem[];
}

export const defaultFeatureVisibility: FeatureVisibility = {
  statsOverview: true,
  actionRecommendations: true,
  outletSatisfaction: true,
  risksOpportunities: true,
  competitiveAnalysis: true,
  recentInsights: true,
};

