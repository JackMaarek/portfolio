import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buildBookingUrl, type BookingPlacement } from "./site-contact";

type BookingLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel" | "aria-label"
> & {
  placement: BookingPlacement;
  // Visible text, repeated first in the accessible name (WCAG 2.5.3).
  label: string;
  children: ReactNode;
};

export function BookingLink({ placement, label, children, ...anchorProps }: BookingLinkProps) {
  return (
    <a
      {...anchorProps}
      href={buildBookingUrl(placement)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} : réserver un échange de 30 minutes (ouvre Cal.com dans un nouvel onglet)`}
    >
      {children}
    </a>
  );
}
