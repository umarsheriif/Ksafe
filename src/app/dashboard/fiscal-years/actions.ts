"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const fiscalYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function createFiscalYear(formData: FormData) {
  await requireRole("ADMIN", "FINANCE");

  const data = fiscalYearSchema.parse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  await prisma.fiscalYear.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
  revalidatePath("/dashboard/fiscal-years");
}

export async function setCurrentFiscalYear(id: string) {
  await requireRole("ADMIN", "FINANCE");

  await prisma.$transaction([
    prisma.fiscalYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    }),
    prisma.fiscalYear.update({
      where: { id },
      data: { isCurrent: true },
    }),
  ]);
  revalidatePath("/dashboard/fiscal-years");
}

export async function toggleLockFiscalYear(id: string) {
  await requireRole("ADMIN", "FINANCE");

  const fy = await prisma.fiscalYear.findUnique({ where: { id } });
  if (!fy) throw new Error("Fiscal year not found");

  await prisma.fiscalYear.update({
    where: { id },
    data: { isLocked: !fy.isLocked },
  });
  revalidatePath("/dashboard/fiscal-years");
}
