/**
 * Editorial corrections of demonstrable errors in the crawled legacy copy, applied by
 * scripts/build-migration-manifest.ts to the raw blocks before processing — of both languages,
 * or of one (`locale`) when the two pages publish different text.
 * Scope: wrong fruit names left by copy-paste between product pages (several IQF lime pages
 * were written from the lemon pages), another company's name inherited from copied copy,
 * statements split by the page layout into fragments that change their meaning, and
 * consumer-marketing wording replaced by the product information it contains. Technical values,
 * sizes and specifications are never changed here. Each `find` must still exist on its page
 * (the English one unless `locale` says otherwise), or the build fails, so a correction never
 * silently outlives a change of the source page. Open questions are listed in
 * docs/product-content-reconciliation.md.
 */
import type { Locale } from "../i18n/config.ts";

export type Correction = { path: string; find: string; replace: string; reason: string; locale?: Locale };

/** "Viscous red liquid without additives" + "Flavourings or colourings of any kind": one negative statement, split by the layout. */
const GRAPE_SHEETS = [
  "/merlot",
  "/malbec",
  "/cabernet-sauvignon",
  "/red-800",
  "/red-1000",
  "/rgjc-red-600",
  "/tintorera-red-4000"
];
const grapeCharacteristics: Correction[] = GRAPE_SHEETS.flatMap((path): Correction[] => [
  {
    path,
    find: "Viscous red liquid without additives",
    replace: "Viscous red liquid",
    reason:
      'The layout split one negative statement in two and the second fragment read as an affirmative claim; the list now reads "Viscous red liquid" + "No additives, flavourings or colourings of any kind" (the red grape overview publishes the full sentence).'
  },
  {
    path,
    find: "Flavourings or colourings of any kind",
    replace: "No additives, flavourings or colourings of any kind",
    reason: "Second half of the same statement, restored as a complete negative."
  },
  {
    path,
    locale: "es",
    find: "Líquido rojo viscoso sin aditivos",
    replace: "Líquido rojo viscoso",
    reason: "Same split statement on the Spanish page."
  },
  {
    path,
    locale: "es",
    find: "Saborizantes o colorantes de cualquier tipo",
    replace: "Sin aditivos, saborizantes ni colorantes de ningún tipo",
    reason: "Second half of the same statement, restored as a complete negative."
  }
]);

/** Sentences naming another company ("Valencia Orange"), copied from its website. */
const VALENCIA_ORANGE: [string, string][] = [
  ["/tropical/tamarind", " Furthermore in Valencia Orange we also have organic tamarind."],
  [
    "/tropical/mango",
    "At Valencia Orange we have the varieties of mango totapuri, alphonso, kent, magdalena river and tommy. "
  ],
  ["/mediterranean/peach", "At Valencia Orange we have the varieties of peach freestone, clingstone and white peach. "],
  [
    "/mediterranean/pomegranate",
    "At Valencia Orange we work with different types of pomegranate, such as the mollar pomegranate or the wonderful pomegranate. "
  ],
  [
    "/tropical/coconut",
    "Coconut is a tropical fruit available in Valencia Orange, diced, coconut cream and coconut water."
  ],
  ["/mediterranean/melon", "At Valencia Orange we have the varieties of cantaloupe melon and honeydew melon. "]
];
const valenciaOrange: Correction[] = VALENCIA_ORANGE.map(([path, find]) => ({
  path,
  find,
  replace: "",
  reason:
    "Inherited from another company's copy; the availability it states (varieties, organic) is not confirmed for GFB and is flagged for review."
}));

const ORANGE_COPY =
  "Versatile and Convenient: Whether mixed with water for a revitalizing drink, blended into smoothies for a nutritious boost, or used as a flavorful ingredient in culinary creations, our orange concentrate adds a touch of Mediterranean sunshine to any occasion.\nNaturally Energizing: Experience a natural energy boost with every glass of Spanish orange concentrate, revitalizing your body and replenishing your spirit with the invigorating essence of freshly squeezed oranges.\nDiscover the vibrant flavors and healthful benefits of Spanish orange concentrate – a pure taste of Spain in every drop.";
const orange: Correction[] = [
  {
    path: "/citrics/orange-concentrate",
    locale: "en",
    find: ORANGE_COPY,
    replace:
      "Orange concentrate can be mixed with water for drinks, blended into smoothies or used as an ingredient in culinary preparations.",
    reason:
      "Consumer energy/well-being wording; kept only the uses it states. The origin claim (Spanish oranges) is flagged for review."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "es",
    find: ORANGE_COPY,
    replace:
      "El concentrado de naranja puede mezclarse con agua para bebidas, añadirse a batidos o usarse como ingrediente en preparaciones culinarias.",
    reason: "The Spanish page publishes the same English copy; same correction, in Spanish."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "en",
    find: "Discover the Pure Essence of Spanish Orange Concentrate",
    replace: "Applications",
    reason: "Promotional heading (with an unconfirmed origin claim) replaced by a functional one."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "es",
    find: "Discover the Pure Essence of Spanish Orange Concentrate",
    replace: "Aplicaciones",
    reason: "Same heading on the Spanish page."
  }
];

