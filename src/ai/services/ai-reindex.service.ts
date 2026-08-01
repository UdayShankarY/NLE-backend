import { mongoLoader } from "../loaders/mongo.loader";
import { retrieverService } from "../retriever/retriever.service";
import { textSplitterService } from "./text-splitter.service";
import { vectorStoreService } from "../vectorstore/faiss.store";

const REINDEX_DEBOUNCE_MS = 10_000;

export class AIReindexService {
  private scheduledTimer: ReturnType<typeof setTimeout> | null = null;
  private rebuilding = false;
  private rerunRequested = false;

  /** Schedule one rebuild for a burst of related CRUD operations. */
  scheduleReindex(): void {
    if (this.rebuilding) {
      this.rerunRequested = true;
      return;
    }

    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
    }

    console.log("[AI] Reindex scheduled");
    this.scheduledTimer = setTimeout(() => {
      this.scheduledTimer = null;
      void this.rebuildKnowledge();
    }, REINDEX_DEBOUNCE_MS);
  }

  async rebuildKnowledge(): Promise<void> {
    if (this.rebuilding) {
      this.rerunRequested = true;
      return;
    }

    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
    }

    this.rebuilding = true;
    let previousStore = null;

    try {
      console.log("[AI] Loading MongoDB");
      const documents = await mongoLoader.loadKnowledge();

      console.log("[AI] Splitting documents");
      const chunks = await textSplitterService.splitDocuments(documents);

      console.log("[AI] Creating embeddings");
      const newStore = await vectorStoreService.createTemporaryStore(chunks);

      console.log("[AI] Swapping vector store");
      previousStore = vectorStoreService.replaceStore(newStore);

      retrieverService.initialize(3);
      console.log("[AI] Retriever refreshed");
      console.log("[AI] Reindex completed");
    } catch (error) {
      if (previousStore) {
        vectorStoreService.replaceStore(previousStore);
        retrieverService.initialize(3);
      }

      console.error("[AI] Reindex failed", error);
    } finally {
      this.rebuilding = false;

      if (this.rerunRequested) {
        this.rerunRequested = false;
        this.scheduleReindex();
      }
    }
  }
}

export const aiReindexService = new AIReindexService();