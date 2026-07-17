import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const AI_CONFIG = {
  llm: {
    provider: required("LLM_PROVIDER"),
    model: required("LLM_MODEL"),
    temperature: Number(required("AI_TEMPERATURE")),
    apiKey: required("GROQ_API_KEY"),
  },

  embedding: {
    provider: required("EMBEDDING_PROVIDER"),
    model: required("EMBEDDING_MODEL"),
  },

  retriever: {
    topK: Number(required("AI_TOP_K")),
  },
} as const;