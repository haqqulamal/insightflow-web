# PRD-01: Web & Platform, InsightFlow AI

**Aplikasi Web · Dataset & Data Engine · Workspace · Langganan & Billing · Platform**

| | |
|---|---|
| Dokumen | PRD-01 Web & Platform |
| Versi | 1.0 (penomoran dimulai ulang) |
| Induk | [PRD-00 Induk](PRD-00-Induk-InsightFlow-AI-v1.0.md): strategi, paket & harga, **kontrak antarmuka K-1..K-8**, kebijakan keamanan |
| Pasangan | [PRD-02 AI](PRD-02-AI-InsightFlow-AI-v1.0.md) |
| Pembaca | Frontend, backend aplikasi, desain, data engineer (ingestion), DevOps |

> Angka bertanda 🔸 adalah hipotesis yang dikalibrasi lewat pilot. Penanda tahap: **[T0]** Alpha, **[T1]** MVP Analyst, **[T2]** Forecasting & Langganan Pro, **[Later]**.

---

## 1. Lingkup & Hubungan dengan Dokumen Lain

**Dalam lingkup:** situs publik, aplikasi web (halaman, navigasi, UI), onboarding, autentikasi & workspace, dataset (upload, validasi, profiling, template marketplace, PII, versi), UI AI Analyst/Forecast/Dashboard/Laporan, **paket, kuota, langganan & billing**, jobs & realtime, API aplikasi, model data platform, keamanan & observabilitas platform.

**Di luar lingkup (dokumen lain):**

| Topik | Lokasi |
|---|---|
| Strategi, ICP, paket & harga (aturan bisnis), metrik bisnis | PRD-00 §2-§10 |
| **Skema respons AI, galat, event, kuota, konteks percakapan, hasil forecast** | **PRD-00 §11 (K-1..K-8)** |
| Pipeline AI, semantic layer (definisi), RAG, validasi SQL, forecasting, evaluasi | PRD-02 |

Web **mengonsumsi** kontrak K-1..K-8 dan **menegakkan** kuota (K-5); ia tidak memiliki logika AI.

---

## 2. Arsitektur Platform

```text
                              Browser (Next.js + React)
                                       │  HTTPS · SSE
                              ┌────────▼─────────┐
                              │  API (FastAPI)   │  Auth · RBAC · Entitlement · API v1
                              └───┬─────┬────┬───┘
            ┌─────────────────────┘     │    └──────────────────────┐
            ▼                           ▼                           ▼
   ┌─────────────────┐        ┌──────────────────┐        ┌──────────────────┐
   │ AI Service      │        │ Job Workers      │        │ Billing Service  │
   │ (PRD-02)        │        │ ingestion·forecast│       │ gateway·webhook  │
   │ via K-1..K-8    │        │ report·email·RAG  │       │ entitlement      │
   └────────┬────────┘        └────────┬─────────┘        └────────┬─────────┘
            └─────────────┬────────────┴───────────────────────────┘
                          ▼
        ┌──────────────────────────────┐        ┌───────────────────────┐
        │ PostgreSQL (+ ekstensi vektor)│        │ Object Storage (S3)  │
        │ metadata · RLS · jobs        │        │ raw · Parquet · laporan│
        └──────────────────────────────┘        └───────────────────────┘
                 Query Sandbox (DuckDB, terisolasi) dipanggil oleh AI Service & Dashboard
```

### 2.1 Prinsip

- **Modular monolith** dulu; pecah menjadi layanan hanya bila ada alasan terukur.
- Tugas berat **tidak** berjalan di request HTTP (§15).
- Semua resource memiliki `organization_id`; isolasi di lapisan data (§18.2).
- Antarmuka AI memakai kontrak versi (PRD-00 §11); AI Service dapat berjalan sebagai modul atau layanan terpisah tanpa mengubah UI.

### 2.2 Stack

| Lapisan | Pilihan MVP | Ditunda |
|---|---|---|
| Frontend | Next.js (stabil terbaru), React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query & Table, Apache ECharts | Dark mode |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic | — |
| Data | PostgreSQL (metadata; ekstensi vektor aktif sejak Fase 0), DuckDB (eksekusi analitik), Polars/PyArrow, Parquet | Konektor DB eksternal |
| Antrian & cache | Antrian job + cache (opsi: berbasis Postgres atau Redis; lihat §24) | Cluster worker, prioritas lanjutan |
| Realtime | **Server-Sent Events (SSE)** untuk progres job & streaming jawaban (K-3) | WebSocket bila perlu dua arah |
| Penyimpanan objek | S3-compatible (S3/R2/MinIO) | — |
| Pembayaran | Payment gateway lokal (mis. Midtrans/Xendit; pilihan final di PRD-00 §19) | Multi-gateway |
| Email | Layanan email transaksional | WhatsApp pengingat |
| Observabilitas | Logging terstruktur, metrik inti, error tracking | Tracing terdistribusi penuh |

> Versi library dan layanan **dikunci (pin)** dan diuji saat implementasi; daftar ini bukan jaminan versi terbaru.

---

## 3. Situs Publik & Landing Page

### 3.1 Struktur

```text
/            Beranda
/produk      Produk (AI Analyst · Forecasting · Template Marketplace)
/harga       Harga (Free vs Pro)
/keamanan    Keamanan & Privasi
/dokumentasi Panduan: format file, template marketplace, FAQ
/masuk  /daftar
```

### 3.2 Seksi beranda

| # | Seksi | Isi |
|---|---|---|
| 1 | Hero | Proposisi nilai + demo interaktif dengan data contoh |
| 2 | Cara kerja | Unggah data → Tanya → Dapat insight → Prediksi → Putuskan |
| 3 | AI Analyst | Pertanyaan natural, jawaban, chart, "Lihat SQL" |
| 4 | Forecasting | Histori, forecast, interval, perbandingan model |
| 5 | Template marketplace | Shopee, Tokopedia, TikTok Shop |
| 6 | Kasus penggunaan | Penjualan, produk terlaris, margin, iklan, operasional |
| 7 | Keamanan & privasi | Akses baca-saja, enkripsi, isolasi data, masking PII, UU PDP |
| 8 | Harga | Free / Pro (IDR), toggle bulanan/tahunan |
| 9 | Bukti sosial | Hanya testimoni asli dengan izin |
| 10 | FAQ | Termasuk: apa yang terjadi saat batal atau turun paket |

```text
────────────────────────────────────────────────────
Ubah data penjualan jadi keputusan yang lebih baik.

Tanya datamu. Pahami apa yang terjadi. Prediksi langkah berikutnya.

[Mulai Gratis]     [Lihat Demo]

   ┌─────────────────────────────┐
   │ "Kenapa omzet turun bulan   │
   │  lalu?"                     │
   │ Omzet ↓ 12,4% (fakta)       │
   │ [Chart]  [Lihat SQL]        │
   └─────────────────────────────┘
────────────────────────────────────────────────────
```

### 3.3 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-60 | Beranda, Produk, Keamanan, Dokumentasi; halaman cepat (LCP < 2,5 dtk), SEO dasar, responsif | M | T1 |
| W-61 | Demo interaktif memakai data contoh (tanpa daftar) | S | T1 |
| W-62 | Halaman `/harga` (lihat §14.9) | M | T2 |
| W-63 | Persetujuan cookie/analitik sesuai UU PDP; analitik tanpa PII | M | T1 |
| W-64 | Dua bahasa (ID utama, EN sekunder) | S | T2 |

---

## 4. Aplikasi: Navigasi & Halaman

### 4.1 Kerangka

```text
┌───────────────────────────────────────────────────────┐
│ Logo                 Cari            Pemakaian  Profil│
├───────────────┬───────────────────────────────────────┤
│ Ringkasan     │                                       │
│ AI Analyst    │                                       │
│ Forecast [T2] │             KONTEN UTAMA              │
│ Dataset       │                                       │
│ Metrik        │                                       │
│ Tersimpan     │                                       │
│ Laporan  [T2] │                                       │
│ Koneksi[Later]│                                       │
│ Pengaturan    │                                       │
└───────────────┴───────────────────────────────────────┘
```

### 4.2 Peta halaman

```text
Aplikasi
├── /app                          Ringkasan (dashboard)
├── /app/analis                   AI Analyst (percakapan)
├── /app/analis/[conversation]    Percakapan tertentu
├── /app/forecast [T2]            Daftar & konfigurasi forecast
├── /app/forecast/[id] [T2]       Hasil forecast
├── /app/dataset                  Daftar dataset
├── /app/dataset/[id]             Skema, kualitas, profil, versi
├── /app/metrik                   Glosarium metrik
├── /app/tersimpan                Analisis tersimpan
├── /app/laporan [T2]             Laporan & jadwal
├── /app/koneksi [Later]          Koneksi database
└── /app/pengaturan
    ├── /umum                     Profil, zona waktu, preferensi
    ├── /langganan                Paket, pemakaian, tagihan (§14)
    ├── /privasi                  Mode PII default, opt-in data, ekspor/hapus data
    └── /anggota [Later]

Admin internal (peran staf, MFA)
├── /admin/pengguna  /admin/organisasi  /admin/penggunaan
├── /admin/langganan   (ubah paket, "Pilot Pro", kredit manual)
├── /admin/model       (kualitas & biaya AI, dari PRD-02 §15)
└── /admin/audit
```

