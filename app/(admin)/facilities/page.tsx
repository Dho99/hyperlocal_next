import { getFacilities } from "@/lib/services/facility-service";
import { getDestinations } from "@/lib/services/destination-service";
import { FacilitiesContent } from "@/components/admin/facilities/facilities-content";
import type { Facility } from "@/types/fasilitas";

export default async function FacilitiesPage() {
    const [facilities, destinations] = await Promise.all([
        getFacilities(),
        getDestinations(),
    ]);

    return (
        <FacilitiesContent
            initialFacilities={facilities as Facility[]}
            destinations={destinations}
        />
    );
}
