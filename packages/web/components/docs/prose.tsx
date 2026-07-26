import { cn } from "@/lib/utils";

export function DocsSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28 flex flex-col gap-4", className)}>
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function DocsP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function DocsList({
  items,
}: {
  items: React.ReactNode[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2 text-sm text-muted-foreground"
        >
          <span className="text-primary">▹</span>
          <span className="text-foreground/85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-border bg-bloom-dialog px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
      {children}
    </code>
  );
}
