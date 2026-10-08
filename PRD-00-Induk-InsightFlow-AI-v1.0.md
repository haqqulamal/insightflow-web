# PRD-00: Induk, InsightFlow AI

**AI Business Analyst & Forecasting untuk UMKM Indonesia**

| | |
|---|---|
| Dokumen | PRD-00 Induk (strategi, bisnis, kontrak antarmuka) |
| Versi | 1.0 (penomoran dimulai ulang; draf sebelumnya belum dipakai) |
| Status | Siap validasi & eksekusi Tahap 0 |
| Nama kerja | InsightFlow AI (belum final; cek merek dagang & domain, lihat §19) |
| Bahasa produk | Bahasa Indonesia (utama), English (sekunder) |
| Platform | Web application |
| Dokumen anak | PRD-01 Web & Platform, PRD-02 AI |

> **Catatan angka:** angka target, biaya, harga, dan kuota di seluruh seri PRD adalah **hipotesis awal** (ditandai 🔸) yang harus divalidasi lewat pilot dan pengukuran riil.

---

## 1. Ringkasan & Peta Dokumen

### 1.1 Tiga dokumen, satu produk

| Dokumen | Isi | Pembaca utama |
|---|---|---|
| **PRD-00 Induk** (ini) | Visi, ICP, kompetitor, paket & harga, metrik, biaya, **kontrak antarmuka AI–Web**, kebijakan keamanan/privasi, timeline, risiko | Pemilik produk, investor, seluruh tim |
| **PRD-01 Web & Platform** | UI & halaman, onboarding, auth/workspace, dataset & ingestion, billing & langganan, jobs, API aplikasi, keamanan platform | Frontend, backend aplikasi, desain |
| **PRD-02 AI** | AI Analyst, semantic layer, **RAG bertahap**, keamanan SQL & guardrails, forecasting, evaluasi, biaya AI | AI/ML, data engineer |

### 1.2 Aturan agar tiga dokumen tidak saling menyimpang

1. **Satu sumber kebenaran per topik.** Strategi, paket, harga, metrik bisnis, dan **kontrak antarmuka AI–Web (§11)** hanya didefinisikan di PRD-00. Dokumen anak merujuk, tidak menyalin.
2. Perubahan yang menyentuh §11 (skema respons, kode galat, event) **wajib melalui PRD-00**, dinaikkan versinya, lalu diselaraskan di PRD-01 dan PRD-02.
3. Referensi silang memakai format `[PRD-01 §x]`, `[PRD-02 §x]`, `[PRD-00 §x]`.
4. Penanda tahap seragam: **[T0]** Alpha, **[T1]** MVP Analyst, **[T2]** Forecasting & Langganan Pro, **[Later]** setelah itu.
5. Bila ada konflik antar dokumen, urutan prioritas: PRD-00 > dokumen anak yang memiliki topik tersebut.

### 1.3 Ringkasan keputusan inti

- **Satu ICP** untuk MVP: pemilik/tim operasional UMKM retail & e-commerce di Indonesia (§4).
- **Wedge:** Bahasa Indonesia, template export marketplace, format Rupiah, kalender Indonesia (§5).
- **Dua paket saat peluncuran:** Free dan Pro (§8). Bisnis & Enterprise menyusul setelah product-market fit.
- **MVP bertahap** agar risiko terbesar (akurasi AI Analyst) divalidasi lebih dulu (§7).
- **RAG dirancang penuh tetapi dibangun bertahap**, tiap tahap harus membuktikan peningkatan akurasi pada golden set sebelum diaktifkan (PRD-02 §6).

---

## 2. Visi & Positioning

### 2.1 Visi

Membuat pemilik dan tim operasional UMKM mampu **memahami, memprediksi, dan memutuskan** berdasarkan data mereka sendiri tanpa analis data dan tanpa SQL.

### 2.2 Tagline

> **Tanya datamu. Pahami bisnismu. Prediksi langkah berikutnya.**

Alternatif: *Dari data bisnis menjadi keputusan.*

### 2.3 Positioning

Untuk **pemilik dan tim operasional UMKM retail dan e-commerce di Indonesia** yang datanya tersebar di Excel/CSV dan export marketplace, InsightFlow AI adalah **analis data AI berbahasa Indonesia** yang menjawab pertanyaan bisnis dengan angka yang bisa diverifikasi, lalu memproyeksikan penjualan ke depan. Berbeda dari BI tool umum, tidak perlu setup dashboard atau keahlian SQL. Berbeda dari chatbot umum, setiap angka berasal dari komputasi deterministik dan bisa diaudit.

### 2.4 Tiga pertanyaan inti

```text
APA yang terjadi?  →  BAGAIMANA ke depan?  →  APA yang harus dilakukan?
   (Analyst)             (Forecast)              (Rekomendasi)
```

---

## 3. Masalah & Hipotesis

### 3.1 Masalah

1. Data ada, tetapi keputusan masih berdasarkan firasat. Data tersebar di Excel, export marketplace, atau sistem kasir.
2. Pemilik UMKM tidak punya analis; menyewa analis atau konsultan tidak ekonomis.
3. Dashboard BI menuntut setup, model data, dan pemeliharaan.
4. Forecasting butuh data scientist, dan forecast tanpa backtesting menyesatkan.
5. LLM yang diberi akses data mentah sering **mengarang angka** atau salah menafsirkan istilah bisnis.

### 3.2 Hipotesis kunci (harus dibuktikan)

| # | Hipotesis | Cara validasi |
|---|---|---|
| H1 | Seller UMKM mau mengunggah data ke tool baru bila hasil pertama muncul < 5 menit | Pilot: activation rate |
| H2 | Pertanyaan berbahasa Indonesia + template marketplace menaikkan akurasi dan adopsi dibanding tool generik | Perbandingan terhadap baseline generik |
| H3 | Pengguna mau membayar untuk forecast + laporan + volume pemakaian | Konversi Free→Pro, wawancara harga |
| H4 | Akurasi text-to-SQL ≥ 90% tercapai dengan semantic layer + few-shot pada skema marketplace | Golden set [PRD-02 §13] |
| H5 | RAG (few-shot, lalu schema/metric) menaikkan akurasi di atas baseline tanpa-RAG | A/B pada golden set [PRD-02 §6.9] |

---

## 4. Target Pengguna (ICP untuk MVP)

### 4.1 ICP utama

**Pemilik atau manajer operasional UMKM retail/e-commerce** dengan ciri:

- Omzet kira-kira Rp 50 juta sampai Rp 5 miliar per bulan 🔸
- Berjualan di marketplace (Shopee, Tokopedia, TikTok Shop) dan/atau toko sendiri
- Data berupa **export CSV/XLSX** dari marketplace, kasir, atau spreadsheet manual
- Tidak memiliki analis data penuh waktu

