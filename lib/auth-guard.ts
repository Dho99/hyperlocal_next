import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

export async function requireSession() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    return session;
}

export async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") return null;
    return session;
}

export function unauthorizedResponse() {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}

export async function assertAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized: admin required");
    return session;
}
