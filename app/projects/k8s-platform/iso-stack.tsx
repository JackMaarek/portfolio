"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import { type IsoBox, isoBot, isoLayers, projectPage } from "./k8s-platform-content";
import {
  boxFaces,
  crop,
  floorMatrix,
  leftCorner,
  plane,
  plateFaces,
  plateGap,
  project,
  rightCorner,
  viewBox,
} from "./iso";
import styles from "./iso-stack.module.css";

// The five layers as an exploded isometric stack, platform-bot's rail of
// principles on the left and the legend on the right. Hovering a layer, a
// principle or a legend entry lifts that layer. On phones the view crops to
// the stack and the same content reads as a list.
const rail = { x: 16, botY: 34 };

function Box({ box, z, kind }: { box: IsoBox; z: number; kind?: "tile" }) {
  const faces = boxFaces(box.x, box.y, z, box.w, box.d, box.h);
  return (
    <g className={styles.box} data-kind={kind} data-accent={box.accent ?? false}>
      <polygon className={styles.faceLeft} points={faces.left} />
      <polygon className={styles.faceRight} points={faces.right} />
      <polygon className={styles.faceTop} points={faces.top} />
    </g>
  );
}

export function IsoStack() {
  const [active, setActive] = useState<number | null>(null);
  const lowY = leftCorner(0)[1];
  const railTop = rail.botY + 54;

  // Hover handlers shared by the three parts of a layer.
  const hover = (index: number) => ({
    "data-on": active === index,
    onMouseEnter: () => setActive(index),
    onMouseLeave: () => setActive(null),
  });

  return (
    <div
      className={styles.stage}
      style={{ "--crop-scale": crop.scale, "--crop-offset": crop.offset } as CSSProperties}
    >
      <div className={styles.frame}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          role="img"
          aria-label={projectPage.stackLabel}
          data-active={active !== null}
        >
          {isoLayers.map((layer, index) => {
            const z = index * plateGap;
            const plate = plateFaces(z);
            // Blocks drawn back to front.
            const items: { key: number; node: ReactNode }[] = layer.boxes.map((box, b) => ({
              key: box.x + box.y,
              node: <Box key={`b${b}`} box={box} z={z} />,
            }));
            if (layer.waves) {
              for (let k = 0; k < 7; k++) {
                const x = 0.8 + k * 1.76;
                items.push({ key: x + 4.6, node: <Box key={`w${k}`} box={{ x, y: 4.6, w: 1.5, d: 1.1, h: 0.35, accent: true }} z={z} /> });
              }
            }
            layer.bars?.forEach((h, k) => {
              const x = 6.9 + k * 0.82;
              items.push({
                key: x + 1.6,
                node: <Box key={`m${k}`} box={{ x, y: 1.6, w: 0.45, d: 0.45, h, accent: k === layer.bars!.length - 2 }} z={z} />,
              });
            });
            items.sort((a, b) => a.key - b.key);

            return (
              <g key={layer.number} className={styles.layer} {...hover(index)}>
                <polygon className={styles.plateLeft} points={plate.left} />
                <polygon className={styles.plateRight} points={plate.right} />
                <polygon className={styles.plateTop} points={plate.top} />
                {layer.outline && (
                  <g transform={floorMatrix(z)}>
                    <rect
                      className={styles.outline}
                      x={layer.outline.x}
                      y={layer.outline.y}
                      width={layer.outline.w}
                      height={layer.outline.d}
                      rx=".15"
                    />
                  </g>
                )}
                {layer.tiles.map((tile, t) => (
                  <Box key={t} box={{ ...tile, h: 0.08 }} z={z} kind="tile" />
                ))}
                <g transform={floorMatrix(z)}>
                  <g className={styles.tag}>
                    <rect x="0.25" y={plane.depth - 1.05} width="1.1" height="0.7" rx=".06" />
                    <text x="0.42" y={plane.depth - 0.55}>{layer.number}</text>
                  </g>
                  {layer.texts.map((text) => (
                    <text key={text.text} className={styles.floorText} data-tone={text.tone} x={text.x} y={text.y}>
                      {text.text}
                    </text>
                  ))}
                </g>
                {items.map((item) => item.node)}
                {layer.links?.map((link, l) => {
                  const [x1, y1] = project(link.from[0], link.from[1], z + link.from[2]);
                  const [x2, y2] = project(link.to[0], link.to[1], z + link.to[2]);
                  return <line key={l} className={styles.link} data-dashed={link.dashed ?? false} x1={x1} y1={y1} x2={x2} y2={y2} />;
                })}
              </g>
            );
          })}

          {/* platform-bot and its rail of principles. */}
          <g className={styles.rail}>
            <g className={styles.bot}>
              <rect x={rail.x - 6} y={rail.botY} width="214" height="54" rx="3" />
              <text className={styles.botName} x={rail.x + 8} y={rail.botY + 23}>
                <tspan className={styles.prompt}>›</tspan> {isoBot.name}
              </text>
              <text className={styles.botDetail} x={rail.x + 8} y={rail.botY + 41}>{isoBot.detail}</text>
            </g>
            <line className={styles.railLine} x1={rail.x + 4} y1={railTop} x2={rail.x + 4} y2={lowY} />
            <circle
              className={styles.pulse}
              r="3"
              cx={rail.x + 4}
              cy={railTop}
              style={{ "--travel": `${lowY - railTop}px` } as CSSProperties}
            />
            {isoLayers.map((layer, index) => {
              const [cx, cy] = leftCorner(index * plateGap);
              return (
                <g key={layer.number} className={styles.branch} {...hover(index)}>
                  <line x1={rail.x + 4} y1={cy} x2={cx - 6} y2={cy} />
                  <circle cx={rail.x + 4} cy={cy} r="3" />
                  <circle cx={cx - 6} cy={cy} r="2.5" />
                  <text className={styles.principle} x={rail.x + 16} y={cy - 21}>{layer.principle}</text>
                  <text className={styles.why} x={rail.x + 16} y={cy - 6}>{layer.why}</text>
                </g>
              );
            })}
          </g>

          {/* Legend. */}
          <g className={styles.legendGroup}>
            {isoLayers.map((layer, index) => {
              const [rx, ry] = rightCorner(index * plateGap);
              return (
                <g key={layer.number} className={styles.legend} {...hover(index)}>
                  <line x1={rx + 8} y1={ry} x2={rx + 46} y2={ry} />
                  <text className={styles.legendNumber} x={rx + 58} y={ry + 4}>{layer.number}</text>
                  <text className={styles.legendTitle} x={rx + 90} y={ry + 5}>{layer.title}</text>
                  <text className={styles.legendDetail} x={rx + 90} y={ry + 24}>{layer.components}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <p className={styles.hint} aria-hidden="true">{projectPage.stackHint}</p>

      {/* The same content as text: visible on phones, read by assistive tech everywhere. */}
      <ol className={styles.list} aria-label={projectPage.stackLabel}>
        {[...isoLayers].reverse().map((layer) => (
          <li key={layer.number}>
            <span className={styles.listNumber}>{layer.number}</span>
            <span className={styles.listTitle}>{layer.title}</span>
            <span className={styles.listDetail}>{layer.components}</span>
            <span className={styles.listPrinciple}>{layer.principle}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
