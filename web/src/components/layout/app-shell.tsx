"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar: drawer dari tab "Lainnya" di mobile, permanen sejak md */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-[transform,visibility] duration-300 md:visible md:static md:z-40 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay drawer mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface p-[var(--space-page)] pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+var(--space-page))] lg:pb-[var(--space-page)]">
          {children}
        </main>
      </div>

      <MobileTabBar onMore={() => setSidebarOpen(true)} />
    </div>
  );
}