### 4.2 Persona

**Persona A, Pemilik toko (pengguna utama).** *"Penjualan saya turun bulan lalu, tapi saya tidak tahu kenapa."*
Butuh: jawaban sederhana, angka jelas, tindakan yang disarankan. Tidak ingin melihat SQL.

**Persona B, Staf operasional/admin (pengguna harian).** *"Saya harus bikin laporan mingguan dari Excel, makan waktu setengah hari."*
Butuh: pertanyaan cepat, ekspor hasil, laporan berulang.

**Persona C, Analis/freelancer (sekunder, fase berikutnya).** Ingin copilot dengan SQL yang bisa diperiksa dan diedit. Dilayani lewat fitur *Lihat SQL* (progressive disclosure), tidak diprioritaskan dalam desain MVP.

### 4.3 Di luar target (sengaja)

B2C individu, perusahaan besar (enterprise), dan tim data yang sudah memakai BI matang. Segmen ini dipertimbangkan setelah product-market fit di ICP.

---

## 5. Lanskap Kompetitor & Diferensiasi

> Peta awal; **wajib diverifikasi ulang** dengan mencoba produk pesaing langsung dan membaca pricing terbarunya sebelum dipakai untuk keputusan strategis atau materi investor.

### 5.1 Kategori pesaing

| Kategori | Contoh | Kekuatan mereka | Celah untuk kita |
|---|---|---|---|
| BI enterprise + AI | Power BI Copilot, Tableau, ThoughtSpot | Ekosistem, governance, skala | Mahal, setup berat, tidak ramah UMKM |
| AI data analyst (global) | Julius AI dan sejenisnya | Cepat, upload-and-ask | Tidak lokal (bahasa, format, marketplace), forecasting terbatas |
| BI open-source + AI | Metabase dan sejenisnya | Murah, fleksibel | Butuh setup & pemeliharaan teknis |
| Analitik bawaan marketplace | Dashboard seller center | Gratis, data langsung | Terkunci per platform, tidak lintas-channel, analisis bebas minim |
| Spreadsheet + chatbot umum | Excel/Sheets + LLM umum | Sudah dipakai semua orang | Tanpa jaminan akurasi, tanpa audit, risiko data bocor |

### 5.2 Diferensiasi (wedge), berurutan menurut kekuatan

1. **Lokal-first:** tanya-jawab Bahasa Indonesia, format Rp, kalender Indonesia (Lebaran, Harbolnas, tanggal kembar), pembayaran lokal.
2. **Template skema marketplace:** pemetaan otomatis kolom export Shopee/Tokopedia/TikTok Shop ke model data standar. Mengurangi ambiguitas dan menaikkan akurasi.
3. **Angka yang bisa diaudit:** setiap jawaban menyertakan sumber, filter, definisi metrik, dan SQL (tersembunyi secara default).
4. **Forecast yang jujur:** backtesting, selalu ada baseline, dan forecast ditahan bila tidak lebih baik dari baseline.
5. **Rekomendasi berbasis bukti**, berlabel Fakta / Inferensi / Rekomendasi.
6. **Belajar dari koreksi:** query yang diverifikasi pengguna menjadi contoh (few-shot) untuk pertanyaan serupa berikutnya (RAG, PRD-02 §6).

> Format kolom export marketplace berubah dari waktu ke waktu. Pemeliharaan template adalah biaya operasional berkelanjutan (risiko R6).

---

## 6. Prinsip Produk

1. **AI membantu, bukan mengarang.** Semua angka berasal dari komputasi deterministik (SQL, statistik, model forecast). LLM hanya untuk memahami maksud, merencanakan, memilih tool, dan menjelaskan.
2. **Bisa diverifikasi.** Pengguna dapat melihat sumber data, SQL, filter, definisi metrik, model, metrik evaluasi, dan interval prediksi.
3. **Jujur soal ketidakpastian.** Bila pertanyaan ambigu, AI **bertanya balik**. Bila data tidak cukup, AI **berkata tidak bisa**.
4. **Kontrol manusia.** Pengguna dapat mengoreksi definisi metrik, mengedit SQL, mengganti horizon, dan mengekspor hasil.
5. **Aman secara default.** Akses baca-saja, eksekusi di sandbox, data sensitif dimasking sebelum menyentuh LLM.
6. **Korelasi bukan kausalitas.** Insight "mengapa" disajikan sebagai dekomposisi kontributor.
7. **Sederhana dulu, tapi dirancang untuk tumbuh.** Komponen berat (RAG penuh, antrian besar, tracing terdistribusi) dibangun bertahap dan hanya diaktifkan bila terbukti memberi manfaat terukur.
8. **Tidak ada paywall yang menyandera kepercayaan.** Transparansi, keamanan, dan kepemilikan data tidak dikunci di balik paket (§8.2).

---

## 7. Strategi Rilis: MVP Bertahap

Risiko terbesar (akurasi AI Analyst) divalidasi lebih dulu sebelum membangun produk penuh.

### 7.1 Tahapan

| Tahap | Durasi 🔸 | Tujuan | Isi utama (per dokumen) |
|---|---|---|---|
| **Fase 0** Fondasi | 2 minggu | Repo, CI/CD, auth, DB, desain sistem dasar, harness evaluasi kosong | Web: PRD-01 §7, §21. AI: PRD-02 §13 (harness) |
| **Tahap 0** Alpha internal | 4 minggu | Membuktikan akurasi inti sebelum UI penuh | AI: pipeline analyst inti, golden set, RAG **R0** (baseline tanpa vektor). Web: upload + UI minimal |
| **Tahap 1** MVP Analyst | 9 minggu | Produk untuk pilot 10-20 UMKM | Web: auth, upload, template, profiling, UI analyst, simpan/ekspor, kuota Free. AI: semantic layer, klarifikasi, penolakan, feedback, RAG **R1** (few-shot) |
| **Pilot** | 4-6 minggu | Pembelajaran nyata, kalibrasi kuota & biaya | Peserta pilot diberi akses Pro manual |
| **Tahap 2** Forecasting & Langganan Pro | 8 minggu | Produk berbayar awal | AI: forecast, backtest, decomposition. Web: UI forecast, laporan, billing Pro. RAG **R2/R3** bila terbukti perlu |
| **Setelah itu** | bertahap | Anomali, koneksi DB, WhatsApp, tim & RBAC, what-if, Bisnis/Enterprise | Lihat §20 |

### 7.2 Gerbang antar tahap (go / no-go)