### 4.3 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-140 | Navigasi sidebar sesuai tahap (item [T2]/[Later] disembunyikan atau berlabel "Segera") | M | T1 |
| W-141 | Pencarian global (dataset, analisis tersimpan) | C | T2 |
| W-142 | Admin internal dengan MFA, peran minimal, dan audit akses | M | T1 |


---

## 5. Design System & Prinsip UX

### 5.1 Arah visual

Enterprise-grade, bersih, tepercaya, berfokus pada data. **Bukan** neon/futuristik, bukan tampilan "toy chatbot". Kepadatan informasi tinggi tetapi terstruktur.

### 5.2 Token warna

| Peran | Warna |
|---|---|
| Primer | Navy `#0F172A`, Slate `#334155`, Biru inti `#2563EB` |
| Permukaan | Putih `#FFFFFF`, Permukaan netral `#F8FAFC`, Garis `#E2E8F0` |
| Sukses | Hijau `#10B981` |
| Peringatan | Amber `#F59E0B` |
| Anomali/galat | Merah `#EF4444` |
| Informasi | Biru langit `#0EA5E9` |
| Fitur AI | Indigo `#6366F1` |

**Catatan aksesibilitas:** pasangan warna **teks** harus lolos kontras WCAG AA; warna hijau/amber terang tidak dipakai sebagai warna teks di atas putih (pakai varian lebih gelap atau latar berwarna dengan teks gelap). Informasi tidak pernah disampaikan hanya lewat warna (selalu disertai ikon/label).

### 5.3 Tipografi

Inter (utama); mono untuk SQL (mis. JetBrains Mono). Hierarki: H1 32-40 px, H2 24-30, H3 18-22, body 14-16, caption 12-13; line-height body 1,5.

### 5.4 Prinsip UX

- **Progressive disclosure:** default = jawaban + chart + temuan; lanjutan = definisi metrik, SQL, data, metodologi, konteks RAG.
- **Percakapan sebagai alur kerja:** setiap jawaban punya aksi lanjutan (rinci, forecast, simpan, ekspor).
- **Keyakinan terlihat:** badge keyakinan + alasan; peringatan kualitas data di konteks jawaban.
- **Lokalisasi:** `Rp 1,24 M`, `Rp 84 jt`, titik ribuan, koma desimal, tanggal `7 Okt 2026`, zona waktu WIB.
- **Keadaan eksplisit:** kosong, memuat, galat, dan job asinkron dirancang untuk setiap layar.
- **Responsif:** laptop dan tablet penuh; mobile web baca-saja (lihat hasil, tanya sederhana).
- **Nada bahasa:** jelas, tidak menggurui, tidak memanipulasi (terutama pada batas kuota dan upgrade).
- **Aksesibilitas:** WCAG 2.1 AA untuk alur inti; navigasi keyboard; label ARIA; fokus terlihat.

---

## 6. Onboarding (First-Time User Experience)

**Target: insight pertama < 5 menit** (PRD-00 §9.1).

```text
Daftar → Pilih sumber data
   ├─ "Pakai data contoh" (toko fiktif, siap seketika)
   └─ Unggah export (Shopee/Tokopedia/TikTok Shop/CSV/XLSX)
        ↓
Validasi & deteksi sumber → layar konfirmasi mapping kolom (1 klik)
        ↓
Progres: validasi → profiling → pengindeksan   (SSE, K-3)
        ↓
Ringkasan: "Data Anda siap" — baris, rentang tanggal, kualitas, metrik ditemukan, PII terdeteksi
        ↓
3-5 pertanyaan yang disarankan dari data pengguna (tanpa kanvas kosong)
        ↓
Jawaban pertama (K-1)
```

```text
Selamat datang di InsightFlow

Mari hubungkan data Anda.
┌───────────────────────────────┐
│ Unggah dataset pertama Anda   │
│   Tarik CSV / Excel ke sini   │
│   [Unggah Dataset]            │
└───────────────────────────────┘
atau [Pakai data contoh]        [Hubungkan Database — segera]

Data Anda siap.
✓ 124.532 baris   ✓ 18 kolom   ✓ Kualitas data 94%   ⚠ 2 kolom berisi data pribadi (dimasking)
Kami menemukan: Omzet · Pesanan · Produk · Wilayah · Tanggal
[Tanya AI]   [Buat Forecast ← T2]
```

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-01 | Dataset contoh & pertanyaan yang disarankan | M | T1 |
| W-02 | Layar konfirmasi mapping 1 klik | M | T1 |
| W-03 | Progres pemrosesan real-time dengan estimasi | M | T1 |
| W-04 | Saran pertanyaan dibuat dari skema/metrik dataset pengguna (bukan generik) | S | T1 |
| W-05 | Checklist onboarding ringan (unggah → tanya → simpan) | C | T2 |
| W-06 | Pengukuran funnel onboarding (§19) | M | T1 |

---

## 7. Autentikasi, Workspace, Multi-tenancy & RBAC

### 7.1 Autentikasi

- Registrasi email + kata sandi dengan **verifikasi email**; login Google OAuth; reset kata sandi.
- Sesi: cookie `HttpOnly`, `Secure`, `SameSite`; token berumur pendek + refresh; klaim `org_id` dan peran diverifikasi di API.
- Perlindungan: rate limit login, penguncian sementara, deteksi kata sandi lemah, kebijakan panjang minimal. **MFA wajib untuk peran admin internal; opsional untuk pengguna** [T2].

### 7.2 Workspace & tenant

- Satu workspace (organisasi) per akun pada MVP; skema sudah mendukung banyak anggota.
- Semua resource membawa `organization_id`. Lihat isolasi data di §18.2.

```text
Organisasi
├── Pengguna & peran        ├── Glosarium metrik
├── Dataset (+ versi)       ├── Analisis, forecast, laporan
├── Koneksi [Later]         └── Paket, pemakaian, tagihan, pengaturan
```

### 7.3 Peran

| Peran | Dataset | Analisis | Glosarium | Forecast | Langganan & billing | Anggota |
|---|---|---|---|---|---|---|
| Owner | CRUD | CRUD | CRUD | CRUD | Ya | Kelola |
| Admin | CRUD | CRUD | CRUD | CRUD | Lihat | Kelola |
| Analyst | CRU | CRUD | CRU | CRUD | Tidak | Tidak |
| Viewer | Lihat | Lihat | Lihat | Lihat | Tidak | Tidak |

Pada MVP hanya **Owner**; tabel ini dipakai untuk desain skema dan kebijakan sejak awal.

### 7.4 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-10 | Registrasi, verifikasi email, login, Google OAuth, reset kata sandi | M | T1 |
| W-11 | Workspace per akun; `organization_id` pada semua resource | M | T1 |
| W-12 | Skema peran (Owner/Admin/Analyst/Viewer) + pemeriksaan izin di API | M | T1 |
| W-13 | Undang anggota, kelola peran | S | Later |
| W-14 | Ekspor seluruh data akun dan hapus akun (termasuk embedding RAG & cache) | M | T1 |
| W-15 | Audit log (login, perubahan peran, unggah/hapus dataset, ubah paket, ekspor, akses admin) | M | T1 |
| W-16 | MFA (opsional pengguna; wajib admin) | S | T2 |

---

## 8. Dataset & Data Engine

### 8.1 Alur unggah & status

```text
Unggah (chunked, ke object storage)
 → UPLOADED → VALIDATING → PROFILING → INDEXING (RAG, PRD-02 §6.5) → READY
                  └──────── FAILED (pesan dapat ditindaklanjuti)
Status lain: ARCHIVED (turun paket, §14.7) · DELETING
```

Dijalankan sebagai job asinkron; progres lewat SSE (K-3).

### 8.2 Validasi file

| Pemeriksaan | Aturan |
|---|---|
| Tipe | CSV, XLSX [T1]; Parquet, JSON, Google Sheets [Later]. XLSM/makro **ditolak** |
| Keaslian | Cek ekstensi **dan** magic bytes/MIME; tolak ketidakcocokan |
| Ukuran | Sesuai entitlement paket (`file_size_mb_max`) sebelum dan saat unggah |
| Keamanan | Pemindaian antivirus; batas rasio dekompresi (XLSX adalah ZIP; cegah *zip bomb*); batas jumlah sheet/baris |
| Encoding | Deteksi UTF-8/Windows-1252; delimiter `,` `;` `\t` |
| Struktur | Pilih sheet (XLSX), deteksi baris header, tangani sel gabungan & header multi-baris |

### 8.3 Deteksi skema & format Indonesia

