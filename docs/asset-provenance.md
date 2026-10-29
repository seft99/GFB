# Asset provenance

Origin and usage terms of photographs added for specific components. Each entry records what was
verified and when; "to confirm" marks rights that have not been established.

The mandatory commercial-publication gate and approval ledger is
[`docs/product-image-audit.md`](product-image-audit.md). This file describes design provenance and
transformations, but it does not by itself grant or prove publication rights. If the two records
differ, the stricter status in `product-image-audit.md` controls: `pending-review` assets must not
be reused in a new production-facing placement until supporting authorization is recorded.

## Concentrate family explorer (`/raw-materials/fruit-concentrates`, desktop)

Files in `public/images/raw-materials/concentrates/`. Panel photographs were downloaded from the
original Unsplash files (masters 2977–5328 px wide, kept outside the repository) and exported as
2000 px WebP (quality 80); `next/image` serves the displayed sizes.

### Panel photographs — Unsplash License

License verified on 2026-10-27 on each photo page ("Uso gratuito bajo la Licencia Unsplash",
free download, not Unsplash+) and on https://unsplash.com/license: irrevocable, non-exclusive,
worldwide copyright license to download, copy, modify, distribute, perform and use the images for
free, including for commercial purposes, without permission from or attribution to the
photographer or Unsplash. Not permitted: selling unaltered copies, and compiling Unsplash images
to replicate a similar or competing service. Attribution is not required; it is recorded here.

| Family        | File                            | Creator                            | Source                                  | Content (as seen)                                      | Notes                                                                                                                 | Status |
| ------------- | ------------------------------- | ---------------------------------- | --------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------ |
| Citrus        | `citrus-sliced.webp`            | freestocks (@freestocks)           | https://unsplash.com/photos/xSGCbGYQtO4 | Sliced oranges, lemons and grapefruit                  | No people, brands or property.                                                                                        | In use |
| Mediterranean | `mediterranean-still-life.webp` | Kevin Hessey (@kevinhessey)        | https://unsplash.com/photos/MNxXE9DrMBo | An apple, red grapes and two pears                     | All three are Mediterranean catalogue entries.                                                                        | In use |
| Tropical      | `tropical-market.webp`          | Alice Young (@youngalicesalvatore) | https://unsplash.com/photos/ZR1iwPjmbTc | Mangoes and bananas on newspaper, Dong Ba market (Huế) | Newspaper print is visible but not legible as a brand or logo.                                                        | In use |
| Red fruits    | `red-fruits-mixed.webp`         | Nanxi Wei (@nanxiwei)              | https://unsplash.com/photos/6wwWiD4EaXo | Strawberries, raspberries, blackberries, blueberries   | All four are red-fruit catalogue entries.                                                                             | In use |
| Vegetables    | `vegetables-roots.webp`         | Bovia & Co. Photography (@boviaco) | https://unsplash.com/photos/2PxFOb8nwjY | Carrots, beets and pale round roots at a market        | Unsplash's automatic description says "radishes"; the pale roots look like turnips but are not named in the alt text. | In use |

All photographs are illustrative; none shows GFB products, facilities or processes.

### Selector thumbnails — official GFB website

`citrus-thumb.webp` (blood orange), `mediterranean-thumb.webp` (white grapes),
`tropical-thumb.webp` (pineapple), `red-fruits-thumb.webp` (strawberries) and
`vegetables-thumb.webp` (carrots) are retained, unreferenced studio cut-outs from the product images of
https://www.gfb-solutions.com/fruits-concentrates, resized to 480 px WebP.
`red-grape-thumb.webp` is from the same official product image set and is also retained only for
review. The explorer and technical library now use the verified Unsplash panel/hero assets instead.
Usage rights: **to confirm with GFB** (published on the company's own site; the original
photographer or stock licence is not documented).

### Frozen fruits library thumbnails — official GFB website