| Gerbang | Kriteria 🔸 |
|---|---|
| Tahap 0 → Tahap 1 | Execution success ≥ 90% dan result correctness ≥ 80% pada golden set |
| Tahap 1 → Pilot | Gerbang evaluasi golden set (PRD-02 §13.3) terpenuhi; tes keamanan lulus (injection, sandbox, isolasi tenant); dokumen privasi publik terbit |
| Pilot → Tahap 2 | Activation ≥ 60%; result correctness ≥ 90% pada pertanyaan nyata; ≥ 5 pengguna menyatakan akan membayar |
| Tahap 2 → Peluncuran berbayar | Forecast lolos kriteria backtest (PRD-02 §10); alur langganan lulus uji (PRD-01 §14); biaya per pengguna sesuai model margin (§10) |

### 7.3 Di luar scope MVP (tegas)

Aplikasi mobile, streaming real-time, banyak konektor database, SSO enterprise, agen otonom/multi-agent, model deep learning berat, UI training model kustom, inventory/stockout (butuh data stok), paket Bisnis/Enterprise, kode promo, referral, dan add-on kuota.

---

## 8. Paket Free & Pro, Harga & Aturan Langganan

Aturan bisnis ada di sini. Implementasi alur, UI, dan data model penagihan ada di [PRD-01 §14]; penegakan kuota sisi AI di [PRD-02 §14].

### 8.1 Prinsip monetisasi

1. **Free harus cukup untuk merasakan nilai inti:** satu pertanyaan bisnis terjawab benar dari data sendiri, tanpa kartu kredit.
2. **Batasi yang berbiaya, bukan yang membangun kepercayaan.** Yang dibatasi: pemakaian AI, komputasi forecast, penyimpanan, laporan.
3. **Tidak ada paywall di tengah proses.** Hasil yang sudah dibuat tidak disembunyikan; batas ditampilkan sebelum aksi baru dijalankan.
4. **Tidak ada dark pattern.** Pembatalan self-serve 2 klik; harga dan pajak jelas sebelum bayar.
5. **Data tidak disandera.** Turun paket tidak menghapus data (§8.5).
6. **Kuota ditegakkan di server**, dicatat per organisasi.

### 8.2 Selalu gratis di semua paket

Lihat SQL, edit SQL, lihat definisi metrik, masking PII, ekspor CSV hasil sendiri, unduh data sendiri, hapus data/akun, dan baseline pada forecast.

### 8.3 Perbandingan paket 🔸

| Aspek | Free (pengguna biasa) | Pro |
|---|---|---|
| Sasaran | Pemilik/staf yang mencoba, data kecil | Penjual aktif dengan analisis rutin |
| Harga | Gratis, tanpa kartu | Titik uji Rp 149.000 / 199.000 / 299.000 per bulan (§8.4) |
| Pengguna | 1 | 1 (viewer baca-saja menyusul) |
| Dataset aktif | 3 | 50 |
| Ukuran file | 50 MB | 1 GB |
| Penyimpanan total | 500 MB | 10 GB |
| Pertanyaan AI | 10/hari, maks. ~100/bulan | Fair-use ± 1.000/bulan; di atas itu dilambatkan/dialihkan ke model lebih hemat, bukan diblokir |
| Riwayat percakapan | 30 hari | 12 bulan |
| Analisis tersimpan | 10 | 500 |
| Template marketplace | Ya | Ya |
| Analisis lintas dataset (gabung channel) | Tidak (1 dataset per analisis) | Ya |
| Forecast | 3/bulan, horizon ≤ 30 hari, baseline + ETS | 50/bulan, horizon ≤ 365 hari, semua model kandidat + backtest lengkap |
| Seri per forecast (mis. per produk/wilayah) | 1 (agregat) | Hingga 50 |
| Lihat/edit SQL, definisi metrik | Ya | Ya |
| Ekspor | CSV, PNG (watermark kecil) | + PDF, XLSX, tanpa watermark |
| Laporan & ringkasan mingguan email | Tidak | Ya |
| Peringatan anomali **[Later]** | Tidak | Ya |
| Koneksi database **[Later]** | Tidak | 1 koneksi |
| Dukungan | Pusat bantuan | Email, target respons 1 hari kerja |

Catatan:

- "Hari" direset pukul **00.00 WIB**; kuota tidak diakumulasi; untuk Pro, "bulan" mengikuti periode tagihan.
- Driver decomposition ("kenapa turun") tersedia di Free dan dihitung sebagai satu pertanyaan (momen "aha" utama).
- Gating forecast terhadap baseline berlaku sama di semua paket.

### 8.4 Harga 🔸

- Mata uang **IDR**. Harga ditampilkan jelas apakah sudah termasuk PPN; perlakuan PPN dan faktur pajak dikonfirmasi ke konsultan pajak sebelum peluncuran.
- **Tiga titik uji** Pro bulanan: Rp 149.000, Rp 199.000, Rp 299.000. Tahunan: bayar 10 bulan untuk 12 (hemat ± 17%).
- **Cara menetapkan harga final:**

```text
Harga minimum ≥ biaya variabel per pengguna Pro aktif ÷ (1 − target margin kotor) + biaya payment gateway
Lalu dicek terhadap: willingness-to-pay (wawancara pilot, mis. Van Westendorp),
                     konversi uji pada halaman harga,
                     harga alternatif yang dipakai calon pengguna (diisi setelah riset, bukan ditebak).
```

- Peserta pilot dan early adopter mendapat **harga terkunci 12 bulan** 🔸.
- Perubahan harga untuk pelanggan berjalan diumumkan minimal 30 hari sebelumnya.

### 8.5 Aturan siklus langganan (ringkas; implementasi di PRD-01 §14)

| Hal | Aturan 🔸 |
|---|---|
| Daftar | Langsung Free, tanpa kartu |
| Trial | Reverse trial Pro 14 hari tanpa kartu; plafon trial ≤ 100 pertanyaan & ≤ 5 forecast; satu per organisasi |
| Perpanjangan | Auto-renew bila metode bayar mendukung; selain itu bayar per periode dengan pengingat H-7/H-3/H-1 |
| Upgrade | Berlaku segera; bulanan→tahunan dikreditkan prorata |
| Downgrade/batal | Berlaku di akhir periode; tidak ada refund sisa periode kecuali garansi 7 hari pembayaran pertama (keputusan terbuka) |
| Gagal bayar | Status `past_due`, grace 7 hari, lalu turun ke Free |
| Turun paket | **Data tidak dihapus** (tabel di bawah) |

**Perlakuan saat turun paket**

