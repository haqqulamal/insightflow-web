import { FileBarChart, Sparkles } from "lucide-react";

export default function LaporanPage() {
  return (
    <div className="stack-section">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-navy">Laporan & Ekspor Data</h1>
        <p className="text-sm text-muted-foreground">
          Unduh laporan mingguan/bulanan berformat PDF atau spreadsheet Excel.
        </p>
      </div>

      <div className="card-pad flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white px-6 py-16 text-center">
        <span className="rounded-full bg-primary/10 p-4 text-primary">
          <FileBarChart className="size-8" />
        </span>
        <div className="max-w-md space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Fitur Tahap 2 (Segera Hadir)
          </div>
          <h2 className="text-base font-semibold text-navy">
            Generator Laporan Otomatis
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Anda akan dapat membuat ringkasan eksekutif berformat PDF resmi atau ekspor dataset yang sudah dibersihkan oleh AI.
          </p>
        </div>
      </div>
    </div>
  );
}
