import prettyMs from "pretty-ms";
import { useTheme } from "../../providers/theme";
import type { Message } from "../../hooks/use-chat";
import { Mode, type ModeType } from "@bloom/shared";
import { TextAttributes } from "@opentui/core";
import { useMarkdownSyntaxStyle } from "../../lib/markdown-style";

type ClientMessagePart = Message["parts"][number];
type ToolPart = Extract<ClientMessagePart, { type: `tool-${string}` | "dynamic-tool" }>;

type Props = {
  parts: ClientMessagePart[];
  model: string;
  mode: ModeType;
  durationMs?: number;
  streaming?: boolean;
};

function formatToolName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function isToolPart(part: ClientMessagePart): part is ToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function formatToolArgs(tc: ToolPart): string {
  if (!("input" in tc) || tc.input == null) return "";
  if (typeof tc.input !== "object") return String(tc.input);
  const values = Object.values(tc.input).map(String);
  if (values.length === 0) return "";
  return `(${values.join(", ")})`;
}

type PartGroup = {
  type: ClientMessagePart["type"];
  parts: ClientMessagePart[];
  key: string;
};

function groupConsecutiveParts(parts: ClientMessagePart[]): PartGroup[] {
  const groups: PartGroup[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.type === part.type) {
      lastGroup.parts.push(part);
    } else {
      const key = isToolPart(part)
        ? `group-tc-${part.toolCallId}`
        : `group-${part.type}-${i}`;
      groups.push({ type: part.type, parts: [part], key });
    }
  }

  return groups;
}

/**
 * Theme-only palette: primary / foreground / muted (+ error when needed).
 * Reply text uses OpenTUI <markdown> so model markdown renders properly.
 */
export function BotMessage({
  parts,
  model,
  mode,
  durationMs,
  streaming = false,
}: Props) {
  const { colors } = useTheme();
  const syntaxStyle = useMarkdownSyntaxStyle();
  const groups = groupConsecutiveParts(parts);

  return (
    <box flexDirection="column" width="100%" gap={0} paddingTop={0} paddingBottom={0}>
      {groups.map((group) => {
        if (group.type === "reasoning") {
          const lines = group.parts.filter(
            (part): part is Extract<ClientMessagePart, { type: "reasoning" }> =>
              part.type === "reasoning" && part.text.trim().length > 0,
          );
          if (lines.length === 0) return null;

          return (
            <box key={group.key} flexDirection="column" width="100%" paddingLeft={1} gap={0}>
              {lines.map((part, j) => (
                <text
                  key={`reasoning-${j}`}
                  attributes={TextAttributes.DIM}
                  fg={colors.muted}
                >
                  {"• "}
                  {part.text}
                </text>
              ))}
            </box>
          );
        }

        if (group.parts.some(isToolPart)) {
          return (
            <box key={group.key} flexDirection="column" width="100%" paddingLeft={1} gap={0}>
              {group.parts.map((part) => {
                if (!isToolPart(part)) return null;
                const toolName =
                  part.type === "dynamic-tool"
                    ? part.toolName
                    : part.type.slice("tool-".length);
                const args = formatToolArgs(part);
                const pending =
                  part.state !== "output-available" && part.state !== "output-error";

                return (
                  <text key={part.toolCallId}>
                    <span fg={colors.primary}>{"• "}</span>
                    <span fg={colors.primary}>{formatToolName(toolName)}</span>
                    {args ? (
                      <span attributes={TextAttributes.DIM} fg={colors.muted}>
                        {args}
                      </span>
                    ) : null}
                    {pending ? (
                      <span attributes={TextAttributes.DIM} fg={colors.muted}>
                        {" …"}
                      </span>
                    ) : null}
                    {part.state === "output-error" ? (
                      <span fg={colors.error}>{` ${part.errorText}`}</span>
                    ) : null}
                  </text>
                );
              })}
            </box>
          );
        }

        if (group.type === "text") {
          const content = group.parts
            .filter((part): part is Extract<ClientMessagePart, { type: "text" }> =>
              part.type === "text" && part.text.length > 0,
            )
            .map((part) => part.text)
            .join("");

          if (!content) return null;

          return (
            <box key={group.key} width="100%">
              <markdown
                content={content}
                syntaxStyle={syntaxStyle}
                streaming={streaming}
                conceal
                width="100%"
              />
            </box>
          );
        }

        return null;
      })}

      {durationMs != null && !streaming && (
        <box height={1}>
          <text attributes={TextAttributes.DIM} fg={colors.muted}>
            {mode === Mode.PLAN ? "Plan" : "Build"} · {model} · {prettyMs(durationMs)}
          </text>
        </box>
      )}
    </box>
  );
}
