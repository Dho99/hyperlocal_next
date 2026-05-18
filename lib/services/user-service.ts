import { prisma } from "@/lib/prisma";

export async function getUmkmOwners() {
    return await prisma.user.findMany({
        where: {
            role: "umkm_owner"
        },
        select: {
            id: true,
            name: true,
            email: true
        },
        orderBy: {
            name: "asc"
        }
    });
}

export async function getUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        },
        orderBy: {
            name: "asc"
        }
    });
}
