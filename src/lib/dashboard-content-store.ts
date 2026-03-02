import type {
  DashboardContentStore,
  StatItem,
  PriorityActionItem,
  OutletItem,
  RiskItem,
  OpportunityItem,
  CompetitiveIssueItem,
  SentimentTrendItem,
  TopTopicItem,
  WordCloudItem,
} from "./dashboard-content-types";
import { defaultFeatureVisibility } from "./dashboard-content-types";
import { getInitialDashboardContentForInstance } from "./initial-data";

const STORAGE_KEY_PREFIX = "naradai_dashboard_content";

function getStorageKey(instanceId: string): string {
  return `${STORAGE_KEY_PREFIX}_${instanceId}`;
}

export const defaultDashboardContent: DashboardContentStore = {
  featureVisibility: defaultFeatureVisibility,
  statsOverview: [
    { id: "1", label: "Conversations Analyzed", value: "847.2K", description: "Posts and comments containing keywords related to your brand and competitors", icon: "Users" },
    { id: "2", label: "Average Sentiment Score", value: "0.72", description: "The average sentiment score (0.0–1.0) of the conversations related to your brand", icon: "TrendingUp" },
    { id: "3", label: "Critical Issues", value: "23", description: "Critical issues identified by Naradai AI where sentiment is relatively worse with mentions volume relatively higher", icon: "AlertTriangle" },
    { id: "4", label: "Share of Voice", value: "34.2%", description: "Your brand's share of total conversations compared to competitors", icon: "BarChart3" },
  ],
  priorityActions: [
    { id: "1", priority: "critical", title: "Address Packaging Complaints", description: "23% increase in negative mentions about product packaging damage during shipping", impact: "High", effort: "Medium", recommendation: "Contact logistics team to review packaging protocols. Consider switching to reinforced boxes for fragile items.", category: "Critical Issue", quadrantColor: "red", relatedIssues: ["Packaging"], metrics: { mentions: 1847, sentiment: -0.68, trend: "increasing" }, sourceContent: [{ id: "sc1", platform: "twitter", author: "@johndoe", content: "Just received my order and the box was completely crushed. Product inside is damaged. Really disappointed with the packaging quality @YourBrand", sentiment: -0.85, timestamp: "2 days ago", engagement: { likes: 234, replies: 45, retweets: 12 } }] },
    { id: "2", priority: "high", title: "Respond to Customer Service Backlash", description: "Wait times trending 40% longer than last month with rising frustration", impact: "Critical", effort: "Low", recommendation: "Publish transparent update about support improvements. Deploy chatbot for common queries.", category: "Critical Issue", quadrantColor: "red", relatedIssues: ["Customer Service", "Support Availability"], metrics: { mentions: 2341, sentiment: -0.54, trend: "increasing" }, sourceContent: [] },
    { id: "3", priority: "medium", title: "Capitalize on Feature Request Trend", description: "Mobile app dark mode requested by 15% of active users in discussions", impact: "Medium", effort: "High", recommendation: "Fast-track dark mode feature. Consider beta program to engage early adopters.", category: "Opportunity", quadrantColor: "cyan", relatedIssues: ["Features", "App UX"], metrics: { mentions: 892, sentiment: 0.42, trend: "stable" }, sourceContent: [] },
  ],
  outletSatisfaction: [
    { id: "1", name: "Medan Central", location: "Sumatra", coords: { x: 15, y: 35 }, status: "good", satisfaction: 0.84, issues: [] },
    { id: "2", name: "Jakarta Flagship", location: "Java", coords: { x: 28, y: 75 }, status: "critical", satisfaction: -0.32, issues: ["Long wait times", "Product availability"] },
    { id: "3", name: "Bandung Hub", location: "Java", coords: { x: 32, y: 78 }, status: "warning", satisfaction: 0.16, issues: ["Staff friendliness"] },
    { id: "4", name: "Surabaya East", location: "Java", coords: { x: 45, y: 82 }, status: "good", satisfaction: 0.76, issues: [] },
    { id: "5", name: "Banjarmasin Riverside", location: "Kalimantan", coords: { x: 48, y: 55 }, status: "good", satisfaction: 0.64, issues: [] },
    { id: "6", name: "Makassar Port", location: "Sulawesi", coords: { x: 62, y: 65 }, status: "warning", satisfaction: 0.30, issues: ["Delivery delays"] },
    { id: "7", name: "Manado North", location: "Sulawesi", coords: { x: 68, y: 35 }, status: "good", satisfaction: 0.78, issues: [] },
    { id: "8", name: "Denpasar Tourist", location: "Bali", coords: { x: 50, y: 88 }, status: "critical", satisfaction: -0.44, issues: ["High price perception", "Cleanliness"] },
    { id: "9", name: "Jayapura East", location: "Papua", coords: { x: 92, y: 72 }, status: "good", satisfaction: 0.90, issues: [] },
  ],
  risks: [
    { id: "1", title: "Declining Brand Sentiment", description: "Negative sentiment increased by 14% over the last 7 days", severity: "high", probability: 85, impact: "Brand reputation", trend: "increasing", supportingContents: 47, indicators: [{ label: "Customer Service", value: -0.54, change: -12 }, { label: "Product Quality", value: -0.28, change: -8 }, { label: "Packaging", value: -0.68, change: -23 }], mitigation: ["Monitor sentiment trends daily for early warning signs", "Prepare response communication templates", "Engage customer support team for rapid response"], sourceContent: [{ id: "r1", platform: "twitter", author: "@frustrated_user", content: "Really disappointed with @YourBrand lately. Quality just isn't what it used to be.", sentiment: -0.78, timestamp: "1 day ago" }] },
    { id: "2", title: "Competitor Gaining Market Share", description: "Competitor B's share of voice increased 8% this month", severity: "medium", probability: 72, impact: "Market position", trend: "increasing", supportingContents: 31, indicators: [{ label: "Social Mentions", value: 24, change: 8 }, { label: "Engagement Rate", value: 7.8, change: 12 }, { label: "Positive Sentiment", value: 75, change: 6 }], mitigation: [], sourceContent: [] },
    { id: "3", title: "Product Launch Backlash Risk", description: "Early feedback on new feature shows 42% negative response", severity: "critical", probability: 68, impact: "Product adoption", trend: "stable", supportingContents: 63, indicators: [{ label: "Usability Issues", value: 156, change: 45 }, { label: "Performance Complaints", value: 89, change: 23 }, { label: "Design Criticism", value: 67, change: 12 }], mitigation: [], sourceContent: [] },
  ],
  opportunities: [
    { id: "1", title: "Sustainability Movement Alignment", description: "34% of conversations mention eco-friendly preferences", potential: "high", confidence: 88, timeframe: "Short-term", category: "Product positioning", trend: "increasing", supportingContents: 52, metrics: { conversationVolume: 4521, growthRate: 34, sentimentScore: 0.76 }, recommendations: ["Launch eco-friendly product line", "Highlight sustainable practices", "Partner with environmental organizations"], sourceContent: [] },
    { id: "2", title: "Untapped Mobile User Segment", description: "Mobile users show 2.3x higher engagement but underserved", potential: "high", confidence: 91, timeframe: "Medium-term", category: "Market expansion", trend: "increasing", supportingContents: 38, metrics: { segmentSize: 156000, engagementRate: 12.4, conversionPotential: 68 }, recommendations: ["Optimize mobile app experience", "Create mobile-first features", "Target mobile advertising"], sourceContent: [] },
    { id: "3", title: "Influencer Partnership Gap", description: "Competitors have 3x more influencer mentions", potential: "medium", confidence: 79, timeframe: "Short-term", category: "Brand awareness", trend: "stable", supportingContents: 24, metrics: { currentInfluencers: 12, competitorAverage: 36, potentialReach: 2400000 }, recommendations: ["Identify and partner with micro-influencers", "Create affiliate program", "Amplify user-generated content"], sourceContent: [] },
  ],
  competitiveIssues: [
    { id: "1", issue: "Product Quality", category: "winning", yourSentiment: 0.78, competitorMedianSentiment: 0.68, yourMentions: 2500, competitorMedianMentions: 2000, relativeSentiment: 15, relativeMentions: 25 },
    { id: "2", issue: "Customer Service", category: "critical", yourSentiment: 0.32, competitorMedianSentiment: 0.67, yourMentions: 2800, competitorMedianMentions: 2000, relativeSentiment: -35, relativeMentions: 40 },
    { id: "3", issue: "Pricing", category: "moderate", yourSentiment: 0.58, competitorMedianSentiment: 0.70, yourMentions: 2300, competitorMedianMentions: 2000, relativeSentiment: -12, relativeMentions: 15 },
    { id: "4", issue: "Features", category: "opportunity", yourSentiment: 0.73, competitorMedianSentiment: 0.65, yourMentions: 1700, competitorMedianMentions: 2000, relativeSentiment: 8, relativeMentions: -15 },
    { id: "5", issue: "Packaging", category: "critical", yourSentiment: 0.38, competitorMedianSentiment: 0.66, yourMentions: 2600, competitorMedianMentions: 2000, relativeSentiment: -28, relativeMentions: 30 },
    { id: "6", issue: "Shipping Speed", category: "opportunity", yourSentiment: 0.82, competitorMedianSentiment: 0.62, yourMentions: 2200, competitorMedianMentions: 2000, relativeSentiment: 20, relativeMentions: 10 },
    { id: "7", issue: "App UX", category: "opportunity", yourSentiment: 0.70, competitorMedianSentiment: 0.65, yourMentions: 1600, competitorMedianMentions: 2000, relativeSentiment: 5, relativeMentions: -20 },
    { id: "8", issue: "Innovation", category: "winning", yourSentiment: 0.80, competitorMedianSentiment: 0.62, yourMentions: 2700, competitorMedianMentions: 2000, relativeSentiment: 18, relativeMentions: 35 },
  ],
  competitiveKeyInsights: [
    { id: "ki1", type: "critical", title: "Critical Issues", description: "Customer Service & Packaging are significantly underperforming with high visibility", bullets: ["Support Availability: -40% sentiment, +35% mentions", "Customer Service: -35% sentiment, +40% mentions"] },
    { id: "ki2", type: "strength", title: "Competitive Strengths", description: "Innovation & Product Quality are strong differentiators", bullets: ["Innovation: +18% sentiment, +35% mentions", "Shipping Speed: +20% sentiment, +10% mentions"] },
  ],
  whatsHappeningSentimentTrends: [
    { date: "Nov 1", positive: 68, negative: 22, neutral: 10 },
    { date: "Nov 8", positive: 73, negative: 17, neutral: 10 },
    { date: "Nov 15", positive: 67, negative: 23, neutral: 10 },
    { date: "Nov 22", positive: 62, negative: 28, neutral: 10 },
    { date: "Nov 30", positive: 61, negative: 29, neutral: 10 },
  ] as SentimentTrendItem[],
  whatsHappeningTopTopics: [
    { topic: "Packaging", mentions: 2847, sentiment: -0.68 },
    { topic: "Customer Service", mentions: 2341, sentiment: -0.54 },
    { topic: "Product Quality", mentions: 1923, sentiment: 0.71 },
    { topic: "Shipping Speed", mentions: 1654, sentiment: 0.32 },
    { topic: "Price Value", mentions: 1432, sentiment: 0.45 },
    { topic: "Mobile App", mentions: 892, sentiment: 0.12 },
  ] as TopTopicItem[],
  whatsHappeningWordCloud: [
    { text: "quality", weight: 95, sentiment: "positive" },
    { text: "customer service", weight: 88, sentiment: "negative" },
    { text: "price", weight: 82, sentiment: "neutral" },
    { text: "delivery", weight: 78, sentiment: "positive" },
    { text: "packaging", weight: 72, sentiment: "negative" },
  ] as WordCloudItem[],
  whatsHappeningKeyEvents: [
    { id: "ke1", date: "Nov 9", title: "Product Launch Success", description: "New feature rollout received 75% positive sentiment, highest this month." },
    { id: "ke2", date: "Nov 17", title: "Packaging Issue Reports Spike", description: "Shipping damage complaints increased 23%, causing sentiment drop." },
    { id: "ke3", date: "Nov 17", title: "Competitor Price War Begins", description: "Major competitor slashed prices by 30%, triggering negative brand comparisons." },
    { id: "ke4", date: "Nov 25", title: "Customer Service Backlash", description: "Support wait times triggered wave of negative feedback across platforms." },
  ],
  whatsHappeningAITopicAnalysis: [
    { id: "ata1", type: "critical", title: "Packaging is #1 Pain Point", description: "Most discussed topic with highly negative sentiment. Immediate action required to prevent brand damage." },
    { id: "ata2", type: "opportunity", title: "Product Quality is a Strength", description: "High volume with positive sentiment. Leverage this in marketing to counter negative narratives." },
    { id: "ata3", type: "insight", title: "Mobile App Underperforming", description: "Low mention volume with neutral sentiment suggests lack of engagement. Consider feature improvements." },
  ],
  whatsHappeningTopicTrendsData: [
    { date: "Nov 1", packaging: 320, customerService: 280, productQuality: 245, shipping: 190 },
    { date: "Nov 5", packaging: 340, customerService: 265, productQuality: 260, shipping: 185 },
    { date: "Nov 9", packaging: 355, customerService: 270, productQuality: 280, shipping: 195 },
    { date: "Nov 13", packaging: 380, customerService: 285, productQuality: 275, shipping: 200 },
    { date: "Nov 17", packaging: 465, customerService: 295, productQuality: 270, shipping: 205 },
    { date: "Nov 21", packaging: 520, customerService: 340, productQuality: 265, shipping: 210 },
    { date: "Nov 25", packaging: 567, customerService: 401, productQuality: 260, shipping: 215 },
  ],
  whatsHappeningAITrendAnalysis: [
    { id: "atra1", type: "critical", title: "Packaging Mentions Surging", description: "77% increase in packaging discussions since Nov 1. Spike correlates with shipping damage reports." },
    { id: "atra2", type: "warning", title: "Customer Service Escalating", description: "43% rise in customer service mentions, accelerating after Nov 21. Wait times are primary driver." },
    { id: "atra3", type: "insight", title: "Product Quality Discussions Stable", description: "Minimal variation in product quality mentions. Consistent positive sentiment indicates strength." },
  ],
  whatsHappeningClusters: [
    { id: "cl1", theme: "Packaging Damage Issues", size: 2847, sentiment: -0.68, trend: "up", keywords: ["broken", "damaged", "poor packaging", "arrived broken"] },
    { id: "cl2", theme: "Excellent Product Quality", size: 1923, sentiment: 0.71, trend: "stable", keywords: ["high quality", "durable", "worth it", "exceeded expectations"] },
    { id: "cl3", theme: "Customer Support Delays", size: 2341, sentiment: -0.54, trend: "up", keywords: ["slow response", "waiting", "no reply", "poor support"] },
    { id: "cl4", theme: "Fast Shipping Praise", size: 1654, sentiment: 0.32, trend: "down", keywords: ["quick delivery", "fast shipping", "arrived early", "prompt"] },
  ],
  whatsHappeningHashtags: [
    { id: "h1", tag: "#BrandXFail", conversations: 1240, likes: 8921, comments: 3412 },
    { id: "h2", tag: "#SkincareTok", conversations: 980, likes: 7654, comments: 2187 },
    { id: "h3", tag: "#BrandXReview", conversations: 856, likes: 6432, comments: 1954 },
    { id: "h4", tag: "#CleanBeauty", conversations: 720, likes: 5876, comments: 1643 },
    { id: "h5", tag: "#PackagingFail", conversations: 690, likes: 5210, comments: 2876 },
    { id: "h6", tag: "#BrandXLove", conversations: 612, likes: 4987, comments: 1102 },
    { id: "h7", tag: "#AffordableSkincare", conversations: 544, likes: 4321, comments: 987 },
    { id: "h8", tag: "#CompetitorAvsX", conversations: 498, likes: 3876, comments: 1543 },
    { id: "h9", tag: "#GlowUp", conversations: 421, likes: 3210, comments: 765 },
    { id: "h10", tag: "#BrandXAlternative", conversations: 388, likes: 2987, comments: 1321 },
  ],
  whatsHappeningAccounts: [
    { id: "ac1", name: "GlowUpGuru", handle: "@glowupguru", platform: "YouTube", followers: 1240000, conversations: 87, likes: 34200, replies: 8740 },
    { id: "ac2", name: "Beauty Obsessed", handle: "@beautyobsessed", platform: "Twitter", followers: 890000, conversations: 124, likes: 28900, replies: 6320 },
    { id: "ac3", name: "Skincare Daily", handle: "@skincaredaily", platform: "Twitter", followers: 760000, conversations: 96, likes: 22100, replies: 5480 },
    { id: "ac4", name: "Glow Journey", handle: "@glowjourney", platform: "Instagram", followers: 654000, conversations: 63, likes: 19800, replies: 4120 },
    { id: "ac5", name: "BeautyHacks101", handle: "@beautyhacks101", platform: "YouTube", followers: 521000, conversations: 45, likes: 16400, replies: 3890 },
    { id: "ac6", name: "Deal Watcher", handle: "@dealwatcher", platform: "Twitter", followers: 412000, conversations: 78, likes: 12300, replies: 3210 },
    { id: "ac7", name: "Loyal Customer", handle: "@loyalcustomer", platform: "Instagram", followers: 328000, conversations: 34, likes: 9870, replies: 2140 },
    { id: "ac8", name: "frustrated_buyer", handle: "u/frustrated_buyer", platform: "Reddit", followers: 245000, conversations: 56, likes: 8430, replies: 4670 },
    { id: "ac9", name: "online_shopper99", handle: "u/online_shopper99", platform: "Reddit", followers: 198000, conversations: 42, likes: 6210, replies: 3540 },
    { id: "ac10", name: "tech_user42", handle: "u/tech_user42", platform: "Reddit", followers: 156000, conversations: 38, likes: 4890, replies: 2980 },
  ],
  whatsHappeningContents: [
    { id: "co1", title: "OMG the new packaging is literally falling apart 😭", platform: "Twitter", author: "@beautyobsessed", likes: 4823, comments: 1247 },
    { id: "co2", title: "Honest review: Is Brand X worth the hype? (spoiler: YES)", platform: "YouTube", author: "GlowUpGuru", likes: 3912, comments: 982 },
    { id: "co3", title: "Customer service finally responded after 3 weeks...", platform: "Reddit", author: "u/frustrated_buyer", likes: 3541, comments: 876 },
    { id: "co4", title: "Brand X vs Competitor A - full comparison thread 🧵", platform: "Twitter", author: "@skincaredaily", likes: 3104, comments: 743 },
    { id: "co5", title: "Just switched from Competitor B and WOW the difference", platform: "Instagram", author: "@glowjourney", likes: 2876, comments: 654 },
    { id: "co6", title: "Why does nobody talk about their shipping issues?", platform: "Reddit", author: "u/online_shopper99", likes: 2654, comments: 891 },
    { id: "co7", title: "Brand X appreciation post - 2 years and counting ❤️", platform: "Instagram", author: "@loyalcustomer", likes: 2431, comments: 412 },
    { id: "co8", title: "Price increase again?? This is getting ridiculous", platform: "Twitter", author: "@dealwatcher", likes: 2198, comments: 567 },
    { id: "co9", title: "Tutorial: How to get the most out of Brand X products", platform: "YouTube", author: "BeautyHacks101", likes: 1987, comments: 324 },
    { id: "co10", title: "My mobile app keeps crashing after the latest update", platform: "Reddit", author: "u/tech_user42", likes: 1765, comments: 498 },
  ],
  whatsHappeningKOLMatrix: [
    { id: "kol1", name: "@TechReviewer", followers: 245000, positivity: 82, engagement: 12400, color: "#10b981", category: "Tech Influencer" },
    { id: "kol2", name: "@DigitalTrends", followers: 189000, positivity: 76, engagement: 9800, color: "#06b6d4", category: "Media Outlet" },
    { id: "kol3", name: "@ProductGuru", followers: 156000, positivity: 88, engagement: 15600, color: "#10b981", category: "Product Reviewer" },
    { id: "kol4", name: "@TechCritic", followers: 134000, positivity: 34, engagement: 8900, color: "#ef4444", category: "Critical Reviewer" },
    { id: "kol5", name: "@IndustryInsider", followers: 98000, positivity: 68, engagement: 5200, color: "#f59e0b", category: "Industry Expert" },
    { id: "kol6", name: "@ConsumerWatch", followers: 87000, positivity: 42, engagement: 6700, color: "#ef4444", category: "Consumer Advocate" },
    { id: "kol7", name: "@SmartBuyer", followers: 72000, positivity: 79, engagement: 4800, color: "#06b6d4", category: "Shopping Guide" },
    { id: "kol8", name: "@EcoReviews", followers: 64000, positivity: 91, engagement: 7200, color: "#10b981", category: "Sustainability Focus" },
    { id: "kol9", name: "@BudgetHacks", followers: 53000, positivity: 58, engagement: 3400, color: "#f59e0b", category: "Value Focused" },
    { id: "kol10", name: "@QualityFirst", followers: 47000, positivity: 85, engagement: 5100, color: "#10b981", category: "Quality Advocate" },
    { id: "kol11", name: "@TrendSpotter", followers: 38000, positivity: 72, engagement: 2900, color: "#06b6d4", category: "Trend Analyst" },
    { id: "kol12", name: "@HonestReview", followers: 29000, positivity: 51, engagement: 1800, color: "#f59e0b", category: "Honest Opinions" },
    { id: "kol13", name: "@DailyDeals", followers: 23000, positivity: 64, engagement: 1400, color: "#06b6d4", category: "Deals Curator" },
    { id: "kol14", name: "@UnboxExpert", followers: 18000, positivity: 38, engagement: 1200, color: "#ef4444", category: "Unboxing Channel" },
    { id: "kol15", name: "@GreenChoice", followers: 12000, positivity: 94, engagement: 1600, color: "#10b981", category: "Eco Advocate" },
  ],
  whatsHappeningAIKOLAnalysis: [
    { id: "kola1", type: "critical", title: "Engage @TechCritic Urgently", description: "High-reach influencer (134K followers) with only 34% positive sentiment. One negative post could reach thousands. Prioritize relationship building." },
    { id: "kola2", type: "opportunity", title: "Partner with @ProductGuru", description: "Top-tier influencer with 88% positivity and high engagement. Perfect candidate for brand ambassadorship or product collaboration." },
    { id: "kola3", type: "insight", title: "Nurture Mid-Tier Advocates", description: "@EcoReviews (91% positive) and @QualityFirst (85% positive) are smaller but highly supportive. Great for authentic testimonials." },
  ],
  whatsHappeningShareOfPlatform: [
    { date: "Jan 1", twitter: 1200, youtube: 600, reddit: 500, instagram: 700, facebook: 550, tiktok: 400 },
    { date: "Jan 8", twitter: 1350, youtube: 650, reddit: 550, instagram: 750, facebook: 500, tiktok: 450 },
    { date: "Jan 15", twitter: 1100, youtube: 700, reddit: 600, instagram: 680, facebook: 520, tiktok: 480 },
    { date: "Jan 22", twitter: 1500, youtube: 720, reddit: 650, instagram: 800, facebook: 580, tiktok: 500 },
    { date: "Jan 29", twitter: 1400, youtube: 680, reddit: 700, instagram: 850, facebook: 600, tiktok: 520 },
    { date: "Feb 5", twitter: 1600, youtube: 750, reddit: 620, instagram: 900, facebook: 550, tiktok: 550 },
    { date: "Feb 12", twitter: 1450, youtube: 800, reddit: 680, instagram: 820, facebook: 620, tiktok: 600 },
    { date: "Feb 19", twitter: 1550, youtube: 770, reddit: 720, instagram: 880, facebook: 580, tiktok: 570 },
    { date: "Feb 26", twitter: 1700, youtube: 850, reddit: 750, instagram: 950, facebook: 640, tiktok: 620 },
    { date: "Mar 5", twitter: 1650, youtube: 820, reddit: 800, instagram: 920, facebook: 600, tiktok: 650 },
    { date: "Mar 12", twitter: 1800, youtube: 900, reddit: 780, instagram: 980, facebook: 660, tiktok: 700 },
    { date: "Mar 19", twitter: 1750, youtube: 880, reddit: 830, instagram: 1000, facebook: 680, tiktok: 720 },
  ],
  competitiveMatrixItems: [
    { id: "cm1", name: "Your Brand", mentions: 42000, positivePercentage: 58, size: 850, color: "#8b5cf6" },
    { id: "cm2", name: "Competitor A", mentions: 38000, positivePercentage: 62, size: 720, color: "#06b6d4" },
    { id: "cm3", name: "Competitor B", mentions: 31000, positivePercentage: 71, size: 650, color: "#10b981" },
    { id: "cm4", name: "Competitor C", mentions: 24000, positivePercentage: 54, size: 480, color: "#f59e0b" },
    { id: "cm5", name: "Competitor D", mentions: 18000, positivePercentage: 48, size: 380, color: "#ef4444" },
  ],
  competitiveQuadrantAnalysis: [
    { id: "qa1", label: "High Volume + Positive", brands: "Competitor A, B", note: "Market leaders" },
    { id: "qa2", label: "High Volume + Mixed", brands: "Your Brand", note: "Improve sentiment" },
    { id: "qa3", label: "Low Volume + Mixed", brands: "Competitor C, D", note: "Growth opportunity" },
    { id: "qa4", label: "Key Insight", brands: "↗ Move up-right", note: "Increase positive %" },
  ],
  competitiveSentimentScores: [
    { issue: "Product Quality", yourBrand: 0.78, competitorA: 0.72, competitorB: 0.65, competitorC: 0.68, competitorD: 0.71 },
    { issue: "Customer Service", yourBrand: 0.32, competitorA: 0.68, competitorB: 0.71, competitorC: 0.65, competitorD: 0.64 },
    { issue: "Pricing", yourBrand: 0.58, competitorA: 0.72, competitorB: 0.68, competitorC: 0.70, competitorD: 0.69 },
    { issue: "Features", yourBrand: 0.73, competitorA: 0.67, competitorB: 0.65, competitorC: 0.64, competitorD: 0.63 },
    { issue: "Packaging", yourBrand: 0.38, competitorA: 0.65, competitorB: 0.68, competitorC: 0.67, competitorD: 0.64 },
    { issue: "Shipping Speed", yourBrand: 0.82, competitorA: 0.58, competitorB: 0.62, competitorC: 0.65, competitorD: 0.61 },
    { issue: "App UX", yourBrand: 0.70, competitorA: 0.66, competitorB: 0.64, competitorC: 0.65, competitorD: 0.67 },
    { issue: "Innovation", yourBrand: 0.80, competitorA: 0.60, competitorB: 0.58, competitorC: 0.65, competitorD: 0.62 },
  ],
  competitiveVolumeOfMentions: [
    { issue: "Product Quality", yourBrand: 2500, competitorA: 2100, competitorB: 1900, competitorC: 2000, competitorD: 1950 },
    { issue: "Customer Service", yourBrand: 2800, competitorA: 2050, competitorB: 1980, competitorC: 1900, competitorD: 2100 },
    { issue: "Pricing", yourBrand: 2300, competitorA: 2000, competitorB: 1950, competitorC: 2050, competitorD: 2020 },
    { issue: "Features", yourBrand: 1700, competitorA: 2100, competitorB: 1950, competitorC: 1980, competitorD: 2050 },
    { issue: "Packaging", yourBrand: 2600, competitorA: 1900, competitorB: 2050, competitorC: 2000, competitorD: 1980 },
    { issue: "Shipping Speed", yourBrand: 2200, competitorA: 2050, competitorB: 1980, competitorC: 1950, competitorD: 2100 },
    { issue: "App UX", yourBrand: 1600, competitorA: 2100, competitorB: 1950, competitorC: 2000, competitorD: 1900 },
    { issue: "Innovation", yourBrand: 2700, competitorA: 1950, competitorB: 1900, competitorC: 2100, competitorD: 2000 },
  ],
  competitiveShareOfVoice: [
    { date: "Jan 1", yourBrand: 1800, competitorA: 1500, competitorB: 1300, competitorC: 1400, competitorD: 1350 },
    { date: "Jan 8", yourBrand: 2100, competitorA: 1600, competitorB: 1400, competitorC: 1500, competitorD: 1420 },
    { date: "Jan 15", yourBrand: 1950, competitorA: 1700, competitorB: 1350, competitorC: 1550, competitorD: 1480 },
    { date: "Jan 22", yourBrand: 2300, competitorA: 1800, competitorB: 1500, competitorC: 1600, competitorD: 1520 },
    { date: "Jan 29", yourBrand: 2500, competitorA: 1750, competitorB: 1450, competitorC: 1650, competitorD: 1580 },
    { date: "Feb 5", yourBrand: 2200, competitorA: 1900, competitorB: 1550, competitorC: 1700, competitorD: 1600 },
    { date: "Feb 12", yourBrand: 2600, competitorA: 1850, competitorB: 1600, competitorC: 1750, competitorD: 1650 },
    { date: "Feb 19", yourBrand: 2400, competitorA: 2000, competitorB: 1650, competitorC: 1800, competitorD: 1700 },
    { date: "Feb 26", yourBrand: 2800, competitorA: 1950, competitorB: 1700, competitorC: 1850, competitorD: 1750 },
    { date: "Mar 5", yourBrand: 2700, competitorA: 2100, competitorB: 1750, competitorC: 1900, competitorD: 1800 },
    { date: "Mar 12", yourBrand: 3000, competitorA: 2050, competitorB: 1800, competitorC: 1950, competitorD: 1850 },
    { date: "Mar 19", yourBrand: 2900, competitorA: 2200, competitorB: 1850, competitorC: 2000, competitorD: 1900 },
  ],
  competitiveBrandLabels: {
    yourBrand: "Your Brand",
    competitorA: "Competitor A",
    competitorB: "Competitor B",
    competitorC: "Competitor C",
    competitorD: "Competitor D",
  },
  rawSourceContents: [],
};

