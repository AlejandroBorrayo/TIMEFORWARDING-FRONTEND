import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Time Forwarding: logística internacional, agente de carga y soluciones door to door. Parte de Time Group.",
};

export default function HomePage() {
  return <LandingPage />;
}
