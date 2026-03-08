import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BudgetCategoryForm } from "./budget-category-form";
import { toggleBudgetCategory } from "./actions";

export default async function BudgetCategoriesPage() {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const [categories, departments, fiscalYears] = await Promise.all([
    prisma.budgetCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: { department: true, fiscalYear: true },
    }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.fiscalYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budget Categories</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
            <CardContent>
              <BudgetCategoryForm departments={departments} fiscalYears={fiscalYears} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>GL Code</TableHead>
                    <TableHead>Total Budget</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.department.name}</TableCell>
                      <TableCell>{cat.fiscalYear.name}</TableCell>
                      <TableCell className="font-mono">{cat.glCode ?? "-"}</TableCell>
                      <TableCell>{formatCurrency(cat.totalBudget.toString(), cat.currency)}</TableCell>
                      <TableCell>{formatCurrency(cat.allocatedAmount.toString(), cat.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={cat.isActive ? "success" : "secondary"}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <form action={toggleBudgetCategory.bind(null, cat.id)}>
                          <Button variant="ghost" size="sm" type="submit">
                            {cat.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">No categories yet</TableCell>
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
