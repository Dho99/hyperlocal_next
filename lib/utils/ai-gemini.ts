import { GoogleGenerativeAI } from "@google/generative-ai";
export function createGeminiModel(systemInstruction?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: process.env.GEMINI_API_MODEL || "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048, temperature: 0.2 } as any,
        ...(systemInstruction ? { systemInstruction } as any : {}),
    });
}
