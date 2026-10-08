import { listDatasets } from "@/lib/api-client";
import { formatAngka, formatTanggal } from "@/lib/formatters";
import { Uploader } from "@/components/datasets/uploader";
import { Database } from "lucide-react";

export default async function DatasetPage() {
  const datasets = await listDatasets();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-navy">Dataset</h1>

      <Uploader />

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
    </div>
  );
}
