import { Embeddings } from "@langchain/core/embeddings";
import { InferenceClient } from "@huggingface/inference";
import { AI_CONFIG } from "../config";

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

export class HuggingFaceEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedQuery(text: string): Promise<number[]> {
    const embedding = await client.featureExtraction({
      model: AI_CONFIG.embedding.model,
      inputs: text,
    });

    return embedding as number[];
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedQuery(text)));
  }
}

export const embeddingProvider = new HuggingFaceEmbeddings();