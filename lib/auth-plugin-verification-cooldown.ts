/**
 * Plugin: verification-email-cooldown
 *
 * Mencegah pengiriman email verifikasi berulang untuk email yang sama
 * selama token verifikasi sebelumnya masih berlaku (cooldown 1 jam,
 * mengikuti `emailVerification.expiresIn`).
 *
 * - Hook `/send-verification-email`: blokir pengiriman jika cooldown masih
 *   aktif (klien tetap menerima sukses agar tidak membocorkan status email).
 * - Hook `/sign-up/email`: tandai cooldown untuk user BARU yang akan
 *   menerima email (sendOnSignUp) sehingga tombol "Kirim Ulang" ikut
 *   diblokir dalam 1 jam pertama. Email yang sudah terdaftar TIDAK ditandai
 *   karena re-register memang tidak mengirim email apa pun.
 */

import type { BetterAuthPlugin } from "better-auth";

const COOLDOWN_PREFIX = "verification-email:";

interface CooldownRecord {
    expiresAt: Date;
}

interface CooldownCtx {
    body?: unknown;
    context: {
        internalAdapter: {
            findUserByEmail: (
                email: string,
            ) => Promise<{
                user: { id: string; emailVerified: boolean } | null;
            } | null>;
            findVerificationValue: (
                identifier: string,
            ) => Promise<CooldownRecord | null>;
            createVerificationValue: (data: {
                identifier: string;
                value: string;
                expiresAt: Date;
            }) => Promise<unknown>;
        };
        options: {
            emailVerification?: { expiresIn?: number };
        };
    };
}

function getEmailFromBody(body: unknown): string | null {
    if (typeof body !== "object" || body === null) return null;
    const email = (body as { email?: unknown }).email;
    return typeof email === "string" && email.trim() ? email.toLowerCase() : null;
}

function isCooldownActive(record: CooldownRecord | null): boolean {
    return !!record && new Date(record.expiresAt) > new Date();
}

async function markCooldown(ctx: CooldownCtx, email: string): Promise<void> {
    const identifier = `${COOLDOWN_PREFIX}${email}`;
    const existing = await ctx.context.internalAdapter.findVerificationValue(
        identifier,
    );
    if (isCooldownActive(existing)) return;

    const expiresInSeconds =
        ctx.context.options.emailVerification?.expiresIn ?? 3600;
    try {
        await ctx.context.internalAdapter.createVerificationValue({
            identifier,
            value: "cooldown",
            expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
        });
    } catch {
        // best-effort
    }
}

export const verificationEmailCooldown = {
    id: "verification-email-cooldown",
    hooks: {
        before: [
            {
                matcher: (ctx: { path?: string }) =>
                    ctx.path === "/send-verification-email",
                handler: async (inputContext: unknown) => {
                    const ctx = inputContext as CooldownCtx;
                    const email = getEmailFromBody(ctx.body);
                    if (!email) return;

                    const user =
                        await ctx.context.internalAdapter.findUserByEmail(
                            email,
                        );
                    if (!user?.user || user.user.emailVerified) return;

                    const identifier = `${COOLDOWN_PREFIX}${email}`;
                    const existing =
                        await ctx.context.internalAdapter.findVerificationValue(
                            identifier,
                        );
                    if (isCooldownActive(existing)) {
                        // Masih dalam masa cooldown — jangan kirim ulang.
                        // Respons sukses palsu agar konsisten dengan perilaku
                        // anti-enumerasi endpoint bawaan better-auth.
                        return {
                            response: Response.json({ status: true }),
                        };
                    }

                    await markCooldown(ctx, email);
                },
            },
            {
                matcher: (ctx: { path?: string }) =>
                    ctx.path === "/sign-up/email",
                handler: async (inputContext: unknown) => {
                    const ctx = inputContext as CooldownCtx;
                    const email = getEmailFromBody(ctx.body);
                    if (!email) return;

                    const existing =
                        await ctx.context.internalAdapter.findUserByEmail(
                            email,
                        );
                    // Hanya user baru yang akan menerima email sendOnSignUp.
                    if (existing?.user) return;

                    await markCooldown(ctx, email);
                },
            },
        ],
    },
} satisfies BetterAuthPlugin;
