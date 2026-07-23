import { TextAttributes } from "@opentui/core";
import type { ReactNode } from "react";
import { InputBar } from "./input-bar";
import { Spinner } from "./spinner";
import { Header } from "./header";
import { Separator } from "./separator";
import { usePromptConfig } from "../providers/prompt-config";
import { useTheme } from "../providers/theme";
import { Mode } from "@bloom/shared";

type Props = {
  children?: ReactNode;
  onSubmit: (text: string) => void;
  inputDisabled?: boolean;
  loading?: boolean;
  interruptible?: boolean;
};

export function SessionShell({
  children,
  onSubmit,
  inputDisabled = false,
  loading = false,
  interruptible = false,
}: Props) {
  const { mode, model } = usePromptConfig();
  const { colors } = useTheme();

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      width="100%"
      height="100%"
      paddingY={1}
      paddingX={2}
      gap={0}
    >
      <box flexShrink={0} paddingBottom={1}>
        <Header />
      </box>

      <Separator inset={4} />

      <scrollbox flexGrow={1} width="100%" stickyScroll stickyStart="bottom" paddingY={1}>
        <box flexDirection="column" width="100%" gap={0}>
          {children}
        </box>
      </scrollbox>

      <box flexShrink={0} paddingTop={1}>
        <InputBar onSubmit={onSubmit} disabled={inputDisabled} />
      </box>

      <box
        flexShrink={0}
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        height={1}
        paddingTop={1}
      >
        <box flexDirection="row" alignItems="center" gap={2}>
          {loading ? (
            <>
              <Spinner />
              {interruptible ? (
                <box flexDirection="row" gap={1}>
                  <text fg={colors.primary}>esc</text>
                  <text attributes={TextAttributes.DIM} fg={colors.muted}>
                    to interrupt
                  </text>
                </box>
              ) : null}
            </>
          ) : (
            <text attributes={TextAttributes.DIM} fg={colors.muted}>
              <span fg={colors.primary}>!</span> for bash ·{" "}
              <span fg={colors.primary}>/</span> for commands ·{" "}
              <span fg={colors.primary}>?</span> for shortcuts
            </text>
          )}
        </box>

        <box flexDirection="row" gap={1} flexShrink={0}>
          <text attributes={TextAttributes.DIM} fg={colors.muted}>
            {model} · {mode === Mode.PLAN ? "Plan" : "Build"}
          </text>
        </box>
      </box>
    </box>
  );
}
