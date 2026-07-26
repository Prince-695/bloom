import { cn } from "@/lib/utils";

export function Keycap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-7 items-center justify-center rounded-md border-2 border-border bg-bloom-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-[2px_2px_0_0_var(--bloom-shadow)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function KeyCombo({ keys }: { keys: readonly string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <span className="font-mono text-xs text-muted-foreground">+</span>
          ) : null}
          <Keycap>{key}</Keycap>
        </span>
      ))}
    </span>
  );
}
