import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import {
  findSupportedChatModel,
  type SupportedChatModel,
  type SupportedChatModelId,
  type SupportedProvider,
} from "@bloom/shared";
import type { ProviderOptions } from "@ai-sdk/provider-utils";
import type { LanguageModel } from "ai";

type GeminiModelId = Extract<SupportedChatModel, { provider: "google" }>["id"];
type GroqModelId = Extract<SupportedChatModel, { provider: "groq" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
  providerOptions?: ProviderOptions;
};

const GOOGLE_PROVIDER_OPTIONS: Partial<Record<GeminiModelId, ProviderOptions>> = {
  "gemini-3.5-flash": {
    google: {
      thinkingConfig: {
        thinkingLevel: "high",
        includeThoughts: true,
      },
    },
  },
  "gemini-2.5-flash": {
    google: {
      thinkingConfig: {
        thinkingBudget: 8192,
        includeThoughts: true,
      },
    },
  },
};

// Groq reasoningEffort is model-specific:
// - GPT-OSS: "low" | "medium" | "high"
// - Qwen 3.6 27B: "none" | "default"
// Use "parsed" so reasoning is a separate field (required with tool calling).
const GROQ_PROVIDER_OPTIONS: Partial<Record<GroqModelId, ProviderOptions>> = {
  "openai/gpt-oss-120b": {
    groq: {
      reasoningFormat: "parsed",
      reasoningEffort: "high",
    },
  },
  "openai/gpt-oss-20b": {
    groq: {
      reasoningFormat: "parsed",
      reasoningEffort: "high",
    },
  },
  "qwen/qwen3.6-27b": {
    groq: {
      reasoningFormat: "parsed",
      reasoningEffort: "default",
    },
  },
};

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider: ${provider}`);
}

function resolveGoogleModel(modelId: GeminiModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
    providerOptions: GOOGLE_PROVIDER_OPTIONS[modelId],
  };
}

function resolveGroqModel(modelId: GroqModelId): ResolvedModel {
  return {
    model: groq(modelId),
    provider: "groq",
    modelId,
    providerOptions: GROQ_PROVIDER_OPTIONS[modelId],
  };
}

function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  const provider = model.provider;

  switch (provider) {
    case "google":
      return resolveGoogleModel(model.id);
    case "groq":
      return resolveGroqModel(model.id);
    default:
      return assertUnsupportedProvider(provider);
  }
}

export function isSupportedChatModel(modelId: string): modelId is SupportedChatModelId {
  return findSupportedChatModel(modelId) != null;
}

export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  return resolveSupportedChatModel(model);
}