| Yang melebihi batas Free | Perlakuan |
|---|---|
| Dataset > 3 | Tersimpan semua; pengguna memilih 3 dataset aktif; sisanya **diarsipkan** (bisa dilihat, diunduh, dihapus; tidak bisa ditanya/diforecast) |
| File > 50 MB | Diarsipkan |
| Penyimpanan > 500 MB | Tidak bisa unggah baru sampai di bawah batas; data lama tidak dihapus |
| Analisis tersimpan > 10 | Tetap terbaca (read-only) |
| Laporan/ringkasan terjadwal | Dijeda; konfigurasi disimpan |
| Riwayat > 30 hari | Disembunyikan (bukan dihapus) sampai upgrade; ekspor/penghapusan tersedia kapan saja |
| Forecast lama | Tetap bisa dibuka |

Pemberitahuan H-7 sebelum turun paket menjelaskan apa yang akan diarsipkan. Akun tidak aktif lama (mis. 12 bulan 🔸) dihapus sesuai kebijakan retensi (§12), dengan pemberitahuan terlebih dahulu.

---

## 9. Metrik Keberhasilan

### 9.1 Metrik bisnis & produk

| Metrik | Definisi | Target pilot 🔸 |
|---|---|---|
| Activation | % pendaftar yang mendapat jawaban pertama dalam sesi pertama | ≥ 60% |
| Time-to-first-insight | Median waktu daftar → jawaban pertama | < 5 menit |
| Dataset onboarding success | % upload berhasil diproses | ≥ 90% |
| Retensi W4 | % pengguna aktif di minggu ke-4 | ≥ 25% |
| Kebiasaan | Analisis per pengguna aktif per minggu | ≥ 3 |
| Konversi Free → Pro | % organisasi Free aktif yang membayar dalam 30 hari | ≥ 5% |
| Konversi trial → bayar | % trial menjadi pelanggan | ≥ 10% (baseline diukur) |
| Churn bulanan Pro | % pelanggan berhenti per bulan | ≤ 6% |
| Churn tak sengaja | % churn akibat gagal bayar | Dipantau; ditekan lewat dunning |
| Pengguna Free menyentuh batas | % pengguna Free aktif yang mencapai kuota | Indikator kuota terlalu ketat/longgar |
| NPS / kepuasan | Survei pasca-pilot | ≥ 30 |
| Margin kotor Pro | (Pendapatan − biaya AI, komputasi, gateway) ÷ Pendapatan | ≥ 70% saat skala |

### 9.2 Metrik kualitas AI (target ringkas; definisi & cara ukur di PRD-02 §13)

| Metrik | Target 🔸 |
|---|---|
| SQL execution success | ≥ 95% |
| Result correctness | ≥ 90% |
| Penanganan ambiguitas (klarifikasi tepat) | ≥ 85% |
| Penolakan tepat (tidak mengarang) | ≥ 95% |
| Insight factuality (angka narasi cocok dengan hasil query) | ≥ 95% |
| Forecast mengalahkan Seasonal Naive pada backtest | ≥ 70% seri uji |
| Interval 80% mencakup realisasi | 75-85% |
| RAG: peningkatan result correctness vs tanpa-RAG | Positif & signifikan sebelum diaktifkan default |

### 9.3 Uji harga

Gabungkan wawancara pilot dan uji halaman harga untuk calon pengguna baru. Jangan mengubah harga pelanggan berjalan untuk eksperimen.

---

## 10. Unit Economics & Kontrol Biaya

### 10.1 Model biaya

```text
Biaya per analisis ≈ (token_input × harga_input + token_output × harga_output) × jumlah_panggilan_LLM
                     + embedding/retrieval (RAG) + komputasi_query
Biaya per forecast ≈ waktu_CPU × tarif_komputasi + penyimpanan
Biaya per pengguna/bulan ≈ Σ analisis + Σ forecast + penyimpanan + overhead dukungan + biaya gateway
```

Langkah wajib sebelum menetapkan harga final: ukur token riil per pertanyaan pada golden set (rata-rata & persentil 95), lalu hitung biaya per analisis.

### 10.2 Sensitivitas biaya (angka **asumsi ilustrasi**, wajib diganti hasil ukur)

```text
Biaya per analisis (asumsi)        Rp 300       Rp 800
Free, pemakaian maks (100/bulan)   Rp 30.000    Rp 80.000   per pengguna/bulan
Pro, pemakaian tipikal (150/bln)   Rp 45.000    Rp 120.000
Pro, pemakaian ekstrem (1.000/bln) Rp 300.000   Rp 800.000
```

Artinya: pada harga Pro sekitar Rp 199.000, margin hanya sehat bila biaya per analisis ditekan dan pemakaian ekstrem dikendalikan fair-use.

### 10.3 Kontrol biaya wajib

- Plafon token per organisasi per hari (circuit breaker) dan peringatan otomatis lonjakan biaya.
- Cache hasil query identik (tidak mengurangi kuota); routing model: model kecil untuk klasifikasi maksud, model besar hanya untuk SQL sulit (PRD-02 §14).
- RAG harus menghemat token (schema pruning) atau menaikkan akurasi secara terukur; bila tidak, tidak diaktifkan.
- Pertanyaan gagal karena galat sistem dan klarifikasi **tidak** mengurangi kuota (§11.5).
- Pengguna Free tidak aktif tidak menimbulkan biaya komputasi selain penyimpanan kecil.

---

## 11. Kontrak Antarmuka AI–Web (Sumber Tunggal)

> Bagian ini adalah **satu-satunya definisi** skema yang dipakai bersama. PRD-01 (konsumen UI & penegakan kuota) dan PRD-02 (produsen jawaban) wajib mengikutinya. **Versi kontrak: 1.0.**

### 11.1 K-1: Respons AI Analyst

Frontend tidak mem-parsing teks bebas LLM; seluruh tampilan dibangun dari objek ini.

```json
{
  "contract_version": "1.0",
  "run_id": "run_01H...",
  "conversation_id": "conv_01H...",
  "status": "completed",
  "answer": "Omzet turun 12,4% dibanding bulan lalu.",
  "findings": [
    {"id": "f1", "type": "fact", "text": "Wilayah Timur turun 18,2%.", "evidence_ref": "q1"},
    {"id": "f2", "type": "inference", "text": "Penurunan terkonsentrasi di Produk A; mungkin terkait stok atau harga.", "evidence_ref": "q2"},
    {"id": "f3", "type": "recommendation", "text": "Periksa stok dan harga Produk A di wilayah Timur.", "evidence_ref": null}
  ],
  "metric_definitions": [
    {"metric": "omzet_bersih", "label": "Omzet bersih", "summary": "Penjualan − diskon penjual − retur, tanpa pesanan dibatalkan"}
  ],
  "queries": [
    {"id": "q1", "sql": "SELECT ...", "row_count": 34, "truncated": false, "duration_ms": 42, "dataset_version_id": "dsv_01H..."}
  ],
  "data": {
    "query_id": "q1",
    "columns": [{"name": "wilayah", "type": "string"}, {"name": "omzet", "type": "number"}],
    "rows": [["Timur", 180000000]]
  },
  "chart": {"type": "bar", "x": "wilayah", "y": ["omzet"], "series": null, "sort": "desc", "title": "Omzet per wilayah"},
  "confidence": {"level": "high", "reasons": ["Definisi metrik dari glosarium", "Hasil lolos pemeriksaan kewajaran"]},
  "clarification": null,
  "refusal": null,
  "warnings": [],
  "suggested_actions": [
    {"id": "a1", "label": "Rinci per produk", "action": "ask", "payload": {"question": "Rinci per produk di wilayah Timur"}},
    {"id": "a2", "label": "Forecast 3 bulan", "action": "forecast", "payload": {"metric": "omzet_bersih", "horizon_days": 90}}
  ],
  "rag_context": {"schema": ["pesanan.tanggal_pesanan"], "metrics": ["omzet_bersih"], "few_shot_ids": ["fs_01H..."]},
  "usage": {"counted": true, "llm_calls": 3, "tokens_in": 4210, "tokens_out": 520}
}
```

