# PRD-02: AI, InsightFlow AI

**AI Analyst · Semantic Layer · RAG Bertahap · Forecasting · Evaluasi**

| | |
|---|---|
| Dokumen | PRD-02 AI |
| Versi | 1.0 (penomoran dimulai ulang) |
| Induk | [PRD-00 Induk](PRD-00-Induk-InsightFlow-AI-v1.0.md): strategi, paket, **kontrak antarmuka K-1..K-8**, kebijakan keamanan |
| Pasangan | PRD-01 Web & Platform |
| Pembaca | AI/ML engineer, data engineer, backend yang menyentuh agen |

> Angka bertanda 🔸 adalah hipotesis yang dikalibrasi lewat golden set dan pilot. Penanda tahap: **[T0]** Alpha, **[T1]** MVP Analyst, **[T2]** Forecasting & Langganan Pro, **[Later]**.

---

## 1. Lingkup & Hubungan dengan Dokumen Lain

**Dalam lingkup dokumen ini:** pemahaman pertanyaan, perencanaan, retrieval (RAG), pembuatan & validasi SQL, eksekusi analitik, pemeriksaan hasil, narasi insight, forecasting, anomali, what-if, evaluasi, biaya AI, observabilitas AI.

**Di luar lingkup (ada di dokumen lain):**

| Topik | Lokasi |
|---|---|
| Strategi, paket, harga, metrik bisnis | PRD-00 §2-§10 |
| **Skema respons AI, galat, event, kuota, konteks percakapan** | **PRD-00 §11 (K-1..K-8)** |
| UI chat, chart, panel konteks, laporan | PRD-01 §10-§13 |
| Upload, profiling, template marketplace, PII (deteksi), versi dataset | PRD-01 §8 |
| Lingkungan sandbox eksekusi, RLS, secret management | PRD-01 §18 |
| Billing, langganan, penegakan kuota (sisi layanan entitlement) | PRD-01 §14 |

AI **tidak** memutuskan hak akses sendiri; ia memanggil layanan entitlement (K-5) dan mengikuti kontrak yang sama dengan UI.

---

## 2. Prinsip AI

1. **AI membantu, tidak mengarang.** Setiap angka dalam jawaban berasal dari eksekusi deterministik (SQL, statistik, model forecast). LLM tidak menghitung revenue, rata-rata, persentase, atau forecast.
2. **LLM hanya untuk:** memahami maksud, perencanaan, pemilihan tool, pembuatan SQL (terpandu konteks), dan narasi atas hasil yang sudah dihitung.
3. **Grounded.** AI tidak menebak arti kolom atau metrik. Ia memakai glosarium metrik (§5) dan konteks yang diambil lewat RAG (§6).
4. **Jujur soal ketidakpastian.** Ambigu → tanya balik. Data tidak ada → tolak dengan penjelasan. Keyakinan rendah → ditampilkan.
5. **Bisa diaudit.** Setiap jawaban menyertakan SQL, definisi metrik, dan (opsional) konteks RAG yang dipakai.
6. **Aman secara default.** Eksekusi baca-saja, validasi AST, sandbox, PII dimasking, isi dataset dianggap **data tak tepercaya** (bukan instruksi).
7. **Tidak terikat vendor.** Penyedia LLM, model embedding, mesin database, model forecast, dan framework agen berada di balik antarmuka yang dapat diganti.
8. **Terukur sebelum diaktifkan.** Setiap kemampuan baru (terutama RAG) harus mengalahkan baseline pada golden set sebelum menjadi default.

---

## 3. Arsitektur AI

```text
                    Permintaan (K-1 / K-4)
                           │
                  ┌────────▼─────────┐
                  │ Entitlement.reserve│ ← K-5
                  └────────┬─────────┘
                           ▼
        ┌────────────────────────────────────────┐
        │            ORCHESTRATOR (state machine)│
        │  Intent → Retrieval → Plan → SQL → Val │
        │  → Execute → Sanity → Insight → Respond│
        └──┬───────────┬────────────┬───────────┬┘
           ▼           ▼            ▼           ▼
     ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
     │ Provider │ │  RAG    │ │ SQL Guard│ │ Data Engine  │
     │ Abstract.│ │ (§6)    │ │  (§8)    │ │ DuckDB/Polars│
     │ LLM/Emb. │ │pgvector │ │ AST+Pol. │ │ (sandbox)    │
     └──────────┘ └────┬────┘ └──────────┘ └──────────────┘
                       ▼
                 PostgreSQL (+ pgvector, RLS)
                       
     Forecasting Service (worker asinkron, §10)  ·  Anomaly (§11)  ·  Evaluation Harness (§13)
```

Prinsip implementasi:

- **State machine modular**, bukan ketergantungan pada satu framework agen. Framework (bila dipakai) hanya implementation layer.
- **Abstraksi penyedia:** antarmuka `LLMProvider` (chat, structured output, tool call) dan `EmbeddingProvider`. Mengganti penyedia atau model tidak mengubah orchestrator.
- **Structured output wajib:** semua keluaran LLM yang dipakai kode divalidasi terhadap skema (JSON Schema/Pydantic); keluaran tak valid → coba ulang terbatas lalu `CONTRACT_VALIDATION_FAILED` (K-2).
- **Determinisme:** temperature rendah untuk perencanaan dan SQL; versi prompt dan model dicatat per run.
- **Degradasi anggun:** bila LLM tidak tersedia, eksekusi/edit SQL manual dan chart tetap berfungsi (PRD-00 §13).

---

## 4. AI Analyst: Pipeline & Perilaku

### 4.1 Pipeline

```text
Pertanyaan
   ↓
1. Entitlement.reserve
2. Pemahaman maksud (intent) + deteksi bahasa (ID/EN) + deteksi ambiguitas
      ├─ ambigu → needs_clarification (maks 2 berturut-turut), release kuota
      └─ jelas ↓
3. Retrieval konteks (RAG §6): skema relevan · definisi metrik · contoh few-shot · value linking
4. Perencanaan (structured output: intent, metrik, dimensi, filter, periode, chart)
5. Generate SQL (berbasis definisi glosarium)
6. Validasi SQL (§8): AST, read-only, izin tabel/kolom, LIMIT, timeout
      └─ gagal → perbaiki sekali (kirim pesan galat terstruktur ke LLM) → gagal lagi → SQL_REJECTED / failed
7. Eksekusi di sandbox
8. Pemeriksaan kewajaran hasil (§4.3)
      └─ gagal → koreksi otomatis sekali → bila tetap gagal: warning + confidence turun
9. Visualisasi (pemilihan tipe chart dari bentuk data)
10. Insight & narasi (§9); verifikasi angka narasi vs hasil
11. Respons terstruktur (K-1) + Entitlement.commit
```

### 4.2 Perilaku inti

| Perilaku | Aturan |
|---|---|
| **Klarifikasi** | Bila istilah cocok > 1 metrik (mis. "revenue": kotor atau bersih), periode tidak jelas, atau dimensi ambigu → `needs_clarification` dengan opsi pilihan. Maks 2 pertanyaan balik berturut-turut; setelah itu pilih default dengan `warnings` yang menyebut asumsi. Tidak mengurangi kuota |
| **Penolakan jujur** | Data/kolom yang dibutuhkan tidak ada (mis. stok) → `refused`, `DATA_NOT_AVAILABLE`, sebut data apa yang kurang. Tidak ada angka karangan. Di luar domain data → `OUT_OF_SCOPE` |
| **Konteks percakapan** | Memakai dan memperbarui `ConversationState` (K-4): dataset, metrik aktif, filter, periode. Pertanyaan lanjutan ("forecast 3 bulan", "produk mana yang bertanggung jawab?") tidak mengulang konteks. Perubahan konteks implisit ditampilkan agar tidak ada filter tersembunyi |
| **Bahasa** | Jawaban mengikuti bahasa pertanyaan (ID/EN). Istilah bisnis Indonesia dikenali (omzet, pesanan, retur, ongkir, diskon penjual) |
| **Format angka** | Locale `id-ID`: Rp, pemisah ribuan titik, desimal koma; singkatan `Rp 1,24 M`, `Rp 84 jt` |
| **Aksi lanjutan** | `suggested_actions` (rinci per dimensi, forecast, simpan, ekspor) |
| **Koreksi SQL pengguna** | SQL yang diedit pengguna melewati validasi yang sama (§8) dan dapat menjadi calon entri bank few-shot (§6.6) |

