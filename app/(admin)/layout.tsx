import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/halal");
    }

    if (session.user.role !== "admin") {
        redirect("/unauthorized");
    }

    return <AdminLayout user={session.user}>{children}</AdminLayout>;
}
