import { BookingLink } from "./booking-link";
import type { BookingPlacement } from "./site-contact";

type SiteFooterProps = {
  label: string;
  placement: BookingPlacement;
};

// Contact footer shared by the home and the project pages.
export function SiteFooter({ label, placement }: SiteFooterProps) {
  return (
    <footer id="contact" className="contact">
      <div className="contact-top">
        <p className="section-label">{label}</p>
        <p>Un besoin plateforme, cloud<br />ou automatisation ?</p>
      </div>
      <BookingLink
        className="contact-mail"
        placement={placement}
        label="Parlons-en"
        // StringTune's magnetic effect, running on the home.
        {...({ string: "magnetic" } as Record<string, string>)}
      >
        Parlons-en<span aria-hidden="true">↗</span>
      </BookingLink>
      <div className="footer-meta">
        <span>Jacques Maarek · Platform Engineer</span>
        <a
          href="https://github.com/JackMaarek"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub de Jacques Maarek (nouvel onglet)"
        >
          GitHub ↗
        </a>
        <a href="#top">Retour en haut ↑</a>
        <span>Paris · 2026</span>
      </div>
    </footer>
  );
}
