import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { BudgetLineItemForm } from "./budget-line-item-form";

export default async function BudgetLineItemsPage() {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const [lineItems, categories] = await Promise.all([
    prisma.budgetLineItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { budgetCategory: { include: { department: true, fiscalYear: true } } },
    }),
    prisma.budgetCategory.findMany({
      where: { isActive: true },
      include: { department: true, fiscalYear: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budget Line Items</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Add Line Item</CardTitle></CardHeader>
            <CardContent>
              <BudgetLineItemForm categories={categories} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Line Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => {
                    const remaining = Number(item.allocatedAmount) - Number(item.spentAmount);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.budgetCategory.name}</TableCell>
                        <TableCell>{item.budgetCategory.department.name}</TableCell>
                        <TableCell>{formatCurrency(item.allocatedAmount.toString(), item.currency)}</TableCell>
                        <TableCell>{formatCurrency(item.spentAmount.toString(), item.currency)}</TableCell>
                        <TableCell>{formatCurrency(remaining.toString(), item.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "success" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {lineItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">No line items yet</TableCell>
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
