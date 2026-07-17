import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { mongoLoader } from "../ai/loaders/mongo.loader";
import { textSplitterService } from "../ai/services/text-splitter.service";
import { embeddingService } from "../ai/services/embedding.service";

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  // Step 1: Load knowledge
  const documents = await mongoLoader.loadKnowledge();
  console.log(`Documents: ${documents.length}`);

  // Step 2: Split into chunks
  const chunks = await textSplitterService.splitDocuments(documents);
  console.log(`Chunks: ${chunks.length}`);

  // Step 3: Generate embeddings
  const embeddings = await embeddingService.embedDocuments(chunks);

  console.log(`Embeddings Generated: ${embeddings.length}`);
  console.log(`Embedding Dimension: ${embeddings[0].length}`);

  // Print first few values of first vector
  console.log("First Vector (first 10 values):");
  console.log(embeddings[0].slice(0, 10));

  await mongoose.disconnect();
}

main().catch(console.error);