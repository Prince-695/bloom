"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DOCS_NAV } from "@/lib/docs/nav";
import { cn } from "@/lib/utils";

export function DocsShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 border-r border-border py-8 pr-4 lg:block">
          <ScrollArea className="h-full pr-2">
            <p className="mb-3 font-display text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
              Documentation
            </p>
            <nav className="flex flex-col gap-0.5">
              {DOCS_NAV.map((item) => {
                const active =
                  item.href === "/docs"
                    ? pathname === "/docs"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <div key={item.href} className="flex flex-col gap-0.5">
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 font-display text-sm font-semibold transition-colors",
                        active
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.children && active ? (
                      <div className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="rounded px-2 py-1 font-mono text-xs text-muted-foreground hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        <main className="min-w-0 flex-1 py-10 lg:pl-10">
          <header className="mb-10 flex flex-col gap-3 border-b border-border pb-8">
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#ffd700] uppercase">
              Docs
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-muted-foreground">{description}</p>
            ) : null}
          </header>
          <div className="flex flex-col gap-12 pb-16">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
