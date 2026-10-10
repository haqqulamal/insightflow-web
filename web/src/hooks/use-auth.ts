"use client";

import { useSyncExternalStore } from "react";

const AUTH_KEY = "insightflow-user-demo";

export type AuthUser = {
  nama: string;
  email: string;
  isDemo: boolean;
};

const DEFAULT_DEMO_USER: AuthUser = {
  nama: "Pengguna Demo",
  email: "demo@insightflow.id",
  isDemo: true,
};

// Caching untuk getSnapshot useSyncExternalStore
let cachedRaw: string | null | undefined = undefined;
let cachedUser: AuthUser | null = null;

function bacaUser(): AuthUser | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) : null;

    // Jika string raw di localStorage tidak berubah, kembalikan objek referensi yang sama
    if (raw === cachedRaw && cachedUser !== null) {
      return cachedUser;
    }

    cachedRaw = raw;
    if (raw) {
      cachedUser = JSON.parse(raw);
      return cachedUser;
    }
  } catch {
    // data korup
  }

  cachedUser = DEFAULT_DEMO_USER;
  return cachedUser;
}

function tulisUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
  notify();
}

const listeners = new Set<() => void>();

function notify() {
  // Reset cache saat ada mutasi lokal agar getSnapshot membaca ulang
  cachedRaw = undefined;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const handleStorage = () => {
    cachedRaw = undefined;
    cb();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", handleStorage);
  };
}

/** Hook status autentikasi pengguna (mock demo tersimpan di localStorage). */
export function useAuth() {
  const user = useSyncExternalStore(subscribe, bacaUser, () => null);

  return {
    user,
    isLoggedIn: !!user,
    login(email: string) {
      const nama = email.split("@")[0] || "Pengguna Demo";
      tulisUser({ nama, email, isDemo: true });
    },
    register(nama: string, email: string) {
      tulisUser({ nama: nama || "Pengguna Baru", email, isDemo: true });
    },
    logout() {
      tulisUser(null);
    },
  };
}
