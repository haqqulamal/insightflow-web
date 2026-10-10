import { Plug, Database } from "lucide-react";

const mockKoneksi = [
  { nama: "CSV / Excel File", tipe: "Unggah Manual", status: "Aktif", icon: Database },
  { nama: "Kasir POS (Moka / Pawoon)", tipe: "Integrasi API", status: "Segera", icon: Plug },
  { nama: "Google Sheets", tipe: "OAuth2", status: "Segera", icon: Plug },
];

export default function KoneksiPage() {
  return (
    <div className="stack-section">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-navy">Koneksi Data</h1>
        <p className="text-sm text-muted-foreground">
          Hubungkan sumber data penjualan dari POS, Marketplace, atau Google Sheets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockKoneksi.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.nama}
              className="card-pad space-y-3 rounded-lg border border-border bg-white shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    k.status === "Aktif"
                      ? "bg-success/10 text-success"
                      : "bg-surface border border-border text-muted-foreground"
                  }`}
                >
                  {k.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{k.nama}</p>
                <p className="text-xs text-muted-foreground">{k.tipe}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
