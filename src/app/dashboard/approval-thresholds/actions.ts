"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const schema = z.object({
  name: z.string().min(1),
  minAmount: z.string().min(1),
  maxAmount: z.string().min(1),
  currency: z.string().min(1),
  roles: z.array(z.object({
    role: z.string().min(1),
    stepOrder: z.number().min(1),
  })).min(1),
});

export async function createApprovalThreshold(data: {
  name: string;
  minAmount: string;
  maxAmount: string;
  currency: string;
  roles: { role: string; stepOrder: number }[];
}) {
  await requireRole("ADMIN");

  const parsed = schema.parse(data);

  await prisma.approvalThreshold.create({
    data: {
      name: parsed.name,
      minAmount: new Decimal(parsed.minAmount),
      maxAmount: new Decimal(parsed.maxAmount),
      currency: parsed.currency as any,
      roles: {
        create: parsed.roles.map((r) => ({
          role: r.role as any,
          stepOrder: r.stepOrder,
        })),
      },
    },
  });
  revalidatePath("/dashboard/approval-thresholds");
}

export async function toggleThreshold(id: string) {
  await requireRole("ADMIN");

  const t = await prisma.approvalThreshold.findUnique({ where: { id } });
  if (!t) throw new Error("Not found");

  await prisma.approvalThreshold.update({
    where: { id },
    data: { isActive: !t.isActive },
  });
  revalidatePath("/dashboard/approval-thresholds");
}
