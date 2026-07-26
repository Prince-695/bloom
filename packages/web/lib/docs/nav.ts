export type DocsNavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export const DOCS_NAV: DocsNavItem[] = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/install", label: "Install" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/auth", label: "Authentication" },
  {
    href: "/docs/commands",
    label: "Commands",
    children: [
      { href: "/docs/commands#new", label: "/new" },
      { href: "/docs/commands#me", label: "/me" },
      { href: "/docs/commands#agents", label: "/agents" },
      { href: "/docs/commands#models", label: "/models" },
      { href: "/docs/commands#sessions", label: "/sessions" },
      { href: "/docs/commands#theme", label: "/theme" },
      { href: "/docs/commands#login", label: "/login" },
      { href: "/docs/commands#logout", label: "/logout" },
      { href: "/docs/commands#update", label: "/update" },
      { href: "/docs/commands#exit", label: "/exit" },
    ],
  },
  { href: "/docs/modes", label: "Modes" },
  { href: "/docs/models", label: "Models" },
  { href: "/docs/tools", label: "Tools" },
  { href: "/docs/themes", label: "Themes" },
  { href: "/docs/keyboard", label: "Keyboard" },
  { href: "/docs/mentions", label: "File mentions" },
  { href: "/docs/sessions", label: "Sessions" },
  { href: "/docs/quota", label: "Quota & usage" },
  { href: "/docs/configuration", label: "Configuration" },
  { href: "/docs/troubleshooting", label: "Troubleshooting" },
];