- **Angka:** `1.234,56` vs `1,234.56`; simbol `Rp`; persen.
- **Tanggal:** `dd/mm/yyyy`, `yyyy-mm-dd`, nama bulan Indonesia (`7 Okt 2026`), serial Excel, dengan zona waktu WIB bila relevan.
- **Tipe kolom:** tanggal, numerik, kategorikal, teks bebas, boolean, ID.
- Kandidat **kolom waktu** dan **target forecast** ditandai.

### 8.4 Template marketplace **[T1]**

- Deteksi sumber lewat *signature* header (Shopee, Tokopedia; TikTok Shop menyusul) dan versi format.
- Pemetaan kolom ke **model data standar** (pesanan, produk, biaya, ongkir, diskon, retur, status, wilayah) yang ditampilkan di layar konfirmasi; pengguna dapat mengubah mapping.
- Template menyuplai **glosarium metrik awal** (PRD-02 §5) dan **seed few-shot** (PRD-02 §6.6).
- **Pemeliharaan:** setiap template punya versi; tes regresi dengan sampel nyata/sintetis; bila format tidak dikenal → mapping manual dengan bantuan AI (menyarankan, pengguna mengonfirmasi).

### 8.5 Profiling & skor kualitas

Dihitung otomatis (Polars): jumlah baris/kolom, tipe, missing, duplikat, nilai unik/kardinalitas, outlier, kolom tanggal/kategorikal/numerik, kandidat target & variabel deret waktu, rentang tanggal, celah tanggal.

```text
Dataset: shopee_sep2026.xlsx
Baris 124.532 · Kolom 18 · Kualitas 94%

Tanggal:     ✓ tanggal_pesanan (2026-01-01 → 2026-09-30)
Numerik:     ✓ harga_jual  ✓ qty  ✓ diskon_penjual
Kategorikal: ✓ produk (450)  ✓ provinsi (34)  ✓ channel (3)
Data pribadi:⚠ nama_pembeli, telepon  (default: masking)
Kandidat forecast: 1. omzet_bersih  2. qty
```

**Skor kualitas** 🔸 = 100 × (1 − penalti terbobot) dari: kelengkapan (40%), validitas tipe/format (30%), keunikan/duplikat (15%), konsistensi (15%). Rumus dan bobot dikalibrasi di pilot. **Saran perbaikan** (mis. gabung duplikat, isi tanggal kosong) dapat diterima atau ditolak pengguna; tidak ada perubahan data tanpa persetujuan.

### 8.6 Deteksi & kebijakan PII

- Deteksi: email, telepon (`+62`/`08…`), alamat, NIK (16 digit + format), kartu pembayaran (algoritma Luhn), identitas pribadi; heuristik nama kolom + pola nilai + kamus.
- Mode per kolom: **Izinkan / Masking / Blokir**. Default untuk PII terdeteksi: **Masking untuk LLM**; hanya agregat tampil.
- Kolom *Blokir* tidak terlihat oleh AI dan tidak diindeks RAG; kolom PII tidak pernah di-embed nilainya (PRD-02 §6.5).
- Pengguna dapat meninjau dan mengubah mode; setiap perubahan diaudit.

### 8.7 Versi dataset & penyimpanan

- Unggah ulang dapat **menambah (append)** atau **mengganti**; setiap perubahan membuat `dataset_version`. Analisis dan forecast **dipatok ke versi** (reproduksibilitas); tersedia aksi "jalankan ulang pada data terbaru".
- Penyimpanan: file mentah (terenkripsi) + **Parquet terkompresi** per versi di `/tenants/{org_id}/datasets/{dataset_id}/v{n}.parquet`.
- **Penghapusan** dataset menghapus file mentah, Parquet, cache, hasil terindeks, dan **baris RAG** (kaskade) sesuai retensi PRD-00 §12.

### 8.8 Sumber data lain **[Later]**

| Sumber | Tahap | Keamanan |
|---|---|---|
| Parquet, JSON | MVP+ | Validasi skema |
| Google Sheets | MVP+ | OAuth2, scope baca-saja |
| PostgreSQL | Later (Pro) | User **read-only**, SSL wajib, kredensial terenkripsi (KMS/vault), uji koneksi, batas waktu & baris |
| MySQL/MariaDB, SQL Server | Later | Sama + SSH tunnel |
| BigQuery, Snowflake, Redshift | Later | Service account/key-pair berskop |

Kredensial **tidak pernah** dikirim ke LLM atau ditampilkan ulang setelah disimpan.

### 8.9 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-20 | Unggah CSV/XLSX (chunked) dengan batas sesuai paket | M | T1 |
| W-21 | Validasi file §8.2 (tipe, magic bytes, ukuran, antivirus, batas dekompresi) | M | T1 |
| W-22 | Deteksi skema & format Indonesia §8.3 | M | T1 |
| W-23 | Template marketplace Shopee & Tokopedia + konfirmasi mapping | M | T1 |
| W-24 | Profiling & skor kualitas + saran perbaikan | M | T1 |
| W-25 | Deteksi PII + mode Izinkan/Masking/Blokir | M | T1 |
| W-26 | Versi dataset (append/ganti) + jalankan ulang pada data terbaru | S | T1 |
| W-27 | Status & progres pemrosesan (SSE), galat yang dapat ditindaklanjuti | M | T1 |
| W-28 | Konversi ke Parquet + penyimpanan terisolasi per tenant | M | T1 |
| W-29 | Arsip/hapus dataset (kaskade termasuk RAG) | M | T1 |
| W-30 | Template TikTok Shop; Parquet/JSON/Google Sheets | S | T2 |
| W-31 | Koneksi database read-only | C | Later |

---

## 9. UI Glosarium Metrik

Definisi dan aturan semantic layer ada di [PRD-02 §5]. UI di sini.

- **Daftar metrik:** nama, alias, ekspresi, sumber (template/pengguna), versi, status, dipakai di berapa analisis.
- **Editor:** nama, alias, ekspresi (editor dengan penyorotan), filter default, kolom waktu, satuan, catatan. **Validasi langsung** (parser + uji pada sampel) dengan pesan galat jelas; pratinjau nilai pada periode terakhir.
- **Riwayat versi:** lihat, bandingkan, pulihkan; analisis tersimpan menampilkan versi yang dipakai.
- **Relasi antar tabel:** layar konfirmasi kandidat join yang dideteksi.
- Perubahan glosarium memicu re-indexing (job, §15) dan menampilkan statusnya.

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-35 | Daftar & editor metrik dengan validasi langsung | M | T1 |
| W-36 | Riwayat versi & pemulihan | S | T1 |
| W-37 | Konfirmasi relasi/join | S | T1 |
| W-38 | Badge "template" vs "kustom"; reset ke default template | C | T1 |

---

## 10. UI AI Analyst

### 10.1 Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ AI Analyst · penjualan_sep2026 (v3)        7/10 hari ini · reset 00.00 WIB │
├───────────────────────────────────┬──────────────────────────┤
│ Percakapan                        │ Konteks Data (K-4)       │
│ Anda: Kenapa omzet turun?         │ Dataset: penjualan (v3)  │
│ AI:   Omzet turun 12,4% ...       │ Metrik aktif: omzet_bersih (edit) │
│  [Temuan berlabel]                │ Periode: Sep 2026        │
│  [Chart]                          │ Filter: —                │
│  ▸ Definisi metrik                │ Tabel: pesanan · produk  │
│  ▸ SQL   ▸ Data   ▸ Metodologi    │                          │
│  Keyakinan: Tinggi                │                          │
│  [Rinci] [Forecast] [Simpan] 👍👎 │                          │
├───────────────────────────────────┴──────────────────────────┤
│ Tanya apa saja tentang data Anda...                 [Kirim]  │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Merender respons K-1

| Elemen K-1 | Tampilan |
|---|---|
| `answer` | Ringkasan satu paragraf di atas (streaming via `run.partial_answer`) |
| `findings[]` | Daftar poin dengan **chip label** Fakta / Inferensi / Rekomendasi (ikon + teks, bukan hanya warna) |
| `chart` | ECharts dari spesifikasi deklaratif (bar/line/scatter/donut/tabel); mapping `x`, `y`, `series`, `sort` |
| `metric_definitions` | Baris ringkas "Definisi: omzet_bersih" yang dapat diperluas |
| `queries[].sql` | Akordeon **Lihat SQL** (penyorotan, salin, **Edit & jalankan ulang**) |
| `data` | Akordeon tabel virtualized (TanStack Table), ekspor CSV, keterangan `truncated` |
| `confidence` | Badge + alasan (wajib terlihat bila `low`) |
| `warnings[]` | Banner kontekstual |
| `suggested_actions[]` | Chip aksi (rinci per dimensi, forecast, simpan, ekspor) |
| `rag_context` | Panel lanjutan "Konteks yang dipakai" (tabel, metrik, contoh) |
| `clarification` | Pertanyaan balik dengan **tombol opsi** (bukan teks bebas) |
| `refusal` | Pesan jujur + daftar data yang kurang + tautan ke unggah/dataset |

### 10.3 Tahap proses (streaming)

