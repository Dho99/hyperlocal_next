import { api as axios } from "@/lib/axios";

export interface SurveyIndicator {
    id: string;
    code: string;
    name: string;
    description: string | null;
    weight: number;
    group: string;
}

export interface SurveyStructure {
    indicators: SurveyIndicator[];
    summary: { count: number; average: number | null };
}

export interface SurveySubmitPayload {
    scores: {
        indicators: Record<string, number>;
        evidence: Record<string, number>;
    };
    comment?: string | null;
}

export interface AdminSurveyItem {
    id: string;
    destinationId: string;
    userId: string | null;
    scores: {
        indicators: Record<string, number>;
        evidence: Record<string, number>;
    };
    overallScore: number | null;
    comment: string | null;
    createdAt: string;
    user: { id: string; name: string; image: string | null } | null;
    destination: { id: string; name: string; slug: string } | null;
}

export async function getSurveyStructure(destinationId: string) {
    const res = await axios.get<{ data: SurveyStructure }>(
        `/destinations/${destinationId}/survey`,
    );
    return res.data.data;
}

export async function submitSurvey(
    destinationId: string,
    payload: SurveySubmitPayload,
) {
    const res = await axios.post<{ data: AdminSurveyItem }>(
        `/destinations/${destinationId}/survey`,
        payload,
    );
    return res.data.data;
}

export async function getAdminSurveys(params?: {
    limit?: number;
    cursor?: string | null;
    destinationId?: string;
    search?: string;
}) {
    const res = await axios.get<{
        data: AdminSurveyItem[];
        pagination: { limit: number; next_cursor: string | null; has_more: boolean };
    }>("/admin/surveys", { params });
    return res.data;
}

export async function deleteSurvey(id: string) {
    const res = await axios.delete<{ data: { id: string } }>(
        `/admin/surveys/${id}`,
    );
    return res.data.data;
}
