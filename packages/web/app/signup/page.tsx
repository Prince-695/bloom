import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/** Signup is the same as login (email OTP auto-creates accounts). */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = params.next ? `?next=${encodeURIComponent(params.next)}` : "";
  redirect(`/login${next}`);
}
