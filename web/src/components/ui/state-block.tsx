import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Sparkles } from "lucide-react";

const styles = {
  empty: { icon: Inbox, title: "Belum ada data" },
  error: { icon: AlertTriangle, title: "Terjadi kesalahan" },
  quota: { icon: Sparkles, title: "Kuota harian habis" },
} as const;

export type StateVariant = keyof typeof styles;

const tone: Record<StateVariant, string> = {
  empty: "bg-surface text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
  quota: "bg-warning/10 text-warning",
};

export function StateBlock({
  variant,
  title,
  description,
  action,
}: {
  variant: StateVariant;
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  const meta = styles[variant];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-white px-6 py-12 text-center">
      <span className={`rounded-full p-3 ${tone[variant]}`}>
        <Icon className="size-6" />
      </span>
      <p className="text-sm font-medium text-navy">{title ?? meta.title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
