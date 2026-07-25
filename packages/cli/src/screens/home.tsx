import { useCallback } from "react";
import { TextAttributes } from "@opentui/core";
import { useNavigate } from "react-router";
import { usePromptConfig } from "../providers/prompt-config";
import { useTheme } from "../providers/theme";
import { InputBar } from "../components/input-bar";
import { Header } from "../components/header";
import { Separator } from "../components/separator";
import { Mode } from "@bloom/shared";

export function Home() {
  const navigate = useNavigate();
  const { mode, model } = usePromptConfig();
  const { colors } = useTheme();

  const handleSubmit = useCallback(
    (text: string) => {
      navigate("/sessions/new", { state: { message: text, mode, model } });
    },
    [navigate, mode, model],
  );

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      width="100%"
      height="100%"
      paddingX={2}
      paddingY={1}
    >
      <box flexShrink={0} paddingBottom={1}>
        <Header />
      </box>

      <Separator inset={4} />

      <box width="100%" paddingTop={1} flexShrink={0}>
        <InputBar onSubmit={handleSubmit} />
      </box>

      <box flexGrow={1} />

      <box
        flexShrink={0}
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        height={1}
      >
        <text attributes={TextAttributes.DIM} fg={colors.muted}>
          <span fg={colors.primary}>!</span> for bash ·{" "}
          <span fg={colors.primary}>/</span> for commands ·{" "}
          <span fg={colors.primary}>?</span> for shortcuts
        </text>

        <text attributes={TextAttributes.DIM} fg={colors.muted}>
          {model} · {mode === Mode.PLAN ? "Plan" : "Build"}
        </text>
      </box>
    </box>
  );
}