Aturan nilai:

| Field | Aturan |
|---|---|
| `status` | `completed` · `needs_clarification` · `refused` · `failed` |
| `findings[].type` | `fact` · `inference` · `recommendation` (selalu berlabel; UI menampilkan labelnya) |
| `confidence.level` | `high` · `medium` · `low`; `low` wajib disertai `reasons` |
| `clarification` | Terisi hanya bila `needs_clarification`: `{"question": "...", "options": [{"id": "", "label": ""}]}` |
| `refusal` | Terisi hanya bila `refused`: `{"reason_code": "DATA_NOT_AVAILABLE \| OUT_OF_SCOPE \| UNSAFE", "message": "...", "missing": ["kolom stok"]}` |
| `queries[].sql` | Selalu disertakan (UI menyembunyikan secara default, progressive disclosure) |
| `rag_context` | Opsional; hanya ditampilkan di panel lanjutan |
| `usage` | Untuk observabilitas dan penghitungan kuota; tidak ditampilkan ke pengguna biasa |

### 11.2 K-2: Amplop galat & kode standar

```json
{"error": {"code": "QUOTA_EXCEEDED", "message_user": "Kuota pertanyaan hari ini habis.",
           "message_dev": "ai_question daily limit 10 reached", "retryable": false,
           "details": {"metric": "ai_question", "limit": 10, "used": 10, "resets_at": "2026-10-09T00:00:00+07:00", "upgrade_url": "/app/pengaturan/langganan"},
           "request_id": "req_01H..."}}
```

| Kode | HTTP | Arti | Retryable |
|---|---|---|---|
| `QUOTA_EXCEEDED` | 403 | Kuota paket habis | Tidak (sampai reset/upgrade) |
| `PLAN_FEATURE_LOCKED` | 403 | Fitur tidak ada di paket | Tidak |
| `RATE_LIMITED` | 429 | Batas laju teknis | Ya |
| `DATASET_NOT_READY` | 409 | Dataset belum selesai diproses | Ya |
| `DATASET_ARCHIVED` | 409 | Dataset diarsipkan (turun paket) | Tidak |
| `SQL_REJECTED` | 422 | SQL gagal validasi keamanan | Tidak |
| `QUERY_TIMEOUT` | 504 | Query melebihi batas waktu | Ya (setelah disederhanakan) |
| `LLM_UNAVAILABLE` | 503 | Penyedia LLM tidak tersedia | Ya |
| `CONTRACT_VALIDATION_FAILED` | 502 | Output AI melanggar skema | Ya |
| `FORECAST_INFEASIBLE` | 422 | Data tidak memenuhi kelayakan forecast | Tidak |
| `JOB_FAILED` | 500 | Job asinkron gagal | Tergantung |

### 11.3 K-3: Job asinkron & event streaming

**Status job:** `QUEUED` → `RUNNING` → `SUCCEEDED` | `FAILED` | `CANCELED`, dengan `progress: {percent, stage, eta_seconds}`.

**Transport:** **Server-Sent Events (SSE)** sebagai default (satu arah, sederhana); WebSocket opsional bila kebutuhan dua arah muncul.

| Event | Isi |
|---|---|
| `run.started` | `run_id`, `conversation_id` |
| `run.stage` | `stage`: `understanding` · `retrieving` · `planning` · `sql` · `executing` · `narrating` |
| `run.partial_answer` | Potongan teks jawaban (streaming) |
| `run.completed` | Objek K-1 lengkap |
| `run.failed` | Amplop K-2 |
| `job.progress` / `job.completed` / `job.failed` | Untuk ingestion, forecast, laporan |

### 11.4 K-4: Konteks percakapan (ConversationState)

Dibaca dan ditulis oleh UI dan AI agar pertanyaan lanjutan tidak mengulang konteks. Selalu terlihat dan dapat diubah pengguna di panel Konteks Data.

```json
{"conversation_id": "conv_01H...", "dataset_ids": ["ds_01H..."], "dataset_version_ids": ["dsv_01H..."],
 "active_metrics": ["omzet_bersih"], "time_column": "tanggal_pesanan",
 "filters": [{"column": "wilayah", "op": "=", "value": "Timur"}],
 "period": {"from": "2026-09-01", "to": "2026-09-30"}, "last_run_id": "run_01H..."}
```

### 11.5 K-5: Entitlement & event pemakaian

AI **tidak** memutuskan sendiri hak pakai. Pola **reserve → commit/release**:

```text
AI Service ──► Entitlement.reserve(org_id, metric, qty, run_id)
                 ├─ ditolak → galat QUOTA_EXCEEDED / PLAN_FEATURE_LOCKED (K-2)
                 └─ diizinkan → jalankan run
              ──► selesai: Entitlement.commit(usage_event)   |   gagal/klarifikasi: release()
```

```json
{"event_id": "ue_01H...", "organization_id": "org_01H...", "user_id": "usr_01H...",
 "metric": "ai_question", "quantity": 1, "counted": true, "run_id": "run_01H...",
 "occurred_at": "2026-10-08T07:12:03Z"}
```

| Metrik | Contoh |
|---|---|
| `ai_question` · `forecast_run` · `export_pdf` · `export_xlsx` · `report_generated` | Dihitung per kejadian |
| `storage_bytes` | Gauge, bukan counter |

**Aturan penghitungan 🔸:**

| Kasus | Mengurangi kuota? |
|---|---|
| `completed` | Ya |
| `needs_clarification` | Tidak |
| `refused` | Tidak |
| `failed` karena sistem | Tidak |
| Cache hit (hasil identik, dataset sama) | Tidak |

`event_id` unik (idempoten); pengiriman ganda tidak menggandakan hitungan.

