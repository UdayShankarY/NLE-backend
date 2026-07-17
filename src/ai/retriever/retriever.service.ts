import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";

import { vectorStoreService } from "../vectorstore/faiss.store";

export class RetrieverService {
  private retriever: BaseRetriever | null = null;

  initialize(k: number = 4) {
    const vectorStore = vectorStoreService.getStore();

    this.retriever = vectorStore.asRetriever(k);
  }

  async retrieve(query: string): Promise<Document[]> {
    if (!this.retriever) {
      throw new Error("Retriever not initialized.");
    }

    return this.retriever.invoke(query);
  }
}

export const retrieverService = new RetrieverService();