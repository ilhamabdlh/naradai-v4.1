# Analisis & Desain Database – NaradAI v4

Dokumen ini merangkum hasil analisis data hardcoded di project naradai-v4 dan usulan struktur database (collection/table) beserta rekomendasi NoSQL vs MySQL.

---

## 1. Sumber Data yang Dianalisis

| Sumber | Lokasi | Penyimpanan Saat Ini |
|--------|--------|----------------------|
| **Instances** | `src/lib/instances.ts` | Hardcoded array |
| **Dashboard Content** | `src/lib/dashboard-content-types.ts` + `initial-data.ts` | localStorage per instance (`naradai_dashboard_content_{instanceId}`) |
| **Project Config** | `src/lib/ai-analysis-service.ts` (ProjectConfigPayload) | Form state + dikirim ke API |
| **Schedulers** | `src/lib/scheduler-service.ts` | localStorage (`naradai_schedulers`) |

---

## 2. Entity & Struktur Data

### 2.1 Instance (Proyek/Brand)
- `id` (string), `name` (string)
- Contoh: Bukalapak, Kapal API

### 2.2 Project Config (Konfigurasi per instance)
- **project**: project_id, project_name, status
- **data_sources**: platforms[], competitors[]
  - Setiap platform: name, query (include_keywords, exclude_keywords, exact_match, fuzzy_match, synonyms)
- **localization**: languages[]
- **content**: content_types[]
- **schedule**: start_time, end_time, backfill.days, retry_policy

### 2.3 Scheduler
- projectId, config (ProjectConfigPayload), startTime, endTime, days, isActive, lastTriggered, triggerCount, createdAt

### 2.4 Dashboard Content Store (satu “snapshot” per instance, bisa per waktu)
- **featureVisibility**: object (boolean per fitur)
- **statsOverview**: array (id, label, value, description, icon)
- **priorityActions**: array (priority, title, description, impact, effort, recommendation, category, quadrantColor, relatedIssues, metrics, sourceContent[])
- **outletSatisfaction**: array (id, name, location, status, satisfaction, issues[], coords)
- **risks**: array (id, title, description, severity, probability, impact, trend, supportingContents, indicators[], mitigation[], sourceContent[])
- **opportunities**: array (id, title, description, potential, confidence, timeframe, category, trend, supportingContents, metrics, recommendations[], sourceContent[])
- **competitiveIssues**: array (id, issue, category, yourSentiment, competitorMedianSentiment, yourMentions, competitorMedianMentions, relativeSentiment, relativeMentions)
- **competitiveKeyInsights**: array (id, type, title, description, bullets[])
- **whatsHappeningSentimentTrends**: array (date, positive, negative, neutral)
- **whatsHappeningKeyEvents**: array (id, date, title, description)
- **whatsHappeningTopTopics**: array (topic, mentions, sentiment)
- **whatsHappeningAITopicAnalysis**: array (id, type, title, description)
- **whatsHappeningTopicTrendsData**: array of rows (date + dynamic topic keys)
- **whatsHappeningAITrendAnalysis**: array (id, type, title, description)
- **whatsHappeningWordCloud**: array (text, weight, sentiment)
- **whatsHappeningClusters**: array (id, theme, size, sentiment, trend, keywords[])
- **whatsHappeningHashtags**: array (id, tag, conversations, likes, comments)
- **whatsHappeningAccounts**: array (id, name, handle, platform, followers, conversations, likes, replies)
- **whatsHappeningContents**: array (id, title, platform, author, likes, comments)
- **whatsHappeningKOLMatrix**: array (id, name, followers, positivity, engagement, color, category)
- **whatsHappeningAIKOLAnalysis**: array (id, type, title, description)
- **whatsHappeningShareOfPlatform**: array (date, twitter, youtube, reddit, instagram, facebook, tiktok)
- **competitiveMatrixItems**: array (id, name, mentions, positivePercentage, size, color)
- **competitiveQuadrantAnalysis**: array (id, label, brands, note)
- **competitiveSentimentScores** / **competitiveVolumeOfMentions**: array (issue, yourBrand, competitorA–D)
- **competitiveShareOfVoice**: array (date, yourBrand, competitorA–D)

---

## 3. Opsi Desain: Collections (NoSQL) vs Tables (MySQL)

### 3.1 Opsi A – NoSQL (MongoDB)

**Daftar collection yang disarankan:**

