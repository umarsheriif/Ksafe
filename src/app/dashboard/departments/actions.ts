"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const departmentSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
});

export async function createDepartment(formData: FormData) {
  await requireRole("ADMIN");

  const data = departmentSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
  });

  await prisma.department.create({ data });
  revalidatePath("/dashboard/departments");
}

export async function updateDepartment(id: string, formData: FormData) {
  await requireRole("ADMIN");

  const data = departmentSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
  });

  await prisma.department.update({ where: { id }, data });
  revalidatePath("/dashboard/departments");
}

export async function toggleDepartment(id: string) {
  await requireRole("ADMIN");

  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new Error("Department not found");

  await prisma.department.update({
    where: { id },
    data: { isActive: !dept.isActive },
  });
  revalidatePath("/dashboard/departments");
}
