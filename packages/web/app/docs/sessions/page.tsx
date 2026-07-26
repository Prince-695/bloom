import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";

export const metadata = {
  title: "Sessions",
  description: "How Bloom chat sessions work.",
};

export default function DocsSessionsPage() {
  return (
    <DocsShell
      title="Sessions"
      description="Each conversation is a session stored for your account. You can start new ones or resume past work."
    >
      <DocsSection title="Start a new session">
        <DocsList
          items={[
            "From the home screen, type a prompt and press Enter — Bloom creates a session and navigates into it.",
            <>
              From inside a session, run <InlineCode>/new</InlineCode> to return
              home and begin another conversation.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="Browse past sessions">
        <CodeBlock label="bloom" code={`/sessions`} />
        <DocsList
          items={[
            "Opens a searchable dialog of your sessions (filter by title).",
            "Select one to open that conversation.",
            "Requires authentication.",
          ]}
        />
      </DocsSection>

      <DocsSection title="During a session">
        <DocsP>
          Messages stream into the transcript. Tool activity (reads, edits,
          bash) appears as the agent works. The footer continues to show quota,
          model, and mode for the active session context.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
