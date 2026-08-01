require("dotenv").config({ path: ".env" });
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../lib/generated/prisma");

async function main() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const c = new PrismaClient({ adapter });
    const count = await c.aceshIndicator.count();
    const tables = await c.$queryRaw`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    `;
    console.log("aceshIndicator count:", count);
    console.log("acesh tables:", tables.map((t) => t.tablename).filter((n) => n.includes("acesh") || n.includes("reachability")));
    await c.$disconnect();
}

main().catch((e) => {
    console.error("ERR:", e.message);
    process.exit(1);
});
