import { CommandReference } from "@/components/docs/command-reference";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_COMMANDS } from "@/lib/docs/commands";

export const metadata = {
  title: "Commands",
  description: "Full reference for every Bloom slash command.",
};

export default function DocsCommandsPage() {
  return (
    <DocsShell
      title="Slash commands"
      description="Type / in the input bar to open the command menu. Filter by typing; Enter runs the highlighted command."
    >
      <DocsSection title="How the menu works">
        <DocsP>
          When the input starts with <InlineCode>/</InlineCode>, Bloom shows
          matching commands. Use <InlineCode>↑</InlineCode> /{" "}
          <InlineCode>↓</InlineCode> to move, <InlineCode>Enter</InlineCode> to
          run, and <InlineCode>Escape</InlineCode> to dismiss.
        </DocsP>
      </DocsSection>

      <div className="flex flex-col gap-6">
        {DOCS_COMMANDS.map((command) => (
          <CommandReference key={command.name} command={command} />
        ))}
      </div>
    </DocsShell>
  );
}
