import { z } from "@/lib/zod";
import {
    OpenAPIRegistry,
    OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import { destinationSchema } from "@/lib/validations/destination.schema";
import { umkmSchema } from "@/lib/validations/umkm.schema";
import { accommodationSchema } from "@/lib/validations/accommodation.schema";
import { categorySchema } from "@/lib/validations/category.schema";
import { facilitySchema } from "@/lib/validations/facility.schema";
import { createReviewSchema } from "@/lib/validations/review.schema";
import { createReportSchema } from "@/lib/validations/report.schema";
import {
    createValidationSchema,
    processDestinationValidationSchema,
} from "@/lib/validations/halal-validation.schema";
import { aceshIndicatorSchema, aceshScoringConfigSchema } from "@/lib/validations/acesh.schema";

const registry = new OpenAPIRegistry();

// -----------------------------------------------------------------------------
// Security Schemes
// -----------------------------------------------------------------------------
registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "better-auth.session_token",
    description: "Better-Auth session cookie for authenticated users / admins",
});

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    description: "Optional Bearer token authorization header",
});

// -----------------------------------------------------------------------------
// Standard Error Response Schemas
// -----------------------------------------------------------------------------
const ErrorResponse = registry.register(
    "ErrorResponse",
    z.object({
        success: z.boolean().default(false),
        error: z.string(),
        message: z.string().optional(),
    }),
);

const UnauthorizedResponse = registry.register(
    "UnauthorizedResponse",
    z.object({
        success: z.boolean().default(false),
        error: z.string().default("Unauthorized"),
    }),
);

const RateLimitResponse = registry.register(
    "RateLimitResponse",
    z.object({
        success: z.boolean().default(false),
        error: z.string().default("Too Many Requests"),
    }),
);