The unreferenced files `public/images/raw-materials/iqf/iqf-lemon-thumb.webp`, `iqf-orange-thumb.webp`,
`iqf-lime-thumb.webp` and `iqf-grapefruit-thumb.webp`: 480 px square WebP crops of the official
GFB IQF slice photos (static.wixstatic.com media `bb6094_092bb083…`, `bb6094_61ecff8f…`,
`bb6094_fb249469…`, `bb6094_76817ca1…`, as published on the IQF product pages of
https://www.gfb-solutions.com). Crop and resize only; no generated or edited content.
Usage rights: **to confirm with GFB** (same status as the other images from the company's site).

## Product detail heroes

`public/images/products/hero/`: one photograph per subject (fruit, vegetable, ingredient or
bottle type), used by `src/migration/product-hero-images.ts` for the hero of the product-detail
pages. Verified on 2026-10-28 on each individual Unsplash photo page: "Uso gratuito bajo la
Licencia Unsplash" (free licence, not Unsplash+), creator, upload and, where published, camera;
licence terms as recorded above (commercial use and modification allowed, attribution not
required). Checked for visible brands, logos and recognisable people: none (pink guava shows a
hand only). Exported as WebP, longest side ≤ 2000 px (quality 72–82); `next/image` serves the
displayed sizes. All photographs are illustrative: they show the fruit, vegetable, ingredient or
bottle type, never a GFB concentrate, frozen product, format, capacity or facility; the IQF
photographs show fresh slices, not frozen specimens. Rejected during selection: candidates with
brands, people, generated-looking renders without camera data (a 2025 cherry, a 2026 asparagus),
and "Mockup Graphics" uploads without camera data (a pear and a ginger root).

| File                                     | Source                                  | Creator                            | Camera                      | Status   |
| ---------------------------------------- | --------------------------------------- | ---------------------------------- | --------------------------- | -------- |
| `products/hero/orange.webp`              | https://unsplash.com/photos/nibgG33H0F8 | Xiaolong Wong (@runblue)           | FUJIFILM X-T2               | approved |
| `products/hero/pink-grapefruit.webp`     | https://unsplash.com/photos/kxa2GSsEkqU | charlesdeluvio (@charlesdeluvio)   | Canon EOS 6D                | approved |
| `products/hero/lime.webp`                | https://unsplash.com/photos/c5_N5ak_kJU | Shaun Meintjes                     | Canon EOS 30D               | approved |
| `products/hero/blood-orange.webp`        | https://unsplash.com/photos/SB6ow-NhQk0 | Elle Hughes                        | SONY ILCE-6000              | approved |
| `products/hero/lemon.webp`               | https://unsplash.com/photos/7WAGthfGJ9w | Moritz Nie (@mo_jito)              | SONY ILCE-6000              | approved |
| `products/hero/tangerine.webp`           | https://unsplash.com/photos/hA9o-T5Agqc | Karolina Kołodziejczak             | SONY ILCE-6400              | approved |
| `products/hero/apple.webp`               | https://unsplash.com/photos/gDPaDDy6_WE | an_vision (@anvision)              | Fujifilm X-T2               | approved |
| `products/hero/white-grape.webp`         | https://unsplash.com/photos/MfrXtyOe8vw | Yasaman Abedini (@yas_abedini)     | NIKON D5200                 | approved |
| `products/hero/persimmon.webp`           | https://unsplash.com/photos/z2x-Oi10X3I | Jimmy Wu (@jimmyyo)                | Canon EOS 2000D             | approved |
| `products/hero/red-grape.webp`           | https://unsplash.com/photos/2uF_geUa7Pc | Adam Bartoszewicz                  | SONY ILCE-6500              | approved |
| `products/hero/peach.webp`               | https://unsplash.com/photos/bNuil3PcTSM | Hamad Alahamad (@hamad164)         | Canon EOS R5                | approved |
| `products/hero/watermelon.webp`          | https://unsplash.com/photos/izi5AnlbRIA | Art Rachen (@artrachen)            | SONY ILCE-7M3               | approved |
| `products/hero/pear.webp`                | https://unsplash.com/photos/P-S2zNn0Q0g | Max Böhme (@max_boehme)            | SONY ILCE-6000              | approved |
| `products/hero/pomegranate.webp`         | https://unsplash.com/photos/Vs5aLVkgcRk | Priyanka Singh                     | Canon EOS 200D II           | approved |
| `products/hero/apricot.webp`             | https://unsplash.com/photos/dHK4BiGA9v8 | Ilona Frey (@couleuroriginal)      | FUJIFILM X-T10              | approved |
| `products/hero/melon.webp`               | https://unsplash.com/photos/oynbjFRAb-0 | nilufar nattaq (@nillufar)         | NIKON D850                  | approved |
| `products/hero/passion-fruit.webp`       | https://unsplash.com/photos/3DOybxD2hMo | Glen Carrie                        | Canon EOS 70D               | approved |
| `products/hero/pineapple.webp`           | https://unsplash.com/photos/Cr9hZrpC1Oc | Julien Pianetti (@julienpian)      | not published (2017 upload) | approved |
| `products/hero/pink-guava.webp`          | https://unsplash.com/photos/eiCzR_AVHJQ | Samee Anderson                     | SONY DSC-RX100M5            | approved |
| `products/hero/banana.webp`              | https://unsplash.com/photos/1jyRHJPkpz8 | Gabriel Mihalcea (@lovelyscape)    | NIKON D500                  | approved |
| `products/hero/mango.webp`               | https://unsplash.com/photos/7iLlgS5o09c | Becky Mattson                      | Apple iPhone 8 Plus         | approved |
| `products/hero/coconut.webp`             | https://unsplash.com/photos/dFoOWRT97_0 | Tijana Drndarski                   | not published (2020 upload) | approved |
| `products/hero/cranberry.webp`           | https://unsplash.com/photos/0TFxOkhFt14 | Rasa Kasparaviciene                | SONY ILCE-7                 | approved |
| `products/hero/blueberry.webp`           | https://unsplash.com/photos/4qujjbj3srs | Joanna Kosinska                    | NIKON D750                  | approved |
| `products/hero/cherry.webp`              | https://unsplash.com/photos/INprSEBbfG4 | Quaritsch Photography (@quaritsch) | Canon EOS 70D               | approved |
| `products/hero/raspberry.webp`           | https://unsplash.com/photos/gQyTxSrctvw | Anto Meneghini                     | Canon                       | approved |
| `products/hero/blackberry.webp`          | https://unsplash.com/photos/l1uVrvjZrsQ | Amanda Hortiz                      | Canon EOS Rebel SL3         | approved |
| `products/hero/strawberry.webp`          | https://unsplash.com/photos/GaE4GzIjAlY | Bishwajit Ghose (@ghose_bishwajit) | Apple iPhone 16             | approved |
| `products/hero/turnip.webp`              | https://unsplash.com/photos/DIYv7TerQI4 | Zoshua Colah                       | Canon EOS Rebel T6i         | approved |
| `products/hero/pumpkin.webp`             | https://unsplash.com/photos/jvA4zcA1d2o | Giorgio Trovato                    | Canon EOS 5D Mark III       | approved |
| `products/hero/tomato.webp`              | https://unsplash.com/photos/UD_j10SKj5g | Alex Ghizila (@galex)              | NIKON D3200                 | approved |
| `products/hero/beet.webp`                | https://unsplash.com/photos/lFxgx7Snyfw | Emma-Jane Hobden (@emmalejane)     | not published               | approved |
| `products/hero/pepper.webp`              | https://unsplash.com/photos/A39EqNtDpZs | Honza Vojtek (@panvojtek)          | Canon EOS 5D                | approved |
| `products/hero/spinach.webp`             | https://unsplash.com/photos/4jpNPu7IW8k | Elianna Friedman                   | Apple iPhone 8              | approved |
| `products/hero/celery.webp`              | https://unsplash.com/photos/wn2Gqyvq2ts | Valentin Balan (@valentinbalan)    | Canon EOS 5D Mark III       | approved |
| `products/hero/cucumber.webp`            | https://unsplash.com/photos/L8GbxVUQ-f0 | Markus Winkler (@markuswinkler)    | not published               | approved |
| `products/hero/broccoli.webp`            | https://unsplash.com/photos/TL6bTnQWMbk | Katherine Jenswold                 | Canon EOS Rebel T7          | approved |
| `products/hero/carrot.webp`              | https://unsplash.com/photos/R198mTymEFQ | Armando Arauz (@armandoarauz)      | SONY ILCE-7RM2              | approved |
| `products/hero/asparagus.webp`           | https://unsplash.com/photos/PqiucwQwZQg | Alisa Golovinska                   | Apple iPhone XS             | approved |
| `products/hero/ginger.webp`              | https://unsplash.com/photos/ziCb4_EKmak | NoonBrew                           | Canon EOS R5                | approved |
| `products/hero/iqf-lemon.webp`           | https://unsplash.com/photos/tm7Mf8apKCQ | Sama Hosseini                      | NIKON D5300                 | approved |
| `products/hero/iqf-orange.webp`          | https://unsplash.com/photos/bogrLtEaJ2Q | Chang Duong (@iamchang)            | Canon EOS 700D              | approved |
| `products/hero/iqf-lime.webp`            | https://unsplash.com/photos/TREaif_QI6Y | Shaun Meintjes                     | Canon EOS 30D               | approved |
| `products/hero/iqf-grapefruit.webp`      | https://unsplash.com/photos/bUiJXfP0nno | Disiana Caballero (@disi_03)       | NIKON D5300                 | approved |
| `products/hero/soft-drinks.webp`         | https://unsplash.com/photos/MXxrj9N3q10 | Fernando Andrade (@thisisnando)    | Canon EOS REBEL T3          | approved |
| `products/hero/alcoholic-beverages.webp` | https://unsplash.com/photos/hhxjE6qjKq0 | Jan Gunnar Nygård (@jangnyg)       | Canon EOS 6D Mark II        | approved |
| `products/hero/water.webp`               | https://unsplash.com/photos/hpHM0OlOHT0 | Greg Rosenke (@greg_rosenke)       | Canon EOS 80D               | approved |
| `products/hero/oat.webp`                 | https://unsplash.com/photos/GuJ8KO4LywI | Jocelyn Morales (@molnj)           | not published               | approved |
| `products/hero/almond.webp`              | https://unsplash.com/photos/8LvXmMZuAU0 | Mockupo (@mockupo)                 | Canon EOS 1300D             | approved |

Added on 2026-10-28 (refinement pass; same verification: "Uso gratuito bajo la Licencia Unsplash",
not Unsplash+, no brands, logos or people; originals kept outside the repository, exported as
2000 px WebP, quality 80–82, landscape crops of portrait originals where noted):

| File                             | Source                                  | Creator                      | Camera                    | Used for                                                     | Status   |
| -------------------------------- | --------------------------------------- | ---------------------------- | ------------------------- | ------------------------------------------------------------ | -------- |
| `products/hero/white-guava.webp` | https://unsplash.com/photos/oPiT4nceNdw | VD Photography               | Canon EOS M50m2           | White guava concentrate (cut fruit shows the white flesh)    | approved |
| `products/hero/tamarind.webp`    | https://unsplash.com/photos/s1cwKdm5e7U | Aoi (@seele1306)             | FUJIFILM X-T3             | Tamarind concentrate (3:2 crop around the pod)               | approved |
| `products/hero/slim-can.webp`    | https://unsplash.com/photos/nZvTEtAc024 | Ambo Ampeng (@ambo_ampeng)   | not published             | Sleek and slim can product pages (plain, unprinted tall can) | approved |
| `products/hero/lemon-zest.webp`  | https://unsplash.com/photos/xjb-g9solhg | Nathan Lemon                 | FUJIFILM X-T2             | IQF lemon zest (3:2 crop)                                    | approved |
| `products/hero/cans-pair.webp`   | https://unsplash.com/photos/gVljCbehvO0 | Jesse Kojo Kuntoh (@jesse_k) | not published (3D render) | Aluminium cans hub and standard can (2571 × 2160)            | approved |
| `products/hero/can-ends.webp`    | https://unsplash.com/photos/fAuQTTrBgoQ | Jesse Kojo Kuntoh (@jesse_k) | not published (3D render) | Can ends hub and the two 52 mm end pages (2571 × 2160)       | approved |
| `products/hero/citrus-peel.webp` | https://unsplash.com/photos/lfubXm-MW0U | okeykat                      | NIKON D3200               | IQF lemon and orange peel shells (3:2 crop)                  | approved |

The can images are plain, unprinted cans: `slim-can.webp` a tall can on white, `cans-pair.webp`
and `can-ends.webp` studio renders tagged "3D render" on Unsplash (licensed stock renders, not
generated by this project). They replace `packaging/cans-card.webp` in the hero, which was
upscaled about 1.8× on 2× screens (1274 × 822 source). None shows a GFB can or a specific diameter. The peel photograph shows fresh peel pieces, not frozen shells.

Repository images formerly reused by product heroes — `packaging/closures-crowns-panorama.webp`
and `packaging/labels-wash-off.webp` — were removed from production references by the 2026-10-28
rights pass because their licences are not documented. They remain as unreferenced files pending
review. Can and can-end heroes use the licensed Unsplash renders listed above.

The image-free product gaps recorded on 2026-10-28 (white grapefruit, missing IQF formats,
RipCaps/ring crown caps and label types) were superseded on 2026-10-29 by seven documented
generated base/family illustrations. The four IQF masters were then used as the only visual input
for 29 route-specific derivatives under `public/images/generated/iqf/`: family pages retain the
assortment, while every individual IQF route shows only its named cut or presentation. Prompts,
generation records, terms review, route scopes, rejected first-pass eighth cuts and accuracy
limitations are recorded in `docs/product-image-audit.md`, the controlling rights ledger.
`/additives` and `/ingredients-and-materials` remain intentionally image-free until GFB
confirms their commercial status. Technical specification pages retain the technical-document
presentation.

## Product-resource sections (category pages)

Images used by `src/migration/category-resources.ts` (`/cans`, `/closures`, `/bottles`, `/labels`,
`/plant-based-concentrate`). Verified on 2026-10-28. Unsplash entries: each individual photo page
states "Uso gratuito bajo la Licencia Unsplash" (free license, not Unsplash+), shows the creator
and, where available, the camera; terms as recorded above (commercial use, modification, no
attribution required, no selling unaltered copies or replicating a competing service). Checked
for visible brands, logos and people: none. Exported as 1200 × 960 WebP (5:4 crop, quality 84);
`next/image` serves the displayed sizes, lazily.

| Category                 | Product (legacy path)                       | File                                                                   | Source                                      | Creator                         | License                                           | Commercial use / modification | Attribution  | Third-party rights                         | Status                                             |
| ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------------- | ------------------------------------------------- | ----------------------------- | ------------ | ------------------------------------------ | -------------------------------------------------- |
| bottles                  | Soft drinks (`/soft-drinks`)                | `packaging/resources/bottles-soft-drinks-card.webp`                    | https://unsplash.com/photos/MXxrj9N3q10     | Fernando Andrade (@thisisnando) | Unsplash License                                  | Yes / yes                     | Not required | Plain swing-top bottle and glass, no marks | approved                                           |
| bottles                  | Alcoholic beverages (`/alcoholic-beverage`) | `packaging/resources/bottles-alcoholic-card.webp`                      | https://unsplash.com/photos/hhxjE6qjKq0     | Jan Gunnar Nygård (@jangnyg)    | Unsplash License                                  | Yes / yes                     | Not required | Unlabelled amber bottle                    | approved                                           |
| bottles                  | Water (`/water`)                            | `packaging/resources/bottles-water-card.webp`                          | https://unsplash.com/photos/hpHM0OlOHT0     | Greg Rosenke (@greg_rosenke)    | Unsplash License                                  | Yes / yes                     | Not required | Plain swing-top bottle and glass, no marks | approved                                           |
| plant-based-concentrates | Oat concentrate                             | `raw-materials/resources/oat-card.webp`                                | https://unsplash.com/photos/GuJ8KO4LywI     | Jocelyn Morales (@molnj)        | Unsplash License                                  | Yes / yes                     | Not required | Ingredient only                            | approved                                           |
| plant-based-concentrates | Almond concentrate                          | `raw-materials/resources/almond-card.webp`                             | https://unsplash.com/photos/8LvXmMZuAU0     | Mockupo (@mockupo)              | Unsplash License                                  | Yes / yes                     | Not required | Ingredient only                            | approved                                           |
| cans                     | Group images                                | `packaging/resources/aluminium-cans-group.webp`, `can-ends-group.webp` | Crops of `packaging/cans-card.webp`         | Unknown                         | Original supplied panorama licence not documented | Not verified                  | —            | Plain cans and ends                        | pending-review; removed from production references |
| closures                 | Group image                                 | `packaging/closures-card.webp`                                         | Existing card crop of the supplied panorama | Unknown                         | Original supplied panorama licence not documented | Not verified                  | —            | Plain crown caps                           | pending-review; removed from production references |
| labels                   | WashOff Labels (`/washoff-labels`)          | `packaging/labels-wash-off.webp`                                       | Existing image of the labels category page  | Unknown                         | Not documented                                    | Not verified                  | —            | Shows a "WASH-OFF Labels" mark             | pending-review; removed from production references |

All photographs are illustrative: they show glass bottles or ingredients, not GFB products,
formats, capacities, concentrates or facilities.

Not used (rejected or missing):

- Shrink sleeve labels: no licensed photograph that clearly shows a shrink sleeve without a brand;
  the closest candidate (https://unsplash.com/photos/Ug-pn8X8sRo) has no camera data, is tagged as
  cosmetics/shampoo and does not show a sleeve application.
- Wet glue labels: every candidate shows a real wine or beer brand.
- Both cards show a designed line illustration drawn in code (`LabelIllustration` in
  `components/sections/product-resources/resource-views.tsx`): a plain bottle outline with the
  area each label covers (full-body sleeve; body label). Not a photograph, not generated imagery,
  no brand. The category and product heroes now use the documented generated label-family image;
  the diagrams remain because they distinguish the three technologies more clearly.
- Soft drink candidates with Coca-Cola, Fanta, Jarritos and similar brands were rejected.
- Withdrawn from `public/` on 2026-10-28: the crops of official GFB product photographs
  (`standard-can-card`, `sleek-can-card`, `slim-can-card`, `can-end-52mm-card`,
  `can-end-52mm-ise-card`, `aluminium-cans-thumb`, `can-ends-thumb`, from static.wixstatic.com media
  `bb6094_38521d80…`, `bb6094_26e8d0de…`, `bb6094_74f4dbfb…`, `bb6094_a7a2952c…`,
  `bb6094_ea304975…`): reuse rights are not confirmed, so they are not shipped. They can return
  once GFB confirms the rights.

### Not used by the explorer any more

`public/images/raw-materials/citrus.webp` (official GFB website) and
`public/images/raw-materials/grapes.webp` (Wikimedia Commons, CC0) remain in use elsewhere on the
page and site and were not changed.

## Desktop surface refinements (service and detail pages, About, Home)

Unsplash License verified on 2026-10-27 on each photo page ("Uso gratuito bajo la Licencia
Unsplash", free download, not Unsplash+); terms as above. Exported as 2400 px WebP (quality 80).
Used only from 1100px (art-directed) unless noted; all illustrative, none shows GFB facilities.

| Use                               | File                                  | Creator                          | Source                                  |
| --------------------------------- | ------------------------------------- | -------------------------------- | --------------------------------------- |
| Sweet applications hero + card    | `flavours/sweet-tarts.webp`           | Natalia Y. (@foxfox)             | https://unsplash.com/photos/o9kswzHrvMs |
| Beverage applications hero + card | `flavours/beverage-citrus-drink.webp` | Francesca Hotchin (@franhotchin) | https://unsplash.com/photos/p5EiqkBYIEE |
| Savoury applications hero + card  | `flavours/savoury-soup.webp`          | Julia Kicova (@justjullietta)    | https://unsplash.com/photos/Qct8v6wdyRs |
| About collaboration photo         | `about/collaboration-desk.webp`       | Scott Graham (@amstram)          | https://unsplash.com/photos/5fNmWej4tAA |

Derivatives of existing approved assets (no new source):

- `packaging/closures-crowns-panorama.webp`: retouch of `closures-panorama.png` (truncated green
  bottle neck removed and background rebuilt; crowns moved right; 1.14× crop). Original kept.
- Card crops: `packaging/cans-card.webp`, `bottles-card.webp`, `closures-card.webp`,
  `raw-materials/iqf-citrus-card.webp`, `consulting/pharmaceutical-filling-card.webp` (from the
  supplied panoramas).
- `raw-materials/fruit-concentrates-juice.webp`: Home feature, cropped from the 1286 × 600
  original of the same GFB website photograph (rights as for other official GFB images: to confirm).

## Product-detail hero refresh (2026-10-29)

Seven route heroes were replaced to improve close framing and product clarity. Melon uses Martin
Moore's free Unsplash image
https://unsplash.com/photos/a-cut-in-half-melon-sitting-on-top-of-a-white-cloth-PIybW7_fg1U;
passion fruit uses Sleepy Zhao's free Unsplash image
https://unsplash.com/photos/a-cut-open-passion-fruit-on-a-pink-surface-tf06NThi8PE. Both were
cropped to 2400 × 1800 and encoded as quality-84 WebP after commercial-use and modification rights
were rechecked on 2026-10-29.

Apple, pear, pink guava, mango and turnip use new 1448 × 1086 generated still-life illustrations
under `public/images/generated/produce/`. They were created without input/reference images by the
built-in OpenAI image-generation tool, visually screened, resized without enlargement and encoded
as quality-84 WebP. Generation IDs, prompts, output-rights terms, route scope and remaining
third-party-rights limitations are recorded in `docs/product-image-audit.md`, the controlling
legal ledger. The seven superseded photographs remain in the repository for traceability but are
no longer used by `src/migration/product-hero-images.ts`.
