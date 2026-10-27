import type { Locale, LocalizedText } from "../i18n/config.ts";
import type { SlugTree } from "../i18n/routes.ts";
import type { Category, Division } from "./types.ts";

const t = (en: string, es: string): LocalizedText => ({ en, es });

export const divisions: Division[] = [
  {
    id: "packaging-solutions",
    slug: t("packaging-solutions", "soluciones-de-embalaje"),
    title: t("Packaging solutions", "Soluciones de embalaje"),
    shortTitle: t("Packaging", "Embalaje"),
    eyebrow: t("Protect · present · perform", "Protección · presentación · rendimiento"),
    summary: t(
      "Packaging formats selected around product, filling line and market requirements.",
      "Formatos de embalaje seleccionados según el producto, la línea de llenado y el mercado."
    ),
    description: t(
      "GFB coordinates beverage packaging options across cans, bottles, closures and labels, helping industrial buyers evaluate format, compatibility and commercial presentation.",
      "GFB coordina opciones de embalaje para bebidas entre latas, botellas, cierres y etiquetas, ayudando a compradores industriales a evaluar formato, compatibilidad y presentación comercial."
    ),
    heroImage: "/images/packaging/hero.avif",
    hero: {
      text: t(
        "Cans, bottles, closures and labels for beverage applications, with solutions adapted to your product and market requirements.",
        "Latas, botellas, cierres y etiquetas para bebidas, con soluciones adaptadas a las necesidades de su producto y mercado."
      ),
      cta: t("Explore packaging", "Explorar envases"),
      image: "/images/packaging/service-hero.webp",
      focus: "50% 62%",
      overlay: "standard"
    },
    overview: {
      title: t("Options structured around the", "Opciones estructuradas en torno al"),
      highlight: t("requirement.", "requisito."),
      frameworkLabel: t("Decision framework", "Marco de decisión"),
      criteria: [
        {
          id: "format",
          title: t("Format", "Formato"),
          text: t("Evaluate the most suitable packaging options.", "Evaluar las opciones de embalaje más adecuadas."),
          icon: "bottle"
        },
        {
          id: "compatibility",
          title: t("Compatibility", "Compatibilidad"),
          text: t("Assess technical and operational fit.", "Valorar el encaje técnico y operativo."),
          icon: "gear"
        },
        {
          id: "presentation",
          title: t("Presentation", "Presentación"),
          text: t("Align with commercial and market needs.", "Alinear con las necesidades comerciales y del mercado."),
          icon: "cube"
        }
      ]
    },
    showcase: {
      before: t("A portfolio built around your", "Un portafolio pensado para sus necesidades de"),
      highlight: t("packaging", "embalaje"),
      after: t(" needs.", "."),
      countLabel: t("Four packaging categories", "Cuatro categorías de embalaje"),
      text: t(
        "From primary containers to closures and labels, a range of options for beverage packaging requirements.",
        "Desde envases primarios hasta cierres y etiquetas, una gama de opciones para los requisitos de embalaje de bebidas."
      )
    },
    accent: "#8ed116",
    categories: [
      {
        id: "cans",
        slug: t("cans", "latas"),
        title: t("Aluminium cans & ends", "Latas y tapas de aluminio"),
        summary: t(
          "Standard, slim and sleek can formats with compatible easy-open ends.",
          "Formatos estándar, slim y sleek con tapas abre-fácil compatibles."
        ),
        detail: t(
          "Aluminium beverage cans in multiple profiles and nominal volumes, supplied together with matching can ends. Dimensions, internal coatings and filling-line compatibility are confirmed for each project.",
          "Latas de aluminio para bebidas en múltiples perfiles y volúmenes nominales, suministradas junto con sus tapas compatibles. Las dimensiones, los recubrimientos internos y la compatibilidad con la línea de llenado se confirman en cada proyecto."
        ),
        image: "/images/packaging/cans.avif",
        showcase: { image: "/images/packaging/can-detail.webp", focus: "50% 40%" },
        features: [
          t("Standard, slim and sleek profiles", "Perfiles estándar, slim y sleek"),
          t("Easy-open end options", "Opciones de tapas abre-fácil"),
          t("Format selection support", "Asistencia en la selección del formato")
        ]
      },
      {
        id: "bottles",
        slug: t("bottles", "botellas"),
        title: t("Glass bottles", "Botellas de vidrio"),
        summary: t(
          "Bottle formats for water, soft drinks and alcoholic beverage applications.",
          "Formatos de botella para agua, refrescos y bebidas alcohólicas."
        ),
        detail: t(
          "Glass packaging for beverages where product protection, transparency and a premium on-shelf presence matter. Availability and performance specifications are matched to each brief.",
          "Envases de vidrio para bebidas donde importan la protección del producto, la transparencia y una presencia premium en el lineal. La disponibilidad y las especificaciones se ajustan a cada proyecto."
        ),
        image: "/images/packaging/bottles.avif"
      },
      {
        id: "closures",
        slug: t("closures", "cierres"),
        title: t("Closures & crown caps", "Cierres y tapas corona"),
        summary: t(
          "Crown corks, ring-pull closures and application-specific cap options.",
          "Tapas corona, cierres ring-pull y opciones específicas por aplicación."
        ),
        detail: t(
          "The range includes crown cork bottle caps, RipCap ring-pull formats and sport caps. Material, liner, decoration and sealing requirements are defined together during technical review.",
          "La gama incluye tapas corona, formatos RipCap con anilla y tapas deportivas. El material, el liner, la decoración y el sellado se definen conjuntamente durante la revisión técnica."
        ),
        image: "/images/packaging/closures.avif"
      },
      {
        id: "labels",
        slug: t("labels", "etiquetas"),
        title: t("Beverage labels", "Etiquetas para bebidas"),
        summary: t(
          "Shrink sleeve, wash-off and wet-glue label solutions.",
          "Soluciones de manga retráctil, wash-off y etiquetas de cola húmeda."
        ),
        detail: t(
          "Label options built for visual impact, bottling efficiency and removal requirements, including 360-degree shrink sleeves, wash-off labels and wet-glue paper labels.",
          "Opciones de etiquetado pensadas para el impacto visual, la eficiencia en embotellado y los requisitos de retirada, incluidas mangas retráctiles 360°, etiquetas wash-off y etiquetas de papel con cola húmeda."
        ),
        image: "/images/packaging/labels.avif",
        showcase: { image: "/images/packaging/labels-wash-off.webp", focus: "50% 50%" }
      }
    ]
  },
  {
    id: "raw-materials",
    slug: t("raw-materials", "materias-primas"),
    title: t("Raw materials", "Materias primas"),
    shortTitle: t("Raw materials", "Materias primas"),
    eyebrow: t("From origin to application", "Del origen a la aplicación"),
    summary: t(
      "Fruit, vegetable and plant-based ingredient formats for industrial applications.",
      "Formatos de ingredientes de frutas, vegetales y origen vegetal para aplicaciones industriales."
    ),
    description: t(
      "The GFB range covers fruit and vegetable concentrates, plant-based concentrates and frozen IQF citrus formats for beverage, bakery, confectionery, dessert and food-service applications.",
      "La gama de GFB cubre concentrados de frutas y vegetales, concentrados de origen vegetal y formatos cítricos IQF para bebidas, panadería, confitería, postres y food service."
    ),
    heroImage: "/images/raw-materials/hero.avif",
    hero: {
      text: t(
        "Fruit and vegetable concentrates, oat and almond concentrates, and IQF citrus formats for food and beverage applications.",
        "Concentrados de frutas y vegetales, concentrados de avena y almendra, y formatos de cítricos IQF para aplicaciones alimentarias y bebidas."
      ),
      cta: t("Explore raw materials", "Explorar materias primas"),
      image: "/images/raw-materials/service-hero.webp",
      focus: "62% 45%",
      overlay: "deep"
    },
    overview: {
      title: t("Ingredients matched to the", "Ingredientes adaptados a la"),
      highlight: t("application.", "aplicación."),
      frameworkLabel: t("Selection criteria", "Criterios de selección"),
      criteria: [
        {
          id: "family",
          title: t("Product family", "Familia de producto"),
          text: t(
            "Fruit and vegetable concentrates, plant concentrates or IQF citrus formats.",
            "Concentrados de frutas y vegetales, concentrados de origen vegetal o formatos cítricos IQF."
          ),
          icon: "leaf"
        },
        {
          id: "application",
          title: t("Application", "Aplicación"),
          text: t("Beverages, confectionery, bakery or desserts.", "Bebidas, confitería, panadería o postres."),
          icon: "target"
        },
        {
          id: "formulation",
          title: t("Formulation", "Formulación"),
          text: t(
            "Compound formulation adapted to each customer's requirements.",
            "Formulación de compuestos adaptada a los requisitos de cada cliente."
          ),
          icon: "nodes"
        }
      ]
    },
    showcase: {
      before: t("Concentrates for", "Concentrados y formatos para"),
      highlight: t("food and beverage", "alimentación y bebidas"),
      after: t(" applications.", "."),
      countLabel: t("Three raw material families", "Tres familias de materias primas"),
      text: t(
        "Fruit and vegetable concentrates, with particular expertise in grape, plant concentrates and IQF citrus formats.",
        "Concentrados de frutas y vegetales, con especial experiencia en uva, concentrados de origen vegetal y formatos cítricos IQF."
      )
    },
    accent: "#ffcf2f",
    categories: [
      {
        id: "fruit-concentrates",
        slug: t("fruit-concentrates", "concentrados-de-frutas"),
        title: t("Fruit & vegetable concentrates", "Concentrados de frutas y vegetales"),
        summary: t(
          "A broad portfolio organized by origin and application.",
          "Un portafolio amplio organizado por origen y aplicación."
        ),
        detail: t(
          "Concentrates organized across citrus, Mediterranean, tropical, red-fruit and vegetable families. Specifications, origin and pack formats are confirmed with each commercial offer.",
          "Concentrados organizados en familias cítricas, mediterráneas, tropicales, frutos rojos y vegetales. Las especificaciones, el origen y los formatos de envase se confirman en cada oferta comercial."
        ),
        image: "/images/raw-materials/fruit-concentrates.avif",
        showcase: { image: "/images/raw-materials/fruit-vegetables.webp", focus: "50% 50%" },
        groups: [
          {
            title: t("Citrus", "Cítricos"),
            items: [
              t("Orange", "Naranja"),
              t("White grapefruit", "Pomelo blanco"),
              t("Lime", "Lima"),
              t("Blood orange", "Naranja sanguina"),
              t("Lemon", "Limón"),
              t("Pink grapefruit", "Pomelo rosa"),
              t("Tangerine", "Mandarina")
            ]
          },
          {
            title: t("Mediterranean", "Mediterráneos"),
            items: [
              t("Apple", "Manzana"),
              t("White grape", "Uva blanca"),
              t("Persimmon", "Caqui"),
              t("Red grape", "Uva tinta"),
              t("Peach", "Melocotón"),
              t("Watermelon", "Sandía"),
              t("Pear", "Pera"),
              t("Pomegranate", "Granada"),
              t("Apricot", "Albaricoque"),
              t("Melon", "Melón")
            ]
          },
          {
            title: t("Tropical", "Tropicales"),
            items: [
              t("Passion fruit", "Maracuyá"),
              t("White guava", "Guayaba blanca"),
              t("Pineapple", "Piña"),
              t("Tamarind", "Tamarindo"),
              t("Pink guava", "Guayaba rosa"),
              t("Banana", "Plátano"),
              t("Mango", "Mango"),
              t("Coconut", "Coco")
            ]
          },
          {
            title: t("Red fruits", "Frutos rojos"),
            items: [
              t("Cranberry", "Arándano rojo"),
              t("Blueberry", "Arándano"),
              t("Cherry", "Cereza"),
              t("Raspberry", "Frambuesa"),
              t("Blackberry", "Mora"),
              t("Strawberry", "Fresa")
            ]
          },
          {
            title: t("Vegetables", "Vegetales"),
            items: [
              t("Turnip", "Nabo"),
              t("Pumpkin", "Calabaza"),
              t("Tomato", "Tomate"),
              t("Beet", "Remolacha"),
              t("Pepper", "Pimiento"),
              t("Spinach", "Espinaca"),
              t("Celery", "Apio"),
              t("Cucumber", "Pepino"),
              t("Broccoli", "Brócoli"),
              t("Carrot", "Zanahoria"),
              t("Asparagus", "Espárrago"),
              t("Ginger", "Jengibre")
            ]
          }
        ]
      },
      {
        id: "plant-based-concentrates",
        slug: t("plant-based-concentrates", "concentrados-vegetales"),
        title: t("Plant-based concentrates", "Concentrados de origen vegetal"),
        summary: t(
          "Oat and almond concentrates for plant-based drinks.",
          "Concentrados de avena y almendra para bebidas vegetales."
        ),
        detail: t(
          "Oat and almond concentrates for plant-based beverage development. Composition, allergen, processing and application data are provided in the commercial specification for each project.",
          "Concentrados de avena y almendra para el desarrollo de bebidas vegetales. Los datos de composición, alérgenos, procesado y aplicación se facilitan en la especificación comercial de cada proyecto."
        ),
        image: "/images/raw-materials/plant-based.avif",
        showcase: { image: "/images/raw-materials/oat-almond.webp", focus: "50% 50%" }
      },
      {
        id: "iqf-frozen-fruits",
        slug: t("iqf-frozen-fruits", "citricos-congelados-iqf"),
        title: t("IQF frozen citrus", "Cítricos congelados IQF"),
        summary: t(
          "Slices, cuts, zest and peel formats for food-service and industrial use.",
          "Rodajas, cortes, ralladura y piel para food service y uso industrial."
        ),
        detail: t(
          "IQF lemon and orange formats including slices, half slices, sticks, cuts, zest and peel. Storage, packaging and technical requirements are agreed before supply.",
          "Formatos IQF de limón y naranja que incluyen rodajas, medias rodajas, bastones, cortes, ralladura y piel. El almacenamiento, el envase y los requisitos técnicos se acuerdan antes del suministro."
        ),
        image: "/images/raw-materials/iqf-fruit.avif",
        showcase: { image: "/images/raw-materials/citrus.webp", focus: "60% 50%" }
      }
    ]
  },
  {
    id: "flavours-aromas",
    slug: t("flavours-aromas", "sabores-y-aromas"),
    title: t("Flavours & aromas", "Sabores y aromas"),
    shortTitle: t("Flavours", "Sabores"),
    eyebrow: t("Sweet · beverage · savoury", "Dulces · bebidas · salados"),
    summary: t(
      "Flavour development paths for sweet, beverage and savoury products.",
      "Rutas de desarrollo de sabor para productos dulces, bebidas y salados."
    ),
    description: t(
      "Flavour solutions across three application groups, with development support that aligns sensory direction, format and industrial requirements.",
      "Soluciones de sabor en tres grupos de aplicación, con apoyo al desarrollo para alinear la dirección sensorial, el formato y los requisitos industriales."
    ),
    heroImage: "/images/flavours/hero.avif",
    hero: {
      text: t(
        "Flavour solutions for sweet products, beverages and savoury applications.",
        "Soluciones de sabor para productos dulces, bebidas y aplicaciones saladas."
      ),
      cta: t("Explore applications", "Explorar aplicaciones"),
      image: "/images/flavours/service-hero.webp",
      focus: "60% 55%",
      overlay: "deep"
    },
    overview: {
      title: t("Flavours organized by", "Sabores organizados por"),
      highlight: t("application.", "aplicación."),
      frameworkLabel: t("Application groups", "Grupos de aplicación"),
      criteria: [
        {
          id: "sweet",
          title: t("Sweet", "Dulces"),
          text: t(
            "Confectionery, bakery, desserts, ice cream and dairy.",
            "Confitería, panadería, postres, helados y lácteos."
          ),
          icon: "sweet"
        },
        {
          id: "beverage",
          title: t("Beverages", "Bebidas"),
          text: t(
            "Soft drinks, energy drinks, juices, waters, powders and syrups.",
            "Refrescos, bebidas energéticas, zumos, aguas, polvos y jarabes."
          ),
          icon: "drop"
        },
        {
          id: "savoury",
          title: t("Savoury", "Salados"),
          text: t(
            "Soups, noodles, stock cubes, snacks, meat, fish and ready meals.",
            "Sopas, fideos, pastillas de caldo, snacks, carnes, pescados y platos preparados."
          ),
          icon: "bowl"
        }
      ]
    },
    showcase: {
      before: t("Flavours for sweet, beverage and", "Sabores para productos dulces, bebidas y"),
      highlight: t("savoury", "salados"),
      after: t(" products.", "."),
      countLabel: t("Three application groups", "Tres grupos de aplicación"),
      text: t(
        "Flavour solutions organized by application, from confectionery and soft drinks to soups and ready meals.",
        "Soluciones de sabor organizadas por aplicación, desde la confitería y los refrescos hasta las sopas y los platos preparados."
      )
    },
    accent: "#42c7ff",
    categories: [
      {
        id: "sweet-applications",
        slug: t("sweet-applications", "aplicaciones-dulces"),
        title: t("Sweet applications", "Aplicaciones dulces"),
        summary: t(
          "Confectionery, bakery, desserts, ice cream and dairy.",
          "Confitería, panadería, postres, helados y lácteos."
        ),
        detail: t(
          "Flavours for confectionery, baked goods, desserts, ice cream and dairy. Profiles and formats are developed against the customer's product brief.",
          "Sabores para confitería, productos horneados, postres, helados y lácteos. Los perfiles y formatos se desarrollan según el brief de producto del cliente."
        ),
        image: "/images/flavours/sweet.avif",
        showcase: { image: "/images/flavours/sweet-ice-cream.webp", focus: "50% 42%" }
      },
      {
        id: "beverage-applications",
        slug: t("beverage-applications", "aplicaciones-para-bebidas"),
        title: t("Beverage applications", "Aplicaciones para bebidas"),
        summary: t(
          "Soft drinks, energy drinks, juices, waters, powders and syrups.",
          "Refrescos, bebidas energéticas, zumos, aguas, polvos y jarabes."
        ),
        detail: t(
          "Flavour development for soft drinks, energy drinks, juices, flavoured waters, powder beverages and syrups. Suitability is assessed for the intended formulation and process.",
          "Desarrollo de sabores para refrescos, bebidas energéticas, zumos, aguas saborizadas, bebidas en polvo y jarabes. La idoneidad se evalúa para la formulación y el proceso previstos."
        ),
        image: "/images/flavours/beverage.avif",
        showcase: { image: "/images/flavours/beverage-citrus.webp", focus: "65% 50%" }
      },
      {
        id: "savoury-applications",
        slug: t("savoury-applications", "aplicaciones-saladas"),
        title: t("Savoury applications", "Aplicaciones saladas"),
        summary: t(
          "Soups, noodles, stocks, snacks, meat, fish and ready meals.",
          "Sopas, noodles, caldos, snacks, carne, pescado y platos preparados."
        ),
        detail: t(
          "Flavours for soups, noodles, stock cubes, snacks, meat and fish applications, and ready meals. Development starts from the target profile, base matrix and processing conditions.",
          "Sabores para sopas, noodles, cubitos de caldo, snacks, aplicaciones de carne y pescado y platos preparados. El desarrollo parte del perfil objetivo, la matriz base y las condiciones de proceso."
        ),
        image: "/images/flavours/hero.avif",
        showcase: { image: "/images/flavours/savoury-board.webp", focus: "50% 50%" }
      }
    ]
  },
  {
    id: "industrial-consulting",
    slug: t("industrial-consulting", "consultoria-industrial"),
    title: t("Industrial consulting", "Consultoría industrial"),
    shortTitle: t("Consulting", "Consultoría"),
    eyebrow: t("Machinery · processes · efficiency", "Maquinaria · procesos · eficiencia"),
    summary: t(
      "Process and machinery consulting for food and industrial production.",
      "Consultoría de procesos y maquinaria para la producción alimentaria e industrial."
    ),
    description: t(
      "Tailored consulting for machinery and production processes across food, general industrial, environmental and pharmaceutical sectors. Scope and responsibilities are defined for each engagement.",
      "Consultoría a medida para maquinaria y procesos productivos en los sectores alimentario, industrial, medioambiental y farmacéutico. El alcance y las responsabilidades se definen en cada proyecto."
    ),
    heroImage: "/images/consulting/hero.avif",
    hero: {
      text: t(
        "Tailored consulting for machinery and production processes across food, industrial, environmental and pharmaceutical sectors.",
        "Consultoría a medida sobre maquinaria y procesos de producción para los sectores alimentario, industrial, medioambiental y farmacéutico."
      ),
      cta: t("Explore sectors", "Explorar sectores"),
      image: "/images/consulting/production-line.webp",
      focus: "55% 55%",
      overlay: "deep"
    },
    overview: {
      title: t("Consulting focused on the", "Consultoría centrada en el"),
      highlight: t("process.", "proceso."),
      frameworkLabel: t("Consulting focus", "Enfoque de la consultoría"),
      criteria: [
        {
          id: "machinery",
          title: t("Machinery", "Maquinaria"),
          text: t("Consulting on the machinery used in production.", "Consultoría sobre la maquinaria de producción."),
          icon: "gear"
        },
        {
          id: "processes",
          title: t("Production processes", "Procesos productivos"),
          text: t(
            "Review and optimization of production processes.",
            "Revisión y optimización de los procesos de producción."
          ),
          icon: "nodes"
        },
        {
          id: "sectors",
          title: t("Sector requirements", "Requisitos del sector"),
          text: t(
            "Food, industrial, environmental and pharmaceutical contexts, each with its own requirements.",
            "Contextos alimentarios, industriales, medioambientales y farmacéuticos, cada uno con sus propios requisitos."
          ),
          icon: "document"
        }
      ]
    },
    showcase: {
      before: t("Consulting across", "Consultoría en"),
      highlight: t("four sectors", "cuatro sectores"),
      after: t(".", "."),
      countLabel: t("Four sectors", "Cuatro sectores"),
      text: t(
        "Machinery and production process consulting for food, industrial, environmental and pharmaceutical operations.",
        "Consultoría de maquinaria y procesos de producción para operaciones alimentarias, industriales, medioambientales y farmacéuticas."
      )
    },
    accent: "#6fe08d",
    categories: [
      {
        id: "food-sector",
        slug: t("food-sector", "sector-alimentario"),
        title: t("Food sector", "Sector alimentario"),
        summary: t(
          "Production process review with food safety and efficiency in view.",
          "Revisión de procesos productivos con foco en seguridad alimentaria y eficiencia."
        ),
        detail: t(
          "Engagements can address machinery selection, production flow and process improvement. Deliverables are agreed in the consulting scope.",
          "Los proyectos pueden abordar la selección de maquinaria, el flujo productivo y la mejora de procesos. Los entregables se acuerdan en el alcance de la consultoría."
        ),
        image: "/images/consulting/process.avif",
        showcase: { image: "/images/consulting/production-line.webp", focus: "55% 55%" }
      },
      {
        id: "industrial-sector",
        slug: t("industrial-sector", "sector-industrial"),
        title: t("Industrial sector", "Sector industrial"),
        summary: t(
          "Workflow, downtime and production-efficiency analysis.",
          "Análisis de flujo, paradas y eficiencia productiva."
        ),
        detail: t(
          "Consulting aimed at manufacturing efficiency, downtime reduction and workflow optimization.",
          "Consultoría orientada a la eficiencia de fabricación, la reducción de paradas y la optimización del flujo de trabajo."
        ),
        image: "/images/consulting/process.avif",
        showcase: { placeholder: "gear" }
      },
      {
        id: "environmental-sector",
        slug: t("environmental-sector", "sector-medioambiental"),
        title: t("Environmental sector", "Sector medioambiental"),
        summary: t(
          "Resource-efficiency and environmental-impact considerations.",
          "Consideraciones de eficiencia de recursos e impacto ambiental."
        ),
        detail: t(
          "Support for production decisions where resource efficiency and environmental impact matter. Each engagement starts with a defined project scope.",
          "Apoyo en decisiones productivas donde importan la eficiencia de recursos y el impacto ambiental. Cada proyecto parte de un alcance definido."
        ),
        image: "/images/consulting/hero.avif",
        showcase: { placeholder: "leaf" }
      },
      {
        id: "pharmaceutical-sector",
        slug: t("pharmaceutical-sector", "sector-farmaceutico"),
        title: t("Pharmaceutical sector", "Sector farmacéutico"),
        summary: t(
          "Process consulting where quality and compliance are central.",
          "Consultoría de procesos donde la calidad y el cumplimiento son centrales."
        ),
        detail: t(
          "Process consulting for pharmaceutical manufacturing environments. Deliverables and compliance responsibilities are agreed in writing for each engagement.",
          "Consultoría de procesos para entornos de fabricación farmacéutica. Los entregables y las responsabilidades de cumplimiento se acuerdan por escrito en cada proyecto."
        ),
        image: "/images/consulting/process.avif",
        showcase: { placeholder: "capsule" }
      }
    ]
  }
];

export function getDivisionBySlug(locale: Locale, slug: string): Division | undefined {
  return divisions.find((division) => division.slug[locale] === slug);
}

export function getDivisionById(id: string): Division | undefined {
  return divisions.find((division) => division.id === id);
}

export function getCategoryBySlug(division: Division, locale: Locale, slug: string): Category | undefined {
  return division.categories.find((category) => category.slug[locale] === slug);
}

/** Slug-only projection, small enough to hand to client components. */
export const slugTree: SlugTree = divisions.map((division) => ({
  slug: division.slug,
  categories: division.categories.map((category) => ({ slug: category.slug }))
}));
