const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** "Rp 1.240.000" | untuk nilai besar: gunakan formatRupiahSingkat */
export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

/** 1240000 -> "Rp 1,24 jt" ; 3820000000 -> "Rp 3,82 M" */
export function formatRupiahSingkat(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `Rp ${trim(value / 1e9)} M`;
  if (abs >= 1e6) return `Rp ${trim(value / 1e6)} jt`;
  if (abs >= 1e3) return `Rp ${trim(value / 1e3)} rb`;
  return `Rp ${value}`;
}

function trim(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

/** 0.124 -> "12,4%" */
export function formatPersen(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits).replace(".", ",")}%`;
}

/** 24381 -> "24.381" */
export function formatAngka(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** 2026-10-07 -> "7 Okt 2026" */
export function formatTanggal(date: Date | string): string {
  return tanggalFormatter.format(new Date(date));
}
