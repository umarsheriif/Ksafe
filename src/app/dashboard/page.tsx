import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [
    totalBudget,
    poCount,
    vendorCount,
    pendingApprovals,
  ] = await Promise.all([
    prisma.budgetCategory.aggregate({
      _sum: { totalBudget: true },
      where: {
        fiscalYear: { isCurrent: true },
        isActive: true,
      },
    }),
    prisma.purchaseOrder.count({
      where: { isActive: true },
    }),
    prisma.vendor.count({
      where: { isActive: true, status: "APPROVED" },
    }),
    prisma.purchaseOrder.count({
      where: {
        status: "PENDING_APPROVAL",
        isActive: true,
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget._sum.totalBudget?.toString() ?? "0"),
      icon: Wallet,
      description: "Current fiscal year",
    },
    {
      title: "Purchase Orders",
      value: poCount.toString(),
      icon: FileText,
      description: "All POs",
    },
    {
      title: "Active Vendors",
      value: vendorCount.toString(),
      icon: Users,
      description: "Approved vendors",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.toString(),
      icon: DollarSign,
      description: "Awaiting action",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentPOs />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function RecentPOs() {
  const pos = await prisma.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { vendor: true, requester: true },
    where: { isActive: true },
  });

  if (pos.length === 0) {
    return <p className="text-sm text-muted-foreground">No purchase orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {pos.map((po) => (
        <div key={po.id} className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">{po.poNumber}</p>
            <p className="text-muted-foreground">{po.vendor.name}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(po.totalAmount.toString(), po.currency)}</p>
            <p className="text-muted-foreground capitalize">{po.status.toLowerCase().replace("_", " ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function BudgetOverview() {
  const categories = await prisma.budgetCategory.findMany({
    where: {
      fiscalYear: { isCurrent: true },
      isActive: true,
    },
    include: { department: true },
    take: 5,
  });

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No budget categories defined yet.</p>;
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const total = Number(cat.totalBudget);
        const allocated = Number(cat.allocatedAmount);
        const pct = total > 0 ? (allocated / total) * 100 : 0;
        return (
          <div key={cat.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{cat.name}</span>
              <span className="text-muted-foreground">{pct.toFixed(0)}% allocated</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
