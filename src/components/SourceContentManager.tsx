import { useState, useEffect, useRef } from "react";
import {
  Database,
  BarChart3,
  Target,
  MapPin,
  ShieldAlert,
  Lightbulb,
  Swords,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  ChevronDown,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Hash,
  FileText,
  UserCheck,
  Contact,
  LineChart,
  Users,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  loadDashboardContent,
  saveDashboardContent,
  defaultDashboardContent,
  generateId,
} from "@/lib/dashboard-content-store";
import type {
  DashboardContentStore,
  StatItem,
  PriorityActionItem,
  OutletItem,
  RiskItem,
  OpportunityItem,
  CompetitiveIssueItem,
  SourceContentPost,
  KeyInsightItem,
  SentimentTrendItem,
  TopTopicItem,
  WordCloudItem,
  KeyEventItem,
  AITopicAnalysisItem,
  TopicTrendsOverTimeRow,
  AITrendAnalysisItem,
  ConversationClusterItem,
  TopHashtagItem,
  TopAccountItem,
  TopContentItem,
  KOLMatrixItem,
  AIKOLAnalysisItem,
  ShareOfPlatformRow,
  CompetitiveMatrixItem,
  QuadrantAnalysisItem,
  CompetitiveHeatmapRow,
  ShareOfVoiceRow,
  CompetitiveBrandLabels,
  FeatureVisibilityKey,
  FeatureVisibility,
} from "@/lib/dashboard-content-types";
import { defaultFeatureVisibility } from "@/lib/dashboard-content-types";

type SectionId =
  | "stats"
  | "actions"
  | "outlets"
  | "risks"
  | "opportunities"
  | "competitive"
  | "whats-happening";

const SECTIONS: { id: SectionId; label: string; icon: typeof BarChart3 }[] = [
  { id: "stats", label: "Stats Overview", icon: BarChart3 },
  { id: "actions", label: "Priority Actions", icon: Target },
  { id: "outlets", label: "Outlet Satisfaction", icon: MapPin },
  { id: "risks", label: "Risks", icon: ShieldAlert },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb },
  { id: "competitive", label: "Competitive Analysis", icon: Swords },
  { id: "whats-happening", label: "What's Happening", icon: TrendingUp },
];

const VISIBILITY_FEATURES: { id: FeatureVisibilityKey; label: string; description: string; icon: typeof BarChart3 }[] = [
  { id: "statsOverview", label: "Stats Overview", description: "Summary metrics: conversations, sentiment, critical issues, share of voice", icon: BarChart3 },
  { id: "actionRecommendations", label: "Priority Actions", description: "Rekomendasi aksi prioritas berdasarkan isu kritis", icon: Target },
  { id: "outletSatisfaction", label: "Outlet Satisfaction", description: "Peta kepuasan outlet dan lokasi", icon: MapPin },
  { id: "risksOpportunities", label: "Risks & Opportunities", description: "Kartu risiko dan peluang bisnis", icon: Lightbulb },
  { id: "competitiveAnalysis", label: "Competitive Analysis", description: "Analisis kompetitif, matrix, sentiment scores, share of voice", icon: Swords },
  { id: "recentInsights", label: "What's Happening", description: "Sentiment trends, top topics, word cloud, KOL matrix, dan lainnya", icon: TrendingUp },
];

interface SourceContentManagerProps {
  instanceId: string;
}

type ManageView = "data" | "visibility";

