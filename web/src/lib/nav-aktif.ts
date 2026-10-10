/**
 * Menentukan item navigasi mana yang dianggap aktif untuk sebuah path.
 *
 * Item cocok kalau path-nya sama persis, atau item itu menjadi induk dari
 * path sekarang (`/app/analis` cocok dengan `/app/analis`). Kalau beberapa
 * item cocok sekaligus, yang paling spesifik — href terpanjang — yang menang.
 * Tanpa aturan ini, `/app` ikut aktif saat pengguna berada di `/app/analis`.
 */
export function cariHrefAktif(
  pathname: string,
  hrefs: readonly string[],
): string | undefined {
  return hrefs
    .filter(
      (href) => pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
}