import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const handleTriagePanic = async (req, res, next) => {
  try {
    const { userPrompt } = req.body;

    // Validate request
    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        message: "Missing userPrompt in request body.",
      });
    }

    // Generate response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          "You are the AI assistant for 'The Last-Minute Life Saver' app. The user is panicking about a missed commitment or an upcoming deadline. Respond calmly with a comforting tone and provide a clear, actionable 2-step defense plan.",
      },
      contents: userPrompt,
    });

    return res.status(200).json({
      success: true,
      advice: response.text,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    next(error);
  }
};