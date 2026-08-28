import type { Metadata } from "next";
import { EffectLabExperience } from "./effect-lab-experience";

export const metadata: Metadata = {
  title: "System Trace Lab — Jacques Maarek",
  description: "Démonstration isolée d’une topologie de delivery pilotée par le scroll.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EffectLabPage() {
  return <EffectLabExperience />;
}
