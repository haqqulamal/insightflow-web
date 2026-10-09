"use client";

import { useState } from "react";
import type { Dataset } from "@/lib/api-client";
import { formatAngka, formatTanggal } from "@/lib/formatters";
import { StateBlock } from "@/components/ui/state-block";
import { Skeleton } from "@/components/ui/skeleton";
import { DEV } from "@/lib/dev";
import { Database } from "lucide-react";

type Mode = "normal" | "empty" | "error";

export function DatasetList({ datasets }: { datasets: Dataset[] }) {
  const [tampilan, setTampilan] = useState<"loading" | Mode>(
    datasets.length === 0 ? "empty" : "normal",
  );
  const [simulasi, setSimulasi] = useState<Mode>(
    datasets.length === 0 ? "empty" : "normal",
  );

  function muatUlang(target: Mode = simulasi) {
    setTampilan("loading");
    setTimeout(() => setTampilan(target), 600);
  }

  return (
    <div className="space-y-5">
      {DEV && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Simulasi state (dev):
          <select
            value={simulasi}
            onChange={(e) => {
              const m = e.target.value as Mode;
              setSimulasi(m);
              muatUlang(m);
            }}
            className="min-h-11 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="normal">Normal</option>
            <option value="empty">Kosong</option>
            <option value="error">Error</option>
          </select>
        </label>
      )}

      {tampilan === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-pad space-y-3 rounded-lg border border-border bg-white">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {tampilan === "error" && (
        <StateBlock
          variant="error"
          description="Gagal memuat dataset. Periksa koneksi lalu coba lagi."
          action={
            <button
              onClick={() => muatUlang("normal")}
              className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
            >
              Coba lagi
            </button>
          }
        />
      )}

      {tampilan === "empty" && (
        <StateBlock
          variant="empty"
          title="Belum ada dataset"
          description="Unggah file CSV atau XLSX pertama Anda untuk mulai menganalisis."
        />
      )}

      {tampilan === "normal" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="card-pad space-y-3 rounded-lg border border-border bg-white"
            >
              <div className="flex items-center gap-2.5">
                <Database className="size-5 shrink-0 text-primary" />
                <p className="truncate text-[15px] font-medium text-navy">{ds.nama}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-ink">
                  {ds.kolom} kolom · {formatAngka(ds.baris)} baris
                </p>
                <p className="text-xs text-muted-foreground">
                  {ds.sumber} · Kualitas {ds.kualitas}% · {formatTanggal(ds.diperbarui)}
                </p>
              </div>
              <span className="inline-block rounded-full bg-success/10 px-2.5 py-1 text-[11px] text-success">
                {ds.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
