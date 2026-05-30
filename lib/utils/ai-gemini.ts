import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: process.env.GEMINI_API_MODEL || "gemini-3.5-flash",
        generationConfig: { responseMimeType: "application/json" },
    });
}
