import { useState, useEffect, useCallback } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../providers/theme";
import { PRODUCT_CLI_NAME, PRODUCT_TAGLINE, PRODUCT_VERSION } from "../lib/brand";

const TITLE_TEXT = "BLOOM";
const STAGGER_MS = 45;
const BLINK_MS = 550;

type Props = {
  onDismiss: () => void;
};

function DottedSeparator({ inset = 6 }: { inset?: number }) {
  const { width } = useTerminalDimensions();
  const { colors } = useTheme();
  const length = Math.max(8, Math.floor((width - inset) / 2));
  const line = Array.from({ length }, () => ".").join(" ");

  return (
    <box flexShrink={0} height={1} width="100%">
      <text attributes={TextAttributes.DIM} fg={colors.muted}>
        {line}
      </text>
    </box>
  );
}

export function WelcomeScreen({ onDismiss }: Props) {
  const { colors } = useTheme();
  const [revealCount, setRevealCount] = useState(0);
  const [blinkOn, setBlinkOn] = useState(true);

  useEffect(() => {
    if (revealCount >= TITLE_TEXT.length) return;
    const timer = setInterval(() => {
      setRevealCount((c) => Math.min(c + 1, TITLE_TEXT.length));
    }, STAGGER_MS);
    return () => clearInterval(timer);
  }, [revealCount]);

  useEffect(() => {
    const blink = setInterval(() => setBlinkOn((b) => !b), BLINK_MS);
    return () => clearInterval(blink);
  }, []);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useKeyboard((key) => {
    if (key.name === "return" || key.name === "enter") {
      key.preventDefault();
      handleDismiss();
    }
  });

  const visibleTitle = TITLE_TEXT.slice(0, revealCount);

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      flexGrow={1}
      paddingX={3}
      paddingY={1}
      gap={1}
    >
      <text fg={colors.primary}>
        {PRODUCT_TAGLINE}{" "}
        <span attributes={TextAttributes.DIM} fg={colors.muted}>
          {PRODUCT_CLI_NAME} v{PRODUCT_VERSION}
        </span>
      </text>

      <DottedSeparator inset={6} />

      <box paddingTop={1}>
        <ascii-font font="block" text={visibleTitle || " "} color={colors.primary} />
      </box>

      <DottedSeparator inset={6} />

      <box paddingTop={1}>
        <text
          attributes={blinkOn ? TextAttributes.BOLD : TextAttributes.DIM}
          fg={blinkOn ? colors.foreground : colors.dimSeparator}
        >
          Let's get started. Press <strong fg={colors.primary}>Enter</strong> to continue
        </text>
      </box>
    </box>
  );
}
