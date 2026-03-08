"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SpendingTrendData {
  month: string;
  amount: number;
}

export function SpendingTrendChart({ data }: { data: SpendingTrendData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No spending data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#1e40af" strokeWidth={2} name="Spending" />
      </LineChart>
    </ResponsiveContainer>
  );
}