/** C01: the standard-aperture end's overview was copied from the ISE (large aperture) end. */
const STD_END_OVERVIEW =
  "Product Overview\nIntroducing the 52mm (202) Dia ISE Aluminium End SOT - Large Aperture (Botcherby), engineered for durability and high performance in various applications.\nEco-Friendly Internal Lacquer\nThis product features a PVC-free internal lacquer, ensuring an environmentally responsible choice without sacrificing quality.\nDurable External Protection\nThe external epoxy lacquer offers superior resistance to wear and tear, providing long-lasting protection and reliability in diverse environments.\nSafe and Sustainable Lining\nOur water-based lining compound enhances safety and sustainability, making it suitable for a wide range of applications while minimizing environmental impact.\nPrecision Engineering\nDesigned with a curl external diameter of 59.44 mm, this aluminium end is engineered for a precise fit, ensuring optimal functionality.\nElevate Your Projects\nChoose the 52mm (202) Dia ISE Aluminium End SOT to enhance your projects with a high-quality, reliable solution that meets your specific needs.";
const STD_END_REASON =
  "The overview of the standard-aperture (Korinthos) end introduces and recommends the ISE large-aperture (Botcherby) end. Rewritten from this product's own specification sheet (/aluminum-can-end-52mm-202-std-sot: PVC-free internal lacquer, epoxy external lacquer, water-based lining compound). No dimension is restated: the sheet's two \"Curl External Diameter\" values are an open question (C08).";
const stdEnd: Correction[] = [
  {
    path: "/aluminium-can-ends/52mm-(202)-dia-aluminium-end",
    locale: "en",
    find: STD_END_OVERVIEW,
    replace:
      "Product overview\nThe 52 mm (202) Dia Aluminium End with SOT standard aperture (Korinthos) has a PVC-free internal lacquer, an epoxy external lacquer and a water-based lining compound. Its dimensions are listed in the technical specification.",
    reason: STD_END_REASON
  },
  {
    path: "/aluminium-can-ends/52mm-(202)-dia-aluminium-end",
    locale: "es",
    find: STD_END_OVERVIEW,
    replace:
      "Descripción del producto\nLa tapa de aluminio de 52 mm (202) Dia con abertura estándar SOT (Korinthos) tiene laca interior sin PVC, laca exterior epoxi y compuesto de sellado de base acuosa. Sus dimensiones figuran en la especificación técnica.",
    reason: `${STD_END_REASON} The Spanish page publishes the same English text.`
  }
];

const pageCorrections = (path: string, reason: string, pairs: [string, string][]): Correction[] =>
  pairs.map(([find, replace]) => ({ path, find, replace, reason }));

/** C05: shrink sleeve capabilities, without absolute claims ("all printing methods", "harsh conditions"). */
const shrinkSleeve = pageCorrections(
  "/shrink-sleeve-labels",
  "Benefits restored as product capabilities (they were withheld with the health-claim filter); absolute wording qualified, promotional lines without product information dropped.",
  [
    ["Experience the many advantages of shrink sleeve labels:", ""],
    [
      "360-Degree Decoration: Achieve flawless, full-wrap designs that provide a cohesive look from every angle.",
      "360° decoration: full-wrap designs that read consistently from every angle."
    ],
    [
      "Eye-Catching Appeal: Make your products stand out with labels that are both visually appealing and shelf-friendly.",
      "Shelf presence: distinctive full-body graphics on the shelf."
    ],
    [
      "Durability: Our labels are designed to withstand harsh environmental conditions, protecting your product from light, scratches, and dirt.",
      "Durability: the sleeve helps protect the product and its graphics from light, scratches and dirt."
    ],
    [
      "Versatility: Accommodate all printing methods in a single process for streamlined production.",
      "Versatility: several printing methods can be combined in a single process."
    ],
    [
      "Special Solutions: Tailor-made options to meet the specific needs of any product.",
      "Custom solutions: options tailored to the requirements of each product."
    ],
    ["Innovative Developments: Stay ahead with cutting-edge technologies and future-ready capabilities.", ""],
    [
      "Product Enhancement: Boost the visual and functional quality of your labels with the latest advancements in decoration technology.",
      ""
    ],
    [
      "Elevate your product packaging with our high-quality shrink sleeve labels and experience the perfect blend of innovation and functionality.",
      ""
    ]
  ]
);

