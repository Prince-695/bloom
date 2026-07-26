"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailIcon } from "lucide-react";
import { toast } from "sonner";

import { BloomLogo } from "@/components/site/bloom-logo";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";

type GateStatus = "checking" | "invalid" | "ready";
type View = "session" | "login";
type LoginStep = "email" | "otp";

type SessionUser = {
  name?: string | null;
  email?: string | null;
};

export function CliAuthHandoff() {
  const searchParams = useSearchParams();
  const port = searchParams.get("port");
  const state = searchParams.get("state");

  const [gate, setGate] = useState<GateStatus>("checking");
  const [view, setView] = useState<View>("login");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [handoffPending, setHandoffPending] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);

  const cliReturnPath =
    port && state
      ? `/cli/auth?port=${encodeURIComponent(port)}&state=${encodeURIComponent(state)}`
      : "/cli/auth";

  useEffect(() => {
    let cancelled = false;

    async function checkChallenge() {
      if (!port || !state) {
        setGate("invalid");
        return;
      }

      try {
        const res = await fetch(
          `/auth/cli/begin?state=${encodeURIComponent(state)}`,
          { credentials: "include" },
        );
        const body = (await res.json().catch(() => null)) as {
          active?: boolean;
        } | null;

        if (cancelled) return;

        if (!res.ok || !body?.active) {
          setGate("invalid");
          return;
        }

        const session = await authClient.getSession();
        if (cancelled) return;

        if (session.data?.user) {
          setSessionUser({
            name: session.data.user.name,
            email: session.data.user.email,
          });
          setView("session");
        } else {
          setView("login");
        }

        setGate("ready");
      } catch {
        if (!cancelled) setGate("invalid");
      }
    }

    void checkChallenge();
    return () => {
      cancelled = true;
    };
  }, [port, state]);

  const completeHandoff = useCallback(async () => {
    if (!port || !state) return;

    setHandoffPending(true);
    try {
      const res = await fetch("/auth/cli/code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to create CLI auth code");
      }

      const { code } = (await res.json()) as { code: string };
      const callback = new URL(`http://127.0.0.1:${port}/callback`);
      callback.searchParams.set("code", code);
      callback.searchParams.set("state", state);

      // Clear browser session so the next CLI login is not silently rebound.
      await authClient.signOut().catch(() => undefined);

      window.location.href = callback.toString();
    } catch (error) {
      setHandoffPending(false);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect CLI",
      );
    }
  }, [port, state]);

  async function requestOtp() {
    setPending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Failed to send code");
      return false;
    }

    toast.success("Check your email for a sign-in code");
    return true;
  }

  async function sendOtp(event: React.FormEvent) {
    event.preventDefault();
    const ok = await requestOtp();
    if (ok) {
      setLoginStep("otp");
      setOtp("");
    }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    if (otp.length < 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setPending(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Invalid or expired code");
      return;
    }

    await completeHandoff();
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: cliReturnPath,
    });
  }

  async function signInWithGitHub() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: cliReturnPath,
    });
  }

  async function useDifferentAccount() {
    setPending(true);
    await authClient.signOut();
    setSessionUser(null);
    setView("login");
    setLoginStep("email");
    setPending(false);
  }

  if (gate === "checking") {
    return (
      <AuthShell title="Connect Bloom CLI" description="Checking your CLI login link…">
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      </AuthShell>
    );
  }

  if (gate === "invalid") {
    return (
      <AuthShell
        title="CLI login unavailable"
        description={
          <>
            This page only works when started from the Bloom CLI. Run{" "}
            <span className="font-medium text-foreground">/login</span> in the
            terminal, then open the link it provides.
          </>
        }
      />
    );
  }

  if (view === "session" && sessionUser) {
    const label = sessionUser.name || sessionUser.email || "your account";
    return (
      <AuthShell
        title="Connect Bloom CLI"
        description={`Continue as ${label}, or choose a different account.`}
      >
        <div className="flex flex-col gap-2">
          <Button
            className="w-full bloom-emboss"
            disabled={handoffPending || pending}
            onClick={() => void completeHandoff()}
          >
            {handoffPending ? <Spinner data-icon="inline-start" /> : null}
            Continue as {label}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full bloom-brutal-sm"
            disabled={handoffPending || pending}
            onClick={() => void useDifferentAccount()}
          >
            Use a different account
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in to Bloom CLI"
      description={
        loginStep === "email"
          ? "Continue with email, Google, or GitHub"
          : `Enter the code sent to ${email}`
      }
      footer="Started from the Bloom CLI. Close this tab if you didn't mean to sign in."
    >
      {loginStep === "email" ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cli-email">Email</FieldLabel>
              <Input
                id="cli-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bloom-inset border-2"
              />
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            disabled={pending || handoffPending}
            className="w-full bloom-emboss"
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MailIcon data-icon="inline-start" />
            )}
            Continue with email
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cli-otp">One-time code</FieldLabel>
              <InputOTP
                id="cli-otp"
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={pending || handoffPending}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="bloom-brutal-sm" />
                  <InputOTPSlot index={1} className="bloom-brutal-sm" />
                  <InputOTPSlot index={2} className="bloom-brutal-sm" />
                  <InputOTPSlot index={3} className="bloom-brutal-sm" />
                  <InputOTPSlot index={4} className="bloom-brutal-sm" />
                  <InputOTPSlot index={5} className="bloom-brutal-sm" />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Didn&apos;t get it?{" "}
                <button
                  type="button"
                  className="font-semibold text-primary underline underline-offset-4"
                  disabled={pending || handoffPending}
                  onClick={() => void requestOtp()}
                >
                  Resend code
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            disabled={pending || handoffPending || otp.length < 6}
            className="w-full bloom-emboss"
          >
            {pending || handoffPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Verify and connect CLI
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={pending || handoffPending}
            onClick={() => {
              setLoginStep("email");
              setOtp("");
            }}
          >
            Use a different email
          </Button>
        </form>
      )}

      {loginStep === "email" ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-bloom-separator" />
            <span className="font-mono text-xs text-muted-foreground">or</span>
            <Separator className="flex-1 bg-bloom-separator" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bloom-brutal-sm"
              disabled={pending || handoffPending}
              onClick={() => void signInWithGoogle()}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bloom-brutal-sm"
              disabled={pending || handoffPending}
              onClick={() => void signInWithGitHub()}
            >
              Continue with GitHub
            </Button>
          </div>
        </>
      ) : null}
    </AuthShell>
  );
}

function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: React.ReactNode;
  footer?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="bloom-brutal relative w-full max-w-md overflow-hidden rounded-xl bg-bloom-surface/95 bloom-emboss">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-bloom-plan via-primary to-bloom-gold" />
      <CardHeader className="flex flex-col items-center gap-3 text-center">
        <BloomLogo href="/" size={40} />
        <div className="flex flex-col gap-1">
          <CardTitle className="font-display text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {children ? (
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      ) : null}
      {footer ? (
        <CardFooter className="justify-center">
          <FieldDescription>{footer}</FieldDescription>
        </CardFooter>
      ) : null}
    </Card>
  );
}
