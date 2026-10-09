"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Database,
  FileBarChart,
  LayoutDashboard,
  LineChart,
  Plug,
  Settings,
  Sigma,
  Sparkles,
  X,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string; // mis. "Segera" untuk item T2/Later
};

type NavGroup = { judul: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    judul: "Utama",
    items: [
      { href: "/app", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/app/analis", label: "AI Analyst", icon: Sparkles },
      { href: "/app/forecast", label: "Forecast", icon: LineChart, badge: "Segera" },
    ],
  },
  {
    judul: "Data",
    items: [
      { href: "/app/dataset", label: "Dataset", icon: Database },
      { href: "/app/metrik", label: "Metrik", icon: Sigma },
      { href: "/app/tersimpan", label: "Tersimpan", icon: Bookmark },
    ],
  },
  {
    judul: "Kelola",
    items: [
      { href: "/app/laporan", label: "Laporan", icon: FileBarChart, badge: "Segera" },
      { href: "/app/koneksi", label: "Koneksi", icon: Plug, badge: "Segera" },
      { href: "/app/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface md:w-16 lg:w-64">
      <div className="flex h-[var(--app-bar-h)] items-center justify-between gap-2 px-4 font-semibold text-navy md:justify-center lg:justify-start">
        <span className="md:hidden lg:inline">InsightFlow AI</span>
        <span className="hidden md:inline lg:hidden">IF</span>
        <button
          type="button"
          aria-label="Tutup menu"
          className="rounded-md p-2 text-slate-ink hover:bg-accent md:hidden"
          onClick={onNavigate}
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((grup) => (
          <div key={grup.judul} className="space-y-1">
            <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:hidden lg:block">
              {grup.judul}
            </p>
            {grup.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  onClick={onNavigate}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm md:justify-center lg:justify-start ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-slate-ink hover:bg-accent"
                  }`}
                >
                  <Icon className="size-5 shrink-0 md:size-5" />
                  <span className="flex-1 md:hidden lg:inline">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:hidden lg:inline">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && (
                    <span className="hidden size-1.5 rounded-full bg-muted-foreground/50 md:inline lg:hidden" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
