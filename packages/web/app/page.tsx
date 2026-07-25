import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Bloom</h1>
        <p className="text-sm text-muted-foreground">
          Terminal-first AI coding agent. Sign in with email OTP, Google, or
          GitHub to connect the CLI.
        </p>
      </div>
      <Button render={<Link href="/login" />}>Sign in</Button>
    </main>
  );
}
