import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getErrorMessage } from "@/lib/api-error";

const TEST_CASES = [
    { query: "cari destinasi wisata di bandung", expected: "DESTINATION_SEARCH" },
    { query: "rekomendasi tempat wisata halal", expected: "DESTINATION_SEARCH" },
    { query: "itinerary 3 hari di jogja", expected: "ITINERARY_RECOMMENDATION" },
    { query: "rute perjalanan 2 hari di malang", expected: "ITINERARY_RECOMMENDATION" },
    { query: "apakah ada masjid di dekat sini", expected: "FACILITY_CHECK" },
    { query: "cek ketersediaan musala di pantai kuta", expected: "FACILITY_CHECK" },
    { query: "rencana jalan-jalan ke solo 1 hari", expected: "ITINERARY_RECOMMENDATION" },
];

interface TestResult {
    query: string;
    expected: string;
    actual: string | null;
    passed: boolean;
    error?: string;
    rawResponse?: string;
}

export async function GET() {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
            { error: "GROQ_API_KEY not configured" },
            { status: 500 },
        );
    }

    const aiClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });

    const results: TestResult[] = [];

    for (const tc of TEST_CASES) {
        const systemPrompt = `Anda adalah asisten rekomendasi wisata halal. Klasifikasikan query pengguna ke dalam salah satu intent berikut:

1. DESTINATION_SEARCH — pengguna mencari atau ingin melihat destinasi wisata, kuliner, atau penginapan.
2. ITINERARY_RECOMMENDATION — pengguna ingin rencana perjalanan / itinerary / rute wisata yang terstruktur (misalnya "1 hari", "2 hari", "3 hari", atau menyebutkan durasi).
3. FACILITY_CHECK — pengguna ingin mengecek ketersediaan fasilitas halal tertentu di suatu destinasi (misalnya musala, tempat wudu, sertifikat halal, dll).

Response HARUS JSON dalam format EXACT berikut:
{ "intent": "DESTINATION_SEARCH" }
{ "intent": "ITINERARY_RECOMMENDATION" }
{ "intent": "FACILITY_CHECK" }

HANYA output JSON, tanpa markdown, tanpa penjelasan.`;

        try {
            const response = await aiClient.chat.completions.create({
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: tc.query },
                ],
            });

            const jsonString = response.choices[0]?.message?.content;
            if (!jsonString) throw new Error("AI returned empty response");

            const parsed = JSON.parse(jsonString);
            const actual: string | null = parsed?.intent ?? null;

            results.push({
                query: tc.query,
                expected: tc.expected,
                actual,
                passed: actual === tc.expected,
                rawResponse: jsonString.slice(0, 200),
            });
        } catch (err) {
            results.push({
                query: tc.query,
                expected: tc.expected,
                actual: null,
                passed: false,
                error: getErrorMessage(err),
            });
        }
    }

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const accuracy = Math.round((passed / total) * 100);

    return NextResponse.json({
        summary: `${passed}/${total} Tests Passed - ${accuracy}% Intent Integrity`,
        timestamp: new Date(),
        total,
        passed,
        failed: total - passed,
        accuracy: `${accuracy}%`,
        results,
    });
}