### 4.3 Pemeriksaan kewajaran hasil

| Pemeriksaan | Tindakan |
|---|---|
| Hasil kosong | Periksa filter periode/nilai; koreksi sekali atau jelaskan tidak ada data |
| Null mendominasi kolom metrik | Warning kualitas data |
| Join menggandakan baris (fan-out) | Bandingkan jumlah baris sebelum/sesudah join; koreksi dengan agregasi sebelum join |
| Total metrik melebihi total dataset | Tandai kemungkinan duplikasi; koreksi |
| Filter tanggal di luar rentang data | Beri tahu rentang data yang tersedia |
| Nilai negatif pada metrik yang tak boleh negatif | Warning |
| Hasil terpotong (`truncated`) | Tampilkan keterangan; sarankan penyempitan |
| Skala/satuan mencurigakan (Rp vs ribu) | Warning berdasar profil kolom |

### 4.4 Kegagalan yang dapat dipulihkan

Setiap kegagalan menghasilkan pesan yang dapat dipahami + opsi: coba ulang, sederhanakan pertanyaan, atau edit SQL. Kode galat mengikuti K-2.

---

## 5. Semantic Layer & Glosarium Metrik

Sumber utama kegagalan text-to-SQL bisnis adalah ambiguitas istilah. Solusinya adalah definisi eksplisit yang menjadi **otoritas** bagi AI.

### 5.1 Spesifikasi entri metrik

```yaml
metric: omzet_bersih
label: "Omzet bersih"
aliases: ["revenue", "penjualan bersih", "omzet"]
expression: "SUM(harga_jual * qty) - SUM(diskon_penjual) - SUM(retur)"
filters_default: ["status_pesanan NOT IN ('dibatalkan')"]
time_column: tanggal_pesanan
grain: "pesanan"
unit: "IDR"
notes: "Tidak termasuk ongkir yang dibayar pembeli."
version: 3
source: "template:shopee" | "user"
```

### 5.2 Aturan

- **Template marketplace** (Shopee, Tokopedia, TikTok Shop) menyediakan definisi awal; pengguna dapat mengubah. Prioritas: definisi pengguna > template.
- Istilah yang cocok > 1 metrik → klarifikasi (§4.2).
- Setiap jawaban menampilkan **definisi metrik yang dipakai** (`metric_definitions` di K-1).
- Koreksi pengguna terhadap definisi menjadi bagian glosarium (bukan perbaikan sekali pakai) dan **berversi** (`metric_definition_versions`); analisis tersimpan merekam versi definisi saat dibuat.
- **Validasi ekspresi:** `expression` di-parse dengan parser SQL, dibatasi ke fungsi agregasi/aritmetika yang diizinkan, lalu diuji pada sampel dataset sebelum disimpan. Ekspresi tak valid ditolak dengan pesan yang jelas.
- **Deteksi relasi** antar tabel/kolom (kandidat join) diajukan ke pengguna untuk dikonfirmasi; relasi terkonfirmasi disimpan dan dipakai planner.
- Perubahan glosarium memicu re-indexing RAG (§6.5).

UI pengelolaan glosarium: [PRD-01 §9].

---

## 6. RAG: Penuh, Dibangun Bertahap

### 6.1 Tujuan & batasan

RAG menyuplai konteks yang **relevan dan terverifikasi** ke LLM agar SQL yang dihasilkan lebih akurat dan prompt lebih hemat token. RAG **bukan** pengganti glosarium (§5) maupun validasi SQL (§8). Seluruh teks hasil retrieval diperlakukan sebagai **data**, bukan instruksi.

### 6.2 Komponen (lima retriever)

| ID | Komponen | Mengambil | Sumber | Tahap |
|---|---|---|---|---|
| C1 | **Schema Retriever** | Tabel & kolom relevan (+ relasi/join key) | Skema dataset, deskripsi kolom, alias | R2 |
| C2 | **Metric Retriever** | Definisi metrik relevan | Glosarium (§5) | R1 (leksikal) → R3 (vektor) |
| C3 | **Few-shot SQL Retriever** | 2-3 pasangan (pertanyaan, SQL) terverifikasi yang mirip | Bank few-shot (§6.6) | **R1** |
| C4 | **Value Linker** | Nilai kategorikal nyata untuk penyebutan pengguna ("kaos hitam", "Jatim") | Indeks nilai kolom kardinalitas rendah, non-PII | R2 |
| C5 | **Knowledge Retriever** | Potongan dokumen konteks bisnis (kamus data, SOP, catatan) | Dokumen unggahan pengguna | R4 **[Later]** |

### 6.3 Alur retrieval

```text
Pertanyaan pengguna
   ↓ normalisasi (huruf kecil, ejaan, singkatan, sinonim ID/EN) + masking PII
   ↓ embed kueri (di-cache)
   ├─► C1 Schema      ┐
   ├─► C2 Metric      │  paralel, semua difilter organization_id + dataset aktif
   ├─► C3 Few-shot    │
   └─► C4 Value Link  ┘
   ↓ fusion & rerank (hybrid score, MMR) → ambang keyakinan
   ↓ context packer (anggaran token, prioritas)
   ↓ Planner / SQL generator
```

**Prioritas pengisian konteks** (bila melebihi anggaran token): definisi metrik > skema terpangkas > contoh few-shot > value links > catatan lain.

**Fallback:** bila keyakinan retrieval rendah → (a) jika skema kecil, kirim skema penuh; (b) jika tidak, minta klarifikasi. Retrieval tidak boleh diam-diam menghasilkan konteks kosong.

### 6.4 Penyimpanan & isolasi tenant

- **PostgreSQL + pgvector** (satu basis data dengan metadata; indeks HNSW) dipadukan **full-text search** untuk pencarian leksikal (hybrid). Konfigurasi pencarian teks untuk Bahasa Indonesia diuji; bila tidak memadai, gunakan konfigurasi sederhana + normalisasi sendiri.
- **Dimensi vektor tidak di-hardcode.** Tiap baris menyimpan `embedding_model_id` dan `dim`; mengganti model embedding = migrasi + re-embed penuh lewat job, indeks baru, lalu cutover.
- **Isolasi wajib (lapis ganda):**
  1. Semua tabel RAG memiliki `organization_id NOT NULL` dan **Row-Level Security**.
  2. Semua kueri retrieval **menyaring `organization_id`** secara eksplisit di aplikasi.
  3. **Tes otomatis** bahwa retrieval organisasi A tidak pernah mengembalikan baris organisasi B (termasuk kueri adversarial).
- **Catatan recall:** pencarian ANN dengan filter dapat mengembalikan hasil lebih sedikit dari k. Uji recall **dengan filter**; gunakan fitur iterative scan pada versi pgvector yang mendukung (verifikasi versi), atau partisi/indeks parsial per organisasi bila recall turun.
- **Embedding adalah data sensitif** (dapat membocorkan teks asalnya): dienkripsi at-rest, mengikuti retensi dan penghapusan yang sama dengan dataset.

