"use client";

import { useSyncExternalStore } from "react";

export const KUOTA_HARIAN = 10;
const KUOTA_KEY = "insightflow-kuota-analis";

type Kuota = { tanggal: string; terpakai: number };

function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

function bacaKuota(): Kuota {
  try {
    const raw = localStorage.getItem(KUOTA_KEY);
    if (raw) {
      const q = JSON.parse(raw);
      if (q.tanggal === hariIni()) return q;
    }
  } catch {
    // data korup → anggap belum terpakai
  }
  return { tanggal: hariIni(), terpakai: 0 };
}

function tulisKuota(terpakai: number) {
  localStorage.setItem(KUOTA_KEY, JSON.stringify({ tanggal: hariIni(), terpakai }));
  notify();
}

// localStorage diperlakukan sebagai external store: komponen berlangganan
// lewat useSyncExternalStore, bukan membaca/menulis state lewat effect.
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // perubahan dari tab lain
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function hitungSisa(): number {
  return KUOTA_HARIAN - bacaKuota().terpakai;
}

/** Kuota pertanyaan harian (mock, tersimpan di localStorage). */
export function useKuotaHarian() {
  const sisa = useSyncExternalStore(subscribe, hitungSisa, () => null);

  return {
    /** Sisa kuota hari ini; null saat SSR/hydration. */
    sisa,
    /** Pakai 1 kuota. false = kuota habis. */
    pakai(): boolean {
      const q = bacaKuota();
      if (q.terpakai >= KUOTA_HARIAN) return false;
      tulisKuota(q.terpakai + 1);
      return true;
    },
    /** Kembalikan 1 kuota (dipakai saat request gagal). */
    refund() {
      const q = bacaKuota();
      tulisKuota(Math.max(q.terpakai - 1, 0));
    },
    reset() {
      localStorage.removeItem(KUOTA_KEY);
      notify();
    },
  };
}
