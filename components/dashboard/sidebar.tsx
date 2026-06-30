"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  role: string;
  userName: string;
  items: SidebarItem[];
}

export function DashboardSidebar({ role, userName, items }: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-rule bg-white flex flex-col h-screen sticky top-0">
      <div className="px-5 h-16 flex items-center border-b border-rule">
        <Link href="/" aria-label="Inicio">
          <Logo className="text-xl" />
        </Link>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-wider text-muted">{role}</p>
        <p className="text-sm text-ink font-medium truncate">{userName}</p>
      </div>

      <nav className="px-3 flex-1 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors",
                active
                  ? "bg-navy-50 text-navy font-medium"
                  : "text-muted hover:bg-paper hover:text-ink"
              )}
            >
              <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-rule">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm text-muted hover:bg-paper hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          <span>Salir</span>
        </Link>
      </div>
    </aside>
  );
}
