import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export function canManageBudgets(role: UserRole): boolean {
  return ["ADMIN", "FINANCE", "CFO"].includes(role);
}

export function canApproveVendors(role: UserRole): boolean {
  return ["ADMIN", "FINANCE"].includes(role);
}

export function canApprovePOs(role: UserRole): boolean {
  return ["ADMIN", "FINANCE", "CFO", "DEPARTMENT_HEAD"].includes(role);
}

export function canRecordPayments(role: UserRole): boolean {
  return ["ADMIN", "FINANCE"].includes(role);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}
