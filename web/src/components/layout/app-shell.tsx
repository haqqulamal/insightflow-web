"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: drawer di mobile, ikon di tablet, penuh di desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-[transform,visibility] duration-300 md:visible md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay saat drawer mobile terbuka */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-surface">{children}</main>
      </div>
    </div>
  );
}