### 11.6 K-6: Umpan balik

```json
{"run_id": "run_01H...", "rating": "up", "correction": {"sql": "SELECT ...", "note": "omzet harus tanpa ongkir"}, "allow_training_use": false}
```

`allow_training_use` mengikuti opt-in pengguna (§12). Koreksi SQL hanya masuk bank few-shot setelah lolos validasi dan verifikasi (PRD-02 §6.6).

### 11.7 K-7: Aturan versi & perubahan kontrak

- Versi semantik (`contract_version`). Perubahan **additive** (field baru opsional) menaikkan minor; perubahan **breaking** menaikkan major dan wajib melewati PRD-00.
- Konsumen mengabaikan field tak dikenal. Produsen tidak menghapus field tanpa melewati dua rilis deprecation.
- Setiap rilis menjalankan **contract test** otomatis (JSON Schema) di CI untuk kedua sisi.

### 11.8 K-8: Hasil Forecast

Dihasilkan oleh job forecast [PRD-02 §10], dikonsumsi UI [PRD-01 §11]. Dikirim lewat `job.completed` (K-3) atau endpoint hasil.

```json
{
  "contract_version": "1.0",
  "forecast_id": "fc_01H...", "run_id": "fr_01H...", "status": "completed",
  "config": {"dataset_version_id": "dsv_01H...", "time_column": "tanggal_pesanan", "target_metric": "omzet_bersih",
             "frequency": "D", "horizon": 90, "series_key": null, "calendar": "id-ID@2026.1", "seed": 42},
  "feasibility": {"ok": true, "checks": [{"code": "MIN_HISTORY", "ok": true, "message": "420 hari histori"},
                                         {"code": "ZERO_RATIO", "ok": true, "message": "14% hari bernilai nol"}], "warnings": []},
  "history": [{"t": "2026-07-01", "y": 41200000}],
  "forecast": [{"t": "2026-10-01", "p50": 43100000, "lower_80": 39800000, "upper_80": 46900000, "lower_95": 37900000, "upper_95": 49100000}],
  "summary": {"total_p50": 3820000000, "vs_previous_period_pct": 8.4, "interval_80": [3410000000, 4190000000]},
  "models": [
    {"name": "seasonal_naive", "role": "baseline", "wape": 0.112, "mae": 124000, "mase": 0.91, "coverage_80": 0.79, "status": "evaluated"},
    {"name": "lightgbm", "role": "candidate", "wape": 0.081, "mae": 91000, "mase": 0.71, "coverage_80": 0.81, "status": "champion"}
  ],
  "champion": {"name": "lightgbm", "reason": "WAPE backtest rata-rata terbaik dan lolos gating", "beats_baseline": true, "improvement_vs_baseline_pct": 27.7},
  "backtest": {"scheme": "rolling_origin", "folds": 5, "fold_metrics": [{"fold": 1, "model": "lightgbm", "wape": 0.085}]},
  "explanation": {"method": "stl_decomposition_of_history",
                  "factors": [{"label": "Pola musiman akhir tahun", "type": "inference"}, {"label": "Tren 60 hari terakhir", "type": "inference"}],
                  "confidence": {"level": "medium", "reasons": ["Interval cukup lebar", "Histori 14 bulan"]}},
  "reproducibility": {"config_hash": "sha256:...", "library_versions": {"lightgbm": "x.y.z"}, "code_version": "git:abc123"},
  "warnings": []
}
```

Aturan: `status` ∈ `completed` · `failed` · `infeasible`; bila gating gagal, `champion.name` = baseline terbaik dan `champion.beats_baseline = false` dengan `warnings` penjelasan; `explanation.method` wajib menyebut sumber penjelasan (jujur terhadap metode); `models` selalu memuat baseline. Angka pada contoh adalah **ilustrasi**.

---

## 12. Keamanan, Privasi & Kepatuhan (Kebijakan Produk)

Implementasi teknis: platform di [PRD-01 §18], AI di [PRD-02 §8].

### 12.1 Prinsip dasar

HTTPS, enkripsi at-rest & in-transit, isolasi tenant (`organization_id` di semua query, diuji otomatis), RBAC, rate limiting, audit log, manajemen rahasia, kredensial DB **read-only**, kredensial tidak pernah dikirim ke LLM, data kartu pembayaran tidak menyentuh server kita (tokenisasi gateway).

### 12.2 Privasi & UU PDP (Indonesia)

- Data pelanggan (nama, telepon, alamat) diperlakukan sebagai **data pribadi** sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Peran (pengendali/prosesor), dasar pemrosesan, dan notifikasi insiden **wajib dikonsultasikan ke penasihat hukum**. *(Bukan nasihat hukum.)*
- **Minimisasi ke LLM:** hanya skema, glosarium, statistik ringkas, dan sampel kecil **yang sudah dimasking** yang dikirim; hasil query penuh tidak dikirim bila mengandung PII.
- **Perjanjian pemrosesan data (DPA) dengan penyedia LLM:** data tidak dipakai melatih model; opsi *zero data retention* bila tersedia; wilayah pemrosesan dipilih sesuai kebutuhan.
- **Retensi & penghapusan:** pengguna dapat menghapus dataset/akun; penghapusan mencakup file mentah, Parquet, cache, **embedding/vektor RAG**, dan artefak turunan, dengan jadwal retensi terdokumentasi.
- **Penggunaan data untuk peningkatan produk** (golden set, bank contoh lintas pelanggan): **opt-in** eksplisit, dianonimkan. Default: tidak dipakai.
- Halaman *Keamanan* & *Privasi* publik dengan bahasa awam.

### 12.3 PII

Deteksi email, telepon, alamat, NIK, kartu pembayaran, identitas pribadi. Mode per kolom: **Izinkan / Masking / Blokir**. Default untuk kolom PII terdeteksi: **Masking untuk LLM**; hanya agregat yang ditampilkan. Nilai PII **tidak pernah** di-embed ke vector store.

### 12.4 Keamanan AI

Prompt injection (langsung dan tidak langsung lewat isi sel), izin tool oleh kebijakan aplikasi (bukan LLM), validasi output terstruktur, sandbox eksekusi, dan **keracunan bank RAG** (PRD-02 §6.8).

---

## 13. Target Non-Fungsional Lintas Dokumen 🔸

| Aspek | Target |
|---|---|
| Muat halaman awal | < 2,5 detik |
| API sederhana | < 500 ms (p95) |
| Query SQL sederhana | < 3 detik |
| Respons AI pertama | < 8 detik (p95); streaming status |
| Retrieval RAG | < 250 ms (p95) |
| Job panjang | Asinkron, status & estimasi, dapat dicoba ulang |
| Ketersediaan | ≥ 99,5% |
| Degradasi anggun | Bila LLM tidak tersedia: dataset, chart, dan eksekusi/edit SQL manual tetap berfungsi |
| Pemulihan | Backup harian; RPO ≤ 24 jam, RTO ≤ 8 jam |
| Skala awal | 100 organisasi aktif; dataset hingga ~1 juta baris per file |
| Aksesibilitas | WCAG 2.1 AA untuk alur inti |

