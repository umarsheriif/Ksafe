"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";
import { generatePONumber } from "@/lib/utils";

const poSchema = z.object({
  description: z.string().optional(),
  currency: z.string().min(1),
  vendorId: z.string().min(1),
  departmentId: z.string().min(1),
  fiscalYearId: z.string().min(1),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.string().min(1),
      unitPrice: z.string().min(1),
      budgetLineItemId: z.string().min(1),
    })
  ).min(1),
});

export async function createPurchaseOrder(data: {
  description?: string;
  currency: string;
  vendorId: string;
  departmentId: string;
  fiscalYearId: string;
  lineItems: { description: string; quantity: string; unitPrice: string; budgetLineItemId: string }[];
}) {
  const user = await requireAuth();

  const parsed = poSchema.parse(data);

  let totalAmount = new Decimal(0);
  const items = parsed.lineItems.map((item) => {
    const qty = new Decimal(item.quantity);
    const price = new Decimal(item.unitPrice);
    const total = qty.mul(price);
    totalAmount = totalAmount.add(total);
    return {
      description: item.description,
      quantity: qty,
      unitPrice: price,
      totalPrice: total,
      budgetLineItemId: item.budgetLineItemId,
    };
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: generatePONumber(),
      description: parsed.description,
      totalAmount,
      currency: parsed.currency as any,
      vendorId: parsed.vendorId,
      departmentId: parsed.departmentId,
      fiscalYearId: parsed.fiscalYearId,
      requesterId: user.id,
      lineItems: { create: items },
    },
  });

  revalidatePath("/dashboard/purchase-orders");
}

export async function submitPO(poId: string) {
  const user = await requireAuth();

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { lineItems: true },
  });

  if (!po || po.requesterId !== user.id || po.status !== "DRAFT") {
    throw new Error("Cannot submit this PO");
  }

  // Find matching approval threshold
  const threshold = await prisma.approvalThreshold.findFirst({
    where: {
      isActive: true,
      minAmount: { lte: po.totalAmount },
      maxAmount: { gte: po.totalAmount },
    },
    include: {
      roles: { orderBy: { stepOrder: "asc" } },
    },
  });

  // Build approval steps based on threshold roles
  const approvalSteps: { stepOrder: number; approverId: string }[] = [];

  if (threshold && threshold.roles.length > 0) {
    for (const role of threshold.roles) {
      const approver = await prisma.user.findFirst({
        where: {
          role: role.role,
          isActive: true,
          departmentId: po.departmentId,
        },
      });

      // If no dept-specific approver, find any with that role
      const finalApprover = approver ?? await prisma.user.findFirst({
        where: { role: role.role, isActive: true },
      });

      if (finalApprover) {
        approvalSteps.push({
          stepOrder: role.stepOrder,
          approverId: finalApprover.id,
        });
      }
    }
  }

  // If no threshold configured, route to department head then finance
  if (approvalSteps.length === 0) {
    const deptHead = await prisma.user.findFirst({
      where: { role: "DEPARTMENT_HEAD", departmentId: po.departmentId, isActive: true },
    });
    if (deptHead) {
      approvalSteps.push({ stepOrder: 1, approverId: deptHead.id });
    }

    const finance = await prisma.user.findFirst({
      where: { role: "FINANCE", isActive: true },
    });
    if (finance) {
      approvalSteps.push({ stepOrder: approvalSteps.length + 1, approverId: finance.id });
    }
  }

  await prisma.$transaction([
    prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: "PENDING_APPROVAL",
        submittedAt: new Date(),
      },
    }),
    ...approvalSteps.map((step) =>
      prisma.approvalStep.create({
        data: {
          purchaseOrderId: poId,
          ...step,
        },
      })
    ),
  ]);

  revalidatePath("/dashboard/purchase-orders");
}

export async function approveStep(stepId: string, comment?: string) {
  const user = await requireAuth();

  const step = await prisma.approvalStep.findUnique({
    where: { id: stepId },
    include: {
      purchaseOrder: {
        include: { approvalSteps: { orderBy: { stepOrder: "asc" } } },
      },
    },
  });

  if (!step || step.approverId !== user.id || step.action !== null) {
    throw new Error("Cannot approve this step");
  }

  const allSteps = step.purchaseOrder.approvalSteps;
  const currentStepIndex = allSteps.findIndex((s) => s.id === stepId);

  // Check that previous steps are approved
  for (let i = 0; i < currentStepIndex; i++) {
    if (allSteps[i].action !== "APPROVED") {
      throw new Error("Previous steps not yet approved");
    }
  }

  const isLastStep = currentStepIndex === allSteps.length - 1;

  await prisma.$transaction([
    prisma.approvalStep.update({
      where: { id: stepId },
      data: { action: "APPROVED", comment, actedAt: new Date() },
    }),
    ...(isLastStep
      ? [
          prisma.purchaseOrder.update({
            where: { id: step.purchaseOrderId },
            data: { status: "APPROVED", approvedAt: new Date() },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/purchase-orders");
}

export async function rejectStep(stepId: string, comment: string) {
  const user = await requireAuth();

  const step = await prisma.approvalStep.findUnique({
    where: { id: stepId },
  });

  if (!step || step.approverId !== user.id || step.action !== null) {
    throw new Error("Cannot reject this step");
  }

  await prisma.$transaction([
    prisma.approvalStep.update({
      where: { id: stepId },
      data: { action: "REJECTED", comment, actedAt: new Date() },
    }),
    prisma.purchaseOrder.update({
      where: { id: step.purchaseOrderId },
      data: { status: "REJECTED", rejectionNote: comment },
    }),
  ]);

  revalidatePath("/dashboard/purchase-orders");
}

export async function issuePO(poId: string) {
  await requireRole("ADMIN", "FINANCE");

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status: "ISSUED", issuedAt: new Date() },
  });
  revalidatePath("/dashboard/purchase-orders");
}

export async function cancelPO(poId: string) {
  const user = await requireAuth();

  const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
  if (!po) throw new Error("PO not found");

  const canCancel =
    user.role === "ADMIN" ||
    (po.requesterId === user.id && ["DRAFT", "PENDING_APPROVAL"].includes(po.status));

  if (!canCancel) throw new Error("Cannot cancel this PO");

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/dashboard/purchase-orders");
}
