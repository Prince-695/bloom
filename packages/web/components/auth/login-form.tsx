"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GalleryVerticalEndIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
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
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEndIcon />
        </div>
        <CardTitle>Sign in to Bloom</CardTitle>
        <CardDescription>
          {step === "email"
            ? "Continue with email, Google, or GitHub"
            : `Enter the code sent to ${email}`}
        </CardDescription>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? <Spinner data-icon="inline-start" /> : null}
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
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>
                  Didn&apos;t get it?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    disabled={pending}
                    onClick={() => void requestOtp()}
                  >
                    Resend code
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={pending || otp.length < 6} className="w-full">
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
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGitHub}
              >
                Continue with GitHub
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="justify-center">
        <FieldDescription>
          New here? Enter your email — we&apos;ll create your account when you
          verify the code.
        </FieldDescription>
      </CardFooter>
    </Card>
  );
}
