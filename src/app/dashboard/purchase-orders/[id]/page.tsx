import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { submitPO, issuePO, cancelPO } from "../actions";
import { ApprovalActions } from "./approval-actions";
import { ExportPOButton } from "@/components/export-po-button";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      requester: true,
      department: true,
      fiscalYear: true,
      lineItems: { include: { budgetLineItem: true } },
      approvalSteps: {
        orderBy: { stepOrder: "asc" },
        include: { approver: true },
      },
      payments: { include: { recordedBy: true }, orderBy: { paidAt: "desc" } },
    },
  });

  if (!po) notFound();

  const isOwner = po.requesterId === user.id;
  const isFinance = ["ADMIN", "FINANCE"].includes(user.role);
  const canSubmit = isOwner && po.status === "DRAFT";
  const canIssue = isFinance && po.status === "APPROVED";
  const canCancel = (isOwner && ["DRAFT", "PENDING_APPROVAL"].includes(po.status)) || user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{po.poNumber}</h1>
          <p className="text-muted-foreground">{po.description}</p>
        </div>
        <Badge
          variant={
            ["APPROVED", "ISSUED", "PAID"].includes(po.status)
              ? "success"
              : ["REJECTED", "CANCELLED"].includes(po.status)
              ? "destructive"
              : "warning"
          }
          className="text-base px-3 py-1"
        >
          {po.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Vendor</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{po.vendor.name}</p>
            <p className="text-sm text-muted-foreground">{po.vendor.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Department</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{po.department.name}</p>
            <p className="text-sm text-muted-foreground">FY: {po.fiscalYear.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Amount</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(po.totalAmount.toString(), po.currency)}</p>
            <p className="text-sm text-muted-foreground">
              Paid: {formatCurrency(po.paidAmount.toString(), po.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canSubmit && (
          <form action={submitPO.bind(null, po.id)}>
            <Button type="submit">Submit for Approval</Button>
          </form>
        )}
        {canIssue && (
          <form action={issuePO.bind(null, po.id)}>
            <Button type="submit">Issue PO</Button>
          </form>
        )}
        {canCancel && (
          <form action={cancelPO.bind(null, po.id)}>
            <Button type="submit" variant="destructive">Cancel PO</Button>
          </form>
        )}
        <ExportPOButton
          data={{
            poNumber: po.poNumber,
            description: po.description,
            status: po.status,
            totalAmount: po.totalAmount.toString(),
            currency: po.currency,
            createdAt: formatDate(po.createdAt),
            vendor: { name: po.vendor.name, email: po.vendor.email },
            department: { name: po.department.name },
            requester: { name: po.requester.name },
            lineItems: po.lineItems.map((li) => ({
              description: li.description,
              quantity: li.quantity.toString(),
              unitPrice: li.unitPrice.toString(),
              totalPrice: li.totalPrice.toString(),
            })),
          }}
        />
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Budget Line</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.budgetLineItem.name}</TableCell>
                  <TableCell>{item.quantity.toString()}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice.toString(), po.currency)}</TableCell>
                  <TableCell>{formatCurrency(item.totalPrice.toString(), po.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Steps */}
      {po.approvalSteps.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Approval Workflow</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {po.approvalSteps.map((step) => {
                const isCurrentApprover = step.approverId === user.id && step.action === null;
                return (
                  <div key={step.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Step {step.stepOrder}: {step.approver.name}</p>
                      {step.comment && (
                        <p className="text-sm text-muted-foreground">{step.comment}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {step.action ? (
                        <Badge variant={step.action === "APPROVED" ? "success" : "destructive"}>
                          {step.action} {step.actedAt && `on ${formatDate(step.actedAt)}`}
                        </Badge>
                      ) : isCurrentApprover && po.status === "PENDING_APPROVAL" ? (
                        <ApprovalActions stepId={step.id} />
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {po.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount.toString(), payment.currency)}</TableCell>
                    <TableCell>{payment.reference ?? "-"}</TableCell>
                    <TableCell>{payment.recordedBy.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
