"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DimensionScore } from "@/lib/satir";

type ResultChartProps = {
  scores: DimensionScore[];
};

export function ResultChart({ scores }: ResultChartProps) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={scores} margin={{ top: 24, right: 8, left: -24, bottom: 8 }}>
          <CartesianGrid stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, "平均分"]} />
          <Bar dataKey="average" fill="#1689f9" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 12 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
