"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allocatedAmount: z.string().min(1),
  currency: z.string().min(1),
  budgetCategoryId: z.string().min(1),
});

export async function createBudgetLineItem(formData: FormData) {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const data = schema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    allocatedAmount: formData.get("allocatedAmount"),
    currency: formData.get("currency"),
    budgetCategoryId: formData.get("budgetCategoryId"),
  });

  const amount = new Decimal(data.allocatedAmount);

  await prisma.$transaction(async (tx) => {
    await tx.budgetLineItem.create({
      data: {
        name: data.name,
        description: data.description,
        allocatedAmount: amount,
        currency: data.currency as any,
        budgetCategoryId: data.budgetCategoryId,
      },
    });

    await tx.budgetCategory.update({
      where: { id: data.budgetCategoryId },
      data: { allocatedAmount: { increment: amount } },
    });
  });

  revalidatePath("/dashboard/budget-line-items");
}
