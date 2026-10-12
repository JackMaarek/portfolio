"use client";

import { useEffect, useRef, useState } from "react";
import { BookingLink } from "../../booking-link";
import { deliverables, recommendationSteps } from "../offer-content";
import { chainNodes, cover, dossierPages, nodeFindings } from "./dossier-content";
import type { DossierScene } from "./dossier-scene";
import styles from "./dossier.module.css";

const lastPage = dossierPages.length - 1;
const scenePages = dossierPages.map((page) => ({ focus: page.focus }));
const quickWins = deliverables.find((item) => item.title === "Quick wins")?.title ?? "Quick wins";

const pageName = (index: number) => {
  const page = dossierPages[index];
  return page.day ? `${page.day} · ${page.title}` : "Couverture";
};

// Continuous page position: 0 on the cover, 1 on J1, fractions in between.
// Wide screens: a page is current when its sheet is centred in the viewport.
// Phones: the scene is a band at the top and a page is current once its
// sheet reaches the band; the camera moves in the gap before the next one.
// Band layout (scene above, sheets below): phones and tablets. Landscape
// phones (short viewports) keep the side layout.
// Mirrors the media query in dossier.module.css.
const phoneQuery = "(max-width: 599px), (max-width: 1180px) and (min-height: 500px)";

function readProgress(sections: HTMLElement[], stage: HTMLElement | null, phone: boolean) {
  const anchor = phone && stage ? stage.getBoundingClientRect().bottom + 24 : window.innerHeight / 2;
  const marks = sections.map((section) => {
    const rect = section.getBoundingClientRect();
    return phone ? rect.top : rect.top + rect.height / 2;
  });
  if (anchor <= marks[0]) return 0;
  for (let index = 0; index < marks.length - 1; index += 1) {
    if (anchor < marks[index + 1]) {
      const fraction = (anchor - marks[index]) / (marks[index + 1] - marks[index]);
      if (!phone) return index + fraction;
      const t = Math.min(Math.max((fraction - 0.7) / 0.3, 0), 1);
      return index + t * t * (3 - 2 * t);
    }
  }
  return marks.length - 1;
}

