"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";

type Fase = "idle" | "mengunggah" | "selesai" | "gagal";

const formatDiizinkan = /\.(csv|xlsx)$/i;

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fase, setFase] = useState<Fase>("idle");
  const [progres, setProgres] = useState(0);
  const [namaFile, setNamaFile] = useState<string | null>(null);

  // Bersihkan timer mock saat komponen dilepas
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function mulaiUnggah(file: File) {
    if (!formatDiizinkan.test(file.name)) {
      setFase("gagal");
      setNamaFile(file.name);
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setNamaFile(file.name);
    setFase("mengunggah");
    setProgres(0);
    // Mock progres; nanti diganti SSE job.progress (PRD-00 §11.3)
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 20;
      setProgres(p);
      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setFase("selesai");
      }
    }, 400);
  }

  return (
    <div
      className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-white px-6 py-10 text-center transition-colors hover:border-primary/50"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) mulaiUnggah(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mulaiUnggah(file);
          e.target.value = ""; // reset agar file sama bisa dipilih ulang
        }}
      />
      <UploadCloud className="mx-auto size-9 text-muted-foreground" />
      {fase === "idle" && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Tarik CSV/XLSX ke sini, atau klik untuk memilih
        </p>
      )}
      {fase === "gagal" && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[15px] font-medium text-destructive">
            Format file tidak didukung
          </p>
          <p className="text-xs text-muted-foreground">
            {namaFile} — hanya .csv atau .xlsx yang bisa diproses.
          </p>
        </div>
      )}
      {fase === "mengunggah" && (
        <div className="mt-4 space-y-2">
          <p className="text-[15px] text-slate-ink">{namaFile}</p>
          <div className="h-2 overflow-hidden rounded-full bg-accent">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progres}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Memvalidasi & memproses...
          </p>
        </div>
      )}
      {fase === "selesai" && (
        <p className="mt-3 flex items-center justify-center gap-2 text-[15px] font-medium text-success">
          <CheckCircle2 className="size-4" />
          {namaFile} berhasil diproses (mock)
        </p>
      )}
    </div>
  );
}
