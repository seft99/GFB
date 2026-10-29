/**
 * Field-level reconciliation register (internal; never rendered on customer pages). One entry per
 * field whose value or wording was corrected, withheld or found in conflict between the official
 * pages, with its sources and the action taken. Conflicting values are kept exactly as each page
 * publishes them: nothing here selects a value. `status` says what is still needed:
 * - `corrected`: demonstrably wrong text fixed (src/migration/corrections.ts), evidence given;
 * - `withheld`: claim removed from customer pages;
 * - `conflict`: two official sources disagree; both stay as published until GFB approves one;
 * - `needs-confirmation`: a single source, but its accuracy needs a business answer;
 * - `needs-legal-copy`: draft text awaiting approved copy.
 * tests/unit/content-register.test.ts checks every `conflict` value still appears on its page and
 * that the red grape summary has no conflict that is not listed here.
 * Written out by scripts/build-content-register.ts (docs/content-register.md).
 */
export type RegisterStatus = "corrected" | "withheld" | "conflict" | "needs-confirmation" | "needs-legal-copy";

export type RegisterSource = { path: string; value: string };

export type RegisterEntry = {
  id: string;
  finding: string;
  entity: string;
  field: string;
  locale: "en" | "es" | "both";
  sources: RegisterSource[];
  action: string;
  evidence: string;
  status: RegisterStatus;
};

const SITE = "https://www.gfb-solutions.com";
export const sourceUrl = (path: string) => `${SITE}${path}`;

/** Red grape summary (/red-grape-concentrate) against each variety's specification sheet. */
const grapeConflict = (
  id: string,
  entity: string,
  field: string,
  summary: string,
  sheets: RegisterSource[]
): RegisterEntry => ({
  id,
  finding: "C02",
  entity,
  field,
  locale: "both",
  sources: [{ path: "/red-grape-concentrate", value: summary }, ...sheets],
  action:
    "Both values kept as published on their own page. The summary is not harmonised with the sheet until GFB approves the specification.",
  evidence: "Range summary and product specification publish different limits for the same product.",
  status: "conflict"
});

