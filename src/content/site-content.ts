import type { Division, Locale, LocalizedText } from "./types";

const t = (en: string, es: string): LocalizedText => ({ en, es });

export const company = {
  name: "GFB Solutions",
  email: "info@gfb-solutions.com",
  phonePrimary: "+34 659 38 21 46",
  phoneSecondary: "+34 868 99 22 58",
  whatsapp: "+34 659 38 21 46",
  address: "Avda. Teniente Montesinos 8, Torre Z, Planta 4, Izquierda, 30100 Murcia, Spain",
  locations: ["Spain", "Türkiye", "Dubai"]
};

export const ui = {
  en: {
    skip: "Skip to main content",
    home: "Home",
    about: "About GFB",
    contact: "Contact",
    inquire: "Start an inquiry",
    explore: "Explore solutions",
    menuOpen: "Open navigation",
    menuClose: "Close navigation",
    language: "Language",
    learnMore: "Explore this solution",
    viewDivision: "View division",
    breadcrumbHome: "Home",
    legalDraft: "Draft for legal review"
  },
  es: {
    skip: "Saltar al contenido principal",
    home: "Inicio",
    about: "Sobre GFB",
    contact: "Contacto",
    inquire: "Iniciar una consulta",
    explore: "Explorar soluciones",
    menuOpen: "Abrir navegación",
    menuClose: "Cerrar navegación",
    language: "Idioma",
    learnMore: "Explorar esta solución",
    viewDivision: "Ver división",
    breadcrumbHome: "Inicio",
    legalDraft: "Borrador para revisión legal"
  }
} as const;

