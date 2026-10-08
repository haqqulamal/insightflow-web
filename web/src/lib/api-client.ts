import datasets from "@/lib/mocks/datasets.json";

export type Dataset = (typeof datasets)[number];

// Sementara: membaca fixture lokal. Nanti diganti fetch ke FastAPI
// berkat endpoint /api/v1/datasets (lihat PRD-01 §16).
export async function listDatasets(): Promise<Dataset[]> {
  return datasets;
}
