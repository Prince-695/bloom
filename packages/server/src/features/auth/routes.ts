import { createHash, randomBytes } from "node:crypto";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@bloom/database/client";
import { auth } from "../../integrations/better-auth";

const CLI_AUTH_TTL_MS = 5 * 60 * 1000;

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const beginSchema = z.object({
  state: z.string().min(1),
});

const createCliCodeSchema = z.object({
  state: z.string().min(1),
});

const exchangeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

async function getActiveAttempt(state: string) {
  const attempt = await db.cliAuthAttempt.findUnique({ where: { state } });
  if (!attempt || attempt.consumedAt || attempt.expiresAt < new Date()) {
    return null;
  }
  return attempt;
}

/**
 * CLI handoff routes (CLI challenge → web session → one-time code → API bearer).
 */
const app = new Hono()
  .post(
    "/cli/begin",
    zValidator("json", beginSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid request body" }, 400);
      }
    }),
    async (c) => {
      const { state } = c.req.valid("json");
      const expiresAt = new Date(Date.now() + CLI_AUTH_TTL_MS);

      await db.cliAuthAttempt.upsert({
        where: { state },
        create: { state, expiresAt },
        update: { expiresAt, consumedAt: null },
      });

      return c.json({ ok: true, expiresAt: expiresAt.toISOString() });
    },
  )
  .get("/cli/begin", async (c) => {
    const state = c.req.query("state");
    if (!state) {
      return c.json({ active: false, error: "Missing state" }, 400);
    }

    const attempt = await getActiveAttempt(state);
    if (!attempt) {
      return c.json({ active: false });
    }

    return c.json({
      active: true,
      expiresAt: attempt.expiresAt.toISOString(),
    });
  })
  .post(
    "/cli/code",
    zValidator("json", createCliCodeSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid request body" }, 400);
      }
    }),
    async (c) => {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session?.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { state } = c.req.valid("json");
      const attempt = await getActiveAttempt(state);
      if (!attempt) {
        return c.json({ error: "Invalid or expired CLI login challenge" }, 400);
      }

      const code = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + CLI_AUTH_TTL_MS);

      await db.$transaction([
        db.cliAuthAttempt.update({
          where: { id: attempt.id },
          data: { consumedAt: new Date() },
        }),
        db.cliAuthCode.create({
          data: {
            userId: session.user.id,
            codeHash: hashToken(code),
            state,
            expiresAt,
          },
        }),
      ]);

      return c.json({ code, expiresAt: expiresAt.toISOString() });
    },
  )
  .post(
    "/cli/exchange",
    zValidator("json", exchangeSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "Invalid request body" }, 400);
      }
    }),
    async (c) => {
      const { code, state } = c.req.valid("json");
      const codeHash = hashToken(code);

      const record = await db.cliAuthCode.findUnique({
        where: { codeHash },
      });

      if (!record || record.usedAt || record.state !== state || record.expiresAt < new Date()) {
        return c.json({ error: "Invalid or expired code" }, 400);
      }

      await db.cliAuthCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      const token = randomBytes(32).toString("base64url");
      await db.apiToken.create({
        data: {
          userId: record.userId,
          tokenHash: hashToken(token),
          label: "cli",
        },
      });

      return c.json({
        token,
        userId: record.userId,
      });
    },
  )
  .post("/cli/logout", async (c) => {
    const authorization = c.req.header("Authorization");
    const bearer = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;

    if (!bearer) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const apiToken = await db.apiToken.findUnique({
      where: { tokenHash: hashToken(bearer) },
    });

    if (!apiToken || apiToken.revokedAt) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await db.apiToken.update({
      where: { id: apiToken.id },
      data: { revokedAt: new Date() },
    });

    return c.json({ ok: true });
  });

export default app;
