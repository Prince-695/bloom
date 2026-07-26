export const SITE_NAME = "Bloom";

export const SITE_TAGLINE =
  "Terminal-first AI coding agent. Install the CLI and work where you already are.";

export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  process.env.APP_URL?.replace(/\/$/, "") ??
  "https://bloom-web-amber.vercel.app";

export const INSTALL_UNIX = `curl -fsSL ${APP_ORIGIN}/install.sh | bash`;
export const INSTALL_WINDOWS = `irm ${APP_ORIGIN}/install.ps1 | iex`;

export const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/install", label: "Install" },
] as const;
