# Open and download Love Labels

The source is on `main`. The built website is on `gh-pages`.

## Enable the website

1. Open https://github.com/dannieltaylor2/LOVE-LBLS/settings/pages
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **gh-pages** and **/ (root)**, then **Save**.
4. Wait for GitHub's Pages deployment to finish. The URL is https://dannieltaylor2.github.io/LOVE-LBLS/

The Codex environment could push Git branches but could not authenticate to the GitHub administration API, so Pages settings could not be enabled automatically. The environment also blocks requests to the public github.io host; public availability must be checked in the browser.

## Download

Built, standalone website: https://github.com/dannieltaylor2/LOVE-LBLS/raw/refs/heads/gh-pages/love-labels-website.zip

If that link does not download, open the `gh-pages` branch, select `love-labels-website.zip`, and use **Download raw file**.

The ZIP can be extracted and uploaded to Netlify Drop, or served locally with `npx serve .`. Opening `index.html` directly is unsupported because the interactive website uses JavaScript modules. Source files are available from **Code → Download ZIP** on `main`.

## Future builds

- Standard hosting: `npm ci` then `npm run build`.
- GitHub Pages: `npm ci` then `GITHUB_PAGES=true npm run build`.
- Publish the contents of `dist/` to `gh-pages`, preserving `.nojekyll` and the downloadable ZIP.

GitHub Pages serves the frontend. It does not add a checkout or order-processing backend. Existing personalization and proof downloads run in the browser.
