# React & Vite Integration Guide (`akretrix-elearning`)

This guide explains how to consume `@joxpg/akretrix-ui` in the Vite / React SPA repository.

---

## 1. Installation

In `akretrix-elearning/frontend`:

```bash
cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-elearning/frontend
pnpm add @joxpg/akretrix-ui
```

---

## 2. Import Styles in `main.tsx` or `App.tsx`

```tsx
import '@joxpg/akretrix-ui/styles.css';
```

---

## 3. Example Component Usage in `LandingPage.tsx` / `Navbar.tsx`

```tsx
import React, { useState } from 'react';
import { ContactModal, PrivacyPolicyModal } from '@joxpg/akretrix-ui';
import { useLanguage } from '../context/LanguageContext';

export const ElearningLanding = () => {
  const { lang } = useLanguage();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="landing-container">
      <header>
        <button
          className="btn-contact"
          onClick={() => setIsContactOpen(true)}
        >
          {lang === 'es' ? 'Hablar con Ventas' : 'Contact Sales'}
        </button>
      </header>

      {/* Shared Transversal Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        source="elearning"
        defaultService="elearning-platform"
        lang={lang as 'en' | 'es'}
        apiEndpoint="https://api.akretrix.com/leads"
        onSuccess={() => {
          console.log('eLearning lead captured successfully');
        }}
      />

      {/* Shared Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang as 'en' | 'es'}
      />
    </div>
  );
};
```
