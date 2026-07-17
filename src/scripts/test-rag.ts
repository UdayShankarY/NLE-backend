import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { mongoLoader } from "../ai/loaders/mongo.loader";
import { textSplitterService } from "../ai/services/text-splitter.service";
import { vectorStoreService } from "../ai/vectorstore/faiss.store";
import { retrieverService } from "../ai/retriever/retriever.service";
import { ragChain } from "../ai/chains/rag.chain";

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  const docs = await mongoLoader.loadKnowledge();

  const chunks = await textSplitterService.splitDocuments(docs);

  await vectorStoreService.create(chunks);

  retrieverService.initialize();

  const response = await ragChain.invoke(
    "What birthday decorations are available under ₹5000?"
  );

  console.log("\n=========================\n");

  console.log(response.answer);

  console.log("\n=========================\n");

  await mongoose.disconnect();
}

main().catch(console.error);