import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

const defaultClusters = [
    {
      id: 1,
      theme: "Packaging Damage Issues",
      size: 2847,
      sentiment: -0.68,
      trend: "up",
      keywords: ["broken", "damaged", "poor packaging", "arrived broken"],
    },
    {
      id: 2,
      theme: "Excellent Product Quality",
      size: 1923,
      sentiment: 0.71,
      trend: "stable",
      keywords: ["high quality", "durable", "worth it", "exceeded expectations"],
    },
    {
      id: 3,
      theme: "Customer Support Delays",
      size: 2341,
      sentiment: -0.54,
      trend: "up",
      keywords: ["slow response", "waiting", "no reply", "poor support"],
    },
    {
      id: 4,
      theme: "Fast Shipping Praise",
      size: 1654,
      sentiment: 0.32,
      trend: "down",
      keywords: ["quick delivery", "fast shipping", "arrived early", "prompt"],
    },
  ];

const ITEMS_PER_PAGE = 5;

export function ConversationClusters() {
  const content = useDashboardContent();
  const [currentPage, setCurrentPage] = useState(1);
  const clusters = (content?.whatsHappeningClusters?.length ? content.whatsHappeningClusters : defaultClusters) as Array<{ id: string | number; theme: string; size: number; sentiment: number; trend: "up" | "down" | "stable"; keywords: string[] }>;

  const totalPages = Math.ceil(clusters.length / ITEMS_PER_PAGE);
  const paginatedClusters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return clusters.slice(start, end);
  }, [clusters, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {paginatedClusters.map((cluster) => {
          const TrendIcon = cluster.trend === "up" ? TrendingUp : cluster.trend === "down" ? TrendingDown : Minus;
          const trendColor = cluster.trend === "up" ? "text-amber-600" : cluster.trend === "down" ? "text-cyan-600" : "text-slate-600";
          
          return (
            <div
              key={cluster.id}
              className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900">{cluster.theme}</h4>
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600">
                      {cluster.size.toLocaleString()} mentions
                    </span>
                    <span className={cluster.sentiment < 0 ? "text-red-600" : "text-emerald-600"}>
                      {cluster.sentiment > 0 ? '+' : ''}{cluster.sentiment.toFixed(2)} sentiment
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cluster.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2.5 py-1 bg-violet-100 border border-violet-200 rounded-md text-xs text-violet-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, clusters.length)} of {clusters.length} clusters
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-300"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-300"
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}