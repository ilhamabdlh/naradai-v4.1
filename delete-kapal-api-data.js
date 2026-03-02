// Script untuk menghapus data instance "kapal-api" dari localStorage
// Jalankan script ini di browser console saat aplikasi sedang berjalan

const instanceId = "kapal-api";
const storageKey = `naradai_dashboard_content_${instanceId}`;

// Hapus dari localStorage
localStorage.removeItem(storageKey);

console.log(`✅ Data untuk instance "${instanceId}" telah dihapus dari localStorage`);
console.log(`Key yang dihapus: ${storageKey}`);

// Verifikasi penghapusan
const remaining = localStorage.getItem(storageKey);
if (remaining === null) {
  console.log("✅ Verifikasi: Data berhasil dihapus");
} else {
  console.log("⚠️ Verifikasi: Data masih ada (mungkin ada masalah)");
}
