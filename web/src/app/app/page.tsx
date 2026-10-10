"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api-client";
import {
  formatAngka,
  formatRupiah,
  formatRupiahSingkat,
} from "@/lib/formatters";
import { DynamicChart } from "@/components/analyst/dynamic-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function RingkasanPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary);
  }, []);

  if (!summary) {
    return (
      <div className="stack-section">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-pad space-y-3 rounded-lg border border-border bg-white">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  const { kpi, trenPenjualan, omzetPerWilayah, insightUtama } = summary;
  const trenRows = trenPenjualan.map((item) => [item.tanggal, item.omzet]);
  const wilayahRows = omzetPerWilayah.map((item) => [item.wilayah, item.omzet]);

  return (
    <div className="stack-section">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy">
            Ringkasan Performa Bisnis
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview metrik penjualan, tren, dan rekomendasi AI harian Anda.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-white px-3.5 py-1 text-xs text-slate-ink sm:self-auto">
          <span className="size-2 rounded-full bg-success" />
          Periode: <strong className="text-navy">{summary.periode}</strong>
        </div>
      </div>

      {/* Kartu KPI Grid (4 Kartu) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Omzet */}
        <div className="card-pad space-y-2 rounded-lg border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Omzet</span>
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-navy md:text-xl">
            {formatRupiahSingkat(kpi.totalOmzet)}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            {kpi.persenOmzet < 0 ? (
              <span className="flex items-center gap-0.5 font-medium text-destructive">
                <TrendingDown className="size-3.5" />
                {Math.abs(kpi.persenOmzet)}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 font-medium text-success">
                <TrendingUp className="size-3.5" />
                +{kpi.persenOmzet}%
              </span>
            )}
            <span className="text-muted-foreground">vs bulan lalu</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="card-pad space-y-2 rounded-lg border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Transaksi</span>
            <span className="rounded-md bg-info/10 p-1.5 text-info">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-navy md:text-xl">
            {formatAngka(kpi.totalTransaksi)} pesanan
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-0.5 font-medium text-success">
              <TrendingUp className="size-3.5" />
              +{kpi.persenTransaksi}%
            </span>
            <span className="text-muted-foreground">vs bulan lalu</span>
          </div>
        </div>

        {/* Rata-rata Keranjang (AOV) */}
        <div className="card-pad space-y-2 rounded-lg border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rata-rata Keranjang</span>
            <span className="rounded-md bg-ai/10 p-1.5 text-ai">
              <Sparkles className="size-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-navy md:text-xl">
            {formatRupiah(kpi.rataRataKeranjang)}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-0.5 font-medium text-success">
              <TrendingUp className="size-3.5" />
              +{kpi.persenRataRata}%
            </span>
            <span className="text-muted-foreground">vs bulan lalu</span>
          </div>
        </div>

        {/* Kualitas Data */}
        <div className="card-pad space-y-2 rounded-lg border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Kualitas Data</span>
            <span className="rounded-md bg-success/10 p-1.5 text-success">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-navy md:text-xl">
            {kpi.kualitasData}%
          </p>
          <p className="text-xs text-success">Sangat Baik (Siap untuk AI)</p>
        </div>
      </div>

      {/* Bento Layout: Insight Utama AI (Sorotan) */}
      <div className="card-pad space-y-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-white to-white shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-4" />
          Insight AI Analyst Hari Ini
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-navy">
            {insightUtama.judul}
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-slate-ink">
            {insightUtama.ringkasan} {insightUtama.rekomendasi}
          </p>
        </div>
        <div className="pt-1">
          <Link
            href="/app/analis"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span>Tanyakan Rincian ke AI Analyst</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Visualisasi Grafik Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Tren Penjualan Harian */}
        <div className="card-pad rounded-lg border border-border bg-white shadow-xs lg:col-span-7">
          <DynamicChart
            rows={trenRows}
            tipe="line"
            title="Tren Omzet Harian (Sep 2026)"
          />
        </div>

        {/* Distribusi Omzet Per Wilayah */}
        <div className="card-pad rounded-lg border border-border bg-white shadow-xs lg:col-span-5">
          <DynamicChart
            rows={wilayahRows}
            tipe="bar"
            title="Omzet per Wilayah"
          />
        </div>
      </div>
    </div>
  );
}
