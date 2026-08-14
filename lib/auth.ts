import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./auth-email";
import { fixUnverifiedReRegistration } from "./auth-plugin-fix-unverified";
import { verificationEmailCooldown } from "./auth-plugin-verification-cooldown";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: sendPasswordResetEmail,
        resetPasswordTokenExpiresIn: 3600, // 1 hour
    },
    emailVerification: {
        sendVerificationEmail,
        sendOnSignUp: true,
        sendOnSignIn: false,
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
        verificationEmailCooldown,
        nextCookies(),
    ],
    advanced: {
        trustedProxyHeaders: true,
    },
});
