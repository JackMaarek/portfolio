"use client";

import { BookingLink } from "../../booking-link";
import { useScrollScene, type SceneParts } from "../../scene/use-scroll-scene";
import scene from "../../scene/scene.module.css";
import { deliverables, recommendationSteps } from "../offer-content";
import { chainNodes, cover, dossierPages, nodeFindings } from "./dossier-content";
import styles from "./dossier.module.css";

const lastPage = dossierPages.length - 1;
const scenePages = dossierPages.map((page) => ({ focus: page.focus }));
const quickWins = deliverables.find((item) => item.title === "Quick wins")?.title ?? "Quick wins";

const pageName = (index: number) => {
  const page = dossierPages[index];
  return page.day ? `${page.day} · ${page.title}` : "Couverture";
};

// The 3D scene is its own chunk, imported once the dossier nears the
// viewport (see useScrollScene).
const loadScene = (parts: SceneParts) =>
  import("./dossier-scene").then(({ createDossierScene }) =>
    createDossierScene({
      ...parts,
      pages: scenePages,
      nodes: chainNodes,
      findings: nodeFindings,
      quickWins,
      classNames: {
        label: scene.label,
        name: scene.labelName,
        meta: scene.labelMeta,
        node: scene.node,
        tag: scene.tag,
        finding: scene.finding,
        axis: scene.axis,
      },
    }),
  );

export function Dossier() {
  const {
    canvasRef,
    labelsRef,
    stageRef,
    rootRef,
    indexRef,
    sectionRef,
    activePage,
    indexShown,
    sceneState,
    goToPage,
  } = useScrollScene(loadScene);

  return (
    <div ref={rootRef} id="offer-content" className={scene.scene}>
      <div ref={stageRef} className={scene.stage} data-scene={sceneState} aria-hidden="true">
        <canvas ref={canvasRef} className={scene.canvas} />
        <div ref={labelsRef} className={scene.labels} />
      </div>

      <nav
        ref={indexRef}
        className={scene.index}
        data-shown={indexShown}
        aria-label="Pages du dossier"
      >
        <a className={scene.skip} href="#dossier-report">
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
          ref={sectionRef(index)}
          className={scene.page}
          data-active={activePage === index}
          aria-labelledby={`dossier-${page.key}-title`}
        >
          <article className={scene.sheet}>
            {index === 0 ? (
              <>
                <h2 id={`dossier-${page.key}-title`} className={scene.cover} tabIndex={-1}>
                  {cover.title}
                  <span> {cover.accent}</span>
                </h2>
                <p className={scene.lead}>{cover.problem}</p>
                <ul className={styles.blindSpots}>
                  {cover.blindSpots.map((point) => (
                    <li key={point.title}>{point.title}</li>
                  ))}
                </ul>
                <p className={scene.cue}>Faites défiler pour ouvrir le dossier, jour par jour.</p>
              </>
            ) : (
              <>
                <h2 id={`dossier-${page.key}-title`} tabIndex={-1}>
                  <span className={scene.prefix}>{page.day}</span>
                  {page.title}
                </h2>
                <p className={scene.lead}>{page.body}</p>

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
                    <div className={scene.actions}>
                      <BookingLink
                        className={scene.primary}
                        placement="offer-dossier"
                        label="Planifier un diagnostic"
                      >
                        Planifier un diagnostic
                      </BookingLink>
                      <a className={scene.secondary} href="#formats">
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
            <p className={scene.folio}>
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