**Tabel (garis besar, rincian di §16):** `rag_embedding_models`, `schema_index`, `metric_index`, `fewshot_bank`, `value_index`, `knowledge_chunks` **[Later]**, `rag_index_jobs`.

### 6.5 Pipeline indexing

| Pemicu | Tindakan |
|---|---|
| Dataset siap / versi baru | Bangun/perbarui `schema_index` & `value_index` (inkremental per kolom yang berubah) |
| Glosarium diubah | Perbarui `metric_index` |
| Entri few-shot baru/berubah status | Embed pertanyaan, simpan signature skema |
| Ganti model embedding | Job re-embed penuh, cutover berindeks baru |
| Dataset/organisasi dihapus | **Hapus kaskade** seluruh baris RAG terkait (kewajiban retensi, PRD-00 §12) |

Teks yang di-embed (contoh):

```text
Kolom : pesanan.provinsi (string, kategorikal) | alias: wilayah, daerah, lokasi pengiriman
Deskripsi: provinsi tujuan pengiriman pesanan | contoh nilai: Jawa Timur, DKI Jakarta, Jawa Barat
```

**Aturan data sensitif:** kolom PII hanya di-embed **nama dan deskripsinya**, tidak pernah nilainya; kolom berstatus *Blokir* tidak masuk indeks sama sekali; Value Linker hanya untuk kolom non-PII dengan kardinalitas ≤ 5.000 nilai unik 🔸.

### 6.6 Bank few-shot SQL

Pasangan (pertanyaan → SQL) terverifikasi yang disisipkan sebagai contoh. Ini komponen RAG dengan dampak akurasi terbesar per biaya.

**Siklus status:** `candidate` → `verified` → `deprecated` / `quarantined`.

| Sumber entri | Syarat menjadi `verified` |
|---|---|
| **Seed template** (dibuat tim per marketplace) | Lolos golden set; ditinjau manusia |
| **Query pengguna dengan 👍** | Lolos validasi §8 + eksekusi sukses + pemeriksaan kewajaran + tidak ada koreksi bertentangan |
| **Koreksi SQL pengguna** | Lolos validasi §8 + eksekusi sukses; ditandai `user_corrected` (bobot lebih tinggi) |

Metadata: `schema_signature` (hash nama+tipe kolom/tabel), `metrics_used`, `question_embedding`, `success_count`, `last_verified_at`, `dataset_version_id`, `scope`.

**Aturan:**

- **Scope per organisasi** secara default. Bank **global** hanya berisi seed internal dan entri **opt-in** yang dianonimkan (literal diganti placeholder, tanpa PII).
- Entri hanya dipakai bila `schema_signature` cocok/kompatibel dengan dataset aktif; skema berubah → status ditinjau ulang.
- Deduplikasi pertanyaan serupa; simpan versi dengan keberhasilan tertinggi.
- **Pertahanan terhadap keracunan:** (a) hanya SQL tervalidasi read-only yang diterima; (b) teks pertanyaan diperlakukan sebagai data; (c) batas kontribusi per pengguna per hari; (d) entri baru diuji pada golden set offline, **bila menurunkan akurasi → `quarantined`**; (e) entri dapat ditarik (tombol laporkan) dan dihapus bersama data organisasi.

### 6.7 Ranking & parameter retrieval 🔸

```text
skor = α·kemiripan_vektor + β·skor_leksikal(FTS/BM25) + γ·boost(exact alias / exact nama kolom)
lalu MMR (keragaman) → ambang minimum → top-k
```

| Komponen | k awal | Catatan |
|---|---|---|
| Schema (kolom) | 20 kolom, 5 tabel | Selalu sertakan kolom waktu & kunci join |
| Metric | 3 | Exact/alias match diprioritaskan; skor berdekatan → klarifikasi |
| Few-shot | 3 | Skema kompatibel; utamakan `user_corrected` |
| Value links | 5 per penyebutan | Fuzzy + vektor |

Nilai α, β, γ, k, dan ambang dituning pada golden set (set dev), dikunci di set test.

### 6.8 Keamanan RAG

| Ancaman | Mitigasi |
|---|---|
| Kebocoran antar tenant lewat vector store | RLS + filter eksplisit + tes adversarial otomatis di CI (R4 risiko PRD-00) |
| Prompt injection tidak langsung (instruksi di nama kolom, nilai sel, catatan) | Konteks retrieval dibungkus sebagai data terdelimitasi; LLM tidak diberi izin tool berdasar isi konteks; output divalidasi skema; tes red-team |
| Keracunan bank few-shot | §6.6 (validasi, kuarantina, uji golden set, batas kontribusi) |
| PII ikut ter-embed | Hanya metadata PII yang di-embed; kolom Blokir dikecualikan |
| Inversi embedding | Enkripsi at-rest, akses terbatas, retensi sama dengan data sumber |
| Retrieval tak terjejak | `rag_context` (id yang diambil) dicatat per run dan dapat ditampilkan di panel lanjutan |

### 6.9 Tahapan & gerbang aktivasi

RAG default **mati** sampai lolos gerbang. Setiap tahap memakai *feature flag* per organisasi dan rollback otomatis bila regresi.

| Tahap | Isi | Kapan | Gerbang aktivasi 🔸 |
|---|---|---|---|
| **R0** | Tanpa vektor. Skema penuh (dataset kecil) + glosarium langsung di prompt. **Baseline pembanding** | [T0] | Baseline terukur di golden set |
| **R1** | **Bank few-shot (C3)** dengan pgvector + pencarian leksikal metrik (C2 leksikal) + seed template | [T1] | Result correctness naik ≥ **+3 poin absolut** vs R0 pada set test; latensi retrieval p95 ≤ 250 ms; tidak ada regresi pada klarifikasi/penolakan |
| **R2** | **Schema Retriever (C1) + Value Linker (C4)** | [T2] atau saat dipicu | **Pemicu:** dataset aktif > 150 kolom atau > 5 tabel, atau skema > 25% anggaran token, atau analisis kegagalan menunjukkan > 15% salah kolom/nilai. **Gerbang:** Recall@k skema ≥ 95% dan uplift terukur atau penghematan token ≥ 30% tanpa penurunan akurasi |
| **R3** | **Metric Retriever berbasis vektor (C2 vektor)** | Bila glosarium besar | Glosarium > 50 metrik; uplift terukur |
| **R4** | **Knowledge Retriever (C5)**, reranker, retrieval lintas-dataset, bank global opt-in, reranking dari umpan balik | **[Later]** | Kebutuhan terbukti dari pilot; evaluasi terpisah |

**Keputusan arsitektur yang mengunci masa depan sejak awal** (agar R2-R4 tidak butuh bongkar ulang): ekstensi vektor aktif di basis data sejak Fase 0, skema tabel RAG (§16) dibuat sejak R1, `organization_id` + RLS sejak hari pertama, `embedding_model_id` pada setiap baris.

### 6.10 Evaluasi RAG

| Metrik | Definisi |
|---|---|
| Schema Recall@k / Precision@k | Kolom/tabel acuan ada di top-k |
| Few-shot hit rate & helpfulness | Frekuensi contoh relevan ada; selisih akurasi dengan vs tanpa contoh (ablasi) |
| MRR | Peringkat contoh acuan |
| Value-linking accuracy | Penyebutan → nilai yang benar |
| Latensi retrieval | p50/p95 |
| Penghematan token | Token prompt vs R0 |
| **Uplift end-to-end** | Result correctness vs R0 (dan ablasi per komponen) |
| Isolasi tenant | 0 kebocoran pada tes adversarial |

Anotasi tambahan di golden set: kolom acuan, metrik acuan, contoh few-shot acuan per pertanyaan. **Regression test di CI** setiap kali berubah: model embedding, chunking/teks indeks, parameter retrieval, atau prompt.

