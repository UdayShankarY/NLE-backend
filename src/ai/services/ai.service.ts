import { ragChain } from "../chains/rag.chain";

export class AIService {
  async chat(message: string) {
    const response = await ragChain.invoke(message);

    return {
      answer: response.answer,
      sources: response.sources.map((doc) => ({
        collection: doc.metadata.collection,
        id: doc.metadata.id,
      })),
    };
  }
}

export const aiService = new AIService();