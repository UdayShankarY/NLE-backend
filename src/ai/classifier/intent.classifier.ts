import { INTENT_KEYWORDS } from "../constants/intents";
import { IntentResult, IntentType } from "../types/intent.types";

export class IntentClassifier {
  classify(message: string): IntentResult {
    const text = message.toLowerCase().trim();

    const PRIORITY: IntentType[] = [
      IntentType.BOOKING,
      IntentType.RECOMMENDATION,
      IntentType.FAQ,
      IntentType.SUPPORT,
      IntentType.CONTACT,
      IntentType.PRODUCT_SEARCH,
      IntentType.GREETING,
      IntentType.THANK_YOU,
      IntentType.GOODBYE,
    ];

    for (const intent of PRIORITY) {
      const keywords = INTENT_KEYWORDS[intent] ?? [];

      const matched = keywords.some((keyword) =>
        text.includes(keyword.toLowerCase())
      );

      if (matched) {
        return {
          intent,
          confidence: 1,
        };
      }
    }

    return {
      intent: IntentType.UNKNOWN,
      confidence: 0,
    };
  }
}

export const intentClassifier = new IntentClassifier();