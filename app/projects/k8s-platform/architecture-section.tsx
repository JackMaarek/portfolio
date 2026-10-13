import { Fragment, type ReactNode } from "react";
import { BotDddDiagram } from "./bot-ddd-diagram";
import { architecture, type Principle } from "./k8s-platform-content";
import styles from "./architecture-section.module.css";
import { TerraformAtomicDiagram } from "./terraform-atomic-diagram";

// Section C, on the light band: the Terraform modules and platform-bot's
// packages follow the same composition idea.
function Principles({ items }: { items: Principle[] }) {
  return (
    <dl className={styles.principles}>
      {items.map((item) => (
        <div key={item.body} data-goal={item.goal ?? false}>
          <dt>{item.term}</dt>
          <dd>{withCode(item.body, item.code)}</dd>
        </div>
      ))}
    </dl>
  );
}

// Sets the given package and folder names as code.
function withCode(text: string, words: string[] = []): ReactNode {
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|")})`);
  return text.split(pattern).map((part, index) => <Fragment key={index}>{index % 2 ? <code>{part}</code> : part}</Fragment>);
}

export function ArchitectureSection() {
  const { terraform, bot } = architecture;
  return (
    <section className={styles.section} aria-labelledby="architecture-title">
      <div className={styles.head}>
        <p className="section-label">{architecture.label}</p>
        <h2 id="architecture-title">{architecture.title}</h2>
        <p>{architecture.intro}</p>
      </div>
      <div className={styles.panels}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>
              {terraform.title} · <em>{terraform.accent}</em>
            </h3>
            <span>{terraform.tag}</span>
          </div>
          <p className={styles.panelBody}>{terraform.body}</p>
          <TerraformAtomicDiagram />
          <Principles items={terraform.principles} />
        </article>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>
              {bot.title} · <em>{bot.accent}</em>
            </h3>
            <span>{bot.tag}</span>
          </div>
          <p className={styles.panelBody}>{bot.body}</p>
          <BotDddDiagram />
          <Principles items={bot.principles} />
        </article>
      </div>
    </section>
  );
}
