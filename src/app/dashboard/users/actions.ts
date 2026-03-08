"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
});

export async function createUser(formData: FormData) {
  await requireRole("ADMIN");

  const data = userSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId") || undefined,
    managerId: formData.get("managerId") || undefined,
  });

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashedPassword,
      role: data.role as any,
      departmentId: data.departmentId || null,
      managerId: data.managerId || null,
    },
  });
  revalidatePath("/dashboard/users");
}

export async function toggleUserActive(id: string) {
  await requireRole("ADMIN");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/dashboard/users");
}
