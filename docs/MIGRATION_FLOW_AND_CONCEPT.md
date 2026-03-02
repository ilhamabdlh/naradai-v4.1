# Flow & Konsep Migrasi Data ke MongoDB – NaradAI v4

Dokumen ini menjelaskan **alur migrasi** dari localStorage ke MongoDB dan **konsep** di baliknya.

---

## 1. Ringkasan Konsep

- **Sumber:** Data saat ini ada di **localStorage** (per browser) dan di **kode** (instances, initial-data).
- **Tujuan:** Semua data tersebut pindah ke **MongoDB** dengan model **satu collection per chart/content** untuk dashboard.
- **Cara:** Migrasi **satu arah** (export → import): kita tidak mengubah localStorage dari backend; setelah backend + API siap, frontend akan **baca/tulis dari API** (yang baca/tulis MongoDB). Data lama di localStorage bisa di-export sekali lalu di-import ke MongoDB.

---

## 2. Alur Migrasi (Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASE 0: Persiapan (sebelum migrasi)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Pastikan MongoDB sudah jalan (local atau Atlas).                         │
│  2. Buat database (mis. naradai_v4).                                         │
│  3. (Opsional) Backup localStorage: export dari browser → file JSON.         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASE 1: Export data dari browser (satu kali)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Buka aplikasi NaradAI v4 di browser (yang punya data).                    │
│  • Buka halaman export: salin export-from-browser.html ke public/, lalu     │
│    buka http://localhost:5173/export-from-browser.html (atau jalankan      │
│    snippet export di Console saat di origin yang sama).                     │
│  • Download file JSON (naradai-export-YYYY-MM-DD.json).                      │
│  • Simpan file ini; akan dipakai di Fase 2.                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASE 2: Import ke MongoDB (satu kali)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Dari repo: cd scripts/migrate-to-mongodb                                 │
│  • npm install   (hanya sekali, untuk dependency mongodb)                    │
│  • Set env: MONGODB_URI dan (opsional) EXPORT_JSON_PATH                      │
│  • node import-to-mongodb.mjs                                               │
│  • Script akan:                                                             │
│    - Baca file export JSON                                                   │
│    - Insert ke collection instances                                          │
│    - Insert ke collection schedulers (satu doc per scheduler)                │
│    - Untuk tiap instanceId di dashboardContent:                             │
│      - Pecah objek dashboard ke 27 collection (feature_visibility,          │
│        stats_overview, priority_actions, ... competitive_brand_labels)       │
│      - Satu dokumen per instanceId per collection                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FASE 3: Backend + API memakai MongoDB                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Backend (Node/Express/Fastify) connect ke MongoDB.                       │
│  • API GET/PUT per collection by instanceId (atau GET aggregate dashboard).   │
│  • Frontend diganti: loadDashboardContent/saveDashboardContent panggil API.  │
│  • Setelah itu, sumber kebenaran = MongoDB; localStorage tidak dipakai       │
│    untuk dashboard/schedulers/instances.                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Struktur File Export (JSON)

File yang di-download dari browser punya format:

```json
{
  "exportedAt": "2026-02-13T10:00:00.000Z",
  "instances": [
    { "id": "bukalapak", "name": "Bukalapak" },
    { "id": "kapal_api_12_19_feb_2026", "name": "Kapal API" }
  ],
  "schedulers": {
    "scheduler_ProjectName_1234567890": {
      "projectId": "scheduler_...",
      "config": { "project": {...}, "data_sources": {...}, ... },
      "startTime": "...",
      "endTime": "...",
      "days": 7,
      "createdAt": "...",
      "lastTriggered": null,
      "triggerCount": 0,
      "isActive": true
    }
  },
  "dashboardContent": {
    "bukalapak": {
      "featureVisibility": { "statsOverview": true, ... },
      "statsOverview": [...],
      "priorityActions": [...],
      "outletSatisfaction": [...],
      "risks": [...],
      "opportunities": [...],
      "competitiveIssues": [...],
      "competitiveKeyInsights": [...],
      "whatsHappeningSentimentTrends": [...],
      "whatsHappeningKeyEvents": [...],
      "whatsHappeningTopTopics": [...],
      "whatsHappeningAITopicAnalysis": [...],
      "whatsHappeningTopicTrendsData": [...],
      "whatsHappeningAITrendAnalysis": [...],
      "whatsHappeningWordCloud": [...],
      "whatsHappeningClusters": [...],
      "whatsHappeningHashtags": [...],
      "whatsHappeningAccounts": [...],
      "whatsHappeningContents": [...],
      "whatsHappeningKOLMatrix": [...],
      "whatsHappeningAIKOLAnalysis": [...],
      "whatsHappeningShareOfPlatform": [...],
      "competitiveMatrixItems": [...],
      "competitiveQuadrantAnalysis": [...],
      "competitiveSentimentScores": [...],
      "competitiveVolumeOfMentions": [...],
      "competitiveShareOfVoice": [...],
      "competitiveBrandLabels": { "yourBrand": "...", ... }
    },
    "kapal_api_12_19_feb_2026": { ... }
  }
}
```

- **instances:** bisa dari export (jika kita baca dari kode) atau dari hardcoded; script export bisa mengisi dari daftar instance yang punya `naradai_dashboard_content_{id}`.
- **schedulers:** object key = schedulerId, value = SchedulerState.
- **dashboardContent:** key = instanceId, value = objek lengkap `DashboardContentStore` (satu key per instance yang punya data di localStorage).

