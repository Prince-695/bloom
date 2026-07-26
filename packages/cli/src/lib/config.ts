/**
 * CLI runtime config.
 *
 * Priority: process.env (shell / .env via bin/bloom) → production defaults.
 * Compiled release binaries use these defaults when env vars are unset.
 */
const DEFAULT_API_URL = "https://bloom-u9mb.onrender.com";
const DEFAULT_APP_URL = "https://bloom-web-amber.vercel.app";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export const API_URL = stripTrailingSlash(
  process.env.API_URL?.trim() || DEFAULT_API_URL,
);

export const APP_URL = stripTrailingSlash(
  process.env.APP_URL?.trim() || DEFAULT_APP_URL,
);
