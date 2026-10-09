"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutDashboard, Menu, Sparkles } from "lucide-react";

const TABS = [
  { href: "/app", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/app/analis", label: "Analis", icon: Sparkles },
  { href: "/app/dataset", label: "Dataset", icon: Database },
];

function Tab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[var(--tabbar-h)] flex-col items-center justify-center gap-1 text-[11px] ${
        active ? "font-medium text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

/** Tab bar bawah — hanya mobile/tablet (< lg). */
export function MobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-4">
        {TABS.map((t) => (
          <Tab
            key={t.href}
            {...t}
            active={pathname === t.href || pathname.startsWith(`${t.href}/`)}
          />
        ))}
        <button
          type="button"
          onClick={onMore}
          className="flex min-h-[var(--tabbar-h)] flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
        >
          <Menu className="size-5" />
          Lainnya
        </button>
      </div>
    </nav>
  );
}