export const divisions: Division[] = [
  {
    slug: "packaging-solutions",
    title: t("Packaging solutions", "Soluciones de embalaje"),
    shortTitle: t("Packaging", "Embalaje"),
    eyebrow: t("Protect · present · perform", "Proteger · presentar · rendir"),
    summary: t(
      "Packaging formats selected around product, filling line and market requirements.",
      "Formatos de embalaje seleccionados según el producto, la línea de llenado y el mercado."
    ),
    description: t(
      "GFB coordinates beverage packaging options across cans, bottles, closures and labels, helping industrial buyers evaluate format, compatibility and commercial presentation.",
      "GFB coordina opciones de embalaje para bebidas entre latas, botellas, cierres y etiquetas, ayudando a compradores industriales a evaluar formato, compatibilidad y presentación comercial."
    ),
    heroImage: "/images/packaging/hero.avif",
    accent: "#8ed116",
    categories: [
      {
        slug: "cans",
        title: t("Aluminium cans & ends", "Latas y tapas de aluminio"),
        summary: t("Standard, slim and sleek can formats with compatible easy-open ends.", "Formatos estándar, slim y sleek con tapas abre-fácil compatibles."),
        detail: t(
          "GFB's current portfolio presents aluminium beverage cans in multiple profiles and nominal volumes, together with matching can ends. Final dimensions, coatings and line compatibility require project confirmation.",
          "El portafolio actual de GFB presenta latas de aluminio para bebidas en múltiples perfiles y volúmenes nominales, junto con tapas compatibles. Las dimensiones, recubrimientos y compatibilidad de línea requieren confirmación por proyecto."
        ),
        image: "/images/packaging/cans.avif",
        features: [t("Standard, slim and sleek profiles", "Perfiles estándar, slim y sleek"), t("Easy-open end options", "Opciones de tapas abre-fácil"), t("Format selection support", "Asistencia en la selección del formato")]
      },
      {
        slug: "bottles",
        title: t("Glass bottles", "Botellas de vidrio"),
        summary: t("Bottle formats for water, soft drinks and alcoholic beverage applications.", "Formatos de botella para agua, refrescos y bebidas alcohólicas."),
        detail: t(
          "Glass packaging is presented for beverage applications where product protection, transparency and a premium on-shelf presence matter. Availability and performance specifications are confirmed against each brief.",
          "Los envases de vidrio se presentan para bebidas donde importan la protección del producto, la transparencia y una presencia premium en el lineal. La disponibilidad y las especificaciones se confirman para cada proyecto."
        ),
        image: "/images/packaging/bottles.avif"
      },
      {
        slug: "closures",
        title: t("Closures & crown caps", "Cierres y tapas corona"),
        summary: t("Crown corks, ring-pull closures and application-specific cap options.", "Tapas corona, cierres ring-pull y opciones específicas por aplicación."),
        detail: t(
          "The verified public range includes crown cork bottle caps, RipCap ring-pull formats and sport cap references. Material, liner, decoration and sealing requirements are defined during technical review.",
          "La gama pública verificada incluye tapas corona, formatos RipCap con anilla y referencias de tapas deportivas. El material, liner, decoración y sellado se definen durante la revisión técnica."
        ),
        image: "/images/packaging/closures.avif"
      },
      {
        slug: "labels",
        title: t("Beverage labels", "Etiquetas para bebidas"),
        summary: t("Shrink sleeve, wash-off and wet-glue label solutions.", "Soluciones de manga retráctil, wash-off y etiquetas de cola húmeda."),
        detail: t(
          "GFB presents label options for visual impact, bottling efficiency and removal requirements. The public range includes 360-degree shrink sleeves, wash-off labels and wet-glue paper labels.",
          "GFB presenta opciones de etiquetado orientadas al impacto visual, la eficiencia en embotellado y los requisitos de retirada. La gama pública incluye mangas retráctiles 360°, etiquetas wash-off y etiquetas de papel con cola húmeda."
        ),
        image: "/images/packaging/labels.avif"
      }
    ]
  },
  {
    slug: "raw-materials",
    title: t("Raw materials", "Materias primas"),
    shortTitle: t("Ingredients", "Ingredientes"),
    eyebrow: t("From origin to application", "Del origen a la aplicación"),
    summary: t("Fruit, vegetable and plant-based ingredient formats for industrial applications.", "Formatos de ingredientes de frutas, vegetales y origen vegetal para aplicaciones industriales."),
    description: t(
      "The current GFB range covers fruit and vegetable concentrates, plant-based concentrates and frozen IQF citrus formats for beverage, bakery, confectionery, dessert and food-service applications.",
      "La gama actual de GFB cubre concentrados de frutas y vegetales, concentrados plant-based y formatos cítricos IQF para bebidas, panadería, confitería, postres y food service."
    ),
    heroImage: "/images/raw-materials/hero.avif",
    accent: "#ffcf2f",
    categories: [
      {
        slug: "fruit-concentrates",
        title: t("Fruit & vegetable concentrates", "Concentrados de frutas y vegetales"),
        summary: t("A broad portfolio organized by origin and application.", "Un portafolio amplio organizado por origen y aplicación."),
        detail: t(
          "GFB's public catalog organizes concentrates across citrus, Mediterranean, tropical, red-fruit and vegetable families. Product specifications, origin and pack formats remain subject to commercial confirmation.",
          "El catálogo público de GFB organiza concentrados en familias cítricas, mediterráneas, tropicales, frutos rojos y vegetales. Las especificaciones, el origen y los formatos de envase quedan sujetos a confirmación comercial."
        ),
        image: "/images/raw-materials/fruit-concentrates.avif",
        groups: [
          { title: t("Citrus", "Cítricos"), items: ["Orange", "White grapefruit", "Lime", "Blood orange", "Lemon", "Pink grapefruit", "Tangerine"] },
          { title: t("Mediterranean", "Mediterráneos"), items: ["Apple", "White grape", "Persimmon", "Red grape", "Peach", "Watermelon", "Pear", "Pomegranate", "Apricot", "Melon"] },
          { title: t("Tropical", "Tropicales"), items: ["Passion fruit", "White guava", "Pineapple", "Tamarind", "Pink guava", "Banana", "Mango", "Coconut"] },
          { title: t("Red fruits", "Frutos rojos"), items: ["Cranberry", "Blueberry", "Cherry", "Raspberry", "Blackberry", "Strawberry"] },
          { title: t("Vegetables", "Vegetales"), items: ["Turnip", "Pumpkin", "Tomato", "Beet", "Pepper", "Spinach", "Celery", "Cucumber", "Broccoli", "Carrot", "Asparagus", "Ginger"] }
        ]
      },
      {
        slug: "plant-based-concentrates",
        title: t("Plant-based concentrates", "Concentrados plant-based"),
        summary: t("Verified oat and almond concentrate references.", "Referencias verificadas de concentrado de avena y almendra."),
        detail: t(
          "The current public portfolio identifies oat and almond concentrates. Composition, allergen, processing and application data must be supplied in the commercial specification for each project.",
          "El portafolio público actual identifica concentrados de avena y almendra. Los datos de composición, alérgenos, procesado y aplicación deben constar en la especificación comercial de cada proyecto."
        ),
        image: "/images/raw-materials/plant-based.avif"
      },
      {
        slug: "iqf-frozen-fruits",
        title: t("IQF frozen citrus", "Cítricos congelados IQF"),
        summary: t("Slices, cuts, zest and peel formats for food-service and industrial use.", "Rodajas, cortes, zest y piel para food service y uso industrial."),
        detail: t(
          "GFB's current public range describes IQF lemon and orange formats including slices, half slices, sticks, cuts, zest and peel. Storage, pack and technical requirements are confirmed before supply.",
          "La gama pública actual de GFB describe formatos IQF de limón y naranja que incluyen rodajas, medias rodajas, sticks, cortes, zest y piel. El almacenamiento, el envase y los requisitos técnicos se confirman antes del suministro."
        ),
        image: "/images/raw-materials/iqf-fruit.avif"
      }
    ]
  },
  {
    slug: "flavours-aromas",
    title: t("Flavours & aromas", "Sabores y aromas"),
    shortTitle: t("Flavours", "Sabores"),
    eyebrow: t("Built around the application", "Diseñados para la aplicación"),
    summary: t("Flavour development paths for sweet, beverage and savoury products.", "Rutas de desarrollo de sabor para productos dulces, bebidas y salados."),
    description: t(
      "GFB presents flavour solutions across three verified application groups, with development support intended to align sensory direction, format and industrial requirements.",
      "GFB presenta soluciones de sabor en tres grupos de aplicación verificados, con apoyo al desarrollo para alinear la dirección sensorial, el formato y los requisitos industriales."
    ),
    heroImage: "/images/flavours/hero.avif",
    accent: "#42c7ff",
    categories: [
      {
        slug: "sweet-applications",
        title: t("Sweet applications", "Aplicaciones dulces"),
        summary: t("Confectionery, bakery, desserts, ice cream and dairy.", "Confitería, panadería, postres, helados y lácteos."),
        detail: t(
          "The verified sweet application scope includes confectionery, baked goods, desserts, ice cream and dairy. Specific flavour profiles and formats are developed against the customer's product brief.",
          "El alcance verificado para aplicaciones dulces incluye confitería, productos horneados, postres, helados y lácteos. Los perfiles y formatos se desarrollan según el brief de producto del cliente."
        ),
        image: "/images/flavours/sweet.avif"
      },
      {
        slug: "beverage-applications",
        title: t("Beverage applications", "Aplicaciones para bebidas"),
        summary: t("Soft drinks, energy drinks, juices, waters, powders and syrups.", "Refrescos, bebidas energéticas, zumos, aguas, polvos y jarabes."),
        detail: t(
          "The current GFB range identifies flavour development for soft drinks, energy drinks, juices, waters, powder beverages and syrups. Suitability is assessed for the intended formulation and process.",
          "La gama actual de GFB identifica desarrollo de sabores para refrescos, energéticas, zumos, aguas, bebidas en polvo y jarabes. La idoneidad se evalúa para la formulación y el proceso previstos."
        ),
        image: "/images/flavours/beverage.avif"
      },
      {
        slug: "savoury-applications",
        title: t("Savoury applications", "Aplicaciones saladas"),
        summary: t("Soups, noodles, stocks, snacks, meat, fish and ready meals.", "Sopas, noodles, caldos, snacks, carne, pescado y platos preparados."),
        detail: t(
          "The verified savoury scope covers soups, noodles, stock cubes, snacks, meat and fish applications, and ready meals. Development begins with the target profile, base matrix and processing conditions.",
          "El alcance verificado para salados cubre sopas, noodles, cubitos de caldo, snacks, aplicaciones de carne y pescado y platos preparados. El desarrollo parte del perfil objetivo, la matriz base y las condiciones de proceso."
        ),
        image: "/images/flavours/hero.avif"
      }
    ]
  },
  {
    slug: "industrial-consulting",
    title: t("Industrial consulting", "Consultoría industrial"),
    shortTitle: t("Consulting", "Consultoría"),
    eyebrow: t("Engineering attention where it matters", "Atención de ingeniería donde importa"),
    summary: t("Process and machinery consulting across documented industrial sectors.", "Consultoría de procesos y maquinaria en sectores industriales documentados."),
    description: t(
      "GFB describes tailored consulting for machinery and production processes across food, general industrial, environmental and pharmaceutical sectors. Scope and regulatory responsibility are defined per engagement.",
      "GFB describe consultoría a medida para maquinaria y procesos productivos en los sectores alimentario, industrial, medioambiental y farmacéutico. El alcance y la responsabilidad regulatoria se definen por proyecto."
    ),
    heroImage: "/images/consulting/hero.avif",
    accent: "#6fe08d",
    categories: [
      { slug: "food-sector", title: t("Food sector", "Sector alimentario"), summary: t("Production process review with food safety and efficiency in view.", "Revisión de procesos productivos con foco en seguridad alimentaria y eficiencia."), detail: t("Engagements may address machinery selection, production flow and process improvement. Exact deliverables are agreed in the consulting scope.", "Los proyectos pueden abordar selección de maquinaria, flujo productivo y mejora de procesos. Los entregables exactos se acuerdan en el alcance de consultoría."), image: "/images/consulting/process.avif" },
      { slug: "industrial-sector", title: t("Industrial sector", "Sector industrial"), summary: t("Workflow, downtime and production-efficiency analysis.", "Análisis de flujo, paradas y eficiencia productiva."), detail: t("GFB's public materials describe consulting aimed at manufacturing efficiency, downtime reduction and workflow optimization.", "Los materiales públicos de GFB describen consultoría orientada a la eficiencia de fabricación, reducción de paradas y optimización del flujo."), image: "/images/consulting/process.avif" },
      { slug: "environmental-sector", title: t("Environmental sector", "Sector medioambiental"), summary: t("Resource-efficiency and environmental-impact considerations.", "Consideraciones de eficiencia de recursos e impacto ambiental."), detail: t("Environmental consulting claims remain high level in the source material and require a defined project scope before publication of specific capabilities.", "Las afirmaciones de consultoría ambiental son generales en la fuente y requieren un alcance definido antes de publicar capacidades específicas."), image: "/images/consulting/hero.avif" },
      { slug: "pharmaceutical-sector", title: t("Pharmaceutical sector", "Sector farmacéutico"), summary: t("Process consulting where quality and compliance are central.", "Consultoría de procesos donde la calidad y el cumplimiento son centrales."), detail: t("The current site references pharmaceutical manufacturing consulting. Regulated deliverables, credentials and compliance responsibility require business verification.", "El sitio actual menciona consultoría para fabricación farmacéutica. Los entregables regulados, credenciales y responsabilidad de cumplimiento requieren verificación empresarial."), image: "/images/consulting/process.avif" }
    ]
  }
];

export const navigation = (locale: Locale) => [
  { href: `/${locale}/about`, label: ui[locale].about },
  ...divisions.map((division) => ({ href: `/${locale}/${division.slug}`, label: division.shortTitle[locale] })),
  { href: `/${locale}/contact`, label: ui[locale].contact }
];

export function getDivision(slug: string) {
  return divisions.find((division) => division.slug === slug);
}

export function getCategory(divisionSlug: string, categorySlug: string) {
  return getDivision(divisionSlug)?.categories.find((category) => category.slug === categorySlug);
}
