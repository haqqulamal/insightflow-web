"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email);
      setLoading(false);
      router.push("/app");
    }, 600);
  }

  function handleGoogleLogin() {
    setLoading(true);
    setTimeout(() => {
      login("demo.google@insightflow.id");
      setLoading(false);
      router.push("/app");
    }, 600);
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 font-semibold text-navy text-2xl">
            <Sparkles className="size-6 text-primary" />
            <span>InsightFlow AI</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-navy">
          Masuk ke akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-medium text-primary hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Banner Mode Demo */}
        <div className="mb-4 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-slate-ink">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-info" />
            <div>
              <p className="font-medium text-navy">Mode Demo Frontend</p>
              <p className="text-muted-foreground">
                Backend FastAPI belum tersambung. Anda dapat masuk dengan email
                apa saja untuk mencoba fitur web.
              </p>
            </div>
          </div>
        </div>

        <div className="card-pad rounded-xl border border-border bg-white shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-navy"
              >
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="min-h-11 w-full rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-navy"
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Fitur Lupa Kata Sandi akan aktif setelah backend terhubung.")
                  }
                  className="text-xs text-primary hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 w-full rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
              {!loading && <ArrowRight className="size-4" />}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Atau masuk dengan
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-accent disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google OAuth (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
