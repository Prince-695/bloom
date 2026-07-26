import { DocsShell } from "@/components/docs/docs-shell";
import { KeyCombo } from "@/components/docs/keycap";
import { DocsP, DocsSection } from "@/components/docs/prose";
import { DOCS_SHORTCUTS } from "@/lib/docs/data";

export const metadata = {
  title: "Keyboard",
  description: "Keyboard shortcuts in the Bloom TUI.",
};

export default function DocsKeyboardPage() {
  return (
    <DocsShell
      title="Keyboard shortcuts"
      description="Bloom is keyboard-driven. These bindings come from the TUI input, menus, and session controls."
    >
      <DocsSection title="Global & input">
        <div className="bloom-panel overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bloom-surface font-display text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Keys</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {DOCS_SHORTCUTS.map((row) => (
                <tr
                  key={row.action}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <KeyCombo keys={row.keys} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection title="Ctrl+C behavior">
        <DocsP>
          Bloom does not always quit on the first Ctrl+C. If the input bar has
          text, Ctrl+C clears it. If the input is empty (and no dialog layer
          handles the key), Ctrl+C exits the app. You can also run{" "}
          <code className="text-primary">/exit</code>.
        </DocsP>
      </DocsSection>

      <DocsSection title="While the agent is streaming">
        <DocsP>
          Press Escape to interrupt the current reply. The footer hints that
          Escape interrupts while a response is in flight.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