`run.stage` menampilkan status: *Memahami pertanyaan → Mengambil konteks → Menyusun query → Menjalankan → Menyusun jawaban*. Kegagalan menampilkan galat K-2 yang ramah dengan aksi (coba lagi / sederhanakan / edit SQL).

### 10.4 Umpan balik & koreksi

👍/👎 pada setiap jawaban; 👎 membuka alasan singkat. Alur **koreksi**: pengguna mengedit SQL → jalankan → "Gunakan sebagai koreksi" mengirim K-6 (dengan `allow_training_use` sesuai pengaturan privasi). Penjelasan singkat bahwa koreksi membantu pertanyaan serupa berikutnya.

### 10.5 Kuota & keadaan khusus

- Meter pemakaian di header (`7/10 pertanyaan hari ini · reset 00.00 WIB`), peringatan 80% dan 100%.
- `QUOTA_EXCEEDED` → prompt upgrade kontekstual (§14.9) tanpa menyembunyikan jawaban sebelumnya.
- `PLAN_FEATURE_LOCKED` (mis. analisis lintas dataset di Free) → penjelasan + tombol "Lihat Pro".
- `LLM_UNAVAILABLE` → **mode manual**: editor SQL + tabel + chart tetap bisa dipakai.
- `DATASET_ARCHIVED` → arahkan ke aktivasi dataset/upgrade.

### 10.6 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-40 | Layout percakapan + panel Konteks Data (K-4) yang dapat diubah | M | T1 |
| W-41 | Render K-1 lengkap §10.2 (termasuk label Fakta/Inferensi/Rekomendasi) | M | T1 |
| W-42 | Progressive disclosure: default jawaban+chart+temuan | M | T1 |
| W-43 | Streaming jawaban & status tahap (SSE) | M | T1 |
| W-44 | Klarifikasi dengan tombol opsi; penolakan jujur | M | T1 |
| W-45 | Edit SQL & jalankan ulang; ekspor tabel CSV | S | T1 |
| W-46 | 👍/👎 + alur koreksi SQL (K-6) | S | T1 |
| W-47 | Meter pemakaian, peringatan 80/100%, prompt upgrade | M | T1 |
| W-48 | Mode manual saat `LLM_UNAVAILABLE` | M | T1 |
| W-49 | Daftar & riwayat percakapan; ganti dataset; percakapan baru | M | T1 |

---

## 11. UI Forecast **[T2]**

### 11.1 Konfigurasi

```text
Forecast

Dataset:   Penjualan 2026 (v3)
Waktu:     tanggal_pesanan          Target: omzet_bersih
Granularitas: [Harian ▼]            Horizon: [90 hari ▼]   (Free: maks 30 hari 🔒)
Seri:      [Agregat ▼]              (Free: agregat; Pro: hingga 50 seri)

Kelayakan data:  ✓ 420 hari histori   ✓ Tanpa celah   ⚠ 14% hari bernilai nol

[Jalankan Forecast]
```

Opsi di luar paket ditampilkan terkunci dengan penjelasan (`PLAN_FEATURE_LOCKED`), bukan disembunyikan.

### 11.2 Hasil (dari K-8)

```text
Forecast Omzet

Histori ───────────── Forecast
                 │       ╭──────  ← median
────────────╮    │    ╭──╯      ░░ interval 80%
            ╰────┼────╯         ░░░░ interval 95%

Perkiraan 90 hari: Rp 3,82 M   (▲ 8,4% vs periode sebelumnya)
Interval 80%: Rp 3,41 M - Rp 4,19 M      Keyakinan: Sedang
```

```text
Perbandingan Model (backtest 5 lipatan)
┌──────────────────┬────────┬────────┬────────┬────────┐
│ Model            │ MAE    │ WAPE   │ MASE   │ Status │
├──────────────────┼────────┼────────┼────────┼────────┤
│ Seasonal Naive * │ 124 rb │ 11,2%  │ 0,91   │ baseline│
│ AutoARIMA        │ 118 rb │ 10,8%  │ 0,86   │        │
│ LightGBM         │  91 rb │  8,1%  │ 0,71   │ ★ terpilih│
└──────────────────┴────────┴────────┴────────┴────────┘
Terpilih karena WAPE backtest terbaik dan lolos gating terhadap baseline.
```

*(Angka adalah ilustrasi.)*

| Elemen | Tampilan |
|---|---|
| `history` + `forecast` | Chart garis + pita interval 80/95% |
| `summary` | Total, perubahan vs periode sebelumnya, interval |
| `models` + `champion` | Tabel perbandingan, baseline ditandai, alasan |
| `feasibility` | Daftar pemeriksaan (✓/⚠) sebelum & sesudah run |
| `explanation` | Faktor utama **dengan label metode** ("dekomposisi pola historis, bukan atribusi model" bila relevan) + keyakinan |
| `backtest` | Rincian per lipatan (**Pro**); ringkasan metrik (Free) |
| Gating gagal | Banner jelas: *"Pola data belum cukup stabil untuk model lanjutan; ini estimasi sederhana."* |
| `reproducibility` | Panel "Detail teknis" (hash konfigurasi, versi) |

### 11.3 Job & statusnya

Forecast berjalan asinkron (K-3): antrean → proses → selesai, dengan progres, estimasi waktu, dan opsi batalkan. Hasil tersimpan dan dapat dibuka kembali; "Jalankan ulang pada data terbaru".

### 11.4 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-52 | Konfigurasi forecast dengan default cerdas & batas paket terlihat | M | T2 |
| W-53 | Tampilan kelayakan data | M | T2 |
| W-54 | Job forecast dengan progres, batal, status | M | T2 |
| W-55 | Chart forecast + interval 80/95% | M | T2 |
| W-56 | Tabel perbandingan model + baseline + alasan terpilih | M | T2 |
| W-57 | Penjelasan & keyakinan sesuai K-8 | M | T2 |
| W-58 | Banner gating baseline | M | T2 |
| W-59 | Ekspor hasil (CSV/PNG; PDF/XLSX Pro) & simpan | M | T2 |

---

## 12. Dashboard Ringkasan

Menjawab: *"Bagaimana kondisi bisnis saya?"*

```text
Selamat pagi, <nama>

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Omzet      │ │ Pesanan    │ │ AOV        │
│ Rp 1,24 M  │ │ 24.381     │ │ Rp 50,9 rb │
│ ▲ 12,4%    │ │ ▲ 8,2%     │ │ ▲ 3,9%     │
└────────────┘ └────────────┘ └────────────┘

Tren Omzet (90 hari)   [grafik]

INSIGHT MINGGU INI [T2]
⚠ Omzet turun 8,4% di wilayah Timur.       (Fakta)
✓ Produk A menyumbang 34% pertumbuhan.     (Fakta)

[Tanya AI]   [Buat Forecast]
```

- **KPI dihitung dari definisi glosarium secara deterministik (SQL), tanpa LLM**, sehingga tidak memakai kuota AI dan murah. Pengguna memilih 4-6 KPI dan periode pembanding.
- *Insight minggu ini* [T2] berasal dari analisis terjadwal (job) dengan label Fakta/Inferensi; kosong bila belum ada data cukup.
- Keadaan kosong memandu ke unggah data.

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-130 | KPI dari glosarium (tanpa LLM) + periode pembanding | M | T1 |
| W-131 | Grafik tren + pemilihan periode | M | T1 |
| W-132 | Insight mingguan otomatis berlabel | S | T2 |
| W-133 | Keadaan kosong & pintasan aksi | M | T1 |

---

## 13. Analisis Tersimpan, Laporan & Ekspor

### 13.1 Analisis tersimpan **[T1]**

Menyimpan: nama, dataset + **versi**, pertanyaan, SQL, chart, filter, **definisi metrik saat itu**, hasil, waktu. Aksi: buka, **jalankan ulang pada data terbaru**, ganti nama, hapus. Batas jumlah sesuai paket; melebihi batas saat turun paket → read-only (§14.7).

### 13.2 Ekspor

| Format | Tahap | Paket |
|---|---|---|
| CSV (data hasil) | T1 | Free & Pro |
| PNG (chart) | T1 | Free (watermark kecil), Pro (tanpa) |
| PDF, XLSX | T2 | Pro |
| PowerPoint, email terjadwal, API | Later | Pro/Bisnis |

**Keamanan ekspor:** cegah *CSV/formula injection* (sel yang diawali `=`, `+`, `-`, `@` diberi awalan aman) pada CSV dan XLSX; nama file disanitasi.

### 13.3 Laporan **[T2, Pro]**

Jenis: Laporan Bisnis, Laporan Forecast, Laporan Penjualan, Ringkasan Eksekutif, Analisis Kustom. **Report builder:** pilih blok (KPI, chart, temuan, tabel, forecast) dari analisis tersimpan → pratinjau → ekspor PDF/XLSX. PDF dirender di worker (mis. headless Chromium) dengan gaya cetak vektor. **Ringkasan mingguan via email** (job terjadwal, zona WIB, dapat dijeda).

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-65 | Simpan analisis + jalankan ulang pada data terbaru | M | T1 |
| W-66 | Ekspor CSV & PNG (watermark Free) dengan pencegahan formula injection | M | T1 |
| W-67 | Ekspor PDF/XLSX (Pro) | M | T2 |
| W-68 | Report builder dengan blok & pratinjau | S | T2 |
| W-69 | Ringkasan mingguan via email (jadwal, jeda, berhenti berlangganan) | S | T2 |

