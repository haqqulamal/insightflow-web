import { describe, expect, it } from "vitest";
import {
  formatAngka,
  formatPersen,
  formatRupiah,
  formatRupiahSingkat,
  formatTanggal,
} from "./formatters";

describe("formatRupiah", () => {
  it("memformat angka bulat tanpa desimal", () => {
    expect(formatRupiah(1240000)).toMatch(/^Rp\s1\.240\.000$/);
  });

  it("nol tetap Rp 0", () => {
    expect(formatRupiah(0)).toMatch(/^Rp\s0$/);
  });
});

describe("formatRupiahSingkat", () => {
  it("miliar -> M", () => {
    expect(formatRupiahSingkat(3820000000)).toBe("Rp 3,82 M");
  });

  it("juta -> jt", () => {
    expect(formatRupiahSingkat(412000000)).toBe("Rp 412 jt");
    expect(formatRupiahSingkat(1240000)).toBe("Rp 1,24 jt");
  });

  it("ribu -> rb", () => {
    expect(formatRupiahSingkat(1500)).toBe("Rp 1,5 rb");
  });

  it("di bawah 1000 ditulis apa adanya", () => {
    expect(formatRupiahSingkat(500)).toBe("Rp 500");
    expect(formatRupiahSingkat(0)).toBe("Rp 0");
  });

  it("trailing nol dibersihkan (410 jt, bukan 410,00)", () => {
    expect(formatRupiahSingkat(410000000)).toBe("Rp 410 jt");
  });
});

describe("formatPersen", () => {
  it("fraksi -> persen desimal koma", () => {
    expect(formatPersen(0.124)).toBe("12,4%");
  });

  it("mendukung digit yang dipilih", () => {
    expect(formatPersen(0.5, 0)).toBe("50%");
  });
});

describe("formatAngka", () => {
  it("memakai pemisah ribuan id-ID", () => {
    expect(formatAngka(24381)).toBe("24.381");
  });
});

describe("formatTanggal", () => {
  it("format Indonesia: 7 Okt 2026", () => {
    expect(formatTanggal("2026-10-07")).toBe("7 Okt 2026");
  });
});
