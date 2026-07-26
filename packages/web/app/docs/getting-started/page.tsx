import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";

export const metadata = {
  title: "Getting started",
  description: "Your first Bloom session from install to first prompt.",
};

export default function DocsGettingStartedPage() {
  return (
    <DocsShell
      title="Getting started"
      description="From a fresh install to your first agent reply — the happy path."
    >
      <DocsSection title="1. Install the CLI">
        <DocsP>
          Follow the{" "}
          <Link href="/docs/install" className="text-primary underline-offset-4 hover:underline">
            install guide
          </Link>
          , then confirm <InlineCode>bloom</InlineCode> is on your{" "}
          <InlineCode>PATH</InlineCode>.
        </DocsP>
      </DocsSection>

      <DocsSection title="2. Open Bloom in a project">
        <DocsP>
          Bloom tools operate relative to your current working directory. Always
          start it from the repo you want to edit.
        </DocsP>
        <CodeBlock
          label="shell"
          code={`cd ~/Projects/my-app\nbloom`}
        />
      </DocsSection>

      <DocsSection title="3. Connect your account">
        <DocsP>
          Auth is CLI-triggered only. In the TUI:
        </DocsP>
        <CodeBlock label="bloom" code={`/login`} />
        <DocsList
          items={[
            "Bloom opens your browser to the CLI auth handoff page.",
            "Complete Email OTP, Google, or GitHub.",
            <>
              A token is saved to <InlineCode>~/.bloom/auth.json</InlineCode>.
            </>,
            "Return to the TUI — you should see a Signed in toast.",
          ]}
        />
        <DocsP>
          Details:{" "}
          <Link href="/docs/auth" className="text-primary underline-offset-4 hover:underline">
            Authentication
          </Link>
          .
        </DocsP>
      </DocsSection>

      <DocsSection title="4. Send a prompt">
        <DocsList
          items={[
            "Type a natural-language request in the input bar.",
            <>
              Press <InlineCode>Enter</InlineCode> to send (use{" "}
              <InlineCode>Shift+Enter</InlineCode> for newlines).
            </>,
            <>
              Mention files with <InlineCode>@</InlineCode> to attach paths from
              the project tree.
            </>,
            <>
              Press <InlineCode>Escape</InlineCode> while streaming to interrupt.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="5. Read the footer">
        <DocsP>
          The footer shows remaining requests, the active model, and the active
          mode (Build or Plan). Example shape:
        </DocsP>
        <CodeBlock
          label="footer"
          code={`10/10 requests remaining · gpt-5.4-nano · Build`}
        />
        <DocsList
          items={[
            <>
              Quota is account-wide — see{" "}
              <Link href="/docs/quota" className="text-primary underline-offset-4 hover:underline">
                Quota & usage
              </Link>
              .
            </>,
            <>
              Change model with <InlineCode>/models</InlineCode>.
            </>,
            <>
              Toggle mode with <InlineCode>Tab</InlineCode> or{" "}
              <InlineCode>/agents</InlineCode>.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Useful next steps">
        <DocsList
          items={[
            <>
              <Link href="/docs/commands" className="text-primary underline-offset-4 hover:underline">
                All slash commands
              </Link>
            </>,
            <>
              <Link href="/docs/modes" className="text-primary underline-offset-4 hover:underline">
                Build vs Plan
              </Link>
            </>,
            <>
              <Link href="/docs/keyboard" className="text-primary underline-offset-4 hover:underline">
                Keyboard shortcuts
              </Link>
            </>,
          ]}
        />
      </DocsSection>
    </DocsShell>
  );
}
