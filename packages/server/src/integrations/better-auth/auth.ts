import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins/email-otp";
import { db } from "@bloom/database/client";
import { isSmtpConfigured, sendOtpEmail } from "../email";

if (!isSmtpConfigured()) {
  console.warn(
    "[better-auth] SMTP env vars missing — email OTP will fail until SMTP_* and EMAIL_FROM are set.",
  );
}

/**
 * Better Auth: Google, GitHub, and email OTP only (no passwords).
 */
export const auth = betterAuth({
  appName: "Bloom",
  baseURL: process.env.APP_URL ?? "http://localhost:3001",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        if (!isSmtpConfigured()) {
          throw new Error(
            "Email OTP is unavailable: SMTP is not configured on the server.",
          );
        }
        await sendOtpEmail({ to: email, otp });
      },
    }),
  ],
  trustedOrigins: [process.env.APP_URL ?? "http://localhost:3001"].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