---

## 14. Paket, Kuota, Langganan & Billing

Aturan bisnis (paket, harga, trial, grace, turun paket) ada di [PRD-00 §8]. Bagian ini mendefinisikan **implementasi**. Penghitungan kuota dari sisi AI mengikuti K-5.

### 14.1 Katalog entitlement 🔸

Entitlement disimpan sebagai **data/konfigurasi** (tabel `plans` + `plan_entitlements`), tidak di-hardcode.

| Kunci entitlement | Free | Pro |
|---|---|---|
| `members_max` | 1 | 1 |
| `datasets_active_max` | 3 | 50 |
| `file_size_mb_max` | 50 | 1.024 |
| `storage_mb_max` | 500 | 10.240 |
| `ai_question_daily` | 10 | — |
| `ai_question_monthly` | 100 | fair-use ≈ 1.000 |
| `chat_history_days` | 30 | 365 |
| `saved_analyses_max` | 10 | 500 |
| `cross_dataset_analysis` | tidak | ya |
| `forecast_monthly` | 3 | 50 |
| `forecast_horizon_days_max` | 30 | 365 |
| `forecast_models_allowed` | baseline, ETS | semua |
| `forecast_series_max` | 1 | 50 |
| `export_formats` | csv, png | csv, png, pdf, xlsx |
| `export_watermark` | ya | tidak |
| `reports_enabled` / `weekly_email_summary` | tidak | ya |
| `anomaly_alerts` **[Later]** | tidak | ya |
| `db_connections_max` **[Later]** | 0 | 1 |
| `support_tier` | pusat bantuan | email (1 hari kerja 🔸) |

Setiap entitlement punya `periode` (`hari` · `bulan` · `sekali`/gauge) dan `perilaku_saat_penuh` (`block` · `throttle` · `degrade`; mis. Pro fair-use → `throttle`/alihkan ke model hemat).

### 14.2 Layanan Entitlement & penghitungan kuota

```text
Permintaan fitur berbatas ──► Entitlement.reserve(org, metrik, qty, run_id)
                                 ├─ ditolak → HTTP 403 + galat K-2 (QUOTA_EXCEEDED | PLAN_FEATURE_LOCKED)
                                 └─ diizinkan → reservasi (TTL 5 menit) → eksekusi
                              ──► selesai: commit(usage_event, K-5)   |  gagal/klarifikasi/cache: release()
```

- **Idempoten** pada `run_id`/`event_id`. Reservasi kedaluwarsa otomatis (anti-bocor kuota).
- **Aturan hitung** mengikuti PRD-00 §11.5 (klarifikasi, penolakan, kegagalan sistem, dan cache hit tidak mengurangi kuota).
- **Zona & reset:** harian reset **00.00 WIB**; bulanan Free per bulan kalender WIB; Pro per periode tagihan; waktu disimpan UTC.
- `usage_counters(organization_id, metrik, period_key, terpakai)`; gauge `storage_bytes` dihitung ulang berkala.
- **Frontend hanya menampilkan**; keputusan akses selalu di server.
- Pengaturan khusus per organisasi (override entitlement, "Pilot Pro") lewat admin (§14.10).

### 14.3 Status langganan

| Status | Arti | Akses |
|---|---|---|
| `free` | Paket gratis | Batas Free |
| `trialing` | Reverse trial Pro 14 hari | Fitur Pro dengan plafon trial (≤ 100 pertanyaan, ≤ 5 forecast 🔸) |
| `active` | Berlangganan, periode berjalan | Pro penuh |
| `active` + `cancel_at_period_end` | Pembatalan dijadwalkan | Pro sampai akhir periode |
| `past_due` | Perpanjangan belum berhasil | Pro tetap aktif selama grace 7 hari 🔸 |
| kembali ke `free` | Trial habis / grace habis / periode batal berakhir | Batas Free, data utuh (§14.7) |

```text
Daftar ─► FREE ─► (trial / upgrade) ─► TRIALING ─► (bayar) ─► ACTIVE ─► (periode berikut, bayar) ─┐
            ▲                               │                    │  ▲                            │
            │                  (trial habis, belum bayar)         │  └─────(bayar berhasil)───────┘
            ◄───────────────────────────────┘                     ▼
            ◄── (batal dijadwalkan, periode berakhir) ◄── ACTIVE   PAST_DUE ─(grace 7 hari habis)─► FREE
```

**Satu state machine** menangani semua perubahan status; tidak ada kode lain yang boleh mengubah `subscriptions.status`. Setiap transisi dicatat di `subscription_events`.

### 14.4 Alur langganan

1. **Daftar:** langsung Free tanpa kartu.
2. **Reverse trial:** Pro 14 hari tanpa kartu; otomatis kembali ke Free di hari ke-15 bila tidak bayar. Satu trial per organisasi (dedup email terverifikasi & domain). Efektivitas diuji vs tanpa trial selama pilot.
3. **Titik upgrade kontekstual** (bukan popup acak): batas harian tercapai; forecast > 30 hari; ekspor PDF; file > 50 MB; analisis lintas dataset. Setiap prompt menjelaskan apa yang terbuka, harga, dan tombol **"Nanti saja"**; hasil lama tetap terlihat.
4. **Checkout:** pilih bulanan/tahunan → ringkasan (harga, pajak, total, tanggal perpanjangan) → metode bayar (halaman/komponen *hosted* gateway; data kartu **tidak** menyentuh server kita) → konfirmasi. Pro aktif segera setelah **webhook pembayaran terverifikasi**, bukan saat tombol diklik.
5. **Metode bayar & perpanjangan:** kartu dan sebagian e-wallet dapat di-debit berulang; VA bank dan QRIS umumnya per tagihan. Dua mode:
   - **Auto-renew** (metode yang mendukung tokenisasi; dukungan per metode **dikonfirmasi ke gateway**).
   - **Bayar per periode** (VA/QRIS): invoice + pengingat **H-7, H-3, H-1** (email + notifikasi dalam aplikasi); Pro berlaku sampai periode berakhir. Tidak menjanjikan auto-renew untuk metode yang tidak mendukungnya.
6. **Ganti paket/siklus:** bulanan → tahunan berlaku segera dengan **kredit prorata** sisa periode; Pro → Free di **akhir periode**; tanpa refund sisa periode kecuali garansi 7 hari pembayaran pertama bila disetujui (PRD-00 §19).
7. **Gagal bayar (dunning):** auto-renew dicoba ulang H+1, H+3, H+5 🔸 dengan notifikasi tiap percobaan; bayar-per-periode: invoice kedaluwarsa di akhir periode. Keduanya: `past_due` → grace 7 hari → Free (data utuh).
8. **Pembatalan:** Pengaturan → Langganan → Batalkan; dua klik; alasan opsional; konfirmasi email; pembatalan dapat dibatalkan sebelum periode berakhir.
9. **Reaktivasi:** kapan saja; seluruh data dan pengaturan Pro pulih.

### 14.5 Pajak, invoice & kepatuhan

- Harga tampil jelas **termasuk/belum termasuk PPN**; perlakuan PPN & faktur pajak dikonfirmasi ke konsultan pajak (PRD-00 §19).
- **Invoice PDF** dengan nomor berurutan, rincian, dan data usaha (nama usaha & **NPWP opsional**); bukti pembayaran; riwayat dapat diunduh.
- Kebijakan refund dan syarat langganan tertulis, mudah ditemukan; deskriptor tagihan yang jelas untuk menekan sengketa.

### 14.6 Webhook & rekonsiliasi

- Verifikasi tanda tangan webhook gateway; pemrosesan **idempoten** lewat `webhook_events(event_id UNIK)`.
- Pembayaran VA/QRIS asinkron: status diperbarui saat webhook tiba; **rekonsiliasi harian** membandingkan `payments` dengan laporan gateway untuk menangkap webhook yang hilang.
- Webhook ganda tidak menggandakan perpanjangan; urutan event yang terbalik ditangani lewat state machine.

### 14.7 Aturan turun paket (data tidak dihapus)

Berlaku saat trial berakhir, grace habis, atau pembatalan selesai.

| Yang melebihi batas Free | Perlakuan implementasi |
|---|---|
| Dataset > 3 | Pengguna memilih 3 dataset aktif (default: 3 terbaru); sisanya `ARCHIVED`: bisa dilihat, diunduh, dihapus; tolak tanya/forecast dengan `DATASET_ARCHIVED` |
| File > 50 MB | `ARCHIVED` |
| Penyimpanan > 500 MB | Blokir unggah baru; data lama tetap |
| Analisis tersimpan > 10 | Read-only; membuat baru perlu menghapus/upgrade |
| Laporan & ringkasan terjadwal | Dijeda; konfigurasi disimpan |
| Riwayat > 30 hari | Disembunyikan (bukan dihapus); ekspor/hapus tersedia kapan saja |
| Forecast lama | Tetap bisa dibuka |

