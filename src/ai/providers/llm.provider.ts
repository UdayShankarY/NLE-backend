import { ChatGroq } from "@langchain/groq";
import { AI_CONFIG } from "../config";

export const llm = new ChatGroq({
  apiKey: AI_CONFIG.llm.apiKey,
  model: AI_CONFIG.llm.model,
  temperature: AI_CONFIG.llm.temperature,
});