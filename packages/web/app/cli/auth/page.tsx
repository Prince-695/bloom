import { Suspense } from "react";
import { CliAuthHandoff } from "@/components/auth/cli-auth-handoff";
import { Spinner } from "@/components/ui/spinner";

export default function CliAuthPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Suspense fallback={<Spinner />}>
        <CliAuthHandoff />
      </Suspense>
    </main>
  );
}
