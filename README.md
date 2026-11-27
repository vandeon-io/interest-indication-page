# Vandeon — Interest Indication Page

Static landing page for the Vandeon waitlist. No build step — open `index.html` directly or deploy as static files.

## Stack
- Plain HTML + CSS
- React 18 + Babel (in-browser JSX transpile)
- Loops form for waitlist submissions

## Files
- `index.html` — entry point
- `styles.css` — all styling
- `components.jsx` — terminal demo, infrastructure graph, signup form, features
- `tweaks-panel.jsx` — design-tool-only tweaks UI (does nothing in production; safe to keep)

## Local preview
Just open `index.html` in a browser, or serve the folder with any static server:
```bash
npx serve .
```

## Deploy to Cloudflare Pages
1. **Workers & Pages → Create → Pages → Connect to Git**
2. Pick this repo
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. Save & Deploy

Every push to `main` auto-deploys.

## Loops integration
Form posts directly to:
```
https://app.loops.so/api/newsletter-form/cmoe4inz50z3b0ixj7wdg4jgx
```
Fields sent:
- `email` (built-in)
- `userGroup` (built-in — receives the role chip value)
- `useCase` (custom contact property — must be created in Loops dashboard with API name `useCase`)
