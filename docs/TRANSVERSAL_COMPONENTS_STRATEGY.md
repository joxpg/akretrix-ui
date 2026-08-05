# AkreTrix Transversal Components Architecture & Strategy

This document outlines the architectural strategy, design decisions, security model, and implementation workflows for transversal (cross-cutting) UI components across all AkreTrix web applications (e.g., `akretrix-landing-page`, `akretrix-elearning`, and future frontends).

---

## 1. Architectural Strategy: Shared Component Library vs. Micro-Frontends

When evaluating how to share transversal components like **Contact Us**, **Privacy Policies**, and **Security Widgets** across multiple frontends with diverse tech stacks (Astro SSR/SSG and React SPA), we evaluated two primary architectural approaches:

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 @joxpg/akretrix-ui                       │
                  │   Shared Transversal Design System & Component Library   │
                  └─────────────┬──────────────────────────────┬─────────────┘
                                │                              │
                                ▼                              ▼
               ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
               │    akretrix-landing-page        │   │       akretrix-elearning        │
               │   (Astro 5 + TypeScript)        │   │      (React 18 + Vite 5)        │
               │  Static Site / Marketing / Tools│   │   Interactive B2B LMS Platform  │
               └─────────────────────────────────┘   └─────────────────────────────────┘
```

| Evaluation Criteria | Micro-Frontends (Module Federation / iframes) | Shared Component Library (`@joxpg/akretrix-ui`) |
| :--- | :--- | :--- |
| **Complexity** | ⚠️ High (separate deployed micro-app, CORS, runtime orchestration) | ✅ **Low / Standard** (versioned NPM package via GitHub Packages) |
| **Bundle & Performance** | ⚠️ Adds network latency, separate bundle fetching at runtime | ✅ **Zero runtime overhead** (tree-shaken and compiled directly into host bundle) |
| **Type Safety** | ⚠️ Loose or requires complex remote typing bridges | ✅ **Full TypeScript compile-time safety** with exported interfaces |
| **Compatibility** | ⚠️ Astro SSG hydration conflicts with remote micro-apps | ✅ **Universal compatibility** (works seamlessly in Astro islands & React SPAs) |
| **Infrastructure Cost** | ⚠️ Dedicated S3/CloudFront/Lambda per micro-frontend | ✅ **$0 additional runtime infrastructure** (hosted on GitHub Packages) |

**Conclusion:** The **Shared Component Library (`@joxpg/akretrix-ui`)** pattern was selected as the optimal architecture for AkreTrix, maximizing performance, developer experience, and maintainability.

---

## 2. Transversal Component Design Principles

Every transversal component in `@joxpg/akretrix-ui` adheres to five foundational pillars:

### A. Multi-Tenant Source Attribution
Every component that communicates with backend APIs accepts a `source` prop (e.g. `'landing'`, `'elearning'`, `'lead-engine'`). This allows unified backend ingest APIs (`/leads`, `/analytics`) to trace the exact customer journey and origin application.

```tsx
<ContactModal
  isOpen={isContactOpen}
  onClose={() => setIsContactOpen(false)}
  source="elearning"                    // Source origin attribution
  defaultService="custom-course"        // Pre-selected intent
  lang="es"                             // Contextual language
  apiEndpoint="https://api.akretrix.com/leads"
