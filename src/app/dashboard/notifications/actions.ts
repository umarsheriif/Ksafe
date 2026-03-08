"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function markAsRead(id: string) {
  await requireAuth();

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
}

export async function markAllAsRead() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
}
