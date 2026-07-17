import mongoose from "mongoose";
import { mongoLoader } from "../ai/loaders/mongo.loader";
import { textSplitterService } from "../ai/services/text-splitter.service";
import { vectorStoreService } from "../ai/vectorstore/faiss.store";

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  const docs = await mongoLoader.loadKnowledge();
  const chunks = await textSplitterService.splitDocuments(docs);

  console.log("Chunks:", chunks.length);

  await vectorStoreService.create(chunks);

  await vectorStoreService.save("./vectorstore");

  console.log("✅ FAISS Vector Store Created");
}

main();