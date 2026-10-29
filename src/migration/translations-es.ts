/**
 * Spanish text for content the official Spanish pages publish in English (audit C03). Applied by
 * scripts/build-migration-manifest.ts to the Spanish page after unit normalisation, field by
 * field (paragraph, list entry, table cell, heading). Codes, references, numbers, inequality
 * signs, units and test methods are kept as published; only the wording is translated. A block
 * is marked Spanish only when every one of its strings has a translation or is language-neutral
 * (codes, values); otherwise it keeps lang="en". Keys are the English text exactly as it appears
 * on the Spanish page after normalisation (tests/unit/translations-es.test.ts lists any left).
 */
import type { Item, Section } from "./content.ts";

/** Product codes, finishes and values shown as published in both languages. */
const KEEP = new Set([
  "Alloy AA3104",
  "H19 Temper",
  "BPA Free",
  "52 mm (202) Dia ISE Aluminium End",
  "SOT - Large Aperture (Botcherby)",
  "52 mm (202) Dia Aluminium End",
  "SOT - Std Aperture (Korinthos)",
  "18 STD PP NF 35-103",
  "25 mm PP BVP NFH 35-103",
  "22 mm PP BVP H 30",
  "26 Twist Crown 2",
  "A 26 DIN 6094-1",
  "28 MCA 2",
  "PP MCA 2",
  "26 mm RipCap",
  "42 mm RipCap",
  "Merlot",
  "RGJC R-600",
  "Malbec",
  "Red -800",
  "Cabernet sauvignon",
  "Red - 1000",
  "Tintorera R-4000"
]);

