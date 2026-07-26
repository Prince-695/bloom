# Manual setup checklist (Bloom)

Do these outside the codebase. Code expects the env vars in `.env.example`.

Auth methods: **Google**, **GitHub**, and **Email OTP** (no passwords). OTP emails are sent via SMTP.

## Install CLI (production)

Same style as Claude — install from the Bloom web host (not raw GitHub):

**Linux / macOS / Git Bash**

```bash
curl -fsSL https://bloom-web-amber.vercel.app/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://bloom-web-amber.vercel.app/install.ps1 | iex
```

This installs `bloom` to `~/.local/bin` (or `%USERPROFILE%\.local\bin` on Windows). Then:

```bash
bloom
# in the TUI:
/login
/update   # when a newer release is available
```

- Installer files are served from the web app `public/` (`/install.sh`, `/install.ps1`)
- Binaries download from **GitHub Releases** (one release per version tag)
- Soft notice on launch if a newer version exists: `vX.Y.Z available — run /update`
- `/update` downloads and replaces the binary (opt out: `BLOOM_NO_UPDATE=1`)
- Auth file: `~/.bloom/auth.json`
- Uninstall: `rm ~/.local/bin/bloom` (Windows: delete `%USERPROFILE%\.local\bin\bloom.exe`)
- Override backends: `API_URL=https://… APP_URL=https://… bloom`

### Release asset naming

Each Git tag (`v0.1.1`, `v0.1.2`, …) creates a **separate** GitHub Release. Assets are versioned:

| Platform | Example (0.1.2) |
|----------|-----------------|
| macOS Apple Silicon | `bloom-macos-arm64-0.1.2` |
| Linux x64 | `bloom-linux-x64-0.1.2` |
| Linux arm64 | `bloom-linux-arm64-0.1.2` |
| Windows x64 | `bloom-windows-x64-0.1.2.exe` |

Intel Mac and Windows ARM64 are not shipped yet. Installers match by prefix (e.g. `bloom-macos-arm64-`) under `/releases/latest`.

### Publish a CLI release (maintainers)

```bash
# 1. Bump packages/cli/src/lib/brand.ts → PRODUCT_VERSION = "0.1.2"
# 2. Commit, then:
bun run build:cli:release   # optional local smoke

git tag v0.1.2
git push origin main
git push origin v0.1.2
# GitHub Action "Release CLI" uploads versioned binaries to Release v0.1.2
# Redeploy web if install.sh / install.ps1 changed
```

Smoke after install:

| Check | Pass |
|-------|------|
| Cold install | `bloom` runs |
| Login | `/login` opens Vercel `/cli/auth` |
| Update notice | Toast when a newer tag exists |
| `/update` | Replaces binary; restart Bloom |
| Account switch | `/logout` then `/login` as another user |
| Auth gate | Other commands need login |
| `/me` | Account dialog loads |
| Override | `API_URL=http://localhost:3000 bloom` hits local API |

## 1. Secrets & local env

- [ ] Copy `.env.example` → `.env` (repo root; Prisma and server load it)
- [ ] Generate Better Auth secret: `openssl rand -base64 32` → `BETTER_AUTH_SECRET`
- [ ] Set `DATABASE_URL` to your Postgres connection string
- [ ] Set `BETTER_AUTH_URL=http://localhost:3001` (must match the web origin; Next rewrites auth to the API)
- [ ] Set `APP_URL=http://localhost:3001`, `API_URL=http://localhost:3000`
- [ ] Mirror `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_API_URL` for the web package

## 2. Database migration

- [ ] Ensure Postgres is running
- [ ] From `packages/database`: `bunx prisma migrate dev --name auth_and_prompt_quota`
- [ ] Confirm tables: `user`, `session`, `account`, `verification`, `chat_sessions`, `cli_auth_codes`, `api_tokens`, `user_quotas`
- [ ] Note: each account gets **10 prompts total** across all sessions (`PROMPT_REQUEST_LIMIT`)

## 3. Google OAuth (optional but recommended)

- [ ] Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client (Web)
- [ ] Authorized redirect URI: `http://localhost:3001/api/auth/callback/google` (prod: `https://<APP_URL>/api/auth/callback/google`)
- [ ] Put Client ID/Secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

## 4. GitHub OAuth (optional)

- [ ] GitHub → Settings → Developer settings → OAuth Apps
- [ ] Callback: `http://localhost:3001/api/auth/callback/github`
- [ ] Set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

## 5. SMTP (required for Email OTP)

- [ ] Choose an SMTP provider (Gmail App Password, Mailtrap, etc.)
- [ ] Set:
  - `SMTP_HOST` (e.g. `smtp.gmail.com`)
  - `SMTP_PORT` (`587` STARTTLS or `465` TLS)
  - `SMTP_SECURE` (`false` for 587, `true` for 465)
  - `SMTP_USER` / `SMTP_PASS`
  - `EMAIL_FROM` (e.g. `"Bloom <you@gmail.com>"`)
- [ ] Remove any leftover `EMAILJS_*` keys from `.env`

## 6. Run locally after env is set

```bash
bun run db:generate
bun run dev:server   # :3000
bun run dev:web      # :3001
bun run dev:cli
```

- [ ] Open `http://localhost:3001/login`, enter email → receive OTP → verify
- [ ] Or continue with Google / GitHub
- [ ] In CLI, run login → browser `/cli/auth` → returns token to `~/.bloom/auth.json`
- [ ] Footer should show `10/10 requests remaining · <model> · Build`

## 7. Production

- [ ] Deploy API + web + Postgres
- [ ] Update OAuth redirect URLs and SMTP credentials for production
- [ ] Tag a `v*` release so the site installers (`/install.sh`, `/install.ps1`) can download CLI binaries
