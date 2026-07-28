import { APP_ORIGIN, INSTALL_UNIX, INSTALL_WINDOWS } from "@/lib/site";

export const DOCS_INSTALL = {
  unix: INSTALL_UNIX,
  windows: INSTALL_WINDOWS,
  origin: APP_ORIGIN,
  binUnix: "~/.local/bin/bloom",
  binWindows: "%USERPROFILE%\\.local\\bin\\bloom.exe",
  authFile: "~/.bloom/auth.json",
  preferencesFile: "~/.bloom/preferences.json",
  platforms: [
    "bloom-linux-x64-<version>",
    "bloom-linux-arm64-<version>",
    "bloom-macos-arm64-<version>",
    "bloom-windows-x64-<version>.exe",
  ] as const,
  unsupported: ["macos Intel (x64)", "windows-arm64"] as const,
};

export const DOCS_MODELS = [
  { id: "gemini-3.5-flash", provider: "Google", note: "Default — Gemini Flash with thinking" },
  { id: "gemini-2.5-flash", provider: "Google", note: "Gemini Flash" },
  { id: "openai/gpt-oss-120b", provider: "Groq", note: "GPT-OSS 120B reasoning (high effort)" },
  { id: "openai/gpt-oss-20b", provider: "Groq", note: "GPT-OSS 20B reasoning (high effort)" },
  { id: "qwen/qwen3.6-27b", provider: "Groq", note: "Qwen 3.6 27B reasoning" },
  { id: "llama-3.3-70b-versatile", provider: "Groq", note: "Llama 3.3 70B" },
] as const;

/** Primary accent per CLI theme — used for docs capsules. */
export const DOCS_THEMES = [
  { name: "Bloom", primary: "#FFB7C5" },
  { name: "Nightfox", primary: "#56D6C2" },
  { name: "Catppuccin Mocha", primary: "#E0AF68" },
  { name: "Dracula", primary: "#BD93F9" },
  { name: "Monokai Pro", primary: "#FFD866" },
  { name: "Tokyo Night", primary: "#7AA2F7" },
  { name: "Nord", primary: "#EBCB8B" },
  { name: "Synthwave", primary: "#F472B6" },
  { name: "Midnight Sky", primary: "#6AAEF5" },
  { name: "Neon Nights", primary: "#E86ACA" },
  { name: "Hacker Terminal", primary: "#00E5A0" },
  { name: "One Dark", primary: "#CBAACB" },
  { name: "Xcode Midnight", primary: "#FF7AB2" },
  { name: "Catppuccin Frappe", primary: "#8CAAEE" },
  { name: "Vercel Dark", primary: "#8B5CF6" },
  { name: "Material Ocean", primary: "#82AAFF" },
  { name: "Dusk", primary: "#C9A0DC" },
  { name: "Ocean", primary: "#3B9ECF" },
  { name: "Soft Midnight", primary: "#60A5FA" },
  { name: "Minimal Dark", primary: "#A78BFA" },
  { name: "Solarized Dark", primary: "#268BD2" },
  { name: "Gruvbox Dark", primary: "#FABD2F" },
  { name: "Rosé Pine", primary: "#EBBCBA" },
  { name: "Rosé Pine Moon", primary: "#EA9A97" },
  { name: "Kanagawa", primary: "#DCD7BA" },
  { name: "Everforest Dark", primary: "#A7C080" },
  { name: "Ayu Dark", primary: "#E6B450" },
  { name: "GitHub Dark", primary: "#79C0FF" },
  { name: "Palenight", primary: "#82AAFF" },
  { name: "Vesper", primary: "#FFC799" },
  { name: "Poimandres", primary: "#ADD7FF" },
  { name: "Moonlight", primary: "#82AAFF" },
  { name: "Vitesse Dark", primary: "#4FC1FF" },
] as const;

export const DOCS_TOOLS = {
  plan: [
    {
      name: "readFile",
      description: "Read a file from the current project directory.",
      inputs: "path — relative path to the file",
    },
    {
      name: "listDirectory",
      description: "List entries in a directory under the project root.",
      inputs: "path — relative directory (default .)",
    },
    {
      name: "glob",
      description: "Find files matching a glob pattern.",
      inputs: "pattern, path (default .)",
    },
    {
      name: "grep",
      description: "Search file contents with a regular expression.",
      inputs: "pattern, path (default .), include (optional glob)",
    },
  ],
  buildOnly: [
    {
      name: "writeFile",
      description: "Create or overwrite a file under the project root.",
      inputs: "path, content",
    },
    {
      name: "editFile",
      description:
        "Replace exact text in a file. oldString must be unique in the file.",
      inputs: "path, oldString, newString",
    },
    {
      name: "bash",
      description: "Run a shell command in the project directory.",
      inputs: "command, description (optional), timeout ms (optional, default 30000)",
    },
  ],
  limits: [
    "Paths are sandboxed to the current working directory — escapes outside the project are rejected.",
    "readFile truncates very large files (~10k chars).",
    "glob caps results (~200 files); grep caps matches (~50).",
    "bash output is truncated (~20k chars) and defaults to a 30s timeout.",
    "listDirectory skips dotfiles and node_modules.",
  ],
} as const;

export const DOCS_SHORTCUTS = [
  {
    keys: ["/"],
    action: "Open the slash-command menu (type to filter)",
  },
  {
    keys: ["Enter"],
    action: "Run selected command, accept mention, or send the prompt",
  },
  {
    keys: ["Shift", "Enter"],
    action: "Insert a newline in the prompt (does not send)",
  },
  {
    keys: ["Tab"],
    action: "Toggle Build ↔ Plan mode",
  },
  {
    keys: ["↑", "↓"],
    action: "Move selection in command menu, mention menu, or dialogs",
  },
  {
    keys: ["Escape"],
    action: "Close menus/dialogs, or interrupt a streaming reply",
  },
  {
    keys: ["Ctrl", "C"],
    action: "Clear the input if it has text; otherwise quit Bloom",
  },
  {
    keys: ["@"],
    action: "Open file/folder mention picker from the project tree",
  },
] as const;

export const PROMPT_LIMIT = 10;