**H-7 sebelum turun paket:** email + notifikasi yang menjelaskan apa yang akan diarsipkan dan cara mengekspor. Akun tanpa aktivitas lama (mis. 12 bulan 🔸) dihapus sesuai retensi, **dengan pemberitahuan sebelumnya**.

### 14.8 Persyaratan

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-80 | Katalog paket & entitlement sebagai data/konfigurasi | M | T1 |
| W-81 | Entitlement Service: reserve/commit/release idempoten + TTL reservasi | M | T1 |
| W-82 | Penghitung pemakaian per organisasi/periode (zona WIB) + pengukur penyimpanan | M | T1 |
| W-83 | Meter pemakaian UI + peringatan 80%/100% | M | T1 |
| W-84 | Admin: lihat/ubah paket, flag "Pilot Pro", kredit manual, override entitlement | S | T1 |
| W-85 | Halaman `/harga` (Free vs Pro, toggle bulanan/tahunan, FAQ) | M | T2 |
| W-86 | Reverse trial Pro 14 hari dengan plafon & dedup | S | T2 |
| W-87 | Checkout bulanan/tahunan lewat gateway lokal (IDR), hosted | M | T2 |
| W-88 | Metode bayar VA/QRIS/e-wallet/kartu; mode auto-renew vs bayar-per-periode + pengingat | M | T2 |
| W-89 | Upgrade segera + prorata; downgrade akhir periode | M | T2 |
| W-90 | Pembatalan self-serve (2 klik) + pembatalan pembatalan | M | T2 |
| W-91 | Dunning & grace 7 hari | M | T2 |
| W-92 | Aturan turun paket §14.7 + notifikasi H-7 | M | T2 |
| W-93 | Invoice PDF, bukti bayar, NPWP opsional | M | T2 |
| W-94 | Webhook idempoten + rekonsiliasi harian + state machine tunggal | M | T2 |
| W-95 | Email transaksional siklus langganan (§14.9) | M | T2 |
| W-96 | Analitik funnel langganan (§19) | S | T2 |
| W-97 | Kode promo, referral, add-on kuota, paket Bisnis | C | Later |

Uji otomatis wajib: kuota tidak bocor antar organisasi; webhook ganda tidak menggandakan perpanjangan; turun paket tidak menghapus data; grace berakhir tepat waktu; reservasi kedaluwarsa dilepas.

### 14.9 UI & komunikasi

- **`/harga`:** dua kolom Free vs Pro dari katalog entitlement (satu sumber), toggle bulanan/tahunan, FAQ jujur.
- **`/app/pengaturan/langganan`:** paket saat ini; pemakaian (pertanyaan hari ini/bulan ini, forecast, penyimpanan) dengan bar & waktu reset; tanggal perpanjangan; metode bayar; riwayat invoice; ubah paket; batalkan.
- **Prompt batas tercapai (contoh):**

```text
Anda sudah memakai 10 dari 10 pertanyaan hari ini. Kuota kembali besok pukul 00.00 WIB.
Dengan Pro: hingga ± 1.000 pertanyaan per bulan, forecast sampai 365 hari, dan laporan PDF.

[Lihat paket Pro]   [Nanti saja]
```

- **Email transaksional:** selamat datang; trial H-3 & berakhir; invoice; pembayaran berhasil; pengingat perpanjangan H-7/H-3/H-1; pembayaran gagal; pembatalan dikonfirmasi; pemberitahuan turun paket H-7; reaktivasi. Pengingat WhatsApp **[Later]** (butuh persetujuan penerima).

### 14.10 Urutan rilis

1. **Tahap 1 (pilot):** entitlement & kuota Free aktif sejak awal (kontrol biaya); semua peserta pilot mendapat "Pilot Pro" manual dari admin tanpa pembayaran.
2. **Opsional sebelum gateway siap:** penagihan manual (transfer + invoice) untuk 10-20 pelanggan pertama.
3. **Tahap 2:** gateway penuh (checkout, trial, dunning, rekonsiliasi).
4. **Setelah itu:** promo, referral, add-on kuota, paket Bisnis.

---

## 15. Background Jobs, Caching & Realtime

### 15.1 Jobs

| Jenis job | Contoh | Tahap |
|---|---|---|
| Ingestion | Validasi, parse, profiling, Parquet | T1 |
| Indexing RAG | Embedding skema/metrik/nilai (PRD-02 §6.5) | T1 |
| Forecast | Training + backtest (PRD-02 §10) | T2 |
| Laporan | Render PDF/XLSX | T2 |
| Terjadwal | Ringkasan mingguan, insight mingguan, dunning, pengingat | T2 |
| Pemeliharaan | Rekonsiliasi pembayaran, pembersihan reservasi, retensi akun | T2 |

**Persyaratan:** idempoten; retry maks 3× dengan backoff untuk galat transien; batas waktu per jenis; *dead-letter queue*; prioritas dasar per paket (Pro lebih dulu, tanpa mengorbankan keadilan); dapat dibatalkan; status & progres lewat K-3.

```text
API → (daftarkan job) → 202 Accepted {job_id, status: QUEUED}
        → Worker → hasil ke DB/objek → event SSE job.progress / job.completed / job.failed
```

### 15.2 Caching

| Cache | TTL 🔸 | Catatan |
|---|---|---|
| Skema/konteks dataset | 1 jam | Invalidasi saat versi/glosarium berubah |
| Hasil query (kunci: SQL ternormalisasi + `dataset_version_id`) | 24 jam | Tidak mengurangi kuota |
| Embedding kueri | Pendek | Hemat biaya |
| Sesi, rate limiter, status job | Sesuai kebutuhan | |

Redis hanya dipakai bila antrean/cache berbasis Postgres terbukti tidak cukup (keputusan terbuka §24).

### 15.3 Realtime

SSE untuk progres job dan streaming jawaban (K-3); koneksi ulang otomatis dengan `Last-Event-ID`; fallback polling `/jobs/{id}`.

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-100 | Antrian job idempoten + retry + DLQ + batal | M | T1 |
| W-101 | Progres & hasil job via SSE + fallback polling | M | T1 |
| W-102 | Cache hasil query & skema dengan invalidasi benar | M | T1 |
| W-103 | Penjadwal job terjadwal (zona WIB) | S | T2 |

---

## 16. API Aplikasi

Konvensi: `/api/v1`, JSON, otentikasi cookie/token, **amplop galat K-2**, paginasi kursor, `Idempotency-Key` untuk operasi mahal (unggah, forecast, checkout), rate limit per organisasi (429), versi API. Endpoint AI mengikuti K-1/K-8.

| Domain | Endpoint (contoh) |
|---|---|
| Auth | `POST /auth/register` · `/auth/login` · `/auth/google` · `/auth/reset` · `POST /auth/logout` |
| Organisasi | `GET /org` · `PATCH /org` · `DELETE /org` · `POST /org/export` |
| Dataset | `POST /datasets` (unggah chunked) · `GET /datasets` · `GET /datasets/{id}` · `GET /datasets/{id}/profile` · `GET /datasets/{id}/versions` · `PATCH /datasets/{id}/columns/{col}` (mode PII) · `POST /datasets/{id}/archive` · `DELETE /datasets/{id}` |
| Glosarium | `GET /metrics` · `POST /metrics` · `PUT /metrics/{id}` · `POST /metrics/validate` · `GET /metrics/{id}/versions` · `GET/PUT /relations` |
| Analyst | `POST /analyst/conversations` · `POST /analyst/query` (→ stream K-3, hasil K-1) · `GET /analyst/runs/{id}` · `GET /analyst/runs/{id}/sql` · `POST /analyst/sql/execute` · `POST /analyst/runs/{id}/feedback` (K-6) |
| Forecast | `POST /forecasts` · `GET /forecasts/{id}` · `GET /forecasts/{id}/results` (K-8) · `POST /forecasts/{id}/cancel` |
| Dashboard | `GET /dashboard/kpis` · `PUT /dashboard/kpis` |
| Tersimpan & laporan | `POST/GET /saved` · `POST /saved/{id}/rerun` · `POST /reports` · `GET /reports/{id}` · `GET /reports/{id}/download` · `PUT /reports/schedule` |
| Jobs & realtime | `GET /jobs/{id}` · `GET /events` (SSE) |
| Langganan | `GET /billing/plan` · `GET /billing/usage` · `POST /billing/checkout` · `POST /billing/change-plan` · `POST /billing/cancel` · `POST /billing/resume` · `GET /billing/invoices` · `GET /billing/invoices/{id}/pdf` |
| Webhook | `POST /webhooks/payments/{gateway}` (verifikasi tanda tangan) |
| Admin | `/admin/*` (peran staf, MFA, audit) |

---

