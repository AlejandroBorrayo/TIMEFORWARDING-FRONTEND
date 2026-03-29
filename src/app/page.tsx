import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Time Forwarding: logística internacional, agente de carga y soluciones door to door. Parte de Time Group.",
};

export default function HomePage() {
  const whatsAppPhoneRaw =
    process.env.NEXT_TIME_WHATS_APP?.trim() ||
    process.env.NEXT_PUBLIC_NEXT_TIME_WHATS_APP?.trim();
  return <LandingPage whatsAppPhoneRaw={whatsAppPhoneRaw} />;
}