const LEGACY_STORAGE_KEY = "naradai_dashboard_content";

export function loadDashboardContent(instanceId: string = "default"): DashboardContentStore {
  try {
    const key = getStorageKey(instanceId);
    let raw = localStorage.getItem(key);
    if (!raw && instanceId === "bukalapak") {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) {
      const initial = getInitialDashboardContentForInstance(instanceId, defaultDashboardContent);
      if (initial) return initial;
      return defaultDashboardContent;
    }
    const parsed = JSON.parse(raw) as DashboardContentStore;
    const initial = getInitialDashboardContentForInstance(instanceId, defaultDashboardContent);
    const isKapalApiWithWrongSavedDefault =
      instanceId === "kapal_api_12_19_feb_2026" &&
      parsed?.statsOverview?.[0]?.value === "847.2K";
    if (isKapalApiWithWrongSavedDefault && initial) {
      localStorage.removeItem(key);
      return initial;
    }
    const parsedActions = parsed.priorityActions ?? defaultDashboardContent.priorityActions;
    const initialActions = initial?.priorityActions;
    const priorityActions =
      Array.isArray(initialActions) && initialActions.length > 0 && Array.isArray(parsedActions)
        ? parsedActions.map((pa) => {
            const fromInitial = initialActions.find((ia) => ia.id === pa.id);
            if (!fromInitial) return pa;
            return {
              ...pa,
              sourceUsername: pa.sourceUsername ?? fromInitial.sourceUsername,
              sourceContent: pa.sourceContent ?? fromInitial.sourceContent,
              metrics: { ...fromInitial.metrics, ...pa.metrics },
            };
          })
        : parsedActions;

    // Special handling untuk Share of Platform:
    // - Untuk instance bukalapak, kita ingin pakai struktur baru [mention, "xx%"] dari initial-data.
    // - Data lama yang tersimpan di localStorage masih memakai angka mentah (bukan array), sehingga tooltip jadi tidak sesuai.
    const parsedShareOfPlatform = parsed.whatsHappeningShareOfPlatform;
    const initialShareOfPlatform = initial?.whatsHappeningShareOfPlatform;
    const isLegacyBukalapakShareOfPlatform =
      instanceId === "bukalapak" &&
      Array.isArray(parsedShareOfPlatform) &&
      parsedShareOfPlatform.length > 0 &&
      typeof (parsedShareOfPlatform[0] as any)?.twitter === "number" &&
      !Array.isArray((parsedShareOfPlatform[0] as any)?.twitter);

    const whatsHappeningShareOfPlatform =
      (!isLegacyBukalapakShareOfPlatform &&
      Array.isArray(parsedShareOfPlatform) &&
      parsedShareOfPlatform.length > 0
        ? parsedShareOfPlatform
        : initialShareOfPlatform) ?? defaultDashboardContent.whatsHappeningShareOfPlatform;

    return {
      featureVisibility: parsed.featureVisibility ?? defaultDashboardContent.featureVisibility,
      statsOverview: parsed.statsOverview ?? defaultDashboardContent.statsOverview,
      priorityActions,
      outletSatisfaction: parsed.outletSatisfaction ?? defaultDashboardContent.outletSatisfaction,
      risks: parsed.risks ?? defaultDashboardContent.risks,
      opportunities: parsed.opportunities ?? defaultDashboardContent.opportunities,
      competitiveIssues: parsed.competitiveIssues ?? defaultDashboardContent.competitiveIssues,
      competitiveKeyInsights: parsed.competitiveKeyInsights ?? defaultDashboardContent.competitiveKeyInsights,
      whatsHappeningSentimentTrends: parsed.whatsHappeningSentimentTrends ?? defaultDashboardContent.whatsHappeningSentimentTrends,
      whatsHappeningKeyEvents: parsed.whatsHappeningKeyEvents ?? defaultDashboardContent.whatsHappeningKeyEvents,
      whatsHappeningTopTopics: parsed.whatsHappeningTopTopics ?? defaultDashboardContent.whatsHappeningTopTopics,
      whatsHappeningAITopicAnalysis: parsed.whatsHappeningAITopicAnalysis ?? defaultDashboardContent.whatsHappeningAITopicAnalysis,
      whatsHappeningTopicTrendsData:
        (Array.isArray(parsed.whatsHappeningTopicTrendsData) && parsed.whatsHappeningTopicTrendsData.length > 0
          ? parsed.whatsHappeningTopicTrendsData
          : initial?.whatsHappeningTopicTrendsData) ?? defaultDashboardContent.whatsHappeningTopicTrendsData,
      whatsHappeningAITrendAnalysis: parsed.whatsHappeningAITrendAnalysis ?? defaultDashboardContent.whatsHappeningAITrendAnalysis,
      whatsHappeningWordCloud: parsed.whatsHappeningWordCloud ?? defaultDashboardContent.whatsHappeningWordCloud,
      whatsHappeningClusters: parsed.whatsHappeningClusters ?? defaultDashboardContent.whatsHappeningClusters,
      whatsHappeningHashtags: parsed.whatsHappeningHashtags ?? defaultDashboardContent.whatsHappeningHashtags,
      whatsHappeningAccounts: parsed.whatsHappeningAccounts ?? defaultDashboardContent.whatsHappeningAccounts,
      whatsHappeningContents: parsed.whatsHappeningContents ?? defaultDashboardContent.whatsHappeningContents,
      whatsHappeningKOLMatrix: parsed.whatsHappeningKOLMatrix ?? defaultDashboardContent.whatsHappeningKOLMatrix,
      whatsHappeningAIKOLAnalysis: parsed.whatsHappeningAIKOLAnalysis ?? defaultDashboardContent.whatsHappeningAIKOLAnalysis,
      whatsHappeningShareOfPlatform,
      competitiveMatrixItems:
        (Array.isArray(parsed.competitiveMatrixItems) && parsed.competitiveMatrixItems.length > 0
          ? parsed.competitiveMatrixItems
          : initial?.competitiveMatrixItems) ?? defaultDashboardContent.competitiveMatrixItems,
      competitiveQuadrantAnalysis:
        (Array.isArray(parsed.competitiveQuadrantAnalysis) && parsed.competitiveQuadrantAnalysis.length > 0
          ? parsed.competitiveQuadrantAnalysis
          : initial?.competitiveQuadrantAnalysis) ?? defaultDashboardContent.competitiveQuadrantAnalysis,
      competitiveSentimentScores:
        (Array.isArray(parsed.competitiveSentimentScores) && parsed.competitiveSentimentScores.length > 0
          ? parsed.competitiveSentimentScores
          : initial?.competitiveSentimentScores) ?? defaultDashboardContent.competitiveSentimentScores,
      competitiveVolumeOfMentions:
        (Array.isArray(parsed.competitiveVolumeOfMentions) && parsed.competitiveVolumeOfMentions.length > 0
          ? parsed.competitiveVolumeOfMentions
          : initial?.competitiveVolumeOfMentions) ?? defaultDashboardContent.competitiveVolumeOfMentions,
      competitiveShareOfVoice: parsed.competitiveShareOfVoice ?? defaultDashboardContent.competitiveShareOfVoice,
      competitiveBrandLabels: parsed.competitiveBrandLabels ?? initial?.competitiveBrandLabels ?? defaultDashboardContent.competitiveBrandLabels,
      rawSourceContents: (Array.isArray(parsed.rawSourceContents) && parsed.rawSourceContents.length > 0 ? parsed.rawSourceContents : initial?.rawSourceContents) ?? defaultDashboardContent.rawSourceContents,
    };
  } catch {
    return defaultDashboardContent;
  }
}

export function saveDashboardContent(data: DashboardContentStore, instanceId: string = "default"): void {
  localStorage.setItem(getStorageKey(instanceId), JSON.stringify(data));
}

export function deleteDashboardContent(instanceId: string): void {
  const key = getStorageKey(instanceId);
  localStorage.removeItem(key);
  console.log(`✅ Dashboard content deleted for instance: ${instanceId}`);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
