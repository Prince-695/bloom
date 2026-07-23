import { useTheme } from "../../providers/theme";
import { TextAttributes } from "@opentui/core";

type Props = {
  message: string;
};

/** Match Antigravity: color + prefix only, no border rails. */
export function ErrorMessage({ message }: Props) {
  const { colors } = useTheme();

  return (
    <box width="100%" paddingTop={1} paddingBottom={1}>
      <text>
        <span fg={colors.error}>{"✗ "}</span>
        <span attributes={TextAttributes.DIM} fg={colors.muted}>
          {message}
        </span>
      </text>
    </box>
  );
}
