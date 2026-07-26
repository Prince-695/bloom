import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_MODELS } from "@/lib/docs/data";

export const metadata = {
  title: "Models",
  description: "Supported AI models in Bloom and how to select them.",
};

export default function DocsModelsPage() {
  return (
    <DocsShell
      title="Models"
      description="Pick which model generates replies. Selection is per CLI session until you change it again."
    >
      <DocsSection title="Select a model">
        <DocsList
          items={[
            <>
              Run <InlineCode>/models</InlineCode>.
            </>,
            "Type to filter, or use arrow keys.",
            "Press Enter to apply. The footer shows the active model id.",
          ]}
        />
        <DocsP>
          Default when nothing is chosen:{" "}
          <InlineCode>gpt-5.4-nano</InlineCode>.
        </DocsP>
      </DocsSection>

      <DocsSection title="Supported models">
        <div className="bloom-panel overflow-hidden rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bloom-surface font-display text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Model id</th>
                <th className="px-4 py-3">Provider</th>
                <th className="hidden px-4 py-3 md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {DOCS_MODELS.map((model) => (
                <tr
                  key={model.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-primary">
                    {model.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {model.provider}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {model.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>
    </DocsShell>
  );
}
