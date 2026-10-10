import { describe, expect, it } from "vitest";
import { cariHrefAktif } from "./nav-aktif";

const hrefs = [
  "/app",
  "/app/analis",
  "/app/dataset",
  "/app/pengaturan",
];

describe("cariHrefAktif", () => {
  it("mencocokkan rute persis", () => {
    expect(cariHrefAktif("/app", hrefs)).toBe("/app");
    expect(cariHrefAktif("/app/analis", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/dataset", hrefs)).toBe("/app/dataset");
  });

  it("memilih yang paling spesifik saat berada di rute anak", () => {
    expect(cariHrefAktif("/app/analis", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/analis/detail", hrefs)).toBe("/app/analis");
    expect(cariHrefAktif("/app/dataset/123/edit", hrefs)).toBe("/app/dataset");
  });

  it("hanya mengaktifkan /app saat berada di beranda aplikasi", () => {
    expect(cariHrefAktif("/app", hrefs)).toBe("/app");
    expect(cariHrefAktif("/app/analis", hrefs)).not.toBe("/app");
  });

  it("mengembalikan undefined jika tidak ada yang cocok", () => {
    expect(cariHrefAktif("/auth/masuk", hrefs)).toBeUndefined();
  });
});