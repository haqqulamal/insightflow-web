"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export function ContextPanel() {
  const [dataset, setDataset] = useState("Penjualan Sep 2026 (v3)");
  const [metrik, setMetrik] = useState("omzet_bersih");
  const [periode, setPeriode] = useState("Sep 2026");
  const [filter, setFilter] = useState("—");

  return (
    <aside className="w-full lg:w-72 shrink-0 rounded-lg border border-border bg-white p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-navy">
        <SlidersHorizontal className="size-4" />
        Konteks Data
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Dataset</span>
        <div className="grid grid-cols-1 gap-1.5">
          {["Penjualan Sep 2026 (v3)", "Penjualan Agu 2026 (v2)"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDataset(d)}
              className={`rounded-md border px-2 py-1.5 text-sm text-left transition-colors ${
                dataset === d
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border bg-white text-slate-ink hover:bg-accent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Metrik aktif</span>
        <input
          value={metrik}
          onChange={(e) => setMetrik(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Periode</span>
        <input
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Filter</span>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <p className="text-[11px] text-muted-foreground">
        Konteks (K-4) akan dikirim bersama setiap pertanyaan.
      </p>
    </aside>
  );
}