/>
```

### B. Multi-Layer Anti-Spam & Zero-Trust Security
The `ContactModal` incorporates a 3-layer anti-bot protection mechanism:
1. **Cloudflare Turnstile**: Zero-friction human verification token validated on the server.
2. **Invisible Honeypot Trap**: An off-screen input (`website_url_hp`) that immediately drops submissions if populated by automated scrapers.
3. **Minimum Dwell Time (Time-to-Submit Check)**: Submissions faster than 2 seconds are flagged as automated bots.

### C. Bilingual Contextual Support (`es` / `en`)
Components do not require heavy external i18n libraries. They ship with clean built-in dictionary lookups driven by the parent application's current language (`'es' | 'en'`).

### D. CSS Variables & Scoped Theming
All styling utilizes semantic CSS tokens defined in `@joxpg/akretrix-ui/styles.css` (`--bg-primary`, `--accent-primary`, `--border-color`, `--radius-md`). Host applications can override these CSS custom properties to seamlessly match their brand theme.

---

## 3. Dual-Environment Resolution: Local Dev vs. CI/CD Pipelines

A common pitfall with shared packages is broken builds when developing locally vs deploying in CI/CD. We designed a **zero-friction dual-resolution strategy**:

```
                       ┌───────────────────────────────────────┐
                       │ Does ../../akretrix-ui exist locally? │
                       └──────────────────┬────────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
                   YES (Local Dev)                    NO (CI/CD Deploy)
        ┌───────────────────────────────────┐  ┌───────────────────────────────────┐
        │ Vite aliases directly to local    │  │ Vite uses standard package import │
        │ akretrix-ui/dist/index.js         │  │ from node_modules/@joxpg/akretrix │
        │ (Live changes without publish)    │  │ (Installed from GitHub Packages)  │
        └───────────────────────────────────┘  └───────────────────────────────────┘
```

### How `vite.config.ts` handles this automatically:

```typescript
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const localUiDist = path.resolve(__dirname, '../../akretrix-ui/dist/index.js');
const localCssDist = path.resolve(__dirname, '../../akretrix-ui/dist/styles/theme.css');
const isLocalUiPresent = fs.existsSync(localUiDist);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: isLocalUiPresent
      ? {
          '@joxpg/akretrix-ui/styles.css': localCssDist,
          '@joxpg/akretrix-ui': localUiDist,
          'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
        }
      : {
          'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
        }
  },
});
```

---

## 4. CI/CD Pipeline Architecture

### Package Publishing Pipeline (`akretrix-ui/.github/workflows/publish.yml`)
1. Triggered on push to `main` branch or Git release tags (`v*`).
2. Runs TypeScript typechecking and production build.
3. Automatically publishes `@joxpg/akretrix-ui` to GitHub Packages (`npm.pkg.github.com`).

### Consumer Deployment Pipelines (`deploy-frontend-s3-cloudfront.yml`)
Consumer workflows authenticate via GitHub's native `GITHUB_TOKEN`:
1. Include `.npmrc`:
   ```ini
   @joxpg:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```
2. Configure workflow permissions and `setup-node`:
   ```yaml
   permissions:
     contents: read
     packages: read

   steps:
     - name: Setup Node.js with GitHub Packages Registry
       uses: actions/setup-node@v4
       with:
         node-version: '24'
         registry-url: 'https://npm.pkg.github.com'
         scope: '@joxpg'

     - name: Install Dependencies
       run: pnpm install --frozen-lockfile
       env:
         NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

---

## 5. Guide: How to Add a New Transversal Component

Follow this checklist whenever creating a new shared component (e.g., `CookieConsentBanner`, `UserAccountMenu`, `StatusBanner`):

1. **Create component folder** in `akretrix-ui/src/components/<ComponentName>/`:
   - `<ComponentName>.tsx` (Core React component)
   - `<ComponentName>.types.ts` (Exported TypeScript interfaces)
2. **Integrate i18n & theming**:
   - Provide fallback dictionaries for `es` and `en`.
   - Use CSS custom properties from `src/styles/theme.css`.
3. **Export from root index**:
   - In `akretrix-ui/src/index.ts`, add:
     ```typescript
     export * from './components/<ComponentName>/<ComponentName>';
     ```
4. **Compile library**:
   ```bash
   pnpm --filter @joxpg/akretrix-ui build
   ```
5. **Import in Consumer Apps**:
   ```tsx
   import { <ComponentName> } from '@joxpg/akretrix-ui';
   ```
