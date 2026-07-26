"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BloomLogo } from "@/components/site/bloom-logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BloomLogo size={30} />
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/docs"
                ? pathname.startsWith("/docs")
                : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 font-display text-sm font-semibold tracking-wide transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <Button
            size="sm"
            className="ml-1 bloom-emboss"
            render={<Link href="/docs/install" />}
          >
            Get Bloom
          </Button>
        </nav>
      </div>
    </header>
  );
}
