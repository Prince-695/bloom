import { useEffect, useMemo, useRef } from "react";
import { SyntaxStyle } from "@opentui/core";
import { useTheme } from "../providers/theme";
import type { ThemeColors } from "../theme";

/** Theme-only markdown/code styles — primary / foreground / muted. */
export function createMarkdownSyntaxStyle(colors: ThemeColors): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: colors.foreground },
    strong: { fg: colors.foreground, bold: true },
    em: { fg: colors.foreground, italic: true },
    codespan: { fg: colors.primary },
    code: { fg: colors.foreground },
    heading: { fg: colors.primary, bold: true },
    link: { fg: colors.primary, underline: true },
    del: { fg: colors.muted, dim: true },
    blockquote: { fg: colors.muted, italic: true },
    list: { fg: colors.foreground },
    conceal: { fg: colors.dimSeparator, dim: true },
    keyword: { fg: colors.primary },
    string: { fg: colors.muted },
    comment: { fg: colors.muted, dim: true },
    function: { fg: colors.primary },
    number: { fg: colors.primary },
    type: { fg: colors.muted },
    operator: { fg: colors.muted },
    punctuation: { fg: colors.muted },
    variable: { fg: colors.foreground },
    property: { fg: colors.foreground },
    constant: { fg: colors.primary },
  });
}

export function useMarkdownSyntaxStyle(): SyntaxStyle {
  const { colors, currentTheme } = useTheme();
  const styleRef = useRef<SyntaxStyle | null>(null);

  const style = useMemo(() => {
    styleRef.current?.destroy();
    const next = createMarkdownSyntaxStyle(colors);
    styleRef.current = next;
    return next;
  }, [
    currentTheme.name,
    colors.primary,
    colors.foreground,
    colors.muted,
    colors.dimSeparator,
  ]);

  useEffect(() => {
    return () => {
      styleRef.current?.destroy();
      styleRef.current = null;
    };
  }, []);

  return style;
}
