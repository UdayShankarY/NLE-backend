import { ChatPromptTemplate } from "@langchain/core/prompts";

import { retrieverService } from "../retriever/retriever.service";
import { llm } from "../providers/llm.provider";

const ragPrompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant for The Decor Party.

Answer ONLY using the provided context.

If the answer is not present in the context, say:

"I couldn't find that information."

-----------------------

Context:

{context}

-----------------------

Question:

{question}

Answer:
`);

export class RagChain {
  async invoke(question: string) {
    // Retrieve relevant documents
    const docs = await retrieverService.retrieve(question);

    // Convert documents into one string
    const context = docs
      .map((doc) => doc.pageContent)
      .join("\n\n------------------\n\n");

    // Create prompt
    const prompt = await ragPrompt.invoke({
      context,
      question,
    });

    // Call LLM
    const response = await llm.invoke(prompt);

    return {
      answer: response.content,
      sources: docs,
    };
  }
}

export const ragChain = new RagChain();