// Builds the static site into dist/ and prints the brochure to PDF in ES, EN and PT.
// web.html and brochure.html are page bodies (the same files published as Claude artifacts),
// so this script wraps them in a full HTML document for GitHub Pages.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = process.env.SITE_URL || '';
const LANGS = ['es', 'en', 'pt'];

const wrap = (body, { title, description }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${SITE_URL}img/astraqa-logo.png">
<meta name="theme-color" content="#0B1220">
<link rel="icon" type="image/png" href="img/astraqa-mark.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>
</head>
<body>
${body.replace(/<title>[^<]*<\/title>\s*/, '')}
</body>
</html>
`;

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'brochure'), { recursive: true });
await cp(path.join(root, 'img'), path.join(dist, 'img'), { recursive: true });
await writeFile(path.join(dist, '.nojekyll'), '');

const web = await readFile(path.join(root, 'web.html'), 'utf8');
const brochure = await readFile(path.join(root, 'brochure.html'), 'utf8');
await writeFile(path.join(dist, 'index.html'), wrap(web, {
  title: 'ASTRAQA · Quality. Always.',
  description: 'QA como servicio para startups, pymes y agencias: testing manual, automatización, performance, accesibilidad, seguridad y QA para productos con IA.',
}));
await writeFile(path.join(dist, 'brochure.html'), wrap(brochure, {
  title: 'ASTRAQA · Brochure',
  description: 'Brochure de ASTRAQA: servicios, proceso y planes de QA como servicio.',
}));

// Print the brochure. CI uses Playwright's Chromium; locally it falls back to installed Chrome.
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage();
for (const lang of LANGS) {
  const url = pathToFileURL(path.join(dist, 'brochure.html')).href + '#' + lang;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async (l) => { location.hash = l; await document.fonts.ready; }, lang);
  await page.waitForFunction((l) => document.documentElement.lang === l, lang);
  await page.waitForLoadState('networkidle');
  const out = path.join(dist, 'brochure', `astraqa-brochure-${lang}.pdf`);
  await page.pdf({ path: out, format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
  console.log('PDF', path.relative(root, out));
}
await browser.close();
console.log('Built', path.relative(process.cwd(), dist));
