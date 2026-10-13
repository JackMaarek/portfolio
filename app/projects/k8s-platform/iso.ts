// Isometric projection of the k8s-platform stack, in the SVG's viewBox
// units (1090 × 850). Plane units: x 0..W, y 0..D; z rises by plate.
export const viewBox = { width: 1090, height: 850 };

const unit = 22;
const cos = Math.cos(Math.PI / 6) * unit;
const sin = unit / 2;
const origin = { x: 414, y: 575 };

export const plane = { width: 14, depth: 8 };
// Height between two plates, and of a plate's slab.
export const plateGap = 5.6;
const slab = 0.22;

export type Point = [x: number, y: number];

export const project = (x: number, y: number, z: number): Point => [
  origin.x + (x - y) * cos,
  origin.y + (x + y) * sin - z * unit,
];

export const points = (corners: Point[]) =>
  corners.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// Left, right and top faces of a box standing on the plate at height z.
export function boxFaces(x: number, y: number, z: number, w: number, d: number, h: number) {
  return {
    left: points([project(x, y + d, z), project(x + w, y + d, z), project(x + w, y + d, z + h), project(x, y + d, z + h)]),
    right: points([project(x + w, y, z), project(x + w, y + d, z), project(x + w, y + d, z + h), project(x + w, y, z + h)]),
    top: points([project(x, y, z + h), project(x + w, y, z + h), project(x + w, y + d, z + h), project(x, y + d, z + h)]),
  };
}

export function plateFaces(z: number) {
  const { width: w, depth: d } = plane;
  return {
    left: points([project(0, d, z - slab), project(w, d, z - slab), project(w, d, z), project(0, d, z)]),
    right: points([project(w, 0, z - slab), project(w, d, z - slab), project(w, d, z), project(w, 0, z)]),
    top: points([project(0, 0, z), project(w, 0, z), project(w, d, z), project(0, d, z)]),
  };
}

// Maps plane units onto the plate at height z, for flat text and outlines.
export function floorMatrix(z: number) {
  const [x, y] = project(0, 0, z);
  return `matrix(${cos} ${sin} ${-cos} ${sin} ${x} ${y})`;
}

// The left and right corners the principles rail and the legend attach to.
export const leftCorner = (z: number) => project(0, plane.depth, z);
export const rightCorner = (z: number) => project(plane.width, 0, z);

// On phones the view is cropped to the stack itself (12 units of margin).
const cropStart = leftCorner(0)[0] - 12;
const cropEnd = rightCorner(0)[0] + 12;
export const crop = {
  scale: viewBox.width / (cropEnd - cropStart),
  offset: cropStart / (cropEnd - cropStart),
};
