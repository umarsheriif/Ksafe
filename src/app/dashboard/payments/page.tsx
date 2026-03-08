import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentForm } from "./payment-form";

export default async function PaymentsPage() {
  await requireRole("ADMIN", "FINANCE");

  const [payments, payableOrders] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        purchaseOrder: true,
        recordedBy: true,
      },
    }),
    prisma.purchaseOrder.findMany({
      where: {
        status: { in: ["ISSUED", "PARTIALLY_PAID", "APPROVED"] },
        isActive: true,
      },
      orderBy: { poNumber: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
            <CardContent>
              <PaymentForm purchaseOrders={payableOrders} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.paidAt)}</TableCell>
                      <TableCell className="font-mono">{p.purchaseOrder.poNumber}</TableCell>
                      <TableCell>{formatCurrency(p.amount.toString(), p.currency)}</TableCell>
                      <TableCell>{p.reference ?? "-"}</TableCell>
                      <TableCell>{p.recordedBy.name}</TableCell>
                      <TableCell>{p.notes ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No payments yet</TableCell>
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
