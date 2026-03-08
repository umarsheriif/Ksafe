"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Wallet,
  CreditCard,
  Shield,
  Users,
  FileText,
  DollarSign,
  ArrowLeftRight,
  Bell,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  userRole: string;
  userName: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ALL"] },
  { href: "/dashboard/departments", label: "Departments", icon: Building2, roles: ["ADMIN"] },
  { href: "/dashboard/fiscal-years", label: "Fiscal Years", icon: Calendar, roles: ["ADMIN", "FINANCE"] },
  { href: "/dashboard/budget-categories", label: "Budget Categories", icon: Wallet, roles: ["ADMIN", "FINANCE", "CFO"] },
  { href: "/dashboard/budget-line-items", label: "Budget Line Items", icon: CreditCard, roles: ["ADMIN", "FINANCE", "CFO"] },
  { href: "/dashboard/safe-limits", label: "Safe Limits", icon: Shield, roles: ["ADMIN", "FINANCE", "CFO"] },
  { href: "/dashboard/vendors", label: "Vendors", icon: Users, roles: ["ALL"] },
  { href: "/dashboard/purchase-orders", label: "Purchase Orders", icon: FileText, roles: ["ALL"] },
  { href: "/dashboard/payments", label: "Payments", icon: DollarSign, roles: ["ADMIN", "FINANCE"] },
  { href: "/dashboard/exchange-rates", label: "Exchange Rates", icon: ArrowLeftRight, roles: ["ADMIN", "FINANCE"] },
  { href: "/dashboard/approval-thresholds", label: "Approval Thresholds", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, roles: ["ALL"] },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, roles: ["ALL"] },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: ClipboardList, roles: ["ADMIN", "FINANCE"] },
];

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => item.roles.includes("ALL") || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-white">
            KSafe
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-700 text-slate-400"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[var(--sidebar-active)] text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        {!collapsed && (
          <div className="mb-2 text-sm text-slate-400 truncate">{userName}</div>
        )}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
