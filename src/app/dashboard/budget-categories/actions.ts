"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const schema = z.object({
  name: z.string().min(1),
  glCode: z.string().optional(),
  totalBudget: z.string().min(1),
  currency: z.string().min(1),
  departmentId: z.string().min(1),
  fiscalYearId: z.string().min(1),
});

export async function createBudgetCategory(formData: FormData) {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const data = schema.parse({
    name: formData.get("name"),
    glCode: formData.get("glCode") || undefined,
    totalBudget: formData.get("totalBudget"),
    currency: formData.get("currency"),
    departmentId: formData.get("departmentId"),
    fiscalYearId: formData.get("fiscalYearId"),
  });

  await prisma.budgetCategory.create({
    data: {
      name: data.name,
      glCode: data.glCode,
      totalBudget: new Decimal(data.totalBudget),
      currency: data.currency as any,
      departmentId: data.departmentId,
      fiscalYearId: data.fiscalYearId,
    },
  });
  revalidatePath("/dashboard/budget-categories");
}

export async function toggleBudgetCategory(id: string) {
  await requireRole("ADMIN", "FINANCE", "CFO");

  const cat = await prisma.budgetCategory.findUnique({ where: { id } });
  if (!cat) throw new Error("Not found");

  await prisma.budgetCategory.update({
    where: { id },
    data: { isActive: !cat.isActive },
  });
  revalidatePath("/dashboard/budget-categories");
}
