import { mongoLoader } from "../loaders/mongo.loader";
import { textSplitterService } from "./text-splitter.service";
import { vectorStoreService } from "../vectorstore/faiss.store";
import { retrieverService } from "../retriever/retriever.service";
import { chatService } from "./chat.service";
import { intentClassifier } from "../classifier/intent.classifier";
import { intentRouter } from "../router/intent.router";

export class AIService {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }


    // Load knowledge from MongoDB
    const documents = await mongoLoader.loadKnowledge();
    console.log(`✅ Loaded ${documents.length} AI documents`);

    // Split documents into chunks
    const chunks = await textSplitterService.splitDocuments(documents);
    console.log(`✅ Created ${chunks.length} chunks`);

    // Create FAISS Vector Store
    await vectorStoreService.create(chunks);
    console.log("✅ Vector Store Ready");

    // Initialize Retriever with a smaller k to reduce token consumption
    retrieverService.initialize(3);
    console.log("✅ Retriever Ready");

    this.initialized = true;

  }

  async chat(sessionId: string, message: string) {

    await this.initialize();

    try {

        // Load previous conversation
        const history = await chatService.getConversation(sessionId);

        // Save user message
        await chatService.saveMessage(
            sessionId,
            "user",
            message
        );

        // Detect intent
        const { intent } = intentClassifier.classify(message);

        console.log("Intent:", intent);

        // Route request
        const response = await intentRouter.route(
            intent,
            message,
            sessionId
        );

        // Save assistant response
        await chatService.saveMessage(
            sessionId,
            "assistant",
            response.answer
        );

        return response;

    } catch (error) {

        console.error(error);

        return {

            answer:
                "Sorry, something went wrong. Please try again later.",

            products: []

        };

    }

}
}

export const aiService = new AIService();