## 17. Model Data Platform

Entitas AI (analisis, glosarium, RAG, forecast, golden set) ada di [PRD-02 §16].

```text
users                    id, email, password_hash, full_name, email_verified_at, created_at
organizations            id, name, slug, created_at, deleted_at
organization_members     id, organization_id, user_id, role, joined_at
datasets                 id, organization_id, name, source_type, template_id, status, created_at
dataset_versions         id, dataset_id, version, storage_path_raw, storage_path_parquet, row_count, file_size, created_at
dataset_columns          id, dataset_version_id, name, data_type, role, pii_mode, statistics_json
data_sources             id, organization_id, type, name, status
connections [Later]      id, data_source_id, encrypted_credentials, host, port, db_name
saved_analyses           id, organization_id, user_id, dataset_version_id, question, sql, chart_json, metric_versions_json, result_ref, created_at
reports                  id, organization_id, user_id, title, blocks_json, export_url, created_at
report_schedules         id, organization_id, report_id, cron_wib, enabled
dashboard_kpis           id, organization_id, metric_id, position, comparison_period
jobs                     id, organization_id, kind, status, progress_json, attempts, result_ref, error_json
notifications            id, organization_id, user_id, kind, payload, read_at

plans                    id, kode (free|pro), nama, aktif
plan_entitlements        plan_id, kunci, nilai, periode, perilaku_saat_penuh
subscriptions            id, organization_id, plan_id, status, siklus, period_start, period_end, trial_end,
                         cancel_at_period_end, grace_until, source (self|pilot_manual|manual_invoice),
                         gateway_customer_id, gateway_subscription_id
subscription_events      id, subscription_id, dari_status, ke_status, alasan, actor, created_at
entitlement_overrides    id, organization_id, kunci, nilai, alasan, berlaku_sampai, set_by
invoices                 id, nomor, organization_id, jumlah, pajak, status, jatuh_tempo, billing_name, npwp
payments                 id, invoice_id, gateway_ref, metode, status, dibayar_pada, biaya_gateway
payment_methods          id, organization_id, token_gateway, tipe, last4
usage_counters           id, organization_id, metrik, period_key, terpakai
usage_events             event_id UNIK, organization_id, user_id, metrik, quantity, counted, run_id, occurred_at
webhook_events           event_id UNIK, gateway, payload, status_proses, received_at
email_events             id, organization_id, kind, status, sent_at
audit_logs               id, organization_id, user_id, action, resource, ip, user_agent, created_at
```

Semua tabel dengan data tenant: `organization_id NOT NULL` + **RLS**. `usage_events` dan `webhook_events` memakai kunci unik untuk idempotensi.

---

## 18. Keamanan Platform

Kebijakan produk: [PRD-00 §12]. Keamanan AI & validasi SQL: [PRD-02 §8].

### 18.1 Otentikasi & otorisasi
Kata sandi di-hash (algoritma modern berfaktor kerja adaptif), sesi aman, rate limit & penguncian, otorisasi berbasis peran di setiap endpoint (*deny by default*), MFA admin.

### 18.2 Isolasi tenant
- **Row-Level Security** pada semua tabel ber-`organization_id`; konteks tenant diset per koneksi/transaksi dari klaim token terverifikasi.
- Path penyimpanan terpartisi per tenant; URL unduhan bertanda tangan berumur pendek.
- **Tes otomatis lintas-tenant** (CI) untuk semua endpoint dan akses penyimpanan, termasuk tabel RAG.
- Cache dan job membawa `organization_id` dan diperiksa saat dibaca.

### 18.3 Sandbox eksekusi query
- Eksekusi SQL berjalan di **proses/kontainer terisolasi** tanpa akses jaringan keluar, filesystem hanya-baca (kecuali direktori sementara), batas CPU/memori/waktu (cgroup/ulimit).
- DuckDB dikonfigurasi menonaktifkan akses eksternal (file/URL arbitrer, ekstensi, `COPY`, `ATTACH`) dan **mengunci konfigurasi** setelah inisialisasi *(verifikasi nama pengaturan pada versi yang dipakai)*.
- Hanya **view terisolasi** atas Parquet milik organisasi yang diekspos per eksekusi; hasil dibatasi baris.
- Dashboard KPI memakai sandbox yang sama.

### 18.4 Keamanan unggahan & ekspor
Validasi §8.2 (magic bytes, antivirus, batas dekompresi); penyimpanan terenkripsi; **pencegahan formula injection** pada ekspor (§13.2); sanitasi nama file; pembatasan jenis konten saat disajikan.

### 18.5 Rahasia & enkripsi
Enkripsi at-rest (AES-256 atau setara) dan in-transit (TLS modern); **kunci dikelola KMS/vault**; kredensial koneksi database terenkripsi dan tidak pernah ditampilkan ulang atau dikirim ke LLM; rotasi rahasia; tidak ada rahasia di log.

### 18.6 Pembayaran
Checkout *hosted*/tokenisasi gateway (data kartu tidak menyentuh server kita, cakupan PCI minimal); verifikasi tanda tangan webhook; tidak menyimpan nomor kartu; hak akses billing hanya Owner.

### 18.7 Privasi
Mode PII per kolom; **ekspor dan hapus data** mandiri; opt-in eksplisit untuk penggunaan data peningkatan produk (default mati); persetujuan cookie/analitik; retensi & penghapusan termasuk embedding dan cache; halaman privasi publik.

### 18.8 Operasional
Audit log (§7.4 W-15, akses admin dicatat); **tidak ada impersonasi admin tanpa izin tercatat**; backup harian terenkripsi + uji pemulihan; pemindaian dependensi & kerentanan di CI; peninjauan akses berkala; rencana respons insiden (termasuk notifikasi sesuai UU PDP).

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-110 | RLS + tes lintas-tenant otomatis | M | T1 |
| W-111 | Sandbox eksekusi query terisolasi | M | T0 |
| W-112 | Keamanan unggahan & ekspor (§18.4) | M | T1 |
| W-113 | KMS/vault, enkripsi, tanpa rahasia di log | M | T1 |
| W-114 | Ekspor & hapus data mandiri; opt-in data produk | M | T1 |
| W-115 | Backup & uji pemulihan; scan dependensi di CI | M | T1 |
| W-116 | Rencana respons insiden & prosedur notifikasi PDP | M | T2 |

---

## 19. Observabilitas Platform & Analitik Produk

- **Teknis:** `request_id` lintas layanan, log terstruktur (tanpa PII mentah), metrik (latensi, galat, antrean job, durasi upload/profiling, tingkat keberhasilan unggah), error tracking, health check, peringatan.
- **Dashboard internal:** keberhasilan upload, durasi pemrosesan, antrean/DLQ, galat per endpoint, pemakaian & biaya per organisasi (bersama PRD-02 §15), kesehatan webhook & rekonsiliasi pembayaran.
- **Analitik produk (tanpa PII, dengan persetujuan):**

```text
signup → email_verified → dataset_uploaded → mapping_confirmed → dataset_ready
→ first_question → first_answer → thumbs_up/down → saved_analysis → forecast_run
→ quota_warning_80 → quota_hit → upgrade_prompt_shown → trial_started → subscribed
→ renewal_failed → canceled → downgraded
```

Dipakai untuk metrik PRD-00 §9.1 (activation, time-to-first-insight, konversi, churn, titik paywall).

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| W-120 | Log terstruktur + `request_id` + metrik inti + error tracking | M | T1 |
| W-121 | Dashboard internal teknis & biaya | S | T1 |
| W-122 | Event analitik funnel (§19) dengan persetujuan | M | T1 |

---

## 20. Persyaratan Non-Fungsional (Web & Platform)

| Aspek | Target 🔸 |
|---|---|
| Muat halaman awal (LCP) | < 2,5 detik |
| API sederhana | < 500 ms (p95) |
| Unggah & profiling | 100 ribu baris < 60 detik; umpan balik progres < 2 detik |
| Query SQL sederhana | < 3 detik |
| Respons AI pertama | < 8 detik (p95) dengan streaming status |
| Ketersediaan | ≥ 99,5% |
| Pemulihan | RPO ≤ 24 jam, RTO ≤ 8 jam |
| Skala awal | 100 organisasi aktif; dataset ~ 1 juta baris per file |
| Browser | Dua versi terbaru Chrome, Edge, Firefox, Safari |
| Responsif | Laptop & tablet penuh; mobile web baca-saja |
| Aksesibilitas | WCAG 2.1 AA untuk alur inti |
| Bahasa | ID utama, EN sekunder |
| Degradasi anggun | LLM mati → mode manual (§10.5) |

---

## 21. Struktur Kode, Stack & Praktik Rekayasa

### 21.1 Frontend