export const contentRegister: RegisterEntry[] = [
  {
    id: "C01-std-end-overview",
    finding: "C01",
    entity: "52 mm (202) Dia Aluminium End, SOT standard aperture (Korinthos)",
    field: "Product overview",
    locale: "both",
    sources: [
      {
        path: "/aluminium-can-ends/52mm-(202)-dia-aluminium-end",
        value: "Introduces and recommends the ISE large-aperture (Botcherby) end"
      }
    ],
    action:
      "Replaced by identity-based copy from the product's own sheet (PVC-free internal lacquer, epoxy external lacquer, water-based lining compound). No dimension restated; no ISE value transferred.",
    evidence: "/aluminum-can-end-52mm-202-std-sot (same product) lists those three properties.",
    status: "corrected"
  },
  {
    id: "C01-std-end-dimensions",
    finding: "C01",
    entity: "52 mm (202) Dia Aluminium End, SOT standard aperture (Korinthos)",
    field: "Dimensions in the overview",
    locale: "both",
    sources: [
      { path: "/aluminium-can-ends/52mm-(202)-dia-aluminium-end", value: "curl external diameter of 59.44 mm" }
    ],
    action: "Not restated in the new overview; the specification page keeps its published values (see C08).",
    evidence: "The overview was written for the ISE end; attribution of the dimension cannot be confirmed from it.",
    status: "needs-confirmation"
  },
  grapeConflict("C02-rgjc-color", "RGJC R-600", "Color (520 nm)", "800-900", [
    { path: "/rgjc-red-600", value: "500 - 600 By Welch Method" },
    { path: "/red-grape-juice/rgjc-r-600", value: "500-600 at 520 nm" }
  ]),
  grapeConflict("C02-rgjc-turbidity", "RGJC R-600", "Turbidity", "< 100 NTU", [
    { path: "/rgjc-red-600", value: "< 50 NTU At 16 °Brix" },
    { path: "/red-grape-juice/rgjc-r-600", value: "below 50 NTU at 16°Brix" }
  ]),
  grapeConflict("C02-rgjc-so2", "RGJC R-600", "SO₂ Total (mg/kg)", "< 50", [
    { path: "/rgjc-red-600", value: "< 10 By Monier Williams" },
    { path: "/red-grape-juice/rgjc-r-600", value: "under 10 mg/kg" }
  ]),
  grapeConflict("C02-cabernet-so2", "Cabernet Sauvignon", "SO₂ Total (mg/kg)", "< 5", [
    { path: "/cabernet-sauvignon", value: "< 10 By Monier Williams" },
    { path: "/red-grape-juice/cabernet-sauvignon", value: "less than 10 mg/kg" }
  ]),
  {
    id: "C08-std-end-curl",
    finding: "C08",
    entity: "52 mm (202) Dia Aluminium End, SOT standard aperture (Korinthos)",
    field: "Curl External Diameter (two values, same label)",
    locale: "both",
    sources: [
      { path: "/aluminum-can-end-52mm-202-std-sot", value: "59.44 mm" },
      { path: "/aluminum-can-end-52mm-202-std-sot", value: "57.66 mm" }
    ],
    action: "Both rows kept with the published label. Neither is relabelled as an inside diameter.",
    evidence: "The ISE sheet labels its pair outside/inside, which suggests but does not prove the same here.",
    status: "conflict"
  },
  {
    id: "C05-shrink-benefits",
    finding: "C05",
    entity: "Shrink sleeve labels",
    field: "Benefits",
    locale: "both",
    sources: [
      { path: "/shrink-sleeve-labels", value: "Benefits list (360-degree decoration, durability, special solutions…)" }
    ],
    action:
      'Restored as qualified capabilities. Dropped as unsupported or without product information: "withstand harsh environmental conditions", "all printing methods", "Innovative Developments", "Product Enhancement".',
    evidence: "Official page; the absolute claims have no product documentation.",
    status: "corrected"
  },
  {
    id: "C06-wet-glue-ordering",
    finding: "C06",
    entity: "Wet glue labels",
    field: "Easy Online Ordering",
    locale: "both",
    sources: [{ path: "/wet-glue-labels", value: "Calculate your needs and place orders online" }],
    action: "Removed; the closing text now asks for a quotation (the page's call to action is a commercial inquiry).",
    evidence: "No ordering system or calculator exists on the site.",
    status: "withheld"
  },
  {
    id: "C06-wet-glue-environment",
    finding: "C06",
    entity: "Wet glue labels",
    field: "Environmental claims",
    locale: "both",
    sources: [
      { path: "/wet-glue-labels", value: "100% Sustainable Paper Product" },
      { path: "/wet-glue-labels", value: "Sustainable Inks … highest environmental standards" }
    ],
    action: '"100% recycled paper" kept as an option on request; the absolute sustainability claims removed.',
    evidence: "No certification or product documentation supports them.",
    status: "needs-confirmation"
  },
  {
    id: "C07-ripcap-coatings",
    finding: "C07",
    entity: "26 mm RipCap, 42 mm RipCap, 26 mm ring crown cap",
    field: "Inside lacquer / White coating",
    locale: "both",
    sources: [
      { path: "/42mm-ripcap", value: "Mod. vinyl resin or polyester-phenolic\nWhite coating Mod. | Polyester" },
      {
        path: "/ripcap/42-mm-ripcap",
        value: "Inside Lacquer: modified vinyl resin or polyester-phenolic; White Coating: a modified polyester coating"
      }
    ],
    action:
      "Split into two label/value pairs (Inside lacquer → Mod. vinyl resin or polyester-phenolic; White coating → Mod. Polyester). Duplicate Coatings and printing block on /42mm-ripcap shown once.",
    evidence: "Nested product pages and the 26 mm ring crown cap sheet publish the same pairs.",
    status: "corrected"
  },
  {
    id: "sleek-fill-volume",
    finding: "D01",
    entity: "Sleek can D57 mm",
    field: "Nominal fill volume",
    locale: "both",
    sources: [
      { path: "/sleek-can-d57mm", value: "270 ml" },
      { path: "/sleek-can-d57mm", value: "122 mm for 269 ml" }
    ],
    action: "Both kept as published.",
    evidence: "Same page, two volumes for the same height row.",
    status: "conflict"
  },
  {
    id: "crown-caps-29mm",
    finding: "C09",
    entity: "Crown caps (26 and 42 mm)",
    field: "Customization of 42 mm crown caps",
    locale: "both",
    sources: [{ path: "/ripcap/crown-cork-bottle-caps", value: "Decorated 29 mm crown caps can be customized" }],
    action: "Kept as published (translated in Spanish).",
    evidence: "The page only describes 26 and 42 mm caps; 29 mm may be a typo.",
    status: "needs-confirmation"
  },
  {
    id: "soft-drinks-opening",
    finding: "C09",
    entity: "Soft drink bottles",
    field: "Opening text",
    locale: "both",
    sources: [{ path: "/soft-drinks", value: "Glass bottles keep filtered water fresh and pure…" }],
    action: "Rewritten to what applies to soft-drink bottles (easy to clean, clarity over many washing cycles).",
    evidence: "Same text as /water (filtered water, chemical contamination).",
    status: "corrected"
  },
  {
    id: "iqf-peel-claims",
    finding: "C09",
    entity: "IQF orange peel shells, IQF orange peel squares",
    field: "Peel article",
    locale: "both",
    sources: [
      {
        path: "/iqf-orange-frozen/iqf-orange-peel-shells",
        value: "…They also prevent cancer by making your body alkaline…"
      }
    ],
    action: "Removed (nutrient figures, skincare, household and disease claims).",
    evidence: "Consumer article; not product information.",
    status: "withheld"
  },
  {
    id: "iqf-wrong-fruit",
    finding: "C09",
    entity: "IQF orange slices, half slices, 1/8 cut; IQF lime 1/8 cut",
    field: "Fruit description",
    locale: "both",
    sources: [
      {
        path: "/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm",
        value: "very sharp, acidic citrus fruit with a shiny yellow skin"
      },
      { path: "/iqf-orange-frozen/iqf-orange-1%2F8-cut", value: "They are yellow and bigger … With less citric acid" }
    ],
    action: "Wrong-fruit descriptions removed or rewritten from the cut itself.",
    evidence: "Text copied from the lemon pages.",
    status: "corrected"
  },
  {
    id: "tamarind-organic",
    finding: "C09",
    entity: "Tamarind",
    field: "Organic formats",
    locale: "both",
    sources: [{ path: "/tropical/tamarind", value: "Organics: Not apply" }],
    action:
      'Kept as "not available"; the removed "organic tamarind" sentence (another company\'s copy) is not restored.',
    evidence: "Formats table of the official page.",
    status: "needs-confirmation"
  },
  {
    id: "ingredients-es-template",
    finding: "C03",
    entity: "Ingredients and chemicals (historical overview)",
    field: "Spanish H1 and first paragraph",
    locale: "es",
    sources: [
      { path: "/ingredients-and-materials", value: "TECNOLOGÍA HABILITADA POR LA PERCEPCIÓN" },
      { path: "/ingredients-and-materials", value: "Haga clic aquí para editar este párrafo…" }
    ],
    action: "Template title replaced by the page subject; template placeholder paragraph removed.",
    evidence: 'English page: "Ingredients and chemicals". Commercial status of the page still to be confirmed.',
    status: "corrected"
  },
  {
    id: "D09-legal-drafts",
    finding: "D09",
    entity: "Privacy and cookie policies (EN/ES)",
    field: "Policy text",
    locale: "both",
    sources: [
      { path: "/en/legal/privacy", value: "Draft for review" },
      { path: "/en/legal/cookies", value: "Draft for review" }
    ],
    action: "Draft status kept visible; no policy text written.",
    evidence: "Approved legal copy has not been provided.",
    status: "needs-legal-copy"
  }
];
