import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  convertToModelMessages,
  streamText,
  validateUIMessages,
  type InferUITools,
  type LanguageModelUsage,
  type UIMessage,
} from "ai";
import { db } from "@bloom/database/client";
import type { Prisma } from "@bloom/database";
import {
  getToolContracts,
  modeSchema,
  type ModeType,
  type ToolContracts,
} from "@bloom/shared";
import { buildSystemPrompt } from "../runtime/prompt";
import type { AuthenticatedEnv } from "../middleware/require-auth";
import { tryConsumePrompt } from "../lib/quota";
import { isSupportedChatModel, resolveChatModel } from "../lib/models";

type ChatMessageMetadata = {
  mode?: ModeType;
  model?: string;
  durationMs?: number;
  usage?: LanguageModelUsage;
};

type bloomUIMessage = UIMessage<ChatMessageMetadata, never, InferUITools<ToolContracts>>;

const submitSchema = z.object({
  id: z.string(),
  messages: z
    .array(
      z.custom<bloomUIMessage>((value) => {
        return value != null && typeof value === "object" && "id" in value && "parts" in value;
      }),
    )
    .min(1),
  mode: modeSchema,
  model: z.string().refine(isSupportedChatModel, "Unsupported model"),
});

const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

function hasPendingToolCalls(message: bloomUIMessage) {
  return message.parts.some((part) => {
    if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
      const state = (part as { state?: string }).state;
      return state !== "output-available" && state !== "output-error";
    }

    return false;
  });
}

const app = new Hono<AuthenticatedEnv>().post("/", submitValidator, async (c) => {
  const userId = c.get("userId");
  const { id, messages, mode, model } = c.req.valid("json");

  const session = await db.chatSession.findUnique({
    where: { id, userId },
  });

  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  const lastMessage = messages[messages.length - 1];
  const isUserPrompt = lastMessage?.role === "user";

  // Only count real user prompts — tool-loop continuation posts do not consume quota
  if (isUserPrompt) {
    const quota = await tryConsumePrompt(userId);
    if (!quota) {
      return c.json({ error: "Request limit reached. No prompts remaining." }, 402);
    }
  }

  const startTime = Date.now();
  const tools = getToolContracts(mode);
  const resolvedModel = resolveChatModel(model);
  const previousMessages = Array.isArray(session.messages)
    ? (session.messages as unknown as bloomUIMessage[])
    : [];
  const mergedMessages = [...previousMessages];

  for (const message of messages) {
    const incomingMessage = {
      ...message,
      metadata: { ...message.metadata, mode, model },
    } satisfies bloomUIMessage;

    const existingMessageIndex = mergedMessages.findIndex((m) => m.id === incomingMessage.id);

    if (existingMessageIndex === -1) {
      mergedMessages.push(incomingMessage);
    } else {
      mergedMessages[existingMessageIndex] = incomingMessage;
    }
  }

  const nextMessages = await validateUIMessages<bloomUIMessage>({
    messages: mergedMessages,
    tools,
  });
  const modelMessages = await convertToModelMessages(nextMessages, { tools });
  let completedUsage: LanguageModelUsage | null = null;

  const result = streamText({
    model: resolvedModel.model,
    system: buildSystemPrompt({ mode }),
    messages: modelMessages,
    tools,
    providerOptions: resolvedModel.providerOptions,
    onFinish(event) {
      completedUsage = event.totalUsage;
    },
  });

  return result.toUIMessageStreamResponse<bloomUIMessage>({
    originalMessages: nextMessages,
    messageMetadata({ part }) {
      if (part.type === "start") {
        return { mode, model };
      }

      if (part.type !== "finish") return undefined;

      return {
        mode,
        model,
        durationMs: Date.now() - startTime,
        ...(completedUsage ? { usage: completedUsage } : {}),
      };
    },
    async onFinish(event) {
      if (event.isAborted) return;

      if (hasPendingToolCalls(event.responseMessage)) return;

      await db.chatSession.update({
        where: { id, userId },
        data: {
          messages: event.messages as unknown as Prisma.InputJsonValue,
        },
      });
    },
    onError(error) {
      return error instanceof Error ? error.message : String(error);
    },
  });
});

export default app;
