import Link from "next/link";

import { ArchitectureDiagram } from "@/components/docs/architecture-diagram";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";

export const metadata = {
  title: "Architecture",
  description:
    "High-level design of Bloom — CLI, web, API, auth, tools, and end-to-end flow.",
};

export default function DocsArchitecturePage() {
  return (
    <DocsShell
      title="Architecture"
      description="End-to-end high-level view of how Bloom’s packages fit together — from the TUI on your machine to models in the cloud."
    >
      <DocsSection title="High-level diagram (HLD)">
        <DocsP>
          Solid arrows are primary runtime paths. Dashed arrows are supporting
          flows (browser auth handoff, local tool I/O).
        </DocsP>
        <ArchitectureDiagram />
      </DocsSection>

      <DocsSection title="Packages at a glance">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: "packages/cli",
              body: "OpenTUI app. Slash commands, themes, streaming chat UI, local tool execution in your project cwd, device login.",
            },
            {
              title: "packages/web",
              body: "Next.js marketing site, docs, installers, and CLI-gated /cli/auth (plus /login for the handoff — not linked publicly).",
            },
            {
              title: "packages/server",
              body: "Hono API: chat streaming, sessions, quotas, Better Auth, CLI begin/exchange/logout.",
            },
            {
              title: "packages/database",
              body: "Prisma + Postgres: users, sessions, verification, CLI codes, API tokens, quotas.",
            },
            {
              title: "packages/shared",
              body: "Shared types: modes, models, tool contracts, prompt limit.",
            },
          ].map((item) => (
            <div key={item.title} className="bloom-panel-sm rounded-xl p-4">
              <p className="font-mono text-sm font-bold text-primary">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="End-to-end: first prompt">
        <ol className="flex flex-col gap-3">
          {[
            <>
              You install the CLI and run <InlineCode>bloom</InlineCode> inside a
              project directory.
            </>,
            <>
              <InlineCode>/login</InlineCode> opens the browser to{" "}
              <InlineCode>/cli/auth</InlineCode> on the web app. After OTP/OAuth,
              a token is stored in <InlineCode>~/.bloom/auth.json</InlineCode>.
            </>,
            <>
              You type a prompt (optionally with <InlineCode>@</InlineCode> file
              mentions). Mode is Build or Plan; model comes from{" "}
              <InlineCode>/models</InlineCode>.
            </>,
            <>
              The CLI streams to the API. The API enforces auth + quota, builds a
              mode-aware system prompt, and calls the selected provider model.
            </>,
            <>
              When the model requests tools, the CLI executes them locally
              (sandboxed to cwd) and returns results until the turn finishes.
            </>,
            <>
              Messages persist as a session. The footer refreshes remaining
              requests.
            </>,
          ].map((step, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-xl border border-border bg-bloom-surface px-4 py-3 text-sm"
            >
              <span className="font-mono font-bold text-primary">
                {index + 1}.
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </DocsSection>

      <DocsSection title="Auth boundary">
        <DocsList
          items={[
            <>
              Public site: docs + install only — no marketing sign-in CTA.
            </>,
            <>
              CLI opens browser auth; web routes <InlineCode>/cli/auth</InlineCode>{" "}
              and <InlineCode>/login</InlineCode> exist for that handoff (
              <InlineCode>noindex</InlineCode>).
            </>,
            <>
              API issues CLI tokens; local file permissions are{" "}
              <InlineCode>0700</InlineCode> / <InlineCode>0600</InlineCode>.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Modes & tools">
        <DocsP>
          Plan is read-only (readFile, listDirectory, glob, grep). Build adds
          writeFile, editFile, and bash. See{" "}
          <Link
            href="/docs/modes"
            className="text-primary underline-offset-4 hover:underline"
          >
            Modes
          </Link>{" "}
          and{" "}
          <Link
            href="/docs/tools"
            className="text-primary underline-offset-4 hover:underline"
          >
            Tools
          </Link>
          .
        </DocsP>
      </DocsSection>

      <DocsSection title="Config knobs">
        <DocsList
          items={[
            <>
              <InlineCode>API_URL</InlineCode> — API base (chat, auth exchange).
            </>,
            <>
              <InlineCode>APP_URL</InlineCode> — web origin for browser login.
            </>,
            <>
              Theme preference: <InlineCode>~/.bloom/preferences.json</InlineCode>.
            </>,
          ]}
        />
        <DocsP>
          Full details in{" "}
          <Link
            href="/docs/configuration"
            className="text-primary underline-offset-4 hover:underline"
          >
            Configuration
          </Link>
          .
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
