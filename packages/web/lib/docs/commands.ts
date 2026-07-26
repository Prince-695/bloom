export type DocsCommand = {
  name: string;
  value: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  steps: string[];
  notes?: string[];
  related?: string[];
};

export const DOCS_COMMANDS: DocsCommand[] = [
  {
    name: "new",
    value: "/new",
    summary: "Start a new conversation",
    description:
      "Leaves the current session view and returns you to the home prompt so you can begin a fresh conversation. Your previous sessions remain available via /sessions.",
    requiresAuth: true,
    steps: [
      "Type /new in the input bar (or pick it from the command menu).",
      "Press Enter to run the command.",
      "You land on the home screen ready for a new prompt.",
    ],
    related: ["/sessions", "/agents", "/models"],
  },
  {
    name: "me",
    value: "/me",
    summary: "Show your account info",
    description:
      "Opens the Account dialog with your name, email, verification status, member-since date, and remaining prompt quota. This view is local/API lookup only — it does not consume a prompt request.",
    requiresAuth: true,
    steps: [
      "Ensure you are signed in (run /login first if needed).",
      "Type /me and press Enter.",
      "Review the Account dialog, then press Escape to close.",
    ],
    notes: [
      "If you are not signed in, Bloom shows: Not signed in — run /login first.",
      "Requests are shown as remaining/limit (for example 7/10 remaining).",
    ],
    related: ["/login", "/logout", "/docs/quota"],
  },
  {
    name: "agents",
    value: "/agents",
    summary: "Switch agents (Build / Plan)",
    description:
      "Opens the agent picker so you can switch between Build mode and Plan mode. Modes change which tools the agent may use and how it behaves. You can also toggle modes with Tab in the input bar.",
    requiresAuth: true,
    steps: [
      "Type /agents and press Enter.",
      "Select Build or Plan from the dialog.",
      "The footer and input border update to reflect the active mode.",
    ],
    notes: [
      "Build can read and write files and run shell commands.",
      "Plan is read-only analysis and planning — no file modifications.",
      "Tab is a faster shortcut for the same mode toggle.",
    ],
    related: ["/docs/modes", "/docs/tools", "/docs/keyboard"],
  },
  {
    name: "models",
    value: "/models",
    summary: "Select AI model for generation",
    description:
      "Opens the model picker listing every supported chat model. The selected model is used for subsequent prompts in the current CLI session until you change it again.",
    requiresAuth: true,
    steps: [
      "Type /models and press Enter.",
      "Search or arrow-navigate to a model id.",
      "Press Enter to select it. The footer shows the active model.",
    ],
    notes: [
      "Default model is gpt-5.4-nano when nothing else is selected.",
      "Providers include Anthropic, OpenAI, and Google.",
    ],
    related: ["/docs/models"],
  },
  {
    name: "sessions",
    value: "/sessions",
    summary: "Browse past sessions",
    description:
      "Opens a searchable list of your past chat sessions. Selecting one navigates into that session so you can continue the conversation.",
    requiresAuth: true,
    steps: [
      "Type /sessions and press Enter.",
      "Type to filter by session title, or use ↑ / ↓ to move.",
      "Press Enter to open the highlighted session.",
    ],
    notes: [
      "Sessions are stored on the Bloom API for your account.",
      "Use /new when you want an entirely fresh conversation instead.",
    ],
    related: ["/new", "/docs/sessions"],
  },
  {
    name: "theme",
    value: "/theme",
    summary: "Change color theme",
    description:
      "Opens the theme picker. Choosing a theme updates the TUI immediately and persists the preference to ~/.bloom/preferences.json so it survives restarts.",
    requiresAuth: true,
    steps: [
      "Type /theme and press Enter.",
      "Search or browse available themes (Bloom, Nightfox, Dracula, …).",
      "Press Enter to apply. The UI recolors instantly.",
    ],
    notes: [
      "Default theme is Bloom (rose terminal palette).",
      "Preference file: ~/.bloom/preferences.json → { \"themeName\": \"…\" }.",
    ],
    related: ["/docs/themes"],
  },
  {
    name: "login",
    value: "/login",
    summary: "Sign in with your browser",
    description:
      "Starts the CLI device login flow. Bloom opens your browser to the CLI-gated auth page, you complete Email OTP / Google / GitHub there, and a token is written to ~/.bloom/auth.json. There is no public sign-in link on the marketing site — auth is only opened by this command.",
    requiresAuth: false,
    steps: [
      "Type /login and press Enter.",
      "Bloom shows Opening browser to sign in… and launches the auth page.",
      "Complete Email OTP, Google, or GitHub in the browser.",
      "When the callback succeeds, return to the TUI — you should see Signed in.",
    ],
    notes: [
      "Login times out after 5 minutes if the browser step is not completed.",
      "Works without an existing session (along with /logout, /update, and /exit).",
      "Auth file permissions: directory 0700, file 0600.",
    ],
    related: ["/logout", "/me", "/update", "/docs/auth"],
  },
  {
    name: "logout",
    value: "/logout",
    summary: "Sign out of your account",
    description:
      "Revokes the CLI token on the API when possible, then deletes the local auth file. Usage/quota display refreshes afterward. Safe to run even if the remote revoke call fails — local credentials are still cleared.",
    requiresAuth: false,
    steps: [
      "Type /logout and press Enter.",
      "Bloom clears ~/.bloom/auth.json and shows Signed out…",
      "Run /login again to switch accounts or reconnect.",
    ],
    related: ["/login", "/me", "/docs/auth"],
  },
  {
    name: "update",
    value: "/update",
    summary: "Update Bloom CLI to the latest release",
    description:
      "Checks GitHub Releases for a newer Bloom CLI binary for your OS/arch, downloads it, and replaces the installed executable. Works without being signed in. After a successful update, restart Bloom so the new binary loads.",
    requiresAuth: false,
    steps: [
      "Type /update and press Enter.",
      "Bloom shows Checking for updates… then downloads if a newer version exists.",
      "On success you see Updated to X.Y.Z — restart Bloom.",
      "Quit with /exit (or Ctrl+C) and run bloom again.",
    ],
    notes: [
      "If you are already on the latest release: Already on X.Y.Z.",
      "On launch, Bloom may toast vX.Y.Z available — run /update when a newer release exists (soft notice only — it does not auto-replace).",
      "Disable update checks and /update with BLOOM_NO_UPDATE=1.",
      "Release assets look like bloom-macos-arm64-0.1.2 (versioned per GitHub Release tag).",
      "You can also re-run the curl/irm installer from the Install docs to get the latest binary.",
    ],
    related: ["/docs/install", "/exit"],
  },
  {
    name: "exit",
    value: "/exit",
    summary: "Quit the application",
    description:
      "Cleanly exits the Bloom TUI process. Equivalent to quitting the app when no keyboard layer consumes Ctrl+C.",
    requiresAuth: false,
    steps: [
      "Type /exit and press Enter.",
      "The terminal UI shuts down and you return to your shell.",
    ],
    notes: [
      "Ctrl+C clears the input first if it has text; a second Ctrl+C (or /exit) quits when nothing else handles it.",
    ],
    related: ["/docs/keyboard"],
  },
];
