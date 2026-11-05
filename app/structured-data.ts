import { CONTACT_BOOKING_URL } from "./site-contact";
import { siteOrigin } from "./site-metadata";

// Prices mirror the "À partir de … € HT" plans in app/offer/offer-page-body.tsx.
// A source test keeps both in sync; never change one without the other.
export const offerPlansStructured = [
  { name: "Diagnostic court", durationDays: 3, minPriceEur: 1560 },
  { name: "Diagnostic complet", durationDays: 5, minPriceEur: 2600 },
] as const;

const personId = `${siteOrigin}/#person`;

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": personId,
  name: "Jacques Maarek",
  jobTitle: "Platform Engineer",
  url: `${siteOrigin}/`,
  knowsAbout: ["Kubernetes", "GitOps", "CI/CD", "Observabilité", "Infrastructure as Code", "AWS"],
  sameAs: ["https://github.com/JackMaarek"],
};

export const offerServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Diagnostic CI/CD & Observabilité",
  url: `${siteOrigin}/offer`,
  description:
    "Diagnostic de la chaîne de livraison (CI/CD, Kubernetes et GitOps, observabilité) en 3 à 5 jours, avec constats priorisés et roadmap 30/60 jours.",
  areaServed: { "@type": "Country", name: "France" },
  // Inline the provider: @id references only resolve within the same page.
  provider: { "@type": "Person", "@id": personId, name: "Jacques Maarek", url: `${siteOrigin}/` },
  offers: offerPlansStructured.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} — ${plan.durationDays} jours`,
    url: CONTACT_BOOKING_URL,
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: plan.minPriceEur,
      priceCurrency: "EUR",
      valueAddedTaxIncluded: false,
    },
  })),
};
