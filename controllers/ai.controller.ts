import { Request, Response } from "express";
import { aiService } from "../src/ai/services/ai.service";

export class AIController {
  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const response = await aiService.chat(message);

      return res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "AI Error",
      });
    }
  }
}

export const aiController = new AIController();