export function SourceContentManager({ instanceId }: SourceContentManagerProps) {
  const [store, setStore] = useState<DashboardContentStore>(defaultDashboardContent);
  const [manageView, setManageView] = useState<ManageView>("data");
  const [activeSection, setActiveSection] = useState<SectionId>("stats");
  const [competitiveSubTab, setCompetitiveSubTab] = useState<"issues" | "insights" | "matrix" | "sentiment" | "volume" | "sov">("issues");
  const [whatsHappeningSubTab, setWhatsHappeningSubTab] = useState<string>("sentiment");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastSavedInstanceIdRef = useRef<string>(instanceId);
  const visibility = (store.featureVisibility ?? defaultFeatureVisibility) as FeatureVisibility;

  useEffect(() => {
    setStore(loadDashboardContent(instanceId));
    setLoaded(true);
  }, [instanceId]);

  useEffect(() => {
    if (!loaded || lastSavedInstanceIdRef.current !== instanceId) return;
    saveDashboardContent(store, instanceId);
    lastSavedInstanceIdRef.current = instanceId;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [store, loaded, instanceId]);

  const updateStore = (updater: (prev: DashboardContentStore) => DashboardContentStore) => {
    setStore(updater);
  };

  const setVisibility = (updater: (prev: FeatureVisibility) => FeatureVisibility) => {
    updateStore((p) => ({ ...p, featureVisibility: updater(p.featureVisibility ?? defaultFeatureVisibility) }));
  };

  const resetToDefault = () => {
    setStore(defaultDashboardContent);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Content Management</h2>
            <p className="text-sm text-slate-600">Kelola data sumber untuk semua fitur dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            {saved ? (
              <>
                <Save className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Tersimpan</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-slate-600">Auto-save ke browser</span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={resetToDefault} className="rounded-xl">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset default
          </Button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6">
        <button
          type="button"
          onClick={() => setManageView("data")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
            manageView === "data"
              ? "bg-white text-violet-700 shadow-md border border-violet-200/50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database className="w-4 h-4" />
          Kelola Data
        </button>
        <button
          type="button"
          onClick={() => setManageView("visibility")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
            manageView === "visibility"
              ? "bg-white text-violet-700 shadow-md border border-violet-200/50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Eye className="w-4 h-4" />
          Display Settings
        </button>
      </div>

      {manageView === "visibility" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center border border-violet-200/50">
              <Settings2 className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tampilkan / Sembunyikan Fitur</h3>
              <p className="text-sm text-slate-600">Pilih fitur mana yang ingin ditampilkan di dashboard</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VISIBILITY_FEATURES.map(({ id, label, description, icon: Icon }) => {
              const isOn = visibility[id] ?? true;
              return (
                <Card
                  key={id}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isOn
                      ? "border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30 shadow-sm hover:shadow-md"
                      : "border-slate-200 bg-slate-50/50 opacity-90"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isOn ? "bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-200/50" : "bg-slate-200"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isOn ? "text-white" : "text-slate-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h4 className={`font-semibold ${isOn ? "text-slate-900" : "text-slate-500"}`}>{label}</h4>
                          <Switch
                            checked={isOn}
                            onCheckedChange={(checked) => setVisibility((v) => ({ ...v, [id]: checked }))}
                            className="data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-slate-300"
                          />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          {isOn ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Ditampilkan di dashboard</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-500">Disembunyikan</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center pt-2">Perubahan disimpan otomatis. Dashboard akan menampilkan hanya fitur yang diaktifkan.</p>
        </div>
      )}

      {manageView === "data" && (
        <>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === id
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 ${activeSection === id ? "rotate-180" : ""}`} />
          </button>
        ))}
      </div>

      {activeSection === "stats" && (
        <StatsSection
          items={store.statsOverview}
          onUpdate={(items) => updateStore((p) => ({ ...p, statsOverview: items }))}
        />
      )}
      {activeSection === "actions" && (
        <ActionsSection
          items={store.priorityActions}
          onUpdate={(items) => updateStore((p) => ({ ...p, priorityActions: items }))}
        />
      )}
      {activeSection === "outlets" && (
        <OutletsSection
          items={store.outletSatisfaction}
          onUpdate={(items) => updateStore((p) => ({ ...p, outletSatisfaction: items }))}
        />
      )}
      {activeSection === "risks" && (
        <RisksSection
          items={store.risks}
          onUpdate={(items) => updateStore((p) => ({ ...p, risks: items }))}
        />
      )}
      {activeSection === "opportunities" && (
        <OpportunitiesSection
          items={store.opportunities}
          onUpdate={(items) => updateStore((p) => ({ ...p, opportunities: items }))}
        />
      )}
      {activeSection === "competitive" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button onClick={() => setCompetitiveSubTab("issues")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "issues" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Competitive Issues</button>
            <button onClick={() => setCompetitiveSubTab("insights")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "insights" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Key Insights</button>
            <button onClick={() => setCompetitiveSubTab("matrix")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "matrix" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Competitive Matrix</button>
            <button onClick={() => setCompetitiveSubTab("sentiment")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "sentiment" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Sentiment Scores</button>
            <button onClick={() => setCompetitiveSubTab("volume")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "volume" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Volume of Mentions</button>
            <button onClick={() => setCompetitiveSubTab("sov")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "sov" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Share of Voice</button>
          </div>
          {competitiveSubTab === "issues" && (
            <CompetitiveSection items={store.competitiveIssues} onUpdate={(items) => updateStore((p) => ({ ...p, competitiveIssues: items }))} />
          )}
          {competitiveSubTab === "insights" && (
            <KeyInsightsSection items={store.competitiveKeyInsights ?? []} onUpdate={(items) => updateStore((p) => ({ ...p, competitiveKeyInsights: items }))} />
          )}
          {competitiveSubTab === "matrix" && (
            <CompetitiveMatrixEditor
              matrixItems={store.competitiveMatrixItems ?? []}
              onUpdateMatrix={(v) => updateStore((p) => ({ ...p, competitiveMatrixItems: v }))}
              quadrantItems={store.competitiveQuadrantAnalysis ?? []}
              onUpdateQuadrant={(v) => updateStore((p) => ({ ...p, competitiveQuadrantAnalysis: v }))}
            />
          )}
          {competitiveSubTab === "sentiment" && (
            <CompetitiveHeatmapEditor title="Sentiment Scores" items={store.competitiveSentimentScores ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveSentimentScores: v }))} valueLabel="Score (0-1)" brandLabels={store.competitiveBrandLabels} competitiveMatrixItems={store.competitiveMatrixItems ?? []} />
          )}
          {competitiveSubTab === "volume" && (
            <CompetitiveHeatmapEditor title="Volume of Mentions" items={store.competitiveVolumeOfMentions ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveVolumeOfMentions: v }))} valueLabel="Volume" brandLabels={store.competitiveBrandLabels} competitiveMatrixItems={store.competitiveMatrixItems ?? []} />
          )}
          {competitiveSubTab === "sov" && (
            <ShareOfVoiceEditor items={store.competitiveShareOfVoice ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveShareOfVoice: v }))} brandLabels={store.competitiveBrandLabels} />
          )}
        </div>
      )}
      {activeSection === "whats-happening" && (
        <WhatsHappeningSection
          store={store}
          updateStore={updateStore}
          activeSubTab={whatsHappeningSubTab}
          onSubTabChange={setWhatsHappeningSubTab}
        />
      )}
        </>
      )}
    </div>
  );
}

function StatsSection({
  items,
  onUpdate,
}: {
  items: StatItem[];
  onUpdate: (items: StatItem[]) => void;
}) {
  const [editing, setEditing] = useState<StatItem | null>(null);
  const [adding, setAdding] = useState(false);

  const openEdit = (item: StatItem) => setEditing({ ...item });
  const openAdd = () => setAdding(true);
  const close = () => {
    setEditing(null);
    setAdding(false);
  };

  const saveEdit = () => {
    if (editing) {
      onUpdate(items.map((i) => (i.id === editing.id ? editing : i)));
      close();
    }
  };

  const saveAdd = (item: Omit<StatItem, "id">) => {
    onUpdate([...items, { ...item, id: generateId() }]);
    setAdding(false);
  };

  const remove = (id: string) => {
    onUpdate(items.filter((i) => i.id !== id));
    close();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add stat
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600" onClick={() => remove(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-slate-900 mb-1">{item.value}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <StatFormDialog
        open={!!editing || adding}
        title={editing ? "Edit stat" : "Add stat"}
        initial={editing ?? undefined}
        onClose={close}
        onSave={(item) => {
          if (editing) {
            onUpdate(items.map((i) => (i.id === item.id ? item : i)));
          } else {
            onUpdate([...items, item]);
          }
          close();
        }}
        isAdd={adding}
      />
    </div>
  );
}

function StatFormDialog({
  open,
  title,
  initial,
  onClose,
  onSave,
  isAdd,
}: {
  open: boolean;
  title: string;
  initial?: StatItem;
  onClose: () => void;
  onSave: (item: StatItem) => void;
  isAdd: boolean;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [value, setValue] = useState(initial?.value ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "BarChart3");

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "");
      setValue(initial?.value ?? "");
      setDescription(initial?.description ?? "");
      setIcon(initial?.icon ?? "BarChart3");
    }
  }, [open, initial?.id, initial?.label, initial?.value, initial?.description, initial?.icon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: StatItem = {
      id: initial?.id ?? generateId(),
      label,
      value,
      description,
      icon,
    };
    onSave(item);
    if (isAdd) {
      setLabel("");
      setValue("");
      setDescription("");
      setIcon("BarChart3");
    }
    onClose();
  };

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form id="stat-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Conversations Analyzed" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Value</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="847.2K" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat..." className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Icon (nama)</label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="BarChart3" className="rounded-xl" />
          </div>
        </form>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button type="submit" form="stat-form" className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
            {isAdd ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionsSection({
  items,
  onUpdate,
}: {
  items: PriorityActionItem[];
  onUpdate: (items: PriorityActionItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah action
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(item.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.priority}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.impact} impact</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.effort} effort</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <ActionEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <ActionEditDialog
          item={{
            id: generateId(),
            priority: "medium",
            title: "",
            description: "",
            impact: "Medium",
            effort: "Medium",
            recommendation: "",
            category: "Opportunity",
            quadrantColor: "cyan",
            relatedIssues: [],
            metrics: { mentions: 0, sentiment: 0, trend: "stable" },
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function ActionEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: PriorityActionItem;
  onClose: () => void;
  onSave: (item: PriorityActionItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah priority action" : "Edit action"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Judul action" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as PriorityActionItem["priority"] }))}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Impact</label>
              <Input value={form.impact} onChange={(e) => setForm((p) => ({ ...p, impact: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Effort</label>
              <Input value={form.effort} onChange={(e) => setForm((p) => ({ ...p, effort: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Category</label>
              <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Rekomendasi</label>
            <Input value={form.recommendation} onChange={(e) => setForm((p) => ({ ...p, recommendation: e.target.value }))} placeholder="Rekomendasi AI" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Related issues (pisah koma)</label>
            <Input
              value={form.relatedIssues.join(", ")}
              onChange={(e) => setForm((p) => ({ ...p, relatedIssues: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              placeholder="Packaging, Customer Service"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Mentions</label>
              <Input type="number" value={form.metrics.mentions} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, mentions: Number(e.target.value) || 0 } }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sentiment</label>
              <Input type="number" step="0.01" value={form.metrics.sentiment} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, sentiment: Number(e.target.value) || 0 } }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Trend</label>
              <select
                value={form.metrics.trend}
                onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, trend: e.target.value } }))}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="increasing">Increasing</option>
                <option value="decreasing">Decreasing</option>
                <option value="stable">Stable</option>
              </select>
            </div>
          </div>
          <SourceContentEditor
            value={form.sourceContent ?? []}
            onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SourceContentEditor({ value, onChange }: { value: SourceContentPost[]; onChange: (v: SourceContentPost[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = value ?? [];
  const add = () => {
    const newPost: SourceContentPost = { id: generateId(), platform: "twitter", author: "", content: "", sentiment: 0, timestamp: "" };
    onChange([...list, newPost]);
    setEditingId(newPost.id);
  };
  const remove = (id: string) => {
    onChange(list.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const update = (id: string, updates: Partial<SourceContentPost>) => {
    onChange(list.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">Source Content</label>
        <Button type="button" variant="outline" size="sm" className="rounded-lg h-8" onClick={add}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Tambah
        </Button>
      </div>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {list.map((post) =>
          editingId === post.id ? (
            <div key={post.id} className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Platform" value={post.platform} onChange={(e) => update(post.id, { platform: e.target.value })} className="rounded-lg h-8 text-xs" />
                <Input placeholder="Author" value={post.author} onChange={(e) => update(post.id, { author: e.target.value })} className="rounded-lg h-8 text-xs" />
              </div>
              <Input placeholder="Content" value={post.content} onChange={(e) => update(post.id, { content: e.target.value })} className="rounded-lg h-8 text-xs" />
              <div className="flex gap-2 items-center">
                <Input type="number" step="0.01" placeholder="Sentiment" value={post.sentiment} onChange={(e) => update(post.id, { sentiment: Number(e.target.value) || 0 })} className="rounded-lg h-8 text-xs w-24" />
                <Input placeholder="Timestamp" value={post.timestamp} onChange={(e) => update(post.id, { timestamp: e.target.value })} className="rounded-lg h-8 text-xs flex-1" />
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Likes" value={post.engagement?.likes ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, likes: Number(e.target.value) || 0, replies: post.engagement?.replies ?? 0, retweets: post.engagement?.retweets ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
                <Input type="number" placeholder="Replies" value={post.engagement?.replies ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, replies: Number(e.target.value) || 0, likes: post.engagement?.likes ?? 0, retweets: post.engagement?.retweets ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
                <Input type="number" placeholder="Retweets" value={post.engagement?.retweets ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, retweets: Number(e.target.value) || 0, likes: post.engagement?.likes ?? 0, replies: post.engagement?.replies ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
              </div>
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-red-600" onClick={() => remove(post.id)}><Trash2 className="w-3 h-3" /></Button>
                <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setEditingId(null)}>Selesai</Button>
              </div>
            </div>
          ) : (
            <div key={post.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="truncate flex-1">{post.author || "(no author)"} · {post.platform} · {post.sentiment.toFixed(2)}</span>
              <div className="flex gap-1 shrink-0">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(post.id)}><Pencil className="w-3 h-3" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => remove(post.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function OutletsSection({ items, onUpdate }: { items: OutletItem[]; onUpdate: (items: OutletItem[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah outlet
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((outlet) => (
          <Card key={outlet.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{outlet.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(outlet.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(outlet.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{outlet.location}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  outlet.status === "critical" ? "bg-red-100 text-red-700" :
                  outlet.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {outlet.status}
                </span>
                <span className="text-sm font-medium text-slate-700">Sentiment: {outlet.satisfaction.toFixed(2)}</span>
              </div>
              {outlet.issues.length > 0 && (
                <p className="text-xs text-slate-600">{outlet.issues.join(", ")}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <OutletEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <OutletEditDialog
          item={{
            id: generateId(),
            name: "",
            location: "",
            status: "good",
            satisfaction: 0,
            issues: [],
            coords: { x: 50, y: 50 },
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function OutletEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: OutletItem;
  onClose: () => void;
  onSave: (item: OutletItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah outlet" : "Edit outlet"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nama</label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Lokasi</label>
            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OutletItem["status"] }))}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="good">Good</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Satisfaction (-1 s/d 1)</label>
            <Input type="number" step="0.01" min="-1" max="1" value={form.satisfaction} onChange={(e) => setForm((p) => ({ ...p, satisfaction: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Issues (pisah koma)</label>
            <Input value={form.issues.join(", ")} onChange={(e) => setForm((p) => ({ ...p, issues: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} className="rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RisksSection({ items, onUpdate }: { items: RiskItem[]; onUpdate: (items: RiskItem[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah risk
        </Button>
      </div>
      <div className="grid gap-4">
        {items.map((risk) => (
          <Card key={risk.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{risk.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(risk.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(risk.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.severity}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.probability}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.trend}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{risk.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <RiskEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <RiskEditDialog
          item={{
            id: generateId(),
            title: "",
            description: "",
            severity: "medium",
            probability: 50,
            impact: "",
            trend: "stable",
            supportingContents: 0,
            indicators: [],
            mitigation: [],
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function RiskEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: RiskItem;
  onClose: () => void;
  onSave: (item: RiskItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah risk" : "Edit risk"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Severity</label>
              <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Probability (%)</label>
              <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm((p) => ({ ...p, probability: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Trend</label>
              <select value={form.trend} onChange={(e) => setForm((p) => ({ ...p, trend: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="increasing">Increasing</option>
                <option value="decreasing">Decreasing</option>
                <option value="stable">Stable</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Impact</label>
            <Input value={form.impact} onChange={(e) => setForm((p) => ({ ...p, impact: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Supporting contents</label>
            <Input type="number" value={form.supportingContents} onChange={(e) => setForm((p) => ({ ...p, supportingContents: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Indicators (Quick Metrics)</label>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => setForm((p) => ({ ...p, indicators: [...(p.indicators || []), { label: "", value: 0, change: 0 }] }))}>
                <Plus className="w-3 h-3 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {(form.indicators || []).map((ind, idx) => (
                <div key={idx} className="flex gap-2 items-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <Input placeholder="Label" value={ind.label} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, label: e.target.value } : i) }))} className="rounded-lg h-8 text-xs flex-1" />
                  <Input type="number" step="0.01" placeholder="Value" value={ind.value} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, value: Number(e.target.value) || 0 } : i) }))} className="rounded-lg h-8 text-xs w-20" />
                  <Input type="number" placeholder="Change %" value={ind.change} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, change: Number(e.target.value) || 0 } : i) }))} className="rounded-lg h-8 text-xs w-16" />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => setForm((p) => ({ ...p, indicators: p.indicators.filter((_, iidx) => iidx !== idx) }))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Mitigation Strategy (satu per baris)</label>
            <textarea
              value={(form.mitigation ?? []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, mitigation: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
              className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Strategi mitigasi 1&#10;Strategi mitigasi 2"
            />
          </div>
          <SourceContentEditor value={form.sourceContent ?? []} onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OpportunitiesSection({
  items,
  onUpdate,
}: {
  items: OpportunityItem[];
  onUpdate: (items: OpportunityItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah opportunity
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((opp) => (
          <Card key={opp.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-cyan-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{opp.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(opp.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(opp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">{opp.potential}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{opp.confidence}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{opp.timeframe}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{opp.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <OpportunityEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <OpportunityEditDialog
          item={{
            id: generateId(),
            title: "",
            description: "",
            potential: "medium",
            confidence: 50,
            timeframe: "Short-term",
            category: "",
            trend: "stable",
            supportingContents: 0,
            metrics: {},
            recommendations: [],
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function OpportunityEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: OpportunityItem;
  onClose: () => void;
  onSave: (item: OpportunityItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah opportunity" : "Edit opportunity"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Potential</label>
              <select value={form.potential} onChange={(e) => setForm((p) => ({ ...p, potential: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Confidence (%)</label>
              <Input type="number" min={0} max={100} value={form.confidence} onChange={(e) => setForm((p) => ({ ...p, confidence: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Supporting contents</label>
            <Input type="number" value={form.supportingContents} onChange={(e) => setForm((p) => ({ ...p, supportingContents: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Rekomendasi (satu per baris)</label>
            <textarea
              value={form.recommendations.join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, recommendations: e.target.value.split("\n").filter(Boolean) }))}
              className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rekomendasi 1&#10;Rekomendasi 2"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Key Metrics</label>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => setForm((p) => ({ ...p, metrics: { ...p.metrics, newMetric: 0 } }))}>
                <Plus className="w-3 h-3 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {Object.entries(form.metrics || {}).map(([key, val]) => (
                <div key={key} className="flex gap-2 items-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <Input placeholder="Nama metric" value={key} onChange={(e) => { const m = { ...form.metrics }; delete m[key]; m[e.target.value] = val; setForm((p) => ({ ...p, metrics: m })); }} className="rounded-lg h-8 text-xs flex-1" />
                  <Input type="number" step="0.01" value={val} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, [key]: Number(e.target.value) || 0 } }))} className="rounded-lg h-8 text-xs w-28" />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => setForm((p) => { const m = { ...p.metrics }; delete m[key]; return { ...p, metrics: m }; })}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </div>
          <SourceContentEditor value={form.sourceContent ?? []} onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompetitiveSection({
  items,
  onUpdate,
}: {
  items: CompetitiveIssueItem[];
  onUpdate: (items: CompetitiveIssueItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah issue
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Issue</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Your Sentiment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Competitor Median</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Your Mentions</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{row.issue}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.category === "winning" ? "bg-emerald-100 text-emerald-700" :
                    row.category === "critical" ? "bg-red-100 text-red-700" :
                    row.category === "opportunity" ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"
                  }`}>{row.category}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.yourSentiment.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{row.competitorMedianSentiment.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{row.yourMentions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(row.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(row.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingId && (
        <CompetitiveEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <CompetitiveEditDialog
          item={{
            id: generateId(),
            issue: "",
            category: "moderate",
            yourSentiment: 0.5,
            competitorMedianSentiment: 0.5,
            yourMentions: 2000,
            competitorMedianMentions: 2000,
            relativeSentiment: 0,
            relativeMentions: 0,
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function KeyInsightsSection({
  items,
  onUpdate,
}: {
  items: KeyInsightItem[];
  onUpdate: (items: KeyInsightItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Key Insight
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((insight) => (
          <Card
            key={insight.id}
            className={`rounded-2xl overflow-hidden border-2 transition-colors ${
              insight.type === "critical" ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{insight.title}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(insight.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(insight.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${insight.type === "critical" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {insight.type === "critical" ? "Critical" : "Strength"}
              </span>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{insight.description}</p>
              {insight.bullets?.length > 0 && (
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {insight.bullets.slice(0, 3).map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                  {insight.bullets.length > 3 && <li className="text-slate-400">+{insight.bullets.length - 3} lagi</li>}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <KeyInsightEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <KeyInsightEditDialog
          item={{
            id: generateId(),
            type: "critical",
            title: "",
            description: "",
            bullets: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function KeyInsightEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: KeyInsightItem;
  onClose: () => void;
  onSave: (item: KeyInsightItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah Key Insight" : "Edit Key Insight"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as KeyInsightItem["type"] }))}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="critical">Critical</option>
              <option value="strength">Strength</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Critical Issues" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi singkat..." className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Bullet points (satu per baris)</label>
            <textarea
              value={(form.bullets ?? []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="• Point 1&#10;• Point 2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const WHATS_HAPPENING_SUB_TABS: { id: string; label: string; icon: typeof TrendingUp }[] = [
  { id: "sentiment", label: "Sentiment Trends", icon: TrendingUp },
  { id: "topics", label: "Top Discussion Topics", icon: MessageCircle },
  { id: "wordcloud", label: "Word Cloud", icon: MessageCircle },
  { id: "topic-trends", label: "Topic Trends Over Time", icon: LineChart },
  { id: "clusters", label: "Conversation Clusters", icon: Users },
  { id: "hashtags", label: "Top Hashtags", icon: Hash },
  { id: "accounts", label: "Top Accounts", icon: Contact },
  { id: "contents", label: "Top Contents", icon: FileText },
  { id: "kol", label: "KOL Matrix", icon: UserCheck },
  { id: "share", label: "Share of Platform", icon: BarChart3 },
];

function WhatsHappeningSection({
  store,
  updateStore,
  activeSubTab,
  onSubTabChange,
}: {
  store: DashboardContentStore;
  updateStore: (updater: (p: DashboardContentStore) => DashboardContentStore) => void;
  activeSubTab: string;
  onSubTabChange: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {WHATS_HAPPENING_SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSubTabChange(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === id ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      {activeSubTab === "sentiment" && (
        <SentimentTrendsEditor
          items={store.whatsHappeningSentimentTrends ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningSentimentTrends: items }))}
          keyEvents={store.whatsHappeningKeyEvents ?? []}
          onUpdateKeyEvents={(items) => updateStore((p) => ({ ...p, whatsHappeningKeyEvents: items }))}
        />
      )}
      {activeSubTab === "topics" && (
        <TopTopicsEditor
          items={store.whatsHappeningTopTopics ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningTopTopics: items }))}
          aiTopicAnalysis={store.whatsHappeningAITopicAnalysis ?? []}
          onUpdateAITopicAnalysis={(items) => updateStore((p) => ({ ...p, whatsHappeningAITopicAnalysis: items }))}
        />
      )}
      {activeSubTab === "wordcloud" && (
        <WordCloudEditor
          items={store.whatsHappeningWordCloud ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningWordCloud: items }))}
        />
      )}
      {activeSubTab === "topic-trends" && (
        <TopicTrendsEditor
          data={store.whatsHappeningTopicTrendsData ?? []}
          onUpdateData={(v) => updateStore((p) => ({ ...p, whatsHappeningTopicTrendsData: v }))}
          aiTrendAnalysis={store.whatsHappeningAITrendAnalysis ?? []}
          onUpdateAi={(v) => updateStore((p) => ({ ...p, whatsHappeningAITrendAnalysis: v }))}
        />
      )}
      {activeSubTab === "clusters" && (
        <ConversationClustersEditor
          items={store.whatsHappeningClusters ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningClusters: v }))}
        />
      )}
      {activeSubTab === "hashtags" && (
        <TopHashtagsEditor
          items={store.whatsHappeningHashtags ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningHashtags: v }))}
        />
      )}
      {activeSubTab === "accounts" && (
        <TopAccountsEditor
          items={store.whatsHappeningAccounts ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningAccounts: v }))}
        />
      )}
      {activeSubTab === "contents" && (
        <TopContentsEditor
          items={store.whatsHappeningContents ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningContents: v }))}
        />
      )}
      {activeSubTab === "kol" && (
        <KOLMatrixEditor
          items={store.whatsHappeningKOLMatrix ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningKOLMatrix: v }))}
          aiAnalysis={store.whatsHappeningAIKOLAnalysis ?? []}
          onUpdateAi={(v) => updateStore((p) => ({ ...p, whatsHappeningAIKOLAnalysis: v }))}
        />
      )}
      {activeSubTab === "share" && (
        <ShareOfPlatformEditor
          items={store.whatsHappeningShareOfPlatform ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningShareOfPlatform: v }))}
        />
      )}
    </div>
  );
}

function SentimentTrendsEditor({
  items,
  onUpdate,
  keyEvents,
  onUpdateKeyEvents,
}: {
  items: SentimentTrendItem[];
  onUpdate: (v: SentimentTrendItem[]) => void;
  keyEvents: KeyEventItem[];
  onUpdateKeyEvents: (v: KeyEventItem[]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [keyEventEditId, setKeyEventEditId] = useState<string | null>(null);
  const [keyEventAdding, setKeyEventAdding] = useState(false);
  const list = items ?? [];
  const events = keyEvents ?? [];
  const add = () => {
    onUpdate([...list, { date: "", positive: 0, negative: 0, neutral: 0 }]);
    setAdding(true);
    setEditingIdx(list.length);
  };
  const updateKeyEvent = (id: string, u: Partial<KeyEventItem>) => {
    onUpdateKeyEvents(events.map((e) => (e.id === id ? { ...e, ...u } : e)));
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah data
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Positive</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Negative</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Neutral</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.positive}</td>
                  <td className="px-4 py-3">{row.negative}</td>
                  <td className="px-4 py-3">{row.neutral}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingIdx !== null && list[editingIdx] && (
          <Dialog open onOpenChange={(o) => !o && (setEditingIdx(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah baris" : "Edit baris"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Date" value={list[editingIdx].date} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, date: e.target.value } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Positive" value={list[editingIdx].positive} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, positive: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Negative" value={list[editingIdx].negative} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, negative: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Neutral" value={list[editingIdx].neutral} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, neutral: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditingIdx(null); setAdding(false); }}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Key Events Detected by AI</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), date: "", title: "", description: "" }; onUpdateKeyEvents([...events, newItem]); setKeyEventEditId(newItem.id); setKeyEventAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah event
          </Button>
        </div>
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500">{ev.date}</span>
                <p className="font-medium text-slate-900 truncate">{ev.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{ev.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setKeyEventEditId(ev.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateKeyEvents(events.filter((e) => e.id !== ev.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(keyEventEditId || keyEventAdding) && (() => {
          const ev = events.find((e) => e.id === keyEventEditId) ?? (keyEventAdding ? events[events.length - 1] : null);
          if (!ev) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setKeyEventEditId(null), setKeyEventAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Key Event</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Date (e.g. Nov 9)" value={ev.date} onChange={(e) => updateKeyEvent(ev.id, { date: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Title" value={ev.title} onChange={(e) => updateKeyEvent(ev.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={ev.description} onChange={(e) => updateKeyEvent(ev.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setKeyEventEditId(null); setKeyEventAdding(false); }}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function TopTopicsEditor({
  items,
  onUpdate,
  aiTopicAnalysis,
  onUpdateAITopicAnalysis,
}: {
  items: TopTopicItem[];
  onUpdate: (v: TopTopicItem[]) => void;
  aiTopicAnalysis: AITopicAnalysisItem[];
  onUpdateAITopicAnalysis: (v: AITopicAnalysisItem[]) => void;
}) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const add = () => { onUpdate([...list, { topic: "", mentions: 0, sentiment: 0 }]); setEditIdx(list.length); };
  const updateRow = (idx: number, u: Partial<TopTopicItem>) => onUpdate(list.map((r, i) => i === idx ? { ...r, ...u } : r));
  const aiList = aiTopicAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AITopicAnalysisItem>) => onUpdateAITopicAnalysis(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah topic
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mentions</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Sentiment</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.topic}</td>
                  <td className="px-4 py-3">{row.mentions.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.sentiment.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editIdx !== null && list[editIdx] && (
          <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>Edit topic</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Topic" value={list[editIdx].topic} onChange={(e) => updateRow(editIdx, { topic: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Mentions" value={list[editIdx].mentions} onChange={(e) => updateRow(editIdx, { mentions: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" step="0.01" placeholder="Sentiment" value={list[editIdx].sentiment} onChange={(e) => updateRow(editIdx, { sentiment: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI Topic Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAITopicAnalysis([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAITopicAnalysis(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI Topic Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AITopicAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="opportunity">opportunity</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function WordCloudEditor({ items, onUpdate }: { items: WordCloudItem[]; onUpdate: (v: WordCloudItem[]) => void }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const add = () => onUpdate([...list, { text: "", weight: 50, sentiment: "neutral" }]);
  const updateRow = (idx: number, u: Partial<WordCloudItem>) => onUpdate(list.map((r, i) => i === idx ? { ...r, ...u } : r));
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah kata
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Text</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Weight</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Sentiment</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.text}</td>
                <td className="px-4 py-3">{row.weight}</td>
                <td className="px-4 py-3">{row.sentiment}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
          <DialogContent className="rounded-2xl sm:max-w-sm">
            <DialogHeader><DialogTitle>Edit kata</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Text" value={list[editIdx].text} onChange={(e) => updateRow(editIdx, { text: e.target.value })} className="rounded-xl" />
              <Input type="number" placeholder="Weight" value={list[editIdx].weight} onChange={(e) => updateRow(editIdx, { weight: Number(e.target.value) || 0 })} className="rounded-xl" />
              <select
                value={list[editIdx].sentiment}
                onChange={(e) => updateRow(editIdx, { sentiment: e.target.value as WordCloudItem["sentiment"] })}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="positive">positive</option>
                <option value="negative">negative</option>
                <option value="neutral">neutral</option>
              </select>
            </div>
            <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const TOPIC_TREND_KEYS = ["packaging", "customerService", "productQuality", "shipping"] as const;

function TopicTrendsEditor({
  data,
  onUpdateData,
  aiTrendAnalysis,
  onUpdateAi,
}: {
  data: TopicTrendsOverTimeRow[];
  onUpdateData: (v: TopicTrendsOverTimeRow[]) => void;
  aiTrendAnalysis: AITrendAnalysisItem[];
  onUpdateAi: (v: AITrendAnalysisItem[]) => void;
}) {
  const list = data ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const addRow = () => onUpdateData([...list, { date: "", packaging: 0, customerService: 0, productQuality: 0, shipping: 0 }]);
  const updateRow = (idx: number, u: Partial<TopicTrendsOverTimeRow>) => onUpdateData(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  const aiList = aiTrendAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AITrendAnalysisItem>) => onUpdateAi(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={addRow} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah baris
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                {TOPIC_TREND_KEYS.map((k) => (
                  <th key={k} className="px-4 py-3 text-left font-semibold text-slate-700">{k}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.date}</td>
                  {TOPIC_TREND_KEYS.map((k) => (
                    <td key={k} className="px-4 py-3">{Number((row as Record<string, unknown>)[k]) || 0}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateData(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editIdx !== null && list[editIdx] && (
          <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
                {TOPIC_TREND_KEYS.map((k) => (
                  <Input key={k} type="number" placeholder={k} value={Number((list[editIdx] as Record<string, unknown>)[k]) || 0} onChange={(e) => updateRow(editIdx, { [k]: Number(e.target.value) || 0 })} className="rounded-xl" />
                ))}
              </div>
              <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI Trend Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAi([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAi(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI Trend Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AITrendAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="warning">warning</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function ConversationClustersEditor({ items, onUpdate }: { items: ConversationClusterItem[]; onUpdate: (v: ConversationClusterItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<ConversationClusterItem>) => onUpdate(list.map((c) => (c.id === id ? { ...c, ...u } : c)));
  const add = () => { const newItem = { id: generateId(), theme: "", size: 0, sentiment: 0, trend: "stable" as const, keywords: [] }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah cluster
        </Button>
      </div>
      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{c.theme || "—"}</p>
              <p className="text-xs text-slate-600">{c.size.toLocaleString()} mentions · {c.sentiment.toFixed(2)} · {c.trend}</p>
              <div className="flex flex-wrap gap-1 mt-1">{c.keywords.slice(0, 3).map((k) => <span key={k} className="text-xs px-1.5 py-0.5 bg-violet-100 rounded">{k}</span>)}{c.keywords.length > 3 && <span className="text-xs text-slate-500">+{c.keywords.length - 3}</span>}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(c.id)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== c.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      {editId && (() => {
        const c = list.find((x) => x.id === editId);
        if (!c) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah cluster" : "Edit cluster"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Theme" value={c.theme} onChange={(e) => updateOne(c.id, { theme: e.target.value })} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Size" value={c.size} onChange={(e) => updateOne(c.id, { size: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" step="0.01" placeholder="Sentiment" value={c.sentiment} onChange={(e) => updateOne(c.id, { sentiment: Number(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <select value={c.trend} onChange={(e) => updateOne(c.id, { trend: e.target.value as ConversationClusterItem["trend"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                  <option value="up">up</option>
                  <option value="down">down</option>
                  <option value="stable">stable</option>
                </select>
                <textarea placeholder="Keywords (satu per baris)" value={c.keywords.join("\n")} onChange={(e) => updateOne(c.id, { keywords: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className="w-full min-h-[60px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopHashtagsEditor({ items, onUpdate }: { items: TopHashtagItem[]; onUpdate: (v: TopHashtagItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopHashtagItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), tag: "", likes: 0, comments: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah hashtag
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tag</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Comments</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{row.tag}</td>
                <td className="px-4 py-3">{(row.likes ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">{(row.comments ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah hashtag" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Tag (e.g. #BrandX)" value={row.tag} onChange={(e) => updateOne(row.id, { tag: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Comments" value={row.comments} onChange={(e) => updateOne(row.id, { comments: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopAccountsEditor({ items, onUpdate }: { items: TopAccountItem[]; onUpdate: (v: TopAccountItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopAccountItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), name: "", handle: "", platform: "Twitter", followers: 0, conversations: 0, likes: 0, replies: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah akun
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Handle</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Platform</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Followers</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-slate-600">{row.handle}</td>
                <td className="px-4 py-3">{row.platform}</td>
                <td className="px-4 py-3">{row.followers.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah akun" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                <Input placeholder="Handle" value={row.handle} onChange={(e) => updateOne(row.id, { handle: e.target.value })} className="rounded-xl" />
                <Input placeholder="Platform" value={row.platform} onChange={(e) => updateOne(row.id, { platform: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Followers" value={row.followers} onChange={(e) => updateOne(row.id, { followers: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Conversations" value={row.conversations} onChange={(e) => updateOne(row.id, { conversations: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Replies" value={row.replies} onChange={(e) => updateOne(row.id, { replies: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopContentsEditor({ items, onUpdate }: { items: TopContentItem[]; onUpdate: (v: TopContentItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopContentItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), title: "", platform: "", author: "", likes: 0, comments: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah konten
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Platform</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Author</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{row.title}</td>
                <td className="px-4 py-3">{row.platform}</td>
                <td className="px-4 py-3 text-slate-600">{row.author}</td>
                <td className="px-4 py-3">{(row.likes ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah konten" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={row.title} onChange={(e) => updateOne(row.id, { title: e.target.value })} className="rounded-xl" />
                <Input placeholder="Platform" value={row.platform} onChange={(e) => updateOne(row.id, { platform: e.target.value })} className="rounded-xl" />
                <Input placeholder="Author" value={row.author} onChange={(e) => updateOne(row.id, { author: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Comments" value={row.comments} onChange={(e) => updateOne(row.id, { comments: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function KOLMatrixEditor({
  items,
  onUpdate,
  aiAnalysis,
  onUpdateAi,
}: {
  items: KOLMatrixItem[];
  onUpdate: (v: KOLMatrixItem[]) => void;
  aiAnalysis: AIKOLAnalysisItem[];
  onUpdateAi: (v: AIKOLAnalysisItem[]) => void;
}) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const updateOne = (id: string, u: Partial<KOLMatrixItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), name: "", followers: 0, positivity: 0, engagement: 0, color: "#8b5cf6", category: "" }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  const aiList = aiAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AIKOLAnalysisItem>) => onUpdateAi(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah KOL
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Followers</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Positivity %</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Engagement</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.followers.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.positivity}%</td>
                  <td className="px-4 py-3">{row.engagement.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editId && (() => {
          const row = list.find((x) => x.id === editId);
          if (!row) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-sm">
                <DialogHeader><DialogTitle>{adding ? "Tambah KOL" : "Edit"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                  <Input type="number" placeholder="Followers" value={row.followers} onChange={(e) => updateOne(row.id, { followers: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Positivity %" value={row.positivity} onChange={(e) => updateOne(row.id, { positivity: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Engagement" value={row.engagement} onChange={(e) => updateOne(row.id, { engagement: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input placeholder="Category" value={row.category} onChange={(e) => updateOne(row.id, { category: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Color (#hex)" value={row.color} onChange={(e) => updateOne(row.id, { color: e.target.value })} className="rounded-xl" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI KOL Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAi([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAi(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI KOL Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AIKOLAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="opportunity">opportunity</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function ShareOfPlatformEditor({ items, onUpdate }: { items: ShareOfPlatformRow[]; onUpdate: (v: ShareOfPlatformRow[]) => void }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const platforms = ["twitter", "youtube", "reddit", "instagram", "facebook", "tiktok"] as const;
  const add = () => onUpdate([...list, { date: "", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 }]);
  const updateRow = (idx: number, u: Partial<ShareOfPlatformRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              {platforms.map((p) => (
                <th key={p} className="px-4 py-3 text-left font-semibold text-slate-700">{p}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.date}</td>
                {platforms.map((p) => (
                  <td key={p} className="px-4 py-3">{row[p].toLocaleString()}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && (setEditIdx(null), setAdding(false))}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
              {platforms.map((p) => (
                <Input key={p} type="number" placeholder={p} value={list[editIdx][p]} onChange={(e) => updateRow(editIdx, { [p]: Number(e.target.value) || 0 })} className="rounded-xl" />
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setEditIdx(null); setAdding(false); }}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CompetitiveMatrixEditor({
  matrixItems,
  onUpdateMatrix,
  quadrantItems,
  onUpdateQuadrant,
}: {
  matrixItems: CompetitiveMatrixItem[];
  onUpdateMatrix: (v: CompetitiveMatrixItem[]) => void;
  quadrantItems: QuadrantAnalysisItem[];
  onUpdateQuadrant: (v: QuadrantAnalysisItem[]) => void;
}) {
  const list = matrixItems ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const quads = quadrantItems ?? [];
  const [quadEditId, setQuadEditId] = useState<string | null>(null);
  const [quadAdding, setQuadAdding] = useState(false);
  const updateOne = (id: string, u: Partial<CompetitiveMatrixItem>) => onUpdateMatrix(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), name: "", mentions: 0, positivePercentage: 0, size: 0, color: "#8b5cf6" }; onUpdateMatrix([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  const updateQuad = (id: string, u: Partial<QuadrantAnalysisItem>) => onUpdateQuadrant(quads.map((q) => (q.id === id ? { ...q, ...u } : q)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800">Competitive Matrix (scatter data)</h4>
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah brand
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mentions</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Positive %</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Size</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.mentions.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.positivePercentage}%</td>
                  <td className="px-4 py-3">{row.size}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateMatrix(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editId && (() => {
          const row = list.find((x) => x.id === editId);
          if (!row) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-sm">
                <DialogHeader><DialogTitle>{adding ? "Tambah brand" : "Edit"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                  <Input type="number" placeholder="Mentions" value={row.mentions} onChange={(e) => updateOne(row.id, { mentions: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Positive %" value={row.positivePercentage} onChange={(e) => updateOne(row.id, { positivePercentage: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Size" value={row.size} onChange={(e) => updateOne(row.id, { size: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input placeholder="Color (#hex)" value={row.color} onChange={(e) => updateOne(row.id, { color: e.target.value })} className="rounded-xl" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Quadrant Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), label: "", brands: "", note: "" }; onUpdateQuadrant([...quads, newItem]); setQuadEditId(newItem.id); setQuadAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah quadrant
          </Button>
        </div>
        <div className="space-y-2">
          {quads.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{q.label || "—"}</p>
                <p className="text-xs text-slate-600">Brands: {q.brands || "—"}</p>
                <p className="text-xs text-slate-500">{q.note || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuadEditId(q.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateQuadrant(quads.filter((x) => x.id !== q.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(quadEditId || quadAdding) && (() => {
          const q = quads.find((x) => x.id === quadEditId);
          if (!q) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setQuadEditId(null), setQuadAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Quadrant Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Label" value={q.label} onChange={(e) => updateQuad(q.id, { label: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Brands" value={q.brands} onChange={(e) => updateQuad(q.id, { brands: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Note" value={q.note} onChange={(e) => updateQuad(q.id, { note: e.target.value })} className="rounded-xl" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setQuadEditId(null); setQuadAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

const HEATMAP_COLS = ["yourBrand", "competitorA", "competitorB", "competitorC", "competitorD"] as const;

function CompetitiveHeatmapEditor({
  title,
  items,
  onUpdate,
  valueLabel,
  brandLabels,
  competitiveMatrixItems,
}: {
  title: string;
  items: CompetitiveHeatmapRow[];
  onUpdate: (v: CompetitiveHeatmapRow[]) => void;
  valueLabel: string;
  brandLabels?: CompetitiveBrandLabels | undefined;
  competitiveMatrixItems?: CompetitiveMatrixItem[];
}) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  
  // Generate all brand names from competitiveMatrixItems
  const allBrands = competitiveMatrixItems && competitiveMatrixItems.length > 0
    ? competitiveMatrixItems.map(item => item.name)
    : (brandLabels ? [brandLabels.yourBrand, brandLabels.competitorA, brandLabels.competitorB, brandLabels.competitorC, brandLabels.competitorD] : ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Competitor D"]);
  
  // Helper: support full row (row[brandName]) and legacy 5-column (yourBrand, competitorA–D)
  const getBrandValue = (row: CompetitiveHeatmapRow, brandName: string): number => {
    const direct = row[brandName];
    if (typeof direct === "number") return direct;
    if (typeof direct === "string") return parseFloat(direct) || 0;
    if (brandLabels) {
      if (brandName === brandLabels.yourBrand) return (row.yourBrand as number) ?? 0;
      if (brandName === brandLabels.competitorA) return (row.competitorA as number) ?? 0;
      if (brandName === brandLabels.competitorB) return (row.competitorB as number) ?? 0;
      if (brandName === brandLabels.competitorC) return (row.competitorC as number) ?? 0;
      if (brandName === brandLabels.competitorD) return (row.competitorD as number) ?? 0;
    }
    return 0;
  };
  
  const add = () => onUpdate([...list, { issue: "", yourBrand: 0, competitorA: 0, competitorB: 0, competitorC: 0, competitorD: 0 }]);
  const updateRow = (idx: number, u: Partial<CompetitiveHeatmapRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[120px]">Issue</th>
              {allBrands.map((brandName, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">{brandName}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700 sticky right-0 bg-slate-50 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium sticky left-0 bg-white z-10">{row.issue}</td>
                {allBrands.map((brandName, colIdx) => {
                  const value = getBrandValue(row, brandName);
                  return (
                    <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                      {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right sticky right-0 bg-white z-10">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && (setEditIdx(null), setAdding(false))}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris ({valueLabel})</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Issue" value={list[editIdx].issue} onChange={(e) => updateRow(editIdx, { issue: e.target.value })} className="rounded-xl" />
              {HEATMAP_COLS.map((c) => {
                const brandName = brandLabels 
                  ? (c === "yourBrand" ? brandLabels.yourBrand : c === "competitorA" ? brandLabels.competitorA : c === "competitorB" ? brandLabels.competitorB : c === "competitorC" ? brandLabels.competitorC : brandLabels.competitorD)
                  : c;
                return (
                  <Input key={c} type="number" step={valueLabel.includes("Score") ? 0.01 : 1} placeholder={brandName} value={list[editIdx][c]} onChange={(e) => updateRow(editIdx, { [c]: valueLabel.includes("Score") ? Number(e.target.value) || 0 : Number(e.target.value) || 0 })} className="rounded-xl" />
                );
              })}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setEditIdx(null); setAdding(false); }}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ShareOfVoiceEditor({ items, onUpdate, brandLabels }: { items: ShareOfVoiceRow[]; onUpdate: (v: ShareOfVoiceRow[]) => void; brandLabels?: CompetitiveBrandLabels | undefined }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const cols = ["yourBrand", "competitorA", "competitorB", "competitorC", "competitorD"] as const;
  const labels = brandLabels ? [brandLabels.yourBrand, brandLabels.competitorA, brandLabels.competitorB, brandLabels.competitorC, brandLabels.competitorD] : ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Competitor D"];
  const add = () => onUpdate([...list, { date: "", yourBrand: 0, competitorA: 0, competitorB: 0, competitorC: 0, competitorD: 0 }]);
  const updateRow = (idx: number, u: Partial<ShareOfVoiceRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">Share of Voice (per date)</h4>
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              {labels.map((l, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700">{l}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.date}</td>
                {cols.map((c) => (
                  <td key={c} className="px-4 py-3">{row[c].toLocaleString()}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
              {cols.map((c) => (
                <Input key={c} type="number" placeholder={c} value={list[editIdx][c]} onChange={(e) => updateRow(editIdx, { [c]: Number(e.target.value) || 0 })} className="rounded-xl" />
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CompetitiveEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: CompetitiveIssueItem;
  onClose: () => void;
  onSave: (item: CompetitiveIssueItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah competitive issue" : "Edit issue"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Issue</label>
            <Input value={form.issue} onChange={(e) => setForm((p) => ({ ...p, issue: e.target.value }))} placeholder="Product Quality" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
              <option value="winning">Winning</option>
              <option value="critical">Critical</option>
              <option value="opportunity">Opportunity</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Your sentiment</label>
              <Input type="number" step="0.01" value={form.yourSentiment} onChange={(e) => setForm((p) => ({ ...p, yourSentiment: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Competitor median</label>
              <Input type="number" step="0.01" value={form.competitorMedianSentiment} onChange={(e) => setForm((p) => ({ ...p, competitorMedianSentiment: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Your mentions</label>
              <Input type="number" value={form.yourMentions} onChange={(e) => setForm((p) => ({ ...p, yourMentions: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Competitor mentions</label>
              <Input type="number" value={form.competitorMedianMentions} onChange={(e) => setForm((p) => ({ ...p, competitorMedianMentions: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
