import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_INSTALL } from "@/lib/docs/data";

export const metadata = {
  title: "Configuration",
  description: "Environment variables and local Bloom config files.",
};

export default function DocsConfigurationPage() {
  return (
    <DocsShell
      title="Configuration"
      description="Override API/app backends for local development, and understand what Bloom stores on disk."
    >
      <DocsSection title="Environment variables">
        <DocsP>
          Priority: process environment → production defaults baked into the
          release binary.
        </DocsP>
        <div className="bloom-panel overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bloom-surface font-display text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/70">
                <td className="px-4 py-3 font-mono text-primary">API_URL</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Bloom API base URL (chat, sessions, CLI auth exchange)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-primary">APP_URL</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Web app origin used for the /cli/auth browser handoff
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeBlock
          label="local backends"
          code={`API_URL=http://localhost:3000 APP_URL=http://localhost:3001 bloom`}
        />
      </DocsSection>

      <DocsSection title="Files under ~/.bloom">
        <DocsList
          items={[
            <>
              <InlineCode>{DOCS_INSTALL.authFile}</InlineCode> — CLI token (+
              optional userId). Modes <InlineCode>0700</InlineCode> /{" "}
              <InlineCode>0600</InlineCode>.
            </>,
            <>
              <InlineCode>{DOCS_INSTALL.preferencesFile}</InlineCode> — persisted
              theme name.
            </>,
          ]}
        />
        <DocsP>
          Deleting <InlineCode>~/.bloom</InlineCode> signs you out locally and
          resets theme preference to default Bloom.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