---

## 4. Mapping Dashboard → 27 Collection

Script import akan memecah setiap `dashboardContent[instanceId]` menjadi:

| Key di DashboardContentStore       | Collection MongoDB        | Bentuk dokumen                          |
|------------------------------------|---------------------------|-----------------------------------------|
| `featureVisibility`                 | `feature_visibility`      | Satu doc: instanceId + boolean per fitur |
| `statsOverview`                    | `stats_overview`          | Doc: instanceId, snapshotAt, items[]    |
| `priorityActions`                  | `priority_actions`       | Doc: instanceId, snapshotAt, items[]    |
| `outletSatisfaction`               | `outlet_satisfaction`    | Doc: instanceId, snapshotAt, items[]    |
| `risks`                            | `risks`                  | Doc: instanceId, snapshotAt, items[]    |
| `opportunities`                    | `opportunities`          | Doc: instanceId, snapshotAt, items[]    |
| `competitiveIssues`                | `competitive_issues`     | Doc: instanceId, snapshotAt, items[]    |
| `competitiveKeyInsights`           | `competitive_key_insights`| Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningSentimentTrends`    | `sentiment_trends`       | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningKeyEvents`          | `key_events`             | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningTopTopics`          | `top_topics`             | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningAITopicAnalysis`    | `ai_topic_analysis`      | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningTopicTrendsData`    | `topic_trends_data`      | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningAITrendAnalysis`    | `ai_trend_analysis`      | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningWordCloud`          | `word_cloud`             | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningClusters`           | `conversation_clusters`  | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningHashtags`           | `hashtags`               | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningAccounts`           | `top_accounts`          | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningContents`           | `top_contents`          | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningKOLMatrix`           | `kol_matrix`             | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningAIKOLAnalysis`      | `ai_kol_analysis`        | Doc: instanceId, snapshotAt, items[]    |
| `whatsHappeningShareOfPlatform`    | `share_of_platform`      | Doc: instanceId, snapshotAt, items[]    |
| `competitiveMatrixItems`           | `competitive_matrix_items`| Doc: instanceId, snapshotAt, items[]    |
| `competitiveQuadrantAnalysis`      | `competitive_quadrant_analysis` | Doc: instanceId, snapshotAt, items[] |
| `competitiveSentimentScores`       | `competitive_sentiment_scores`  | Doc: instanceId, snapshotAt, items[] |
| `competitiveVolumeOfMentions`     | `competitive_volume_mentions`   | Doc: instanceId, snapshotAt, items[] |
| `competitiveShareOfVoice`         | `competitive_share_of_voice`    | Doc: instanceId, snapshotAt, items[] |
| `competitiveBrandLabels`          | `competitive_brand_labels`      | Satu doc: instanceId + yourBrand, competitorA–D |

---

## 5. Kebijakan Idempotensi & Overwrite

- **instances:** Script import bisa **upsert** by `id` (replace jika sudah ada).
- **schedulers:** Upsert by `schedulerId` (atau insert saja jika key unik).
- **Dashboard (27 collection):** Untuk satu instanceId, script bisa **replace satu dokumen** per collection (delete + insert, atau replaceOne dengan filter `instanceId`). Dengan begitu, menjalankan import ulang dengan file export terbaru akan **menimpa** data lama untuk instance tersebut.

Historis (banyak snapshot per instance dengan `snapshotAt`) bisa ditambah nanti; untuk migrasi pertama, **satu dokumen per instanceId per collection** cukup.

---

## 6. File yang Terlibat

| File | Fungsi |
|------|--------|
| `docs/MONGODB_MIGRATION_ANALYSIS.md` | Analisis struktur & skema MongoDB (satu collection per chart). |
| `docs/MIGRATION_FLOW_AND_CONCEPT.md` | Dokumen ini: flow dan konsep migrasi. |
| `scripts/migrate-to-mongodb/README.md` | Cara menjalankan export & import. |
| `scripts/migrate-to-mongodb/export-from-browser.html` | Halaman untuk export localStorage → JSON (buka di browser). |
| `scripts/migrate-to-mongodb/import-to-mongodb.mjs` | Script Node: baca JSON export, insert ke MongoDB (27 collection + instances + schedulers). |
| `scripts/migrate-to-mongodb/export-payload.example.json` | Contoh struktur file export (referensi). |

---

## 7. Checklist Migrasi

- [ ] MongoDB jalan & database dibuat.
- [ ] Export dari browser: download `naradai-export-*.json`.
- [ ] `npm install` di `scripts/migrate-to-mongodb`.
- [ ] Set `MONGODB_URI` (dan optional `EXPORT_JSON_PATH`).
- [ ] Jalankan `node import-to-mongodb.mjs`.
- [ ] Cek di MongoDB: collections instances, schedulers, feature_visibility, stats_overview, … terisi.
- [ ] Backend API baca/tulis dari MongoDB.
- [ ] Frontend ganti ke API; hentikan pemakaian localStorage untuk data yang sudah bermigrasi.

Setelah itu, migrasi data selesai; flow selanjutnya adalah penggunaan normal lewat API + MongoDB.
