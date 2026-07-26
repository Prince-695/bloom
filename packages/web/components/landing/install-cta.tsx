"use client";

import Link from "next/link";
import { BookOpenIcon } from "lucide-react";

import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INSTALL_UNIX, INSTALL_WINDOWS } from "@/lib/site";

export function InstallCta() {
  return (
    <section className="relative overflow-hidden py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(90,58,74,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(90,58,74,0.55) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Install in one line.
          </h2>
          <p className="text-muted-foreground">
            Drop Bloom on your machine, then connect from inside the TUI with{" "}
            <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-primary">
              /login
            </code>
            . Auth is opened by the CLI — not linked from this site.
          </p>
        </div>

        <div className="bloom-panel max-w-3xl overflow-hidden rounded-xl">
          <Tabs defaultValue="unix">
            <div className="flex items-center justify-between gap-3 border-b-2 border-border bg-bloom-surface px-3 py-2">
              <TabsList className="bg-transparent">
                <TabsTrigger value="unix" className="font-mono text-xs">
                  Linux / macOS
                </TabsTrigger>
                <TabsTrigger value="windows" className="font-mono text-xs">
                  Windows
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="unix" className="p-0">
              <InstallRow command={INSTALL_UNIX} />
            </TabsContent>
            <TabsContent value="windows" className="p-0">
              <InstallRow command={INSTALL_WINDOWS} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className="bloom-emboss"
            render={<Link href="/docs/install" />}
          >
            <BookOpenIcon data-icon="inline-start" />
            Open install docs
          </Button>
          <Button
            variant="outline"
            className="border-2 shadow-[3px_3px_0_0_var(--bloom-shadow)]"
            render={<a href="/install.sh" download />}
          >
            Download install.sh
          </Button>
          <Button
            variant="outline"
            className="border-2 shadow-[3px_3px_0_0_var(--bloom-shadow)]"
            render={<a href="/install.ps1" download />}
          >
            Download install.ps1
          </Button>
        </div>
      </div>
    </section>
  );
}

function InstallRow({ command }: { command: string }) {
  return (
    <div className="flex items-start gap-3 p-4 sm:items-center">
      <pre className="flex-1 overflow-x-auto font-mono text-xs text-bloom-code sm:text-sm">
        <code>{command}</code>
      </pre>
      <CopyButton
        content={command}
        variant="outline"
        size="sm"
        className="shrink-0 border-2"
        aria-label="Copy install command"
      />
    </div>
  );
}