Rincian per sisi: [PRD-01 §20], [PRD-02 §14-§15].

---

## 14. Pilot & Go-to-Market

### 14.1 Pilot (setelah Tahap 1)

- **10-20 UMKM** ICP, direkrut lewat komunitas seller, kelompok Facebook/WhatsApp seller, dan jaringan pribadi.
- 4-6 minggu; wawancara awal & akhir; pendampingan onboarding. Peserta mendapat akses Pro manual dan harga terkunci.
- Data yang dikumpulkan: metrik §9.1, 👍/👎, pertanyaan yang gagal, kandidat golden set dan bank contoh (opt-in).
- Opsional sebelum gateway siap: **penagihan manual** (transfer + invoice) untuk pelanggan awal agar willingness-to-pay teruji lebih cepat.

### 14.2 Saluran akuisisi (hipotesis)

Konten edukasi (membaca data penjualan marketplace), komunitas seller, kemitraan dengan agensi/konsultan seller dan penyedia kasir, template gratis, dan SEO berbahasa Indonesia.

### 14.3 Ukuran pasar

Jangan mengasumsikan ukuran pasar tanpa riset. Susun estimasi TAM/SAM/SOM bottom-up (jumlah seller aktif × konversi realistis × ARPU) sebelum materi investor.

---

## 15. Tim, Timeline & Estimasi

> Asumsi 🔸: tim inti 4-5 orang: 1 product/design, 1 frontend, 2 backend/data/ML, 0,5-1 AI/evaluasi (bisa merangkap).

| Tahap | Durasi | Keluaran |
|---|---|---|
| Fase 0: Fondasi | 2 minggu | Repo, CI/CD, auth, DB (+ ekstensi vektor), sistem desain dasar, harness evaluasi |
| Tahap 0: Alpha | 4 minggu | Pipeline analyst inti + golden set + gerbang akurasi |
| Tahap 1: MVP Analyst | 9 minggu | Produk pilot lengkap, RAG R1 (few-shot), kuota Free |
| Pilot | 4-6 minggu | Pembelajaran, kalibrasi |
| Tahap 2: Forecasting & Langganan Pro | 8 minggu | Forecast + backtest + decomposition + laporan + billing Pro |
| **Total ke produk berbayar awal** | **± 27-31 minggu** | |

Tiga jalur kerja paralel: **Web/Platform**, **AI**, dan **Data/Platform** (ingestion, profiling, sandbox). Estimasi harus dikaji ulang bersama tim engineering; jadikan rentang, bukan komitmen. RAG R2/R3 dikerjakan hanya bila data pilot menunjukkan perlunya (tidak masuk estimasi dasar).

---

## 16. Manajemen Risiko

| # | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R1 | Akurasi SQL/hasil di bawah target | Tinggi | Sedang | Semantic layer, template, RAG few-shot, klarifikasi, verifikasi hasil, gerbang alpha |
| R2 | Halusinasi pada narasi insight | Tinggi | Sedang | LLM hanya menarasikan hasil query; pemeriksaan angka otomatis; label Fakta/Inferensi |
| R3 | Biaya LLM/komputasi melebihi margin | Tinggi | Sedang | Ukur & optimasi; routing model; cache; kuota; alarm biaya |
| R4 | Kebocoran data / prompt injection / kebocoran antar tenant lewat vector store | Sangat tinggi | Rendah-sedang | Sandbox; red-team; DPA; masking; filter & RLS `organization_id` pada semua tabel RAG |
| R5 | Pesaing besar menambah fitur serupa | Sedang | Tinggi | Wedge lokal, template marketplace, kecepatan iterasi, komunitas |
| R6 | Format export marketplace berubah | Sedang | Tinggi | Deteksi versi template, tes regresi, mapping manual cadangan |
| R7 | Pengguna tidak percaya hasil AI | Tinggi | Sedang | Transparansi (SQL, definisi), keyakinan, edit/koreksi, onboarding |
| R8 | Forecast salah menyesatkan keputusan | Tinggi | Sedang | Gating baseline, interval jujur, peringatan |
| R9 | Kualitas data pengguna buruk | Sedang | Tinggi | Profiling, saran pembersihan, penolakan dengan penjelasan |
| R10 | Kepatuhan UU PDP | Tinggi | Sedang | Konsultasi hukum, retensi/hapus data (termasuk vektor), DPA, opt-in |
| R11 | Willingness-to-pay rendah di UMKM | Tinggi | Sedang | Validasi harga dini; penagihan manual awal; nilai hemat waktu terukur |
| R12 | Scope creep | Sedang | Tinggi | Tahapan §7, daftar di luar scope, tinjauan scope tiap dua minggu |
| R13 | RAG menambah kompleksitas tanpa meningkatkan akurasi | Sedang | Sedang | Gerbang aktivasi berbasis A/B pada golden set (PRD-02 §6.9); tahapan R0-R4 |
| R14 | Biaya Free membengkak / penyalahgunaan trial | Sedang | Sedang | Batas dua lapis, plafon token, satu trial per organisasi, verifikasi email |
| R15 | Pembayaran VA/QRIS tidak berulang → churn tak sengaja | Sedang | Tinggi | Pengingat H-7/H-3/H-1, auto-renew bila didukung, grace 7 hari |
| R16 | Kompleksitas pajak, faktur, dan sengketa pembayaran | Sedang | Sedang | Konsultasi pajak, kebijakan refund tertulis, invoice dengan NPWP opsional |

---

## 17. Skenario End-to-End & User Journeys

**Pengguna mengunggah** `shopee_sep2026.xlsx`.

```text
Sistem: 124.532 baris · 18 kolom · kualitas 94%
Terdeteksi: tanggal → tanggal_pesanan · target → omzet_bersih
            kategori → produk · wilayah → provinsi
Konfirmasi mapping (1 klik)
```

**Q1: "Apa yang terjadi pada omzet kuartal lalu?"** **[T1]**

```text
Ambil skema, glosarium & contoh serupa (RAG) → generate SQL → validasi → eksekusi
→ cek kewajaran hasil → chart → narasi

Omzet turun 8,7%.
Kontributor utama: Wilayah Timur -18,4% · Produk A -14,2% · Channel Online -11,1%   (Fakta)
Penjelasan penyebab diberi label Inferensi.
```

**Q2: "Forecast 90 hari ke depan."** **[T2]**

