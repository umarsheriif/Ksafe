import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userRole={(session.user as any).role ?? "REQUESTER"}
        userName={session.user.name ?? "User"}
      />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {children}
      </main>
    </div>
  );
}
