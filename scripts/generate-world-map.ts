/**
 * Generates public/images/about/world-dots.svg: the flat dotted world map behind the About
 * GFB "International presence" section.
 *
 * Dots sit on an even grid in map space (Miller projection, src/lib/world-map.ts, shared
 * with the markers); each one is unprojected and tested against the coastline polygons in
 * scripts/land.ts plus the regions the homepage globe never shows. Dots are grouped by
 * their distance from the Mediterranean–Gulf region GFB works across, so the map is a
 * little brighter there with only three <path> elements.
 *
 * Run: node scripts/generate-world-map.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { mapHeight, mapWidth, unprojectMap } from "../src/lib/world-map.ts";
import { inside, isLand, type Ring } from "./land.ts";

// Regions outside the globe's visible hemisphere, at the same 1–2° accuracy.
// prettier-ignore
const extraLand: Ring[] = [
  // Australia, Tasmania, New Zealand (North, South)
  [[113.5, -22], [114, -26.5], [115, -34], [118, -35], [123, -34], [126, -32.2], [131, -31.5], [135, -34.8],
    [138, -35.6], [140, -38], [144, -38.3], [146.5, -39], [150, -37.5], [153, -31], [153.5, -28], [153, -25],
    [150.5, -22.5], [146, -19], [145.5, -15], [143.5, -14], [142.5, -10.7], [141.5, -13], [141.5, -17], [139.5, -17.5],
    [136, -15.5], [137, -12], [133, -11.3], [130, -12.5], [129.5, -15], [126, -14], [122.5, -17], [121, -19.5],
    [117, -20.7]],
  [[144.6, -40.7], [148.3, -40.9], [148, -43.2], [146.5, -43.6], [145.2, -42.2]],
  [[172.7, -34.4], [175, -36.5], [178.5, -37.7], [177, -39.5], [175, -41.6], [174.6, -39.8], [173.8, -39.2], [174.5, -37]],
  [[172.7, -40.5], [174.3, -41.7], [173, -43.8], [171, -45.9], [168.5, -46.6], [166.5, -46], [168.3, -44], [171.3, -42]],
  // Japan (Honshu–Kyushu, Hokkaido), New Guinea, Philippines
  [[130.8, 31], [131.7, 33.5], [135, 33.5], [137, 34.6], [139.8, 35], [140.9, 36.9], [141.5, 40.5], [140, 41.5],
    [140, 40], [139.8, 38.5], [138.5, 37.5], [136.8, 37.2], [133, 35.5], [130.9, 34.3], [129.6, 33.3], [130.2, 31.2]],
  [[140, 41.4], [141.5, 42.5], [143.3, 42], [145.5, 43.3], [144.5, 44], [142, 45.4], [141.6, 43.3], [140.3, 43.2]],
  [[131, -1.4], [134, -0.9], [137, -1.5], [141, -2.6], [145.8, -4.6], [147.5, -6], [150.5, -10.5], [147, -10],
    [144, -7.8], [141, -9.1], [138, -8.4], [137.5, -5.2], [134.5, -4], [132.5, -3.5]],
  [[120, 18.5], [122.3, 18.4], [122.2, 16], [124, 13], [124.3, 12.5], [125.5, 10], [126.6, 7], [125.5, 5.8],
    [123.5, 7.8], [122, 6.9], [121.9, 9], [121.3, 12.4], [120.6, 14.5], [119.8, 16.3]],
  // Cuba, Baffin Island, Canadian Arctic islands
  [[-84.9, 21.9], [-80, 23], [-77, 21.5], [-74.2, 20.2], [-77.5, 19.9], [-81, 21.6]],
  [[-80, 73.5], [-68, 70.5], [-62, 67], [-64.5, 63.5], [-71, 62.5], [-78, 64.5], [-73, 67.5], [-82, 70]],
  [[-120, 75], [-100, 78], [-80, 79], [-75, 77], [-95, 74], [-110, 72.5], [-120, 72]]
];

// prettier-ignore
const extraWater: Ring[] = [
  // Hudson Bay
  [[-95, 59], [-92.5, 57], [-88, 56], [-82.5, 55], [-79.5, 54.5], [-77, 59], [-78, 62.5], [-83, 63.5],
    [-87, 64.5], [-94, 61]]
];

const isMapLand = (point: [number, number]) =>
  (isLand(point) || extraLand.some((ring) => inside(point, ring))) && !extraWater.some((ring) => inside(point, ring));

const pitch = mapWidth / 160;
const focus = { lon: 25, lat: 33 };
const tiers = [
  { max: Infinity, color: "#2350a3", opacity: 0.62 },
  { max: 75, color: "#2a61c6", opacity: 0.8 },
  { max: 38, color: "#3674e3", opacity: 0.92 }
];
const segments: string[][] = tiers.map(() => []);

for (let y = pitch / 2; y < mapHeight; y += pitch) {
  for (let x = pitch / 2; x < mapWidth; x += pitch) {
    const point = unprojectMap(x, y);
    if (!isMapLand(point)) continue;
    const distance = Math.hypot(point[0] - focus.lon, point[1] - focus.lat);
    const tier = tiers.findLastIndex((t) => distance <= t.max);
    segments[tier]!.push(`M${x.toFixed(1)} ${y.toFixed(1)}h0`);
  }
}

const paths = tiers
  .map((t, i) => `<path d="${segments[i]!.join("")}" stroke="${t.color}" stroke-opacity="${t.opacity}"/>`)
  .join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mapWidth} ${mapHeight}" fill="none" stroke-linecap="round" stroke-width="3.1">
  ${paths}
</svg>
`;

mkdirSync(new URL("../public/images/about/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/images/about/world-dots.svg", import.meta.url), svg);
console.log(
  `world-dots.svg: ${segments.flat().length} dots, ${mapWidth}×${mapHeight}, ${(svg.length / 1024).toFixed(1)} KB`
);
