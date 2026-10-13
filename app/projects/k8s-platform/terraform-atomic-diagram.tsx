"use client";

import { useState } from "react";
import {
  architecture,
  complianceAtoms,
  type MoleculeKey,
  terraformAtoms,
  terraformColumns,
  terraformMolecules,
  terraformOrganism,
} from "./k8s-platform-content";
import styles from "./terraform-atomic-diagram.module.css";

// Terraform modules as atomic design: atoms (modules) wired into molecules
// (roots with their own state), assembled into the environment. Hovering a
// molecule highlights the atoms it reads. Colours follow the surface through
// currentColor and the panel's --diagram-* properties.
const atom = { width: 204, height: 24 };
const molecule = { x: 282, width: 212 };
const organism = { x: 564, y: 178, width: 190, height: 136, inputY: 246 };
const compliance = { y: 216, height: 108, wireY: 262 };
const columnsX = [0, molecule.x, organism.x];

const wire = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

const center = (key: MoleculeKey) => terraformMolecules[key].y + terraformMolecules[key].h / 2;

export function TerraformAtomicDiagram() {
  const [active, setActive] = useState<MoleculeKey | null>(null);
  const on = (keys: MoleculeKey[]) => active !== null && keys.includes(active);
  const shared = terraformMolecules.shared;
  const platform = terraformMolecules.platform;
  const remoteX = molecule.x + molecule.width - 30;

  return (
    <div className={styles.scroll}>
      <svg
        className={styles.svg}
        viewBox="0 0 780 440"
        role="img"
        aria-label={architecture.terraform.label}
        data-active={active !== null}
      >
        {terraformColumns.map((column, index) => (
          <text key={column.title} className={styles.column} x={columnsX[index]} y="18">
            <tspan className={styles.accentText}>{column.title}</tspan> · {column.detail}
          </text>
        ))}

        {/* Wires first, under the blocks. The shared root's wires split
            around its centre. */}
        {terraformAtoms.flatMap((item) =>
          item.molecules.map((key) => (
            <path
              key={`${item.name}-${key}`}
              className={styles.wire}
              data-on={on([key])}
              d={wire(atom.width, item.y + atom.height / 2, molecule.x, center(key) + (key === "shared" ? (item.y < 200 ? -16 : 16) : 0))}
            />
          )),
        )}
        <path className={styles.wire} data-on={on(["shared"])} d={wire(atom.width, compliance.wireY, molecule.x, center("shared"))} />
        {(Object.keys(terraformMolecules) as MoleculeKey[]).map((key) => (
          <path
            key={key}
            className={styles.wire}
            data-on={on([key])}
            d={wire(molecule.x + molecule.width, center(key), organism.x, organism.inputY)}
          />
        ))}

        {terraformAtoms.map((item) => (
          <g key={item.name} className={styles.atom} data-on={on(item.molecules)}>
            <rect x="0" y={item.y} width={atom.width} height={atom.height} rx="3" />
            <text x="10" y={item.y + 16}>{item.name}</text>
          </g>
        ))}

        <rect className={styles.group} x="0" y={compliance.y} width={atom.width} height={compliance.height} rx="3" />
        <text className={styles.groupLabel} x="8" y={compliance.y + 15}>compliance/</text>
        {complianceAtoms.map((name, index) => {
          const x = 8 + (index % 2) * 96;
          const y = compliance.y + 22 + Math.floor(index / 2) * 28;
          return (
            <g key={name} className={`${styles.atom} ${styles.small}`} data-on={on(["shared"])}>
              <rect x={x} y={y} width="90" height="22" rx="3" />
              <text x={x + 7} y={y + 15}>{name}</text>
            </g>
          );
        })}

        {(Object.keys(terraformMolecules) as MoleculeKey[]).map((key) => {
          const item = terraformMolecules[key];
          return (
            <g
              key={key}
              className={styles.molecule}
              data-on={active === key}
              onMouseEnter={() => setActive(key)}
              onMouseLeave={() => setActive(null)}
            >
              <rect x={molecule.x} y={item.y} width={molecule.width} height={item.h} rx="3" />
              <text className={styles.moleculeTitle} x={molecule.x + 12} y={item.y + 22}>{item.title}</text>
              <text className={styles.moleculeBody} x={molecule.x + 12} y={item.y + 41}>{item.body}</text>
              <text className={styles.moleculeState} x={molecule.x + 12} y={item.y + item.h - 11}>{item.state}</text>
            </g>
          );
        })}

        <path className={styles.remote} d={`M${remoteX} ${shared.y + shared.h} L ${remoteX} ${platform.y}`} />
        <text className={styles.remoteLabel} x={remoteX + 6} y={(shared.y + shared.h + platform.y) / 2 + 4}>
          {terraformOrganism.remoteState}
        </text>

        <g className={styles.organism}>
          <rect className={styles.back} x={organism.x + 20} y={organism.y - 20} width={organism.width} height={organism.height} rx="3" />
          <rect className={styles.back} x={organism.x + 10} y={organism.y - 10} width={organism.width} height={organism.height} rx="3" />
          <rect className={styles.front} x={organism.x} y={organism.y} width={organism.width} height={organism.height} rx="3" />
          <text className={styles.organismTitle} x={organism.x + 14} y={organism.y + 26}>{terraformOrganism.title}</text>
          {terraformOrganism.roots.map((root, index) => (
            <text key={root} className={styles.organismRoot} x={organism.x + 14} y={organism.y + 50 + index * 18}>{root}</text>
          ))}
          <text className={styles.accentText} x={organism.x + 14} y={organism.y + 120}>{terraformOrganism.count}</text>
        </g>

        {/* An objective, drawn dashed: not a shipped feature. */}
        <g className={styles.goal}>
          <rect x={organism.x} y="338" width="210" height="70" rx="3" />
          <text className={styles.goalTitle} x={organism.x + 12} y="360">{terraformOrganism.goal.title}</text>
          <text className={styles.moleculeBody} x={organism.x + 12} y="379">{terraformOrganism.goal.body}</text>
          <text className={styles.accentText} x={organism.x + 12} y="396">{terraformOrganism.goal.tag}</text>
        </g>
        <path className={styles.remote} d={`M669 ${organism.y + organism.height} L 669 338`} />
      </svg>
    </div>
  );
}
