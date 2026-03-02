# Analisis Data & Rencana Migrasi ke MongoDB – NaradAI v4

Dokumen ini merangkum **sumber data saat ini**, **struktur yang dipakai**, dan **rancangan MongoDB** untuk migrasi dari localStorage ke database.

---

## 1. Sumber Data Saat Ini (LocalStorage & State)

| Key / Sumber | Lokasi Kode | Deskripsi | Format |
|--------------|-------------|-----------|--------|
| `naradai_dashboard_content_{instanceId}` | `dashboard-content-store.ts` | Satu objek dashboard penuh per instance | JSON: `DashboardContentStore` |
| `naradai_schedulers` | `scheduler-service.ts` | Semua scheduler (key = schedulerId) | `Record<string, SchedulerState>` |
| `naradai_current_instance` | `App.tsx` | Instance ID yang sedang aktif | string |
| `naradai_auth` | `auth.ts` | Session login (username, displayName, allowedInstanceIds) | `StoredSession` |
| **Hardcoded** | `instances.ts` | Daftar instance (id, name) | `Instance[]` |
| **Hardcoded** | `initial-data.ts` | Initial content per instance (fallback) | Fungsi `getInitialDashboardContentForInstance()` |
| **Form + API** | `ai-analysis-service.ts` | Project config (payload ke backend) | `ProjectConfigPayload` |

---

## 2. Struktur Data Utama (TypeScript → MongoDB)

### 2.1 Instance (saat ini: hardcoded array)

```ts
// src/lib/instances.ts
interface Instance {
  id: string;
  name: string;
}
```

**MongoDB:** collection `instances`

