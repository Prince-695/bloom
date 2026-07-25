import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import type { DialogConfig } from "./types";
import { useKeyboardLayer } from "../keyboard-layer";
import { useTheme } from "../theme";
import { Separator } from "../../components/separator";

export type DialogContextValue = {
  open: (config: DialogConfig) => void;
  close: () => void;
  currentDialog: DialogConfig | null;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const value = useContext(DialogContext);
  if (!value) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return value;
}

type DialogProviderProps = {
  children: ReactNode;
};

export function DialogProvider({ children }: DialogProviderProps) {
    const [currentDialog, setCurrentDialog] = useState<DialogConfig | null>(null);
    const { push, pop } = useKeyboardLayer();

    const close = useCallback(() => {
      setCurrentDialog(null);
      pop("dialog");
    }, [pop]);

    const open = useCallback((config: DialogConfig) => {
      setCurrentDialog(config);
      push("dialog", () => {
        close();
        return true;
      });
    }, [push, close]);

    const value: DialogContextValue = {
      open,
      close,
      currentDialog,
    };

    return (
      <DialogContext.Provider value={value}>
        {children}
      </DialogContext.Provider>
    );
}

type DialogHostProps = {
  currentDialog: DialogConfig | null;
  close: () => void;
};

export function DialogHost({ currentDialog, close }: DialogHostProps) {
  const { isTopLayer } = useKeyboardLayer();
  const { colors } = useTheme();

  useKeyboard((key) => {
    if (!currentDialog || !isTopLayer("dialog")) return;
    
    if (key.name === "escape") {
      close();
    }
  });

  if (!currentDialog) return null;

  const { title, children } = currentDialog;

  return (
    <box width="100%" flexDirection="column" paddingTop={1}>
      <Separator inset={4} />

      <box
        paddingY={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <text fg={colors.primary}>
          <strong>{title}</strong>
        </text>
        <text attributes={TextAttributes.DIM} fg={colors.muted} onMouseDown={() => close()}>
          esc to cancel
        </text>
      </box>

      <box width="100%">{children}</box>

      <box paddingTop={1} height={1} width="100%">
        <text attributes={TextAttributes.DIM} fg={colors.muted}>
          <span fg={colors.primary}>↑/↓</span> Navigate ·{" "}
          <span fg={colors.primary}>enter</span> Select ·{" "}
          <span fg={colors.primary}>esc</span> to cancel
        </text>
      </box>
    </box>
  );
}