# Migrasi Data NaradAI v4 → MongoDB

Script dan panduan untuk memindahkan data dari **localStorage** ke **MongoDB** (satu collection per chart/content).

---

## Persiapan

1. **MongoDB** sudah jalan (local atau Atlas).
2. **Export data** dari browser (lihat langkah 1).
3. Di folder ini: `npm install` (untuk dependency `mongodb`).

---

## Langkah 1: Export dari browser

Data ada di localStorage aplikasi. Untuk export:

### Opsi A: Halaman export (disarankan)

1. Jalankan aplikasi: dari root repo `npm run dev`.
2. Agar halaman export punya akses ke localStorage yang sama, **salin** file `export-from-browser.html` ke folder **`public/`** aplikasi:
   ```bash
   cp scripts/migrate-to-mongodb/export-from-browser.html public/
   ```
3. Buka di browser: **http://localhost:5173/export-from-browser.html**
4. Klik **"Export & Download JSON"**. File `naradai-export-YYYY-MM-DD.json` akan terunduh.
5. Pindahkan file tersebut ke folder `scripts/migrate-to-mongodb/` (atau catat path-nya untuk langkah 2).

### Opsi B: Snippet di Console

1. Buka aplikasi di browser (mis. http://localhost:5173).
2. Buka DevTools → tab **Console**.
3. Paste kode berikut, lalu Enter:

```javascript
(function () {
  var DASHBOARD_PREFIX = 'naradai_dashboard_content_';
  var SCHEDULER_KEY = 'naradai_schedulers';
  var LEGACY_KEY = 'naradai_dashboard_content';
  var DEFAULT_INSTANCES = [
    { id: 'bukalapak', name: 'Bukalapak' },
    { id: 'kapal_api_12_19_feb_2026', name: 'Kapal API' }
    // tambahkan instance lain jika perlu
  ];
  var dashboardContent = {};
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (!key || key.indexOf('naradai_') !== 0) continue;
    if (key === SCHEDULER_KEY) continue;
    if (key === LEGACY_KEY) {
      try { dashboardContent['bukalapak'] = JSON.parse(localStorage.getItem(key)); } catch (e) {}
      continue;
    }
    if (key.indexOf(DASHBOARD_PREFIX) === 0) {
      var id = key.slice(DASHBOARD_PREFIX.length);
      try { dashboardContent[id] = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    }
  }
  var schedulers = {};
  try { schedulers = JSON.parse(localStorage.getItem(SCHEDULER_KEY) || '{}'); } catch (e) {}
  var payload = {
    exportedAt: new Date().toISOString(),
    instances: DEFAULT_INSTANCES,
    schedulers: schedulers,
    dashboardContent: dashboardContent
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'naradai-export-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  console.log('Export selesai. File sudah diunduh.');
})();
```

4. File JSON akan terunduh. Simpan di `scripts/migrate-to-mongodb/` atau catat path-nya.

---

## Langkah 2: Import ke MongoDB

Dari folder **`scripts/migrate-to-mongodb/`**:

```bash
npm install
export MONGODB_URI="mongodb://localhost:27017"
export EXPORT_JSON_PATH="./naradai-export-2026-02-13.json"   # sesuaikan nama file
node import-to-mongodb.mjs
```

- **MONGODB_URI** (wajib): connection string MongoDB (local atau Atlas).
- **MONGODB_DB** (opsional): nama database, default `naradai_v4`.
- **EXPORT_JSON_PATH** (opsional): path ke file JSON export. Default: `./naradai-export-YYYY-MM-DD.json` (tanggal hari ini).

Setelah berhasil, di MongoDB akan ada:

- Collection **instances** (satu doc per instance).
- Collection **schedulers** (satu doc per scheduler).
- **27 collection** dashboard: `feature_visibility`, `stats_overview`, `priority_actions`, `outlet_satisfaction`, `risks`, `opportunities`, `competitive_issues`, `competitive_key_insights`, `sentiment_trends`, `key_events`, `top_topics`, `ai_topic_analysis`, `topic_trends_data`, `ai_trend_analysis`, `word_cloud`, `conversation_clusters`, `hashtags`, `top_accounts`, `top_contents`, `kol_matrix`, `ai_kol_analysis`, `share_of_platform`, `competitive_matrix_items`, `competitive_quadrant_analysis`, `competitive_sentiment_scores`, `competitive_volume_mentions`, `competitive_share_of_voice`, `competitive_brand_labels`.

---

## Dokumen terkait

- **`docs/MONGODB_MIGRATION_ANALYSIS.md`** – Analisis struktur data & skema MongoDB (satu collection per chart).
- **`docs/MIGRATION_FLOW_AND_CONCEPT.md`** – Flow dan konsep migrasi (siapa melakukan apa, urutan, kebijakan overwrite).
