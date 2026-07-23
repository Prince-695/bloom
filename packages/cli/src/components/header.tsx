import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme";
import { usePromptConfig } from "../providers/prompt-config";
import { PRODUCT_CLI_NAME, PRODUCT_VERSION } from "../lib/brand";
import { Mode } from "@bloom/shared";

const CWD = process.cwd();

function truncatePath(fullPath: string, maxSegments = 2): string {
  const parts = fullPath.replace(/\/$/, "").split("/").filter(Boolean);
  if (parts.length <= maxSegments) return fullPath;
  return "~/" + parts.slice(-maxSegments).join("/");
}

export function Header() {
  const { colors } = useTheme();
  const { mode, model } = usePromptConfig();
  const modeLabel = mode === Mode.PLAN ? "Plan Mode" : "Build Mode";

  return (
    <box flexDirection="column" width="100%" gap={0}>
      <text>
        <span fg={colors.primary}>✿ </span>
        <strong fg={colors.primary}>
          {PRODUCT_CLI_NAME} {PRODUCT_VERSION}
        </strong>
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.muted}>
        {model} · {modeLabel}
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {truncatePath(CWD)}
      </text>
    </box>
  );
}
