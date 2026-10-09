// Single contact channel for the whole site: the Cal.com booking page.
export const CONTACT_BOOKING_URL = "https://cal.com/jack-maarek-zmdq16/30min";

export type BookingPlacement =
  | "home-contact"
  | "offer-hero"
  | "offer-short"
  | "offer-full"
  | "offer-contact";

// Tags each CTA with UTM parameters so bookings can be attributed to a placement.
export function buildBookingUrl(placement: BookingPlacement) {
  const url = new URL(CONTACT_BOOKING_URL);
  url.searchParams.set("utm_source", "site");
  url.searchParams.set("utm_medium", "cta");
  url.searchParams.set("utm_content", placement);
  return url.toString();
}
