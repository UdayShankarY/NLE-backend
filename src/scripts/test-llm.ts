import { llm } from "../ai/providers/llm.provider";

async function main() {
  console.log("Testing Groq connection...\n");

  const response = await llm.invoke(
    "Introduce yourself as The Decor Party AI Assistant in one sentence."
  );

  console.log(response.content);
}

main().catch(console.error);