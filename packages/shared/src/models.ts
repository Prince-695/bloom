export type ModelPricing = {
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
};

export type SupportedProvider = "google" | "groq";

type SupportedChatModelDefinition = {
  id: string;
  provider: SupportedProvider;
  pricing: ModelPricing;
};

export const SUPPORTED_CHAT_MODELS = [
  {
    id: "gemini-3.5-flash",
    provider: "google",
    pricing: {
      inputUsdPerMillionTokens: 1,
      outputUsdPerMillionTokens: 3,
    },
  },
  {
    id: "gemini-2.5-flash",
    provider: "google",
    pricing: {
      inputUsdPerMillionTokens: 0.5,
      outputUsdPerMillionTokens: 1.5,
    },
  },
  {
    id: "openai/gpt-oss-120b",
    provider: "groq",
    pricing: {
      inputUsdPerMillionTokens: 0.15,
      outputUsdPerMillionTokens: 0.6,
    },
  },
  {
    id: "openai/gpt-oss-20b",
    provider: "groq",
    pricing: {
      inputUsdPerMillionTokens: 0.075,
      outputUsdPerMillionTokens: 0.3,
    },
  },
  {
    id: "qwen/qwen3.6-27b",
    provider: "groq",
    pricing: {
      inputUsdPerMillionTokens: 0.6,
      outputUsdPerMillionTokens: 3,
    },
  },
  {
    id: "llama-3.3-70b-versatile",
    provider: "groq",
    pricing: {
      inputUsdPerMillionTokens: 0.59,
      outputUsdPerMillionTokens: 0.79,
    },
  },
] as const satisfies readonly SupportedChatModelDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];
export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(modelId: string) {
  return SUPPORTED_CHAT_MODELS.find((model) => model.id === modelId);
}

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "gemini-3.5-flash";
