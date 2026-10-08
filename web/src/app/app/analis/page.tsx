"use client";

import { useState } from "react";
import { getAnalystRun, type K1Response } from "@/lib/api-client";
import { ResponseView } from "@/components/analyst/response-view";
import { SendHorizonal } from "lucide-react";

export default function AnalisPage() {
  const [pertanyaan, setPertanyaan] = useState("");
  const [riwayat, setRiwayat] = useState<
    { tanya: string; jawab: K1Response }[]
  >([]);

  async function kirim() {
    if (!pertanyaan.trim()) return;
    const t = pertanyaan;
    setPertanyaan("");
    const jawab = await getAnalystRun();
    setRiwayat((r) => [...r, { tanya: t, jawab }]);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      <h1 className="text-xl font-semibold text-navy mb-4">AI Analyst</h1>

      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pb-4">
        {riwayat.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Tanyakan sesuatu tentang datamu — jawaban akan memakai data mock (K-1) dulu.
          </p>
        )}
        {riwayat.map((item, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-end">
              <div className="rounded-lg bg-primary text-white px-4 py-2 text-sm max-w-md">
                {item.tanya}
              </div>
            </div>
            <ResponseView run={item.jawab} />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 rounded-lg border border-border bg-white p-2 mt-2">
        <input
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && kirim()}
          placeholder="Tanya apa saja tentang data Anda..."
          className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        <button
          onClick={kirim}
          className="rounded-md bg-primary text-white p-2 disabled:opacity-50"
          disabled={!pertanyaan.trim()}
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
    </div>
  );
}
