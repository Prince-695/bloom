import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "CLI sign-in",
  description: "Bloom CLI authentication handoff.",
  robots: {
    index: false,
    follow: false,
  },
};

/** CLI-triggered only — not linked from the public site. */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6">
      <BackgroundBeams className="opacity-35" />
      <div className="relative z-10">
        <Suspense fallback={<Spinner />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
