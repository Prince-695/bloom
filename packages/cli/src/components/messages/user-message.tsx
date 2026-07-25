import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../providers/theme";
import { useTerminalDimensions } from "@opentui/react";

type Props = {
  message: string;
  mode: string;
};

/** Accent user turn with a thin light rule beneath — nothing else. */
export function UserMessage({ message }: Props) {
  const { colors } = useTheme();
  const { width } = useTerminalDimensions();
  const rule = "─".repeat(Math.max(8, width - 6));

  return (
    <box width="100%" flexDirection="column" paddingTop={1} paddingBottom={0} gap={0}>
      <text fg={colors.primary}>
        {"> "}
        {message}
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {rule}
      </text>
    </box>
  );
}
