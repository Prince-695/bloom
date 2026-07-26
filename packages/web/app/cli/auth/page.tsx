import { Suspense } from "react";

import { CliAuthHandoff } from "@/components/auth/cli-auth-handoff";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "CLI auth",
  description: "Connect the Bloom CLI to your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CliAuthPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <BackgroundBeams className="opacity-30" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<Spinner />}>
          <CliAuthHandoff />
        </Suspense>
      </div>
    </main>
  );
}
