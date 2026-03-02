import { useState, useMemo } from "react";
import { Database, ArrowUpDown, Twitter, Instagram, Facebook, Star, Newspaper, MessageSquare, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Settings2 } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { bukalapakRawSourceContents } from "@/lib/bukalapak-raw-content";
import { SourceContentManager } from "./SourceContentManager";

type SortField = string;
type SortOrder = "asc" | "desc";

interface SocialMediaContent {
  id: number;
  platform: string;
  author: string;
  content: string;
  date: string;
  sentiment: number;
  cluster: string;
  risk: string;
  opportunity: string;
  engagement: number;
}

interface ReviewContent {
  id: number;
  platform: string;
  reviewer: string;
  rating: number;
  content: string;
  date: string;
  sentiment: number;
  cluster: string;
  risk: string;
  opportunity: string;
  verified: boolean;
}

interface NewsContent {
  id: number;
  source: string;
  title: string;
  excerpt: string;
  date: string;
  sentiment: number;
  cluster: string;
  risk: string;
  opportunity: string;
  reach: number;
}

interface SourceContentsProps {
  instanceId: string;
}

export function SourceContents({ instanceId }: SourceContentsProps) {
  const content = useDashboardContent();
  const [contentMode, setContentMode] = useState<"manage" | "raw">("manage");
  const [activeTab, setActiveTab] = useState<"social" | "reviews" | "news">("social");
  const [socialSort, setSocialSort] = useState<{ field: SortField; order: SortOrder }>({ field: "date", order: "desc" });
  const [reviewSort, setReviewSort] = useState<{ field: SortField; order: SortOrder }>({ field: "date", order: "desc" });
  const [newsSort, setNewsSort] = useState<{ field: SortField; order: SortOrder }>({ field: "date", order: "desc" });
  const [socialPage, setSocialPage] = useState(1);

  const SOCIAL_PAGE_SIZE = 10;

  const raw = content?.rawSourceContents ?? [];
  const isBukalapak = instanceId === "bukalapak";
  const effectiveRaw = raw.length > 0 ? raw : (isBukalapak ? bukalapakRawSourceContents : []);
  const useRaw = effectiveRaw.length > 0;

  const socialMediaData: SocialMediaContent[] = useRaw
    ? effectiveRaw
        .filter((r) => r.source === "Social_Media")
        .map((r, i) => ({
          id: i + 1,
          platform: r.platform,
          author: r.author,
          content: r.content,
          date: r.date,
          sentiment: r.sentiment,
          cluster: r.cluster,
          risk: r.risk,
          opportunity: r.opportunity,
          engagement: r.engagement,
        }))
    : [
    {
      id: 1,
      platform: "Twitter",
      author: "@johndoe",
      content: "Just received my order and the box was completely crushed. Product inside is damaged. Really disappointed with the packaging quality @YourBrand",
      date: "2026-01-12",
      sentiment: -0.85,
      cluster: "Packaging Issues",
      risk: "High",
      opportunity: "Low",
      engagement: 291
    },
    {
      id: 2,
      platform: "Instagram",
      author: "@sarahm_shopper",
      content: "Love the product but why is the packaging so flimsy? Third time I've received a damaged box. Please use better materials!",
      date: "2026-01-11",
      sentiment: -0.72,
      cluster: "Packaging Issues",
      risk: "High",
      opportunity: "Medium",
      engagement: 184
    },
    {
      id: 3,
      platform: "Facebook",
      author: "Mike Thompson",
      content: "The product quality is great but arrived with dents and tears in the packaging. Seems like the boxes can't handle shipping well.",
      date: "2026-01-09",
      sentiment: -0.68,
      cluster: "Packaging Issues",
      risk: "Medium",
      opportunity: "Low",
      engagement: 104
    },
    {
      id: 4,
      platform: "Twitter",
      author: "@angrycustomer",
      content: "Been waiting 45 minutes on hold with @YourBrand customer service. This is ridiculous! Worst support experience ever.",
      date: "2026-01-13",
      sentiment: -0.91,
      cluster: "Customer Service",
      risk: "Critical",
      opportunity: "Low",
      engagement: 590
    },
    {
      id: 5,
      platform: "Twitter",
      author: "@uxdesignfan",
      content: "When is @YourBrand adding dark mode to the app? My eyes are begging for it! Every other app has it already.",
      date: "2026-01-13",
      sentiment: 0.45,
      cluster: "Feature Requests",
      risk: "Low",
      opportunity: "High",
      engagement: 755
    },
    {
      id: 6,
      platform: "Instagram",
      author: "@techie_mom",
      content: "The app is great but PLEASE add dark mode! Using it at night is blinding. Would be perfect with dark mode option.",
      date: "2026-01-11",
      sentiment: 0.38,
      cluster: "Feature Requests",
      risk: "Low",
      opportunity: "High",
      engagement: 379
    },
    {
      id: 7,
      platform: "Facebook",
      author: "Lisa Chen",
      content: "I've been trying to reach customer support for 3 days. No response to emails, phone wait times over an hour. What's going on?",
      date: "2026-01-12",
      sentiment: -0.87,
      cluster: "Customer Service",
      risk: "Critical",
      opportunity: "Medium",
      engagement: 321
    },
    {
      id: 8,
      platform: "Twitter",
      author: "@happycustomer",
      content: "Just got my order and I'm blown away by the quality! @YourBrand never disappoints. Highly recommend to everyone!",
      date: "2026-01-10",
      sentiment: 0.92,
      cluster: "Product Quality",
      risk: "Low",
      opportunity: "High",
      engagement: 456
    },
  ];

  const reviewData: ReviewContent[] = useRaw
    ? effectiveRaw.filter((r) => r.source === "App_Review").map((r, i) => ({
          id: i + 1,
          platform: r.platform,
          reviewer: r.author,
          rating: r.rating ?? 0,
          content: r.content,
          date: r.date,
          sentiment: r.sentiment,
          cluster: r.cluster,
          risk: r.risk,
          opportunity: r.opportunity,
          verified: false,
        }))
    : [
    {
      id: 1,
      platform: "Amazon",
      reviewer: "Jennifer K.",
      rating: 2,
      content: "Product is good but packaging was terrible. Box arrived completely destroyed. Lucky the item wasn't damaged.",
      date: "2026-01-12",
      sentiment: -0.65,
      cluster: "Packaging Issues",
      risk: "High",
      opportunity: "Low",
      verified: true
    },
    {
      id: 2,
      platform: "Trustpilot",
      reviewer: "David M.",
      rating: 1,
      content: "Customer service is non-existent. Been trying to get help for a week with no response. Very frustrating experience.",
      date: "2026-01-11",
      sentiment: -0.88,
      cluster: "Customer Service",
      risk: "Critical",
      opportunity: "Medium",
      verified: true
    },
    {
      id: 3,
      platform: "Google Reviews",
      reviewer: "Emma S.",
      rating: 5,
      content: "Best purchase I've made this year! Quality is outstanding and shipping was fast. Customer service was helpful too.",
      date: "2026-01-10",
      sentiment: 0.95,
      cluster: "Product Quality",
      risk: "Low",
      opportunity: "High",
      verified: true
    },
    {
      id: 4,
      platform: "Amazon",
      reviewer: "Robert P.",
      rating: 4,
      content: "Great product overall. Would give 5 stars if they added dark mode to the mobile app. That's the only thing missing.",
      date: "2026-01-09",
      sentiment: 0.75,
      cluster: "Feature Requests",
      risk: "Low",
      opportunity: "High",
      verified: true
    },
    {
      id: 5,
      platform: "Yelp",
      reviewer: "Patricia L.",
      rating: 3,
      content: "Product is fine but had to wait forever to speak with support when I had a question. They need more staff.",
      date: "2026-01-08",
      sentiment: -0.42,
      cluster: "Customer Service",
      risk: "High",
      opportunity: "Medium",
      verified: false
    },
    {
      id: 6,
      platform: "Trustpilot",
      reviewer: "Michael R.",
      rating: 5,
      content: "Absolutely love this! The quality exceeded my expectations. Will definitely be ordering again soon.",
      date: "2026-01-07",
      sentiment: 0.89,
      cluster: "Product Quality",
      risk: "Low",
      opportunity: "High",
      verified: true
    },
  ];

  const newsData: NewsContent[] = useRaw
    ? (isBukalapak ? [] : effectiveRaw.filter((r) => r.source === "News_Articles").map((r, i) => ({
          id: i + 1,
          source: r.platform || "—",
          title: r.content.slice(0, 80) + (r.content.length > 80 ? "…" : ""),
          excerpt: r.content.slice(0, 200) + (r.content.length > 200 ? "…" : ""),
          date: r.date,
          sentiment: r.sentiment,
          cluster: r.cluster,
          risk: r.risk,
          opportunity: r.opportunity,
          reach: r.engagement,
        })))
    : [
    {
      id: 1,
      source: "TechCrunch",
      title: "YourBrand Faces Customer Service Backlash Amid Rapid Growth",
      excerpt: "As YourBrand continues to scale, customers report increasing wait times and difficulty reaching support teams. Industry experts suggest this is a common growing pain...",
      date: "2026-01-12",
      sentiment: -0.54,
      cluster: "Customer Service",
      risk: "High",
      opportunity: "Medium",
      reach: 125000
    },
    {
      id: 2,
      source: "Forbes",
      title: "YourBrand's Product Quality Wins Industry Awards",
      excerpt: "YourBrand has been recognized for excellence in product design and quality, receiving multiple awards at this year's Consumer Excellence Summit...",
      date: "2026-01-10",
      sentiment: 0.88,
      cluster: "Product Quality",
      risk: "Low",
      opportunity: "High",
      reach: 340000
    },
    {
      id: 3,
      source: "The Verge",
      title: "Users Demand Dark Mode Feature from YourBrand App",
      excerpt: "A growing chorus of users are requesting dark mode functionality in YourBrand's mobile application. The feature has become standard in modern apps...",
      date: "2026-01-09",
      sentiment: 0.32,
      cluster: "Feature Requests",
      risk: "Low",
      opportunity: "High",
      reach: 89000
    },
    {
      id: 4,
      source: "Business Insider",
      title: "Packaging Complaints Rise for E-commerce Giant YourBrand",
      excerpt: "Recent data shows a 23% increase in packaging-related complaints for YourBrand. Analysts suggest the company may need to revisit its logistics strategy...",
      date: "2026-01-08",
      sentiment: -0.61,
      cluster: "Packaging Issues",
      risk: "High",
      opportunity: "Low",
      reach: 210000
    },
    {
      id: 5,
      source: "CNBC",
      title: "YourBrand Stock Rises on Strong Product Reviews",
      excerpt: "Investor confidence grows as YourBrand maintains high customer satisfaction scores across major review platforms, with average ratings above 4.5 stars...",
      date: "2026-01-07",
      sentiment: 0.76,
      cluster: "Product Quality",
      risk: "Low",
      opportunity: "High",
      reach: 450000
    },
  ];

  const handleSort = (field: string, type: "social" | "reviews" | "news") => {
    if (type === "social") {
      const newOrder = socialSort.field === field && socialSort.order === "asc" ? "desc" : "asc";
      setSocialSort({ field, order: newOrder });
      setSocialPage(1);
    } else if (type === "reviews") {
      const newOrder = reviewSort.field === field && reviewSort.order === "asc" ? "desc" : "asc";
      setReviewSort({ field, order: newOrder });
    } else {
      const newOrder = newsSort.field === field && newsSort.order === "asc" ? "desc" : "asc";
      setNewsSort({ field, order: newOrder });
    }
  };

  const sortData = <T extends any>(data: T[], sortConfig: { field: string; order: SortOrder }): T[] => {
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.field as keyof T];
      const bVal = b[sortConfig.field as keyof T];
      
      if (aVal < bVal) return sortConfig.order === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedSocial = useMemo(() => sortData(socialMediaData, socialSort), [socialMediaData, socialSort]);
  const totalSocial = sortedSocial.length;
  const totalPagesSocial = Math.max(1, Math.ceil(totalSocial / SOCIAL_PAGE_SIZE));
  const effectiveSocialPage = Math.min(Math.max(1, socialPage), totalPagesSocial);
  const paginatedSocial = useMemo(
    () => sortedSocial.slice((effectiveSocialPage - 1) * SOCIAL_PAGE_SIZE, effectiveSocialPage * SOCIAL_PAGE_SIZE),
    [sortedSocial, effectiveSocialPage]
  );

  if (contentMode === "manage") {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setContentMode("raw")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            <MessageSquare className="w-4 h-4" />
            Tampilkan raw content
          </button>
        </div>
        <SourceContentManager instanceId={instanceId} />
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes("twitter")) return <Twitter className="w-4 h-4 text-sky-500" />;
    if (lower.includes("instagram")) return <Instagram className="w-4 h-4 text-pink-500" />;
    if (lower.includes("facebook")) return <Facebook className="w-4 h-4 text-blue-600" />;
    return <MessageSquare className="w-4 h-4 text-slate-500" />;
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      Critical: "bg-red-100 text-red-700 border-red-300",
      High: "bg-orange-100 text-orange-700 border-orange-300",
      Medium: "bg-amber-100 text-amber-700 border-amber-300",
      Low: "bg-emerald-100 text-emerald-700 border-emerald-300"
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${colors[risk as keyof typeof colors] || colors.Low}`}>
        {risk}
      </span>
    );
  };

  const getOpportunityBadge = (opportunity: string) => {
    const colors = {
      High: "bg-violet-100 text-violet-700 border-violet-300",
      Medium: "bg-cyan-100 text-cyan-700 border-cyan-300",
      Low: "bg-slate-100 text-slate-600 border-slate-300"
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${colors[opportunity as keyof typeof colors] || colors.Low}`}>
        {opportunity}
      </span>
    );
  };

  const getSentimentBadge = (sentiment: number) => {
    const color = sentiment >= 0.5 ? "bg-emerald-100 text-emerald-700" : 
                  sentiment >= 0 ? "bg-cyan-100 text-cyan-700" : 
                  sentiment >= -0.5 ? "bg-orange-100 text-orange-700" : 
                  "bg-red-100 text-red-700";
    const icon = sentiment > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${color}`}>
        {icon}
        {sentiment.toFixed(2)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900">Source Contents</h2>
            <p className="text-sm text-slate-600">Raw analyzed content from all sources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentMode("manage")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-violet-600 hover:bg-violet-50 border border-violet-200"
          >
            <Settings2 className="w-4 h-4" />
            Kelola data dashboard
          </button>
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">AI-Analyzed Data</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "social"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Social Media ({socialMediaData.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "reviews"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Reviews ({reviewData.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "news"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News & Articles ({newsData.length})
          </div>
        </button>
      </div>

      {/* Social Media Table */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("platform", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Platform <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("author", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Author <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[300px]">
                    <span className="text-xs font-semibold text-slate-700">Content</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("date", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("sentiment", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Sentiment <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("cluster", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Cluster <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("risk", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Risk <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("opportunity", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Opportunity <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("engagement", "social")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Engagement <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSocial.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(item.platform)}
                        <span className="text-sm text-slate-700">{item.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 font-medium">{item.author}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getSentimentBadge(item.sentiment)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{item.cluster}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(item.risk)}
                    </td>
                    <td className="px-4 py-3">
                      {getOpportunityBadge(item.opportunity)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{item.engagement.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalSocial > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Menampilkan {(effectiveSocialPage - 1) * SOCIAL_PAGE_SIZE + 1}–{Math.min(effectiveSocialPage * SOCIAL_PAGE_SIZE, totalSocial)} dari {totalSocial}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSocialPage((p) => Math.max(1, p - 1))}
                  disabled={effectiveSocialPage <= 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-slate-600">
                  Halaman {effectiveSocialPage} dari {totalPagesSocial}
                </span>
                <button
                  type="button"
                  onClick={() => setSocialPage((p) => Math.min(totalPagesSocial, p + 1))}
                  disabled={effectiveSocialPage >= totalPagesSocial}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Table */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("platform", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Platform <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("reviewer", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Reviewer <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("rating", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Rating <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[300px]">
                    <span className="text-xs font-semibold text-slate-700">Review Content</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("date", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("sentiment", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Sentiment <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("cluster", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Cluster <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("risk", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Risk <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("opportunity", "reviews")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Opportunity <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortData(reviewData, reviewSort).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-slate-700">{item.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 font-medium">{item.reviewer}</span>
                        {item.verified && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        ))}
                        <span className="text-xs text-slate-600 ml-1">{item.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getSentimentBadge(item.sentiment)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{item.cluster}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(item.risk)}
                    </td>
                    <td className="px-4 py-3">
                      {getOpportunityBadge(item.opportunity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* News & Articles Table */}
      {activeTab === "news" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("source", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Source <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[250px]">
                    <span className="text-xs font-semibold text-slate-700">Title</span>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[300px]">
                    <span className="text-xs font-semibold text-slate-700">Excerpt</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("date", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("sentiment", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Sentiment <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("cluster", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Cluster <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("risk", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Risk <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("opportunity", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Opportunity <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("reach", "news")}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-600"
                    >
                      Reach <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortData(newsData, newsSort).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 font-medium">{item.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900 font-medium line-clamp-2">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600 line-clamp-2">{item.excerpt}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getSentimentBadge(item.sentiment)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{item.cluster}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(item.risk)}
                    </td>
                    <td className="px-4 py-3">
                      {getOpportunityBadge(item.opportunity)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{(item.reach / 1000).toFixed(0)}K</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
