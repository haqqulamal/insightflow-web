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
    xAxis: { type: "category" as const, data: rows.map((r) => r[0]) },
    yAxis: { type: "value" as const },
    series: [
      {
        type: "bar" as const,
        data: rows.map((r) => r[1]),
        itemStyle: { color: "#2563EB" },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 280 }} />;
}
