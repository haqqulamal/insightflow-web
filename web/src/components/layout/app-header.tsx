"use client";

import { Search, Gauge, UserCircle, Menu } from "lucide-react";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-14 border-b border-border flex items-center gap-4 px-4 bg-white">
      <button
        className="md:hidden p-1.5 rounded-md hover:bg-accent"
        onClick={onMenuClick}
        aria-label="Buka menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex-1 max-w-xl hidden sm:flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="size-4" />
        <input
          placeholder="Cari dataset, analisis..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Gauge className="size-4" />
          <span className="hidden sm:inline">Pemakaian</span>
        </div>
        <UserCircle className="size-6 text-slate-ink" />
      </div>
    </header>
  );
}
