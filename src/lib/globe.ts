/**
 * Orthographic projection shared by the dotted-globe generator (scripts/generate-globe.ts)
 * and the homepage markers, so the dots and the markers always agree.
 *
 * Coordinates are on a unit sphere: x to the right, y up, z towards the viewer (z > 0 is
 * the visible hemisphere).
 */
export const globeCenter = { lon: 28, lat: 31 } as const;

const rad = Math.PI / 180;

export type Projected = { x: number; y: number; z: number };

/** Projects a longitude/latitude (degrees); `altitude` lifts the point above the surface. */
export function project(lon: number, lat: number, altitude = 0): Projected {
  const φ = lat * rad;
  const Δλ = (lon - globeCenter.lon) * rad;
  const φ0 = globeCenter.lat * rad;
  const r = 1 + altitude;
  return {
    x: r * Math.cos(φ) * Math.sin(Δλ),
    y: r * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(Δλ)),
    z: r * (Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(Δλ))
  };
}

/** Half-size of the SVG viewBox: the sphere has radius 1000 plus a 10-unit margin for its rim. */
export const globeExtent = 1010;

/** Projected point as a percentage of the globe's square viewBox (top-left origin). */
export function toPercent({ x, y }: Projected) {
  return {
    left: ((x * 1000 + globeExtent) / (2 * globeExtent)) * 100,
    top: ((-y * 1000 + globeExtent) / (2 * globeExtent)) * 100
  };
}

/**
 * SVG path (in the globe's viewBox, sphere radius 1000) for a connection between two
 * places: a quadratic curve between their projected positions, bowed upwards by `bend`
 * times the distance so it reads as a route above the surface.
 */
export function arcPath(from: [number, number], to: [number, number], bend = 0.3) {
  const a = project(...from);
  const b = project(...to);
  const [ax, ay, bx, by] = [a.x * 1000, -a.y * 1000, b.x * 1000, -b.y * 1000];
  const length = Math.hypot(bx - ax, by - ay);
  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2 - length * bend;
  const f = (n: number) => n.toFixed(1);
  return `M${f(ax)} ${f(ay)}Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`;
}
