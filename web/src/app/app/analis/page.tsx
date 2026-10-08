"use client";

import { useEffect, useState } from "react";
import { getAnalystRun, type K1Response } from "@/lib/api-client";
import { ResponseView } from "@/components/analyst/response-view";
import { ContextPanel } from "@/components/analyst/context-panel";
import { StateBlock } from "@/components/ui/state-block";
import { Skeleton } from "@/components/ui/skeleton";
import { SendHorizonal } from "lucide-react";

const KUOTA_HARIAN = 10;
const KUOTA_KEY = "insightflow-kuota-analis";
const SIMULASI = ["normal", "error", "kuota"] as const;
type Simulasi = (typeof SIMULASI)[number];

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
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-xl font-semibold text-navy">AI Analyst</h1>
        {process.env.NODE_ENV === "development" && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Simulasi state (dev):
            <select
              value={simulasi}
              onChange={(e) => {
                const s = e.target.value as Simulasi;
                setSimulasi(s);
                setStatus("idle");
              }}
              className="rounded-md border border-border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="normal">Normal</option>
              <option value="error">Error</option>
              <option value="kuota">Kuota habis</option>
            </select>
          </label>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="order-2 lg:order-1 flex-1 min-h-0 flex flex-col overflow-y-auto pb-4 space-y-4">
          {riwayat.length === 0 && status !== "error" && (
            <p className="text-sm text-muted-foreground">
              Tanyakan sesuatu tentang datamu — jawaban akan memakai data mock (K-1) dulu.
            </p>
          )}
          {riwayat.map((item, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="rounded-lg bg-primary text-white px-4 py-2 text-sm max-w-md">
                  {item.tanya}
                </div>
              </div>
              <ResponseView run={item.jawab} />
            </div>
          ))}

          {status === "loading" && (
            <div className="rounded-lg border border-border bg-white p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]" />
                <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.1s]" />
                <span className="size-2 rounded-full bg-primary animate-bounce" />
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
        <ContextPanel />
      </div>

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
              className="rounded-md bg-primary text-white p-2 disabled:opacity-50"
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
    </div>
  );
}
