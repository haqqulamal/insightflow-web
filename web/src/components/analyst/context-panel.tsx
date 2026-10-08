"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function ContextPanel() {
  const [dataset, setDataset] = useState("Penjualan Sep 2026 (v3)");
  const [metrik, setMetrik] = useState("omzet_bersih");
  const [periode, setPeriode] = useState("Sep 2026");
  const [filter, setFilter] = useState("—");
  const [open, setOpen] = useState(false);

  return (
    <aside className="order-1 lg:order-2 w-full lg:w-72 shrink-0 rounded-lg border border-border bg-white overflow-hidden">
      {/* Header: jadi tombol toggle di mobile, selalu terbuka di lg */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-navy lg:cursor-default"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Konteks Data
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform lg:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`space-y-4 border-t border-border px-4 py-4 max-h-[55dvh] overflow-y-auto lg:max-h-none lg:overflow-visible ${
          open ? "block" : "hidden lg:block"
        }`}
      >
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Dataset</span>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="w-full appearance-none rounded-md border border-border bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_0.6rem_center] px-2 py-1.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option>Penjualan Sep 2026 (v3)</option>
            <option>Penjualan Agu 2026 (v2)</option>
          </select>
        </label>

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
      </div>
    </aside>
  );
}
