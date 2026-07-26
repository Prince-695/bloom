import Link from "next/link";

import { BloomLogo } from "@/components/site/bloom-logo";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bloom-dialog">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <BloomLogo size={28} />
          <div className="flex flex-wrap items-center gap-5 font-display text-sm font-semibold">
            <Link href="/docs" className="text-muted-foreground hover:text-primary">
              Docs
            </Link>
            <Link
              href="/docs/install"
              className="text-muted-foreground hover:text-primary"
            >
              Install
            </Link>
            <a
              href="https://github.com/Prince-695/bloom"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              GitHub
            </a>
          </div>
        </div>
        <Separator className="bg-bloom-separator" />
        <p className="font-mono text-xs text-muted-foreground">
          Terminal-first AI coding. Auth opens from the CLI — not from this site.
        </p>
      </div>
    </footer>
  );
}
