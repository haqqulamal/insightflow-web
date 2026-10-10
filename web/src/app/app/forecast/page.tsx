import { LineChart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ForecastPage() {
  return (
    <div className="stack-section">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-navy">Forecast & Proyeksi</h1>
        <p className="text-sm text-muted-foreground">
          Prediksi tren penjualan, stok, dan arus kas masa depan bisnis Anda.
        </p>
      </div>

      <div className="card-pad flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white px-6 py-16 text-center">
        <span className="rounded-full bg-primary/10 p-4 text-primary">
          <LineChart className="size-8" />
        </span>
        <div className="max-w-md space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Fitur Tahap 2 (Segera Hadir)
          </div>
          <h2 className="text-base font-semibold text-navy">
            Model Forecasting AI Sedang Disiapkan
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fitur proyeksi akan memprediksi penjualan 30–90 hari ke depan berdasarkan
            historis data Anda menggunakan kontrak data K-2.
          </p>
        </div>
        <Link
          href="/app/analis"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Coba Analisis AI Analyst Dulu
        </Link>
      </div>
    </div>
  );
}
