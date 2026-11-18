# ASTRAQA · sitio web

Sitio de una página (ES / EN / PT) y brochure tríptico de ASTRAQA. Cada push a `main` lo publica en GitHub Pages con GitHub Actions.

## Estructura

| Archivo | Qué es |
| --- | --- |
| `web.html` | Página principal (cuerpo de la página; el build la envuelve en un documento HTML completo) |
| `brochure.html` | Brochure tríptico con selector de idioma |
| `img/` | Logo e ícono de ASTRAQA |
| `scripts/build.mjs` | Arma `dist/` y exporta el brochure a PDF en los tres idiomas |
| `.github/workflows/deploy.yml` | Build y despliegue automático a GitHub Pages |

El build genera:

- `dist/index.html`: la web
- `dist/brochure.html`: el brochure en línea
- `dist/brochure/astraqa-brochure-{es,en,pt}.pdf`: los PDFs que descarga el botón "Descargar brochure"

## Publicar por primera vez

1. Crea un repositorio vacío en GitHub, por ejemplo `astraqa-web`.
2. Desde esta carpeta:

   ```bash
   git init -b main
   git add .
   git commit -m "Sitio ASTRAQA"
   git remote add origin https://github.com/<usuario>/astraqa-web.git
   git push -u origin main
   ```

3. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. La pestaña **Actions** muestra el despliegue. Al terminar, el sitio queda en `https://<usuario>.github.io/astraqa-web/`.

Para un dominio propio (por ejemplo `astraqa.com`), configúralo en **Settings → Pages → Custom domain** y crea el registro DNS que indica GitHub.

## Probar en local

```bash
npm install
npm run preview
```

Abre http://localhost:8765. El build local usa Google Chrome instalado para generar los PDFs; en GitHub Actions usa el Chromium de Playwright.