```text
Kelayakan data → backtest → bandingkan model → gating vs baseline → forecast

Perkiraan omzet: Rp 3,82 M · Interval 80%: Rp 3,41 M - Rp 4,19 M · Keyakinan: Sedang
```

**Q3: "Produk mana yang berisiko kehabisan stok?"** **[Later]**

Prasyarat: data stok tersedia. Pada MVP, bila tanpa data stok, AI menjawab bahwa data belum tersedia dan menjelaskan data apa yang dibutuhkan (`refused`, `DATA_NOT_AVAILABLE`).

**Journey langganan:**

```text
Daftar (Free) → pakai 10 pertanyaan hari ini → menyentuh batas → prompt kontekstual
→ reverse trial 14 hari → bayar Pro (VA/QRIS/kartu) → perpanjangan / batal → turun ke Free tanpa kehilangan data
```

*(Angka di contoh adalah ilustrasi.)*

---

## 18. Definition of Done per Tahap

### Tahap 0 (Alpha)
1. Upload CSV/XLSX → profiling → tanya → SQL tervalidasi → hasil (UI minimal)
2. Golden set 100+ pertanyaan + harness evaluasi otomatis di CI
3. Gerbang §7.2 terpenuhi
4. RAG R0 (baseline tanpa vektor) terukur sebagai pembanding

### Tahap 1 (MVP Analyst)
5. Registrasi, login, workspace
6. Upload CSV/XLSX + template Shopee & Tokopedia
7. Profiling, skor kualitas, deteksi PII
8. Glosarium metrik dapat diedit
9. Pertanyaan ID/EN → SQL tervalidasi → hasil → chart → insight berlabel
10. Klarifikasi & penolakan tepat berfungsi
11. Lihat/edit SQL; simpan analisis; ekspor CSV/PNG
12. Kontrak §11 diuji otomatis di CI (contract test)
13. Entitlement & kuota Free ditegakkan di server dan teruji
14. RAG R1 (bank few-shot) aktif bila lolos gerbang A/B
15. Tes keamanan lulus (injection, sandbox, isolasi tenant termasuk tabel RAG)
16. Dokumen privasi & keamanan publik terbit
17. Pilot berjalan dengan pelacakan metrik §9.1

### Tahap 2 (Forecasting & Langganan Pro)
18. Pemeriksaan kelayakan data; baseline + kandidat model; backtest rolling-origin
19. Perbandingan model, gating, interval terkalibrasi, penjelasan & keyakinan
20. Driver decomposition
21. Laporan PDF/XLSX; ringkasan mingguan email
22. Run forecast dapat direproduksi
23. Langganan Pro: checkout, trial, perpanjangan, gagal bayar, pembatalan, turun paket tanpa kehilangan data
24. RAG R2/R3 hanya bila terbukti perlu dan lolos gerbang

DoD rinci per sisi: [PRD-01 §23], [PRD-02 §20].

---

## 19. Keputusan Terbuka

1. **Nama:** "InsightFlow" generik; lakukan pencarian merek/domain/trademark sebelum investasi branding.
2. **Penyedia LLM & model embedding:** pilih berdasarkan akurasi pada golden set, biaya, kebijakan data, dan opsi wilayah.
3. Angka harga final Pro dan diskon tahunan.
4. Garansi uang kembali 7 hari: ya atau tidak.
5. Bentuk trial: reverse trial tanpa kartu (usulan), tanpa trial, atau trial dengan kartu.
6. Watermark pada PNG Free: ya atau tidak.
7. Payment gateway terpilih dan metode yang mendukung pembayaran berulang.
8. Kebijakan PPN dan faktur pajak.
9. Add-on kuota (beli tambahan) atau hanya naik paket.
10. Kapan anggota tambahan (viewer) dibuka di Pro, atau menunggu paket Bisnis.
11. **Peran hukum PDP:** pengendali atau prosesor data; susun perjanjian pemrosesan data.
12. Integrasi API marketplace (bukan hanya export): perlu kajian ketentuan API tiap platform.
13. Bahasa dokumen eksternal: sepakati satu bahasa; seri dokumen ini berbahasa Indonesia dengan istilah teknis Inggris seperlunya.

---

## 20. Visi Jangka Panjang & Roadmap Lanjutan

```text
DATA → PAHAMI → ANALISIS → PREDIKSI → SIMULASI → REKOMENDASI → KEPUTUSAN
```

Urutan indikatif setelah Tahap 2: anomaly detection & peringatan → koneksi database (PostgreSQL/MySQL) → ringkasan via WhatsApp/Slack → tim & RBAC & paket Bisnis → what-if berbasis elastisitas → optimasi inventori & demand planning → fitur Enterprise (SSO/SCIM, private deployment, AI self-hosted, retensi kustom).

**Prinsip arsitektur jangka panjang:** LLM, model embedding, model forecasting, mesin database, dan framework agen harus dapat diganti tanpa mengubah produk, karena logika bisnis tidak boleh terikat pada satu vendor atau model.

---

## Lampiran A. Glosarium Istilah

| Istilah | Arti |
|---|---|
| ICP | Ideal Customer Profile, profil pelanggan target |
| Semantic layer / glosarium metrik | Definisi eksplisit metrik bisnis (rumus, filter, kolom waktu) yang dipakai AI |
| RAG | Retrieval-Augmented Generation: mengambil konteks relevan (skema, metrik, contoh query) sebelum LLM menulis SQL |
| Few-shot | Contoh pasangan pertanyaan–SQL terverifikasi yang disisipkan ke prompt |
| Golden set | Kumpulan pertanyaan dengan hasil acuan untuk mengukur akurasi |
| Backtesting rolling-origin | Evaluasi forecast dengan menggeser titik latih berulang, tanpa random split |
| WAPE / MASE | Metrik error forecast; MASE < 1 berarti lebih baik dari baseline naive |
| Gating | Aturan: forecast lanjutan hanya dipakai bila mengalahkan baseline di backtest |
| Entitlement | Hak pakai fitur & kuota suatu paket |
| Reverse trial | Trial Pro otomatis di awal, lalu turun ke Free bila tidak bayar |
| Grace period | Masa tenggang setelah gagal bayar sebelum turun paket |
| Fair-use | Batas pemakaian wajar pada paket "tak terbatas" |

## Lampiran B. Riwayat Versi

| Versi | Catatan |
|---|---|
| 1.0 | Penomoran dimulai ulang. Konsolidasi dari seluruh draf sebelumnya; dipecah menjadi PRD-00 Induk, PRD-01 Web & Platform, PRD-02 AI; RAG dirancang penuh dan dibangun bertahap; paket Free & Pro dengan langganan; kontrak antarmuka AI–Web sebagai sumber tunggal |
