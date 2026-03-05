import { useState, useMemo } from "react";
import { List, Search, ChevronUp, ChevronDown, Star, MessageSquare } from "lucide-react";
import { OUTLETS, type OutletData } from "./OutletMap";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

type SortKey = "name" | "satisfaction" | "reviews" | "status";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "critical" | "warning" | "good";

const statusLabels: Record<string, { label: string; style: string }> = {
  critical: { label: "Critical", style: "bg-red-100 text-red-700" },
  warning:  { label: "Warning",  style: "bg-amber-100 text-amber-700" },
  good:     { label: "Good",     style: "bg-emerald-100 text-emerald-700" },
};

const statusOrder = { critical: 0, warning: 1, good: 2 };

function SatisfactionBar({ value }: { value: number }) {
  const pct = (value / 5) * 100;
  const color = value < 3 ? "bg-red-400" : value < 4 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{value.toFixed(1)}</span>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? "text-violet-600" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
      <span className="flex flex-col gap-px">
        <ChevronUp className={`w-3 h-3 ${active && dir === "asc" ? "text-violet-600" : "text-slate-300"}`} />
        <ChevronDown className={`w-3 h-3 ${active && dir === "desc" ? "text-violet-600" : "text-slate-300"}`} />
      </span>
    </button>
  );
}

export function OutletList() {
  const content = useDashboardContent();
  const outletMapData = content?.outletMapData ?? defaultDashboardContent.outletMapData ?? [];
  const allOutlets: OutletData[] = outletMapData.length > 0
    ? outletMapData.map((o) => ({
        id: o.id,
        name: o.name,
        region: o.region,
        city: o.city,
        lat: o.lat,
        lng: o.lng,
        status: o.status,
        satisfaction: o.satisfaction,
        reviews: o.reviews,
        issues: o.issues,
      }))
    : OUTLETS;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...allOutlets];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o) => o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) || o.region.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name")              cmp = a.name.localeCompare(b.name);
      else if (sortKey === "satisfaction") cmp = a.satisfaction - b.satisfaction;
      else if (sortKey === "reviews")      cmp = a.reviews - b.reviews;
      else if (sortKey === "status")       cmp = statusOrder[a.status] - statusOrder[b.status];
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [query, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div id="outlet-list" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <List className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">All Outlets</h2>
          <p className="text-sm text-slate-500">Search, sort and filter across {allOutlets.length} outlet locations</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search outlet, city, region…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {(["all", "critical", "warning", "good"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3.5">
                <SortHeader label="Outlet" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
              <th className="text-left px-4 py-3.5">
                <SortHeader label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5">
                <SortHeader label="Satisfaction" sortKey="satisfaction" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="text-right px-4 py-3.5">
                <SortHeader label="Reviews" sortKey="reviews" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                  No outlets match your filters.
                </td>
              </tr>
            ) : (
              pageData.map((outlet) => {
                const sc = statusLabels[outlet.status];
                return (
                  <tr key={outlet.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{outlet.name}</div>
                      <div className="text-xs text-slate-400">{outlet.city}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm">{outlet.region}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.style}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <SatisfactionBar value={outlet.satisfaction} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-600">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{outlet.reviews.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {outlet.issues.length === 0 ? (
                          <span className="text-xs text-emerald-600 font-medium">No issues</span>
                        ) : (
                          outlet.issues.slice(0, 2).map((issue) => (
                            <span key={issue} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {issue}
                            </span>
                          ))
                        )}
                        {outlet.issues.length > 2 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                            +{outlet.issues.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} outlets
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                    p === page ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
