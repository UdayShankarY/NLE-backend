import { llm } from "../providers/llm.provider";
import { intentPrompt } from "../graph/graph_prompts/intent.prompt";
import { categoryService } from "./category.service";

export type IntentType =
  | "GREETING"
  | "FAQ"
  | "RECOMMENDATION";

export interface QueryAnalysis {
  intent: IntentType;

  category: string | null;
  budget: number | null;
  audience: string | null;
  venue: string | null;
  city: string | null;
  theme: string | null;
  eventDate: string | null;
  guests: number | null;

  confidence: number;
}

class QueryAnalyzerService {
  async analyze(
    history: string,
    question: string
  ): Promise<QueryAnalysis> {
    const categories = categoryService.getCategoryNames();

    const prompt = await intentPrompt.invoke({
      categories: categories.join("\n"),
      history,
      question,
    });

    const response = await llm.invoke(prompt);

    const content =
      typeof response.content === "string"
        ? response.content
        : response.content
            .map((block: any) => {
              if (typeof block === "string") return block;
              if ("text" in block) return block.text;
              return "";
            })
            .join("");

    try {
      const parsed = JSON.parse(content) as QueryAnalysis;

      return {
        intent: parsed.intent ?? "FAQ",
        category: parsed.category ?? null,
        budget: parsed.budget ?? null,
        audience: parsed.audience ?? null,
        venue: parsed.venue ?? null,
        city: parsed.city ?? null,
        theme: parsed.theme ?? null,
        eventDate: parsed.eventDate ?? null,
        guests: parsed.guests ?? null,
        confidence: parsed.confidence ?? 0,
      };
    } catch (error) {
      console.error("Query Analyzer JSON Parse Error");
      console.error(content);

      return {
        intent: "FAQ",
        category: null,
        budget: null,
        audience: null,
        venue: null,
        city: null,
        theme: null,
        eventDate: null,
        guests: null,
        confidence: 0,
      };
    }
  }
}

export const queryAnalyzerService = new QueryAnalyzerService();