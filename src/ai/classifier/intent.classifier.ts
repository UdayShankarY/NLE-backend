import {
  GREETING_KEYWORDS,
  FAQ_KEYWORDS,
  BOOKING_KEYWORDS,
  PRODUCT_KEYWORDS,
} from "../constants/intents";

import { IntentResult, IntentType } from "../types/intent.types";

export class IntentClassifier {
  classify(message: string): IntentResult {
    const text = message.toLowerCase().trim();

    if (GREETING_KEYWORDS.some(k => text.includes(k))) {
      return {
        intent: IntentType.GREETING,
        confidence: 1,
      };
    }

    if (FAQ_KEYWORDS.some(k => text.includes(k))) {
      return {
        intent: IntentType.FAQ,
        confidence: 1,
      };
    }

    if (BOOKING_KEYWORDS.some(k => text.includes(k))) {
      return {
        intent: IntentType.BOOKING,
        confidence: 1,
      };
    }

    if (PRODUCT_KEYWORDS.some(k => text.includes(k))) {
      return {
        intent: IntentType.PRODUCT_SEARCH,
        confidence: 0.9,
      };
    }

    return {
      intent: IntentType.RECOMMENDATION,
      confidence: 0.6,
    };
  }
}

export const intentClassifier = new IntentClassifier();