/** Language-neutral values: numbers with units, inequalities, codes. */
const NEUTRAL = /^[\d\s.,:;<>≤≥+\-–/()%°×#]*(?:\s*(?:ml|mm|cc|kg|nm|NTU|°Brix|UFC\/\s?g(?:rs)?|mg\/kg|g\/m2))*$/;

/** Reference headings of the bottle tables: application + code. */
const PATTERNS: [RegExp, string][] = [
  [/^Soft Drinks\s*-\s*(\d+)$/, "Refrescos - $1"],
  [/^Spirits\s*-\s*(\d+)$/, "Destilados - $1"],
  [/^Wine Bottle\s*-\s*(\d+)$/, "Botella de vino - $1"],
  [/^Beer Bottle\s*-\s*(\d+)$/, "Botella de cerveza - $1"],
  [/^Mineral Water Bottles\s*-\s*(\d+)$/, "Botellas de agua mineral - $1"],
  [/^Water Bottles\s*-\s*(\d+)$/, "Botellas de agua - $1"],
  [/^Color \(520 nm\) (\d.*)$/, "Color (520 nm) $1"],
  [/^Turbidity (<.*)$/, "Turbidez $1"],
  [/^SO₂ Total \(mg\/kg\) (<.*)$/, "SO₂ total (mg/kg) $1"]
];

const TEXT: Record<string, string> = {
  // ---------- Cans and ends ----------
  "Aluminum cans": "Latas de aluminio",
  "Standard can": "Lata estándar",
  "Slim can": "Lata slim",
  "Sleek can": "Lata sleek",
  "Aluminum can ends": "Tapas para latas de aluminio",
  "Product Overview": "Descripción del producto",
  "Introducing the 52 mm (202) Dia ISE Aluminium End SOT - Large Aperture (Botcherby), designed for high performance and durability in various applications.":
    "La tapa de aluminio 52 mm (202) Dia ISE SOT de gran abertura (Botcherby) está diseñada para ofrecer prestaciones y durabilidad en distintas aplicaciones.",
  "Eco-Friendly Internal Lacquer": "Laca interior sin PVC",
  "This product features a PVC-free internal lacquer, making it an environmentally responsible choice without compromising quality.":
    "Incorpora una laca interior sin PVC, una opción más respetuosa con el medio ambiente sin renunciar a la calidad.",
  "Durable External Protection": "Protección exterior",
  "The external epoxy lacquer provides exceptional resistance to wear and tear, ensuring long-lasting protection and reliability in any environment.":
    "La laca exterior epoxi ofrece resistencia al desgaste y una protección duradera.",
  "Safe and Sustainable Lining": "Compuesto de sellado",
  "Our water-based lining compound enhances safety and sustainability, making it suitable for a wide range of uses while minimizing environmental impact.":
    "El compuesto de sellado de base acuosa es apto para una amplia variedad de usos y reduce el impacto ambiental.",
  "Precision Engineering": "Dimensiones",
  "With a curl outside diameter of 59.29 mm and a curl inside diameter of 57.81 mm, this aluminium end is engineered for a precise fit and optimal functionality.":
    "Con un diámetro exterior de rizo de 59.29 mm y un diámetro interior de rizo de 57.81 mm, esta tapa de aluminio está diseñada para un ajuste preciso.",
  "Elevate Your Projects": "Consulte su proyecto",
  "Choose the 52 mm (202) Dia ISE Aluminium End SOT to enhance your projects with a high-quality, reliable solution that meets your needs.":
    "La tapa 52 mm (202) Dia ISE SOT es una solución fiable para proyectos que requieren gran abertura.",
  Epoxy: "Epoxi",

  // ---------- Bottles ----------
  "Filling Capacity": "Capacidad de llenado",
  Diameter: "Diámetro",
  Height: "Altura",
  "Filling Capacity (cc)": "Capacidad de llenado (cc)",
  "Diameter (mm)": "Diámetro (mm)",
  "Height (mm)": "Altura (mm)",
  "Finish Type": "Tipo de boca",
  Spirits: "Destilados",
  Wine: "Vino",
  Beer: "Cerveza",
  "Screw (26)": "Rosca (26)",
  Crown: "Corona",
  "Twist Off (26)": "Twist off (26)",
  "Mineral Water Bottles": "Botellas de agua mineral",
  "Soft Drinks": "Refrescos",
  "Water Bottles": "Botellas de agua",

  // ---------- Closures ----------
  "Crown corks": "Tapones corona",
  "Crown Closure": "Tapón corona",
  "Ring Pull Closure": "Cierre con anilla",
  "Red Grape Juice Concentrate": "Concentrado de zumo de uva tinta",
  "Crown Cork Bottle Caps": "Tapones corona para botellas",
  "Different lining materials": "Distintos materiales de liner",
  "Standard Pantone PMS colours": "Colores estándar Pantone PMS",
  "Customer designed printing": "Impresión con diseño del cliente",
  "One piece of aluminium": "Una sola pieza de aluminio",
  "RipCap overprint varnish": "Barniz de sobreimpresión RipCap",
  "PVC standard | High temperature": "PVC estándar | Alta temperatura",
  "26 mm Ring Crown Cap": "Tapa corona con anilla de 26 mm",
  "Sheet Steel | Tinplate | Tin free steel": "Chapa de acero | Hojalata | Acero libre de estaño",
  "- PVC": "- PVC",
  "Standard Liner | Free - Liner": "Liner estándar | Liner sin PVC",
  "Coating Treatment": "Tratamiento de recubrimiento",
  "Crown Caps Overview": "Tapones corona",
  "Our crown caps are designed for optimal sealing and aesthetic appeal, available in two popular sizes: 26 mm and 42 mm. Crafted from high-quality materials, they ensure a reliable seal for various beverages.":
    "Nuestros tapones corona combinan cierre y presentación y se fabrican en dos tamaños habituales: 26 mm y 42 mm. Sus materiales garantizan un cierre fiable para distintas bebidas.",
  "26 mm Crown Caps": "Tapones corona de 26 mm",
  "Material: Made from tinplate, electrolytically lined with tin, or TFS steel with chromium plating, compliant with DIN 6099 standards.":
    "Material: hojalata con recubrimiento electrolítico de estaño, o acero TFS cromado, conforme a la norma DIN 6099.",
  "Customization: Available in standard Pantone PMS colors, featuring options for neutral one-color printing, multicolor printing, or custom-designed printing using the offset printing method. Inside printing is also an option for added branding opportunities.":
    "Personalización: colores estándar Pantone PMS, con impresión neutra a una tinta, impresión multicolor o diseño del cliente mediante impresión offset. También se ofrece impresión interior.",
  "42 mm Crown Caps": "Tapones corona de 42 mm",
  Material: "Material",
  "Constructed from durable steel, ideal for glass bottles.":
    "Fabricados en acero resistente, adecuados para botellas de vidrio.",
  "Performance: Designed to provide maximum sealing pressure and a good hermetic seal for a wide range of drinks, ensuring freshness and quality.":
    "Prestaciones: diseñados para ofrecer una alta presión de cierre y un buen sellado hermético en una amplia variedad de bebidas.",
  "Color Options: Available in five colors: gold, silver, white, black, and red, catering to various branding needs.":
    "Colores: disponibles en cinco colores: oro, plata, blanco, negro y rojo.",
  "Customization: Decorated 29 mm crown caps can be customized with printed logos or designs to enhance brand recognition.":
    "Personalización: los tapones corona decorados de 29 mm pueden personalizarse con logotipos o diseños impresos.",
  Conclusion: "Resumen",
  "Choose our crown caps for a reliable and visually appealing solution that meets the demands of your beverage packaging, with options for customization to showcase your brand effectively.":
    "Nuestros tapones corona ofrecen un cierre fiable y opciones de personalización para su marca.",
  "Our cap shell and ring are expertly crafted from a single piece of aluminium, ensuring durability and a seamless design for optimal performance.":
    "La cápsula y la anilla se fabrican en una sola pieza de aluminio, lo que aporta durabilidad y un diseño sin uniones.",
  "Decoration Features": "Decoración",
  "The decoration is printed directly on the cap's shell and ring, providing a sleek and professional appearance. This printing utilizes high-quality inks to maintain vibrancy and clarity.":
    "La decoración se imprime directamente sobre la cápsula y la anilla con tintas de alta calidad, para un acabado nítido.",
  "Material Specifications": "Material",
  "Constructed from sheet aluminium with a thickness of 0.24 mm and hardness rating of H18, our cap shell and ring are built to withstand rigorous use while maintaining their integrity.":
    "Chapa de aluminio de 0.24 mm de espesor y dureza H18: la cápsula y la anilla soportan un uso exigente sin perder su integridad.",
  "Coatings and Printing": "Recubrimientos e impresión",
  "The inside lacquer is made from modified vinyl resin or polyester-phenolic, providing an effective barrier. A white polyester coating enhances appearance and durability.":
    "La laca interior es de resina vinílica modificada o poliéster-fenólica y actúa como barrera. Un recubrimiento blanco de poliéster mejora el aspecto y la durabilidad.",
  "Additionally, the RipCap overprint varnish prevents abrasion, protecting the printed design.":
    "El barniz de sobreimpresión RipCap evita la abrasión y protege el diseño impreso.",
  "Inks and Varnish": "Tintas y barniz",
  "We utilize high-quality alkyd inks for rich color and durability, complemented by an epoxy resin ester overprint varnish to ensure long-lasting protection.":
    "Utilizamos tintas alquídicas de alta calidad y un barniz de sobreimpresión de éster de resina epoxi para una protección duradera.",
  "Liner Options": "Opciones de liner",
  "The standard liner is PVC, suitable for cold and hot filling as well as pasteurization. For specialized needs, we offer a high-temperature PVC liner on request, ideal for cold and hot filling, pasteurization, and sterilization processes.":
    "El liner estándar es de PVC, apto para llenado en frío y en caliente y pasteurización. Bajo pedido se ofrece un liner de PVC de alta temperatura, apto para llenado en frío y en caliente, pasteurización y esterilización.",
  "Elevate Your Packaging": "Consulte su proyecto",
  "Choose our aluminium cap shell and ring for a reliable and aesthetically pleasing solution that meets a variety of filling and processing requirements.":
    "La cápsula y la anilla de aluminio se adaptan a distintos requisitos de llenado y procesado.",
  "Our cap shell and ring are designed for durability and performance, crafted from high-quality materials that ensure a reliable seal for various applications.":
    "La cápsula y la anilla están diseñadas para ofrecer durabilidad y un cierre fiable en distintas aplicaciones.",
  "Cap Shell Specifications": "Cápsula",
  "Material: Available in sheet steel, with options for tinplate or tin-free steel (TFS), both at a thickness of 0.17 mm.":
    "Material: chapa de acero, en hojalata o acero libre de estaño (TFS), ambas de 0.17 mm de espesor.",
  Hardness: "Dureza",
  "Rated at T2, providing strength and resilience.": "T2, para una buena resistencia.",
  "Tin Coating": "Recubrimiento de estaño",
  "Features a tin coating of 2.8 g/m² for enhanced corrosion resistance.":
    "Recubrimiento de estaño de 2.8 g/m² para mejorar la resistencia a la corrosión.",
  "Ring Blank Specifications": "Disco de la anilla",
  "Made from tinplate with a thickness of 0.17 mm.": "Hojalata de 0.17 mm de espesor.",
  "Also rated at T2, ensuring consistent performance.": "También de dureza T2.",
  "Offers a tin coating of 5.6 g/m² for superior durability.":
    "Recubrimiento de estaño de 5.6 g/m² para una mayor durabilidad.",
  "Inside Lacquer": "Laca interior",
  "Utilizes BPA-NI modified vinyl resin or polyester-phenolic for effective protection.":
    "Resina vinílica modificada o poliéster-fenólica BPA-NI para una protección eficaz.",
  "White Coating": "Recubrimiento blanco",
  "A BPA-NI modified polyester coating enhances appearance and durability.":
    "Un recubrimiento de poliéster modificado BPA-NI mejora el aspecto y la durabilidad.",
  "Abrasion Resistance:The RipCap overprint varnish prevents wear on the printed design, ensuring long-lasting branding.":
    "Resistencia a la abrasión: el barniz de sobreimpresión RipCap evita el desgaste del diseño impreso.",
  "Inks and Overprint Varnish": "Tintas y barniz de sobreimpresión",
  "We use high-quality BPA-NI alcyd inks for vibrant color retention, combined with a polyester base overprint varnish for added protection.":
    "Utilizamos tintas alquídicas BPA-NI de alta calidad y un barniz de sobreimpresión de base poliéster para una protección adicional.",
  "Special Coating Treatment": "Tratamiento de recubrimiento",
  "Our coating treatment includes a special FDA-approved lacquer on all cut edges and the ring, ensuring safety and compliance.":
    "El tratamiento incluye una laca especial aprobada por la FDA en todos los bordes cortados y en la anilla.",
  "Choose between a PVC standard liner or a PVC-free liner, both designed for cold and hot filling as well as pasteurization. The liner acts as a circular seal, securely fixed to the inside area of the cap for optimal sealing performance.":
    "Puede elegir un liner de PVC estándar o un liner sin PVC, ambos aptos para llenado en frío y en caliente y pasteurización. El liner es un sello circular fijado en la parte interior de la tapa.",
  "Select our cap shell and ring for a robust, reliable solution that meets your packaging needs while ensuring quality and compliance with industry standards.":
    "La cápsula y la anilla ofrecen una solución robusta y fiable para su envase.",
  "Our cap shell and ring are expertly crafted from a single piece of aluminium, ensuring a durable and seamless design that enhances both functionality and aesthetics.":
    "La cápsula y la anilla se fabrican en una sola pieza de aluminio, con un diseño duradero y sin uniones.",
  "Made from sheet aluminium with a thickness of 0.24 mm and a hardness rating of H18, these components are engineered to withstand demanding conditions while maintaining structural integrity.":
    "Chapa de aluminio de 0.24 mm de espesor y dureza H18, diseñada para condiciones exigentes.",
  "The decoration is printed directly on the cap's shell and ring, providing a polished look that enhances brand visibility.":
    "La decoración se imprime directamente sobre la cápsula y la anilla, con un acabado cuidado que refuerza la marca.",
  "Inside Lacquer: Crafted from modified vinyl resin or polyester-phenolic, this lacquer provides an effective barrier against corrosion.":
    "Laca interior: resina vinílica modificada o poliéster-fenólica, que actúa como barrera frente a la corrosión.",
  "A modified polyester coating enhances durability and appearance.":
    "Un recubrimiento de poliéster modificado mejora la durabilidad y el aspecto.",
  "Abrasion Resistance": "Resistencia a la abrasión",
  "Our RipCap overprint varnish protects the printed design from abrasion, ensuring your branding remains vibrant and intact over time.":
    "El barniz de sobreimpresión RipCap protege el diseño impreso de la abrasión.",
  "We utilize high-quality alkyd inks for rich, long-lasting color, complemented by an epoxy resin ester overprint varnish that adds an extra layer of protection.":
    "Utilizamos tintas alquídicas de alta calidad y un barniz de sobreimpresión de éster de resina epoxi como capa adicional de protección.",
  "Choose our aluminium cap shell and ring for a robust, visually appealing solution that meets your packaging needs while ensuring quality and durability.":
    "La cápsula y la anilla de aluminio ofrecen una solución robusta y duradera para su envase.",

  // ---------- Labels ----------
  "Shrink Sleeves Labels": "Etiquetas sleeve retráctiles",
  Features: "Características",
  "Unlock the full potential of your packaging with our custom shrink sleeve labels. Our labels offer unparalleled design flexibility and can be tailored to fit any package shape or size, enhancing both aesthetics and functionality.":
    "Las etiquetas sleeve retráctiles personalizadas ofrecen gran libertad de diseño y se adaptan a la forma y el tamaño de cada envase.",
  "Custom Package Design: Transform your product packaging with bespoke designs that stand out on the shelf.":
    "Diseño a medida: diseños personalizados que destacan en el lineal.",
  "Variety of Formats: Choose from an extensive range of attractive and ergonomic formats to suit consumer needs.":
    "Variedad de formatos: una amplia gama de formatos atractivos y ergonómicos.",
  "High-Quality Graphics: Enjoy crisp, vibrant graphics that capture attention and convey your brand message effectively.":
    "Gráficos de alta calidad: impresión nítida y de colores vivos para comunicar su marca.",
  "Exclusive Branding: Elevate your brand's identity and create memorable consumer experiences with unique sleeve label options.":
    "Imagen de marca: opciones de etiqueta exclusivas que refuerzan la identidad de su marca.",
  Benefits: "Ventajas",
  "360° decoration: full-wrap designs that read consistently from every angle.":
    "Decoración 360°: diseños envolventes que se leen igual desde cualquier ángulo.",
  "Shelf presence: distinctive full-body graphics on the shelf.":
    "Presencia en el lineal: gráficos distintivos en todo el cuerpo del envase.",
  "Durability: the sleeve helps protect the product and its graphics from light, scratches and dirt.":
    "Durabilidad: la etiqueta ayuda a proteger el producto y sus gráficos de la luz, los arañazos y la suciedad.",
  "Versatility: several printing methods can be combined in a single process.":
    "Versatilidad: pueden combinarse varios métodos de impresión en un solo proceso.",
  "Custom solutions: options tailored to the requirements of each product.":
    "Soluciones a medida: opciones adaptadas a los requisitos de cada producto.",
  "Washoff Labels": "Etiquetas wash-off",
  "Key Features": "Características principales",
  "Sustainable Labels: Our labels are designed with eco-friendliness in mind, helping you reduce water, chemical, and energy consumption during the washing process.":
    "Etiquetas sostenibles: diseñadas para ayudar a reducir el consumo de agua, productos químicos y energía durante el lavado.",
  "Durable Adhesive: Enjoy labels that withstand washing without losing their ink or stickiness, ensuring your branding remains intact throughout the lifecycle of your product.":
    "Adhesivo duradero: etiquetas que resisten el lavado sin perder tinta ni adherencia.",
  "Easy Removal: Labels can be removed cleanly and quickly from bottles, allowing for hassle-free recycling and repurposing.":
    "Retirada sencilla: se desprenden de la botella de forma limpia y rápida, lo que facilita el reciclaje y la reutilización.",
  "Versatile Printing Options: Achieve all printing methods simultaneously, providing flexibility for customized designs and branding.":
    "Opciones de impresión: combinación de métodos de impresión para diseños personalizados.",
  "Tailored Solutions: We offer special solutions for a variety of products, ensuring optimal performance regardless of your specific needs.":
    "Soluciones a medida: soluciones especiales para distintos productos.",
  "Innovative Product Development: Stay ahead of the curve with our cutting-edge developments that enhance functionality and design.":
    "Desarrollo de producto: nuevos desarrollos que mejoran la funcionalidad y el diseño.",
  "Future-Ready Capabilities: Our labels are engineered for future demands, adapting to evolving market needs and technology.":
    "Preparadas para el futuro: etiquetas que se adaptan a la evolución del mercado y de la tecnología.",
  "Premium Decoration Options: Enhance your product’s market presence with our decorative label solutions, perfect for premium products seeking a competitive edge.":
    "Decoración premium: soluciones decorativas para productos premium.",
  "Why Choose Our Washable Labels?": "¿Por qué elegir etiquetas lavables?",
  "Explore our Range": "Nuestra gama",
  "Magazine Sheets: Perfect for high-visibility applications in print and digital media.":
    "Hojas de revista: para aplicaciones de alta visibilidad en medios impresos y digitales.",
  "Sheet Labels WGL: Designed for versatility and compatibility with various surfaces.":
    "Etiquetas en hoja WGL: versátiles y compatibles con distintas superficies.",
  "Transform your labeling strategy with our WashOff Labels today and lead the way toward a more sustainable future!":
    "Consulte con GFB cómo las etiquetas wash-off pueden encajar en su estrategia de etiquetado.",
  "Wet Glue Labels": "Etiquetas de cola húmeda",
  "Introducing Wet Glue Labels": "Etiquetas de cola húmeda",
  "Our Wet Glue Labels are specifically designed for beverage applications, ideal for large-scale mass production. They combine a paper label with high print quality and a wide choice of materials and finishes.":
    "Nuestras etiquetas de cola húmeda están diseñadas para bebidas y para producciones de gran volumen. Combinan una etiqueta de papel con una alta calidad de impresión y una amplia elección de materiales y acabados.",
  Options: "Opciones",
  "Recycled paper option: available on 100% recycled paper on request.":
    "Papel reciclado: disponible en papel 100% reciclado bajo pedido.",
  "Cost-effective: suited to large production runs.": "Rentables: adecuadas para grandes tiradas.",
  "Key Advantages": "Ventajas principales",
  "High print quality: sharp, vibrant graphics.": "Alta calidad de impresión: gráficos nítidos y de colores vivos.",
  "Short lead times: delivery dates are agreed with each order.":
    "Plazos cortos: las fechas de entrega se acuerdan con cada pedido.",
  "Hot foil stamping: available as a premium finish.": "Estampación en caliente: disponible como acabado premium.",
  "Materials: a wide choice of label materials for each application.":
    "Materiales: amplia elección de materiales para cada aplicación.",
  "Finishes: several finishes for durability and appearance.":
    "Acabados: varios acabados para la durabilidad y el aspecto.",
  "Free form and design: shapes and designs customised to the brand.":
    "Forma y diseño libres: formas y diseños adaptados a la marca.",
  "Request a quotation": "Solicite un presupuesto",
  "Send GFB your quantities, label format and finishing requirements to receive a quotation for your wet glue labels.":
    "Envíe a GFB sus cantidades, formato de etiqueta y acabados para recibir un presupuesto de etiquetas de cola húmeda.",

  // ---------- Fruit and vegetable concentrates ----------
  "The white grapefruit is highly recommendable for its use in juices, concentrates, essential oils and juice-vesicles or purees.":
    "El pomelo blanco se utiliza en zumos, concentrados, aceites esenciales, vesículas de zumo y purés.",
  "For that, It is usually compared with the lemon for its appearance and flavour, and also with other citric fruit as the orange, because of its versatility while cooking.":
    "Por su aspecto y su sabor suele compararse con el limón, y con otros cítricos como la naranja por su versatilidad en la cocina.",
  "The lime is a highly recommended citric fruit to accompany food, prepare cocktails, produce concentrates, essential oils and juice-vesicles.":
    "La lima se utiliza para acompañar comidas, preparar cócteles y elaborar concentrados, aceites esenciales y vesículas de zumo.",
  "For its inner strange look or perhaps, for the contrast between flavour and colour, it is actually linked to other citrics like the pink grapefruit or the white grapefruit.":
    "Por su aspecto interior y el contraste entre sabor y color, se asocia a otros cítricos como el pomelo rosa o el pomelo blanco.",
  "Lemon is the perfect citric to produce concentrates, juices and purees, essential oils and juice-vesicles.":
    "El limón se utiliza para elaborar concentrados, zumos, purés, aceites esenciales y vesículas de zumo.",
  "Pink grapefruit acids give that characteristic flavour": "Los ácidos del pomelo rosa le dan su sabor característico",
  "The white grapefruit comparison, due to the component elements, or even with other fruit rich in juices as the lemon, are almost inescapable.":
    "Por su composición, es inevitable compararlo con el pomelo blanco o con otras frutas ricas en zumo, como el limón.",
  "The pink grapefruit is an ideal fruit to consume in juices, concentrate or juice for seasoning dishes, as well as in essential oils or juice-vesicles.":
    "El pomelo rosa se utiliza en zumos, concentrados, zumo para condimentar platos, aceites esenciales y vesículas de zumo.",
  "Water is an essential part in the tangerine composition, doing this citric optimal for many ways as tangerine juice or tangerine puree, always maintaining its properties.":
    "El agua es una parte esencial de la mandarina, lo que la hace adecuada para elaborar zumo o puré de mandarina.",
  "The tangerine is a citric recommended to produce concentrates and juices, consume as juice-vesicles, essential oils or purees.":
    "La mandarina se utiliza para elaborar concentrados, zumos, vesículas de zumo, aceites esenciales y purés.",
  "The apple is a complete fruit that can be consumed in juice, concentrate or puree.":
    "La manzana puede utilizarse en zumo, concentrado o puré.",
  "The white grape is the perfect fruit to be consumed in juice, concentrate or puree.":
    "La uva blanca puede utilizarse en zumo, concentrado o puré.",
  "The persimmon is a sweet fruit that can be consumed in juices, concentrates or purees.":
    "El caqui es una fruta dulce que puede utilizarse en zumos, concentrados o purés.",
  "The red fruit can be consumed in juices, concentrates and purees.":
    "La uva tinta puede utilizarse en zumos, concentrados y purés.",
  "The peach is an ideal fruit to be consumed in juice, concentrates or purees.":
    "El melocotón puede utilizarse en zumo, concentrados o purés.",
  "The pear is a fruit than can be consumed in concentrates, juices or purees.":
    "La pera puede utilizarse en concentrados, zumos o purés.",
  "The pomegranate is the perfect food to be consumed in juices, concentrates, juice-vesicles or essential oils.":
    "La granada puede utilizarse en zumos, concentrados, vesículas de zumo o aceites esenciales.",
  "The apricot is a fruit to be consumed in juices, purees or concentrates.":
    "El albaricoque puede utilizarse en zumos, purés o concentrados.",
  "The melon is the ideal fruit to be consumed in refreshing juices, concentrates or purees.":
    "El melón puede utilizarse en zumos refrescantes, concentrados o purés.",
  "The passion fruit is a sour fruit which can be consumed in concentrate, purees and juices.":
    "La maracuyá es una fruta ácida que puede utilizarse en concentrado, purés y zumos.",
  "The white guava is a tropical fruit perfect for the elaboration of concentrates and purees.":
    "La guayaba blanca es una fruta tropical adecuada para elaborar concentrados y purés.",
  "The pineapple is a sour fruit which can be consumed in juices, concentrates or purees.":
    "La piña es una fruta ácida que puede utilizarse en zumos, concentrados o purés.",
  "Tamarind is supplied as juice concentrate and as puree.":
    "El tamarindo se suministra como concentrado de zumo y como puré.",
  "The pink guava is a little exotic fruit, perfect for the preparation of concentrates and purees.":
    "La guayaba rosa es una pequeña fruta exótica adecuada para elaborar concentrados y purés.",
  "The banana is a food which can be consumed in concentrates and purees.":
    "El plátano puede utilizarse en concentrados y purés.",
  "The mango fruit can be consumed in concentrates and purees.": "El mango puede utilizarse en concentrados y purés.",
  "Diced, coconut cream and coconut water.": "En dados, crema de coco y agua de coco.",
  "The cranberry is a fruit to be consumed in concentrate, juice or puree.":
    "El arándano rojo puede utilizarse en concentrado, zumo o puré.",
  "The blueberry is a fruit consumed in concentrate, juice and puree.":
    "El arándano puede utilizarse en concentrado, zumo y puré.",
  "The cherry can be consumed in concentrates, juices and purees.":
    "La cereza puede utilizarse en concentrados, zumos y purés.",
  "The raspberry can be consumed in concentrates, purees and juices.":
    "La frambuesa puede utilizarse en concentrados, purés y zumos.",
  "The blackberry is a fruit that can be consumed in juices, concentrates and purees.":
    "La mora puede utilizarse en zumos, concentrados y purés.",
  "The strawberry can be consumed in concentrates, juices and purees.":
    "La fresa puede utilizarse en concentrados, zumos y purés.",
  "The turnip is an ideal vegetable to be consumed in concentrates, juices and purees.":
    "El nabo puede utilizarse en concentrados, zumos y purés.",
  "The pumpkin is a vegetable which can be consumed in juice, concentrate or puree.":
    "La calabaza puede utilizarse en zumo, concentrado o puré.",
  "The tomato can be consumed in concentrates, juices or purees.":
    "El tomate puede utilizarse en concentrados, zumos o purés.",
  "The beet can be consumed in concentrate, juice or puree.":
    "La remolacha puede utilizarse en concentrado, zumo o puré.",
  "The pepper is a vegetable which can be consumed in concentrate, juice or puree.":
    "El pimiento puede utilizarse en concentrado, zumo o puré.",
  "The spinach can be consumed in concentrates, juices or purees.":
    "La espinaca puede utilizarse en concentrados, zumos o purés.",
  "The celery is rich in essential oils": "El apio es rico en aceites esenciales",
  "The celery can be consumed in concentrates, juices and purees.":
    "El apio puede utilizarse en concentrados, zumos y purés.",
  "The cucumber is a vegetable which can be consumed in juice, concentrate or puree.":
    "El pepino puede utilizarse en zumo, concentrado o puré.",
  "The broccoli is a vegetable that can be consumed in juice, concentrate or puree.":
    "El brócoli puede utilizarse en zumo, concentrado o puré.",
  "The carrot is a vegetable which can be consumed in concentrates, juices, and purees.":
    "La zanahoria puede utilizarse en concentrados, zumos y purés.",
  "The asparagus is a vegetable which can be consumed in concentrate, juice or puree.":
    "El espárrago puede utilizarse en concentrado, zumo o puré.",
  Concentrates: "Concentrados",
  "Juice concentrate cloudy, Juice concentrate clear": "Concentrado de zumo turbio, concentrado de zumo clarificado",

  // ---------- Red grape varieties ----------
  "Merlot Product Overview": "Merlot: descripción del producto",
  "Merlot is a 100% natural red grape juice concentrate crafted from healthy, hand-selected grapes. This viscous red liquid is free from any added flavorings, colorings, or preservatives, offering an authentic, unfermented grape juice experience. Using advanced evaporator technology, the water is carefully removed to maintain the product's pure concentration, making it ideal for use in a wide range of food and beverage products.":
    "Merlot es un concentrado de zumo de uva tinta 100% natural elaborado con uvas sanas seleccionadas a mano. Es un líquido rojo viscoso sin aromas, colorantes ni conservantes añadidos, obtenido de zumo de uva sin fermentar. El agua se elimina mediante evaporadores de última tecnología, lo que lo hace adecuado para una amplia variedad de alimentos y bebidas.",
  "Quality and Composition": "Calidad y composición",
  "Merlot concentrate boasts a Brix level of 67-69 at 20 °C and a total acidity of 1.0-2.1% tartaric acid by weight. Its pH level ranges from 2.8 to 3.8, and the color intensity is measured between 400-800 at 520 nm, delivering a rich and vibrant hue. With turbidity kept under 150 NTU at 16°Brix and total sulfur dioxide content below 50 mg/kg, Merlot meets stringent quality standards for purity and safety.":
    "El concentrado Merlot tiene 67-69 °Brix a 20 °C y una acidez total de 1.0-2.1 % en peso, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 400-800. La turbidez es inferior a 150 NTU a 16°Brix y el dióxido de azufre total, inferior a 50 mg/kg.",
  "Microbial Safety and Purity": "Seguridad microbiológica",
  "Merlot undergoes comprehensive microbiological testing to ensure the highest level of safety and quality. Yeast, mold, and total plate counts (TPC) are all maintained at less than 10 UFC/g, while the product is free from coliform bacteria and thermo acidophilic bacteria (TAB). These rigorous controls ensure that Merlot is a safe, stable, and premium product suitable for high-quality food and beverage formulations.":
    "Merlot se somete a análisis microbiológicos completos. Levaduras, mohos y recuento total en placa (TPC) se mantienen por debajo de 10 UFC/g, y el producto está libre de coliformes y de bacterias termoacidófilas (TAB).",
  "RGJC R-600 Product Overview": "RGJC R-600: descripción del producto",
  "RGJC R-600 is a 100% natural red grape juice concentrate made from selected, healthy grapes. This viscous red liquid is produced without any added flavorings, colorings, or preservatives, preserving the authentic taste of fresh, unfermented grape juice. The water is removed through advanced evaporator technology, ensuring a concentrated and pure product ideal for various food and beverage applications.":
    "RGJC R-600 es un concentrado de zumo de uva tinta 100% natural elaborado con uvas sanas seleccionadas. Es un líquido rojo viscoso sin aromas, colorantes ni conservantes añadidos, que conserva el sabor del zumo de uva fresco sin fermentar. El agua se elimina mediante evaporadores de última tecnología.",
  "RGJC R-600 has a Brix level of 64-66 at 20 °C and a total acidity of 1.0-2.1% tartaric acid. With a pH range of 2.8 to 3.8 and a color intensity between 500-600 at 520 nm, the product maintains consistent quality. Its turbidity is kept below 50 NTU at 16°Brix, and the total sulfur dioxide content remains under 10 mg/kg, ensuring a high standard of purity and safety.":
    "RGJC R-600 tiene 64-66 °Brix a 20 °C y una acidez total de 1.0-2.1 %, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 500-600. La turbidez es inferior a 50 NTU a 16°Brix y el dióxido de azufre total, inferior a 10 mg/kg.",
  "Microbiological testing of RGJC R-600 guarantees a safe and stable product. Yeast, mold, and total plate counts (TPC) are all maintained at less than 10 UFC/g, while the product is free from coliform bacteria and thermo acidophilic bacteria (TAB). These rigorous quality controls ensure the highest level of safety for use in both food and beverage manufacturing.":
    "Los análisis microbiológicos de RGJC R-600 mantienen levaduras, mohos y recuento total en placa (TPC) por debajo de 10 UFC/g, y el producto está libre de coliformes y de bacterias termoacidófilas (TAB).",
  "Malbec Product Overview": "Malbec: descripción del producto",
  "Malbec is a 100% natural red grape juice concentrate produced from carefully selected, healthy grapes. This viscous red liquid is created without any added flavorings, colorings, or preservatives, preserving the authentic character of unfermented fresh grape juice. Utilizing the latest evaporator technology, water is removed to deliver a pure, concentrated product ideal for use in various food and beverage applications.":
    "Malbec es un concentrado de zumo de uva tinta 100% natural elaborado con uvas sanas cuidadosamente seleccionadas. Es un líquido rojo viscoso sin aromas, colorantes ni conservantes añadidos, que conserva el carácter del zumo de uva fresco sin fermentar. El agua se elimina mediante evaporadores de última tecnología.",
  "Technical Composition and Quality": "Composición técnica y calidad",
  "Malbec juice concentrate features a Brix level of 67-69 at 20 °C and a total acidity of 1.0-2.1% tartaric acid by weight. The pH ranges from 2.8 to 3.8, and the color intensity measures between 400-800 at 520 nm, ensuring a deep, vibrant color. With turbidity maintained at less than 100 NTU at 16°Brix and total sulfur dioxide levels below 50 mg/kg, the product meets high standards of purity and quality.":
    "El concentrado de zumo Malbec tiene 67-69 °Brix a 20 °C y una acidez total de 1.0-2.1 % en peso, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 400-800. La turbidez es inferior a 100 NTU a 16°Brix y el dióxido de azufre total, inferior a 50 mg/kg.",
  "Microbial Safety and Quality Control": "Seguridad microbiológica y control de calidad",
  "To ensure the utmost safety and stability, Malbec undergoes strict microbiological testing. Yeast, mold, and total plate counts (TPC) are all kept below 10 UFC/g, while the product is entirely free from coliforms and thermo acidophilic bacteria (TAB). These stringent controls ensure that the product remains safe for consumption and suitable for a variety of high-quality food and beverage products.":
    "Malbec se somete a estrictos análisis microbiológicos. Levaduras, mohos y recuento total en placa (TPC) se mantienen por debajo de 10 UFC/g, y el producto está libre de coliformes y de bacterias termoacidófilas (TAB).",
  "RED-800 Product Overview": "RED-800: descripción del producto",
  "RED-800 is a high-quality red grape extract made from healthy, selected grapes. This 100% natural product presents as a viscous red liquid with no added flavorings, colorings, or preservatives. The water is carefully removed using advanced evaporator technology to maintain the natural essence and richness of fresh, unfermented grape juice.":
    "RED-800 es un extracto de uva tinta elaborado con uvas sanas seleccionadas. Este producto 100% natural es un líquido rojo viscoso sin aromas, colorantes ni conservantes añadidos. El agua se elimina mediante evaporadores de última tecnología, conservando las características del zumo de uva fresco sin fermentar.",
  "RED-800 offers a Brix level of 64-66 at 20 °C and a total acidity between 1.0-2.1% tartaric acid by weight. Its pH ranges from 2.8 to 3.8, and the color intensity is measured between 800-900 at 520 nm, ensuring vibrant color and optimal quality. Turbidity is kept below 100 NTU at 16°Brix, and the product contains less than 50 mg/kg of total sulfur dioxide, aligning with industry standards for safety and quality.":
    "RED-800 tiene 64-66 °Brix a 20 °C y una acidez total de 1.0-2.1 % en peso, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 800-900. La turbidez es inferior a 100 NTU a 16°Brix y el dióxido de azufre total, inferior a 50 mg/kg.",
  "RED-800 undergoes stringent microbiological testing to ensure purity. Yeast, mold, and total plate counts (TPC) remain under 10 UFC/g, with no detectable coliforms or thermo acidophilic bacteria (TAB). This strict quality control ensures that RED-800 is safe, stable, and free from harmful microorganisms, making it ideal for use in high-standard food and beverage products.":
    "RED-800 se somete a estrictos análisis microbiológicos. Levaduras, mohos y recuento total en placa (TPC) se mantienen por debajo de 10 UFC/g, sin coliformes ni bacterias termoacidófilas (TAB) detectables.",
  "Cabernet Sauvignon Product Overview": "Cabernet Sauvignon: descripción del producto",
  "Cabernet Sauvignon is a premium, 100% natural red grape juice concentrate made from healthy, hand-selected grapes. This viscous liquid retains the essence of unfermented fresh grape juice and is produced without any added flavorings, colorings, or preservatives. Using advanced evaporator technology, the water is carefully removed to deliver a pure and concentrated product ideal for various food and beverage applications.":
    "Cabernet Sauvignon es un concentrado de zumo de uva tinta 100% natural elaborado con uvas sanas seleccionadas a mano. Este líquido viscoso conserva las características del zumo de uva fresco sin fermentar y no contiene aromas, colorantes ni conservantes añadidos. El agua se elimina mediante evaporadores de última tecnología.",
  "Technical Specifications and Composition": "Especificaciones técnicas y composición",
  "This Cabernet Sauvignon concentrate features a Brix level of 67-69 at 20 °C and a total acidity of 1.0-2.1% tartaric acid by weight. The pH level ranges from 2.8 to 3.8, with a color intensity of 400-800 at 520 nm, ensuring vibrant color and high quality. The turbidity is kept under 100 NTU at 16°Brix, while the total sulfur dioxide content is less than 10 mg/kg, ensuring a product that meets stringent quality standards.":
    "Este concentrado Cabernet Sauvignon tiene 67-69 °Brix a 20 °C y una acidez total de 1.0-2.1 % en peso, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 400-800. La turbidez es inferior a 100 NTU a 16°Brix y el dióxido de azufre total, inferior a 10 mg/kg.",
  "To ensure the highest level of purity and safety, this Cabernet Sauvignon concentrate undergoes rigorous microbiological testing. Yeast, mold, and total plate counts (TPC) are consistently kept below 10 UFC/g, and the product is free from coliforms and thermo acidophilic bacteria (TAB). These strict quality controls ensure that the product remains safe and stable, suitable for a wide range of food and beverage formulations.":
    "Este concentrado Cabernet Sauvignon se somete a rigurosos análisis microbiológicos. Levaduras, mohos y recuento total en placa (TPC) se mantienen por debajo de 10 UFC/g, y el producto está libre de coliformes y de bacterias termoacidófilas (TAB).",
  "RED-1000 Product Overview": "RED-1000: descripción del producto",
  "RED-1000 is a premium, 100% natural red grape extract derived from healthy, carefully selected grapes. This product offers a vibrant, viscous red liquid without any added flavorings, colorings, or additives, ensuring a pure and natural experience. It is meticulously crafted to maintain the essence of fresh grapes, offering rich color and flavor suitable for various food and beverage applications.":
    "RED-1000 es un extracto de uva tinta 100% natural obtenido de uvas sanas cuidadosamente seleccionadas. Es un líquido rojo viscoso de color intenso, sin aromas, colorantes ni aditivos añadidos, adecuado para distintas aplicaciones en alimentos y bebidas.",
  "RED-1000 features a Brix level of 67-68 at 20 °C and a total acidity of 1.0-2.1% tartaric acid by weight. With a pH ranging from 2.8 to 3.8 and a color intensity between 1000-1100 (measured at 520 nm), the product boasts outstanding quality. Additionally, its turbidity is kept under 100 NTU at 16°Brix, and it contains less than 10 mg/kg of total sulfur dioxide, adhering to strict quality control standards.":
    "RED-1000 tiene 67-68 °Brix a 20 °C y una acidez total de 1.0-2.1 % en peso, expresada como ácido tartárico. Su pH está entre 2.8 y 3.8 y la intensidad de color, medida a 520 nm, entre 1000-1100. La turbidez es inferior a 100 NTU a 16°Brix y el dióxido de azufre total, inferior a 10 mg/kg.",
  "To ensure safety and purity, RED-1000 undergoes thorough microbiological testing. It consistently shows low yeast and mold counts, with less than 10 UFC/g, and total plate counts (TPC) are maintained at below 10 UFC/g. The product is free from coliform bacteria and thermo acidophilic bacteria (TAB), guaranteeing a microbiologically safe and stable product for consumers.":
    "RED-1000 se somete a análisis microbiológicos completos: levaduras y mohos por debajo de 10 UFC/g y recuento total en placa (TPC) por debajo de 10 UFC/g. El producto está libre de coliformes y de bacterias termoacidófilas (TAB).",
  "TINTORERA R-4000 Product Overview": "TINTORERA R-4000: descripción del producto",
  "TINTORERA R-4000 is a highly concentrated, 100% natural red grape juice extract made from carefully selected, healthy grapes. This viscous red liquid is free of any additives, flavorings, or colorings, preserving the authentic essence of unfermented fresh grape juice. The water is removed using the latest evaporator technology, creating a high-quality product ideal for use in a range of food and beverage applications.":
    "TINTORERA R-4000 es un extracto de zumo de uva tinta 100% natural y muy concentrado, elaborado con uvas sanas cuidadosamente seleccionadas. Es un líquido rojo viscoso sin aditivos, aromas ni colorantes, que conserva las características del zumo de uva fresco sin fermentar. El agua se elimina mediante evaporadores de última tecnología.",
  "Composition and Technical Specifications": "Composición y especificaciones técnicas",
  "TINTORERA R-4000 boasts a Brix level of 64-66 at 20 °C, with total acidity ranging from 1.8-3.3% tartaric acid. Its pH level is maintained between 2.8 and 3.5, and its intense color measures between 4000-4200 at 520 nm, offering a deep, vibrant hue. The product's turbidity is kept under 300 NTU at 16°Brix, and total sulfur dioxide levels are below 10 mg/kg, ensuring a pure, high-quality product.":
    "TINTORERA R-4000 tiene 64-66 °Brix a 20 °C y una acidez total de 1.8-3.3 %, expresada como ácido tartárico. Su pH está entre 2.8 y 3.5 y la intensidad de color, medida a 520 nm, entre 4000-4200. La turbidez es inferior a 300 NTU a 16°Brix y el dióxido de azufre total, inferior a 10 mg/kg.",
  "TINTORERA R-4000 undergoes rigorous microbiological testing to ensure it meets the highest safety standards. Yeast, mold, and total plate counts (TPC) are maintained at less than 10 UFC/g, with no presence of coliforms or thermo acidophilic bacteria (TAB). These thorough quality controls ensure that the product is both safe and stable for use in a variety of high-standard food and beverage formulations.":
    "TINTORERA R-4000 se somete a rigurosos análisis microbiológicos. Levaduras, mohos y recuento total en placa (TPC) se mantienen por debajo de 10 UFC/g, sin presencia de coliformes ni bacterias termoacidófilas (TAB).",

  // ---------- IQF: shared fact labels ----------
  "Storage Conditions": "Conservación",
  Frozen: "Congelado",
  Presentation: "Presentación",
  "Additional Notes": "Notas adicionales",
  Applications: "Aplicaciones",
  Instructions: "Instrucciones",
  Directions: "Modo de empleo",
  Ingredients: "Ingredientes",
  "Ready to use.": "Listo para usar.",
  "Vitamin A & Vitamin C": "Vitamina A y vitamina C",
  "Vitamin C, vitamin A, Others.": "Vitamina C, vitamina A y otras.",
  "Vitamin A and Vitamin C, and others": "Vitamina A, vitamina C y otras",
  "Vitamin C, Vitamin A, Minerals": "Vitamina C, vitamina A y minerales",
  "Vitamins and Minerals.": "Vitaminas y minerales.",
  "Vitamins and minerals": "Vitaminas y minerales",
  "Vitamin C, Potassium": "Vitamina C y potasio",
  "Potassium and Vitamin C": "Potasio y vitamina C",
  "Drinks, cocktails, desserts": "Bebidas, cócteles y postres",
  "Drinks, cocktails, desserts.": "Bebidas, cócteles y postres.",
  "Drinks, cocktails, desserts, among others": "Bebidas, cócteles y postres, entre otros",
  Processing: "Proceso",
  Packing: "Envasado",

  // ---------- IQF lemon ----------
  "IQF lemon slices are complete cuts and divisions of the fruit, guaranteeing complete circular circumferences, in it you will be able to identify the peel, the seeds and the pulp of the fruit. These slices are frozen with the highest standards to preserve their characteristics and keep their freshness for a long time.":
    "Las rodajas de limón IQF son cortes completos de la fruta, de contorno circular, en los que se distinguen la piel, las semillas y la pulpa. Se congelan para conservar sus características y su frescura durante mucho tiempo.",
  "The lemon has been identified as a citrus with an acid flavour, providing a yellow colouration throughout the fruit, making it unique.":
    "El limón es un cítrico de sabor ácido y color amarillo en toda la fruta.",
  "Lemon slices from 6 millimetres to 9 millimetres": "Rodajas de limón de 6 a 9 milímetros",
  "Sauces, cocktails, desserts, dressings, among others": "Salsas, cócteles, postres y aliños, entre otros",
  "The Uses of Lemon Slices": "Usos de las rodajas de limón",
  "Lemon slices have many food uses, and all because of its characteristic flavor (acid) that makes it a pleasant fruit, for all ages, with lemon slices, sauces, accompaniments, desserts, cakes, cocktails and a variety of recipes are made. that require adding citrus flavors in their splendor.":
    "Por su sabor ácido característico, las rodajas de limón tienen muchos usos alimentarios: salsas, guarniciones, postres, tartas, cócteles y recetas que necesitan un sabor cítrico.",
  "We offer lemon slices as an excellent option to be used as decorations and to make various drinks, for desserts, among others.":
    "Las rodajas de limón son adecuadas para decorar y para elaborar bebidas y postres, entre otros usos.",
  "IQF Lemon Half Slice is a slice cut from the lemon and followed by one cut in half, providing an additional presentation to that of the full slices, being an acid citrus fruit, it provides support for those recipes and dishes that require that acid touch.":
    "La media rodaja de limón IQF es una rodaja de limón cortada por la mitad, una presentación adicional a la rodaja entera para recetas y platos que necesitan un toque ácido.",
  "Half Slice of Lemon": "Media rodaja de limón",
  "The Uses of Halved Lemon Slices": "Usos de las medias rodajas de limón",
  "Lemon slices cut in half give us the option of giving a unique touch to recipes and prepared drinks, apart from giving them that unique flavour and aroma of lemons. Being frozen, we guarantee that they are kept in the freshest possible states.":
    "Las medias rodajas de limón aportan un toque propio a recetas y bebidas preparadas, además del sabor y el aroma del limón. Al estar congeladas, conservan su frescura.",
  "This type of cut in the lemon is special, since it is cut vertically in half lengthwise, then the lemon is rotated 90 degrees and another cut is made downwards to obtain 4 equal parts, providing 4 parts of a lemon of the same size. The 1/4 lemon cut, like our other cuts, is ideal for many pastry recipes, home cooking, drinks, cocktails and sweets. Cuts like 1/4 give us different options to flavor or present the different recipes that the food industry makes.":
    "El limón se corta verticalmente por la mitad a lo largo; después se gira 90 grados y se hace otro corte hacia abajo para obtener 4 partes iguales. El corte 1/4, como nuestros otros cortes, es adecuado para repostería, cocina, bebidas, cócteles y dulces, y ofrece distintas opciones para aromatizar o presentar las recetas de la industria alimentaria.",
  "Lemon IQF 1/4 cut": "Limón IQF corte 1/4",
  "Pastry recipes, cooking, cocktails": "Repostería, cocina y cócteles",
  "The Uses of Lemon 1/4 Cut": "Usos del limón corte 1/4",
  "The lemon cuts in 1/4, give us the opportunity to give it different uses and gives us the opportunity to create the most innovative recipes that are used in dishes, desserts, preserves, cocktails, sweets, among others. This type of cut is so special that it can be used both to make decorations and to give that acid flavor, which enhances the flavors of the dishes.":
    "El limón en corte 1/4 tiene muchos usos en platos, postres, conservas, cócteles y dulces, entre otros. Sirve tanto para decorar como para aportar un sabor ácido que realza los platos.",
  "The finest lemon cut we offer is 1/8, these are fine cuts of lemon quarters in half, obtaining 8 complete equal lemon segments.":
    "El corte más fino que ofrecemos es el 1/8: cada cuarto de limón se corta por la mitad para obtener 8 gajos iguales.",
  "Being the finest cut of all, they are unique when added to cold drinks such as iced water or in types of iced tea, or can be used as a garnish for seafood or other dishes.":
    "Por ser el corte más fino, son adecuados para bebidas frías como agua o té helado, o como guarnición de marisco y otros platos.",
  "The cut lemon segments are always delivered frozen, ensuring that they can be stored in the refrigerator for several days without losing their properties.":
    "Los gajos de limón se suministran siempre congelados y pueden conservarse en el frigorífico varios días sin perder sus propiedades.",
  "IQF Lemon 1/8 Cut": "Limón IQF corte 1/8",
  "To flavor batters, doughs, marinades, sauces.": "Para aromatizar rebozados, masas, marinados y salsas.",
  "The Uses of Lemon 1/8 Cut": "Usos del limón corte 1/8",
  "At GFB, lemon cuts in 1/8 are the smallest cuts that we offer to the food industry, we recommend them to add to drinks, or to be used as a complement to other foods. Its small size gives it the versatility to be used in almost all kinds of dishes or recipes that require very small details, the 1/8 cut can provide that decoration or that flavor that stands out in those drinks and in those desserts that require small pieces. of lemon.":
    "El corte 1/8 es el más pequeño que GFB ofrece a la industria alimentaria; se recomienda para bebidas o como complemento de otros alimentos. Su tamaño lo hace versátil para platos y recetas que requieren detalles pequeños, como decoración o para aportar sabor a bebidas y postres.",
  "Lemon sticks are fine cuts made with lemon in such a way that they are rectangular, with this type of product we provide unique textures for the preparation of all kinds of preserves, dessert recipes, sweets and flavors. These sticks are properly cut to 13 mm long x 13 mm wide for easy handling and so they can be used in almost all types of recipes.":
    "Los bastones de limón son cortes finos de forma rectangular que aportan textura a conservas, postres, dulces y aromatizantes. Se cortan a 13 mm de largo × 13 mm de ancho para facilitar su manipulación y su uso en casi cualquier receta.",
  "lemon sticks of 13 millimeters x 13 millimeters": "bastones de limón de 13 × 13 milímetros",
  "To flavor, sauces, make preserves, sweets, among others.":
    "Para aromatizar, salsas, conservas y dulces, entre otros.",
  "The Uses of Lemon Sticks": "Usos de los bastones de limón",
  "Lemon sticks, like our other cuts, are specially made with the highest quality standards, preserving their characteristics when frozen. Lemon sticks allow us to give versatility to the food industry, on certain occasions we do not require conventional slices or cuts, that is why we offer this type of presentation which we are sure you can use in different recipes such as making preserves, jams, lemon candy, among others.":
    "Los bastones de limón, como nuestros otros cortes, se elaboran con altos estándares de calidad y conservan sus características al congelarse. Son una alternativa a las rodajas y cortes convencionales para conservas, mermeladas y caramelos de limón, entre otros.",
  "We recommend frozen lemon sticks if you want to make different types of dishes that are not conventional.":
    "Los bastones de limón congelados son adecuados para elaboraciones poco convencionales.",
  "At GFB we distribute finely grated lemon rind without the pith, a characteristic that highlights the quality of our products in terms of flavor and aroma.":
    "GFB distribuye corteza de limón finamente rallada sin albedo, lo que preserva su sabor y aroma.",
  "The lemon zest comes from the peel, which carries the essential oils of the fruit and this, as an important factor, allows it to give a strong flavor as an ingredient to different dishes and recipes.":
    "La ralladura procede de la piel, que contiene los aceites esenciales de la fruta, por lo que aporta un sabor intenso como ingrediente.",
  "lemon zest": "ralladura de limón",
  "It can be used to flavor desserts, marinades, sauces, pastries.":
    "Para aromatizar postres, marinados, salsas y repostería.",
  "The Uses of Frozen Lemon Zest": "Usos de la ralladura de limón congelada",
  "Lemon zest is undoubtedly used in many recipes, we can evidence its use in sweet recipes and in savory recipes, lemon zest gives it the extra touch that every dish requires to be unique. Lemon zest can be used in different preparations, baking recipes, sauces, marinades, and salad dressings. In addition to zest, they also work to decorate all kinds of cakes, pies, and cocktails.":
    "La ralladura de limón se utiliza en muchas recetas dulces y saladas: repostería, salsas, marinados y aliños. También sirve para decorar tartas, pasteles y cócteles.",
  "Lemon zest is the result of grating the peel of a lemon. But it is so carefully grated that it maintains all the characteristics of the lemon peel.":
    "La ralladura de limón se obtiene rallando cuidadosamente la piel del limón, de modo que conserva sus características.",
  "At GFB we distribute finely grated lemon rind without the pith, unlike the common lemon zest, the block lemon zest is delivered in block form, a variety of the product to achieve better handling and logistics within the supply chain. Catering. Like all our products, this lemon zest has the quality of flavour and aroma, preserving the freshness of the fruit.":
    "GFB distribuye corteza de limón finamente rallada sin albedo. A diferencia de la ralladura suelta, la ralladura en bloque se suministra en bloque para facilitar la manipulación y la logística en la cadena de suministro y la restauración. Conserva el sabor, el aroma y la frescura de la fruta.",
  "The lemon zest comes from the peel, which carries the essential oils of the fruit and this, as an important factor, allows it to give a strong flavour as an ingredient to different dishes and recipes.":
    "La ralladura procede de la piel, que contiene los aceites esenciales de la fruta, por lo que aporta un sabor intenso como ingrediente.",
  "Block lemon zest": "Ralladura de limón en bloque",
  "It can be used to flavour desserts, marinades, sauces, pastries.":
    "Para aromatizar postres, marinados, salsas y repostería.",
  "The Uses of Frozen Block Zest": "Usos de la ralladura congelada en bloque",
  "Block lemon zest is also used to flavor many recipes for desserts and savory dishes, unlike the conventional one, it is dried in block form and allows you to have it at any time, maintaining all its aroma and flavor, the ease You will have it when you need to season your recipes and dishes with lemon zest, having a ready-to-use product.":
    "La ralladura de limón en bloque se utiliza para aromatizar postres y platos salados. Al presentarse en bloque, está disponible en cualquier momento, conserva su aroma y su sabor y está lista para usar.",
  "Block lemon zest is prepared under the highest quality standards, guaranteeing a product of high quality and high freshness, this reference guarantees the due process to deliver the best product to the final consumer.":
    "La ralladura de limón en bloque se elabora con altos estándares de calidad para ofrecer un producto fresco.",
  "Lemon peel.": "Piel de limón.",
  "Perfect for pastries and restaurants.": "Adecuada para repostería y restauración.",
  "The Uses of Lemon Peel Shells": "Usos de las cáscaras de limón",
  "Lemon peel rind is perfect for all kinds of recipes, desserts, sweets and dishes, providing a variety of dishes of the highest quality due to its presentation and flavor. The unique touch of lemon peel in our recipes can give you the option of having the best dishes, you will get a flavor and aroma unique to that of lemon peel. Being frozen, we guarantee that they are kept in the freshest possible states. Carefully chosen so that the final consumer always feels the freshness of the lemon.":
    "La cáscara de limón es adecuada para todo tipo de recetas, postres, dulces y platos por su presentación y su sabor, y aporta el aroma propio de la piel de limón. Al estar congelada, conserva su frescura.",
  "The lemon peel in squares is another of our special references that we offer at GFB, we deliver the lemon peels in the form of squares without losing the characteristics of the fruit. We distribute a reference, which is properly and carefully made, in which we manage to deliver a totally different and versatile product in the food market. Always providing the highest quality standards and the freshness of the fruit.":
    "La piel de limón en cuadrados es otra referencia de GFB: la piel se corta en cuadrados sin perder las características de la fruta, un producto versátil para la industria alimentaria.",
  "Lemon peel in squares.": "Piel de limón en cuadrados.",
  "The Uses of Lemon Peel Square": "Usos de la piel de limón en cuadrados",
  "Lemon peels in squares give us the opportunity to give them different uses and give us the opportunity to create the most innovative recipes that are used in dishes, desserts, preserves, sweets, among others. This type of shell is a unique reference that can be used both to make decorations and to give that bitter taste, and that aroma that enhances the flavors of the dishes.":
    "La piel de limón en cuadrados tiene muchos usos en platos, postres, conservas y dulces, entre otros. Sirve tanto para decorar como para aportar un toque amargo y un aroma que realzan los platos.",

  // ---------- IQF orange ----------
  "Orange Slice is a full slice cut across the orange.":
    "La rodaja de naranja es una rodaja entera cortada transversalmente.",
  "Orange Slice": "Rodaja de naranja",
  "Sliced Orange rounds make gorgeous toppings on tarts and cakes, and Orange and lime wedges are indispensable in the kitchen for garnishing and seasoning.":
    "Las rodajas de naranja son una buena cobertura para tartas y pasteles, y los gajos de naranja y de lima son básicos en cocina para decorar y condimentar.",
  "Orange Half Slice is a slice cut across the orange and then cut in half.":
    "La media rodaja de naranja es una rodaja cortada transversalmente y después por la mitad.",
  "Orange Half Slice": "Media rodaja de naranja",
  "The Orange is cut vertically in half lengthwise, then the Orange is rotated 90 degrees and another cut is made downwards to obtain 4 equal parts. In this way, a 1/4 Orange cut is obtained, ideal for all kinds of pastry recipes, cooking, cocktails.":
    "La naranja se corta verticalmente por la mitad a lo largo; después se gira 90 grados y se hace otro corte hacia abajo para obtener 4 partes iguales. Así se obtiene el corte 1/4, adecuado para repostería, cocina y cócteles.",
  "IQF Orange 1/4 cut": "Naranja IQF corte 1/4",
  "Fine cuts made to the Orange quarters in half to have 8 complete Orange segments.":
    "Cortes finos: cada cuarto de naranja se corta por la mitad para obtener 8 gajos completos.",
  "These Orange wedges can be added to cold drinks like iced water or iced tea, or used as a garnish for seafood or other dishes.":
    "Estos gajos de naranja pueden añadirse a bebidas frías como agua o té helado, o usarse como guarnición de marisco y otros platos.",
  "Cut Orange wedges can be stored in the fridge for several days to be used when needed.":
    "Los gajos de naranja pueden conservarse en el frigorífico varios días para usarlos cuando se necesiten.",
  "IQF Orange 1/8 Cut": "Naranja IQF corte 1/8",
  "For flavoring batters, doughs, marinades, sauces.": "Para aromatizar rebozados, masas, marinados y salsas.",
  "This fruit combines perfectly with finer flavors for the palate, such as Gin. In cocktails in general, its use is the most common of all, since it is the quintessential acid ingredient.":
    "Combina bien con sabores delicados como la ginebra y es un ingrediente ácido habitual en coctelería.",
  "Fine cuts made of Orange in the form of sticks, giving unique textures for the production of all kinds of preserves, and recipes for desserts, sweets, and flavors. These are duly cut to 13 mm long x 13 mm wide for better handling.":
    "Cortes finos de naranja en forma de bastón que aportan textura a conservas, postres, dulces y aromatizantes. Se cortan a 13 mm de largo × 13 mm de ancho para facilitar su manipulación.",
  "Orange sticks": "Bastones de naranja",
  "For flavour, sauces, preserves, sweets.": "Para aromatizar, salsas, conservas y dulces.",
  "Homemade flavoring": "Aromatizantes",
  "Orange sticks are ideal for making those homemade flavorings, which have endless uses.":
    "Los bastones de naranja son adecuados para elaborar aromatizantes de múltiples usos.",
  Snack: "Snacks",
  "Orange sticks are excellent for creating snacks and sweets.":
    "Los bastones de naranja son adecuados para elaborar snacks y dulces.",
  "Orange Julienne cut, is a French cooking term for thin strips. The strips are usually about 3 inches long and 1/16- to 1/8-inch thick. Made by a culinary knife cut in which the orange peel is cut into long thin strips, similar to matchsticks.":
    "El corte en juliana, término culinario francés, consiste en tiras finas. Las tiras suelen medir unas 3 pulgadas de largo y entre 1/16 y 1/8 de pulgada de grosor: la piel de naranja se corta en tiras largas y finas, similares a cerillas.",
  "Orange Julienne": "Juliana de naranja",
  "A quick, simple way to add zest, literally and figuratively, to such fall dishes as roast duck, stews and casseroles is by adding julienne of orange rind - also known as orange zest. Zests also can be candied by cooking them briefly in white-sugar syrup.":
    "La juliana de corteza de naranja es una forma rápida de aportar sabor a platos como el pato asado, los guisos y las cazuelas. También puede confitarse cociéndola brevemente en almíbar.",
  "Finely grated Orange rind without the pith.": "Corteza de naranja finamente rallada sin albedo.",
  "The rind carries the essential oils of the fruit and gives strong flavor as an ingredient. Significant labor savings, especially in large scale production.":
    "La corteza contiene los aceites esenciales de la fruta y aporta un sabor intenso como ingrediente. Supone un ahorro de mano de obra importante, sobre todo en producciones a gran escala.",
  "Orange zest": "Ralladura de naranja",
  "Many recipes — both sweet and savory — will call for Orange zest when a dish just needs that extra zing. Grated Orange zest is commonly used in baking, sauces, marinades, and salad dressings. Larger zest pieces work well for garnish on cakes, pies, and most famously on cocktails like a classic Orange drop martini.":
    "Muchas recetas dulces y saladas incluyen ralladura de naranja para dar un toque de sabor. Se utiliza en repostería, salsas, marinados y aliños; los trozos más grandes sirven para decorar tartas, pasteles y cócteles.",
  'Orange zest comes from the peel of a Orange, but it does not include the inner layer of the peel known as the albedo. This inner layer contains the "pith," or the soft, white, substance that has a naturally bitter taste.':
    "La ralladura de naranja procede de la piel, pero no incluye la capa interior llamada albedo, la parte blanca y blanda de sabor amargo.",
  "Zest is most commonly grated, but so long as you're only removing the outermost layer of the peel, you can also use zest in large pieces, thin strips, or even curled pieces for garnish.":
    "La ralladura suele presentarse rallada, pero si solo se retira la capa exterior de la piel también puede usarse en trozos, tiras finas o rizos para decorar.",
  "Oranges are harvested by hand and delivered fresh to the factory, each load is quality assurance sampled for foreign material and physical defects. The Orange peel is washed, milled, inspected and frozen to -18 °C or below.":
    "Las naranjas se recolectan a mano y llegan frescas a la fábrica; en cada carga se toman muestras para detectar materias extrañas y defectos físicos. La piel se lava, se muele, se inspecciona y se congela a -18 °C o menos.",
  "During packing the Orange zest are inspected before weighing and filling into lined cartons. The cartons are check weighed, palletised and stretch-wrapped before being returned to store at -23 °C to await despatch, at -18 °C.":
    "Durante el envasado, la ralladura se inspecciona antes de pesarla y llenar cajas de cartón con bolsa interior. Las cajas se pesan, se paletizan y se enfilman antes de almacenarlas a -23 °C hasta su expedición, a -18 °C.",
  "Block Orange zest": "Ralladura de naranja en bloque",
  "Orange zest is used to flavour many recipes for desserts and savoury dishes, and drying it ensures you can have it at any time with all its aroma and flavour, to season your preparations with Orange without having to wash and grate Oranges every time.":
    "La ralladura de naranja se utiliza para aromatizar postres y platos salados; en bloque está disponible en cualquier momento con todo su aroma y su sabor, sin necesidad de lavar y rallar naranjas.",
  "The product is prepared from fresh sound raw material that is free from all toxic residues and taints and shall comply with all current Food Legislation. Frozen Block Orange Zest is intended to be used as ingredient that is further processed and heat-treated before final consumption.":
    "El producto se elabora con materia prima fresca y sana, libre de residuos tóxicos y contaminantes, conforme a la legislación alimentaria vigente. La ralladura de naranja congelada en bloque está destinada a usarse como ingrediente que se procesa y se trata térmicamente antes del consumo final.",
  "Orange Peel Shells": "Cáscaras de naranja",
  "Perfects for pastry-makingand restaurants.": "Adecuadas para repostería y restauración.",
  "Frozen or dehydrated peels of citrus fruit ideal for industrial solutions.":
    "Pieles de cítricos congeladas o deshidratadas para uso industrial.",
  "All the taste that your products deserved. Provide with authentics flavours using our Peel products.":
    "Nuestros productos de piel aportan sabores cítricos auténticos a sus elaboraciones.",
  "Orange Peel Squares": "Piel de naranja en cuadrados",

  // ---------- IQF lime ----------
  "Lime Slice is a slice cut from the lime fruit, a very sharp, acidic citrus fruit with a bitter but zingy flavour.":
    "La rodaja de lima es una rodaja cortada de la lima, un cítrico muy ácido de sabor amargo e intenso.",
  "Lime Slice": "Rodaja de lima",
  "Sliced lime rounds make gorgeous toppings on tarts and cakes, and lemon and lime wedges are indispensable in the kitchen for garnishing and seasoning.":
    "Las rodajas de lima son una buena cobertura para tartas y pasteles, y los gajos de limón y de lima son básicos en cocina para decorar y condimentar.",
  "Lime Half Slice is a slice cut from the lime fruit and additionally cut in half, a very strong acidic citrus fruit with a bitter but pungent taste.":
    "La media rodaja de lima es una rodaja de lima cortada por la mitad; la lima es un cítrico muy ácido de sabor amargo e intenso.",
  "Lime Half Slice": "Media rodaja de lima",
  "The lime is cut vertically in half lengthwise, then the lime is rotated 90 degrees and another cut is made downwards to obtain 4 equal parts. In this way, a 1/4 lime cut is obtained, ideal for all kinds of pastry recipes, cooking, cocktails.":
    "La lima se corta verticalmente por la mitad a lo largo; después se gira 90 grados y se hace otro corte hacia abajo para obtener 4 partes iguales. Así se obtiene el corte 1/4, adecuado para repostería, cocina y cócteles.",
  "IQF Lime 1/4 cut": "Lima IQF corte 1/4",
  "Fine cuts made the lime quarters in half to have 8 complete lime segments.":
    "Cortes finos: cada cuarto de lima se corta por la mitad para obtener 8 gajos completos.",
  "These lime wedges can be added to cold drinks like iced water or iced tea, or used as a garnish for seafood or other dishes.":
    "Estos gajos de lima pueden añadirse a bebidas frías como agua o té helado, o usarse como guarnición de marisco y otros platos.",
  "Cut lime wedges can be stored in the fridge for several days to be used when needed.":
    "Los gajos de lima pueden conservarse en el frigorífico varios días para usarlos cuando se necesiten.",
  "IQF Lime 1/8 Cut": "Lima IQF corte 1/8",
  "Fine cuts made of lime in the form of sticks, giving unique textures for the production of all kinds of preserves, and recipes for desserts, sweets, and flavors. These are duly cut to 13 mm long x 13 mm wide for better handling.":
    "Cortes finos de lima en forma de bastón que aportan textura a conservas, postres, dulces y aromatizantes. Se cortan a 13 mm de largo × 13 mm de ancho para facilitar su manipulación.",
  "Lime sticks": "Bastones de lima",
  "Lime sticks are ideal for making those homemade flavorings, which have endless uses.":
    "Los bastones de lima son adecuados para elaborar aromatizantes de múltiples usos.",
  "Lime sticks are excellent for creating snacks and sweets.":
    "Los bastones de lima son adecuados para elaborar snacks y dulces.",
  "Finely grated lime rind without the pith.": "Corteza de lima finamente rallada sin albedo.",
  "Lime zest": "Ralladura de lima",
  "Many recipes — both sweet and savory — will call for lime zest when a dish just needs that extra zing. Grated lime zest is commonly used in baking, sauces, marinades, and salad dressings. Larger zest pieces work well for garnish on cakes, pies, and most famously on cocktails like a classic lime drop martini.":
    "Muchas recetas dulces y saladas incluyen ralladura de lima para dar un toque de sabor. Se utiliza en repostería, salsas, marinados y aliños; los trozos más grandes sirven para decorar tartas, pasteles y cócteles.",
  'Lime zest comes from the peel of a lime, but it does not include the inner layer of the peel known as the albedo. This inner layer contains the "pith," or the soft, white, substance that has a naturally bitter taste.':
    "La ralladura de lima procede de la piel, pero no incluye la capa interior llamada albedo, la parte blanca y blanda de sabor amargo.",
  "Limes are harvested by hand and delivered fresh to the factory, each load is quality assurance sampled for foreign material and physical defects. The lime peel is washed, milled, inspected and frozen to -18 °C or below.":
    "Las limas se recolectan a mano y llegan frescas a la fábrica; en cada carga se toman muestras para detectar materias extrañas y defectos físicos. La piel se lava, se muele, se inspecciona y se congela a -18 °C o menos.",
  "During packing the lime zest are inspected before weighing and filling into lined cartons. The cartons are check weighed, palletised and stretch-wrapped before being returned to store at -23 °C to await despatch, at -18 °C.":
    "Durante el envasado, la ralladura se inspecciona antes de pesarla y llenar cajas de cartón con bolsa interior. Las cajas se pesan, se paletizan y se enfilman antes de almacenarlas a -23 °C hasta su expedición, a -18 °C.",

  // ---------- IQF grapefruit ----------
  "IQF Grapefruit slices are complete cuts and divisions of the fruit, guaranteeing circumferences of a complete circular shape, in it you will be able to identify the peel, the seeds and the pulp of the fruit. These slices are frozen to preserve their characteristics and preserve their freshness.":
    "Las rodajas de pomelo IQF son cortes completos de la fruta, de contorno circular, en los que se distinguen la piel, las semillas y la pulpa. Se congelan para conservar sus características y su frescura.",
  "The grapefruit is identified as a citrus fruit characterized by acid, sweet and bitter flavours, its reddish colouration in its pulp.":
    "El pomelo es un cítrico de sabor ácido, dulce y amargo, con pulpa de color rojizo.",
  "Grapefruit slices from 6 millimeters to 9 millimeters": "Rodajas de pomelo de 6 a 9 milímetros",
  "The Uses of Grapefruit Slices": "Usos de las rodajas de pomelo",
  "Grapefruit slices have many uses in the food industry, these slices can be used for desserts, pastries, cocktails and a variety of recipes that require adding citrus, sweet and bitter flavours simultaneously.":
    "Las rodajas de pomelo tienen muchos usos en la industria alimentaria: postres, repostería, cócteles y recetas que combinan sabores cítricos, dulces y amargos.",
  "On the other hand, grapefruit slices are an excellent option to be used to make pastry toppings, make those decorations in recipes and finally season those recipes that require the characteristics of sliced grapefruit.":
    "También son adecuadas como cobertura en repostería, para decorar y para condimentar recetas que requieren pomelo en rodajas.",
  "Grapefruit Half Slice is a slice cut initially and also after this procedure it is cut in half, giving the grapefruit a change in shape. This gives this fruit versatility for various presentations in recipes that require that sweet, sour and bitter flavor at the same time.":
    "La media rodaja de pomelo es una rodaja cortada después por la mitad, una presentación versátil para recetas que buscan a la vez un sabor dulce, ácido y amargo.",
  "Slice of half a grapefruit from 6 millimeters to 9 millimeters": "Media rodaja de pomelo de 6 a 9 milímetros",
  "The Uses of Halved Grapefruit Slices": "Usos de las medias rodajas de pomelo",
  "Grapefruit slices cut in half, as well as full slices, have many uses in the food industry, this type of slices will possibly be more adaptable for certain types of desserts that need more detail, in the decoration of cocktails that require a more detailed version. small slice of grapefruit and will clearly be ideal for a variety of recipes that call for adding citrus, sweet and sour flavors simultaneously.":
    "Las medias rodajas de pomelo, como las rodajas enteras, tienen muchos usos en la industria alimentaria; se adaptan mejor a postres que requieren más detalle y a la decoración de cócteles, y a recetas que combinan sabores cítricos, dulces y ácidos.",
  "This type of grapefruit slices are an excellent option to be used to make those decorations in cocktails that add the color and flavors of grapefruit to these drinks.":
    "Son adecuadas para decorar cócteles y aportarles el color y el sabor del pomelo.",
  "This type of cut in the grapefruit is cut vertically in half lengthwise, then the grapefruit is rotated 90 degrees and another cut is made downwards to obtain 4 equal parts, giving the grapefruit a characteristic and unique shape. It is presented as the 1/4 Grapefruit cut, like our other cuts, it is ideal for all kinds of pastry, kitchen, cocktail recipes. Cuts such as 1/4 give us the versatility for the kitchen and for the different recipes that the food industry requires.":
    "El pomelo se corta verticalmente por la mitad a lo largo; después se gira 90 grados y se hace otro corte hacia abajo para obtener 4 partes iguales. El corte 1/4, como nuestros otros cortes, es adecuado para repostería, cocina y cócteles, y ofrece versatilidad para las recetas de la industria alimentaria.",
  "IQF grapefruit 1/4 cut": "Pomelo IQF corte 1/4",
  "The Uses of Grapefruit 1/4 Cut": "Usos del pomelo corte 1/4",
  "Grapefruit cuts in 1/4, give us the opportunity to give versatility to the grapefruit around the use that we can give it in the different recipes that are used in dishes, desserts, sweets, preserves, cocktails, among others. This type of cut can be used both to make decorations and to give that sour, sweet and bitter flavour to those dishes that so much need to highlight these flavours.":
    "El pomelo en corte 1/4 es versátil en platos, postres, dulces, conservas y cócteles, entre otros. Sirve tanto para decorar como para aportar un sabor ácido, dulce y amargo.",
  "The finest grapefruit cut of all is the 1/8, these are fine cuts of Grapefruit quarters in half to have 8 full Grapefruit segments.":
    "El corte más fino es el 1/8: cada cuarto de pomelo se corta por la mitad para obtener 8 gajos completos.",
  "As they are the finest cuts of all, they are essential to be added to cold drinks such as iced water or iced tea, or can be used as a garnish for seafood or other dishes.":
    "Por ser el corte más fino, son adecuados para bebidas frías como agua o té helado, o como guarnición de marisco y otros platos.",
  "Cut grapefruit segments can be delivered frozen and can be stored in the refrigerator for several days for use when needed.":
    "Los gajos de pomelo se suministran congelados y pueden conservarse en el frigorífico varios días para usarlos cuando se necesiten.",
  "IQF Grapefruit 1/8 Cut": "Pomelo IQF corte 1/8",
  "The Uses of Grapefruit 1/8 Cut": "Usos del pomelo corte 1/8",
  "Grapefruit cuts in 1/8 are the smallest cuts that we deliver to the food industry, ideal for adding to drinks, or as a complement to other foods. Its size gives the versatility for that type of dishes or recipes that require very small details, the 1/8 cut can provide that decoration or that flavor that stands out in those drinks and in those desserts that require small pieces of grapefruit.":
    "El corte 1/8 es el más pequeño que suministramos a la industria alimentaria; es adecuado para bebidas o como complemento de otros alimentos, y para recetas que requieren detalles pequeños, como decoración o para aportar sabor a bebidas y postres."
};

/** Spanish for one English string, or undefined when there is none (the block stays English). */
export function translateEs(text: string): string | undefined {
  if (text in TEXT) return TEXT[text];
  if (KEEP.has(text) || NEUTRAL.test(text)) return text;
  for (const [pattern, replacement] of PATTERNS) if (pattern.test(text)) return text.replace(pattern, replacement);
  return undefined;
}

/** Translation keys, for the test that flags entries no page uses any more. */
export const esTranslationKeys = Object.keys(TEXT);

/** Spanish decimal comma in translated prose ("0.24 mm" → "0,24 mm"); codes have no decimals. */
const decimalComma = (text: string) => text.replace(/(\d)\.(\d)/g, "$1,$2");

/** Strings the language detection missed (e.g. "Soft Drinks" in a Spanish list): exact keys only. */
export const exact = (text: string) => (text in TEXT ? decimalComma(TEXT[text]) : text);
function exactOnly(item: Item): Item {
  switch (item.type) {
    case "p":
    case "h3":
      return { ...item, text: exact(item.text) };
    case "ul":
      return { ...item, items: item.items.map(exact) };
    case "specs":
      return { ...item, rows: item.rows.map(([label, value]): [string, string] => [exact(label), exact(value)]) };
    default:
      return item;
  }
}

/**
 * The Spanish page with its English blocks translated: a block (or heading) loses its
 * `lang="en"` only when every string in it has a Spanish version.
 */
export function localizeSections(sections: Section[]): Section[] {
  const all = (texts: string[]) => {
    const translated = texts.map((text) => {
      const spanish = translateEs(text);
      return spanish === undefined ? undefined : spanish === text ? text : decimalComma(spanish);
    });
    return translated.every((text) => text !== undefined) ? (translated as string[]) : undefined;
  };
  return sections.map((section) => {
    const heading = section.headingLang === "en" && section.heading ? all([section.heading]) : undefined;
    const items = section.items.map((item): Item => {
      if (!("lang" in item) || item.lang !== "en") return exactOnly(item);
      // The translated block is Spanish: it no longer carries lang="en".
      const rest = { ...item };
      delete rest.lang;
      switch (item.type) {
        case "p":
        case "h3": {
          const [text] = all([item.text]) ?? [];
          return text === undefined ? item : { ...(rest as typeof item), text };
        }
        case "ul": {
          const list = all(item.items);
          return list ? { ...(rest as typeof item), items: list } : item;
        }
        case "specs": {
          const cells = all(item.rows.flat());
          if (!cells) return item;
          const rows = item.rows.map((_, index): [string, string] => [cells[index * 2], cells[index * 2 + 1]]);
          return { ...(rest as typeof item), rows };
        }
        default:
          return item;
      }
    });
    if (!heading) return { ...section, items };
    const plain = { ...section, heading: heading[0], items };
    delete plain.headingLang;
    return plain;
  });
}
