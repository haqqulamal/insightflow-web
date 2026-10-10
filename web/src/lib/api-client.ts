import datasets from "@/lib/mocks/datasets.json";
import k1 from "@/lib/mocks/k1-response.json";
import type { K1Response } from "@/lib/contracts/k1";

// Delay mock agar state loading benar-benar terlihat di UI.
const MOCK_DELAY_MS = 600;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAnalystRun(): Promise<K1Response> {
  await delay(MOCK_DELAY_MS);
  return k1 as K1Response;
}

export type { K1Response };

export type Dataset = (typeof datasets)[number];

export type DashboardSummary = {
  periode: string;
  kpi: {
    totalOmzet: number;
    persenOmzet: number;
    totalTransaksi: number;
    persenTransaksi: number;
    rataRataKeranjang: number;
    persenRataRata: number;
    kualitasData: number;
  };
  trenPenjualan: Array<{ tanggal: string; omzet: number }>;
  omzetPerWilayah: Array<{ wilayah: string; omzet: number }>;
  insightUtama: {
    judul: string;
    ringkasan: string;
    rekomendasi: string;
  };
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(MOCK_DELAY_MS);
  return {
    periode: "Sep 2026",
    kpi: {
      totalOmzet: 1377000000,
      persenOmzet: -12.4,
      totalTransaksi: 4820,
      persenTransaksi: 8.1,
      rataRataKeranjang: 285600,
      persenRataRata: 3.8,
      kualitasData: 98,
    },
    trenPenjualan: [
      { tanggal: "01 Sep", omzet: 42000000 },
      { tanggal: "05 Sep", omzet: 48000000 },
      { tanggal: "10 Sep", omzet: 55000000 },
      { tanggal: "15 Sep", omzet: 39000000 },
      { tanggal: "20 Sep", omzet: 41000000 },
      { tanggal: "25 Sep", omzet: 46000000 },
      { tanggal: "30 Sep", omzet: 51000000 },
    ],
    omzetPerWilayah: [
      { wilayah: "Jawa Barat", omzet: 412000000 },
      { wilayah: "DKI Jakarta", omzet: 358000000 },
      { wilayah: "Jawa Timur", omzet: 295000000 },
      { wilayah: "Sumatera Utara", omzet: 180000000 },
      { wilayah: "Timur", omzet: 132000000 },
    ],
    insightUtama: {
      judul: "Penurunan di Wilayah Timur",
      ringkasan: "Omzet bulan ini turun 12,4%. Penurunan terbesar terjadi di Wilayah Timur sebesar 18,2%.",
      rekomendasi: "Periksa stok dan harga Produk A di Wilayah Timur.",
    },
  };
}

// Sementara: membaca fixture lokal. Nanti diganti fetch ke FastAPI
// berkat endpoint /api/v1/datasets (lihat PRD-01 §16).
export async function listDatasets(): Promise<Dataset[]> {
  await delay(MOCK_DELAY_MS);
  return datasets;
}