/** C06: no online ordering journey exists; environmental wording kept only where it describes an option. */
const wetGlue = pageCorrections(
  "/wet-glue-labels",
  'No online calculator or ordering system exists (the page leads to a commercial inquiry): the online-ordering line is removed and the closing text points to a quotation request. The 100% recycled paper option is kept as an option on request; unsupported environmental claims ("100% sustainable", "highest environmental standards") are removed.',
  [
    ["Wet Glue Labels: Features and Benefits", ""],
    ["Key Benefits", "Options"],
    [
      "Combining sustainability with high performance, these labels offer an excellent solution for brands looking to make an impact",
      "They combine a paper label with high print quality and a wide choice of materials and finishes."
    ],
    [
      "100% Sustainable Paper Product: Our labels are crafted from fully sustainable materials, aligning with eco-friendly practices.",
      ""
    ],
    [
      "Recycled Paper Options: Available as a 100% recycled paper product, if desired, further reducing your environmental footprint.",
      "Recycled paper option: available on 100% recycled paper on request."
    ],
    [
      "Cost-Effective Solution: Designed for budget-conscious brands without compromising on quality.",
      "Cost-effective: suited to large production runs."
    ],
    [
      "Sustainable Inks: We use eco-friendly inks that meet the highest environmental standards, ensuring a greener choice for your labeling needs.",
      ""
    ],
    [
      "High Print Quality: Enjoy crisp, vibrant graphics that elevate your brand image and attract consumer attention.",
      "High print quality: sharp, vibrant graphics."
    ],
    [
      "Short Delivery Times: We understand the importance of efficiency; our streamlined processes ensure quick turnaround times for your orders.",
      "Short lead times: delivery dates are agreed with each order."
    ],
    [
      "Easy Online Ordering: Calculate your needs and place orders online with ease, making the process convenient and efficient.",
      ""
    ],
    [
      "Hot Foil Stamping: Enhance your labels with luxurious hot foil stamping options, adding a premium touch to your products.",
      "Hot foil stamping: available as a premium finish."
    ],
    [
      "Numerous Materials: Choose from a wide variety of materials to find the perfect fit for your brand and application.",
      "Materials: a wide choice of label materials for each application."
    ],
    [
      "High-Quality Finishes: Our labels come with various finishes, ensuring durability and a polished look that stands out on the shelf.",
      "Finishes: several finishes for durability and appearance."
    ],
    [
      "Free Form & Design: With our flexible design options, you can customize your labels to perfectly match your brand identity.",
      "Free form and design: shapes and designs customised to the brand."
    ],
    ["Why Choose Our Wet Glue Labels?", "Request a quotation"],
    [
      "Our Wet Glue Labels not only offer a sustainable and cost-effective solution but also provide the quality and customization needed to stand out in a competitive market. Elevate your beverage brand with our high-quality labeling options today!",
      "Send GFB your quantities, label format and finishing requirements to receive a quotation for your wet glue labels."
    ]
  ]
);

/** C09: inherited wording and household advice. */
const editorial: Correction[] = [
  {
    path: "/tropical/tamarind",
    find: "The tamarind is the ideal fruit to the elaboration of concentrates and purees.",
    replace: "Tamarind is supplied as juice concentrate and as puree.",
    reason: "Ungrammatical sentence; rewritten with the formats the page lists."
  },
  {
    path: "/water",
    locale: "en",
    find: "Glass bottles keep filtered water fresh and pure, avoiding chemical contamination.",
    replace: "Glass bottles help preserve the freshness and purity of filtered water.",
    reason: "Absolute guarantee (no contamination) qualified."
  },
  {
    path: "/water",
    locale: "en",
    find: "GFB provides glass bottles easier to clean bottles that keep their clarity after hundreds of washings.",
    replace: "GFB supplies glass bottles that are easy to clean and keep their clarity over many washing cycles.",
    reason: "Ungrammatical sentence."
  },
  {
    path: "/water",
    locale: "es",
    find: "Las botellas de vidrio mantienen el agua filtrada fresca y pura, evitando la contaminación química.",
    replace: "Las botellas de vidrio ayudan a conservar la frescura y la pureza del agua filtrada.",
    reason: "Absolute guarantee (no contamination) qualified."
  },
  {
    path: "/water",
    locale: "es",
    find: "GFB proporciona botellas de vidrio más fáciles de limpiar que mantienen su claridad después de cientos de lavados.",
    replace:
      "GFB suministra botellas de vidrio fáciles de limpiar que conservan su transparencia durante muchos ciclos de lavado.",
    reason: "Same sentence on the Spanish page."
  },
  {
    path: "/ingredients-and-materials",
    locale: "es",
    find: "TECNOLOGÍA HABILITADA POR LA PERCEPCIÓN",
    replace: "INGREDIENTES Y PRODUCTOS QUÍMICOS",
    reason:
      'The Spanish page keeps a website-template title ("Perception-enabled technology") instead of the page subject (English: "Ingredients and chemicals").'
  },
  {
    path: "/ingredients-and-materials",
    locale: "es",
    find: "Haga clic aquí para editar este párrafo y agregar su propio contenido. Este es un gran lugar para ampliar el título y cualquier detalle o información relevante.",
    replace: "",
    reason: 'Website-template placeholder ("Click here to edit this paragraph…"), not content.'
  },
  {
    path: "/soft-drinks",
    locale: "en",
    find: "Glass bottles keep filtered water fresh and pure without the risk of chemicals contaminating the water. GFB provide Glass bottles that are easier to clean and will retain their clarity after hundreds of washings.",
    replace:
      "Glass bottles for soft drinks, easy to clean and designed to keep their clarity over many washing cycles.",
    reason:
      "Opening text copied from the water page (filtered water, chemical contamination); kept only what applies to soft-drink bottles."
  },
  {
    path: "/soft-drinks",
    locale: "es",
    find: "Las botellas de vidrio mantienen el agua filtrada fresca y pura sin el riesgo de que los productos químicos contaminen el agua. GFB proporciona botellas de vidrio que son más fáciles de limpiar y conservarán su claridad después de cientos de lavados.",
    replace:
      "Botellas de vidrio para refrescos, fáciles de limpiar y diseñadas para conservar su transparencia durante muchos ciclos de lavado.",
    reason: "Same text on the Spanish page."
  },
  {
    path: "/aluminium-cans",
    locale: "en",
    find: "GFB have different solutions of types of aluminum cans for the global beverage industry. In search of new innovations, we create cans required by the market creating differentiation for your beverages, our state-of-the-art cans maintain the safety of our customers' beverage products.",
    replace:
      "GFB supplies several types of aluminium cans for the global beverage industry: standard, sleek and slim formats that help differentiate your beverages.",
    reason:
      'Ungrammatical text ("GFB have different solutions of types"); "we create" implied manufacturing and is not stated elsewhere.'
  },
  {
    path: "/aluminium-cans",
    locale: "es",
    find: "GFB fabrica diferentes tipos de latas de aluminio para la industria mundial de bebidas. En busca de nuevas innovaciones, creamos las latas requeridas por el mercado creando diferenciación para sus bebidas, nuestras latas de última generación mantienen la seguridad de los productos de bebidas de nuestros clientes.",
    replace:
      "GFB suministra distintos tipos de latas de aluminio para la industria mundial de bebidas: formatos estándar, sleek y slim que ayudan a diferenciar sus bebidas.",
    reason: 'The Spanish page says GFB "fabrica" (manufactures) the cans; aligned with the English supply wording.'
  },
  {
    path: "/fruit-concentrates",
    locale: "en",
    find: "It is usually used as base stock for various food products. With less volume, it contains soluble solids of 65%-70%. Fruit juice concentrate process is a effective way to reduce packing and transportation cost.",
    replace:
      "It is used as a base for a wide range of food and beverage products. Its reduced volume lowers packaging and transport costs; the soluble-solids level (°Brix) is specified for each product.",
    reason:
      'Ungrammatical text ("a effective way"); the generic 65–70 % soluble-solids figure is not presented as the specification of every variety (each sheet states its own °Brix).'
  },
  {
    path: "/fruit-concentrates",
    locale: "es",
    find: "Por lo general, se utiliza como material base para varios productos alimenticios. Con menor volumen, contiene sólidos solubles de 65%-70%. El proceso de concentrado de jugo de frutas es una forma efectiva de reducir los costos de empaque y transporte.",
    replace:
      "Se utiliza como base para una amplia variedad de alimentos y bebidas. Su menor volumen reduce los costes de envase y transporte; el contenido de sólidos solubles (°Brix) se especifica para cada producto.",
    reason: "Same correction on the Spanish page."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "\nABSORBS REFRIGERATOR ODORS\nLemon sticks also serve to absorb odors that are present in the house.",
    replace: "",
    reason: "Household advice (absorbing refrigerator odours) is not product information for industrial buyers."
  },
  {
    path: "/iqf-orange-frozen/iqf-orange-13-x-13-sticks",
    find: "\nABSORBS REFRIGERATOR ODORS\nOrange sticks also serve to absorb odors that are present in the house.",
    replace: "",
    reason: "Household advice (absorbing refrigerator odours) is not product information for industrial buyers."
  },
  {
    path: "/26mm-ring-crown-cap",
    find: "Coating treatment includes the use of a\nspecial lacquer",
    replace: "Coating treatment includes the use of a special lacquer",
    reason: "One sentence broken over two lines by the layout (it rendered as a heading plus a fragment)."
  },
  {
    path: "/26mm-ring-crown-cap",
    locale: "es",
    find: "el uso de un laca especial",
    replace: "el uso de una laca especial",
    reason: "Spanish grammar (gender agreement)."
  },
  {
    path: "/26mm-ripcap",
    locale: "es",
    find: "PVC alta temperatura (en solicitud)",
    replace: "PVC alta temperatura (bajo pedido)",
    reason: 'Literal translation of "on request".'
  },
  {
    path: "/26mm-ripcap",
    locale: "en",
    find: "PVC high temperature (on\nrequest)",
    replace: "PVC high temperature (on request)",
    reason: "One value broken over two lines by the layout."
  }
];

