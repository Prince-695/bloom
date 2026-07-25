"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GalleryVerticalEndIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CliAuthHandoff() {
  const searchParams = useSearchParams();
  const port = searchParams.get("port");
  const state = searchParams.get("state");
  const [status, setStatus] = useState<"loading" | "redirecting" | "error" | "need-login">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!port || !state) {
        setStatus("error");
        setError("Missing port or state from the CLI.");
        return;
      }

      const session = await authClient.getSession();
      if (cancelled) return;

      if (!session.data?.user) {
        setStatus("need-login");
        return;
      }

      setStatus("redirecting");

      // Same-origin via Next rewrite so Better Auth cookies are included
      const res = await fetch("/auth/cli/code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus("error");
        setError(body?.error ?? "Failed to create CLI auth code");
        return;
      }

      const { code } = (await res.json()) as { code: string };
      const callback = new URL(`http://127.0.0.1:${port}/callback`);
      callback.searchParams.set("code", code);
      callback.searchParams.set("state", state);
      window.location.href = callback.toString();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [port, state]);

  const next = `/cli/auth?port=${encodeURIComponent(port ?? "")}&state=${encodeURIComponent(state ?? "")}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEndIcon />
        </div>
        <CardTitle>Connect Bloom CLI</CardTitle>
        <CardDescription>
          {status === "need-login"
            ? "Sign in to authorize the CLI on this machine."
            : status === "redirecting"
              ? "Returning you to the terminal…"
              : status === "error"
                ? "Something went wrong."
                : "Checking your session…"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {(status === "loading" || status === "redirecting") && <Spinner />}
        {status === "need-login" && (
          <Button render={<Link href={`/login?next=${encodeURIComponent(next)}`} />}>
            Sign in
          </Button>
        )}
        {status === "error" && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
        {status === "redirecting" && (
          <p className="text-center text-sm text-muted-foreground">
            You can close this tab and return to Bloom.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
