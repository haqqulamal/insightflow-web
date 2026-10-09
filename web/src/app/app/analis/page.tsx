"use client";

import { useState } from "react";
import { getAnalystRun, type K1Response } from "@/lib/api-client";
import { ResponseView } from "@/components/analyst/response-view";
import {
  ContextSheet,
  ContextSidebar,
  type Konteks,
} from "@/components/analyst/context-panel";
import { StateBlock } from "@/components/ui/state-block";
import { Skeleton } from "@/components/ui/skeleton";
import { useKuotaHarian, KUOTA_HARIAN } from "@/hooks/use-kuota-harian";
import { DEV } from "@/lib/dev";
import { SendHorizonal, SlidersHorizontal } from "lucide-react";

type Simulasi = "normal" | "error" | "kuota";

const MAX_RIWAYAT = 20;

const SARAN_PERTANYAAN = [
  "Kenapa omzet bulan ini turun?",
  "Produk mana yang paling laku?",
  "Wilayah mana penjualannya paling rendah?",
  "Beri rekomendasi untuk naikkan penjualan",
];

type Status = "idle" | "loading" | "error" | "quota";

export default function AnalisPage() {
  const [pertanyaan, setPertanyaan] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [simulasi, setSimulasi] = useState<Simulasi>("normal");
  const [sheetOpen, setSheetOpen] = useState(false);
  const kuota = useKuotaHarian();
  const [konteks, setKonteks] = useState<Konteks>({
    dataset: "Penjualan Sep 2026 (v3)",
    metrik: "omzet_bersih",
    periode: "Sep 2026",
    filter: "—",
  });
  const [riwayat, setRiwayat] = useState<
    { tanya: string; jawab: K1Response }[]
  >([]);

  async function kirim() {
    const t = pertanyaan.trim();
    if (!t || status === "loading") return;

    if (simulasi === "kuota") {
      setStatus("quota");
      return;
    }

    if (!kuota.pakai()) {
      setStatus("quota");
      return;
    }

    setPertanyaan("");
    setStatus("loading");
    try {
      if (simulasi === "error") throw new Error("Simulasi error");
      const jawab = await getAnalystRun();
      setRiwayat((r) => [...r.slice(-(MAX_RIWAYAT - 1)), { tanya: t, jawab }]);
      setStatus("idle");
    } catch {
      kuota.refund(); // kuota tidak boleh hangus saat request gagal
      setPertanyaan(t); // kembalikan pertanyaan agar bisa dikirim ulang
      setStatus("error");
    }
  }

  // Simulasi state hanya untuk pengembangan — dipindah ke panel Konteks
  const alatDev = DEV ? (
    <div className="space-y-2 border-t border-border pt-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Alat dev
      </p>
      <select
        value={simulasi}
        onChange={(e) => {
          setSimulasi(e.target.value as Simulasi);
          setStatus("idle");
        }}
        aria-label="Simulasi state (dev)"
        className="min-h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="normal">Simulasi: Normal</option>
        <option value="error">Simulasi: Error</option>
        <option value="kuota">Simulasi: Kuota habis</option>
      </select>
    </div>
  ) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Bar atas */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-navy">AI Analyst</h1>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-h-11 max-w-[11rem] items-center gap-2 truncate rounded-full border border-border bg-white px-4 text-sm text-navy lg:hidden"
        >
          <SlidersHorizontal className="size-4 shrink-0 text-primary" />
          <span className="truncate">{konteks.dataset}</span>
        </button>
      </div>

      {/* Konten */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:gap-4 lg:overflow-hidden">
        <div className="order-2 flex min-h-0 flex-1 flex-col space-y-6 overflow-y-auto pb-6 lg:order-1">
          {/* Empty state: sapaan + saran */}
          {riwayat.length === 0 && status === "idle" && (
            <div className="space-y-5 px-2 py-10 text-center">
              <p className="text-xl font-semibold text-navy">
                Mau tahu apa tentang bisnismu?
              </p>
              <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                Tanyakan apa saja tentang data penjualanmu — jawaban masih memakai
                data mock (K-1) selama backend belum tersambung.
              </p>
              <div className="mx-auto grid max-w-sm gap-2.5 sm:flex sm:flex-wrap sm:justify-center">
                {SARAN_PERTANYAAN.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPertanyaan(s)}
                    className="min-h-11 rounded-full border border-border bg-white px-4 text-sm text-navy hover:border-primary hover:text-primary sm:text-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {riwayat.map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-md rounded-lg bg-primary px-4 py-2.5 text-[15px] text-white">
                  {item.tanya}
                </div>
              </div>
              <ResponseView run={item.jawab} />
            </div>
          ))}

          {status === "loading" && (
            <div className="card-pad space-y-4 rounded-lg border border-border bg-white">
              <div className="flex items-center gap-2 text-[15px] text-muted-foreground">
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
                  className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
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
                DEV ? (
                  <button
                    onClick={() => {
                      kuota.reset();
                      setSimulasi("normal");
                      setStatus("idle");
                    }}
                    className="min-h-11 rounded-md border border-border px-5 text-sm text-navy hover:bg-accent"
                  >
                    Reset kuota (dev)
                  </button>
                ) : undefined
              }
            />
          )}
        </div>

        <ContextSidebar konteks={konteks} onChange={setKonteks} footer={alatDev} />
      </div>

      {/* Input */}
      {status === "quota" ? (
        <div className="mt-4 rounded-lg border border-dashed border-warning/50 bg-warning/5 px-4 py-3.5 text-center text-xs text-warning">
          Kuota harian terpakai — kembali lagi besok.
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-white p-2.5">
          <div className="flex items-center gap-2">
            <input
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && kirim()}
              placeholder="Tanya apa saja tentang data Anda..."
              className="min-h-11 flex-1 bg-transparent px-3 text-[15px] outline-none"
            />
            <button
              onClick={kirim}
              aria-label="Kirim pertanyaan"
              className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-white disabled:opacity-50"
              disabled={!pertanyaan.trim() || status === "loading"}
            >
              <SendHorizonal className="size-5" />
            </button>
          </div>
          {kuota.sisa !== null && (
            <p className="px-3 pt-1.5 text-[11px] text-muted-foreground">
              Sisa kuota hari ini: {Math.max(kuota.sisa, 0)}/{KUOTA_HARIAN}
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
        footer={alatDev}
      />
    </div>
  );
}
