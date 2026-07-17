import { Document } from "@langchain/core/documents";
import { embeddingModel } from "../providers/embedding.provider";

export class EmbeddingService {
  async embedDocuments(documents: Document[]) {
    return embeddingModel.embedDocuments(
      documents.map((doc) => doc.pageContent)
    );
  }

  async embedQuery(query: string) {
    return embeddingModel.embedQuery(query);
  }
}

export const embeddingService = new EmbeddingService();