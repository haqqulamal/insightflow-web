import { describe, expect, it } from "vitest";
import { cariHrefAktif } from "./nav-aktif";

const hrefs = [
  "/app",
  "/app/analis",
  "/app/forecast",
  "/app/dataset",
  "/app/metrik",
  "/app/tersimpan",
  "/app/laporan",
  "/app/koneksi",
  "/app/pengaturan",
];

describe("cariHrefAktif", () => {
  it("mencocokkan rute persis", () => {
    expect(cariHrefAktif("/app", hrefs)).toBe("/app");
    expect(cariHrefAktif("/app/analis", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/forecast", hrefs)).toBe("/app/forecast");
    expect(cariHrefAktif("/app/dataset", hrefs)).toBe("/app/dataset");
    expect(cariHrefAktif("/app/metrik", hrefs)).toBe("/app/metrik");
    expect(cariHrefAktif("/app/pengaturan", hrefs)).toBe("/app/pengaturan");
  });

  it("memilih yang paling spesifik saat berada di rute anak", () => {
    expect(cariHrefAktif("/app/analis", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/analis/detail", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/dataset/123/edit", hrefs)).toBe("/app/dataset");
  });

  it("hanya mengaktifkan /app saat berada di beranda aplikasi", () => {
    expect(cariHrefAktif("/app", hrefs)).toBe("/app");
    expect(cariHrefAktif("/app/analis", hrefs)).not.toBe("/app");
    expect(cariHrefAktif("/app/forecast", hrefs)).not.toBe("/app");
  });

  it("mengembalikan undefined jika tidak ada yang cocok", () => {
    expect(cariHrefAktif("/masuk", hrefs)).toBeUndefined();
  });
});
