  import { aiService } from "./services/ai.service";
  import { categoryService } from "./services/category.service";

  export async function initializeAI() {
    console.log("🚀 Initializing AI...");

    await aiService.initialize();

    // Load all active categories into memory
    await categoryService.initialize();

    console.log("🎉 AI Initialized Successfully");

    return true;
  }