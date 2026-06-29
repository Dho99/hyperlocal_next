import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail } from "./auth-email";
import { fixUnverifiedReRegistration } from "./auth-plugin-fix-unverified";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail,
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600, // 1 hour
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                input: true,
            },
        },
    },
    plugins: [
        // admin(),
        fixUnverifiedReRegistration,
        nextCookies(),
    ],
    advanced: {
        trustedProxyHeaders: true,
    },
});
