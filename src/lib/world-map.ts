/**
 * Flat world map projection shared by the dot-map generator (scripts/generate-world-map.ts)
 * and the About GFB presence markers, so the dots and the markers always agree.
 *
 * Miller cylindrical projection, cropped to the inhabited latitudes and to the longitudes
 * from Alaska to the Pacific, in a viewBox `mapWidth` units wide (top-left origin).
 */
const rad = Math.PI / 180;

export const mapBounds = { west: -168, east: 180, north: 78, south: -56 } as const;
export const mapWidth = 1000;

const millerY = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * rad));
const unitsPerRadian = mapWidth / ((mapBounds.east - mapBounds.west) * rad);
const top = millerY(mapBounds.north);

export const mapHeight = Math.round((top - millerY(mapBounds.south)) * unitsPerRadian);

/** Projects a longitude/latitude (degrees) to map units. */
export function projectMap(lon: number, lat: number) {
  return { x: (lon - mapBounds.west) * rad * unitsPerRadian, y: (top - millerY(lat)) * unitsPerRadian };
}

/** Inverse of projectMap, used to sample the dot grid evenly on the map. */
export function unprojectMap(x: number, y: number): [number, number] {
  const lon = mapBounds.west + x / unitsPerRadian / rad;
  const lat = (2.5 * Math.atan(Math.exp(0.8 * (top - y / unitsPerRadian))) - 0.625 * Math.PI) / rad;
  return [lon, lat];
}

/** Projected point as a percentage of the map box. */
export function toMapPercent(lon: number, lat: number) {
  const { x, y } = projectMap(lon, lat);
  return { left: (x / mapWidth) * 100, top: (y / mapHeight) * 100 };
}

/** Quadratic curve between two places, bowed upwards by `bend` times their distance. */
export function mapArcPath(from: [number, number], to: [number, number], bend = 0.35) {
  const a = projectMap(...from);
  const b = projectMap(...to);
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const f = (n: number) => n.toFixed(1);
  return `M${f(a.x)} ${f(a.y)}Q${f((a.x + b.x) / 2)} ${f((a.y + b.y) / 2 - length * bend)} ${f(b.x)} ${f(b.y)}`;
}
