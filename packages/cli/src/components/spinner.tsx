import { useState, useEffect } from "react";
import { useTheme } from "../providers/theme";

const PETAL_FRAMES = ["✼", "✻", "✺", "✹", "✸", "✷", "✶", "✽"];
const FRAME_MS = 110;

export function Spinner() {
  const { colors } = useTheme();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % PETAL_FRAMES.length);
    }, FRAME_MS);

    return () => clearInterval(timer);
  }, []);

  return <text fg={colors.primary}>{PETAL_FRAMES[frame]}</text>;
}
