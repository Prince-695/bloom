import { CodeBlock } from "@/components/docs/code-block";
import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { DOCS_INSTALL, DOCS_THEMES } from "@/lib/docs/data";

export const metadata = {
  title: "Themes",
  description: "Bloom TUI color themes and preference persistence.",
};

function contrastText(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1a0a12" : "#fff8fa";
}

export default function DocsThemesPage() {
  return (
    <DocsShell
      title="Themes"
      description="Bloom ships many terminal themes. The default Bloom palette matches this website’s rose terminal look."
    >
      <DocsSection title="Change theme">
        <CodeBlock label="bloom" code={`/theme`} />
        <DocsList
          items={[
            "Opens a searchable theme dialog.",
            "Selecting a theme recolors the TUI immediately.",
            <>
              Preference is saved to{" "}
              <InlineCode>{DOCS_INSTALL.preferencesFile}</InlineCode>.
            </>,
          ]}
        />
        <CodeBlock
          label="~/.bloom/preferences.json"
          code={`{\n  "themeName": "Bloom"\n}`}
        />
      </DocsSection>

      <DocsSection title="Built-in themes">
        <DocsP>
          {DOCS_THEMES.length} themes are available. Each capsule is tinted with
          that theme&apos;s primary accent:
        </DocsP>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {DOCS_THEMES.map((theme) => (
            <div
              key={theme.name}
              className="flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2 font-mono text-xs font-semibold shadow-[2px_2px_0_0_var(--bloom-shadow)]"
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                color: contrastText(theme.primary),
              }}
            >
              <span>{theme.name}</span>
              {theme.name === "Bloom" ? (
                <span className="rounded bg-black/15 px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                  default
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </DocsSection>
    </DocsShell>
  );
}