```text
src/
├── app/                  (Next.js App Router: publik, /app, /admin)
├── components/
│   ├── layout/  navigation/  ui/ (shadcn)
│   ├── dashboard/
│   ├── analyst/   (Chat, ResponseView, FindingChip, SQLViewer, DataTable, DynamicChart, ConfidenceBadge, ClarificationOptions, ContextPanel, UsageMeter)
│   ├── forecasting/ (ForecastConfig, ForecastChart, ModelComparison, FeasibilityList, ExplanationCard)
│   ├── datasets/  (Uploader, MappingConfirm, ProfileCard, PiiModes)
│   ├── metrics/   (MetricList, MetricEditor, VersionHistory)
│   ├── reports/   billing/ (PlanCard, UsagePanel, UpgradePrompt, InvoiceList)
├── hooks/  (useAnalystStream, useJob, useEntitlements, useDataset)
└── lib/    (api client, kontrak K-1..K-8 (tipe dihasilkan dari JSON Schema), formatters id-ID)
```

### 21.2 Backend

```text
backend/app/
├── api/v1/        (auth, org, datasets, metrics, analyst, forecasts, dashboard, saved, reports, billing, jobs, admin, webhooks)
├── core/          (config, security, db, tenant context)
├── models/  schemas/
├── services/      (datasets/, ingestion/, templates/ (marketplace), profiling/, pii/, entitlements/, billing/, reports/, notifications/)
├── ai_client/     (klien ke AI Service via kontrak K-1..K-8)
├── workers/       (ingestion, indexing, forecast, report, scheduled, billing)
└── observability/
```

### 21.3 Praktik

- **Kontrak:** tipe frontend dan validator backend dihasilkan dari **JSON Schema K-1..K-8**; *contract test* di CI untuk kedua sisi.
- **Pengujian:** unit, integrasi (DB, storage, gateway sandbox), e2e (alur: daftar→unggah→tanya→simpan→upgrade→batal), uji beban (unggah & antrean job), uji keamanan lintas-tenant.
- **Lingkungan:** dev, staging (gateway sandbox), produksi; *feature flag* per organisasi (mis. RAG, trial).
- **CI/CD:** lint, tipe, tes, scan dependensi, migrasi Alembic yang dapat dibalik, deploy bertahap.

---

## 22. User Stories & Acceptance Criteria

**US-W1 Unggah & profiling.** Sebagai pemilik toko, saya mengunggah export Shopee agar langsung bisa bertanya.
*Acceptance:* CSV/XLSX ≤ batas paket terunggah; sumber & kolom terdeteksi; konfirmasi mapping satu layar; ringkasan (baris, rentang tanggal, kualitas) muncul < 60 detik untuk 100 ribu baris; galat file memberi pesan yang bisa ditindaklanjuti.

**US-W2 Insight pertama.** Sebagai pengguna baru, saya mendapat jawaban pertama dalam 5 menit.
*Acceptance:* median waktu daftar→jawaban pertama < 5 menit di pilot; saran pertanyaan berasal dari data saya; data contoh tersedia.

**US-W3 Privasi.** Sebagai pengguna, saya ingin data pelanggan saya tidak diekspos.
*Acceptance:* kolom PII terdeteksi; default masking ke LLM; penghapusan dataset menghapus file mentah, Parquet, cache, dan indeks RAG; audit log mencatat akses.

**US-W4 Lihat & edit SQL.** *Acceptance:* SQL tersembunyi default, dapat dibuka, diedit, dijalankan ulang dengan validasi yang sama; hasil tampil.

**US-W5 Kuota.** Sebagai pengguna Free, saya melihat sisa kuota dan waktu reset.
*Acceptance:* meter akurat; peringatan 80%/100%; saat penuh, prompt menjelaskan dan tidak menyembunyikan hasil lama.

**US-W6 Upgrade.** *Acceptance:* checkout menampilkan harga, pajak, total, tanggal perpanjangan; Pro aktif setelah pembayaran terverifikasi; invoice tersedia.

**US-W7 Pembatalan.** *Acceptance:* dua klik; akses Pro sampai akhir periode; konfirmasi email; dapat dibatalkan sebelum periode berakhir.

**US-W8 Gagal bayar.** *Acceptance:* notifikasi tiap percobaan; Pro aktif selama grace 7 hari; setelah itu Free dengan data utuh.

**US-W9 Turun paket.** *Acceptance:* tidak ada data terhapus; dataset berlebih diarsipkan dan dapat diunduh; notifikasi H-7.

**US-W10 Glosarium.** Sebagai pengguna, saya mengubah definisi "omzet" agar sesuai praktik saya.
*Acceptance:* validasi langsung; versi tersimpan; analisis berikutnya memakai definisi baru; riwayat tersedia.

**US-W11 Simpan & ekspor.** *Acceptance:* analisis tersimpan memuat versi dataset & definisi metrik; "jalankan ulang pada data terbaru"; CSV/PNG; PDF/XLSX untuk Pro; tanpa formula injection.

**US-W12 Mode manual.** *Acceptance:* saat LLM tak tersedia, editor SQL, tabel, dan chart tetap berfungsi dengan pesan yang jelas.

---

## 23. Tahap & Definition of Done (Web & Platform)

### Fase 0 (Fondasi)
1. Repo, CI/CD, lingkungan dev/staging, migrasi, RLS dasar, auth dasar, ekstensi vektor aktif
2. Kerangka design system & layout; log terstruktur

### Tahap 0 (Alpha)
3. Upload CSV/XLSX → profiling → UI tanya minimal → tampilkan hasil/SQL
4. Sandbox eksekusi query terisolasi (W-111)

### Tahap 1 (MVP Analyst)
5. Registrasi, verifikasi email, login, workspace, ekspor/hapus data (W-10..W-15)
6. Upload + validasi + template Shopee/Tokopedia + profiling + skor + PII + versi (W-20..W-29)
7. UI glosarium (W-35..W-38) dan UI AI Analyst lengkap (W-40..W-49)
8. Dashboard KPI tanpa LLM (W-130..W-133); simpan analisis; ekspor CSV/PNG (W-65, W-66)
9. Entitlement & kuota Free ditegakkan di server + meter UI (W-80..W-84)
10. Jobs, SSE, cache (W-100..W-102)
11. Keamanan: RLS + tes lintas-tenant, keamanan unggahan/ekspor, KMS, backup (W-110..W-115)
12. Observabilitas & analitik funnel (W-120..W-122); halaman privasi & keamanan publik
13. Contract test K-1..K-7 lulus di CI
14. Pilot berjalan dengan "Pilot Pro" manual

### Tahap 2 (Forecasting & Langganan Pro)
15. UI Forecast lengkap (W-52..W-59); contract test K-8
16. Laporan PDF/XLSX, ringkasan mingguan (W-67..W-69); insight mingguan (W-132)
17. `/harga`, trial, checkout, metode bayar, upgrade/downgrade, pembatalan, dunning, turun paket, invoice, webhook & rekonsiliasi, email (W-85..W-95)
18. Respons insiden & notifikasi PDP (W-116); MFA opsional (W-16)

---

## 24. Risiko & Keputusan Terbuka (Web & Platform)

| # | Risiko | Mitigasi |
|---|---|---|
| WP-R1 | Format export marketplace berubah | Versi template, tes regresi, mapping manual dibantu AI |
| WP-R2 | Unggahan berbahaya / data besar membebani sistem | Validasi berlapis, antivirus, batas dekompresi, sandbox, antrean |
| WP-R3 | Kebocoran antar tenant | RLS + tes lintas-tenant + path terpartisi |
| WP-R4 | Churn tak sengaja karena VA/QRIS tidak berulang | Pengingat H-7/H-3/H-1, auto-renew bila didukung, grace |
| WP-R5 | Webhook hilang/ganda menyebabkan status salah | Idempoten, rekonsiliasi harian, state machine tunggal |
| WP-R6 | Penyalahgunaan trial / multi-akun | Satu trial per organisasi, verifikasi email, dedup domain, rate limit pendaftaran |
| WP-R7 | Pengguna merasa dijebak saat batas tercapai | Prinsip tanpa dark pattern, "Nanti saja", hasil lama tetap terlihat |
| WP-R8 | Formula injection pada ekspor | Sanitasi sel & nama file |
| WP-R9 | Kompleksitas pajak/faktur | Konsultasi pajak; invoice dengan NPWP opsional |
| WP-R10 | Performa tabel/chart pada hasil besar | Virtualisasi, batas baris, agregasi di server |

**Keputusan terbuka**

1. Antrian job: berbasis Postgres atau Redis untuk MVP.
2. Payment gateway & metode yang mendukung pembayaran berulang (konfirmasi tertulis ke gateway).
3. Layanan email transaksional & domain pengirim (SPF/DKIM).
4. Penyedia penyimpanan objek & wilayah (kebutuhan residensi data).
5. Pustaka render PDF (headless Chromium vs alternatif) dan hosting-nya.
6. Layanan antivirus untuk unggahan.
7. Format finalis template TikTok Shop dan sumber sampel data nyata untuk uji regresi template.
8. Kebijakan watermark PNG Free; garansi 7 hari; bentuk trial (PRD-00 §19).
9. Dark mode: kapan dirilis.
10. Rencana lokalisasi EN: cakupan di Tahap 2 atau setelahnya.
