import type { K1Response } from "@/lib/contracts/k1";
import { DynamicChart } from "./dynamic-chart";
import { ChevronDown } from "lucide-react";

const labelStyle: Record<string, string> = {
  fact: "bg-success/10 text-success",
  inference: "bg-warning/10 text-warning",
  recommendation: "bg-ai/10 text-ai",
};

const labelText: Record<string, string> = {
  fact: "Fakta",
  inference: "Inferensi",
  recommendation: "Rekomendasi",
};

const confidenceStyle: Record<string, string> = {
  high: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  low: "bg-destructive/10 text-destructive",
};

const confidenceText: Record<string, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

export function ResponseView({ run }: { run: K1Response }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      {/* Ringkasan */}
      <p className="text-sm font-medium leading-relaxed text-navy">{run.answer}</p>

      {/* Temuan */}
      <ul className="space-y-2">
        {run.findings.map((f) => (
          <li key={f.id} className="flex items-start gap-2 text-sm leading-relaxed">
            <span
              className={`mt-0.5 inline-block w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] ${labelStyle[f.type]}`}
            >
              {labelText[f.type]}
            </span>
            <span className="flex-1 text-slate-ink">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* Chart */}
      <DynamicChart rows={run.data.rows} tipe={run.chart.type} title={run.chart.title} />

      {/* Aksi lanjutan */}
      {run.suggested_actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {run.suggested_actions.map((a) => (
            <button
              key={a.id}
              className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Detail teknis — tersembunyi secara default */}
      <details className="group border-t border-border pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-primary">
          Detail teknis
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-3 space-y-4 text-sm">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">SQL</p>
            <pre className="overflow-x-auto rounded-md bg-navy p-3 text-xs text-slate-100">
              {run.queries[0]?.sql}
            </pre>
          </div>

          {run.metric_definitions.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Definisi metrik</p>
              <ul className="space-y-1 text-slate-ink">
                {run.metric_definitions.map((m) => (
                  <li key={m.metric}>
                    <span className="font-medium">{m.label}:</span> {m.summary}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${confidenceStyle[run.confidence.level]}`}
            >
              Keyakinan: {confidenceText[run.confidence.level]}
            </span>
            <span className="text-xs text-muted-foreground">
              {run.confidence.reasons.join(" · ")}
            </span>
          </div>

          {run.warnings.length > 0 && (
            <ul className="space-y-1 text-xs text-warning">
              {run.warnings.map((w, i) => (
                <li key={i}>⚠ {String(w)}</li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
