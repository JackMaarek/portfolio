// Camera fitting: the closest distance along a framing's direction at which
// every must-see point, with the room its label needs, fits the free part
// of the canvas.
import { Vector3, type PerspectiveCamera } from "three";

export type FitPoint = { at: Vector3; padX: number; padTop: number; padBottom: number };

// Usable rectangle of the canvas, in CSS pixels.
export type FitBounds = { width: number; height: number; left: number; right: number; top: number; bottom: number };

export const fitBox = (x: number, y: number, z: number, padX = 12, padTop = 12, padBottom = 12): FitPoint => ({
  at: new Vector3(x, y, z),
  padX,
  padTop,
  padBottom,
});

export function createFitter(camera: PerspectiveCamera) {
  const scratch = new Vector3();

  const fitsAt = (points: FitPoint[], offset: Vector3, target: Vector3, scale: number, bounds: FitBounds) => {
    camera.position.copy(offset).multiplyScalar(scale).add(target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    return points.every(({ at, padX, padTop, padBottom }) => {
      scratch.copy(at).project(camera);
      const x = (scratch.x * 0.5 + 0.5) * bounds.width;
      const y = (scratch.y * -0.5 + 0.5) * bounds.height;
      return (
        scratch.z < 1 &&
        x - padX >= bounds.left &&
        x + padX <= bounds.right &&
        y - padTop >= bounds.top &&
        y + padBottom <= bounds.bottom
      );
    });
  };

  // Closest scale of `offset` at which `points` fit, or the far limit if
  // none does.
  return (points: FitPoint[], offset: Vector3, target: Vector3, bounds: FitBounds) => {
    let low = 0.2;
    let high = 4;
    if (!fitsAt(points, offset, target, high, bounds)) return high;
    for (let step = 0; step < 18; step += 1) {
      const middle = (low + high) / 2;
      if (fitsAt(points, offset, target, middle, bounds)) high = middle;
      else low = middle;
    }
    return high;
  };
}