### 6.11 Biaya RAG

Embedding indexing (batch, saat upload; di-cache per versi dataset), embedding kueri (kecil, di-cache), penyimpanan vektor (≈ jumlah baris × dim × 4 byte; kecil pada skala pilot). RAG harus **menghemat token atau menaikkan akurasi**; bila tidak, tidak diaktifkan (PRD-00 §10.3).

---

## 7. Tool, Runtime & Kebijakan Agen

### 7.1 Daftar tool

| Tool | Fungsi | Tahap |
|---|---|---|
| `get_workspace_context()` | Konteks organisasi, dataset aktif, preferensi, zona waktu, mata uang | T1 |
| `list_datasets()` / `inspect_dataset()` | Daftar & ringkasan dataset, versi | T1 |
| `get_schema()` | Skema tabel/kolom (terpangkas bila R2 aktif) | T0 |
| `get_glossary()` / `retrieve_metrics(q)` | Definisi metrik (leksikal/vektor) | T0/T1 |
| `retrieve_schema(q)` | Schema Retriever (C1) | R2 |
| `retrieve_fewshot(q)` | Few-shot Retriever (C3) | R1 |
| `link_values(q)` | Value Linker (C4) | R2 |
| `get_column_statistics(col)` | Statistik kolom | T1 |
| `sample_rows(n)` | Sampel terbatas, termasking | T1 |
| `generate_sql(plan, ctx)` | SQL dari rencana + konteks | T0 |
| `validate_sql(sql)` | Validasi AST & kebijakan (§8) | T0 |
| `execute_sql(sql)` | Eksekusi sandbox | T0 |
| `run_statistics(df)` | Statistik deskriptif/inferensial | T1 |
| `create_visualization(data)` | Spesifikasi chart (K-1 `chart`) | T0 |
| `decompose_change()` | Driver decomposition (§9.3) | T2 |
| `run_forecast(config)` | Pipeline forecast (§10) | T2 |
| `detect_anomalies()` | Deteksi anomali (§11) | Later |
| `generate_report()` | Susun laporan | T2 |

### 7.2 Kebijakan & runtime

- **Izin tool ditentukan kebijakan aplikasi** (paket, peran, dataset, status arsip), bukan oleh LLM.
- **Batas per run:** maks panggilan LLM (≈ 6 🔸), maks token, maks waktu; loop dibatasi (tidak ada agen otonom tanpa batas).
- **Memori percakapan:** `ConversationState` (K-4); preferensi pengguna (mis. bahasa, format) hanya bila diizinkan.
- **State machine:** transisi eksplisit antar tahap §4.1; setiap tahap dapat dicoba ulang idempoten.
- **Output terstruktur perencana:** lihat Lampiran A.
- **Versi prompt** disimpan (`prompt_versions`) dan dicatat per run.

---

## 8. Keamanan SQL, Sandbox & Guardrails AI

Kebijakan produk di PRD-00 §12; lingkungan sandbox di PRD-01 §18.3.

### 8.1 Pipeline validasi

```text
SQL dari LLM
  → Parse (AST, mis. sqlglot) → hanya satu statement
  → Hanya SELECT / WITH ... SELECT  (allowlist node AST)
  → Allowlist fungsi & operator (bukan sekadar blacklist)
  → Izin tabel & kolom (kebijakan aplikasi) ; kolom PII/Blokir ditolak
  → Injeksi LIMIT (default 1.000) + batas memori
  → Timeout keras (default 15 detik 🔸; target normal < 3 detik)
  → Eksekusi di sandbox
```

**Ditolak mutlak:** `INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE, EXEC, COPY, ATTACH, INSTALL, LOAD, PRAGMA`, multi-statement, pembacaan file/URL arbitrer (mis. `read_csv`, `read_parquet` di luar view terisolasi), dan fungsi sistem/berbahaya (mis. `pg_sleep`). Catatan: `UNION`/`UNION ALL` pada tabel yang diizinkan **sah dan diperbolehkan**; yang diblokir adalah akses ke skema/tabel sistem.

**Pendekatan utama adalah allowlist**: node AST dan fungsi yang tidak ada di daftar diizinkan akan ditolak.

### 8.2 Pengerasan eksekusi (kerja sama dengan platform)

- Hanya dataset milik organisasi yang bersangkutan terlihat sebagai view terisolasi per eksekusi.
- Akses eksternal dinonaktifkan (file/URL, ekstensi, `COPY`, `ATTACH`).
- Batas CPU/memori/waktu per query; proses terisolasi; hasil dibatasi baris.

### 8.3 Keamanan AI

| Ancaman | Mitigasi |
|---|---|
| Prompt injection langsung | Deteksi pola; instruksi sistem terpisah dari konten pengguna; tidak ada tool yang dapat diperluas dari teks |
| **Injection tidak langsung** (isi sel, nama kolom, catatan pembeli, hasil RAG) | Semua isi dataset dan konteks retrieval dibungkus sebagai **data terdelimitasi**; keluaran divalidasi skema; izin tool dari kebijakan |
| LLM menentukan keamanan sendiri | Dilarang; keputusan izin hanya oleh kebijakan aplikasi |
| Kebocoran rahasia | Kredensial/secret tidak pernah masuk prompt, log prompt, atau konteks |
| Kebocoran PII ke LLM | Masking default; hasil query penuh tidak dikirim bila ada PII; kolom Blokir tidak terlihat |
| Output tak valid | Validasi skema → coba ulang terbatas → `CONTRACT_VALIDATION_FAILED` |
| Penyalahgunaan sumber daya | Rate limit, batas token/waktu per run, plafon biaya per organisasi |

**Tes red-team** (set injection di golden set §13) menjadi bagian gerbang rilis.

### 8.4 Penanganan PII untuk LLM

Mode per kolom (Izinkan/Masking/Blokir) dari profiling [PRD-01 §8]. Yang boleh dikirim ke LLM: nama skema, glosarium, statistik ringkas, sampel kecil **termasking**. Narasi hanya menyebut agregat untuk kolom PII.

---

## 9. Insight Engine & Driver Decomposition

### 9.1 Format temuan

```text
Temuan → Bukti → Dampak → Kemungkinan penjelasan (inferensi) → Rekomendasi
```

Setiap kalimat diberi label (K-1 `findings[].type`):

| Label | Arti | Contoh |
|---|---|---|
| **fact** | Langsung dari hasil query | "Omzet turun 12,4% dibanding bulan lalu." |
| **inference** | Dugaan dari pola, **bukan** bukti kausal | "Penurunan terkonsentrasi di Produk A; mungkin terkait stok atau harga." |
| **recommendation** | Saran tindakan | "Periksa stok dan harga Produk A di wilayah Timur." |

### 9.2 Aturan kejujuran

- **Verifikasi angka narasi:** semua angka dalam narasi diekstrak dan dicocokkan dengan hasil query (toleransi pembulatan). Tidak cocok → regenerasi atau angka dibuang; dihitung sebagai metrik factuality (§13).
- **Tidak ada klaim kausal.** Gunakan "berkontribusi", "terkonsentrasi", "bersamaan dengan". Pernyataan penyebab hanya sebagai `inference` dengan kata hati-hati dan tanpa menyatakan yang lain "bukan penyebab" tanpa data.
- **Dampak rupiah** wajib menampilkan dasar perhitungannya (selisih dua periode, bukan estimasi bebas).
- **Efek promosi/eksternal** tidak disebut bila datanya tidak ada.

### 9.3 Driver decomposition ("kenapa turun/naik") **[T2]**

Bandingkan dua periode dan hitung kontribusi tiap dimensi (produk, wilayah, channel) terhadap selisih total.

