import { DocsShell } from "@/components/docs/docs-shell";
import { DocsList, DocsP, DocsSection, InlineCode } from "@/components/docs/prose";
import { PROMPT_LIMIT } from "@/lib/docs/data";

export const metadata = {
  title: "Quota & usage",
  description: "How Bloom prompt quotas work.",
};

export default function DocsQuotaPage() {
  return (
    <DocsShell
      title="Quota & usage"
      description="Each account has a shared prompt budget across all sessions."
    >
      <DocsSection title="Limit">
        <DocsP>
          Default limit:{" "}
          <strong className="text-foreground">{PROMPT_LIMIT} prompts total</strong>{" "}
          per account (<InlineCode>PROMPT_REQUEST_LIMIT</InlineCode>).
        </DocsP>
        <DocsList
          items={[
            "The counter is account-wide, not per session.",
            "The footer shows remaining/limit after login and after each completed reply.",
            <>
              <InlineCode>/me</InlineCode> also shows remaining requests and does
              not consume a prompt.
            </>,
          ]}
        />
      </DocsSection>

      <DocsSection title="What counts">
        <DocsP>
          Sending a user prompt that starts generation consumes from the quota.
          Opening dialogs, switching themes/models/modes, and viewing{" "}
          <InlineCode>/me</InlineCode> do not.
        </DocsP>
      </DocsSection>
    </DocsShell>
  );
}
