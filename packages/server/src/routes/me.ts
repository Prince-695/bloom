import { Hono } from "hono";
import { db } from "@bloom/database/client";
import type { AuthenticatedEnv } from "../middleware/require-auth";
import { getUserQuota } from "../lib/quota";

const app = new Hono<AuthenticatedEnv>().get("/", async (c) => {
  const userId = c.get("userId");
  const [user, quota] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
      },
    }),
    getUserQuota(userId),
  ]);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    user,
    usage: quota,
  });
});

export default app;