**Kontribusi dimensi:** `kontribusi_i = (nilai₁_i − nilai₀_i) ÷ (total₁ − total₀)`, ditampilkan dalam rupiah dan persen.

**Price–Volume–Mix** (bila data kuantitas dan harga per item tersedia). Untuk tiap item *i* dengan harga rata-rata *p* dan kuantitas *q* di periode 0 dan 1:

```text
Δ omzet_i  = p1_i·q1_i − p0_i·q0_i
efek volume_i = (q1_i − q0_i) · p0_i
efek harga_i  = (p1_i − p0_i) · q1_i
(efek volume_i + efek harga_i = Δ omzet_i, tepat)

Pemisahan volume total vs mix:
  efek volume murni = (Q1 − Q0) · (R0 ÷ Q0)        [Q = Σq, R = Σ omzet periode 0]
  efek mix          = Σ efek volume_i − efek volume murni
```

Bila data kuantitas/harga tidak ada, tampilkan hanya kontribusi per dimensi dan beri tahu keterbatasannya. Output memakai kata "berkontribusi".

### 9.4 Rekomendasi

Rekomendasi hanya dari temuan berbukti; tanpa bukti yang cukup, AI menyampaikan "perlu data tambahan" dan menyebutkan data apa.

---

## 10. Forecasting

### 10.1 Alur

```text
Pilih dataset/versi → kolom waktu → target (metrik) → granularitas → horizon
→ Pemeriksaan kelayakan → Preprocessing → Baseline + kandidat model
→ Backtesting rolling-origin → Metrik → Pemilihan model → Gating vs baseline
→ Forecast final + interval → Penjelasan + keyakinan → Hasil (K-8)
```

Dijalankan sebagai **job asinkron** (K-3). Hasil dalam format **K-8** (PRD-00 §11).

### 10.2 Pemeriksaan kelayakan

| Granularitas | Histori minimum disarankan 🔸 | Bila kurang |
|---|---|---|
| Harian | ≥ 90 hari (idealnya ≥ 2 siklus musiman) | Peringatan; baseline + statistik sederhana saja |
| Mingguan | ≥ 52 minggu untuk musiman tahunan | Matikan komponen musiman tahunan |
| Bulanan | ≥ 24 bulan | Peringatan keras; interval dilebarkan |

Pemeriksaan lain: celah tanggal (data hilang vs hari tanpa penjualan), proporsi nol tinggi (permintaan **intermittent** → Croston/TSB), perubahan struktural/outlier ekstrem, dan **kebocoran data** (fitur yang tidak diketahui saat forecast dibuat). Hasil pemeriksaan ditampilkan (`feasibility` di K-8). Gagal total → `FORECAST_INFEASIBLE` (K-2).

### 10.3 Model & abstraksi

| Kelompok | Model | Tahap |
|---|---|---|
| Baseline (**wajib**) | Naive, Seasonal Naive, Drift | T2 |
| Statistik | ETS, AutoARIMA (SARIMA bila perlu) | T2 |
| Intermittent | Croston, TSB | T2 |
| Machine learning | LightGBM (fitur lag, rolling, kalender); XGBoost/CatBoost | LightGBM T2; lainnya Later |
| Foundation time-series | Kandidat zero-shot (keluarga Chronos/TimesFM/Moirai; **verifikasi lisensi & versi**) | Evaluasi T2 |
| Deep learning | PatchTST, TFT, TSMixer | **Later** (butuh data & justifikasi) |

**Antarmuka model (plugin):**

```python
class Forecaster(Protocol):
    name: str
    min_history: dict[str, int]          # per frekuensi
    supports_covariates: bool
    def fit(self, y, X=None) -> None: ...
    def predict(self, horizon: int, X_future=None, quantiles=(0.025, 0.1, 0.5, 0.9, 0.975)) -> Forecast: ...
```

Menambah model = mendaftarkan kelas baru di registri; pipeline backtest dan UI tidak berubah. Ketersediaan model per paket diatur entitlement (Free: baseline + ETS; Pro: semua).

### 10.4 Backtesting & metrik

- **Dilarang random split.** Gunakan **rolling-origin** (atau expanding window), ≥ 3-5 lipatan 🔸, dengan horizon uji sama dengan horizon forecast.
- **Metrik:** **WAPE (utama, mudah dipahami bisnis)**, MAE, RMSE, MASE, sMAPE (hati-hati nilai nol), pinball loss, dan **coverage interval**.
- **Pemilihan model:** WAPE rata-rata antar lipatan terendah; MASE sebagai pemutus seri.
- **Gating:** model terpilih harus mengalahkan baseline terbaik dengan margin relatif minimum (≥ 5% 🔸). Bila tidak, tampilkan baseline dengan penjelasan: *"Pola data belum cukup stabil untuk model lanjutan; ini estimasi sederhana."*
- **Interval prediksi:** 80% dan 95%, dikalibrasi (mis. pendekatan konformal) dan **coverage aktual dilaporkan** dari backtest.

### 10.5 Kovariat & kalender

Fitur kalender Indonesia: hari libur nasional & cuti bersama, **Ramadhan/Lebaran (bergeser tiap tahun; tabel kalender dipelihara)**, tanggal kembar (1.1, 2.2, …), hari gajian, Harbolnas. **Efek promosi** hanya dimodelkan bila pengguna menyediakan data promosi; tanpa itu, tidak ditampilkan.

### 10.6 Penjelasan forecast

Penjelasan jujur tentang **sumbernya**:

- Model statistik: dekomposisi komponen (tren, musiman).
- Model ML: kontribusi fitur (mis. berbasis SHAP/ablasi).
- Foundation model (tanpa atribusi internal): tampilkan **dekomposisi pola historis (STL)** dan beri label *"dekomposisi pola historis, bukan atribusi model"*.

`explanation.method` pada K-8 menyebutkan metodenya. Tingkat keyakinan (tinggi/sedang/rendah) berdasar: lebar interval relatif, stabilitas antar lipatan, kecukupan histori, margin terhadap baseline. Klaim seperti "efek promosi" atau "kestabilan residual" tidak boleh muncul tanpa dasar yang dihitung.

### 10.7 Reproduksibilitas

Setiap run menyimpan: versi dataset, konfigurasi (hash), seed, versi library/model, kalender yang dipakai, hasil backtest per lipatan. Menjalankan ulang dengan konfigurasi sama menghasilkan hasil yang sama (dalam toleransi numerik).

### 10.8 Batas teknis

Jumlah seri per run (mis. per produk/wilayah): Free 1 seri agregat, Pro hingga 50 seri 🔸 (entitlement `forecast_series_max`). Horizon: Free ≤ 30 hari, Pro ≤ 365 hari (PRD-00 §8.3). Waktu training: target < 60 detik untuk horizon 90 hari dengan 3 tahun data harian 🔸.

---

## 11. Anomaly Detection **[Later]**

Metode: statistik bergulir (z-score), residual STL, penyimpangan terhadap interval prediksi, Isolation Forest (multivariat, opsional). Output: nilai aktual vs diharapkan, deviasi, **tingkat keparahan** (rendah/sedang/tinggi berdasar deviasi relatif dan dampak rupiah), **dimensi yang berkontribusi** (dekomposisi §9.3), dan dampak rupiah.

Aturan: kontrol sensitivitas; umpan balik "bukan anomali" menekan alarm palsu; **"probable driver" hanya disebut bila didukung data pada dimensi yang tersedia** (mis. kontribusi per channel pembayaran), tidak menyebut penyebab eksternal yang tidak ada di data.

---

## 12. What-if **[Later]**

