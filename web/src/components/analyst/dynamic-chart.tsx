"use client";

import dynamic from "next/dynamic";
import { formatRupiahSingkat } from "@/lib/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function DynamicChart({
  rows,
  title,
}: {
  rows: (string | number)[][];
  title: string;
}) {
  const option = {
    title: { text: title, textStyle: { fontSize: 14 } },
    tooltip: {
      formatter: (p: { name: string; value: number }) =>
        `${p.name}: ${formatRupiahSingkat(p.value)}`,
    },
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: {
      type: "value" as const,
      splitNumber: 4,
      axisLabel: {
        hideOverlap: true,
        formatter: (v: number) => (v === 0 ? "0" : formatRupiahSingkat(v)),
      },
    },
    yAxis: { type: "category" as const, data: rows.map((r) => r[0]), inverse: true },
    series: [
      {
        type: "bar" as const,
        data: rows.map((r) => r[1]),
        itemStyle: { color: "#2563EB" },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 240 }} />;
}
