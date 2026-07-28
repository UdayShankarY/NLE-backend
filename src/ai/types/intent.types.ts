export enum IntentType {
  GREETING = "GREETING",
  FAQ = "FAQ",
  BOOKING = "BOOKING",
  PRODUCT_SEARCH = "PRODUCT_SEARCH",
  RECOMMENDATION = "RECOMMENDATION",
  UNKNOWN = "UNKNOWN",
}

export interface IntentResult {
  intent: IntentType;
  confidence: number;
}