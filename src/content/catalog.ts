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
      focus: "50% 12%",
      mediaOffset: "2.5rem",
      overlay: "standard"
    },
    overview: {
      title: t("Packaging for your", "Embalaje para su"),
      highlight: t("product and market.", "producto y mercado."),
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
    ctaTitle: t("Have a packaging requirement in mind?", "¿Tiene en mente una necesidad de embalaje?"),
    detailSecondary: t("Explore the scope", "Ver el alcance"),
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
          "GFB supplies aluminium cans and can ends for beverage packaging. Explore the available profiles and end options for the product you need to package.",
          "GFB suministra latas de aluminio y tapas para el envasado de bebidas. Explore los perfiles y las opciones de tapa disponibles para el producto que necesita envasar."
        ),
        scope: {
          title: t("Formats and options.", "Formatos y opciones."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the beverage type and the packaging format you are considering.",
              "Indique el tipo de bebida y el formato de envase que está considerando."
            )
          }
        },
        image: "/images/packaging/cans.avif",
        showcase: {
          image: "/images/products/hero/cans-pair.webp",
          focus: "50% 40%",
          card: { image: "/images/products/hero/cans-pair.webp", focus: "45% 55%" }
        },
        heroSecondary: t("Explore formats", "Ver formatos"),
        features: [
          t("Standard, slim and sleek profiles", "Perfiles estándar, slim y sleek"),
          t("Easy-open can ends", "Tapas abre-fácil"),
          t("Beverage packaging options", "Opciones de envase para bebidas")
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
          "Glass bottles for water, soft drinks and alcoholic beverages. Transparent glass makes the contents visible and gives the product a clear visual presence.",
          "Botellas de vidrio para agua, refrescos y bebidas alcohólicas. El vidrio transparente deja ver el contenido y da al producto una presencia visual clara."
        ),
        scope: {
          title: t("Glass for your application.", "Vidrio para su aplicación."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the beverage type and the bottle format you are considering.",
              "Indique el tipo de bebida y el formato de botella que está considerando."
            )
          }
        },
        image: "/images/packaging/bottles.avif",
        showcase: {
          image: "/images/products/hero/soft-drinks.webp",
          focus: "50% 45%",
          card: { image: "/images/products/hero/soft-drinks.webp", focus: "50% 45%" }
        }
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
          "Crown corks, RipCaps and ring crown caps for glass beverage bottles, in steel or aluminium, with standard colours or customer-designed printing. The closure is chosen together with the bottle and the beverage.",
          "Tapas corona, RipCaps y tapas corona con anilla para botellas de vidrio, en acero o aluminio, con colores estándar o impresión con diseño del cliente. El cierre se elige junto con la botella y la bebida."
        ),
        scope: {
          title: t("Closures for your bottle.", "Cierres para su botella."),
          context: {
            title: t("Tell us about your packaging.", "Cuéntenos su envase."),
            text: t(
              "Share the bottle, the beverage and the closure you are considering.",
              "Indique la botella, la bebida y el cierre que está considerando."
            )
          }
        },
        image: "/images/packaging/closures.avif",
        showcase: { placeholder: "cube" }
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
          "Shrink sleeve, wash-off and wet-glue labels for beverage packaging, chosen for their print quality and for how they perform on the labelling line.",
          "Etiquetas sleeve retráctiles, wash-off y de cola húmeda para envases de bebidas, elegidas por su calidad de impresión y su comportamiento en la línea de etiquetado."
        ),
        scope: {
          title: t("Labels for your packaging.", "Etiquetas para su envase."),
          context: {
            title: t("Tell us about your packaging.", "Cuéntenos su envase."),
            text: t(
              "Share the container, the label type and the labelling process you use.",
              "Indique el envase, el tipo de etiqueta y el proceso de etiquetado que utiliza."
            )
          }
        },
        image: "/images/packaging/labels.avif",
        showcase: { placeholder: "document" }
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
      before: t("Raw materials for", "Materias primas para"),
      highlight: t("food and beverage", "alimentación y bebidas"),
      after: t(" applications.", "."),
      countLabel: t("Three raw material families", "Tres familias de materias primas"),
      text: t(
        "Explore fruit and vegetable concentrates, plant-based concentrates and IQF citrus formats, with particular expertise in grape concentrates.",
        "Explore concentrados de frutas y vegetales, concentrados de origen vegetal y formatos cítricos IQF, con especial experiencia en concentrados de uva."
      )
    },
    ctaTitle: t("Looking for a raw material for your application?", "¿Busca una materia prima para su aplicación?"),
    detailSecondary: t("Explore the scope", "Ver el alcance"),
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
          "Fruit and vegetable concentrates made by removing water from freshly squeezed juice, organized in citrus, Mediterranean, tropical, red fruit and vegetable families, with particular expertise in grape concentrates.",
          "Concentrados de frutas y vegetales obtenidos al retirar el agua del zumo recién exprimido, organizados en familias cítricas, mediterráneas, tropicales, de frutos rojos y vegetales, con especial experiencia en concentrados de uva."
        ),
        scope: {
          title: t("Concentrate families.", "Familias de concentrados."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the product you are developing and the fruit or vegetable you are looking for.",
              "Indique el producto que está desarrollando y la fruta o el vegetal que busca."
            )
          }
        },
        image: "/images/raw-materials/fruit-concentrates.avif",
        // Packaging options from the official category page (/fruits-concentrates), category level.
        scopeGroups: [
          {
            title: t("Packaging options", "Opciones de envase"),
            items: [
              t(
                "Frozen, aseptic or non-aseptic: drums of 160 to 270 kg",
                "Congelado, aséptico o no aséptico: bidones de 160 a 270 kg"
              ),
              t(
                "Aseptic: bags in drums of 180 to 270 kg, bag-in-box of 5 to 25 kg, cardboard bins up to 1,000 kg",
                "Aséptico: bolsas en bidones de 180 a 270 kg, bag-in-box de 5 a 25 kg, contenedores de cartón de hasta 1.000 kg"
              ),
              t("Bulk: tank trucks", "Granel: camiones cisterna")
            ],
            note: t(
              "Available packaging depends on the concentrate and its format.",
              "El envase disponible depende del concentrado y de su formato."
            )
          }
        ],
        showcase: { image: "/images/raw-materials/grapes.webp", focus: "45% 55%" },
        explorer: {
          eyebrow: t("Concentrate portfolio", "Portafolio de concentrados"),
          title: t("Find the concentrate for your application.", "Encuentre el concentrado para su aplicación."),
          text: t(
            "Explore five families of fruit and vegetable concentrates, with particular expertise in grape.",
            "Explore cinco familias de concentrados de frutas y vegetales, con especial experiencia en uva."
          ),
          defaultGroup: "Mediterranean"
        },
        groups: [
          {
            title: t("Citrus", "Cítricos"),
            heading: t("Citrus concentrates", "Concentrados cítricos"),
            image: {
              src: "/images/raw-materials/concentrates/citrus-sliced.webp",
              alt: t("Sliced oranges, lemons and grapefruit", "Naranjas, limones y pomelos en rodajas"),
              focus: "50% 50%"
            },
            thumb: "/images/raw-materials/concentrates/citrus-sliced.webp",
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
            heading: t("Mediterranean concentrates", "Concentrados mediterráneos"),
            image: {
              src: "/images/raw-materials/concentrates/mediterranean-still-life.webp",
              alt: t(
                "An apple, a bunch of red grapes and two pears",
                "Una manzana, un racimo de uvas tintas y dos peras"
              ),
              focus: "50% 60%"
            },
            thumb: "/images/raw-materials/concentrates/mediterranean-still-life.webp",
            highlights: ["White grape", "Red grape"],
            note: t("A particular focus on grape.", "Una atención especial a la uva."),
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
            heading: t("Tropical concentrates", "Concentrados tropicales"),
            image: {
              src: "/images/raw-materials/concentrates/tropical-market.webp",
              alt: t("Mangoes and bananas at a market stall", "Mangos y plátanos en un puesto de mercado"),
              focus: "32% 50%"
            },
            thumb: "/images/raw-materials/concentrates/tropical-market.webp",
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
            heading: t("Red fruit concentrates", "Concentrados de frutos rojos"),
            image: {
              src: "/images/raw-materials/concentrates/red-fruits-mixed.webp",
              alt: t(
                "Strawberries, raspberries, blackberries and blueberries",
                "Fresas, frambuesas, moras y arándanos"
              ),
              focus: "50% 50%"
            },
            thumb: "/images/raw-materials/concentrates/red-fruits-mixed.webp",
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
            heading: t("Vegetable concentrates", "Concentrados de vegetales"),
            image: {
              src: "/images/raw-materials/concentrates/vegetables-roots.webp",
              alt: t("Carrots and beets at a market stall", "Zanahorias y remolachas en un puesto de mercado"),
              focus: "62% 60%"
            },
            thumb: "/images/raw-materials/concentrates/vegetables-roots.webp",
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
          "Concentrates obtained from oats and almonds, available as cloudy or clear juice concentrate and supplied in frozen, aseptic or bulk packaging.",
          "Concentrados obtenidos de la avena y la almendra, disponibles como concentrado de zumo turbio o clarificado y suministrados en envase congelado, aséptico o a granel."
        ),
        scope: {
          title: t("Oat and almond concentrates.", "Concentrados de avena y almendra."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the product you are developing and the concentrate it requires.",
              "Indique el producto que está desarrollando y el concentrado que necesita."
            )
          }
        },
        image: "/images/raw-materials/plant-based.avif",
        // Formats from the oat and almond pages; packaging from the official plant-based page.
        scopeGroups: [
          {
            title: t("Formats", "Formatos"),
            items: [
              t("Cloudy juice concentrate", "Concentrado de zumo turbio"),
              t("Clear juice concentrate", "Concentrado de zumo clarificado")
            ]
          },
          {
            title: t("Packaging", "Envase"),
            items: [
              t("Frozen: drums of 160 to 270 kg", "Congelado: bidones de 160 a 270 kg"),
              t(
                "Aseptic: drums of 180 to 270 kg, bag-in-box of 5 to 25 kg, bins up to 1,000 kg",
                "Aséptico: bidones de 180 a 270 kg, bag-in-box de 5 a 25 kg, contenedores de hasta 1.000 kg"
              ),
              t("Bulk: tank trucks", "Granel: camiones cisterna")
            ]
          }
        ],
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
          "Lemon, orange, lime and grapefruit frozen piece by piece (IQF) with a physical process and no additives, for cocktails, desserts, cooking and industrial use.",
          "Limón, naranja, lima y pomelo congelados pieza a pieza (IQF) mediante un proceso físico y sin aditivos, para cócteles, postres, cocina y uso industrial."
        ),
        scope: {
          title: t("IQF citrus formats.", "Formatos de cítricos IQF."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the citrus, the format and the application you have in mind.",
              "Indique el cítrico, el formato y la aplicación que tiene en mente."
            )
          }
        },
        image: "/images/raw-materials/iqf-fruit.avif",
        // From the official IQF page and the published format pages of each fruit.
        scopeGroups: [
          {
            title: t("Citrus", "Cítricos"),
            items: [t("Lemon", "Limón"), t("Orange", "Naranja"), t("Lime", "Lima"), t("Grapefruit", "Pomelo")]
          },
          {
            title: t("Formats", "Formatos"),
            items: [
              t("Slices and half slices: all four fruits", "Rodajas y medias rodajas: las cuatro frutas"),
              t("1/4 and 1/8 cuts: all four fruits", "Cortes en cuartos y octavos: las cuatro frutas"),
              t("Sticks and zest: lemon, orange and lime", "Bastones y ralladura: limón, naranja y lima"),
              t("Peel shells and squares: lemon and orange", "Cáscaras y piel en cuadrados: limón y naranja")
            ]
          }
        ],
        showcase: {
          image: "/images/raw-materials/citrus.webp",
          focus: "60% 50%",
          card: { image: "/images/raw-materials/iqf-citrus-card.webp", focus: "55% 55%" }
        },
        heroPanorama: {
          image: "/images/raw-materials/iqf-citrus-panorama.png",
          width: 1914,
          height: 822,
          focus: "80% 45%"
        }
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
      title: t("Flavour support built around your", "Apoyo en sabores pensado para su"),
      highlight: t("product.", "producto."),
      frameworkLabel: t("How GFB supports you", "Cómo le apoya GFB"),
      criteria: [
        {
          id: "development",
          title: t("Development", "Desarrollo"),
          text: t(
            "Flavour development for sweet, beverage and savoury products.",
            "Desarrollo de sabores para productos dulces, bebidas y salados."
          ),
          icon: "drop"
        },
        {
          id: "innovation",
          title: t("Innovation", "Innovación"),
          text: t(
            "Support with flavour choices for new products and innovation.",
            "Apoyo en la elección de sabores para nuevos productos e innovación."
          ),
          icon: "growth"
        },
        {
          id: "selection",
          title: t("Flavour selection", "Selección de sabores"),
          text: t(
            "Guidance on the flavours that best suit each product.",
            "Orientación sobre los sabores que mejor se adaptan a cada producto."
          ),
          icon: "search"
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
    ctaTitle: t("Developing a new flavour profile?", "¿Está desarrollando un nuevo perfil de sabor?"),
    detailSecondary: t("Explore the application", "Ver la aplicación"),
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
          "GFB develops flavours for sweet product lines, from the first idea to delivery, drawing on an extensive raw material palette.",
          "GFB desarrolla sabores para líneas de productos dulces, desde la idea hasta la entrega, a partir de una amplia paleta de materias primas."
        ),
        scope: {
          title: t("Flavours for sweet products.", "Sabores para productos dulces."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the sweet product and the flavour profile you are looking for.",
              "Indique el producto dulce y el perfil de sabor que busca."
            )
          }
        },
        image: "/images/flavours/sweet.avif",
        // Condensed from the official /sweets page (product groups and capabilities).
        scopeGroups: [
          {
            title: t("Applications", "Aplicaciones"),
            items: [
              t("Confectionery and lollies", "Confitería y caramelos"),
              t("Baked goods and desserts", "Productos de panadería y postres"),
              t("Ice cream", "Helados"),
              t("Dairy products", "Productos lácteos")
            ]
          },
          {
            title: t("Development", "Desarrollo"),
            items: [
              t("Bespoke flavours for a product line", "Sabores a medida para una línea de producto"),
              t("Extensive raw material palette", "Amplia paleta de materias primas"),
              t("Quick project development", "Desarrollo rápido de proyectos")
            ]
          },
          {
            title: t("Logistics", "Logística"),
            items: [
              t("Pallet and container optimisation", "Optimización de palés y contenedores"),
              t("Flexible packaging and logistics options", "Opciones flexibles de envase y logística")
            ]
          }
        ],
        showcase: {
          image: "/images/flavours/sweet-ice-cream.webp",
          focus: "50% 42%",
          card: { image: "/images/flavours/sweet-tarts.webp", focus: "60% 55%" }
        },
        heroDesktop: {
          image: { src: "/images/flavours/sweet-tarts.webp", width: 2400, height: 1350 },
          focus: "60% 55%"
        }
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
          "GFB develops bespoke flavours for specific beverage lines, with attention to photostability and colourant composition so that drinks keep their appearance over time.",
          "GFB desarrolla sabores a medida para líneas de bebidas concretas, con atención a la fotoestabilidad y a la composición de colorantes para que las bebidas mantengan su aspecto con el tiempo."
        ),
        scope: {
          title: t("Flavours for beverages.", "Sabores para bebidas."),
          context: {
            title: t("Tell us about your beverage.", "Cuéntenos su bebida."),
            text: t(
              "Share the beverage and the flavour profile you are looking for.",
              "Indique la bebida y el perfil de sabor que busca."
            )
          }
        },
        image: "/images/flavours/beverage.avif",
        // Condensed from the official /beverages page (product groups and capabilities).
        scopeGroups: [
          {
            title: t("Applications", "Aplicaciones"),
            items: [
              t("Soft drinks and soft drink powders", "Refrescos y refrescos en polvo"),
              t("Energy drinks and energy drink powders", "Bebidas energéticas y en polvo"),
              t("Juices and waters", "Zumos y aguas"),
              t("Syrups", "Jarabes")
            ]
          },
          {
            title: t("Development", "Desarrollo"),
            items: [
              t("Bespoke flavours for a product line", "Sabores a medida para una línea de producto"),
              t("Photostability and colourant composition", "Fotoestabilidad y composición de colorantes"),
              t("Quick project development for market entry", "Desarrollo rápido para la entrada en el mercado")
            ]
          },
          {
            title: t("Logistics", "Logística"),
            items: [
              t("Pallet and container optimisation", "Optimización de palés y contenedores"),
              t("Flexible logistics and tailor-made packaging", "Logística flexible y envase a medida")
            ]
          }
        ],
        showcase: {
          image: "/images/flavours/beverage-citrus.webp",
          focus: "65% 50%",
          card: { image: "/images/flavours/beverage-citrus-drink.webp", focus: "55% 60%" }
        },
        heroDesktop: {
          image: { src: "/images/flavours/beverage-citrus-drink.webp", width: 2400, height: 1600 },
          focus: "55% 60%"
        }
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
          "GFB develops bespoke savoury flavours, from the kitchen to flavour creation, and supports the project from concept to shelf.",
          "GFB desarrolla sabores salados a medida, de la cocina a la creación del sabor, y acompaña el proyecto desde el concepto hasta el lineal."
        ),
        scope: {
          title: t("Flavours for savoury products.", "Sabores para productos salados."),
          context: {
            title: t("Tell us about your application.", "Cuéntenos su aplicación."),
            text: t(
              "Share the savoury product and the flavour profile you are looking for.",
              "Indique el producto salado y el perfil de sabor que busca."
            )
          }
        },
        image: "/images/flavours/hero.avif",
        // Condensed from the official /savoury page (product groups and capabilities).
        scopeGroups: [
          {
            title: t("Applications", "Aplicaciones"),
            items: [
              t("Soups, noodles and stock cubes", "Sopas, fideos y pastillas de caldo"),
              t("Snacks and ready meals", "Snacks y platos preparados"),
              t("Meat and fish", "Carnes y pescados"),
              t("Fresh and preserved foods, edible oils", "Alimentos frescos y en conserva, aceites comestibles")
            ]
          },
          {
            title: t("Development", "Desarrollo"),
            items: [
              t("Bespoke flavour development", "Desarrollo de sabores a medida"),
              t("Extensive raw material palette", "Amplia paleta de materias primas"),
              t("Quick project development", "Desarrollo rápido de proyectos")
            ]
          },
          {
            title: t("Logistics", "Logística"),
            items: [
              t("Pallet and container optimisation", "Optimización de palés y contenedores"),
              t("Flexible packaging and logistics options", "Opciones flexibles de envase y logística")
            ]
          }
        ],
        showcase: {
          image: "/images/flavours/savoury-board.webp",
          focus: "50% 50%",
          card: { image: "/images/flavours/savoury-soup.webp", focus: "62% 55%" }
        },
        heroDesktop: {
          image: { src: "/images/flavours/savoury-soup.webp", width: 2400, height: 1599 },
          focus: "62% 55%"
        }
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
      "Tailored consulting for machinery and production processes across food, general industrial, environmental and pharmaceutical sectors.",
      "Consultoría a medida para maquinaria y procesos productivos en los sectores alimentario, industrial, medioambiental y farmacéutico."
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
    ctaTitle: t("Have a process or machinery challenge?", "¿Tiene un reto de proceso o maquinaria?"),
    detailSecondary: t("Explore the sector scope", "Ver el alcance del sector"),
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
          "Consulting on machinery and production processes in food manufacturing, with food safety, efficiency and industry standards in view.",
          "Consultoría sobre maquinaria y procesos de producción en la fabricación de alimentos, con la seguridad alimentaria, la eficiencia y las normas del sector presentes."
        ),
        scope: {
          title: t("Food processes.", "Procesos alimentarios."),
          context: {
            title: t("Tell us about your process.", "Cuéntenos su proceso."),
            text: t(
              "Share the process, the challenge you face and the objectives you want to reach.",
              "Indique el proceso, el reto que afronta y los objetivos que quiere alcanzar."
            )
          }
        },
        image: "/images/consulting/process.avif",
        // From the official consulting page's food sector text.
        scopeGroups: [
          {
            title: t("Focus", "Enfoque"),
            items: [
              t("Production processes, from farm to fork", "Procesos de producción, de la granja a la mesa"),
              t("Food safety and efficiency", "Seguridad alimentaria y eficiencia"),
              t("Industry regulations and standards", "Normativa y estándares del sector")
            ]
          }
        ],
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
          "Consulting on machinery and production processes aimed at manufacturing efficiency, less downtime and a smoother workflow.",
          "Consultoría sobre maquinaria y procesos de producción orientada a la eficiencia de fabricación, a reducir paradas y a un flujo de trabajo más fluido."
        ),
        scope: {
          title: t("Industrial processes.", "Procesos industriales."),
          context: {
            title: t("Tell us about your process.", "Cuéntenos su proceso."),
            text: t(
              "Share the process, the challenge you face and the objectives you want to reach.",
              "Indique el proceso, el reto que afronta y los objetivos que quiere alcanzar."
            )
          }
        },
        image: "/images/consulting/process.avif",
        // From the official consulting page's industrial sector text.
        scopeGroups: [
          {
            title: t("Focus", "Enfoque"),
            items: [
              t("Manufacturing efficiency", "Eficiencia de fabricación"),
              t("Less downtime", "Menos paradas"),
              t("Workflow optimisation", "Optimización del flujo de trabajo")
            ]
          }
        ],
        showcase: { image: "/images/consulting/industrial-robotics.webp", focus: "50% 55%" }
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
          "Consulting on production processes where resource efficiency and environmental impact matter.",
          "Consultoría sobre procesos de producción en los que importan la eficiencia de los recursos y el impacto ambiental."
        ),
        scope: {
          title: t("Environmental performance.", "Desempeño ambiental."),
          context: {
            title: t("Tell us about your process.", "Cuéntenos su proceso."),
            text: t(
              "Share the process, the challenge you face and the objectives you want to reach.",
              "Indique el proceso, el reto que afronta y los objetivos que quiere alcanzar."
            )
          }
        },
        image: "/images/consulting/hero.avif",
        // From the official consulting page's environmental sector text.
        scopeGroups: [
          {
            title: t("Focus", "Enfoque"),
            items: [
              t("Sustainable process solutions", "Soluciones de proceso sostenibles"),
              t("Lower environmental impact", "Menor impacto ambiental"),
              t("Resource efficiency", "Eficiencia de los recursos")
            ]
          }
        ],
        showcase: { image: "/images/consulting/environmental-treatment.webp", focus: "50% 55%" }
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
          "Process consulting for pharmaceutical manufacturing, with quality and regulatory requirements in view.",
          "Consultoría de procesos para la fabricación farmacéutica, con los requisitos de calidad y normativos presentes."
        ),
        scope: {
          title: t("Pharmaceutical processes.", "Procesos farmacéuticos."),
          context: {
            title: t("Tell us about your process.", "Cuéntenos su proceso."),
            text: t(
              "Share the process, the challenge you face and the objectives you want to reach.",
              "Indique el proceso, el reto que afronta y los objetivos que quiere alcanzar."
            )
          }
        },
        image: "/images/consulting/process.avif",
        // From the official consulting page's pharmaceutical sector text.
        scopeGroups: [
          {
            title: t("Focus", "Enfoque"),
            items: [
              t("Quality in pharmaceutical manufacturing", "Calidad en la fabricación farmacéutica"),
              t("Stringent regulatory requirements", "Requisitos normativos exigentes"),
              t("Process innovation", "Innovación de procesos")
            ]
          }
        ],
        showcase: {
          placeholder: "capsule",
          card: { image: "/images/consulting/pharmaceutical-filling-card.webp", focus: "60% 50%" }
        },
        heroPanorama: {
          image: "/images/consulting/pharmaceutical-filling-panorama.png",
          width: 1914,
          height: 822,
          focus: "70% 50%"
        }
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
  id: division.id,
  slug: division.slug,
  categories: division.categories.map((category) => ({ id: category.id, slug: category.slug }))
}));
