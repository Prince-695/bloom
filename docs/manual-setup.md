# Manual setup checklist (Bloom)

Do these outside the codebase. Code expects the env vars in `.env.example`.

Auth methods: **Google**, **GitHub**, and **Email OTP** (no passwords). OTP emails are sent via SMTP.

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

## 7. Production (later)

- [ ] Deploy API + web + Postgres
- [ ] Update OAuth redirect URLs and SMTP credentials for production
