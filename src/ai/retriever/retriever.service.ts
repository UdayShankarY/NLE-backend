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
  console.log("========== RETRIEVER ==========");
  console.log("Query:", query);
  console.log("[RETRIEVER] Query:", query);
  console.log("[RETRIEVER] Retriever exists:", !!this.retriever);

  if (!this.retriever) {
    throw new Error("Retriever not initialized.");
  }

  const docs = await this.retriever.invoke(query);

  console.log("Retrieved documents:", docs.length);
  docs.forEach((doc) => {
    console.log({
      collection: doc.metadata?.collection,
      name: doc.metadata?.name,
      category: doc.metadata?.category,
      score: doc.metadata?.score,
    });
  });

  if (docs.length === 0) {
    console.log("Retriever returned 0 documents.");
  }

  // Keep only product documents
  const productDocs = docs.filter(
    (doc) => doc.metadata?.collection === "products"
  );

  console.log(
    "[RETRIEVER] Number of retrieved product documents:",
    productDocs.length
  );

  productDocs.forEach((doc, index) => {
    console.log(
      `[RETRIEVER] Product ${index + 1}:`,
      doc.metadata.name
    );
  });

  return productDocs;
}
}

export const retrieverService = new RetrieverService();