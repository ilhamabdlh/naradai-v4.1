import { useState, useMemo } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { Target, AlertTriangle, Eye, Archive, TrendingUp, CheckCircle, Clock, Circle, Sparkles } from "lucide-react";
import { ActionDetailsModal } from "./ActionDetailsModal";
import { RiskDetailsModal } from "./RiskDetailsModal";
import { OpportunityDetailsModal } from "./OpportunityDetailsModal";
import type { PriorityActionItem, RiskItem, OpportunityItem } from "@/lib/dashboard-content-types";

const priorityIconMap = { critical: AlertTriangle, high: Target, medium: Target } as const;

export function Insights() {
  const content = useDashboardContent();
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});
  const [archivedActions, setArchivedActions] = useState<Set<string>>(new Set());
  const [archivedRisks, setArchivedRisks] = useState<Set<string>>(new Set());
  const [archivedOpportunities, setArchivedOpportunities] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<PriorityActionItem | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);

  const actions = useMemo(() => {
    const list = content?.priorityActions ?? [];
    return list
      .filter((a) => !archivedActions.has(a.id))
      .map((item) => ({
        ...item,
        icon: priorityIconMap[item.priority] ?? Target,
        metrics: item.metrics ?? { mentions: 0, sentiment: 0, trend: "stable" as const },
      }));
  }, [content?.priorityActions, archivedActions]);

  const risks = useMemo(() => {
    const list = content?.risks ?? [];
    return list.filter((r) => !archivedRisks.has(r.id));
  }, [content?.risks, archivedRisks]);

  const opportunities = useMemo(() => {
    const list = content?.opportunities ?? [];
    return list.filter((o) => !archivedOpportunities.has(o.id));
  }, [content?.opportunities, archivedOpportunities]);

  const [activeTab, setActiveTab] = useState<"priority-actions" | "risks" | "opportunities">("priority-actions");

  const getStatusBadge = (actionId: string) => {
    const s = actionStatuses[actionId] || "not-started";
    const config = {
      "not-started": { label: "Not Started", icon: Circle, color: "bg-slate-100 text-slate-600 border-slate-300" },
      "in-progress": { label: "In Progress", icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-300" },
      "completed": { label: "Completed", icon: CheckCircle, color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    };
    const c = config[s as keyof typeof config];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const getImpactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      Critical: "bg-slate-900 text-white border-slate-700",
      High: "bg-red-100 text-red-700 border-red-300",
      Medium: "bg-orange-100 text-orange-700 border-orange-300",
      Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${colors[impact] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
        {impact}
      </span>
    );
  };

  const getEffortBadge = (effort: string) => {
    const colors: Record<string, string> = {
      High: "bg-red-100 text-red-700 border-red-300",
      Medium: "bg-amber-100 text-amber-700 border-amber-300",
      Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${colors[effort] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
        {effort}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700 border-red-300",
      high: "bg-orange-100 text-orange-700 border-orange-300",
      medium: "bg-amber-100 text-amber-700 border-amber-300",
      low: "bg-slate-100 text-slate-700 border-slate-300",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border capitalize ${colors[severity.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
        {severity}
      </span>
    );
  };

  const getPotentialBadge = (potential: string) => {
    const colors: Record<string, string> = {
      high: "bg-emerald-100 text-emerald-700 border-emerald-300",
      medium: "bg-cyan-100 text-cyan-700 border-cyan-300",
      low: "bg-slate-100 text-slate-700 border-slate-300",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border capitalize ${colors[potential.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
        {potential}
      </span>
    );
  };

  const getSentimentBadge = (sentiment: number | string) => {
    const isString = typeof sentiment === "string";
    const isPositive = isString ? !/negative/i.test(sentiment) : sentiment > 0;
    const display = isString ? sentiment : (sentiment > 0 ? "+" : "") + (sentiment as number).toFixed(2);
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
        {display}
      </span>
    );
  };

  const handleArchiveAction = (id: string) => setArchivedActions((prev) => new Set(prev).add(id));
  const handleArchiveRisk = (id: string) => setArchivedRisks((prev) => new Set(prev).add(id));
  const handleArchiveOpportunity = (id: string) => setArchivedOpportunities((prev) => new Set(prev).add(id));

  return (
    <div className="space-y-6">
      {/* Header - same style as Source Contents */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900">Insights</h2>
            <p className="text-sm text-slate-600">Dashboard insights and recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">AI Insights</span>
          </div>
        </div>
      </div>

      {/* Tabs - underline style like Source Contents */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("priority-actions")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "priority-actions"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Priority Actions ({actions.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("risks")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "risks"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Risks ({risks.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "opportunities"
              ? "border-violet-500 text-violet-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Opportunities ({opportunities.length})
          </div>
        </button>
      </div>

      {/* Priority Actions Table */}
      {activeTab === "priority-actions" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold text-slate-700">Title</span>
                  </th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Description</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Impact</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Effort</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Status</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Mentions</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Sentiment</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">AI Recommendation</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Created At</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Expired At</span></th>
                  <th className="px-4 py-3 text-right"><span className="text-xs font-semibold text-slate-700">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((action) => (
                  <tr key={action.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{action.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={action.description}>{action.description}</td>
                    <td className="px-4 py-3">{getImpactBadge(action.impact)}</td>
                    <td className="px-4 py-3">{getEffortBadge(action.effort)}</td>
                    <td className="px-4 py-3">{getStatusBadge(action.id)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{action.metrics.mentions.toLocaleString()}</td>
                    <td className="px-4 py-3">{getSentimentBadge(action.metrics.sentiment)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[180px] truncate" title={action.recommendation}>{action.recommendation}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{action.createdAt ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{action.expiredAt ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedAction(action)} className="p-2 rounded-lg hover:bg-violet-100 text-slate-600 hover:text-violet-600" title="View details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleArchiveAction(action.id)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title="Archive"><Archive className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {actions.length === 0 && (
            <div className="py-12 text-center text-slate-500">No priority actions</div>
          )}
        </div>
      )}

      {/* Risks Table */}
      {activeTab === "risks" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Title</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Risk Level</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Description</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Related Topics</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Impact Assessment</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Mitigation Strategy</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Mentions</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Created At</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Expired At</span></th>
                  <th className="px-4 py-3 text-right"><span className="text-xs font-semibold text-slate-700">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-medium text-slate-900">{risk.title}</span></td>
                    <td className="px-4 py-3">{getSeverityBadge(risk.severity)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={risk.description}>{risk.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{(risk.indicators ?? []).map((i) => i.label).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate" title={risk.impact}>{risk.impact}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate" title={(risk.mitigation ?? []).join(" ")}>{(risk.mitigation ?? []).slice(0, 1).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{risk.supportingContents}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{risk.createdAt ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{risk.expiredAt ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedRisk(risk)} className="p-2 rounded-lg hover:bg-violet-100 text-slate-600 hover:text-violet-600" title="View details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleArchiveRisk(risk.id)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title="Archive"><Archive className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {risks.length === 0 && (
            <div className="py-12 text-center text-slate-500">No risks</div>
          )}
        </div>
      )}

      {/* Opportunities Table */}
      {activeTab === "opportunities" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Title</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Opportunity Level</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Description</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Timeframe</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Category</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Recommended Actions</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Mentions</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Created At</span></th>
                  <th className="px-4 py-3 text-left"><span className="text-xs font-semibold text-slate-700">Expired At</span></th>
                  <th className="px-4 py-3 text-right"><span className="text-xs font-semibold text-slate-700">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-medium text-slate-900">{opp.title}</span></td>
                    <td className="px-4 py-3">{getPotentialBadge(opp.potential)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={opp.description}>{opp.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{opp.timeframe}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{opp.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate" title={(opp.recommendations ?? []).join(" ")}>{(opp.recommendations ?? []).slice(0, 1).join(" ") || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{opp.supportingContents}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{opp.createdAt ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{opp.expiredAt ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedOpportunity(opp)} className="p-2 rounded-lg hover:bg-violet-100 text-slate-600 hover:text-violet-600" title="View details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleArchiveOpportunity(opp.id)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title="Archive"><Archive className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {opportunities.length === 0 && (
            <div className="py-12 text-center text-slate-500">No opportunities</div>
          )}
        </div>
      )}

      {selectedAction && (
        <ActionDetailsModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onStatusChange={(actionId, status) => setActionStatuses((prev) => ({ ...prev, [actionId]: status }))}
          currentStatus={actionStatuses[selectedAction.id] || "not-started"}
        />
      )}
      {selectedRisk && (
        <RiskDetailsModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
      )}
      {selectedOpportunity && (
        <OpportunityDetailsModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />
      )}
    </div>
  );
}
