import type { K1Response } from "@/lib/api-client";
import { DynamicChart } from "./dynamic-chart";

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

export function ResponseView({ run }: { run: K1Response }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      <p className="text-sm text-navy font-medium">{run.answer}</p>

      <ul className="space-y-1.5">
        {run.findings.map((f) => (
          <li key={f.id} className="text-sm leading-relaxed">
            <span className={`inline-block text-[10px] rounded-full px-2 py-0.5 mr-1.5 align-middle ${labelStyle[f.type]}`}>
              {labelText[f.type]}
            </span>
            <span className="text-slate-ink align-middle">{f.text}</span>
          </li>
        ))}
      </ul>

      <DynamicChart rows={run.data.rows} title={run.chart.title} />

      <details className="text-sm">
        <summary className="cursor-pointer text-primary">Lihat SQL</summary>
        <pre className="mt-2 rounded-md bg-navy text-slate-100 p-3 text-xs overflow-x-auto">
          {run.queries[0].sql}
        </pre>
      </details>

      {run.metric_definitions.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-primary">Definisi metrik</summary>
          <ul className="mt-2 space-y-1 text-slate-ink">
            {run.metric_definitions.map((m) => (
              <li key={m.metric}>
                <span className="font-medium">{m.label}:</span> {m.summary}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] rounded-full px-2 py-0.5 ${
            run.confidence.level === "high"
              ? "bg-success/10 text-success"
              : run.confidence.level === "medium"
                ? "bg-warning/10 text-warning"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          Keyakinan: {run.confidence.level === "high" ? "Tinggi" : run.confidence.level === "medium" ? "Sedang" : "Rendah"}
        </span>
        <span className="text-xs text-muted-foreground">
          {run.confidence.reasons.join(" · ")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {run.suggested_actions.map((a) => (
          <button
            key={a.id}
            className="text-xs rounded-full border border-border px-3 py-1 hover:bg-accent"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
