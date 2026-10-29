/**
 * Writes the internal reconciliation register (src/migration/content-register.ts) to
 * docs/content-register.md and docs/migration-data/content-register.json.
 * Run: node scripts/build-content-register.ts
 */
import { writeFileSync } from "node:fs";
import { contentRegister, sourceUrl, type RegisterStatus } from "../src/migration/content-register.ts";

const ORDER: RegisterStatus[] = ["conflict", "needs-confirmation", "needs-legal-copy", "withheld", "corrected"];
const TITLES: Record<RegisterStatus, string> = {
  conflict: "Conflicts between official sources (GFB approval needed)",
  "needs-confirmation": "Single-source values that need business confirmation",
  "needs-legal-copy": "Awaiting approved legal copy",
  withheld: "Withheld from customer pages",
  corrected: "Corrected (evidence on the official site)"
};
const cell = (value: string) => value.replace(/\n/g, " / ").replace(/\|/g, "\\|");

writeFileSync(
  "docs/migration-data/content-register.json",
  `${JSON.stringify(
    contentRegister.map((entry) => ({
      ...entry,
      sources: entry.sources.map((source) => ({ ...source, url: sourceUrl(source.path) }))
    })),
    null,
    2
  )}\n`
);

const lines = [
  "# Content reconciliation register (internal)",
  "",
  "Not published. Field-level record of values and wording that were corrected, withheld or found in",
  "conflict between official pages. Source of truth: `src/migration/content-register.ts`; regenerate with",
  "`node scripts/build-content-register.ts`. Conflicting values stay exactly as each page publishes them.",
  ""
];
for (const status of ORDER) {
  const entries = contentRegister.filter((entry) => entry.status === status);
  if (!entries.length) continue;
  lines.push(
    `## ${TITLES[status]}`,
    "",
    "| ID | Finding | Entity | Field | Sources | Action |",
    "| --- | --- | --- | --- | --- | --- |"
  );
  for (const entry of entries)
    lines.push(
      `| ${entry.id} | ${entry.finding} | ${cell(entry.entity)} | ${cell(entry.field)} | ${entry.sources
        .map((source) => `\`${source.path}\`: ${cell(source.value)}`)
        .join("<br>")} | ${cell(entry.action)} |`
    );
  lines.push("");
}
writeFileSync("docs/content-register.md", lines.join("\n"));
console.log(`${contentRegister.length} entries`);
