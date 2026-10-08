import datasets from "@/lib/mocks/datasets.json";
import k1 from "@/lib/mocks/k1-response.json";

export async function getAnalystRun() {
  return k1;
}

export type K1Response = typeof k1;

export type Dataset = (typeof datasets)[number];

// Sementara: membaca fixture lokal. Nanti diganti fetch ke FastAPI
// berkat endpoint /api/v1/datasets (lihat PRD-01 §16).
export async function listDatasets(): Promise<Dataset[]> {
  return datasets;
}
