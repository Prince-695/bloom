import { DocsShell } from "@/components/docs/docs-shell";
import { KeyCombo } from "@/components/docs/keycap";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";

export const metadata = {
  title: "File mentions",
  description: "Attach project files and folders to prompts with @.",
};

export default function DocsMentionsPage() {
  return (
    <DocsShell
      title="File mentions"
      description="Use @ in the prompt to browse and insert project-relative file or folder paths."
    >
      <DocsSection title="How it works">
        <DocsList
          items={[
            <>
              Type <InlineCode>@</InlineCode> in the input bar.
            </>,
            "Bloom opens a mention menu listing files and folders from the project tree.",
            "Continue typing to filter by path prefix / name.",
            <>
              Use <KeyCombo keys={["↑"]} /> / <KeyCombo keys={["↓"]} /> then{" "}
              <KeyCombo keys={["Enter"]} /> to insert the path.
            </>,
            <>
              <KeyCombo keys={["Escape"]} /> closes the mention menu.
            </>,
          ]}
        />
        <DocsP>
          Directories are marked in the picker; selecting one inserts a trailing{" "}
          <InlineCode>/</InlineCode>. Mentions help the agent focus on the right
          files without pasting long paths by hand.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
