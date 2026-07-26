"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailIcon } from "lucide-react";
import { toast } from "sonner";

import { GitHubIcon, GoogleIcon } from "@/components/auth/oauth-icons";
import { BloomLogo } from "@/components/site/bloom-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { Spotlight } from "@/components/ui/spotlight";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);

  const next = searchParams.get("next") ?? "/";

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
      setStep("otp");
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

    const { error } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    setPending(false);

    if (error) {
      toast.error(error.message ?? "Invalid or expired code");
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
    });
  }

  async function signInWithGitHub() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: next,
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <Spotlight
        className="-top-28 left-10 h-[120%] w-[140%]"
        fill="#FF85A1"
      />
      <Card className="bloom-brutal relative overflow-hidden rounded-xl bg-bloom-surface/95 shadow-none bloom-emboss">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-bloom-plan via-primary to-bloom-gold" />
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <BloomLogo href="/" size={44} />
          <div className="flex flex-col gap-1">
            <CardTitle className="font-display text-2xl font-bold">
              Sign in to Bloom
            </CardTitle>
            <CardDescription>
              {step === "email"
                ? "Continue with email, Google, or GitHub"
                : `Enter the code sent to ${email}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === "email" ? (
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@studio.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bloom-inset border-2"
                  />
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                disabled={pending}
                className="w-full bloom-emboss"
              >
                {pending ? <Spinner data-icon="inline-start" /> : <MailIcon data-icon="inline-start" />}
                Continue with email
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">One-time code</FieldLabel>
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={pending}
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
                      disabled={pending}
                      onClick={() => void requestOtp()}
                    >
                      Resend code
                    </button>
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                disabled={pending || otp.length < 6}
                className="w-full bloom-emboss"
              >
                {pending ? <Spinner data-icon="inline-start" /> : null}
                Verify and sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={pending}
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
              >
                Use a different email
              </Button>
            </form>
          )}

          {step === "email" ? (
            <>
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-bloom-separator" />
                <span className="font-mono text-xs text-muted-foreground">
                  or
                </span>
                <Separator className="flex-1 bg-bloom-separator" />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bloom-brutal-sm"
                  onClick={signInWithGoogle}
                >
                  <GoogleIcon data-icon="inline-start" />
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bloom-brutal-sm"
                  onClick={signInWithGitHub}
                >
                  <GitHubIcon data-icon="inline-start" />
                  Continue with GitHub
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
        <CardFooter className="justify-center">
          <Alert className="border-2 border-border bg-bloom-dialog">
            <AlertDescription>
              New here? Enter your email — we&apos;ll create your account when
              you verify the code.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}
