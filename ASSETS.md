# Asset provenance

The five Love Labels reference images supplied in chat guide the current art direction. Generated assets interpret those references; they are not original production photography or final print artwork.

| Asset | Source | Website location |
| --- | --- | --- |
| Silver can | Generated photographic cutout, preserving the shared SVG reveal and label geometry | `public/images/products/silver-can.webp`, `src/components/Can.astro` |
| Four label designs | Generated four-panel print artwork: graffiti birthday, Mediterranean name day, illustrated friends, sunset anniversary | `public/images/products/label-artwork.webp`, `src/components/LabelArtwork.astro` |
| Birthday gift scene | Existing generated editorial photo edited to match the birthday label | `public/images/lifestyle/gift-placeholder.webp` |
| Anniversary toast | Existing generated editorial photo edited to match the anniversary label | `public/images/lifestyle/together-placeholder.webp` |
| Inter Variable | Self-hosted, SIL Open Font License | `@fontsource-variable/inter` |
| Icons and favicon | Original SVG | Component markup and `public/favicon.svg` |

Generated originals are retained in `/workspace/generated_images/`. Optimized WebP files are served locally. Label art uses one shared atlas, with SVG viewports selecting the four designs. Downloaded proofs embed the selected artwork image as a data URL and preserve personalized text and optional photos. Proofs are not manufacturing dielines.

The lifestyle photographs are illustrative and are not customer photographs or testimonials. Alternative text is maintained in `src/data/site.ts`. Birthday scene dimensions: 1536×1024; anniversary scene: 800×1000. No remote image or font service is needed at runtime.
