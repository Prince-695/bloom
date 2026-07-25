import { db } from "@bloom/database/client";
import { PROMPT_REQUEST_LIMIT } from "@bloom/shared";

export async function getUserQuota(userId: string) {
  const quota = await db.userQuota.findUnique({
    where: { userId },
  });

  const used = quota?.requestCount ?? 0;
  const remaining = Math.max(0, PROMPT_REQUEST_LIMIT - used);

  return {
    used,
    limit: PROMPT_REQUEST_LIMIT,
    remaining,
  };
}

/**
 * Atomically consume one prompt if under the limit.
 * Returns updated quota, or null if the user is out of requests.
 */
export async function tryConsumePrompt(userId: string) {
  return db.$transaction(async (tx) => {
    const existing = await tx.userQuota.findUnique({ where: { userId } });
    const used = existing?.requestCount ?? 0;

    if (used >= PROMPT_REQUEST_LIMIT) {
      return null;
    }

    const quota = await tx.userQuota.upsert({
      where: { userId },
      create: { userId, requestCount: 1 },
      update: { requestCount: { increment: 1 } },
    });

    return {
      used: quota.requestCount,
      limit: PROMPT_REQUEST_LIMIT,
      remaining: Math.max(0, PROMPT_REQUEST_LIMIT - quota.requestCount),
    };
  });
}
