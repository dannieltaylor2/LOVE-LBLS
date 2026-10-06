# LOVE LABELS®

A complete editorial storefront and personalization studio for vinyl labels made for standard European 250 ml slim cans. Built with Astro, TypeScript and GSAP. The page is statically rendered; interaction uses small native TypeScript modules, with no React or WebGL runtime.

## Run

Requires Node 22.12+ (Node 24 is pinned in `.nvmrc`).

```sh
npm ci
npm run dev
```

The development server listens on port 4321. `npm run build` type-checks the entire project and writes the production site to `dist/`. `npm run preview` serves that build. Deploy `dist/` to a static host. No application secrets or backend services are required for this version.

If Vite reports `Outdated Optimize Dep` after installing dependencies or building while the dev server is running, restart the server with `node scripts/astro.mjs dev stop`, then `npm run dev`. Avoid simultaneous dependency installs and browser validation.

In the Codex cloud workspace, use `npm --cache /workspace/.cache/npm ci` because the user home directory is read-only. The Astro wrapper disables telemetry without writing home-directory configuration.

## What works

- Responsive continuous story, collection, product details, process, studio, editorial photography, occasion menu and footer.
- Soft pointer/touch label reveal; Enter or Space toggles a full keyboard preview.
- Scroll-controlled hero transformation, the same gallery can traveling into the product story, and a label unwrap.
- Live name, age, message, occasion, design, color and photo customization.
- Angle controls, local draft persistence, accessible preview dialog, SVG proof download, local enquiry brief download and clear-saved-design control.
- Mobile navigation, occasion previews, FAQ, shipping, contact, terms and privacy dialogs.
- Reduced-motion layouts; no forced smooth-scrolling library or wheel interception.

The label studio is a visual design tool. It does **not** process purchases, collect payments, send enquiries or pretend that a request was submitted. The exported SVG is a front artwork proof, **not a manufacturing dieline**. Photos are processed locally, center-cropped and embedded in the export. They are never uploaded, and are not retained in local storage.

## Structure

- `src/components/`: each narrative section, plus shared `Can` and `LabelArtwork` components.
- `src/data/site.ts`: collection, navigation, occasion and lifestyle asset definitions.
- `src/scripts/personalizer.ts`: validated state, local persistence, photo handling and export.
- `src/scripts/motion.ts`: scoped GSAP media queries, scroll scenes and pointer reveal.
- `src/scripts/main.ts`: navigation, accessible dialogs and enquiry download.
- `src/styles/global.css`: design system and responsive compositions.
- `public/images/lifestyle/`: optimized, locally served placeholder photography.
- `tests/site.spec.ts`: browser integration, responsive and accessibility checks.

## Test

```sh
# On machines without Chromium already installed:
npx playwright install chromium
npm test
```

The config automatically uses `/usr/bin/chromium` in the cloud machine, otherwise Playwright's browser. Two workers bound CPU/memory use. The suite checks all nine requested widths (360–2560), resizing across mobile/desktop breakpoints, real pointer/keyboard interactions, object continuity, unwrap states, design persistence, safe SVG export, photo upload/removal, form validation, dialogs, and automated WCAG A/AA rules. Reports are local generated outputs and are ignored by Git.

## Before accepting orders

1. Replace the documented sample artwork and generated editorial photography with approved brand assets; see `ASSETS.md`. The current visual pass follows the five supplied concept references; see `VISUAL-AUDIT.md`.
2. Set the real public URL in `astro.config.mjs` and add approved social/share assets.
3. Confirm physical label dimensions, bleed, seam overlap, safe areas, color profile and printing workflow with the printer. Preview rotation is a visual inspection effect, not a 360° product model.
4. Add the actual pricing, variants, quantity rules, taxes, shipping regions and lead times.
5. Connect an authorized checkout/order backend and contact destination; add the official Instagram address.
6. Replace prelaunch information with the operator's approved terms, privacy and returns policies.
7. Verify physical fit/water resistance with production samples, and test Safari/Firefox and actual touch devices before launch. Current automated browser coverage is Chromium.

## Working in Codex

Use the existing checkout at `/workspace/LOVE-LBLS`. Cloud tasks are already isolated; do not create a Git worktree unless explicitly requested. Installed files survive a published environment snapshot; running server processes must be restarted in each new task.
