"use client";

import { useAuth } from "@/hooks/use-auth";
import { User, Shield } from "lucide-react";

export default function PengaturanPage() {
  const { user } = useAuth();

  return (
    <div className="stack-section max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-navy">Pengaturan Akun</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil pengguna, preferensi aplikasi, dan keamanan akun Anda.
        </p>
      </div>

      <div className="card-pad space-y-6 rounded-xl border border-border bg-white shadow-xs">
        {/* Profil */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold text-navy">
            <User className="size-4 text-primary" />
            Informasi Profil
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Nama Pengguna / Bisnis</label>
              <input
                readOnly
                value={user?.nama || "Pengguna Demo"}
                className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-navy outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                readOnly
                value={user?.email || "demo@insightflow.id"}
                className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-navy outline-none"
              />
            </div>
          </div>
        </div>

        {/* Keamanan & Notifikasi */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold text-navy">
            <Shield className="size-4 text-primary" />
            Keamanan & Sesi
          </div>
          <div className="rounded-lg bg-surface p-3 text-xs text-muted-foreground">
            Akun Anda saat ini terhubung dalam <strong className="text-navy">Mode Demo Frontend</strong>. Autentikasi penuh dengan token & RBAC akan aktif begitu API backend tersambung.
          </div>
        </div>
      </div>
    </div>
  );
}
