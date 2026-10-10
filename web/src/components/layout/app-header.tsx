"use client";

import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Gauge, LogOut, Menu, Search, UserCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppHeader({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

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

        {isLoggedIn ? (
          <Popover>
            <PopoverTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40">
              <UserCircle className="size-6 text-slate-ink" />
              <span className="hidden text-xs font-medium text-navy sm:inline">
                {user?.nama}
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-3 space-y-3">
              <div className="border-b border-border pb-2">
                <p className="text-xs font-medium text-navy">{user?.nama}</p>
                <p className="text-[11px] truncate text-muted-foreground">{user?.email}</p>
                {user?.isDemo && (
                  <span className="mt-1 inline-block rounded-full bg-info/10 px-2 py-0.5 text-[10px] text-info font-medium">
                    Mode Demo Frontend
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/masuk");
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-3.5" />
                Keluar
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            href="/masuk"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
          >
            <LogIn className="size-3.5" />
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