Skenario (mis. harga +5%) hanya disajikan sebagai prediksi bila **elastisitas dapat diestimasi dari data historis** yang memadai (variasi harga cukup). Jika tidak, tampilkan sebagai **simulasi dengan asumsi eksplisit yang dapat diubah** dan labeli bukan prediksi. Selalu tampilkan baseline, asumsi, dan rentang.

---

## 13. Evaluasi AI

### 13.1 Golden set

100-200 pertanyaan dari data (anonim) calon pengguna dan data sintetis marketplace.

| Kategori | Contoh | Porsi 🔸 |
|---|---|---|
| Agregasi & filter | Total omzet bulan lalu | 20% |
| Perbandingan periode | Naik/turun vs bulan lalu | 15% |
| Top-N & ranking | 10 produk terlaris | 10% |
| Join 2+ tabel | Omzet per kategori produk | 15% |
| Metrik & istilah ambigu | "revenue" gross vs net | 10% |
| Pertanyaan tak terjawab | Stok tanpa kolom stok | 10% |
| Value linking | "Kaos hitam" → nilai produk | 5% |
| Injection & keamanan | Instruksi tersembunyi di sel/pertanyaan | 10% |
| Multi-turn (konteks) | Pertanyaan lanjutan | 5% |

**Praktik:** dilabeli **dua orang**, perselisihan diselesaikan, kesepakatan antar-pelabel dicatat; set dibagi **dev (70%) / test (30%)** agar tuning tidak overfit; set berversi; entri koreksi pengguna (opt-in) masuk antrean tinjauan sebelum menjadi golden. Format item: Lampiran B.

### 13.2 Metrik & definisi

| Metrik | Definisi | Target 🔸 |
|---|---|---|
| SQL execution success | Query valid & berjalan | ≥ 95% |
| **Result correctness** | Hasil sama dengan acuan: urutan baris diabaikan, nama kolom boleh beda, toleransi numerik (selisih relatif ≤ 0,1%) | ≥ 90% |
| Intent accuracy | Maksud terklasifikasi benar | Dipantau |
| Klarifikasi tepat | Pertanyaan ambigu memicu klarifikasi | ≥ 85% |
| Penolakan tepat | Pertanyaan tak terjawab ditolak, tidak dikarang | ≥ 95% |
| Insight factuality | Angka narasi cocok dengan hasil query (verifier otomatis) | ≥ 95% |
| Chart correctness | Tipe & mapping sumbu sesuai | ≥ 90% |
| Injection resistance | Serangan di set red-team tidak berhasil | 100% |
| Latensi & biaya | p50/p95 per tahap; token & Rp per pertanyaan | Dipantau |
| RAG | §6.10 | Sesuai gerbang |

### 13.3 Praktik evaluasi

- **Evaluasi otomatis di CI** pada setiap perubahan prompt, model, glosarium, atau parameter RAG; **regression gate:** tidak boleh turun > 1 poin 🔸 pada metrik utama. Evaluasi penuh nightly.
- **Benchmark publik text-to-SQL** hanya sebagai pembanding relatif, bukan target (distribusi data berbeda).
- **LLM-as-judge** hanya untuk aspek subjektif (kejelasan narasi), dengan audit manusia pada sampel; **bukan** untuk kebenaran angka.
- **Audit manusia mingguan** pada sampel run produksi (sesuai izin).
- **Loop umpan balik:** 👎 + koreksi → antrean tinjauan → (dengan izin) menambah golden set dan bank few-shot.

### 13.4 Evaluasi forecast

Simulasi historis rolling-origin; hasil dapat direproduksi; baseline selalu dilaporkan; metrik per seri dan agregat; **% seri di mana model terpilih mengalahkan Seasonal Naive ≥ 70%**; coverage interval 80% di 75-85%.

### 13.5 Gerbang rilis

Lihat gerbang antar tahap di PRD-00 §7.2; DoD §20 dokumen ini.

---

## 14. Biaya, Routing Model & Kuota (Sisi AI)

### 14.1 Routing model

| Tugas | Tingkat model |
|---|---|
| Klasifikasi maksud, deteksi bahasa, klarifikasi | Kecil/murah |
| Perencanaan & SQL | Menengah; **eskalasi ke model lebih besar** bila gagal validasi/eksekusi atau skor keyakinan rendah |
| Narasi insight | Kecil/menengah |
| Embedding | Model embedding multibahasa (uji kualitas Bahasa Indonesia) |

Konfigurasi dasar sama di semua paket demi akurasi. Setelah melewati ambang fair-use, Pro dialihkan ke konfigurasi lebih hemat (PRD-00 §8.3).

### 14.2 Penghematan

Cache hasil query (kunci: SQL ternormalisasi + `dataset_version_id`; **tidak** mengurangi kuota), cache konteks skema dan embedding kueri, ringkasan skema ringkas, anggaran token per run, penghentian dini bila validasi gagal.

### 14.3 Pengendalian

Plafon token per organisasi per hari (circuit breaker); batas panggilan LLM per run; peringatan lonjakan biaya; **reserve/commit/release** kuota sesuai K-5; setiap run mencatat biaya (`llm_cost_events`).

---

## 15. Observabilitas AI

Per run dicatat: `request_id`, `run_id`, `organization_id`, `user_id`, versi prompt & model, setiap tahap (durasi), id hasil RAG (`rag_context`), SQL (di-mask), jumlah baris, token masuk/keluar, biaya, status sanity-check, galat, hasil verifikasi angka narasi, umpan balik.

**Dashboard internal:** success rate AI, latensi per tahap, SQL failure rate, tingkat klarifikasi/penolakan, factuality, biaya per organisasi/per analisis, hit rate & latensi RAG, forecast failure rate, drift akurasi. **Peringatan:** lonjakan biaya, penurunan akurasi online, lonjakan galat.

Log tidak menyimpan PII mentah; retensi mengikuti kebijakan (PRD-00 §12).

---

## 16. Model Data AI

Entitas inti (kolom utama; skema lengkap di migrasi):

```text
analyses              id, organization_id, user_id, dataset_id, title, conversation_id, created_at
analysis_messages     id, analysis_id, role, content, run_id, k1_response_json
analysis_queries      id, run_id, sql, dataset_version_id, row_count, duration_ms, status
analysis_feedback     id, run_id, rating, correction_sql, note, allow_training_use
metric_definitions    id, organization_id, name, expression, filters_default, time_column, aliases, unit, source, current_version
metric_definition_versions   id, metric_id, version, expression, changed_by, changed_at
glossary_templates    id, marketplace, metric_json, version
prompt_versions       id, name, hash, created_at
llm_cost_events       id, run_id, organization_id, model, tokens_in, tokens_out, cost_idr, stage, created_at
golden_set_items      id, set_version, split, question, dataset_ref, expected_json, labeler_a, labeler_b
forecasts             id, organization_id, dataset_version_id, config_json, created_by
forecast_runs         id, forecast_id, status, champion_model, config_hash, seed, code_version, started_at, finished_at
forecast_models       id, name, role, min_history_json, supports_covariates, enabled_plans
forecast_metrics      id, forecast_run_id, model_name, mae, rmse, wape, mase, smape, coverage_80, coverage_95
backtest_folds        id, forecast_run_id, model_name, fold_index, train_end, test_start, test_end, metrics_json
anomalies [Later]     id, organization_id, dataset_id, metric, detected_at, severity, expected, actual, drivers_json
```

**Tabel RAG** (semua: `organization_id NOT NULL`, RLS aktif, `embedding_model_id`, `dim`, `embedding vector(dim)`, `updated_at`):