/**
 * IQF copy inherited from other fruits or from consumer articles: wrong-fruit descriptions
 * (orange "with a shiny yellow skin", orange and lime described as "yellow and bigger" with
 * "less citric acid") and peel articles with nutrition, skincare, household and disease claims
 * ("prevent cancer"). Removed; the product facts table and uses stay.
 */
const ORANGE_PEEL_ARTICLE =
  "Orange peels contain 5 to 10 times more vitamins than Orange juice and they are likewise a great source of calcium, fiber, potassium, magnesium, and beta-carotene. 100 grams of Orange peels contain 10.6 grams of fiber, 134 mg of Calcium, 129 mg of vitamin C, and 160 mg of Potassium.\nOrange peels can be used for many different things. It can be used for food and drinks, for skincare, and even for cleaning. Below are some of the many ways you can use Orange peels.\nOrange peels can help make your skin and hair healthier and more beautiful. Below are some ways on how to use them.\nOrange peels are not just meant to help you health-wise. They have a variety of other uses for cleaning, disinfecting, and deodorizing parts of your home as well.\nOrange peels are likewise full of citrus bioflavonoids that reduce oxidative stress levels. They also prevent cancer by making your body alkaline. Cancer only thrives in acidic environments. Aside from these, Orange peels also contain limonene and salvestrol Q40 which fights the cancerous cells in your body.";
const WRONG_FRUIT_HISTORY = (fruit: string) =>
  `The ${fruit} is the fruit of the ${fruit} tree. It also has its origin in Asia, and it is believed that it also comes from India and China. Columbus was the one who took it to the Americas and there it gained great importance. They are yellow and bigger. It has a sweet and slightly acid taste. With less citric acid, it doesn't require as much sugar to soften the flavor.\n`;
