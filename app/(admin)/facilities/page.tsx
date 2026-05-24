import { getDestinations } from "@/lib/services/destination-service";
import { FacilitiesContent } from "@/components/admin/facilities/facilities-content";

export default async function FacilitiesPage() {
    const destinations = await getDestinations();

    return (
        <FacilitiesContent
            destinations={destinations}
        />
    );
}
