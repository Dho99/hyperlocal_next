import type { Metadata } from "next";
import PetaMapClient from "./components/peta-map-client";

export const metadata: Metadata = {
    title: "Peta Interaktif - HyperLocal",
    description:
        "Jelajahi destinasi wisata halal di sekitar Anda dengan peta interaktif HyperLocal.",
};

export default function PetaPage() {
    return <PetaMapClient />;
}
