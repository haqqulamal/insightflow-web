// Tipe kontrak K-1 sesuai PRD-00 §11.1.
// Nanti bisa digenerate otomatis dari JSON Schema bila kontrak distandarkan.
export type K1FindingType = "fact" | "inference" | "recommendation";

export interface K1Finding {
  id: string;
  type: K1FindingType;
  text: string;
  evidence_ref: string | null;
}

export interface K1MetricDefinition {
  metric: string;
  label: string;
  summary: string;
}

export interface K1Query {
  id: string;
  sql: string;
  row_count: number;
  truncated: boolean;
  duration_ms: number;
  dataset_version_id: string;
}

export interface K1Data {
  query_id: string;
  columns: { name: string; type: string }[];
  rows: (string | number | null)[][];
}

export interface K1Chart {
  type: "bar" | "line" | "scatter" | "donut" | "table";
  x: string;
  y: string[];
  series: string | null;
  sort: "asc" | "desc" | null;
  title: string;
}

export interface K1Confidence {
  level: "high" | "medium" | "low";
  reasons: string[];
}

export interface K1Response {
  contract_version: string;
  run_id: string;
  conversation_id: string;
  status: "completed" | "needs_clarification" | "refused" | "failed";
  answer: string;
  findings: K1Finding[];
  metric_definitions: K1MetricDefinition[];
  queries: K1Query[];
  data: K1Data;
  chart: K1Chart;
  confidence: K1Confidence;
  clarification: unknown;
  refusal: unknown;
  warnings: unknown[];
  suggested_actions: {
    id: string;
    label: string;
    action: string;
    payload: Record<string, unknown>;
  }[];
  rag_context: unknown;
  usage: { counted: boolean; llm_calls: number; tokens_in: number; tokens_out: number };
}
