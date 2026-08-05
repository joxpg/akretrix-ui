# Astro Integration Guide (`akretrix-landing-page`)

This guide explains how to consume `@joxpg/akretrix-ui` in the Astro static site repository.

---

## 1. Prerequisites & Dependencies

In `akretrix-landing-page/frontend`:

```bash
cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-landing-page/frontend
pnpm add @astrojs/react @joxpg/akretrix-ui
```

---

## 2. Update `astro.config.mjs`

Ensure `@astrojs/react` is enabled:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
```

---

## 3. Replace Modal Invocations in Astro Layout

In `akretrix-landing-page/frontend/src/layouts/Layout.astro` or page templates:

```astro
---
import { ContactModal, PrivacyPolicyModal } from '@joxpg/akretrix-ui';
import '@joxpg/akretrix-ui/styles.css';
---

<html lang="es">
  <head>
    <!-- Page head content -->
  </head>
  <body>
    <slot />

    <!-- Shared Contact Modal Island (Hydrated when visible/idle) -->
    <ContactModal
      client:idle
      isOpen={false}
      source="landing"
      lang="es"
      apiEndpoint="https://api.akretrix.com/leads"
    />
  </body>
</html>
```
