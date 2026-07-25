import { useEffect, useState } from "react";
import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../../providers/theme";
import { apiClient } from "../../lib/api-client";
import { getErrorMessage } from "../../lib/http-errors";
import { Spinner } from "../spinner";

type AccountData = {
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string | Date;
  };
  usage: {
    remaining: number;
    limit: number;
  };
};

function formatMemberSince(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AccountBox({ data }: { data: AccountData }) {
  const { colors } = useTheme();
  const { width } = useTerminalDimensions();
  const innerWidth = Math.max(24, Math.min(56, width - 8));
  const horizontal = "─".repeat(innerWidth);

  const rows = [
    { label: "Name", value: data.user.name || "—" },
    { label: "Email", value: data.user.email },
    { label: "Verified", value: data.user.emailVerified ? "Yes" : "No" },
    { label: "Member since", value: formatMemberSince(data.user.createdAt) },
    {
      label: "Requests",
      value: `${data.usage.remaining}/${data.usage.limit} remaining`,
    },
  ];
  const labelWidth = Math.max(...rows.map((row) => row.label.length), 6);
  const footer = "Local info · no request used";

  return (
    <box width="100%" flexDirection="column" gap={0}>
      <text fg={colors.primary} attributes={TextAttributes.BOLD}>
        ┌{horizontal}┐
      </text>
      <text fg={colors.primary}>
        │{" "}
        <span attributes={TextAttributes.BOLD} fg={colors.foreground}>
          {"Account".padEnd(innerWidth - 1)}
        </span>
        │
      </text>
      <text fg={colors.primary}>├{horizontal}┤</text>
      {rows.map((row) => {
        const line = `${row.label.padEnd(labelWidth)}  ${row.value}`;
        const clipped =
          line.length > innerWidth - 1
            ? `${line.slice(0, Math.max(0, innerWidth - 4))}...`
            : line.padEnd(innerWidth - 1);
        return (
          <text key={row.label} fg={colors.primary}>
            │ <span fg={colors.foreground}>{clipped}</span>│
          </text>
        );
      })}
      <text fg={colors.primary}>├{horizontal}┤</text>
      <text fg={colors.primary}>
        │{" "}
        <span attributes={TextAttributes.DIM} fg={colors.muted}>
          {footer.padEnd(innerWidth - 1).slice(0, innerWidth - 1)}
        </span>
        │
      </text>
      <text fg={colors.primary}>└{horizontal}┘</text>
    </box>
  );
}

export function MeDialogContent() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await apiClient.me.$get();
        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }
        const json = await response.json();
        if (cancelled) return;
        setData(json);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load account");
        setStatus("error");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <box flexDirection="row" alignItems="center" gap={2} paddingTop={1}>
        <Spinner />
        <text attributes={TextAttributes.DIM} fg={colors.muted}>
          Loading account…
        </text>
      </box>
    );
  }

  if (status === "error" || !data) {
    return (
      <box paddingTop={1}>
        <text fg={colors.primary}>
          {error ?? "Failed to load account"}
        </text>
      </box>
    );
  }

  return (
    <box paddingTop={1}>
      <AccountBox data={data} />
    </box>
  );
}
