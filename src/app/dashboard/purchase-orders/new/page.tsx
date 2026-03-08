import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POCreateForm } from "./po-create-form";

export default async function NewPurchaseOrderPage() {
  await requireAuth();

  const [vendors, departments, fiscalYears, budgetLineItems] = await Promise.all([
    prisma.vendor.findMany({ where: { isActive: true, status: "APPROVED" }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.fiscalYear.findMany({ where: { isLocked: false }, orderBy: { startDate: "desc" } }),
    prisma.budgetLineItem.findMany({
      where: { isActive: true },
      include: { budgetCategory: { include: { department: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Purchase Order</h1>
      <Card>
        <CardHeader><CardTitle>New PO</CardTitle></CardHeader>
        <CardContent>
          <POCreateForm
            vendors={vendors}
            departments={departments}
            fiscalYears={fiscalYears}
            budgetLineItems={budgetLineItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
