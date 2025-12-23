
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static ai: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI {
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return this.ai;
  }

  public static async generateImage(prompt: string): Promise<string> {
    const ai = this.getClient();
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      // Find the image part in the response
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("No image was generated in the response.");
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }
}
