"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowIcon } from "./arrow-icon";
import { BookingLink } from "./booking-link";
import { project } from "./home-content";
import styles from "./site-header.module.css";

// The header shared by every page: `page` lights its station on the route.
type SiteHeaderProps = {
  page: "portfolio" | "offer" | "project";
};

// The route: one station per page, in a fixed order; `page` is the page
// that lights it.
const stations = [
  {
    number: "01",
    label: "Accueil",
    description: "Mon parcours et ce qui l’a construit",
    path: "/",
    page: "portfolio",
  },
  {
    number: "02",
    label: "Projets",
    description: `${project.name} · ${project.bot.name}`,
    path: project.page,
    page: "project",
  },
  {
    number: "03",
    label: "Offre",
    description: "Comment j’audite une chaîne de delivery",
    path: "/offer",
    page: "offer",
  },
] as const;

const availability = "Disponible pour missions freelance";

export function SiteHeader({ page }: SiteHeaderProps) {
  const [folded, setFolded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const current = stations.findIndex((station) => station.page === page);
  const onHome = page === "portfolio";
  const homeHref = onHome ? "#top" : "/";

  const hrefFor = (path: string) => (path === "/" ? homeHref : path);

  // The bar and the rail fold away while reading down and come back, with
  // the booking action, on the way up.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (reduceMotion || Math.abs(y - lastY) < 8) return;
      setFolded(y > lastY && y > 160);
      lastY = y;
    };
    update();
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const openSheet = () => sheetRef.current?.showModal();
  const closeSheet = () => sheetRef.current?.close();

  const routeStyle = { "--current": Math.max(current, 0) } as CSSProperties;

  return (
    <header
      className={styles.header}
      data-folded={folded ? "" : undefined}
      data-scrolled={scrolled ? "" : undefined}
    >
      <div className={styles.bar}>
        <div className={styles.identity}>
          <Link
            className={styles.monogram}
            href={homeHref}
            aria-label={onHome ? "Retour en haut" : "Retour à l’accueil"}
          >
            <Image src="/logo-jm-header.png" alt="" width={48} height={48} priority unoptimized />
          </Link>
          <p className={styles.availability}>{availability}</p>
        </div>

        <nav className={styles.route} aria-label="Navigation principale">
          <ol>
            {stations.map((station, index) => (
              <li key={station.label} data-traced={current >= index && index > 0 ? "" : undefined}>
                <Link
                  className={styles.station}
                  href={hrefFor(station.path)}
                  aria-current={index === current ? "page" : undefined}
                >
                  <span className={styles.node} aria-hidden="true" />
                  <span className={styles.number}>{station.number}</span>
                  {station.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.actions}>
          <BookingLink className={`${styles.cta} ${styles.ctaWide}`} placement="header" label="Planifier un échange">
            Planifier un échange
            <ArrowIcon />
          </BookingLink>
          <BookingLink className={`${styles.cta} ${styles.ctaShort}`} placement="header" label="Contact">
            Contact
          </BookingLink>
        </div>
      </div>

      <nav
        className={styles.rail}
        style={routeStyle}
        aria-label="Navigation principale"
      >
        <span className={styles.railTrace} data-on={current > 0 ? "" : undefined} aria-hidden="true" />
        <ol>
          {stations.map((station, index) => (
            <li key={station.label}>
              <Link
                className={styles.railStation}
                href={hrefFor(station.path)}
                aria-current={index === current ? "page" : undefined}
              >
                <span className={styles.node} aria-hidden="true" />
                {station.label}
              </Link>
            </li>
          ))}
        </ol>
        <button
          className={styles.more}
          type="button"
          aria-haspopup="dialog"
          aria-controls="site-index"
          onClick={openSheet}
        >
          Plus
        </button>
      </nav>

      <dialog
        id="site-index"
        ref={sheetRef}
        className={styles.sheet}
        aria-labelledby="site-index-title"
        // A tap on the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSheet();
        }}
      >
        <div className={styles.sheetHead}>
          <h2 id="site-index-title" className={styles.sheetTitle}>
            Sommaire
          </h2>
          <button className={styles.close} type="button" onClick={closeSheet}>
            Fermer
          </button>
        </div>
        <p className={styles.sheetAvailability}>{availability}</p>
        <ol className={styles.index}>
          {stations.map((entry) => (
            <li key={entry.label}>
              <Link
                href={hrefFor(entry.path)}
                aria-current={entry.page === page ? "page" : undefined}
                onClick={closeSheet}
              >
                <span className={styles.indexNode} aria-hidden="true" />
                <span className={styles.number}>{entry.number}</span>
                <span className={styles.indexText}>
                  <strong>{entry.label}</strong>
                  <span>
                    {/* The project name never breaks at its hyphen. */}
                    {entry.description.split(project.name).map((part, index) => (
                      <span key={index}>
                        {index > 0 && <span className={styles.nowrap}>{project.name}</span>}
                        {part}
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <BookingLink className={styles.sheetCta} placement="header" label="Planifier un échange">
          Planifier un échange
            <ArrowIcon />
        </BookingLink>
      </dialog>
    </header>
  );
}
