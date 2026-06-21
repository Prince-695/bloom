// import prettyMs from "pretty-ms";
import { EmptyBorder } from "../border";
import { useTheme } from "../../providers/theme";
// import type { Message } from "../../hooks/use-chat";
// import { Mode, type ModeType } from "@nightcode/shared";
import { TextAttributes } from "@opentui/core";

type Props = {
    message: string;
};

export function ErrorMessage({ message }: Props) {
    const { colors } = useTheme();

    return (
        <box width="100%" alignItems="center" >
            <box
                border={["left"]}
                borderColor={colors.error}
                width="100%"
                customBorderChars={{
                    ...EmptyBorder,
                    vertical: "┃",
                    bottomLeft: "┗",
                }}
            >
                <box
                    justifyContent="center"
                    paddingX={2}
                    paddingY={1}
                    backgroundColor={colors.surface}
                    width="100%"
                >
                    <text attributes={TextAttributes.DIM}>{message}</text>
                </box>

            </box>
        </box>
    )
}