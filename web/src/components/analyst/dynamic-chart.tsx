"use client";

import dynamic from "next/dynamic";
import { formatRupiahSingkat } from "@/lib/formatters";
import type { K1Chart } from "@/lib/contracts/k1";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const ACCENT = "#2563EB";
const PALETTE = ["#2563EB", "#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

const tooltipRupiah = {
  formatter: (p: { name: string; value: number }) =>
    `${p.name}: ${formatRupiahSingkat(p.value)}`,
};

/**
 * Render chart sesuai `chart.type` dari kontrak K-1.
 * `table` dan `scatter` belum didukung ECharts di sini → fallback ke bar.
 */
function buildOption(
  tipe: K1Chart["type"],
  rows: (string | number | null)[][],
  title: string,
) {
  const kategori = rows.map((r) => String(r[0]));
  const nilai = rows.map((r) => (typeof r[1] === "number" ? r[1] : 0));

  if (tipe === "donut") {
    return {
      title: { text: title, textStyle: { fontSize: 14 } },
      tooltip: tooltipRupiah,
      series: [
        {
          type: "pie" as const,
          radius: ["40%", "65%"],
          data: kategori.map((name, i) => ({ name, value: nilai[i] })),
          itemStyle: { color: (p: { dataIndex: number }) => PALETTE[p.dataIndex % PALETTE.length] },
        },
      ],
    };
  }

  if (tipe === "line") {
    return {
      title: { text: title, textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" as const },
      grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
      xAxis: { type: "category" as const, data: kategori },
      yAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => formatRupiahSingkat(v) },
      },
      series: [
        {
          type: "line" as const,
          data: nilai,
          itemStyle: { color: ACCENT },
          lineStyle: { color: ACCENT },
        },
      ],
    };
  }

  // bar (default) — horizontal agar label kategori muat di layar sempit
  return {
    title: { text: title, textStyle: { fontSize: 14 } },
    tooltip: tooltipRupiah,
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: {
      type: "value" as const,
      splitNumber: 4,
      axisLabel: {
        hideOverlap: true,
        formatter: (v: number) => (v === 0 ? "0" : formatRupiahSingkat(v)),
      },
    },
    yAxis: { type: "category" as const, data: kategori, inverse: true },
    series: [{ type: "bar" as const, data: nilai, itemStyle: { color: ACCENT } }],
  };
}

export function DynamicChart({
  rows,
  tipe,
  title,
}: {
  rows: (string | number | null)[][];
  tipe: K1Chart["type"];
  title: string;
}) {
  return <ReactECharts option={buildOption(tipe, rows, title)} style={{ height: 240 }} />;
}
