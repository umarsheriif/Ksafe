import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { SafeLimitForm } from "./safe-limit-form";

export default async function SafeLimitsPage() {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const [safeLimits, users, departments, categories, fiscalYears] = await Promise.all([
    prisma.safeLimit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: true,
        department: true,
        budgetCategory: true,
        fiscalYear: true,
      },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: { in: ["DEPARTMENT_HEAD", "TEAM_HEAD"] } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.budgetCategory.findMany({ where: { isActive: true }, include: { department: true }, orderBy: { name: "asc" } }),
    prisma.fiscalYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Safe Limits</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Assign Safe Limit</CardTitle></CardHeader>
            <CardContent>
              <SafeLimitForm
                users={users}
                departments={departments}
                categories={categories}
                fiscalYears={fiscalYears}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Safe Limits</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeLimits.map((sl) => {
                    const available = Number(sl.limitAmount) - Number(sl.usedAmount);
                    return (
                      <TableRow key={sl.id}>
                        <TableCell className="font-medium">{sl.owner.name}</TableCell>
                        <TableCell>{sl.department.name}</TableCell>
                        <TableCell>{sl.budgetCategory.name}</TableCell>
                        <TableCell>{sl.fiscalYear.name}</TableCell>
                        <TableCell>{formatCurrency(sl.limitAmount.toString(), sl.currency)}</TableCell>
                        <TableCell>{formatCurrency(sl.usedAmount.toString(), sl.currency)}</TableCell>
                        <TableCell>{formatCurrency(available.toString(), sl.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={sl.isActive ? "success" : "secondary"}>
                            {sl.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {safeLimits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">No safe limits yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
