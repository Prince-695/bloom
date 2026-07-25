import { createHash } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { db } from "@bloom/database/client";

export type AuthenticatedEnv = {
  Variables: {
    userId: string;
  };
};

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Authenticate CLI/API requests via Bloom ApiToken bearer. */
export const requireAuth: MiddlewareHandler<AuthenticatedEnv> = async (c, next) => {
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
    data: { lastUsedAt: new Date() },
  });

  c.set("userId", apiToken.userId);
  await next();
};