| No | Collection | Deskripsi | Contoh field kunci |
|----|------------|-----------|--------------------|
| 1 | **instances** | Daftar proyek/brand | _id, name, createdAt |
| 2 | **project_configs** | Konfigurasi ingestion per instance | instanceId, project{}, data_sources{}, localization{}, content{}, schedule{}, updatedAt |
| 3 | **schedulers** | Jadwal trigger ingestion | instanceId, config{}, startTime, endTime, days, isActive, lastTriggered, triggerCount, createdAt |
| 4 | **dashboard_snapshots** | Satu dokumen = satu snapshot dashboard penuh per instance (bisa per waktu) | instanceId, snapshotAt, featureVisibility, statsOverview[], priorityActions[], outletSatisfaction[], risks[], opportunities[], competitiveIssues[], competitiveKeyInsights[], whatsHappeningSentimentTrends[], whatsHappeningKeyEvents[], whatsHappeningTopTopics[], whatsHappeningAITopicAnalysis[], whatsHappeningTopicTrendsData[], whatsHappeningAITrendAnalysis[], whatsHappeningWordCloud[], whatsHappeningClusters[], whatsHappeningHashtags[], whatsHappeningAccounts[], whatsHappeningContents[], whatsHappeningKOLMatrix[], whatsHappeningAIKOLAnalysis[], whatsHappeningShareOfPlatform[], competitiveMatrixItems[], competitiveQuadrantAnalysis[], competitiveSentimentScores[], competitiveVolumeOfMentions[], competitiveShareOfVoice[] |

**Alternatif (normalisasi lebih banyak):**  
Bisa pecah `dashboard_snapshots` menjadi banyak collection (mis. `sentiment_trends`, `key_events`, `top_topics`, dll.) dengan `instanceId` + `snapshotAt` sebagai referensi. Untuk fase awal dan kesamaan dengan struktur frontend saat ini, **satu collection dashboard_snapshots** lebih sederhana dan cocok.

---

### 3.2 Opsi B – MySQL (Relational)

**Daftar table yang disarankan:**

| No | Table | Deskripsi |
|----|-------|------------|
| 1 | **instances** | id (PK), name, created_at |
| 2 | **project_configs** | id (PK), instance_id (FK), project_id, project_name, status, created_at, updated_at |
| 3 | **platform_queries** | id (PK), project_config_id (FK), platform_name, include_keywords (JSON), exclude_keywords (JSON), exact_match, fuzzy_match, synonyms (JSON) |
| 4 | **config_competitors** | id (PK), project_config_id (FK), competitor_name |
| 5 | **config_languages** | id (PK), project_config_id (FK), language_code |
| 6 | **config_content_types** | id (PK), project_config_id (FK), content_type |
| 7 | **schedulers** | id (PK), instance_id (FK), config_snapshot (JSON), start_time, end_time, days, is_active, last_triggered, trigger_count, created_at |
| 8 | **dashboard_snapshots** | id (PK), instance_id (FK), snapshot_at, feature_visibility (JSON) |
| 9 | **stats_overview** | id (PK), snapshot_id (FK), item_id, label, value, description, icon, sort_order |
| 10 | **priority_actions** | id (PK), snapshot_id (FK), priority, title, description, impact, effort, recommendation, category, quadrant_color, related_issues (JSON), metrics (JSON), source_content (JSON), created_at, expired_at |
| 11 | **outlet_satisfaction** | id (PK), snapshot_id (FK), name, location, status, satisfaction, issues (JSON), coords_x, coords_y |
| 12 | **risks** | id (PK), snapshot_id (FK), title, description, severity, probability, impact, trend, supporting_contents, indicators (JSON), mitigation (JSON), source_content (JSON) |
| 13 | **opportunities** | id (PK), snapshot_id (FK), title, description, potential, confidence, timeframe, category, trend, supporting_contents, metrics (JSON), recommendations (JSON), source_content (JSON) |
| 14 | **competitive_issues** | id (PK), snapshot_id (FK), issue, category, your_sentiment, competitor_median_sentiment, your_mentions, competitor_median_mentions, relative_sentiment, relative_mentions |
| 15 | **competitive_key_insights** | id (PK), snapshot_id (FK), type, title, description, bullets (JSON) |
| 16 | **sentiment_trends** | id (PK), snapshot_id (FK), date, positive, negative, neutral |
| 17 | **key_events** | id (PK), snapshot_id (FK), date, title, description |
| 18 | **top_topics** | id (PK), snapshot_id (FK), topic, mentions, sentiment |
| 19 | **ai_topic_analysis** | id (PK), snapshot_id (FK), type, title, description |
| 20 | **topic_trends_rows** | id (PK), snapshot_id (FK), date, payload (JSON) |
| 21 | **ai_trend_analysis** | id (PK), snapshot_id (FK), type, title, description |
| 22 | **word_cloud** | id (PK), snapshot_id (FK), text, weight, sentiment |
| 23 | **conversation_clusters** | id (PK), snapshot_id (FK), theme, size, sentiment, trend, keywords (JSON) |
| 24 | **top_hashtags** | id (PK), snapshot_id (FK), tag, conversations, likes, comments |
| 25 | **top_accounts** | id (PK), snapshot_id (FK), name, handle, platform, followers, conversations, likes, replies |
| 26 | **top_contents** | id (PK), snapshot_id (FK), title, platform, author, likes, comments |
| 27 | **kol_matrix** | id (PK), snapshot_id (FK), name, followers, positivity, engagement, color, category |
| 28 | **ai_kol_analysis** | id (PK), snapshot_id (FK), type, title, description |
| 29 | **share_of_platform** | id (PK), snapshot_id (FK), date, twitter, youtube, reddit, instagram, facebook, tiktok |
| 30 | **competitive_matrix_items** | id (PK), snapshot_id (FK), name, mentions, positive_percentage, size, color |
| 31 | **quadrant_analysis** | id (PK), snapshot_id (FK), label, brands, note |
| 32 | **competitive_heatmap_rows** | id (PK), snapshot_id (FK), issue, your_brand, competitor_a, competitor_b, competitor_c, competitor_d |
| 33 | **share_of_voice_rows** | id (PK), snapshot_id (FK), date, your_brand, competitor_a, competitor_b, competitor_c, competitor_d |

