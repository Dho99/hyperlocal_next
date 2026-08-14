/**
 * Plugin: fix-unverified-re-registration
 *
 * Problem: When email verification is required, an attacker can register
 * with someone else's email. The real owner verifies the email, but the
 * password was set by the attacker — locking the real owner out.
 *
 * Fix: When a user attempts to sign up with an email that already exists
 * AND is unverified, silently update the password (and name) to the new
 * values. The sign-up endpoint returns a generic "success" response for
 * security (email enumeration prevention), but now the real owner's
 * password is the one that gets stored.
 */

import type { BetterAuthPlugin } from "better-auth";

export const fixUnverifiedReRegistration = {
    id: "fix-unverified-re-registration",
    hooks: {
        before: [
            {
                matcher: (ctx: { path?: string }) =>
                    ctx.path === "/sign-up/email",
                handler: async (ctx: any) => {
                    const body = ctx.body;
                    const email = body?.email?.toLowerCase();
                    const password = body?.password;
                    const name = body?.name;

                    if (!email || !password) return;

                    // Check if a user with this email already exists
                    const existing = await ctx.context.internalAdapter.findUserByEmail(email);

                    // Only intervene if the existing user is UNVERIFIED
                    if (existing?.user && !existing.user.emailVerified) {
                        // Hash the new password and update it
                        const hash = await ctx.context.password.hash(password);
                        await ctx.context.internalAdapter.updatePassword(
                            existing.user.id,
                            hash,
                        );

                        // Also update the name if provided
                        if (name) {
                            await ctx.context.internalAdapter.updateUser(
                                existing.user.id,
                                { name },
                            );
                        }
                    }
                },
            },
        ],
    },
} satisfies BetterAuthPlugin;