const iqfCopy: Correction[] = [
  ...["/iqf-orange-frozen/iqf-orange-peel-shells", "/iqf-orange-frozen/iqf-orange-peel-square"].map((path) => ({
    path,
    find: ORANGE_PEEL_ARTICLE,
    replace: "",
    reason:
      'Consumer article on orange peel: nutrient figures, skincare and household uses, and disease claims ("prevent cancer"). Not product information; removed.'
  })),
  {
    path: "/iqf-orange-frozen/iqf-orange-1%2F8-cut",
    find: WRONG_FRUIT_HISTORY("Orange"),
    replace: "",
    reason: 'Copied text about another citrus ("yellow and bigger", "less citric acid"); wrong for orange.'
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: WRONG_FRUIT_HISTORY("lime"),
    replace: "",
    reason: 'Copied text about another citrus ("yellow and bigger", "less citric acid"); wrong for lime.'
  },
  {
    path: "/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm",
    find: "Orange Slice is a slice cut from the Orange fruit, which is a very sharp, acidic citrus fruit with a shiny yellow skin and bitter but zingy flavour.",
    replace: "Orange Slice is a full slice cut across the orange.",
    reason: 'Lemon description copied onto the orange page ("very sharp, acidic", "shiny yellow skin").'
  },
  {
    path: "/iqf-orange-frozen/iqf-orange-half-slices-6-%2F-9-mm",
    find: "Orange Half Slice is a slice cut from the Orange fruit and additionally cut in half, which is a very strong acidic citrus fruit with a bright yellow skin and a bitter but pungent taste.",
    replace: "Orange Half Slice is a slice cut across the orange and then cut in half.",
    reason: 'Lemon description copied onto the orange page ("very strong acidic", "bright yellow skin").'
  },
  {
    path: "/iqf-lemon-slices/iqf-lemon-half-slices",
    find: "Adding slices of lemons cut in half to drinks, desserts, recipes, and different dishes is the way to provide a variety of vitamins and minerals, which are important in a balanced diet. ",
    replace: "",
    reason: "Nutrition claim (vitamins and minerals for a balanced diet); the uses that follow stay."
  }
];

export const corrections: Correction[] = [
  ...iqfCopy,
  ...stdEnd,
  ...shrinkSleeve,
  ...wetGlue,
  ...editorial,
  {
    path: "/vegetables/ginger",
    find: "\nAdditionally, it should be noted that ginger is used.",
    replace: "",
    reason: "Truncated sentence (the source page ends it mid-statement)."
  },
  {
    path: "/vegetables/pepper",
    find: "concentrate, juice or puree.`",
    replace: "concentrate, juice or puree.",
    reason: "Stray backtick in the published sentence."
  },
  ...grapeCharacteristics,
  ...valenciaOrange,
  ...orange,
  {
    path: "/iqf-lemon-slices/iqf-lemon-one-fourths-cut",
    find: "then the grapefruit is rotated 90 degrees",
    replace: "then the lemon is rotated 90 degrees",
    reason: "The lemon 1/4 cut page describes rotating a grapefruit."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-slice--6-%2F-9-mm",
    find: "Lime Slice is a slice cut from the lemon fruit, which is a very sharp, acidic citrus fruit with a shiny yellow skin and bitter but zingy flavour.",
    replace:
      "Lime Slice is a slice cut from the lime fruit, a very sharp, acidic citrus fruit with a bitter but zingy flavour.",
    reason: "Describes lime as a slice of lemon with yellow skin (copied from the lemon page)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-half-slices-6-%2F-9-mm",
    find: "Lime Half Slice is a slice cut from the lemon fruit and additionally cut in half, which is a very strong acidic citrus fruit with a bright yellow skin and a bitter but pungent taste.",
    replace:
      "Lime Half Slice is a slice cut from the lime fruit and additionally cut in half, a very strong acidic citrus fruit with a bitter but pungent taste.",
    reason: "Describes lime as a slice of lemon with yellow skin (copied from the lemon page)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F4-cut",
    find: "then the lemon is rotated 90 degrees",
    replace: "then the lime is rotated 90 degrees",
    reason: "The lime 1/4 cut page describes rotating a lemon."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "These lemon wedges can be added",
    replace: "These lime wedges can be added",
    reason: "The lime 1/8 cut page calls the product lemon wedges."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "Cut lemon wedges can be stored",
    replace: "Cut lime wedges can be stored",
    reason: "The lime 1/8 cut page calls the product lemon wedges."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "Ingredients: IQF Lemon 1/8 Cut",
    replace: "Ingredients: IQF Lime 1/8 Cut",
    reason: "The ingredient of the lime 1/8 cut is given as lemon (product label to confirm with GFB)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "Lemon sticks are ideal",
    replace: "Lime sticks are ideal",
    reason: "The lime sticks page calls the product lemon sticks."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "Lemon sticks are excellent",
    replace: "Lime sticks are excellent",
    reason: "The lime sticks page calls the product lemon sticks."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-zest",
    find: "The lemon peel is washed",
    replace: "The lime peel is washed",
    reason: "The lime zest process describes lemon peel."
  }
];

/**
 * Field boundaries the page layout broke: a consecutive run of blocks (exact text, before
 * cleaning) replaced by the same values split into label/value blocks. Values are never changed,
 * only where one field ends and the next begins — taken from the same product's other pages.
 */
/** A replacement block keeps the tag of the run it replaces unless it names its own (e.g. a heading). */
type ReplacementBlock = string | { tag: string; text: string };
export type BlockCorrection = {
  path: string;
  blocks: string[];
  replace: ReplacementBlock[];
  reason: string;
  locale?: Locale;
  /** "prefix": each block only has to start with the given text (long published paragraphs). */
  match?: "exact" | "prefix";
};

