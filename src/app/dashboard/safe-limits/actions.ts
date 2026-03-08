"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const schema = z.object({
  limitAmount: z.string().min(1),
  currency: z.string().min(1),
  ownerId: z.string().min(1),
  departmentId: z.string().min(1),
  budgetCategoryId: z.string().min(1),
  fiscalYearId: z.string().min(1),
});

export async function createSafeLimit(formData: FormData) {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const data = schema.parse({
    limitAmount: formData.get("limitAmount"),
    currency: formData.get("currency"),
    ownerId: formData.get("ownerId"),
    departmentId: formData.get("departmentId"),
    budgetCategoryId: formData.get("budgetCategoryId"),
    fiscalYearId: formData.get("fiscalYearId"),
  });

  await prisma.safeLimit.create({
    data: {
      limitAmount: new Decimal(data.limitAmount),
      currency: data.currency as any,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
      budgetCategoryId: data.budgetCategoryId,
      fiscalYearId: data.fiscalYearId,
    },
  });
  revalidatePath("/dashboard/safe-limits");
}
