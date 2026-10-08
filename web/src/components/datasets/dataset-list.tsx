"use client";

import { useState } from "react";
import type { Dataset } from "@/lib/api-client";
import { formatAngka, formatTanggal } from "@/lib/formatters";
import { StateBlock } from "@/components/ui/state-block";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-4">
      {process.env.NODE_ENV === "development" && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Simulasi state (dev):
          <select
            value={simulasi}
            onChange={(e) => {
              const m = e.target.value as Mode;
              setSimulasi(m);
              muatUlang(m);
            }}
            className="rounded-md border border-border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="normal">Normal</option>
            <option value="empty">Kosong</option>
            <option value="error">Error</option>
          </select>
        </label>
      )}

      {tampilan === "loading" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-4 space-y-3">
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
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="rounded-lg border border-border bg-white p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Database className="size-4 text-primary" />
                <p className="font-medium text-sm text-navy truncate">{ds.nama}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Sumber: {ds.sumber} · {formatAngka(ds.baris)} baris · {ds.kolom} kolom
              </p>
              <p className="text-xs text-muted-foreground">
                Kualitas {ds.kualitas}% · {formatTanggal(ds.diperbarui)}
              </p>
              <span className="inline-block text-[10px] rounded-full bg-success/10 text-success px-2 py-0.5">
                {ds.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
