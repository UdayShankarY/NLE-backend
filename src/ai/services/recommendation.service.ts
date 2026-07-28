import { Document } from "@langchain/core/documents";

import { llm } from "../providers/llm.provider";

import { recommendationPrompt } from "../prompts/recommendation.prompt";

interface RecommendationInput {
  category: string | null;
  budget: number | null;
  theme: string | null;
  audience: string | null;
  guests: number | null;
  venue: string | null;
  city: string | null;
  documents: Document[];
}

class RecommendationService {
  async recommend(input: RecommendationInput): Promise<string> {
    const documents = input.documents
      .slice(0, 3)
      .map((doc, index) => {
        const metadata = doc.metadata ?? {};
        const description = String(metadata.description ?? "").trim();

        return `Product ${index + 1}:
Name: ${metadata.name ?? "Unknown"}
Category: ${metadata.category ?? "Unknown"}
Price: ₹${metadata.price ?? "Unknown"}
Description: ${description.slice(0, 140)}\n`;
      })
      .join("\n");

    const prompt = await recommendationPrompt.invoke({
      category: input.category ?? "Not specified",
      budget: input.budget ?? "Not specified",
      theme: input.theme ?? "Not specified",
      audience: input.audience ?? "Not specified",
      guests: input.guests ?? "Not specified",
      venue: input.venue ?? "Not specified",
      city: input.city ?? "Not specified",
      documents,
    });

    const response = await llm.invoke(prompt);

    return String(response.content);
  }
}

export const recommendationService = new RecommendationService();