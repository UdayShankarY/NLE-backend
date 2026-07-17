import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

import { AI_CONFIG } from "../config";

export const embeddingModel = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: AI_CONFIG.embeddingModel,
});