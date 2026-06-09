import type { Metadata } from "next";
import PetaMapDynamic from "./components/peta-map-dynamic";

export const metadata: Metadata = {
    title: "Peta Interaktif",
    description:
        "Jelajahi destinasi wisata halal di sekitar Anda dengan peta interaktif.",
};

export default function PetaPage() {
    return <PetaMapDynamic />;
}
