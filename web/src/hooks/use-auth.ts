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

function bacaUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // data korup
  }
  // Default terautentikasi sebagai pengguna demo jika belum pernah logout
  return DEFAULT_DEMO_USER;
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
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
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
