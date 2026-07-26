import Link from "next/link";

import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { Button } from "@/components/ui/button";
import { DOCS_COMMANDS } from "@/lib/docs/commands";

export const metadata = {
  title: "Docs",
  description:
    "Complete Bloom documentation — install, commands, modes, tools, themes, and configuration.",
};

export default function DocsOverviewPage() {
  return (
    <DocsShell
      title="Bloom documentation"
      description="Bloom is a terminal-first AI coding agent. Install the CLI, connect from the TUI, and work in Build or Plan mode with real project tools."
    >
      <DocsSection title="What Bloom is">
        <DocsP>
          Bloom runs as an interactive TUI in your project directory. You chat
          with an agent that can explore your codebase, plan changes, edit
          files, and run shell commands — depending on the active mode.
        </DocsP>
        <DocsList
          items={[
            <>
              Launch with <InlineCode>bloom</InlineCode> from any project folder.
            </>,
            <>
              Open slash commands with <InlineCode>/</InlineCode> in the input
              bar.
            </>,
            <>
              Authenticate only from the CLI via <InlineCode>/login</InlineCode>{" "}
              — there is no public sign-in page on this site.
            </>,
            <>
              Switch <strong className="text-foreground">Build</strong> vs{" "}
              <strong className="text-foreground">Plan</strong> with{" "}
              <InlineCode>Tab</InlineCode> or <InlineCode>/agents</InlineCode>.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Start here">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              href: "/docs/architecture",
              title: "Architecture",
              body: "HLD diagram and end-to-end system explanation.",
            },
            {
              href: "/docs/install",
              title: "Install",
              body: "One-line installers, platforms, uninstall.",
            },
            {
              href: "/docs/getting-started",
              title: "Getting started",
              body: "First run, first prompt, footer explained.",
            },
            {
              href: "/docs/commands",
              title: "Commands",
              body: "Every slash command with full detail.",
            },
            {
              href: "/docs/tools",
              title: "Tools",
              body: "What the agent can read, write, and run.",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bloom-panel flex flex-col gap-1 rounded-xl bg-bloom-surface p-4 transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display text-lg font-bold">{card.title}</span>
              <span className="text-sm text-muted-foreground">{card.body}</span>
            </Link>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Command cheat sheet">
        <DocsP>
          Type <InlineCode>/</InlineCode> to open the menu, then filter by name.
          Click through for the full reference.
        </DocsP>
        <div className="bloom-panel overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bloom-surface font-display text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Command</th>
                <th className="px-4 py-3">Summary</th>
                <th className="hidden px-4 py-3 sm:table-cell">Auth</th>
              </tr>
            </thead>
            <tbody>
              {DOCS_COMMANDS.map((command) => (
                <tr
                  key={command.name}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/docs/commands#${command.name}`}
                      className="font-mono font-semibold text-primary hover:underline"
                    >
                      {command.value}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {command.summary}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                    {command.requiresAuth ? "required" : "optional"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          className="w-fit bloom-emboss"
          render={<Link href="/docs/commands" />}
        >
          Open full command reference
        </Button>
      </DocsSection>
    </DocsShell>
  );
}
