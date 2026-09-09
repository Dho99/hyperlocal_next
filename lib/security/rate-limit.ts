// ponytail: in-memory, single instance. Upgrade to Upstash Redis when multi-instance.
const store = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }
    if (entry.count >= limit) return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    entry.count++;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function rateLimit(key: string, limit: number, windowMs: number) {
    return hit(key, limit, windowMs);
}

export function getClientKey(req: Request, prefix: string) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
    return `${prefix}:${ip}`;
}

setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
}, 60_000).unref?.();
