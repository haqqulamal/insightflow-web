"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  LineChart,
  Database,
  Sigma,
  Bookmark,
  FileBarChart,
  Plug,
  Settings,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string; // mis. "Segera" untuk item T2/Later
};

const navItems: NavItem[] = [
  { href: "/app", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/app/analis", label: "AI Analyst", icon: Sparkles },
  { href: "/app/forecast", label: "Forecast", icon: LineChart, badge: "Segera" },
  { href: "/app/dataset", label: "Dataset", icon: Database },
  { href: "/app/metrik", label: "Metrik", icon: Sigma },
  { href: "/app/tersimpan", label: "Tersimpan", icon: Bookmark },
  { href: "/app/laporan", label: "Laporan", icon: FileBarChart, badge: "Segera" },
  { href: "/app/koneksi", label: "Koneksi", icon: Plug, badge: "Segera" },
  { href: "/app/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-14 flex items-center px-4 font-semibold text-navy">
        InsightFlow AI
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-ink hover:bg-accent"
              }`}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] rounded-full border border-border px-1.5 py-0.5 text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
