# CS-Plan
Migrant version of the Computer Science study plan (Arabic UI).

This repository contains a small React + Vite + Tailwind app that helps students track their CS degree progress and interact with a Gemini-powered academic advisor.

## Development (local)

1. Copy `.env.example` to `.env` and set your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. Install and run locally:
   - npm:
     ```bash
     npm ci
     npm run dev
     ```

3. Open http://localhost:5173

## Build

- Create a production build:
  ```bash
  npm run build
  ```

## Deployment

- This repo includes a GitHub Actions workflow that builds the site on push to `main` and publishes to GitHub Pages.
- Alternatively you can deploy the `dist/` output to any static host (Vercel, Netlify, etc.).

## Environment

- Set `VITE_GEMINI_API_KEY` (the app reads this at build-time). Do NOT commit your real API key.

### GitHub Actions / Secrets

- To enable Gemini features in the production site deployed by GitHub Actions, add a repository secret named `VITE_GEMINI_API_KEY` (Settings → Secrets → Actions).
- The workflow reads that secret during the build step and injects it into the static bundle.

## Notes

- Gemini features will show a helpful message when the API key is not configured.
- UI is RTL/Arabic and mobile friendly.

