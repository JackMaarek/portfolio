"use client";

import { Accent } from "../accent";
import { about, capabilities, experiences, project, results } from "../home-content";
import { useScrollScene, type SceneParts } from "../scene/use-scroll-scene";
import scene from "../scene/scene.module.css";
import styles from "./career.module.css";

// Missions in chronological order: the stack is rebuilt from the first one.
const missions = [...experiences].reverse();
const year = (period: string) => period.slice(0, 4);

// The three capabilities name the tiers of the stack, bottom to top.
const [platform, iac, security] = capabilities.map((capability) => capability.title);
const tiers = { iac, platform, security };

type Page = { key: string; index: string; name: string; anchor?: string };
const pages: Page[] = [
  { key: "profile", index: "Profil", name: "Profil" },
  ...missions.map((mission, position) => ({
    key: `mission-${position}`,
    index: year(mission.period),
    name: `${year(mission.period)} · ${mission.company}`,
    // The hero and the header jump to the first mission.
    anchor: position === 0 ? "experience" : undefined,
  })),
  { key: "project", index: "Projet", name: project.name, anchor: "projects" },
  { key: "expertise", index: "Expertise", name: "Expertise", anchor: "expertise" },
];
const projectPage = missions.length + 1;

// The 3D stack is its own chunk, imported once the parcours nears the
// viewport (see useScrollScene).
const loadScene = (parts: SceneParts) =>
  import("./stack-scene").then(({ createStackScene }) =>
    createStackScene({
      ...parts,
      missions: missions.map((mission) => mission.company),
      tiers,
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

function Tags({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className={styles.tags} aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function CareerStack() {
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

  const sheet = (index: number) => {
    if (index === 0) {
      return (
        <>
          <p className={styles.label}>{about.label}</p>
          <h2 id={`career-${pages[0].key}-title`} className={scene.cover} tabIndex={-1}>
            <Accent {...about.headline} />
          </h2>
          <p className={scene.lead}>
            <Accent {...about.statement} />
          </p>
          <p className={styles.aside}>{about.aside}</p>
          <p className={scene.cue}>Faites défiler : la plateforme se construit mission par mission.</p>
        </>
      );
    }
    if (index === projectPage) {
      return (
        <>
          <p className={styles.label}>{project.kicker}</p>
          <h2 id={`career-${pages[index].key}-title`} tabIndex={-1}>
            {project.name}
          </h2>
          <p className={scene.lead}>{project.lead}</p>
          {project.columns.map((column) => (
            <p className={styles.body} key={column}>
              {column}
            </p>
          ))}
          <div className={scene.actions}>
            <a
              className={scene.primary}
              href={project.repository}
              target="_blank"
              rel="noreferrer"
              aria-label="Voir k8s-platform sur GitHub (nouvel onglet)"
            >
              Voir sur GitHub <span aria-hidden="true">↗</span>
            </a>
            <span className={styles.meta}>{project.cli}</span>
          </div>
        </>
      );
    }
    if (index === projectPage + 1) {
      return (
        <>
          <h2 id={`career-${pages[index].key}-title`} tabIndex={-1}>
            Ce que je construis.
          </h2>
          <ul className={styles.capabilities}>
            {capabilities.map((capability) => (
              <li key={capability.index}>
                <strong>{capability.title}</strong>
                <span>{capability.body}</span>
                <Tags items={capability.tags} label={`Technologies : ${capability.title}`} />
              </li>
            ))}
          </ul>
        </>
      );
    }
    const mission = missions[index - 1];
    // The measured results come from the Padok missions.
    const missionResults = mission.company === "Padok" ? results : [];
    return (
      <>
        <h2 id={`career-${pages[index].key}-title`} tabIndex={-1}>
          <span className={scene.prefix}>{year(mission.period)}</span>
          {mission.company}
        </h2>
        <p className={styles.role}>
          {mission.role} · {mission.sector}
        </p>
        <p className={scene.lead}>{mission.summary}</p>
        <ul className={styles.points}>
          {mission.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {missionResults.length > 0 && (
          <dl className={styles.results}>
            {missionResults.map((result) => (
              <div key={result.figure}>
                <dt>{result.figure}</dt>
                <dd>{result.body}</dd>
              </div>
            ))}
          </dl>
        )}
        <h3 id={`career-${pages[index].key}-tech`}>Stack mobilisée</h3>
        <ul className={styles.tags} aria-labelledby={`career-${pages[index].key}-tech`}>
          {mission.tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div ref={rootRef} className={scene.scene}>
      <div ref={stageRef} className={scene.stage} data-scene={sceneState} aria-hidden="true">
        <canvas ref={canvasRef} className={scene.canvas} />
        <div ref={labelsRef} className={scene.labels} />
      </div>

      <nav
        ref={indexRef}
        className={`${scene.index} ${styles.index}`}
        data-shown={indexShown}
        aria-label="Étapes du parcours"
      >
        <a className={scene.skip} href="#offer-bridge">
          Passer le parcours
        </a>
        <ol>
          {pages.map((page, index) => (
            <li key={page.key}>
              <button
                type="button"
                aria-label={page.name}
                aria-current={activePage === index ? "step" : undefined}
                onClick={() => goToPage(index)}
              >
                {page.index}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {pages.map((page, index) => (
        <section
          key={page.key}
          id={page.anchor ?? `career-${page.key}`}
          ref={sectionRef(index)}
          className={scene.page}
          data-active={activePage === index}
          aria-labelledby={`career-${page.key}-title`}
        >
          <article className={scene.sheet}>
            {sheet(index)}
            <p className={scene.folio}>
              <span>
                {index === 0 || index > missions.length ? "Jacques Maarek · Platform Engineer" : missions[index - 1].period}
              </span>
              <span>
                {index + 1} / {pages.length}
              </span>
            </p>
          </article>
        </section>
      ))}
    </div>
  );
}
