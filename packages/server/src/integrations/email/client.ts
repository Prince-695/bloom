import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

export function isSmtpConfigured() {
  return getSmtpConfig() !== null;
}

function createTransport() {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and EMAIL_FROM.",
    );
  }

  const options: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  };

  return { transport: nodemailer.createTransport(options), from: config.from };
}

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendMail({ to, subject, text, html }: SendMailParams) {
  const { transport, from } = createTransport();
  await transport.sendMail({ from, to, subject, text, html });
}

export async function sendOtpEmail({ to, otp }: { to: string; otp: string }) {
  const subject = "Your Bloom sign-in code";
  const text = `Your Bloom sign-in code is ${otp}. It expires shortly. If you didn't request this, you can ignore this email.`;
  const html = `
    <p>Your Bloom sign-in code is:</p>
    <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${otp}</p>
    <p>It expires shortly. If you didn't request this, you can ignore this email.</p>
    <p>— Bloom</p>
  `;

  await sendMail({ to, subject, text, html });
}
