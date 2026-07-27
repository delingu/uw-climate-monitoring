"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  label: string;
  value: number | null;
}

export interface TrendChartProps {
  title: string;
  data: TrendPoint[];
  color: string;
  unit?: string;
}

export default function TrendChart({
  title,
  data,
  color,
  unit,
}: TrendChartProps) {
  const hasData = data.some((point) => point.value !== null);

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{title}</h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
              tickMargin={12}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value) => [`${value}${unit ?? ""}`, title]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
          No data for this range
        </div>
      )}
    </div>
  );
}
