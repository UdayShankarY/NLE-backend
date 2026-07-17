import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { mongoLoader } from "../ai/loaders/mongo.loader";

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  const docs = await mongoLoader.loadKnowledge();

  console.log(docs.length);

  await mongoose.disconnect();
}

main().catch(console.error);