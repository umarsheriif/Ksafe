"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BudgetChartData {
  name: string;
  totalBudget: number;
  allocated: number;
  spent: number;
}

export function BudgetChart({ data }: { data: BudgetChartData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No budget data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalBudget" fill="#1e40af" name="Total Budget" />
        <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
        <Bar dataKey="spent" fill="#ef4444" name="Spent" />
      </BarChart>
    </ResponsiveContainer>
  );
}
