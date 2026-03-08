import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetChart } from "@/components/charts/budget-chart";
import { POStatusChart } from "@/components/charts/po-status-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";

export default async function ReportsPage() {
  await requireAuth();

  const [budgetCategories, poStatusCounts, payments] = await Promise.all([
    prisma.budgetCategory.findMany({
      where: { fiscalYear: { isCurrent: true }, isActive: true },
      include: {
        lineItems: true,
        department: true,
      },
    }),
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      _count: true,
      where: { isActive: true },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "asc" },
      select: { amount: true, paidAt: true },
    }),
  ]);

  const budgetData = budgetCategories.map((cat) => {
    const spent = cat.lineItems.reduce((sum, li) => sum + Number(li.spentAmount), 0);
    return {
      name: `${cat.name} (${cat.department.name})`,
      totalBudget: Number(cat.totalBudget),
      allocated: Number(cat.allocatedAmount),
      spent,
    };
  });

  const poStatusData = poStatusCounts.map((s) => ({
    name: s.status.replace("_", " "),
    value: s._count,
  }));

  // Group payments by month
  const monthlySpending = new Map<string, number>();
  for (const p of payments) {
    const month = new Date(p.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    monthlySpending.set(month, (monthlySpending.get(month) ?? 0) + Number(p.amount));
  }
  const spendingData = Array.from(monthlySpending.entries()).map(([month, amount]) => ({
    month,
    amount,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
          <CardContent>
            <BudgetChart data={budgetData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>PO Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <POStatusChart data={poStatusData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Spending Trend</CardTitle></CardHeader>
        <CardContent>
          <SpendingTrendChart data={spendingData} />
        </CardContent>
      </Card>
    </div>
  );
}
