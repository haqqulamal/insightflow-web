"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export type Konteks = {
  dataset: string;
  metrik: string;
  periode: string;
  filter: string;
};

const DATASETS = ["Penjualan Sep 2026 (v3)", "Penjualan Agu 2026 (v2)"];

function SelectDataset({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full appearance-none rounded-md border border-border bg-white px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {DATASETS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function ContextFields({
  konteks,
  onChange,
  footer,
}: {
  konteks: Konteks;
  onChange: (k: Konteks) => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <label className="block space-y-1.5">
        <span className="text-xs text-muted-foreground">Dataset</span>
        <SelectDataset
          value={konteks.dataset}
          onChange={(dataset) => onChange({ ...konteks, dataset })}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-muted-foreground">Metrik aktif</span>
        <input
          value={konteks.metrik}
          onChange={(e) => onChange({ ...konteks, metrik: e.target.value })}
          className="min-h-11 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-muted-foreground">Periode</span>
        <input
          value={konteks.periode}
          onChange={(e) => onChange({ ...konteks, periode: e.target.value })}
          className="min-h-11 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-muted-foreground">Filter</span>
        <input
          value={konteks.filter}
          onChange={(e) => onChange({ ...konteks, filter: e.target.value })}
          className="min-h-11 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <p className="text-[11px] text-muted-foreground">
        Konteks (K-4) akan dikirim bersama setiap pertanyaan.
      </p>

      {footer}
    </div>
  );
}

/** Sidebar kanan — hanya desktop (lg). */
export function ContextSidebar({
  konteks,
  onChange,
  footer,
}: {
  konteks: Konteks;
  onChange: (k: Konteks) => void;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="hidden w-72 shrink-0 self-start rounded-lg border border-border bg-white p-5 lg:block">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-navy">
        <SlidersHorizontal className="size-4" />
        Konteks Data
      </div>
      <ContextFields konteks={konteks} onChange={onChange} footer={footer} />
    </aside>
  );
}

/** Bottom sheet — hanya mobile/tablet (< lg). */
export function ContextSheet({
  open,
  onClose,
  konteks,
  onChange,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  konteks: Konteks;
  onChange: (k: Konteks) => void;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 lg:hidden ${
        open ? "" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-safe shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-medium text-navy">
            <SlidersHorizontal className="size-4" />
            Konteks Data
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel konteks"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
          >
            <X className="size-5" />
          </button>
        </div>
        <ContextFields konteks={konteks} onChange={onChange} footer={footer} />
      </div>
    </div>
  );
}
