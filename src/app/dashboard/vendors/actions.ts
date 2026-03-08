"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vendorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankRoutingNo: z.string().optional(),
  bankSwiftCode: z.string().optional(),
  currency: z.string().min(1),
});

export async function createVendor(formData: FormData) {
  await requireAuth();

  const data = vendorSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    taxId: formData.get("taxId") || undefined,
    bankName: formData.get("bankName") || undefined,
    bankAccountNo: formData.get("bankAccountNo") || undefined,
    bankRoutingNo: formData.get("bankRoutingNo") || undefined,
    bankSwiftCode: formData.get("bankSwiftCode") || undefined,
    currency: formData.get("currency"),
  });

  await prisma.vendor.create({
    data: {
      ...data,
      currency: data.currency as any,
    },
  });
  revalidatePath("/dashboard/vendors");
}

export async function approveVendor(id: string) {
  await requireRole("ADMIN", "FINANCE");

  await prisma.vendor.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidatePath("/dashboard/vendors");
}

export async function rejectVendor(id: string) {
  await requireRole("ADMIN", "FINANCE");

  await prisma.vendor.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/dashboard/vendors");
}