export function Dossier() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [indexShown, setIndexShown] = useState(false);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelLayer = labelsRef.current;
    if (!canvas || !labelLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phoneMedia = window.matchMedia(phoneQuery);
    let scene: DossierScene | undefined;
    let disposed = false;
    let loading = false;
    let near = false;
    let pending = 0;

    const sync = () => {
      pending = 0;
      const progress = readProgress(sectionRefs.current, stageRef.current, phoneMedia.matches);
      scene?.setProgress(progress);
      setActivePage(Math.round(progress));
    };
    // Scroll far from the dossier reads no layout: progress only moves
    // while it is near the viewport.
    const onScroll = () => {
      if (near && !pending) pending = requestAnimationFrame(sync);
    };

    // Pause rendering once the dossier has scrolled out of view.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      scene?.setActive(entry.isIntersecting);
    });
    // The fixed page index only shows while the dossier holds the middle of
    // the viewport, not over the hero or the sections after it.
    const indexObserver = new IntersectionObserver(
      ([entry]) => setIndexShown(entry.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    if (rootRef.current) indexObserver.observe(rootRef.current);

    // Tell the scene which part of the canvas is free: beside the sheet and
    // the index on wide screens, the whole band on phones.
    const measureFrame = () => {
      const stage = stageRef.current;
      const sheet = sectionRefs.current[0]?.querySelector("article");
      const index = indexRef.current;
      if (!stage || !sheet || !index) return;
      const stageRect = stage.getBoundingClientRect();
      // The site header only overlaps the stage when the dossier opens the page.
      const topbar = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(topbar - stageRect.top, 0) + 4;
      if (phoneMedia.matches) {
        scene?.setFrame({ band: true, left: 0, right: 0, top });
        return;
      }
      scene?.setFrame({
        band: false,
        left: sheet.getBoundingClientRect().right - stageRect.left + 16,
        right: stageRect.right - index.getBoundingClientRect().left + 12,
        top,
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      measureFrame();
      onScroll();
    });

    // Three.js and the WebGL context are only paid for by visitors who
    // scroll towards the dossier, not by those who leave from the hero.
    const loadScene = () => {
      if (loading) return;
      loading = true;
      import("./dossier-scene")
        .then(({ createDossierScene }) => {
          if (disposed) return;
          scene = createDossierScene({
            canvas,
            labelLayer,
            pages: scenePages,
            nodes: chainNodes,
            findings: nodeFindings,
            quickWins,
            reducedMotion,
            classNames: {
              label: styles.label,
              name: styles.labelName,
              meta: styles.labelMeta,
              node: styles.node,
              tag: styles.tag,
              finding: styles.finding,
              axis: styles.axis,
            },
            onContextLost: () => setSceneState("unavailable"),
          });
          measureFrame();
          resizeObserver.observe(canvas);
          if (rootRef.current) visibilityObserver.observe(rootRef.current);
          sync();
          setSceneState("ready");
        })
        // No WebGL (or the chunk failed): the dossier stays fully readable.
        .catch(() => setSceneState("unavailable"));
    };

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (!near) return;
        loadScene();
        onScroll();
      },
      { rootMargin: "50% 0px" },
    );
    if (rootRef.current) nearObserver.observe(rootRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      indexObserver.disconnect();
      nearObserver.disconnect();
      if (pending) cancelAnimationFrame(pending);
      scene?.dispose();
    };
  }, []);

  const goToPage = (index: number) => {
    const section = sectionRefs.current[index];
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia(phoneQuery).matches;
    const band = phone ? (stageRef.current?.offsetHeight ?? 0) : 0;
    const rect = section.getBoundingClientRect();
    const top = phone
      ? window.scrollY + rect.top - band
      : window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  return (
    <div ref={rootRef} id="offer-content" className={styles.dossier}>
      <div ref={stageRef} className={styles.stage} data-scene={sceneState} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.canvas} />
        <div ref={labelsRef} className={styles.labels} />
      </div>

      <nav
        ref={indexRef}
        className={styles.index}
        data-shown={indexShown}
        aria-label="Pages du dossier"
      >
        <a className={styles.skip} href="#dossier-report">
          Aller à la restitution
        </a>
        <ol>
          {dossierPages.map((page, index) => (
            <li key={page.key}>
              <button
                type="button"
                aria-label={pageName(index)}
                aria-current={activePage === index ? "step" : undefined}
                onClick={() => goToPage(index)}
              >
                {page.day ?? "Dossier"}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {dossierPages.map((page, index) => (
        <section
          key={page.key}
          id={index === lastPage ? "dossier-report" : `dossier-${page.key}`}
          ref={(element) => {
            if (element) sectionRefs.current[index] = element;
          }}
          className={styles.page}
          data-active={activePage === index}
          aria-labelledby={`dossier-${page.key}-title`}
        >
          <article className={styles.sheet}>
            {index === 0 ? (
              <>
                <h2 id={`dossier-${page.key}-title`} className={styles.cover} tabIndex={-1}>
                  {cover.title}
                  <span> {cover.accent}</span>
                </h2>
                <p className={styles.lead}>{cover.problem}</p>
                <ul className={styles.blindSpots}>
                  {cover.blindSpots.map((point) => (
                    <li key={point.title}>{point.title}</li>
                  ))}
                </ul>
                <p className={styles.cue}>Faites défiler pour ouvrir le dossier, jour par jour.</p>
              </>
            ) : (
              <>
                <h2 id={`dossier-${page.key}-title`} tabIndex={-1}>
                  <span className={styles.day}>{page.day}</span>
                  {page.title}
                </h2>
                <p className={styles.lead}>{page.body}</p>

                {page.checks.length > 0 && (
                  <>
                    <h3>Ce qui est vérifié</h3>
                    <ul className={styles.checks}>
                      {page.checks.map((check) => (
                        <li key={check.title}>
                          <strong>{check.title}</strong>
                          <span>{check.body}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {index === lastPage ? (
                  <>
                    <h3>Ce que vous obtenez</h3>
                    <ul className={styles.checks}>
                      {page.outputs.map((output) => (
                        <li key={output.title}>
                          <strong>{output.title}</strong>
                          <span>{output.body}</span>
                        </li>
                      ))}
                    </ul>
                    <h3>Chaque constat suit la même trame</h3>
                    <ol className={styles.trame}>
                      {recommendationSteps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                    <div className={styles.actions}>
                      <BookingLink
                        className={styles.primary}
                        placement="offer-dossier"
                        label="Planifier un diagnostic"
                      >
                        Planifier un diagnostic
                      </BookingLink>
                      <a className={styles.secondary} href="#formats">
                        Voir les formats
                      </a>
                    </div>
                  </>
                ) : (
                  (page.blindSpots.length > 0 || page.outputs.length > 0) && (
                    <dl className={styles.meta}>
                      {page.blindSpots.length > 0 && (
                        <div>
                          <dt>Angle mort visé</dt>
                          <dd>{page.blindSpots.join(" · ")}</dd>
                        </div>
                      )}
                      {page.outputs.length > 0 && (
                        <div>
                          <dt>Livrable</dt>
                          <dd>{page.outputs.map((output) => output.title).join(" · ")}</dd>
                        </div>
                      )}
                    </dl>
                  )
                )}
              </>
            )}
            <p className={styles.folio}>
              <span>Diagnostic CI/CD & Observabilité</span>
              <span>
                {index + 1} / {dossierPages.length}
              </span>
            </p>
          </article>
        </section>
      ))}
    </div>
  );
}