```json
{
  "_id": ObjectId,
  "id": "bukalapak",
  "name": "Bukalapak",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

- **Index:** unique pada `id`.

---

### 2.2 Dashboard Content: Satu Collection per Chart/Content

Setiap section/chart di dashboard punya **collection MongoDB sendiri**. Satu dokumen per instance (atau per instance + `snapshotAt` jika pakai historis). Field `items` berisi array data chart tersebut.

| Collection | Dashboard Section | Tipe Data (TypeScript) | Deskripsi |
|------------|--------------------|-------------------------|------------|
| **feature_visibility** | Toggle fitur | `FeatureVisibility` | Satu doc per instance: statsOverview, actionRecommendations, outletSatisfaction, risksOpportunities, competitiveAnalysis, recentInsights (boolean) |
| **stats_overview** | Stats Overview | `StatItem[]` | Kartu stat: label, value, description, icon |
| **priority_actions** | Action Recommendations | `PriorityActionItem[]` | Rekomendasi aksi: priority, title, description, impact, effort, recommendation, category, metrics, sourceContent[] |
| **outlet_satisfaction** | Outlet Satisfaction | `OutletItem[]` | Kepuasan outlet: name, location, status, satisfaction, issues[], coords |
| **risks** | Risks | `RiskItem[]` | Risiko: title, description, severity, probability, indicators[], mitigation[], sourceContent[] |
| **opportunities** | Opportunities | `OpportunityItem[]` | Peluang: title, potential, confidence, metrics, recommendations[], sourceContent[] |
| **competitive_issues** | Competitive Issues (matrix) | `CompetitiveIssueItem[]` | Issue kompetitif: issue, category, yourSentiment, competitorMedianSentiment, yourMentions, relativeSentiment, relativeMentions |
| **competitive_key_insights** | Competitive Key Insights | `KeyInsightItem[]` | Insight: type, title, description, bullets[] |
| **sentiment_trends** | What's Happening – Sentiment Trends | `SentimentTrendItem[]` | Trend sentimen: date, positive, negative, neutral |
| **key_events** | What's Happening – Key Events | `KeyEventItem[]` | Event: id, date, title, description |
| **top_topics** | What's Happening – Top Topics | `TopTopicItem[]` | Topik: topic, mentions, sentiment |
| **ai_topic_analysis** | What's Happening – AI Topic Analysis | `AITopicAnalysisItem[]` | Analisis AI: id, type, title, description |
| **topic_trends_data** | What's Happening – Topic Trends Over Time | `TopicTrendsOverTimeRow[]` | Time series: date + packaging, customerService, productQuality, shipping, dll. |
| **ai_trend_analysis** | What's Happening – AI Trend Analysis | `AITrendAnalysisItem[]` | Analisis trend: id, type, title, description |
| **word_cloud** | What's Happening – Word Cloud | `WordCloudItem[]` | Kata: text, weight, sentiment |
| **conversation_clusters** | What's Happening – Clusters | `ConversationClusterItem[]` | Kluster: theme, size, sentiment, trend, keywords[] |
| **hashtags** | What's Happening – Top Hashtags | `TopHashtagItem[]` | Hashtag: id, tag, conversations, likes, comments |
| **top_accounts** | What's Happening – Top Accounts | `TopAccountItem[]` | Akun: id, name, handle, platform, followers, conversations, likes, replies |
| **top_contents** | What's Happening – Top Contents | `TopContentItem[]` | Konten: id, title, platform, author, likes, comments |
| **kol_matrix** | What's Happening – KOL Matrix | `KOLMatrixItem[]` | KOL: name, followers, positivity, engagement, color, category |
| **ai_kol_analysis** | What's Happening – AI KOL Analysis | `AIKOLAnalysisItem[]` | Analisis KOL: id, type, title, description |
| **share_of_platform** | What's Happening – Share of Platform | `ShareOfPlatformRow[]` | Per platform: date, twitter, youtube, reddit, instagram, facebook, tiktok |
| **competitive_matrix_items** | Competitive Matrix (bubble) | `CompetitiveMatrixItem[]` | Bubble: name, mentions, positivePercentage, size, color |
| **competitive_quadrant_analysis** | Competitive Quadrant | `QuadrantAnalysisItem[]` | Kuadran: id, label, brands, note |
| **competitive_sentiment_scores** | Competitive Sentiment Heatmap | `CompetitiveHeatmapRow[]` | Heatmap sentimen: issue, yourBrand, competitorA–D |
| **competitive_volume_mentions** | Competitive Volume Heatmap | `CompetitiveHeatmapRow[]` | Heatmap volume: issue, yourBrand, competitorA–D |
| **competitive_share_of_voice** | Competitive Share of Voice | `ShareOfVoiceRow[]` | SOV: date, yourBrand, competitorA–D |
| **competitive_brand_labels** | Label brand (Competitive) | `CompetitiveBrandLabels` | Satu doc per instance: yourBrand, competitorA–D (string) |

**Pola dokumen per collection (kecuali feature_visibility & competitive_brand_labels):**

```json
{
  "_id": ObjectId,
  "instanceId": "kapal_api_12_19_feb_2026",
  "snapshotAt": ISODate,
  "items": [ /* array of StatItem / PriorityActionItem / ... */ ],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**feature_visibility** (satu doc per instance, tanpa `items`):

```json
{
  "_id": ObjectId,
  "instanceId": "kapal_api_12_19_feb_2026",
  "statsOverview": true,
  "actionRecommendations": true,
  "outletSatisfaction": true,
  "risksOpportunities": true,
  "competitiveAnalysis": true,
  "recentInsights": true,
  "updatedAt": ISODate
}
```

**competitive_brand_labels** (satu doc per instance):

```json
{
  "_id": ObjectId,
  "instanceId": "kapal_api_12_19_feb_2026",
  "yourBrand": "Your Brand",
  "competitorA": "Competitor A",
  "competitorB": "Competitor B",
  "competitorC": "Competitor C",
  "competitorD": "Competitor D",
  "updatedAt": ISODate
}
```

**Index (umum):** setiap collection: `{ instanceId: 1 }`, dan jika pakai historis: `{ instanceId: 1, snapshotAt: -1 }`.  
**Kebijakan “latest”:** ambil satu dokumen per `instanceId` dengan `snapshotAt` terbaru (atau satu doc per instance tanpa historis).

---

### 2.3 Project Config (saat ini: form state + dikirim ke API)

Struktur di `ai-analysis-service.ts` → `ProjectConfigPayload`:

```ts
project: { project_id, project_name, status }
data_sources: { platforms: [{ name, query: { include_keywords, exclude_keywords, exact_match, fuzzy_match, synonyms } }], competitors? }
localization: { languages: string[] }
content: { content_types: string[] }
schedule: { start_time, end_time?, backfill: { days }, retry_policy: { max_retry, retry_delay_seconds } }
```

**MongoDB:** collection `project_configs`

```json
{
  "_id": ObjectId,
  "instanceId": "kapal_api_12_19_feb_2026",
  "project": {
    "project_id": "sl-2026-001",
    "project_name": "Brand listening",
    "status": "active"
  },
  "data_sources": {
    "platforms": [...],
    "competitors": []
  },
  "localization": { "languages": ["id", "en"] },
  "content": { "content_types": ["text", "image", "video"] },
  "schedule": { ... },
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

- **Index:** unique pada `instanceId` (satu config aktif per instance).

---

### 2.4 Schedulers (saat ini: satu key localStorage berisi object)

```ts
// scheduler-service.ts
interface SchedulerState {
  projectId: string;
  config: ProjectConfigPayload;
  startTime: string;
  endTime: string | null;
  days: number;
  createdAt: string;
  lastTriggered: string | null;
  triggerCount: number;
  isActive: boolean;
}
// Stored: Record<string, SchedulerState>
```

**MongoDB:** collection `schedulers`

```json
{
  "_id": ObjectId,
  "schedulerId": "scheduler_Brand listening_1739123456789",
  "instanceId": "kapal_api_12_19_feb_2026",
  "config": { /* ProjectConfigPayload */ },
  "startTime": "2026-02-01T00:00:00",
  "endTime": "2026-02-08T00:00:00",
  "days": 7,
  "createdAt": ISODate,
  "lastTriggered": ISODate atau null,
  "triggerCount": 0,
  "isActive": true,
  "updatedAt": ISODate
}
```

- **Index:** `instanceId`, `isActive`, `schedulerId` (unique).

---

### 2.5 Auth / Users (opsional untuk migrasi fase awal)

Saat ini: `naradai_auth` di localStorage + `DEMO_USERS` hardcoded di `auth.ts`.

Untuk MongoDB (nanti):

- Collection `users`: username, passwordHash, displayName, allowedInstanceIds (array atau "all"), createdAt, updatedAt.
- Session bisa tetap di cookie/JWT; tidak wajib simpan session ke MongoDB di fase pertama.

---

## 3. Rangkuman Collection MongoDB yang Disarankan

| No | Collection | Kunci / Index | Sumber Data Saat Ini |
|----|------------|----------------|----------------------|
| 1 | **instances** | `id` (unique) | `instances.ts` (hardcoded) |
| 2 | **project_configs** | `instanceId` (unique) | Form Project Config + payload API |
| 3 | **schedulers** | `schedulerId` (unique), `instanceId`, `isActive` | `naradai_schedulers` |
| 4–30 | **Dashboard per chart** | `instanceId`, opsional `(instanceId, snapshotAt)` | `naradai_dashboard_content_{id}` (dipecah per section) |
| | `feature_visibility` | `instanceId` (unique) | Toggle fitur |
| | `stats_overview`, `priority_actions`, `outlet_satisfaction`, `risks`, `opportunities` | `instanceId` | Section Overview & Actions |
| | `competitive_issues`, `competitive_key_insights`, `competitive_matrix_items`, `competitive_quadrant_analysis`, `competitive_sentiment_scores`, `competitive_volume_mentions`, `competitive_share_of_voice`, `competitive_brand_labels` | `instanceId` | Section Competitive |
| | `sentiment_trends`, `key_events`, `top_topics`, `ai_topic_analysis`, `topic_trends_data`, `ai_trend_analysis`, `word_cloud`, `conversation_clusters`, `hashtags`, `top_accounts`, `top_contents`, `kol_matrix`, `ai_kol_analysis`, `share_of_platform` | `instanceId` | Section What's Happening |

**User preference (current instance):** bisa tetap di localStorage (`naradai_current_instance`) atau nanti di collection `user_preferences` / profile user.

---

## 4. Alur Migrasi yang Disarankan

### Fase 1: Backend + MongoDB

1. Setup MongoDB (local/atlas), definisi collection + index di atas.
2. API (Node/Express/Fastify atau yang dipakai):
   - **GET/POST/PUT** `project_configs` by `instanceId`.
   - **GET/POST/PUT/DELETE** `schedulers` by `schedulerId` atau `instanceId`.
   - **Dashboard:** satu collection per chart → **GET/PUT** per collection by `instanceId` (mis. `GET /api/instances/:id/stats-overview`, `PUT /api/instances/:id/priority-actions`). Alternatif: **GET aggregate** `GET /api/instances/:id/dashboard` yang mengumpulkan semua collection dalam satu response (lebih sedikit round-trip untuk load penuh).
   - **GET** `instances` (list); optional **POST** untuk tambah instance.
3. Seed data:
   - Import daftar dari `instances.ts` ke `instances`.
   - (Opsional) Export data dari localStorage lalu script import: pecah `dashboard_content` per section ke 27 collection + `schedulers`.

### Fase 2: Frontend

1. Ganti pemanggilan:
   - `loadDashboardContent(instanceId)` → panggil API GET aggregate dashboard (satu endpoint yang mengembalikan semua collection) atau banyak GET per collection; fallback ke initial-data jika 404.
   - `saveDashboardContent(data, instanceId)` → API PUT per section (banyak request) atau satu endpoint bulk PUT yang menerima objek dengan key per collection.
   - `getAllSchedulers()` / `saveScheduler()` / dll. → API schedulers.
   - Project config save → API project_configs (dan tetap kirim ke pipeline ingestion jika ada).
2. Pertahankan `naradai_current_instance` di localStorage (atau pindah ke user preferences API nanti).
3. Auth: tetap pakai localStorage untuk demo; nanti bisa ganti ke login API + JWT yang baca `users` dari MongoDB.

### Fase 3: Historis (opsional)

- Di tiap collection dashboard, simpan banyak dokumen per instance dengan `snapshotAt`.
- Query “latest” per collection = `find({ instanceId }).sort({ snapshotAt: -1 }).limit(1)`.
- Hapus atau arsip dokumen lama per collection berdasarkan kebijakan retention.

---

## 5. Mapping Singkat: LocalStorage → MongoDB

| LocalStorage Key | Collection | Catatan |
|------------------|------------|---------|
| `naradai_dashboard_content_{id}` | **27 collection** (feature_visibility, stats_overview, priority_actions, outlet_satisfaction, risks, opportunities, competitive_*, sentiment_trends, key_events, top_topics, ai_topic_analysis, topic_trends_data, ai_trend_analysis, word_cloud, conversation_clusters, hashtags, top_accounts, top_contents, kol_matrix, ai_kol_analysis, share_of_platform, competitive_brand_labels) | Satu dokumen per `instanceId` per collection; field `items` (array) atau field langsung untuk feature_visibility & competitive_brand_labels. Opsional `snapshotAt` untuk historis. |
| `naradai_schedulers` | `schedulers` | Satu dokumen per scheduler; `schedulerId` = key di object lama. |
| (Form) Project Config | `project_configs` | Satu dokumen per `instanceId`. |
| (Hardcoded) INSTANCES | `instances` | Satu dokumen per instance. |
| `naradai_current_instance` | Tetap localStorage atau `user_preferences` | Preferensi UI. |
| `naradai_auth` | Tetap localStorage atau nanti `users` + session | Fase pertama bisa tidak pindah. |

---

## 6. Contoh Skema Mongoose (referensi)

```js
// instances
const InstanceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// project_configs
const ProjectConfigSchema = new Schema({
  instanceId: { type: String, required: true, unique: true },
  project: Object,
  data_sources: Object,
  localization: Object,
  content: Object,
  schedule: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// schedulers
const SchedulerSchema = new Schema({
  schedulerId: { type: String, required: true, unique: true },
  instanceId: { type: String, required: true, index: true },
  config: Object,
  startTime: String,
  endTime: String,
  days: Number,
  createdAt: Date,
  lastTriggered: Date,
  triggerCount: Number,
  isActive: Boolean,
  updatedAt: { type: Date, default: Date.now },
});

// Pola umum: satu collection per chart (dengan field "items")
// Contoh: stats_overview, priority_actions, sentiment_trends, dll.
const ChartDocSchema = new Schema({
  instanceId: { type: String, required: true, index: true },
  snapshotAt: { type: Date, default: Date.now },
  items: [Object],   // array of StatItem, PriorityActionItem, SentimentTrendItem, dll.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
// Gunakan model terpisah per collection: mongoose.model('StatsOverview', ChartDocSchema, 'stats_overview');

// feature_visibility (tanpa "items", field boolean per fitur)
const FeatureVisibilitySchema = new Schema({
  instanceId: { type: String, required: true, unique: true },
  statsOverview: Boolean,
  actionRecommendations: Boolean,
  outletSatisfaction: Boolean,
  risksOpportunities: Boolean,
  competitiveAnalysis: Boolean,
  recentInsights: Boolean,
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'feature_visibility' });

// competitive_brand_labels (satu doc per instance, label string)
const CompetitiveBrandLabelsSchema = new Schema({
  instanceId: { type: String, required: true, unique: true },
  yourBrand: String,
  competitorA: String,
  competitorB: String,
  competitorC: String,
  competitorD: String,
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'competitive_brand_labels' });
```

---

Dokumen ini bisa dipakai sebagai acuan satu sumber kebenaran untuk **analisis data** dan **migrasi ke MongoDB**; penyesuaian kecil (nama field, index tambahan) bisa dilakukan sesuai konvensi backend yang dipakai.
