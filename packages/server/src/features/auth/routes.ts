import { createHash, randomBytes } from "node:crypto";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@bloom/database/client";
import { auth } from "../../integrations/better-auth";

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const createCliCodeSchema = z.object({
  state: z.string().min(1),
});

const exchangeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

/**
 * CLI handoff routes (web session → one-time code → API bearer token).
 */
const app = new Hono()
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
      const code = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await db.cliAuthCode.create({
        data: {
          userId: session.user.id,
          codeHash: hashToken(code),
          state,
          expiresAt,
        },
      });

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
  );

export default app;
