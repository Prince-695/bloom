import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_INSTALL } from "@/lib/docs/data";

export const metadata = {
  title: "Authentication",
  description: "How Bloom CLI login works — browser handoff, tokens, logout.",
};

export default function DocsAuthPage() {
  return (
    <DocsShell
      title="Authentication"
      description="Bloom auth is opened by the CLI. The marketing site does not expose a public sign-in route."
    >
      <DocsSection title="Supported methods">
        <DocsList
          items={[
            "Email one-time code (OTP) via SMTP",
            "Google OAuth",
            "GitHub OAuth",
          ]}
        />
        <DocsP>There are no passwords. Accounts are created on first successful OTP verify if needed.</DocsP>
      </DocsSection>

      <DocsSection title="CLI login flow">
        <DocsList
          items={[
            <>
              You run <InlineCode>/login</InlineCode> inside Bloom.
            </>,
            "Bloom starts a short-lived local callback server on 127.0.0.1.",
            "Your browser opens the CLI-gated web handoff page.",
            "After you authenticate, the browser redirects to the local callback with a one-time code.",
            "Bloom exchanges that code with the API for a long-lived CLI token.",
            <>
              Token is written to <InlineCode>{DOCS_INSTALL.authFile}</InlineCode>{" "}
              (directory mode <InlineCode>0700</InlineCode>, file{" "}
              <InlineCode>0600</InlineCode>).
            </>,
          ]}
        />
        <DocsP>
          The flow times out after <strong className="text-foreground">5 minutes</strong> if
          the browser step is not completed.
        </DocsP>
        <CodeBlock label="bloom" code={`/login`} />
      </DocsSection>

      <DocsSection title="Logout & account switch">
        <CodeBlock
          label="bloom"
          code={`/logout\n/login`}
        />
        <DocsList
          items={[
            <>
              <InlineCode>/logout</InlineCode> attempts to revoke the token on the
              API, then deletes the local auth file.
            </>,
            "Even if the revoke call fails, local credentials are cleared.",
            <>
              Run <InlineCode>/login</InlineCode> again to sign in as another user.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="What requires auth">
        <DocsP>
          Most slash commands and all chat prompts require a valid token. These
          work while signed out:
        </DocsP>
        <DocsList
          items={[
            <InlineCode key="a">/login</InlineCode>,
            <InlineCode key="b">/logout</InlineCode>,
            <InlineCode key="c">/exit</InlineCode>,
          ]}
        />
        <DocsP>
          If you try a gated action without auth, Bloom prompts you to run{" "}
          <InlineCode>/login</InlineCode> first.
        </DocsP>
      </DocsSection>

      <DocsSection title="Inspect your account">
        <CodeBlock label="bloom" code={`/me`} />
        <DocsP>
          Shows name, email, verification, member-since, and remaining requests.
          Opening <InlineCode>/me</InlineCode> does not consume a prompt.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
