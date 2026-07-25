import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
