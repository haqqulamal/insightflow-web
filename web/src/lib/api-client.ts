import datasets from "@/lib/mocks/datasets.json";
import k1 from "@/lib/mocks/k1-response.json";
import type { K1Response } from "@/lib/contracts/k1";

export async function getAnalystRun(): Promise<K1Response> {
  return k1 as K1Response;
}

export type { K1Response };

export type Dataset = (typeof datasets)[number];

// Sementara: membaca fixture lokal. Nanti diganti fetch ke FastAPI
// berkat endpoint /api/v1/datasets (lihat PRD-01 §16).
export async function listDatasets(): Promise<Dataset[]> {
  return datasets;
}
