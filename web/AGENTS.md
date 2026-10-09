<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Skill wajib (tanpa kecuali)

Aturan ini berlaku di repo ini. Panggil skill lewat tool `skill` SEBELUM
menulis atau mengubah kode, jangan sesudah.

- **Menyentuh UI** — layout, spacing, warna, tipografi, komponen visual, atau
  responsivitas: panggil `ui-ux-pro-max` dulu, dan jalankan
  `python3 ~/.opencode/skills/ui-ux-pro-max/scripts/search.py "<kebutuhan>" --domain ux`
  (tambah `--stack nextjs` untuk pedoman implementasi).
- **Desain baru atau perubahan layout besar**: `brainstorming` dulu, dan
  **JANGAN implementasi sebelum desain disetujui user di chat**.
- **Komponen/fitur baru**: `brainstorming` dulu, persetujuan desain di chat
  baru lanjut ngoding.
- **Bug atau perilaku tak terduga**: `systematic-debugging` dulu, jangan langsung
  menebak penyebabnya.
- **Sebelum menyatakan "selesai"**: `verification-before-completion` — jalankan
  `npx tsc --noEmit`, `npm run lint`, `npm test`, `npx next build` dari `web/`,
  dan laporkan hasil, bukan klaim.
- **Menarik kesimpulan dari review/refactor**: `code-review-and-quality`.

Kalau tidak yakin skill mana yang relevan, pilih yang paling spesifik — bukan
paling umum.
