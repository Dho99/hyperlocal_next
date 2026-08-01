import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BasicInfoForm } from "@/components/admin/settings/basic-info-form";
import { ChangePasswordForm } from "@/components/admin/settings/change-password-form";

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/halal");
    }

    const user = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
    };

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
                    Pengaturan Profil
                </h1>
                <p className="text-muted-foreground">
                    Kelola informasi profil dan kata sandi Anda.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <BasicInfoForm user={user} />
                <ChangePasswordForm />
            </div>
        </div>
    );
}
