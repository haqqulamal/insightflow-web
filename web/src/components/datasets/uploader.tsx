"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

type Fase = "idle" | "mengunggah" | "selesai";

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<Fase>("idle");
  const [progres, setProgres] = useState(0);
  const [namaFile, setNamaFile] = useState<string | null>(null);

  function mulaiUnggah(file: File) {
    setNamaFile(file.name);
    setFase("mengunggah");
    setProgres(0);
    // Mock progres; nanti diganti SSE job.progress (PRD-00 §11.3)
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      setProgres(p);
      if (p >= 100) {
        clearInterval(timer);
        setFase("selesai");
      }
    }, 400);
  }

  return (
    <div
      className="rounded-lg border-2 border-dashed border-border bg-white p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
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
        }}
      />
      <UploadCloud className="size-8 mx-auto text-muted-foreground" />
      {fase === "idle" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Tarik CSV/XLSX ke sini, atau klik untuk memilih
        </p>
      )}
      {fase === "mengunggah" && (
        <div className="mt-3 space-y-1.5">
          <p className="text-sm text-slate-ink">{namaFile}</p>
          <div className="h-2 rounded-full bg-accent overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progres}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Memvalidasi & memproses...</p>
        </div>
      )}
      {fase === "selesai" && (
        <p className="mt-2 text-sm text-success font-medium">
          ✓ {namaFile} berhasil diproses (mock)
        </p>
      )}
    </div>
  );
}
