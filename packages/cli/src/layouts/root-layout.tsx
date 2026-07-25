import { useState, type ReactNode } from "react";
import { Outlet } from "react-router";
import { ToastProvider } from "../providers/toast";
import { DialogProvider } from "../providers/dialog";
import { KeyboardLayerProvider } from "../providers/keyboard-layer";
import { ThemeProvider } from "../providers/theme";
import { ThemedRoot } from "./themed-root";
import { PromptConfigProvider } from "../providers/prompt-config";
import { UsageProvider } from "../providers/usage";
import { WelcomeScreen } from "../components/welcome-screen";

function LaunchGate({ children }: { children: ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onDismiss={() => setShowWelcome(false)} />;
  }

  return children;
}

export function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <KeyboardLayerProvider>
          <DialogProvider>
            <PromptConfigProvider>
              <UsageProvider>
                <ThemedRoot>
                  <LaunchGate>
                    <Outlet />
                  </LaunchGate>
                </ThemedRoot>
              </UsageProvider>
            </PromptConfigProvider>
          </DialogProvider>
        </KeyboardLayerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
