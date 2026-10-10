import { Bookmark, Sparkles } from "lucide-react";
import Link from "next/link";

export default function TersimpanPage() {
  return (
    <div className="stack-section">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-navy">Insight Tersimpan</h1>
        <p className="text-sm text-muted-foreground">
          Daftar pertanyaan, grafik, dan insight penting yang Anda simpan.
        </p>
      </div>

      <div className="card-pad flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white px-6 py-16 text-center">
        <span className="rounded-full bg-primary/10 p-4 text-primary">
          <Bookmark className="size-8" />
        </span>
        <div className="max-w-sm space-y-1.5">
          <h2 className="text-base font-semibold text-navy">
            Belum Ada Insight Tersimpan
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tandai atau simpan kartu jawaban penting saat berkonsultasi dengan AI Analyst agar mudah diakses kembali di sini.
          </p>
        </div>
        <Link
          href="/app/analis"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Sparkles className="size-4" />
          Mulai Tanya AI Analyst
        </Link>
      </div>
    </div>
  );
}
