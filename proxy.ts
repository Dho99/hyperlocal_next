import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public and auth paths
    const isPublicPath = path === "/" || path === "/unauthorized";
    const isAuthPath = path.startsWith("/login") || 
                       path.startsWith("/register");
    const isStaticPath =
        path.startsWith("/_next") ||
        path.startsWith("/api") ||
        path.includes(".") ||
        path.startsWith("/favicon.ico");

    if (isStaticPath) return NextResponse.next();

    // Get session directly from Better Auth API
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    const isLoggedIn = !!session && !!session.user;

    // Redirect logic
    if (isAuthPath) {
        if (isLoggedIn) {
            if (session.user.role === "admin") {
                return NextResponse.redirect(
                    new URL("/dashboard", request.url),
                );
            }
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    const isAdminPath =
        path.startsWith("/dashboard") ||
        path.startsWith("/destinations") ||
        path.startsWith("/halal-facilities") ||
        path.startsWith("/umkms") ||
        path.startsWith("/accommodations") ||
        path.startsWith("/validations") ||
        path.startsWith("/validasi") ||
        path.startsWith("/statistics") ||
        path.startsWith("/settings");

    if (isAdminPath) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (session.user.role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
