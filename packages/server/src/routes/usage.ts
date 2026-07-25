import { Hono } from "hono";
import type { AuthenticatedEnv } from "../middleware/require-auth";
import { getUserQuota } from "../lib/quota";

const app = new Hono<AuthenticatedEnv>().get("/", async (c) => {
  const userId = c.get("userId");
  return c.json(await getUserQuota(userId));
});

export default app;
