import Link from "next/link";

import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";

export const metadata = {
  title: "Troubleshooting",
  description: "Common Bloom CLI issues and fixes.",
};

export default function DocsTroubleshootingPage() {
  return (
    <DocsShell
      title="Troubleshooting"
      description="Quick fixes for the problems people hit most often."
    >
      <DocsSection title="bloom: command not found">
        <DocsList
          items={[
            <>
              Confirm the binary exists at{" "}
              <InlineCode>~/.local/bin/bloom</InlineCode> (or the Windows path).
            </>,
            <>
              Ensure that directory is on your <InlineCode>PATH</InlineCode>,
              then open a new shell.
            </>,
            <>
              Re-run the{" "}
              <Link href="/docs/install" className="text-primary underline-offset-4 hover:underline">
                installer
              </Link>
              .
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Unauthorized — run /login first">
        <DocsList
          items={[
            <>
              Run <InlineCode>/login</InlineCode> and finish the browser step.
            </>,
            <>
              Check <InlineCode>~/.bloom/auth.json</InlineCode> exists after
              success.
            </>,
            <>
              If you switched accounts, <InlineCode>/logout</InlineCode> then{" "}
              <InlineCode>/login</InlineCode>.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Login timed out">
        <DocsP>
          The browser handoff expires after 5 minutes. Run{" "}
          <InlineCode>/login</InlineCode> again and complete auth promptly. If
          the browser never opens, copy any URL Bloom prints / check that{" "}
          <InlineCode>APP_URL</InlineCode> points at a reachable web host.
        </DocsP>
      </DocsSection>

      <DocsSection title="/update fails or never sees a new version">
        <DocsList
          items={[
            <>
              Confirm a newer GitHub Release exists under{" "}
              <a
                href="https://github.com/Prince-695/bloom/releases"
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Releases
              </a>
              .
            </>,
            <>
              Unset <InlineCode>BLOOM_NO_UPDATE</InlineCode> if you disabled
              updates.
            </>,
            <>
              Re-run the{" "}
              <Link
                href="/docs/install"
                className="text-primary underline-offset-4 hover:underline"
              >
                one-line installer
              </Link>{" "}
              as a fallback.
            </>,
            <>
              After a successful <InlineCode>/update</InlineCode>, fully quit
              Bloom and start it again.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Wrong API / local development">
        <DocsP>
          Point the CLI at local services:
        </DocsP>
        <DocsList
          items={[
            <>
              <InlineCode>
                API_URL=http://localhost:3000 APP_URL=http://localhost:3001 bloom
              </InlineCode>
            </>,
            "Make sure the API and web packages are running.",
          ]}
        />
      </DocsSection>

      <DocsSection title="Agent can’t edit files">
        <DocsList
          items={[
            <>
              You may be in Plan mode — press <InlineCode>Tab</InlineCode> or run{" "}
              <InlineCode>/agents</InlineCode> and select Build.
            </>,
            "Start Bloom from the project root you intend to modify.",
            "Paths outside the working directory are rejected by the sandbox.",
          ]}
        />
      </DocsSection>

      <DocsSection title="Out of requests">
        <DocsP>
          The footer shows <InlineCode>0/N remaining</InlineCode> when the
          account quota is exhausted. See{" "}
          <Link href="/docs/quota" className="text-primary underline-offset-4 hover:underline">
            Quota & usage
          </Link>
          .
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
