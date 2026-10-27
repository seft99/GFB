/**
 * Generates public/images/home/globe-dots.svg: the dotted globe behind the homepage
 * "International coordination" section.
 *
 * Land is sampled on a regular latitude/longitude grid and tested against the simplified
 * coastline polygons in scripts/land.ts (about 1–2° accuracy, enough for a dot matrix),
 * then projected with the same orthographic view the markers use (src/lib/globe.ts).
 * Dots are grouped by how directly they face the viewer, so the globe darkens and the
 * dots shrink towards the limb with only four <path> elements.
 *
 * Run: node scripts/generate-globe.ts
 */
import { writeFileSync } from "node:fs";
import { globeExtent, project } from "../src/lib/globe.ts";
import { isLand } from "./land.ts";

const step = 1.35;
const tiers = [
  { min: 0.06, width: 5.5, color: "#1a4a9c", opacity: 0.6 },
  { min: 0.3, width: 7.5, color: "#2260d0", opacity: 0.8 },
  { min: 0.55, width: 9, color: "#2d72f0", opacity: 0.92 },
  { min: 0.8, width: 10.5, color: "#4688ff", opacity: 1 }
];
const segments: string[][] = tiers.map(() => []);

for (let lat = -88 + step / 2; lat < 88; lat += step) {
  const lonStep = step / Math.max(Math.cos((lat * Math.PI) / 180), 0.05);
  for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
    const p = project(lon, lat);
    if (p.z < tiers[0]!.min || !isLand([lon, lat])) continue;
    const tier = tiers.findLastIndex((t) => p.z >= t.min);
    segments[tier]!.push(`M${Math.round(p.x * 1000)} ${Math.round(-p.y * 1000)}h0`);
  }
}

const paths = tiers
  .map(
    (t, i) =>
      `<path d="${segments[i]!.join("")}" stroke="${t.color}" stroke-opacity="${t.opacity}" stroke-width="${t.width}"/>`
  )
  .join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-globeExtent} ${-globeExtent} ${2 * globeExtent} ${2 * globeExtent}" fill="none" stroke-linecap="round">
  <defs>
    <radialGradient id="sphere" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="#0c2550"/>
      <stop offset="0.55" stop-color="#071a3a"/>
      <stop offset="1" stop-color="#040f24"/>
    </radialGradient>
  </defs>
  <circle r="1000" fill="url(#sphere)"/>
  <circle r="1000" stroke="#3a7bff" stroke-opacity="0.22" stroke-width="3"/>
  ${paths}
</svg>
`;

writeFileSync(new URL("../public/images/home/globe-dots.svg", import.meta.url), svg);
console.log(`globe-dots.svg: ${segments.flat().length} dots, ${(svg.length / 1024).toFixed(1)} KB`);
