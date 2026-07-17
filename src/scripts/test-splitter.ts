import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { mongoLoader } from "../ai/loaders/mongo.loader";
import { textSplitterService } from "../ai/services/text-splitter.service";

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  const documents = await mongoLoader.loadKnowledge();

  console.log("Original Documents:", documents.length);

  const chunks = await textSplitterService.splitDocuments(documents);

  console.log("Chunks:", chunks.length);

  console.log("\n===== FIRST CHUNK =====\n");

  console.log(chunks[0]);

  await mongoose.disconnect();
}

main().catch(console.error);