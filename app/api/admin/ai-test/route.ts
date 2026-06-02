import { NextResponse } from "next/server";
import { createGeminiModel } from "@/lib/utils/ai-gemini";
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
    const model = createGeminiModel();

    if (!model) {
        return NextResponse.json(
            { error: "Gemini API key not configured" },
            { status: 500 },
        );
    }

    const results: TestResult[] = [];

    for (const tc of TEST_CASES) {
        const prompt = `Anda adalah asisten rekomendasi wisata halal. Klasifikasikan query berikut ke dalam salah satu intent berikut:

1. DESTINATION_SEARCH — pengguna mencari atau ingin melihat destinasi wisata, kuliner, atau penginapan.
2. ITINERARY_RECOMMENDATION — pengguna ingin rencana perjalanan / itinerary / rute wisata yang terstruktur (misalnya "1 hari", "2 hari", "3 hari", atau menyebutkan durasi).
3. FACILITY_CHECK — pengguna ingin mengecek ketersediaan fasilitas halal tertentu di suatu destinasi (misalnya musala, tempat wudu, sertifikat halal, dll).

QUERY: "${tc.query}"

Response HARUS JSON tanpa teks lain dalam format EXACT berikut:
{ "intent": "DESTINATION_SEARCH" }
{ "intent": "ITINERARY_RECOMMENDATION" }
{ "intent": "FACILITY_CHECK" }

HANYA output JSON, tanpa markdown, tanpa penjelasan.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = JSON.parse(text);
            const actual: string | null = parsed?.intent ?? null;

            results.push({
                query: tc.query,
                expected: tc.expected,
                actual,
                passed: actual === tc.expected,
                rawResponse: text.slice(0, 200),
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
