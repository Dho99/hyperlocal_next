import { UmkmDetail } from "@/components/admin/umkms/umkm-detail";

interface UmkmDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UmkmDetailPage({ params }: UmkmDetailPageProps) {
  const { id } = await params;
  return <UmkmDetail id={id} />;
}