// -----------------------------------------------------------------------------
// Registered Models
// -----------------------------------------------------------------------------
registry.register("LoginRequest", loginSchema);
registry.register("RegisterRequest", registerSchema);
registry.register("DestinationInput", destinationSchema);
registry.register("UmkmInput", umkmSchema);
registry.register("AccommodationInput", accommodationSchema);
registry.register("CategoryInput", categorySchema);
registry.register("FacilityInput", facilitySchema);
registry.register("ReviewInput", createReviewSchema);
registry.register("ReportInput", createReportSchema);
registry.register("CreateValidationInput", createValidationSchema);
registry.register("ProcessDestinationValidationInput", processDestinationValidationSchema);
registry.register("AceshIndicatorInput", aceshIndicatorSchema);
registry.register("AceshScoringConfigInput", aceshScoringConfigSchema);

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================
registry.registerPath({
    method: "post",
    path: "/api/auth/sign-in/email",
    tags: ["Auth"],
    summary: "User Sign-In via Email",
    description: "Authenticates a user using email & password. Sets session cookie.",
    request: {
        body: {
            content: { "application/json": { schema: loginSchema } },
        },
    },
    responses: {
        200: { description: "Sign in successful" },
        400: { description: "Invalid credentials or request data", content: { "application/json": { schema: ErrorResponse } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-up/email",
    tags: ["Auth"],
    summary: "User Registration via Email",
    description: "Registers a new user account (role defaults strictly to 'user').",
    request: {
        body: {
            content: { "application/json": { schema: registerSchema } },
        },
    },
    responses: {
        200: { description: "User registered successfully, verification email sent" },
        400: { description: "Validation error or email already in use", content: { "application/json": { schema: ErrorResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/auth/get-session",
    tags: ["Auth"],
    summary: "Get Current Active Session",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Current active user session & profile" },
        401: { description: "Not authenticated", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

// =============================================================================
// VALIDATIONS (ADMIN ONLY)
// =============================================================================
registry.registerPath({
    method: "get",
    path: "/api/validations",
    tags: ["Validations"],
    summary: "List Halal Validations (Admin Only)",
    security: [{ cookieAuth: [] }],
    parameters: [
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        { name: "cursor", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "ALL"] } },
    ],
    responses: {
        200: { description: "Paginated list of validations" },
        401: { description: "Unauthorized / Admin access required", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/validations",
    tags: ["Validations"],
    summary: "Create Halal Validation Queue Entry (Admin Only)",
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: createValidationSchema } } },
    },
    responses: {
        201: { description: "Validation entry created" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/validations/{id}",
    tags: ["Validations"],
    summary: "Get Validation Detail by ID or Destination ID (Admin Only)",
    security: [{ cookieAuth: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
        200: { description: "Validation record details" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
        404: { description: "Validation not found" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/validations/{id}",
    tags: ["Validations"],
    summary: "Approve or Reject Halal Validation (Admin Only)",
    description: "Audits destination or certification validation, updates scores, triggers ACES-H assessment recalculation, and logs audit record.",
    security: [{ cookieAuth: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    request: {
        body: { content: { "application/json": { schema: processDestinationValidationSchema } } },
    },
    responses: {
        200: { description: "Validation processed & destination status updated" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
        400: { description: "Validation error" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/validations/{id}",
    tags: ["Validations"],
    summary: "Delete Validation Record (Admin Only)",
    security: [{ cookieAuth: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
        200: { description: "Validation deleted" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

// =============================================================================
// ADMIN & ANALYTICS
// =============================================================================
registry.registerPath({
    method: "get",
    path: "/api/admin/ai-test",
    tags: ["Admin"],
    summary: "Run AI Intent Classification Test Suite (Admin Only)",
    description: "Executes LLM intent benchmark suite. Rate limited to 10 req/min.",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Test execution summary & accuracy" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
        429: { description: "Rate limit exceeded", content: { "application/json": { schema: RateLimitResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/acesh/dashboard",
    tags: ["Admin"],
    summary: "ACES-H Audit & Assessment Dashboard (Admin Only)",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "ACES-H ecosystem readiness summary & destination scores" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/analytics/gap-analysis",
    tags: ["Admin"],
    summary: "Destination & UMKM Engagement Gap Analysis (Admin Only)",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "List of high-engagement low-validation destinations & UMKMs" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/analytics",
    tags: ["Admin"],
    summary: "Admin Analytics Overview (Admin Only)",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Top bookmarks, WhatsApp clicks, and CTA conversion summary" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/analytics/trends",
    tags: ["Admin"],
    summary: "6-Month Engagement Trends (Admin Only)",
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: "Monthly trend points for views, bookmarks, routes, and WhatsApp clicks" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/destinations/{id}/acesh/recommendations",
    tags: ["Admin"],
    summary: "Get ACES-H Improvement Recommendations for Destination (Admin Only)",
    security: [{ cookieAuth: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
        200: { description: "Calculated RIS recommendations, quick wins, and strategic actions" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/destinations/{id}/acesh/recommendations",
    tags: ["Admin"],
    summary: "Persist/Update Recommendation Action Lifecycle (Admin Only)",
    security: [{ cookieAuth: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
        200: { description: "Recommendation action status updated" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

// =============================================================================
// PUBLIC AI & EXPLORE ENDPOINTS
// =============================================================================
registry.registerPath({
    method: "get",
    path: "/api/explore",
    tags: ["AI & Explore"],
    summary: "AI-Powered Destination Search & Proximity Explore",
    description: "Public query endpoint with Gemini 2.0 AI ranking, location strictness, and fallback. Rate limited (30 req/min).",
    parameters: [
        { name: "q", in: "query", required: true, schema: { type: "string", maxLength: 500 } },
        { name: "lat", in: "query", schema: { type: "number" } },
        { name: "lng", in: "query", schema: { type: "number" } },
    ],
    responses: {
        200: { description: "Top AI-recommended destinations matching user query" },
        400: { description: "Invalid query parameter", content: { "application/json": { schema: ErrorResponse } } },
        429: { description: "Rate limit exceeded (30 req/min)", content: { "application/json": { schema: RateLimitResponse } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/recommendations",
    tags: ["AI & Explore"],
    summary: "AI Preference-Based Destination Recommender",
    description: "Curates top destinations based on user preferences. Rate limited (30 req/min).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        preferences: z.array(z.string()).default([]),
                        limit: z.number().min(1).max(20).default(5),
                    }),
                },
            },
        },
    },
    responses: {
        200: { description: "Curated destination recommendations" },
        429: { description: "Rate limit exceeded (30 req/min)", content: { "application/json": { schema: RateLimitResponse } } },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/assistant/route-finder",
    tags: ["AI & Explore"],
    summary: "AI Smart Intent & Itinerary Route Finder Assistant",
    description: "Intent classification (DESTINATION_SEARCH, ITINERARY_RECOMMENDATION, FACILITY_CHECK) using Groq llama-3.1-8b-instant. Rate limited (30 req/min).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        query: z.string().min(1).max(500),
                    }),
                },
            },
        },
    },
    responses: {
        200: { description: "Structured AI intent payload or redirect route" },
        429: { description: "Rate limit exceeded (30 req/min)", content: { "application/json": { schema: RateLimitResponse } } },
    },
});

// =============================================================================
// DESTINATIONS
// =============================================================================
registry.registerPath({
    method: "get",
    path: "/api/destinations",
    tags: ["Destinations"],
    summary: "List Destinations",
    responses: {
        200: { description: "List of approved halal tourism destinations" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/destinations",
    tags: ["Destinations"],
    summary: "Create Destination (Admin Only)",
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: destinationSchema } } },
    },
    responses: {
        201: { description: "Destination created & pending validation queued" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/destinations/{id}",
    tags: ["Destinations"],
    summary: "Get Destination Details by ID or Slug",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
        200: { description: "Destination detail with categories, facilities, and scores" },
        404: { description: "Destination not found" },
    },
});

// =============================================================================
// UMKMS & ACCOMMODATIONS
// =============================================================================
registry.registerPath({
    method: "get",
    path: "/api/umkms",
    tags: ["UMKM"],
    summary: "List UMKMs",
    responses: {
        200: { description: "List of halal UMKMs" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/umkms",
    tags: ["UMKM"],
    summary: "Create UMKM (Admin Only)",
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: umkmSchema } } },
    },
    responses: {
        201: { description: "UMKM record created" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/accommodations",
    tags: ["Accommodations"],
    summary: "List Accommodations",
    responses: {
        200: { description: "List of halal accommodations" },
    },
});

// =============================================================================
// UPLOAD API
// =============================================================================
registry.registerPath({
    method: "post",
    path: "/api/upload",
    tags: ["Upload"],
    summary: "Upload Image File to Cloudinary",
    description: "Requires authenticated session. Rate limited (20 req/min). Max file size 5MB.",
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        file: z.string().openapi({ type: "string", format: "binary" }),
                        folder: z.string().optional().default("destinations"),
                    }),
                },
            },
        },
    },
    responses: {
        200: { description: "Image optimized & uploaded to Cloudinary" },
        401: { description: "Unauthorized", content: { "application/json": { schema: UnauthorizedResponse } } },
        429: { description: "Rate limit exceeded (20 req/min)", content: { "application/json": { schema: RateLimitResponse } } },
    },
});

export function generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV31(registry.definitions);

    return generator.generateDocument({
        openapi: "3.1.0",
        info: {
            title: "Hyperlocal Halal Ecosystem API Docs",
            version: "0.1.0",
            description:
                "API documentation for Hyperlocal Halal Tourism Platform — including Auth, Validations, Admin Management, ACES-H Scoring Engine, and AI-powered Search.",
            contact: {
                name: "Hyperlocal Development Team",
                url: "https://github.com/anomalyco/antigravity/issues",
            },
        },
        servers: [
            {
                url: "/",
                description: "Current Server Environment",
            },
        ],
    });
}
