"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const paymentSchema = z.object({
  amount: z.string().min(1),
  currency: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
  purchaseOrderId: z.string().min(1),
});

export async function recordPayment(formData: FormData) {
  const user = await requireRole("ADMIN", "FINANCE");

  const data = paymentSchema.parse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
    purchaseOrderId: formData.get("purchaseOrderId"),
  });

  const amount = new Decimal(data.amount);

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: data.purchaseOrderId },
    include: { lineItems: { include: { budgetLineItem: true } } },
  });

  if (!po) throw new Error("PO not found");
  if (!["ISSUED", "PARTIALLY_PAID", "APPROVED"].includes(po.status)) {
    throw new Error("PO is not in a payable status");
  }

  const newPaidAmount = new Decimal(po.paidAmount.toString()).add(amount);
  const totalAmount = new Decimal(po.totalAmount.toString());

  if (newPaidAmount.gt(totalAmount)) {
    throw new Error("Payment would exceed PO total amount");
  }

  const newStatus = newPaidAmount.eq(totalAmount) ? "PAID" : "PARTIALLY_PAID";

  // Deduct from budget line items proportionally
  const lineItemTotal = po.lineItems.reduce(
    (sum, li) => sum.add(new Decimal(li.totalPrice.toString())),
    new Decimal(0)
  );

  await prisma.$transaction(async (tx) => {
    // Create payment
    await tx.payment.create({
      data: {
        amount,
        currency: data.currency as any,
        reference: data.reference,
        notes: data.notes,
        purchaseOrderId: data.purchaseOrderId,
        recordedById: user.id,
      },
    });

    // Update PO
    await tx.purchaseOrder.update({
      where: { id: data.purchaseOrderId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus as any,
        ...(newStatus === "PAID" ? { closedAt: new Date() } : {}),
      },
    });

    // Deduct from budget line items proportionally
    for (const lineItem of po.lineItems) {
      const proportion = new Decimal(lineItem.totalPrice.toString()).div(lineItemTotal);
      const deduction = amount.mul(proportion);

      await tx.budgetLineItem.update({
        where: { id: lineItem.budgetLineItemId },
        data: {
          spentAmount: { increment: deduction },
        },
      });
    }
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/purchase-orders");
}
