
import { GoogleGenAI } from "@google/genai";

/**
 * Service to interact with Gemini API for conversational assistance.
 * Follows the latest @google/genai guidelines.
 */
export const getAIResponse = async (prompt: string, context: string[]): Promise<string> => {
  try {
    // Initializing the GenAI client using process.env.API_KEY directly as per guidelines.
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    // Using ai.models.generateContent directly with the model name and prompt parts.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `Context of last messages: ${context.join(' | ')}\n\nUser Question: ${prompt}` }]
      },
      config: {
        systemInstruction: "You are a helpful, witty, and concise AI assistant embedded in a Windows-style private chat application. Keep responses short and friendly.",
        temperature: 0.7,
      },
    });

    // Accessing .text as a property, not a method, as required by the SDK.
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: AI assistance unavailable.";
  }
};
