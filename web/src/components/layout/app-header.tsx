import { Search, Gauge, UserCircle } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-14 border-b border-border flex items-center gap-4 px-4 bg-white">
      <div className="flex-1 max-w-md flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="size-4" />
        <input
          placeholder="Cari dataset, analisis..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Gauge className="size-4" />
        Pemakaian
      </div>
      <UserCircle className="size-6 text-slate-ink" />
    </header>
  );
}
