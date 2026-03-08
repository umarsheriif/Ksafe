import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  ISSUED: "success",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  CLOSED: "secondary",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

export default async function PurchaseOrdersPage() {
  const user = await requireAuth();

  const isAdmin = ["ADMIN", "FINANCE", "CFO"].includes(user.role);

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      isActive: true,
      ...(isAdmin ? {} : { requesterId: user.id }),
    },
    orderBy: { createdAt: "desc" },
    include: { vendor: true, requester: true, department: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Link href="/dashboard/purchase-orders/new">
          <Button>Create PO</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.vendor.name}</TableCell>
                  <TableCell>{po.department.name}</TableCell>
                  <TableCell>{po.requester.name}</TableCell>
                  <TableCell>{formatCurrency(po.totalAmount.toString(), po.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[po.status] ?? "secondary"}>
                      {po.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(po.createdAt)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/purchase-orders/${po.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {purchaseOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No purchase orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
