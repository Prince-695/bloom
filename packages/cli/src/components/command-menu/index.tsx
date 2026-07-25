import type { RefObject } from "react";
import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import { getFilteredCommands } from "./filter-commands";
import { COMMANDS } from "./commands";
import { useTheme } from "../../providers/theme";
import { Separator } from "../separator";

const MAX_VISIBLE_ITEMS = 6;
const COMMAND_COL_WIDTH = Math.max(...COMMANDS.map((cmd) => cmd.name.length)) + 4;

type CommandMenuProps = {
  query: string;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};

export function CommandMenu({
  query,
  selectedIndex,
  scrollRef,
  onSelect,
  onExecute,
}: CommandMenuProps) {
    const { colors } = useTheme();
    const filtered = getFilteredCommands(query);

    if (filtered.length === 0) {
        return (
            <box paddingX={1} paddingY={1}>
                <text attributes={TextAttributes.DIM} fg={colors.muted}>
                    No matching commands
                </text>
            </box>
        );
    }

    const visibleCount = Math.min(filtered.length, MAX_VISIBLE_ITEMS);
    const hiddenCount = filtered.length - visibleCount;

    return (
        <box flexDirection="column" width="100%" paddingTop={1}>
            <Separator inset={4} />

            <scrollbox ref={scrollRef} height={visibleCount} width="100%">
                {filtered.slice(0, MAX_VISIBLE_ITEMS).map((cmd, i) => {
                    const isSelected = i === selectedIndex;

                    return (
                        <box
                            key={cmd.value}
                            flexDirection="row"
                            height={1}
                            onMouseMove={() => onSelect(i)}
                            onMouseDown={() => onExecute(i)}
                        >
                            <box width={2} flexShrink={0}>
                                <text selectable={false} fg={isSelected ? colors.primary : colors.background}>
                                    {isSelected ? ">" : " "}
                                </text>
                            </box>

                            <box width={COMMAND_COL_WIDTH} flexShrink={0}>
                                <text selectable={false} fg={isSelected ? colors.primary : colors.foreground}>
                                    /{cmd.name}
                                </text>
                            </box>

                            <box flexGrow={1} flexShrink={1}>
                                <text selectable={false} attributes={TextAttributes.DIM} fg={colors.muted}>
                                    {cmd.description}
                                </text>
                            </box>
                        </box>
                    );
                })}
            </scrollbox>

            {hiddenCount > 0 && (
                <box paddingLeft={2} height={1}>
                    <text attributes={TextAttributes.DIM} fg={colors.muted}>
                        ↓ {hiddenCount} more
                    </text>
                </box>
            )}

            <box
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
                paddingLeft={2}
                paddingTop={1}
                height={1}
            >
                <text attributes={TextAttributes.DIM} fg={colors.muted}>
                    <span fg={colors.primary}>↑/↓</span> Navigate ·{" "}
                    <span fg={colors.primary}>enter</span> Select ·{" "}
                    <span fg={colors.primary}>tab</span> Complete
                </text>
                <text attributes={TextAttributes.DIM} fg={colors.muted}>
                    esc to cancel
                </text>
            </box>
        </box>
    );
}