const RIPCAP_COATINGS_REASON =
  'The layout merged "White coating" into the inside-lacquer value and left "Polyester" on its own. The nested 42 mm RipCap page states "Inside Lacquer: modified vinyl resin or polyester-phenolic" and "White Coating: A modified polyester coating", and the 26 mm ring crown cap page publishes "White coating (BPA-NI)" + "Mod. Polyester": two label/value pairs.';
const ripcapCoatings = (path: string): BlockCorrection[] => [
  {
    path,
    blocks: ["Inside lacquer", "Mod. vinyl resin or polyester-phenolic\nWhite coating Mod.", "Polyester"],
    replace: ["Inside lacquer", "Mod. vinyl resin or polyester-phenolic", "White coating", "Mod. Polyester"],
    reason: RIPCAP_COATINGS_REASON
  },
  {
    path,
    locale: "es",
    blocks: [
      "Lacado interior",
      "Modificación. resina vinílica o poliéster-fenólico Revestimiento blanco Mod.",
      "Poliéster"
    ],
    replace: [
      "Laca interior",
      "Resina vinílica modificada o poliéster-fenólica",
      "Recubrimiento blanco",
      "Poliéster modificado"
    ],
    reason: `${RIPCAP_COATINGS_REASON} The Spanish page also machine-translated "Mod." as "Modificación."`
  }
];

const CROWN_CAP_SHELL_REASON =
  'Cap shell and ring blank properties were published as loose lines ("Cap Shell", "Sheet steel", "Hardness T2", a tin coating split over two lines). Shown as label/value pairs; every value is the published one. The Spanish page repeated "Hardness T2", placed a "Ring blank" group twice and translated "Ring Blank" as "anillo en blanco" and "liner" as "transatlántico": rebuilt from the English structure.';

/**
 * D01: the can product pages published one long paragraph that repeated every volume and height
 * in prose. Rebuilt as a short description, diameter and cap/lid as properties, and the
 * published height per nominal fill volume as a list (rendered as the comparison table). Every
 * value is the published one; only the repeated marketing prose is removed.
 */
type CanSpec = {
  path: string;
  name: { en: string; es: string };
  diameter: string;
  lid: string;
  heights: [string, string][];
  /** The Spanish page publishes the same English paragraph (false: it has its own content). */
  spanish?: false;
};
const CAN_SPECS: CanSpec[] = [
  {
    path: "/aluminum-cans/std-can-d66mm",
    name: { en: "Standard", es: "estándar" },
    diameter: "66.30 mm",
    lid: "202#",
    heights: [
      ["92 mm", "250 ml"],
      ["115 mm", "330 ml"],
      ["122 mm", "355 ml"],
      ["157 mm", "473 ml"],
      ["168 mm", "500 ml"],
      ["188 mm", "568 ml"]
    ]
  },
  {
    path: "/aluminum-cans/sleek-can-d57mm",
    name: { en: "Sleek", es: "sleek" },
    diameter: "57.4 mm",
    lid: "202#",
    heights: [
      ["95.6 mm", "200 ml"],
      ["115 mm", "250 ml"],
      ["122 mm", "270 ml"],
      ["138.6 mm", "310 ml"],
      ["146 mm", "330 ml"],
      ["155.6 mm", "355 ml"]
    ]
  },
  {
    path: "/aluminum-cans/slim-can-d53mm",
    name: { en: "Slim", es: "slim" },
    diameter: "53 mm",
    lid: "200#",
    heights: [
      ["88.4 mm", "150 ml"],
      ["104 mm", "180 ml"],
      ["134 mm", "250 ml"]
    ]
  }
];
const STD_CAN = CAN_SPECS[0];
// The flat standard-can page repeats the product page's paragraph (in a heading block); its
// Spanish page has its own structured content.
CAN_SPECS.push({ ...STD_CAN, path: "/std-can-d66mm", spanish: false });
const p = (text: string) => ({ tag: "p", text });
const canCorrections = CAN_SPECS.flatMap(({ path, name, diameter, lid, heights, spanish }): BlockCorrection[] => {
  const reason =
    "D01: one paragraph repeated every volume and height in prose. Rebuilt as a short description, diameter and cap/lid as properties and the published heights per nominal fill volume as the comparison table; all values as published.";
  const source = `${name.en} Can Specifications
Our ${name.en.toLowerCase()} cans are designed`;
  const english: BlockCorrection = {
    path,
    match: "prefix",
    blocks: [source],
    replace: [
      p(
        `${name.en} cans for beverages and other liquid products, with the same design across every size and compatible with standard filling lines.`
      ),
      { tag: "h2", text: "Key dimensions" },
      p("Outside diameter"),
      p(`${diameter} (maximum tolerance)`),
      p("Cap/lid"),
      p(lid),
      { tag: "h2", text: "Open can height by nominal fill volume" },
      ...heights.map(([height, volume]) => ({ tag: "li", text: `${height} for ${volume}` }))
    ],
    reason
  };
  if (spanish === false) return [english];
  return [
    english,
    {
      path,
      locale: "es",
      match: "prefix",
      blocks: [source],
      replace: [
        p(
          `Latas ${name.es} para bebidas y otros productos líquidos, con el mismo diseño en todos los tamaños y compatibles con las líneas de llenado estándar.`
        ),
        { tag: "h2", text: "Dimensiones principales" },
        p("Diámetro exterior"),
        p(`${diameter.replace(".", ",")} (tolerancia máxima)`),
        p("Tapa"),
        p(lid),
        { tag: "h2", text: "Altura de lata abierta por volumen nominal" },
        ...heights.map(([height, volume]) => ({ tag: "li", text: `${height.replace(".", ",")} para ${volume}` }))
      ],
      reason: `${reason} The Spanish page published the same English paragraph.`
    }
  ];
});

