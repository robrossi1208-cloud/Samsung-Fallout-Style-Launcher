import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], systemContext: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.concat([{ role: 'user', parts: [{ text: prompt }] }]),
    config: {
      systemInstruction: `You are a helpful AI assistant integrated into a high-end smartphone launcher. You are speaking to Rob. Be concise, futuristic, philosophical, and inspirational. You can help with scheduling, app suggestions, and general queries.

Current Device State (Screen Context):
${systemContext}`,
    }
  });

  const response = await model;
  return response.text;
}