---

## 4. Rekomendasi: NoSQL vs MySQL

### Rekomendasi: **NoSQL (MongoDB)** untuk fase awal NaradAI v4

**Alasan utama:**

1. **Kesesuaian dengan model data saat ini**  
   Dashboard content di frontend dan di API sudah berupa satu objek besar per instance (array-array di dalam satu “store”). Satu dokumen `dashboard_snapshots` per snapshot sangat mirip dengan struktur itu, sehingga migrasi dari localStorage/API ke DB lebih mudah dan risiko salah mapping kecil.

2. **Schema fleksibel**  
   Ada field dinamis (mis. `TopicTrendsOverTimeRow` dengan key topic berubah-ubah, competitor A–D, dll.). Di MongoDB bisa disimpan sebagai object/array tanpa perlu ubah schema; di MySQL akan banyak kolom JSON atau banyak tabel tambahan.

3. **Volume dan pola akses**  
   Pola akses yang dominan: “ambil satu snapshot terakhir (atau per tanggal) untuk instance X”. Itu sangat cocok dengan satu dokumen per snapshot. Tidak ada kebutuhan join antar banyak entity dalam satu query dashboard.

4. **Kecepatan implementasi**  
   Satu collection untuk dashboard = satu read (atau sedikit) untuk halaman dashboard. Tidak perlu maintain puluhan tabel dan migration untuk setiap penambahan widget/field.

5. **History snapshot**  
   Setiap kali ingestion/update, cukup insert dokumen baru ke `dashboard_snapshots` dengan `instanceId` + `snapshotAt`. Query “latest by instance” atau “by date range” tetap sederhana (index pada `instanceId` + `snapshotAt`).

**Kapan MySQL lebih masuk akal:**

- Banyak laporan cross-instance, agregasi kompleks, atau join berat (mis. bandingkan risks antar 10 brand dengan filter rumit).
- Requirement compliance/audit yang sangat ketat terhadap normalisasi dan relational integrity.
- Tim sudah sangat terbiasa dengan SQL dan tidak ingin maintain document model.

**Kesimpulan:**  
Untuk naradai-v4, **mulai dengan NoSQL (MongoDB)** dan 4 collection: **instances**, **project_configs**, **schedulers**, **dashboard_snapshots**. Jika nanti muncul kebutuhan reporting/analytics yang kuat, bisa tambah layer (view, aggregate table, atau data warehouse) di sisi MySQL/Postgres tanpa harus mengubah model penyimpanan utama dashboard.

---

## 5. Ringkasan List Collection (Rekomendasi NoSQL)

| No | Collection | Keterangan |
|----|------------|------------|
| 1 | **instances** | Daftar proyek/brand (id, name) |
| 2 | **project_configs** | Konfigurasi project + data sources + schedule, satu dokumen per instance (atau per project_id) |
| 3 | **schedulers** | Jadwal dan state scheduler (instanceId, config, startTime, isActive, lastTriggered, dll.) |
| 4 | **dashboard_snapshots** | Satu snapshot lengkap dashboard per instance per waktu (semua array & object dari DashboardContentStore) |

Total: **4 collection** untuk memenuhi kebutuhan saat ini dan migrasi dari data hardcoded/localStorage.
