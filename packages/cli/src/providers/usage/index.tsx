import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PROMPT_REQUEST_LIMIT } from "@bloom/shared";
import { apiClient } from "../../lib/api-client";
import { getAuth } from "../../lib/auth";

type UsageState = {
  used: number;
  limit: number;
  remaining: number;
};

type UsageContextValue = UsageState & {
  refresh: () => Promise<void>;
};

const UsageContext = createContext<UsageContextValue | null>(null);

const DEFAULT_USAGE: UsageState = {
  used: 0,
  limit: PROMPT_REQUEST_LIMIT,
  remaining: PROMPT_REQUEST_LIMIT,
};

export function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageState>(DEFAULT_USAGE);

  const refresh = useCallback(async () => {
    if (!getAuth()) {
      setUsage(DEFAULT_USAGE);
      return;
    }

    try {
      const response = await apiClient.usage.$get();
      if (!response.ok) return;
      const data = await response.json();
      setUsage({
        used: data.used,
        limit: data.limit,
        remaining: data.remaining,
      });
    } catch {
      // Keep last known usage if the request fails
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <UsageContext.Provider value={{ ...usage, refresh }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) {
    throw new Error("useUsage must be used within UsageProvider");
  }
  return ctx;
}
