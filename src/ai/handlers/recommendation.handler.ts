import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "../providers/llm.provider";
import { retrieverService } from "../retriever/retriever.service";
import { chatService } from "../services/chat.service";

const recommendationPrompt = ChatPromptTemplate.fromTemplate(`
You are The Decor Party AI Assistant.

Answer naturally and briefly.

Rules:
- Maximum 80 words.
- Recommend only ONE best package.
- Don't list all products.
- Don't invent information.
- If products exist, end with:
👇 Explore the recommended packages below.

Conversation:
{history}

Products:
{products}

Question:
{question}
`);

export class RecommendationHandler {

    async handle(message: string, sessionId: string) {

        const history = await chatService.getConversation(sessionId);

        const docs = await retrieverService.retrieve(message);

        const products = docs
            .filter(doc => doc.metadata.collection === "products")
            .map(doc => ({
                id: doc.metadata.id,
                slug: doc.metadata.slug ?? doc.metadata.id,
                name: doc.metadata.name,
                image: doc.metadata.image,
                price: Number(doc.metadata.price),
                description: doc.metadata.description ?? ""
            }));

        const historyText = history
            .slice(-5)
            .map(h => `${h.role}: ${h.content}`)
            .join("\n");

        const productContext = products
            .map(p =>
`Name: ${p.name}
Price: ₹${p.price}
Description: ${p.description}`)
            .join("\n\n");

        const prompt = await recommendationPrompt.invoke({
            history: historyText,
            products: productContext,
            question: message
        });

        const response = await llm.invoke(prompt);

        const answer =
            typeof response.content === "string"
                ? response.content
                : response.content
                    .map((c: any) => ("text" in c ? c.text : ""))
                    .join("");

        return {
            answer,
            products
        };
    }

}

export const recommendationHandler = new RecommendationHandler();