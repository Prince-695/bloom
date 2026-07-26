import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_TOOLS } from "@/lib/docs/data";

export const metadata = {
  title: "Tools",
  description: "Local tools Bloom can use in Plan and Build modes.",
};

export default function DocsToolsPage() {
  return (
    <DocsShell
      title="Tools"
      description="When the agent needs project context or changes, it calls local tools that run on your machine inside the current working directory."
    >
      <DocsSection title="Sandboxing">
        <DocsP>
          All file paths resolve under <InlineCode>process.cwd()</InlineCode>.
          Attempts to escape the project directory are rejected.
        </DocsP>
      </DocsSection>

      <DocsSection title="Available in Plan and Build">
        <div className="flex flex-col gap-3">
          {DOCS_TOOLS.plan.map((tool) => (
            <div
              key={tool.name}
              className="bloom-panel-sm rounded-xl p-4"
            >
              <code className="font-mono text-sm font-bold text-primary">
                {tool.name}
              </code>
              <p className="mt-1 text-sm text-muted-foreground">
                {tool.description}
              </p>
              <p className="mt-2 font-mono text-xs text-[#a8909a]">
                Inputs: {tool.inputs}
              </p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Build only">
        <DocsP>
          These tools are blocked in Plan mode with an explicit error if the
          model attempts them.
        </DocsP>
        <div className="flex flex-col gap-3">
          {DOCS_TOOLS.buildOnly.map((tool) => (
            <div
              key={tool.name}
              className="bloom-panel-sm rounded-xl p-4"
            >
              <code className="font-mono text-sm font-bold text-primary">
                {tool.name}
              </code>
              <p className="mt-1 text-sm text-muted-foreground">
                {tool.description}
              </p>
              <p className="mt-2 font-mono text-xs text-[#a8909a]">
                Inputs: {tool.inputs}
              </p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Limits & safety">
        <DocsList items={[...DOCS_TOOLS.limits]} />
      </DocsSection>
    </DocsShell>
  );
}
