# AkreTrix UI (`@joxpg/akretrix-ui`)

Transversal UI components, design tokens, and shared client libraries for AkreTrix web applications, supporting both **Astro (SSG)** and **React / Vite (SPA)**.

---

## 📦 Features

- **🛡️ Transversal Contact Modal (`ContactModal`)**:
  - Out-of-the-box support for multi-tenant sources (`landing`, `elearning`, `enterprise`, etc.).
  - Built-in anti-bot protection with **Cloudflare Turnstile** and honeypot traps.
  - Full internationalization support (**English** & **Spanish**).
  - Timezone and telemetry calculation.
- **🔒 Privacy Policy Modal (`PrivacyPolicyModal`)**:
  - Bilingual compliance modal (GDPR / RGPD + Colombian Habeas Data Ley 1581).
- **🎨 Design System Tokens & Glassmorphism Styles**:
  - Clean CSS variables (`--ak-cyan`, `--ak-card-bg`, etc.) with dark-mode aesthetic.
- **⚡ Zero-Overhead & Type-Safe**:
  - Bundled with `tsup` targeting ESM (`.js`), CJS (`.cjs`), and TypeScript types (`.d.ts`).

---

## 🚀 Installation

### 1. Authenticate with GitHub Packages

Create or update `.npmrc` in your project root or `~/.npmrc`:

```ini
@joxpg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

> For local development, generate a GitHub Personal Access Token (PAT) with `read:packages` permission and set `export NODE_AUTH_TOKEN=your_token` in your shell profile.

### 2. Install Package

```bash
pnpm add @joxpg/akretrix-ui
```

---

## 💻 Usage

### 1. In React / Vite Applications (e.g. `akretrix-elearning`)

```tsx
import React, { useState } from 'react';
import { ContactModal, PrivacyPolicyModal } from '@joxpg/akretrix-ui';
import '@joxpg/akretrix-ui/styles.css';

export const HeaderOrPage = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsContactOpen(true)}>
        Contact Engineering
      </button>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        source="elearning"
        defaultService="elearning-platform"
        lang="es"
        apiEndpoint="https://api.akretrix.com/leads"
        onSuccess={() => console.log('Lead submitted!')}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang="es"
      />
    </>
  );
};
```

---

### 2. In Astro Applications (e.g. `akretrix-landing-page`)

Astro natively supports React components with zero-overhead islands architecture.

#### Step 1: Install `@astrojs/react`
```bash
pnpm add @astrojs/react @joxpg/akretrix-ui
```

#### Step 2: Configure `astro.config.mjs`
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()]
});
```

#### Step 3: Use Component Island in `.astro` layout
```astro
---
import { ContactModal } from '@joxpg/akretrix-ui';
import '@joxpg/akretrix-ui/styles.css';
---

<Layout title="AkreTrix Technologies">
  <!-- Trigger button -->
  <button id="open-contact-btn">Request Proposal</button>

  <!-- React island rendered when user interacts -->
  <ContactModal
    client:idle
    isOpen={false}
    source="landing"
    lang="en"
    apiEndpoint="https://api.akretrix.com/leads"
  />
</Layout>
```

---

## 📚 Documentation Guides

- [Transversal Components Architecture & Strategy](./docs/TRANSVERSAL_COMPONENTS_STRATEGY.md)
- [Local Development Workflow (`pnpm link`)](./docs/LOCAL_DEVELOPMENT.md)
- [CI/CD & GitHub Packages Deployment](./docs/CI_CD_GITHUB_PACKAGES.md)
- [Astro Integration Guide](./docs/ASTRO_INTEGRATION.md)
- [React / Vite Integration Guide](./docs/REACT_INTEGRATION.md)

---

## 🛠️ Repository Scripts

```bash
# Install dependencies
pnpm install

# Run build (outputs to dist/)
pnpm run build

# Run in watch mode for development
pnpm run dev

# Run TypeScript typecheck
pnpm run typecheck
```
