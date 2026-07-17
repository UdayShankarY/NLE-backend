import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { embeddingProvider } from "../providers/embedding.provider";

export class VectorStoreService {
  private vectorStore: FaissStore | null = null;

  async create(documents: Document[]) {
    this.vectorStore = await FaissStore.fromDocuments(
      documents,
      embeddingProvider
    );

    return this.vectorStore;
  }

  async save(path: string) {
    if (!this.vectorStore) {
      throw new Error("Vector Store not initialized.");
    }

    await this.vectorStore.save(path);
  }

  async load(path: string) {
    this.vectorStore = await FaissStore.load(
      path,
      embeddingProvider
    );

    return this.vectorStore;
  }

  getStore() {
    if (!this.vectorStore) {
      throw new Error("Vector Store not initialized.");
    }

    return this.vectorStore;
  }
}

export const vectorStoreService = new VectorStoreService();