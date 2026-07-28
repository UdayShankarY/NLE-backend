import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const AI_CONFIG = {
  llm: {
    provider: optional("LLM_PROVIDER", "groq"),
    model: optional("LLM_MODEL", "llama-3.1-8b-instant"),
    temperature: Number(optional("AI_TEMPERATURE", "0")),
    apiKey: required("GROQ_API_KEY"),
  },

  embedding: {
    provider: optional("EMBEDDING_PROVIDER", "huggingface"),
    model: required("EMBEDDING_MODEL"),
    apiKey: required("HUGGINGFACE_API_KEY"),
  },

  retriever: {
    topK: Number(optional("AI_TOP_K", "2")),
  },
} as const;

console.log("========== AI CONFIG ==========");
console.log("LLM Provider:", AI_CONFIG.llm.provider);
console.log("LLM Model:", AI_CONFIG.llm.model);
console.log("Embedding Provider:", AI_CONFIG.embedding.provider);
console.log("Embedding Model:", AI_CONFIG.embedding.model);
console.log(
  "HF Token:",
  AI_CONFIG.embedding.apiKey.substring(0, 8) + "..."
);
console.log("===============================");