import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { DocsCommand } from "@/lib/docs/commands";

export function CommandReference({ command }: { command: DocsCommand }) {
  return (
    <article
      id={command.name}
      className="bloom-panel scroll-mt-28 flex flex-col gap-4 rounded-xl bg-bloom-surface/90 p-5 sm:p-6"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <code className="w-fit rounded-md border-2 border-primary/40 bg-bloom-dialog px-2.5 py-1 font-mono text-lg font-bold text-primary">
            {command.value}
          </code>
          <h2 className="font-display text-xl font-bold tracking-tight">
            {command.summary}
          </h2>
        </div>
        <Badge
          variant={command.requiresAuth ? "secondary" : "outline"}
          className="w-fit border-2"
        >
          {command.requiresAuth ? "Requires auth" : "Works signed out"}
        </Badge>
      </header>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {command.description}
      </p>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold tracking-wide uppercase">
          How to use
        </h3>
        <ol className="flex flex-col gap-2">
          {command.steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg border border-border bg-bloom-dialog px-3 py-2.5 text-sm"
            >
              <span className="font-mono font-bold text-primary">
                {index + 1}.
              </span>
              <span className="text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {command.notes?.length ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-sm font-bold tracking-wide uppercase">
            Notes
          </h3>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {command.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-primary">▹</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {command.related?.length ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
            Related
          </span>
          {command.related.map((item) =>
            item.startsWith("/docs") ? (
              <Link
                key={item}
                href={item}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-primary hover:bg-muted"
              >
                {item.replace("/docs/", "")}
              </Link>
            ) : (
              <a
                key={item}
                href={`#${item.replace("/", "")}`}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-primary hover:bg-muted"
              >
                {item}
              </a>
            ),
          )}
        </div>
      ) : null}
    </article>
  );
}
