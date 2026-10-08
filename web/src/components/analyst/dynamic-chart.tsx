"use client";

import dynamic from "next/dynamic";

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
    tooltip: {},
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: { type: "value" as const },
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
