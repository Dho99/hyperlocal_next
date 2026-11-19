import { GoogleGenerativeAI } from "@google/generative-ai";

export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export function getGeminiModelName(): string {
    return process.env.GEMINI_API_MODEL || DEFAULT_GEMINI_MODEL;
}

export function createGeminiModel(systemInstruction?: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const params = {
        model: getGeminiModelName(),
        generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 2048,
            temperature: 0.2,
        },
        ...(systemInstruction ? { systemInstruction } : {}),
    };
    return new GoogleGenerativeAI(apiKey).getGenerativeModel(params);
}
