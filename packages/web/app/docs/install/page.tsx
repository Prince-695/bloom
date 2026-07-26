import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOCS_INSTALL } from "@/lib/docs/data";

export const metadata = {
  title: "Install",
  description: "Install and uninstall the Bloom CLI.",
};

export default function DocsInstallPage() {
  return (
    <DocsShell
      title="Install"
      description="Install Bloom from this host. The script downloads the matching binary from GitHub Releases into your local bin directory."
    >
      <DocsSection title="One-line install">
        <div className="bloom-panel overflow-hidden rounded-xl">
          <Tabs defaultValue="unix">
            <div className="border-b border-border bg-bloom-surface px-3 py-2">
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
              <div className="p-4">
                <CodeBlock code={DOCS_INSTALL.unix} label="bash" />
              </div>
            </TabsContent>
            <TabsContent value="windows" className="p-0">
              <div className="p-4">
                <CodeBlock code={DOCS_INSTALL.windows} label="powershell" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DocsP>
          Installers are served from{" "}
          <InlineCode>{DOCS_INSTALL.origin}</InlineCode> (
          <InlineCode>/install.sh</InlineCode>,{" "}
          <InlineCode>/install.ps1</InlineCode>).
        </DocsP>
        <div className="flex flex-wrap gap-2">
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
          <Button
            variant="ghost"
            render={
              <a
                href="https://github.com/Prince-695/bloom/releases"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            GitHub Releases
          </Button>
        </div>
      </DocsSection>

      <DocsSection title="Where it installs">
        <DocsList
          items={[
            <>
              Unix: <InlineCode>{DOCS_INSTALL.binUnix}</InlineCode>
            </>,
            <>
              Windows: <InlineCode>{DOCS_INSTALL.binWindows}</InlineCode>
            </>,
            <>
              Ensure that directory is on your <InlineCode>PATH</InlineCode>.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Supported platforms">
        <DocsList
          items={DOCS_INSTALL.platforms.map((p) => (
            <InlineCode key={p}>{p}</InlineCode>
          ))}
        />
        <DocsP>
          Not shipped yet:{" "}
          {DOCS_INSTALL.unsupported.map((p, i) => (
            <span key={p}>
              {i > 0 ? ", " : null}
              <InlineCode>{p}</InlineCode>
            </span>
          ))}
          .
        </DocsP>
      </DocsSection>

      <DocsSection title="Verify">
        <CodeBlock
          label="shell"
          code={`bloom\n# You should see the Bloom TUI welcome / home screen`}
        />
      </DocsSection>

      <DocsSection title="Uninstall">
        <DocsP>Delete the binary — Bloom does not leave a system service.</DocsP>
        <CodeBlock
          label="unix"
          code={`rm ~/.local/bin/bloom\n# optional: wipe local auth + theme prefs\nrm -rf ~/.bloom`}
        />
        <CodeBlock
          label="windows (PowerShell)"
          code={`Remove-Item "$env:USERPROFILE\\.local\\bin\\bloom.exe"\n# optional\nRemove-Item -Recurse -Force "$env:USERPROFILE\\.bloom"`}
        />
      </DocsSection>
    </DocsShell>
  );
}