```text
rag_embedding_models  id, provider, model_name, dim, active, created_at
schema_index          id, organization_id, dataset_id, dataset_version_id, table_name, column_name, data_type,
                      description, aliases, is_pii, is_blocked, text_indexed, embedding, tsv
metric_index          id, organization_id, metric_id, version, text_indexed, embedding, tsv
fewshot_bank          id, organization_id, scope(org|global), status(candidate|verified|deprecated|quarantined),
                      question, question_embedding, sql, metrics_used, schema_signature, dataset_version_id,
                      source(seed|thumbs_up|user_corrected), success_count, last_verified_at, tsv
value_index           id, organization_id, dataset_id, column_name, value, synonyms, embedding
knowledge_chunks [Later]  id, organization_id, source_id, chunk_text, embedding, tsv
rag_index_jobs        id, organization_id, kind, target_id, status, started_at, finished_at
```

Aturan: indeks HNSW per tabel; indeks GIN untuk `tsv`; kolom `is_pii/is_blocked` mencegah nilai terindeks; penghapusan dataset/organisasi menghapus kaskade baris RAG.

---

## 17. Persyaratan Fungsional AI

Prioritas: **M** Must, **S** Should, **C** Could.

### 17.1 AI Analyst

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| A-01 | Pertanyaan bahasa natural (ID/EN) → respons K-1 | M | T0 |
| A-02 | Klarifikasi bila ambigu (maks. 2 berturut-turut, opsi pilihan) | M | T1 |
| A-03 | Penolakan jujur `DATA_NOT_AVAILABLE`/`OUT_OF_SCOPE` | M | T1 |
| A-04 | Pipeline keamanan SQL (§8) | M | T0 |
| A-05 | Pemilihan chart otomatis dari bentuk data | M | T1 |
| A-06 | Insight berlabel fact/inference/recommendation + verifikasi angka narasi | M | T1 |
| A-07 | Konteks percakapan (K-4) | M | T1 |
| A-08 | Pemeriksaan kewajaran hasil (§4.3) + koreksi otomatis sekali | M | T1 |
| A-09 | Eksekusi SQL hasil edit pengguna lewat validasi yang sama | S | T1 |
| A-10 | Saran aksi lanjutan (`suggested_actions`) | S | T1 |
| A-11 | Penyimpanan umpan balik 👍/👎 + koreksi (K-6) | S | T1 |
| A-12 | Reserve/commit/release kuota (K-5) di setiap run | M | T1 |
| A-13 | Degradasi anggun bila LLM tidak tersedia | M | T1 |

### 17.2 Semantic layer

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| A-20 | Metrik standar otomatis dari template marketplace | M | T1 |
| A-21 | Glosarium berversi; AI wajib memakai definisinya | M | T1 |
| A-22 | Validasi ekspresi metrik (parser + uji sampel) | M | T1 |
| A-23 | Deteksi relasi/join dengan konfirmasi pengguna | S | T1 |

### 17.3 RAG

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| A-30 | Abstraksi `EmbeddingProvider`; dimensi & model per baris; re-embed via job | M | T1 |
| A-31 | Skema tabel RAG + RLS + filter `organization_id` + tes isolasi adversarial | M | T1 |
| A-32 | **R0**: baseline tanpa vektor terukur | M | T0 |
| A-33 | **R1**: bank few-shot (C3) + seed template + status verified/quarantined | M | T1 |
| A-34 | Pipeline indexing inkremental + penghapusan kaskade | M | T1 |
| A-35 | Feature flag per organisasi + rollback otomatis bila regresi | M | T1 |
| A-36 | `rag_context` tercatat per run dan dapat ditampilkan | S | T1 |
| A-37 | **R2**: Schema Retriever (C1) + Value Linker (C4) | S | T2/dipicu |
| A-38 | **R3**: Metric Retriever vektor (C2) | C | dipicu |
| A-39 | **R4**: Knowledge Retriever, reranker, bank global opt-in | C | Later |
| A-40 | Evaluasi RAG (§6.10) otomatis di CI | M | T1 |

### 17.4 Insight & forecasting

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| A-50 | Driver decomposition (kontribusi dimensi, PVM bila data ada) | M | T2 |
| A-51 | Pemeriksaan kelayakan data sebelum forecast | M | T2 |
| A-52 | Baseline wajib (Naive, Seasonal Naive, Drift) | M | T2 |
| A-53 | Model kandidat: ETS, AutoARIMA, Croston/TSB, LightGBM; evaluasi foundation model | M | T2 |
| A-54 | Backtesting rolling-origin ≥ 3-5 lipatan | M | T2 |
| A-55 | Perbandingan model & rekomendasi berbasis metrik | M | T2 |
| A-56 | Interval 80/95% terkalibrasi + laporan coverage | M | T2 |
| A-57 | Gating terhadap baseline | M | T2 |
| A-58 | Penjelasan forecast jujur terhadap metodenya + keyakinan | M | T2 |
| A-59 | Reproduksibilitas run (K-8 `reproducibility`) | M | T2 |
| A-60 | Fitur kalender Indonesia (tabel dipelihara) | M | T2 |
| A-61 | Registri model berbasis plugin `Forecaster` | S | T2 |
| A-62 | Anomaly detection + severity + kontributor | S | Later |
| A-63 | What-if berbasis elastisitas dengan asumsi eksplisit | C | Later |

### 17.5 Evaluasi & observabilitas

| ID | Persyaratan | P | Tahap |
|---|---|---|---|
| A-70 | Harness evaluasi + golden set berversi (dev/test) | M | T0 |
| A-71 | Regression gate di CI | M | T1 |
| A-72 | Verifier angka narasi otomatis | M | T1 |
| A-73 | Set red-team injection | M | T1 |
| A-74 | Pencatatan biaya per run & dashboard internal | M | T1 |
| A-75 | Routing model + eskalasi | S | T1 |

---

## 18. User Stories & Acceptance Criteria

**US-A1 Tanya data.** Sebagai pemilik toko, saya bertanya "produk apa yang omzetnya paling tinggi bulan lalu?" dan mendapat jawaban jelas.
*Acceptance:* respons K-1 valid; angka cocok dengan hasil query; definisi metrik tampil; SQL tersedia di panel lanjutan; hasil cocok dengan golden set; latensi sesuai PRD-00 §13.

**US-A2 Klarifikasi.** Saat pertanyaan ambigu, AI bertanya balik, bukan menebak.
*Acceptance:* istilah dengan > 1 definisi memunculkan opsi; jawaban setelah klarifikasi memakai pilihan; maks 2 pertanyaan balik berturut-turut; klarifikasi tidak mengurangi kuota.

**US-A3 Tak bisa dijawab.** Bila data tidak memuat jawabannya, AI jujur.
*Acceptance:* pertanyaan stok tanpa kolom stok → `refused` + data yang kurang; tidak ada angka karangan.

**US-A4 Belajar dari koreksi.** Saat saya mengoreksi SQL atau memberi 👍, pertanyaan serupa berikutnya lebih akurat.
*Acceptance:* entri masuk bank hanya setelah validasi; muncul sebagai contoh pada pertanyaan serupa; tidak menurunkan golden set; dapat dihapus.

**US-A5 Keamanan.** Isi dataset yang berisi instruksi tidak mengubah perilaku AI.
*Acceptance:* set red-team 100% lolos; tidak ada tool/izin berubah karena isi data.

**US-A6 Forecast.** Saya ingin proyeksi omzet 90 hari beserta keyakinan.
*Acceptance:* kelayakan ditampilkan; baseline ikut; backtest & perbandingan model terlihat; interval 80/95%; bila tidak mengalahkan baseline, UI menjelaskan dan menampilkan baseline; run dapat direproduksi; hasil K-8 valid.

**US-A7 Kenapa turun.** Saya ingin tahu kontributor penurunan omzet.
*Acceptance:* dekomposisi per dimensi dalam rupiah dan persen; PVM bila data ada; label fakta/inferensi; tanpa klaim kausal.

