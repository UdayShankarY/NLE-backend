import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { mongoLoader } from "../ai/loaders/mongo.loader";
import { textSplitterService } from "../ai/services/text-splitter.service";
import { vectorStoreService } from "../ai/vectorstore/faiss.store";
import { retrieverService } from "../ai/retriever/retriever.service";

async function main() {
  // Connect MongoDB
  await mongoose.connect(process.env.MONGO_URI!);

  console.log("✅ Connected to MongoDB");

  // Load knowledge
  const documents = await mongoLoader.loadKnowledge();

  // Split documents
  const chunks = await textSplitterService.splitDocuments(documents);

  console.log(`Documents: ${documents.length}`);
  console.log(`Chunks: ${chunks.length}`);

  // Create FAISS Vector Store
  await vectorStoreService.create(chunks);

  console.log("✅ Vector Store Ready");

  // Initialize Retriever
  retrieverService.initialize(4);

  console.log("✅ Retriever Initialized");

  // Ask a question
  const results = await retrieverService.retrieve(
    "Birthday decoration packages under ₹5000"
  );

  console.log(`\nRetrieved ${results.length} documents\n`);

  results.forEach((doc, index) => {
    console.log(`========== RESULT ${index + 1} ==========\n`);
    console.log(doc.pageContent);
    console.log("\nMetadata:");
    console.log(doc.metadata);
    console.log("\n-----------------------------------------\n");
  });

  await mongoose.disconnect();
}

main().catch(console.error);