import "dotenv/config";

function required(name: string, fallback = ""): string {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  return value;
}

export const AI_CONFIG = {
  llm: {
    provider: required("LLM_PROVIDER", "groq"),
    model: required("LLM_MODEL", "llama-3.1-8b-instant"),
    temperature: Number(required("AI_TEMPERATURE", "0")),
    apiKey: required("GROQ_API_KEY"),
  },

  embedding: {
    provider: required("EMBEDDING_PROVIDER", "fallback"),
    model: required("EMBEDDING_MODEL", "fallback"),
  },

  retriever: {
    topK: Number(required("AI_TOP_K", "2")),
  },
} as const;