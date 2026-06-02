export interface MapFacility {
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
}

export interface MapDestination {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    facilities: MapFacility[];
}

export interface DashboardMapDestination {
    id: string;
    name: string;
    slug: string;
    category?: string;
    status?: string;
    latitude: number;
    longitude: number;
}
