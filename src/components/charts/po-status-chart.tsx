"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface POStatusData {
  name: string;
  value: number;
}

const COLORS = ["#6b7280", "#eab308", "#22c55e", "#3b82f6", "#f97316", "#10b981", "#94a3b8", "#ef4444", "#dc2626"];

export function POStatusChart({ data }: { data: POStatusData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No PO data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => `${props.name ?? ""} (${((props.percent ?? 0) * 100).toFixed(0)}%)`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