export const blockCorrections: BlockCorrection[] = [
  {
    path: "/crown-corks-caps",
    blocks: [
      "Crown Caps\n26mm",
      "CHARACTERISTICS",
      "Tinplate, electrolytically lined with tin, or TFS steel , chromium plated sheet metal, according to DIN 6099",
      "Standard Pantone PMS colours, with neutral one colour printing, multicolour printing or customer designed printing using the offset printing method. We also make crown caps with inside printing.",
      "Crown Caps\n42mm",
      "CHARACTERISTICS",
      "Made from steel for glass bottles",
      "Maximum sealing pressure and good hermetic seal for vast range of drinks",
      "Five colours gold, silver, white, black & red",
      "Decorated 29mm crown caps are also available with printed logo or design when the brand demands it"
    ],
    replace: [
      { tag: "h2", text: "Crown caps 26 mm" },
      { tag: "p", text: "Tinplate, electrolytically lined with tin, or TFS steel, chromium-plated sheet metal, according to DIN 6099" },
      { tag: "p", text: "Standard Pantone PMS colours, with neutral one-colour printing, multicolour printing or customer-designed printing using the offset printing method. We also make crown caps with inside printing." },
      { tag: "h2", text: "Crown caps 42 mm" },
      { tag: "p", text: "Made from steel for glass bottles" },
      { tag: "p", text: "Maximum sealing pressure and good hermetic seal for a vast range of drinks" },
      { tag: "p", text: "Five colours: gold, silver, white, black and red" },
      { tag: "p", text: "Decorated 29 mm crown caps are also available with a printed logo or design when the brand demands it" }
    ],
    reason:
      "Groups the published Crown caps 26 mm and 42 mm characteristics under their own headings; only spacing and British-English grammar are corrected. The 29 mm offer remains published as an unresolved additional presentation."
  },
  {
    path: "/crown-corks-caps",
    locale: "es",
    blocks: [
      "Tapas de corona 26 mm",
      "CARACTERÍSTICAS",
      "Hojalata, revestida electrolíticamente con estaño, o acero TFS, chapa cromada, según DIN 6099",
      "Colores estándar Pantone PMS, con impresión monocolor neutra, impresión multicolor o impresión diseñada por el cliente mediante el método de impresión offset. También hacemos gorras de corona con impresión interior.",
      "Tapas de corona 42 mm",
      "CARACTERÍSTICAS",
      "Hecho de acero para botellas de vidrio.",
      "Máxima presión de sellado y buen cierre hermético para una amplia gama de bebidas",
      "Cinco colores oro, plata, blanco, negro y rojo.",
      "Las tapas de corona decoradas de 29 mm también están disponibles con el logotipo o diseño impreso cuando la marca lo exige."
    ],
    replace: [
      { tag: "h2", text: "Tapas de corona de 26 mm" },
      { tag: "p", text: "Hojalata revestida electrolíticamente con estaño o acero TFS, chapa cromada, según DIN 6099" },
      { tag: "p", text: "Colores estándar Pantone PMS, con impresión monocolor neutra, impresión multicolor o impresión diseñada por el cliente mediante el método de impresión offset. También fabricamos tapas de corona con impresión interior." },
      { tag: "h2", text: "Tapas de corona de 42 mm" },
      { tag: "p", text: "Fabricadas en acero para botellas de vidrio." },
      { tag: "p", text: "Máxima presión de sellado y buen cierre hermético para una amplia gama de bebidas" },
      { tag: "p", text: "Cinco colores: oro, plata, blanco, negro y rojo." },
      { tag: "p", text: "Las tapas de corona decoradas de 29 mm también están disponibles con el logotipo o diseño impreso cuando la marca lo exige." }
    ],
    reason:
      "Groups the published Spanish 26 mm and 42 mm presentations with their characteristics and corrects only grammar and the machine-translated reference to crown caps. The 29 mm offer remains published as an unresolved additional presentation."
  },
  ...canCorrections,
  ...ripcapCoatings("/26mm-ripcap"),
  ...ripcapCoatings("/42mm-ripcap"),
  {
    path: "/26mm-ring-crown-cap",
    blocks: [
      "Cap Shell",
      "Sheet steel",
      "Tinplate thickness 0,17 mm or Tin free steel (TFS)thickness 0,17 mm",
      "Hardness T2",
      "Tin coating 2,8g/m2\n/2,8g/m2",
      "Ring Blank",
      "Tinplate thickness 0,17 mm",
      "Hardness T2",
      "Tin coating 5,6g/m2/5,6g/m2"
    ],
    replace: [
      "Cap shell: material",
      "Sheet steel",
      "Cap shell: thickness",
      "Tinplate 0,17 mm or tin-free steel (TFS) 0,17 mm",
      "Cap shell: hardness",
      "T2",
      "Cap shell: tin coating",
      "2,8g/m2/2,8g/m2",
      "Ring blank: thickness",
      "Tinplate 0,17 mm",
      "Ring blank: hardness",
      "T2",
      "Ring blank: tin coating",
      "5,6g/m2/5,6g/m2"
    ],
    reason: CROWN_CAP_SHELL_REASON
  },
  {
    path: "/26mm-ring-crown-cap",
    locale: "es",
    blocks: [
      "Concha de tapa",
      "Chapa de acero",
      "Espesor de hojalata 0,17 mm o espesor de acero libre de estaño (TFS) 0,17 mm",
      "anillo en blanco",
      "Espesor hojalata 0,17 mm",
      "Dureza T2",
      "Dureza T2",
      "Recubrimiento de estaño 2,8g/m2 /2,8g/m2",
      "anillo en blanco",
      "Espesor hojalata 0,17 mm",
      "Dureza T2",
      "Recubrimiento de estaño 5,6g/m2/5,6g/m2"
    ],
    replace: [
      "Cápsula: material",
      "Chapa de acero",
      "Cápsula: espesor",
      "Hojalata 0,17 mm o acero libre de estaño (TFS) 0,17 mm",
      "Cápsula: dureza",
      "T2",
      "Cápsula: recubrimiento de estaño",
      "2,8g/m2/2,8g/m2",
      "Disco de la anilla: espesor",
      "Hojalata 0,17 mm",
      "Disco de la anilla: dureza",
      "T2",
      "Disco de la anilla: recubrimiento de estaño",
      "5,6g/m2/5,6g/m2"
    ],
    reason: CROWN_CAP_SHELL_REASON
  },
  {
    path: "/26mm-ring-crown-cap",
    blocks: [
      "PVC standard or PVC free\nliner",
      "Cold and hot fill or/and pasteurisation",
      "The liner is a circular seal fixed on the inside area of the cap;"
    ],
    replace: [
      "Liner",
      "PVC standard or PVC-free",
      "Use",
      "Cold and hot fill or/and pasteurisation",
      "The liner is a circular seal fixed on the inside area of the cap."
    ],
    reason: "Liner type and its use as one label/value pair each; the line break inside the liner value removed."
  },
  {
    path: "/26mm-ring-crown-cap",
    locale: "es",
    blocks: [
      "PVC estándar o sin PVC transatlántico",
      "Llenado en frío y en caliente y/o pasteurización",
      "El liner es un sello circular fijado en el área interior de la tapa;"
    ],
    replace: [
      "Liner",
      "PVC estándar o sin PVC",
      "Uso",
      "Llenado en frío y en caliente y/o pasteurización",
      "El liner es un sello circular fijado en la parte interior de la tapa."
    ],
    reason: 'Same pairs on the Spanish page ("liner" had been machine-translated as "transatlántico").'
  },
  {
    path: "/26mm-ring-crown-cap",
    blocks: [
      "Inside lacquer (BPA-NI)",
      "Mod. vinyl resin or polyester-phenolic\nWhite coating (BPA-NI)",
      "Mod. Polyester"
    ],
    replace: [
      "Inside lacquer (BPA-NI)",
      "Mod. vinyl resin or polyester-phenolic",
      "White coating (BPA-NI)",
      "Mod. Polyester"
    ],
    reason: RIPCAP_COATINGS_REASON
  },
  {
    path: "/26mm-ring-crown-cap",
    locale: "es",
    blocks: [
      "Lacado interior (BPA-NI)",
      "Modificación. resina vinílica o poliéster-fenólico Recubrimiento blanco (BPA-NI)",
      "Modificación. Poliéster"
    ],
    replace: [
      "Laca interior (BPA-NI)",
      "Resina vinílica modificada o poliéster-fenólica",
      "Recubrimiento blanco (BPA-NI)",
      "Poliéster modificado"
    ],
    reason: RIPCAP_COATINGS_REASON
  }
];

