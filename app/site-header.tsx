"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SiteHeaderProps = {
  page: "portfolio" | "offer";
};

const navigation = [
  { label: "Expertise", portfolioHref: "#expertise", offerHref: "/#expertise" },
  { label: "Expérience", portfolioHref: "#experience", offerHref: "/#experience" },
  { label: "Offre", portfolioHref: "/offer", offerHref: "/offer" },
  { label: "Projets", portfolioHref: "#projects", offerHref: "/#projects" },
  { label: "Contact", portfolioHref: "#contact", offerHref: "#contact" },
];

export function SiteHeader({ page }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isOffer = page === "offer";

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };

    const desktopQuery = window.matchMedia("(min-width: 1121px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={isOffer ? "topbar offer-topbar" : "topbar"}
    >
      <Link
        className="monogram"
        href={isOffer ? "/" : "#top"}
        aria-label={isOffer ? "Retour au portfolio" : "Retour en haut"}
      >
        <Image
          src="/logo-jm-header.png"
          alt=""
          width={48}
          height={48}
          priority
          unoptimized
        />
      </Link>

      <div className="status">
        <span className="status-dot" aria-hidden="true" />
        Disponible pour missions freelance
      </div>

      <button
        ref={menuButtonRef}
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? "Fermer" : "Menu"}
      </button>

      <nav
        id="main-nav"
        className={`${isOffer ? "nav offer-nav" : "nav"}${menuOpen ? " open" : ""}`}
        aria-label="Navigation principale"
      >
        {navigation.map((item) => {
          const href = isOffer ? item.offerHref : item.portfolioHref;
          const isCurrent = isOffer && item.label === "Offre";

          return (
            <Link
              key={item.label}
              className={isCurrent ? "offer-nav-active" : undefined}
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
