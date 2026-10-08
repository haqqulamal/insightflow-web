"use client";

import { useEffect, useState } from "react";
import { getAnalystRun, type K1Response } from "@/lib/api-client";
import { ResponseView } from "@/components/analyst/response-view";
import {
  ContextSheet,
  ContextSidebar,
  type Konteks,
} from "@/components/analyst/context-panel";
import { StateBlock } from "@/components/ui/state-block";
import { Skeleton } from "@/components/ui/skeleton";
import { SendHorizonal, SlidersHorizontal } from "lucide-react";

const KUOTA_HARIAN = 10;
const KUOTA_KEY = "insightflow-kuota-analis";
const SIMULASI = ["normal", "error", "kuota"] as const;
type Simulasi = (typeof SIMULASI)[number];

const SARAN_PERTANYAAN = [
  "Kenapa omzet bulan ini turun?",
  "Produk mana yang paling laku?",
  "Wilayah mana penjualannya paling rendah?",
  "Beri rekomendasi untuk naikkan penjualan",
];

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

function bacaKuota(): { tanggal: string; terpakai: number } {
  try {
    const raw = localStorage.getItem(KUOTA_KEY);
    if (raw) {
      const q = JSON.parse(raw);
      if (q.tanggal === hariIni()) return q;
    }
  } catch {
    // abaikan
  }
  return { tanggal: hariIni(), terpakai: 0 };
}

function tulisKuota(terpakai: number) {
  localStorage.setItem(KUOTA_KEY, JSON.stringify({ tanggal: hariIni(), terpakai }));
}

type Status = "idle" | "loading" | "error" | "quota";

export default function AnalisPage() {
  const [pertanyaan, setPertanyaan] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [sisaKuota, setSisaKuota] = useState<number | null>(null);
  const [simulasi, setSimulasi] = useState<Simulasi>("normal");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [konteks, setKonteks] = useState<Konteks>({
    dataset: "Penjualan Sep 2026 (v3)",
    metrik: "omzet_bersih",
    periode: "Sep 2026",
    filter: "—",
  });
  const [riwayat, setRiwayat] = useState<
    { tanya: string; jawab: K1Response }[]
  >([]);

  useEffect(() => {
    setSisaKuota(KUOTA_HARIAN - bacaKuota().terpakai);
  }, []);

  async function kirim() {
    const t = pertanyaan.trim();
    if (!t || status === "loading") return;

    if (simulasi === "kuota") {
      setStatus("quota");
      return;
    }

    const kuota = bacaKuota();
    if (kuota.terpakai >= KUOTA_HARIAN) {
      setStatus("quota");
      return;
    }
    tulisKuota(kuota.terpakai + 1);
    setSisaKuota(KUOTA_HARIAN - kuota.terpakai - 1);

    setPertanyaan("");
    setStatus("loading");
    try {
      if (simulasi === "error") throw new Error("Simulasi error");
      const jawab = await getAnalystRun();
      setRiwayat((r) => [...r, { tanya: t, jawab: jawab }]);
      setStatus("idle");
    } catch {
      setPertanyaan(t); // kembalikan pertanyaan agar bisa dikirim ulang
      setStatus("error");
    }
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      {/* Bar atas */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-navy">AI Analyst</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex max-w-[10rem] items-center gap-1.5 truncate rounded-full border border-border bg-white px-3 py-1.5 text-xs text-navy lg:hidden"
          >
            <SlidersHorizontal className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{konteks.dataset}</span>
          </button>
          {process.env.NODE_ENV === "development" && (
            <select
              value={simulasi}
              onChange={(e) => {
                const s = e.target.value as Simulasi;
                setSimulasi(s);
                setStatus("idle");
              }}
              aria-label="Simulasi state (dev)"
              className="rounded-md border border-border bg-white px-2 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="normal">Simulasi: Normal</option>
              <option value="error">Simulasi: Error</option>
              <option value="kuota">Simulasi: Kuota habis</option>
            </select>
          )}
        </div>
      </div>

      {/* Konten */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:gap-4 lg:overflow-hidden">
        <div className="order-2 flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pb-4 lg:order-1">
          {/* Empty state: sapaan + saran */}
          {riwayat.length === 0 && status === "idle" && (
            <div className="space-y-4 pb-4 pt-6 text-center">
              <p className="text-lg font-semibold text-navy">
                Mau tahu apa tentang bisnismu?
              </p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Tanyakan apa saja tentang data penjualanmu — jawaban masih memakai
                data mock (K-1) selama backend belum tersambung.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SARAN_PERTANYAAN.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPertanyaan(s)}
                    className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-navy hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {riwayat.map((item, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-md rounded-lg bg-primary px-4 py-2 text-sm text-white">
                  {item.tanya}
                </div>
              </div>
              <ResponseView run={item.jawab} />
            </div>
          ))}

          {status === "loading" && (
            <div className="space-y-3 rounded-lg border border-border bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="size-2 animate-bounce rounded-full bg-primary" />
                AI sedang menganalisis...
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {status === "error" && (
            <StateBlock
              variant="error"
              title="Gagal mendapat jawaban"
              description="Terjadi kesalahan saat menghubungi AI Analyst. Pertanyaan Anda sudah dikembalikan ke kolom input — coba kirim ulang."
              action={
                <button
                  onClick={() => setStatus("idle")}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Coba lagi
                </button>
              }
            />
          )}

          {status === "quota" && (
            <StateBlock
              variant="quota"
              title="Kuota harian habis"
              description={`Anda sudah menggunakan ${KUOTA_HARIAN} pertanyaan hari ini. Kuota akan direset otomatis besok.`}
              action={
                process.env.NODE_ENV === "development" ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem(KUOTA_KEY);
                      setSisaKuota(KUOTA_HARIAN);
                      setSimulasi("normal");
                      setStatus("idle");
                    }}
                    className="rounded-md border border-border px-4 py-2 text-sm text-navy hover:bg-accent"
                  >
                    Reset kuota (dev)
                  </button>
                ) : undefined
              }
            />
          )}
        </div>

        <ContextSidebar konteks={konteks} onChange={setKonteks} />
      </div>

      {/* Input */}
      {status === "quota" ? (
        <div className="mt-2 rounded-lg border border-dashed border-warning/50 bg-warning/5 px-4 py-3 text-center text-xs text-warning">
          Kuota harian terpakai — kembali lagi besok.
        </div>
      ) : (
        <div className="mt-2 rounded-lg border border-border bg-white p-2">
          <div className="flex items-center gap-2">
            <input
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && kirim()}
              placeholder="Tanya apa saja tentang data Anda..."
              className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <button
              onClick={kirim}
              aria-label="Kirim pertanyaan"
              className="rounded-md bg-primary p-2 text-white disabled:opacity-50"
              disabled={!pertanyaan.trim() || status === "loading"}
            >
              <SendHorizonal className="size-4" />
            </button>
          </div>
          {sisaKuota !== null && (
            <p className="px-2 pt-1 text-[11px] text-muted-foreground">
              Sisa kuota hari ini: {Math.max(sisaKuota, 0)}/{KUOTA_HARIAN}
            </p>
          )}
        </div>
      )}

      {/* Bottom sheet konteks (mobile) */}
      <ContextSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        konteks={konteks}
        onChange={setKonteks}
      />
    </div>
  );
}