**US-A8 Isolasi.** Data organisasi lain tidak pernah muncul dalam konteks atau contoh saya.
*Acceptance:* tes adversarial retrieval lintas organisasi: 0 kebocoran.

---

## 19. Struktur Kode (Saran)

```text
agent/
├── orchestrator/    (state machine, transisi tahap)
├── planner/         (structured output, ambiguity)
├── providers/       (llm/, embedding/ abstraksi + adapter)
├── prompts/         (berversi)
├── tools/
├── policies/        (izin tool, batas run, plafon biaya)
├── validators/      (SQL AST, allowlist, output schema)
├── guardrails/      (PII masking, injection, delimiting)
├── insight/         (labeler, verifier angka, decomposition)
└── memory/          (ConversationState)

rag/
├── retrievers/      (schema, metric, fewshot, value, knowledge)
├── indexing/        (jobs, templates teks, re-embed)
├── ranking/         (hybrid, MMR, packer)
├── fewshot_bank/    (siklus status, kuarantina, dedup)
└── eval/

forecasting/
├── profiling/  feasibility/  preprocessing/  features/ (calendar_id/)
├── baselines/  statistical/  intermittent/  machine_learning/  foundation/
├── backtesting/  metrics/  selection/  gating/  explanation/  registry/

evaluation/
├── golden_sets/  harness/  verifiers/  redteam/  reports/
```

---

## 20. Tahap & Definition of Done (AI)

### Tahap 0 (Alpha)
1. Pipeline §4.1 berjalan end-to-end dengan UI minimal
2. Validasi SQL §8 (allowlist, LIMIT, timeout) aktif
3. Golden set ≥ 100 + harness otomatis; **RAG R0 sebagai baseline**
4. Gerbang: execution success ≥ 90%, result correctness ≥ 80% 🔸

### Tahap 1 (MVP Analyst)
5. Semantic layer + template Shopee/Tokopedia + glosarium berversi
6. Klarifikasi & penolakan tepat; pemeriksaan kewajaran; verifier angka narasi
7. **R1 aktif** bila lolos gerbang (§6.9); isolasi tenant RAG teruji
8. Reserve/commit/release kuota (K-5); kontrak K-1..K-7 lolos contract test
9. Regression gate di CI; set red-team lulus; biaya per run tercatat
10. Gerbang evaluasi Tahap 1 terpenuhi (PRD-00 §7.2)

### Tahap 2 (Forecasting)
11. Kelayakan, baseline, kandidat model, backtest rolling-origin, gating, interval terkalibrasi
12. Penjelasan forecast + keyakinan; reproduksibilitas; K-8 valid
13. Driver decomposition (PVM bila data ada)
14. **R2/R3 hanya bila dipicu dan lolos gerbang**

---

## 21. Risiko & Keputusan Terbuka (AI)

| # | Risiko | Mitigasi |
|---|---|---|
| AI-R1 | Akurasi SQL di bawah target | Semantic layer, R1 few-shot, klarifikasi, sanity check, gerbang alpha |
| AI-R2 | RAG tidak menaikkan akurasi / menambah kompleksitas | Gerbang A/B; mulai R0 → R1; flag & rollback |
| AI-R3 | Kebocoran antar tenant lewat vector store | RLS + filter + tes adversarial CI |
| AI-R4 | Keracunan bank few-shot / injection | §6.6, §6.8, red-team |
| AI-R5 | Forecast menyesatkan | Gating, kelayakan, interval jujur, bahasa hati-hati |
| AI-R6 | Biaya LLM/embedding melebihi margin | Routing, cache, plafon, pengukuran biaya per run |
| AI-R7 | Kualitas embedding Bahasa Indonesia rendah | Uji multibahasa pada golden set sebelum memilih; hybrid dengan leksikal |
| AI-R8 | Ketergantungan satu penyedia | Abstraksi provider & embedding; uji di ≥ 2 penyedia |
| AI-R9 | Golden set bias/terlalu kecil | Dua pelabel, dev/test split, penambahan dari pilot (opt-in) |

**Keputusan terbuka**

1. Penyedia & model LLM utama/cadangan (ukur pada golden set: akurasi, biaya, kebijakan data, wilayah).
2. Model embedding & dimensinya (multibahasa; uji Bahasa Indonesia).
3. Ambang gerbang R1 (+3 poin 🔸) dan R2 pemicu (150 kolom/5 tabel 🔸): kalibrasi setelah baseline R0.
4. Konfigurasi pencarian teks Bahasa Indonesia untuk hybrid search.
5. Foundation model time-series yang dievaluasi (lisensi, ukuran, kualitas pada data UMKM).
6. Ukuran & sumber golden set awal; siapa pelabel.
7. Kebijakan bank global (opt-in) dan anonimisasi literal.
8. Margin gating forecast (≥ 5% 🔸) dan jumlah lipatan backtest.

---

## Lampiran A. Keluaran Terstruktur Perencana (contoh)

```json
{
  "intent": "period_comparison",
  "needs_clarification": false,
  "clarification_options": [],
  "metrics_used": ["omzet_bersih"],
  "dimensions": ["provinsi"],
  "filters": [{"column": "status_pesanan", "op": "not_in", "value": ["dibatalkan"]}],
  "period": {"current": {"from": "2026-09-01", "to": "2026-09-30"}, "compare_to": {"from": "2026-08-01", "to": "2026-08-31"}},
  "tool": "execute_sql",
  "sql": "SELECT ...",
  "visualization": {"type": "bar", "x": "provinsi", "y": ["omzet"], "sort": "desc"},
  "reasoning_summary": "ringkas; tidak ditampilkan penuh ke pengguna"
}
```

## Lampiran B. Format Item Golden Set

```json
{
  "id": "gs_0042", "split": "test", "difficulty": "medium", "category": "period_comparison",
  "question": "Kenapa omzet turun bulan lalu dibanding Agustus?",
  "dataset_ref": "sample_shopee_v2",
  "expected": {
    "intent": "period_comparison",
    "behavior": "answer",
    "metrics": ["omzet_bersih"],
    "sql_reference": "SELECT ...",
    "result_reference": [{"provinsi": "Jawa Timur", "delta": -84500000}],
    "chart": {"type": "bar"},
    "gold_columns": ["pesanan.tanggal_pesanan", "pesanan.provinsi"],
    "gold_fewshot_ids": ["fs_seed_011"],
    "must_not": ["menyatakan penyebab pasti"]
  },
  "labelers": ["a", "b"], "agreement": true
}
```

`behavior`: `answer` · `clarify` · `refuse` · `resist_injection`.

## Lampiran C. Contoh Entri Bank Few-shot

```json
{
  "id": "fs_seed_011", "scope": "global", "status": "verified", "source": "seed",
  "question": "Berapa omzet bersih per provinsi bulan lalu?",
  "sql": "SELECT provinsi, SUM(...) AS omzet FROM pesanan WHERE tanggal_pesanan >= :start AND tanggal_pesanan < :end AND status_pesanan <> 'dibatalkan' GROUP BY 1 ORDER BY 2 DESC",
  "metrics_used": ["omzet_bersih"],
  "schema_signature": "sig:marketplace_shopee_v2"
}
```

Literal (tanggal, nilai) diganti placeholder pada entri global.

## Lampiran D. Kalender Indonesia untuk Fitur Forecast

Hari libur nasional & cuti bersama; awal/akhir Ramadhan, Idulfitri, Iduladha (tanggal berubah tiap tahun, **tabel dipelihara dan diperbarui tahunan**); tanggal kembar (1.1, 2.2, ... 12.12); periode gajian (akhir/awal bulan); Harbolnas; tahun ajaran baru. Versi tabel kalender dicatat pada setiap run (reproduksibilitas).
