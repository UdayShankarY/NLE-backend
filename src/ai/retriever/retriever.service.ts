import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";

import { vectorStoreService } from "../vectorstore/faiss.store";

export class RetrieverService {
  private retriever: BaseRetriever | null = null;

  /**
   * Initialize retriever from FAISS vector store
   */
  initialize(k: number = 4) {
    const vectorStore = vectorStoreService.getStore();

    this.retriever = vectorStore.asRetriever({
      k,
    });

    console.log("✅ Retriever Initialized");
  }

  /**
   * Retrieve relevant documents
   */
//   async retrieve(query: string): Promise<Document[]> {
//     console.log("Retriever exists:", !!this.retriever);
//     if (!this.retriever) {
//       throw new Error(
//         "Retriever not initialized. Call initialize() before querying."
//       );
//     }

//     const docs = await this.retriever.invoke(query);

//     console.log(`✅ Retrieved ${docs.length} documents`);

//     return docs;
//   }
  async retrieve(query: string): Promise<Document[]> {
  console.log("[RETRIEVER] Query:", query);
  console.log("[RETRIEVER] Retriever exists:", !!this.retriever);

  if (!this.retriever) {
    throw new Error("Retriever not initialized.");
  }

  const docs = await this.retriever.invoke(query);

  console.log("[RETRIEVER] Number of retrieved documents:", docs.length);

  docs.forEach((doc, index) => {
    console.log(`[RETRIEVER] Document ${index + 1} metadata:`, doc.metadata);
  });

  return docs;
}
}

export const retrieverService = new RetrieverService();