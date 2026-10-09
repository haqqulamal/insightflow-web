"use client";

import { Gauge, Menu, Search, UserCircle } from "lucide-react";

export function AppHeader({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="flex h-[var(--app-bar-h)] items-center gap-3 border-b border-border bg-white px-4">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Buka menu navigasi"
        className="-ml-2 rounded-md p-2 text-navy hover:bg-accent md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <span className="font-semibold text-navy md:hidden">InsightFlow AI</span>

      <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground sm:flex">
        <Search className="size-4" />
        <input
          placeholder="Cari dataset, analisis..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent sm:flex"
        >
          <Gauge className="size-4" />
          Pemakaian
        </button>
        <button
          type="button"
          aria-label="Profil pengguna"
          className="rounded-full p-1 hover:bg-accent"
        >
          <UserCircle className="size-6 text-slate-ink" />
        </button>
      </div>
    </header>
  );
}