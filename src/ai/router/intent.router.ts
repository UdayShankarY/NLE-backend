import { IntentType } from "../types/intent.types";

import { greetingHandler } from "../handlers/greeting.handler";
import { faqHandler } from "../handlers/faq.handler";
import { bookingHandler } from "../handlers/booking.handler";
import { retrieveHandler } from "../handlers/retrieve.handler";
import { recommendationHandler } from "../handlers/recommendation.handler";
import { generalInformationHandler } from "../handlers/general-information.handler";
import { queryAnalyzerService } from "../services/query-analyzer.service";
import Product from "../../../models/Product";
import { Document } from "@langchain/core/documents";

export class IntentRouter {
  async route(
    intent: IntentType,
    message: string,
    sessionId: string
  ) {
    switch (intent) {
      case IntentType.GREETING:
        return greetingHandler.handle(message);

      case IntentType.FAQ:
        return faqHandler.handle(message);

      case IntentType.BOOKING:
        return bookingHandler.handle(message, sessionId);

      case IntentType.GENERAL_INFORMATION:
        console.log("[AI] Intent: GENERAL_INFORMATION");
        console.log("[AI] Routing to GeneralInformationHandler");
        return generalInformationHandler.handle(message);

      case IntentType.PRODUCT_SEARCH:
        console.log("========== ROUTER ==========");
        console.log("Intent: PRODUCT_SEARCH");
        return this.routeProductSearch(message, sessionId);

      case IntentType.RECOMMENDATION:
        return recommendationHandler.handle(message, sessionId);

      default:
        return {
          answer:
            "I'm sorry, I couldn't understand your request. Could you please rephrase it?",
          products: [],
          showProducts: false,
        };
    }
  }
  private async routeProductSearch(message: string, sessionId: string) {
    const analysis = await queryAnalyzerService.analyze(message);

    if (analysis.queryType === "CATEGORY_LIST" && analysis.category) {
      console.log("[AI] Query Type: CATEGORY_LIST");
      console.log("[AI] Category:", analysis.category);

      const categoryFilter = analysis.categoryId
        ? { categoryId: analysis.categoryId }
        : {
            categoryName: {
              $regex: this.toCategoryRegex(analysis.category ?? ""),
              $options: "i",
            },
          };
      const products = await Product.find({
        ...categoryFilter,
        active: true,
      }).lean();

      console.log("[AI] Mongo Products Returned:", products.length);

      const documents = products.map(
        (product) =>
          new Document({
            pageContent: [
              `Decoration Name: ${product.name}`,
              `Category: ${product.categoryName ?? ""}`,
              `Price: ₹${product.price}`,
              `Description: ${product.description ?? ""}`,
              `Inclusions: ${(product.inclusions ?? []).join(", ")}`,
            ].join("\n\n"),
            metadata: {
              collection: "products",
              id: product._id.toString(),
              slug: product._id.toString(),
              name: product.name,
              image: product.image,
              category: product.categoryName,
              categoryId: product.categoryId?.toString(),
              price: product.price,
              featured: product.featured,
              description: product.description ?? "",
              active: product.active,
            },
          })
      );

      return recommendationHandler.handle(message, sessionId, documents);
    }

    console.log("[AI] Query Type: SEMANTIC_SEARCH");
    const response = await retrieveHandler.handle(message);
    console.log("[AI] Retriever Results:", response.products.length);
    return response;
  }

  private toCategoryRegex(category: string): string {
    const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `^${escapedCategory.replace(/\s+/g, "\\s+")}$`;
  }
}

export const intentRouter = new IntentRouter();