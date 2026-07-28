import { IntentType } from "../types/intent.types";

import { greetingHandler } from "../handlers/greeting.handler";
import { faqHandler } from "../handlers/faq.handler";
import { bookingHandler } from "../handlers/booking.handler";
import { retrieveHandler } from "../handlers/retrieve.handler";
import { recommendationHandler } from "../handlers/recommendation.handler";

export class IntentRouter {

    async route(intent: IntentType, message: string, sessionId: string) {

        switch (intent) {

            case IntentType.GREETING:
                return greetingHandler.handle(message);

            case IntentType.FAQ:
                return faqHandler.handle(message);

            case IntentType.BOOKING:
                return bookingHandler.handle(message, sessionId);

            case IntentType.PRODUCT_SEARCH:
                return retrieveHandler.handle(message);

            case IntentType.RECOMMENDATION:
                return recommendationHandler.handle(message, sessionId);

            default:
                return recommendationHandler.handle(message, sessionId);
        }

    }

}

export const intentRouter = new IntentRouter();