"use client";

import { Sigma, Plus } from "lucide-react";

const mockMetrik = [
  {
    nama: "omzet_bersih",
    label: "Omzet Bersih",
    rumus: "Penjualan − Diskon − Retur",
    sumber: "Sistem (Default)",
    dipakai: "14 Analisis",
  },
  {
    nama: "aov",
    label: "Rata-rata Keranjang (AOV)",
    rumus: "Total Omzet ÷ Total Transaksi",
    sumber: "Sistem (Default)",
    dipakai: "8 Analisis",
  },
  {
    nama: "margin_kotor",
    label: "Margin Kotor",
    rumus: "(Omzet − HPP) ÷ Omzet",
    sumber: "Kustom",
    dipakai: "5 Analisis",
  },
];

export default function MetrikPage() {
  return (
    <div className="stack-section">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy">Kamus & Editor Metrik</h1>
          <p className="text-sm text-muted-foreground">
            Kelola definisi metrik bisnis yang digunakan AI Analyst dalam perhitungan (K-4).
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Fitur penambahan metrik kustom akan hadir pada integrasi backend.")}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Tambah Metrik Kustom
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockMetrik.map((m) => (
          <div
            key={m.nama}
            className="card-pad space-y-3 rounded-lg border border-border bg-white shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-primary/10 p-2 text-primary">
                <Sigma className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-navy">{m.label}</p>
                <code className="text-[11px] text-muted-foreground">{m.nama}</code>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-ink">
                <strong className="text-navy">Rumus:</strong> {m.rumus}
              </p>
              <p className="text-muted-foreground">
                Sumber: {m.sumber} · Dipakai di {m.dipakai}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