/** Applies the block corrections of one page and language; returns the blocks and those applied. */
export function correctBlocks<T extends { tag: string; text: string }>(
  path: string,
  blocks: T[],
  locale: Locale = "en"
): { blocks: T[]; applied: BlockCorrection[] } {
  const applied: BlockCorrection[] = [];
  let result = blocks;
  for (const correction of blockCorrections) {
    if (correction.path !== path || (correction.locale ?? "en") !== locale) continue;
    const next: T[] = [];
    for (let index = 0; index < result.length; index++) {
      const run = result.slice(index, index + correction.blocks.length);
      if (
        run.length === correction.blocks.length &&
        run.every((block, at) =>
          correction.match === "prefix"
            ? block.text.trim().startsWith(correction.blocks[at])
            : block.text.trim() === correction.blocks[at]
        )
      ) {
        next.push(
          ...correction.replace.map((block) =>
            typeof block === "string" ? { ...run[0], text: block } : { ...run[0], ...block }
          )
        );
        index += correction.blocks.length - 1;
        if (!applied.includes(correction)) applied.push(correction);
      } else next.push(result[index]);
    }
    result = next;
  }
  return { blocks: result, applied };
}

/** Applies the corrections of one page and language to a text block; returns the text and those applied. */
export function correctText(
  path: string,
  text: string,
  locale: Locale = "en"
): { text: string; applied: Correction[] } {
  const applied: Correction[] = [];
  let result = text;
  for (const correction of corrections) {
    if (correction.path !== path || (correction.locale && correction.locale !== locale)) continue;
    if (!result.includes(correction.find)) continue;
    result = result.replaceAll(correction.find, correction.replace);
    applied.push(correction);
  }
  return { text: result, applied };
}
