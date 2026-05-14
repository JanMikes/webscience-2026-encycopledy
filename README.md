# Webscience 2026 Encyclopedia

A React + TypeScript + Vite application built with Three.js, Framer Motion, and Tailwind CSS.

## Run locally

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173.

### Other scripts

```bash
npm run build     # Type-check and build for production into dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Run with Docker

Build and run the production image locally:

```bash
docker build -t webscience-encycopledy .
docker run --rm -p 8080:80 webscience-encycopledy
```

Then open http://localhost:8080.

### Pull the prebuilt image

CI publishes images to GitHub Container Registry on every push to `main`:

```bash
docker pull ghcr.io/janmikes/webscience-2026-encycopledy:latest
docker run --rm -p 8080:80 ghcr.io/janmikes/webscience-2026-encycopledy:latest
```

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Three.js / @react-three/fiber / drei
- Framer Motion, GSAP
- Zustand (state)
- Howler (audio)
