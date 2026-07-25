import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserQuota } from "../lib/quota";
import type { AuthenticatedEnv } from "./require-auth";

export const requireRequestQuota: MiddlewareHandler<AuthenticatedEnv> = async (c, next) => {
  const userId = c.get("userId");
  const quota = await getUserQuota(userId);

  if (quota.remaining <= 0) {
    throw new HTTPException(402, {
      message: `Request limit reached (${quota.limit}/${quota.limit}). No prompts remaining.`,
    });
  }

  await next();
};
