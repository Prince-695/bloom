import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { KeyCombo } from "@/components/docs/keycap";

export const metadata = {
  title: "Modes",
  description: "Build mode vs Plan mode in Bloom.",
};

export default function DocsModesPage() {
  return (
    <DocsShell
      title="Modes"
      description="Bloom has two agent modes. They change tool access and how the model is instructed to behave."
    >
      <DocsSection title="Switching modes">
        <DocsList
          items={[
            <>
              Press <KeyCombo keys={["Tab"]} /> in the input bar to toggle.
            </>,
            <>
              Or run <InlineCode>/agents</InlineCode> and pick Build or Plan.
            </>,
            "The input border color and footer label update to match the active mode.",
          ]}
        />
      </DocsSection>

      <DocsSection title="Build mode">
        <DocsP>
          Full implementation mode. The agent may explore the codebase and make
          changes.
        </DocsP>
        <DocsList
          items={[
            "Read files, list directories, glob, and grep",
            "writeFile — create or overwrite files",
            "editFile — targeted unique string replacements",
            "bash — run shell commands (tests, builds, git, …)",
            "Instructed to implement directly and verify when possible",
          ]}
        />
        <DocsP>
          Use Build when you want Bloom to ship the change, not just propose it.
        </DocsP>
      </DocsSection>

      <DocsSection title="Plan mode">
        <DocsP>
          Read-only analysis and planning. The agent explores and proposes — it
          cannot modify files or run mutating shell tools.
        </DocsP>
        <DocsList
          items={[
            "readFile, listDirectory, glob, grep only",
            "writeFile / editFile / bash are blocked",
            "Instructed to analyze, propose a plan, and discuss trade-offs",
          ]}
        />
        <DocsP>
          Use Plan to design an approach safely, then flip to Build to execute.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
