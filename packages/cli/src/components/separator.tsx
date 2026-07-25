import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../providers/theme";

type Props = {
  /** Horizontal inset already applied by parent padding; subtracted from terminal width. */
  inset?: number;
  char?: string;
};

export function Separator({ inset = 4, char = "─" }: Props) {
  const { width } = useTerminalDimensions();
  const { colors } = useTheme();
  const length = Math.max(8, width - inset);

  return (
    <box flexShrink={0} height={1} width="100%">
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {char.repeat(length)}
      </text>
    </box>
  );
}
