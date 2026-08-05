# Local Development Guide (`pnpm link`)

This guide explains how to develop and test `@joxpg/akretrix-ui` locally across other AkreTrix repositories (`akretrix-elearning`, `akretrix-landing-page`) without needing to publish to GitHub Packages on every change.

---

## 🔁 Workflow Overview

With `pnpm link`, you can point any consumer project directly to your local `akretrix-ui` repository:

```
akretrix-ui/ (running `pnpm dev`)
   └── dist/
         ▲
         │ (symlink via pnpm link)
         │
akretrix-elearning/frontend/ (running `pnpm dev`)
```

---

## 🛠️ Step-by-Step Instructions

### Step 1: Start Watch Mode in `akretrix-ui`

Open a terminal in the `akretrix-ui` repository:

```bash
cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-ui
pnpm install
pnpm run dev
```

`tsup` will build the package into `dist/` and watch for any code changes.

---

### Step 2: Link `akretrix-ui` in the Consumer Repository

#### Option A: Using `pnpm link` (Global Link)

1. In `akretrix-ui`:
   ```bash
   pnpm link --global
   ```

2. In the consumer app (e.g. `akretrix-elearning/frontend`):
   ```bash
   cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-elearning/frontend
   pnpm link --global @joxpg/akretrix-ui
   ```

#### Option B: Direct Relative Path Link (Fastest)

In the consumer app (e.g. `akretrix-elearning/frontend` or `akretrix-landing-page/frontend`):

```bash
cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-elearning/frontend
pnpm link ../../akretrix-ui
```

---

### Step 3: Run the Consumer App

In `akretrix-elearning/frontend`:

```bash
pnpm run dev
```

Any edits made to files inside `akretrix-ui/src/` will automatically trigger a rebuild, and Vite/Astro will hot-reload (HMR) instantly in your browser!

---

### Step 4: Unlinking (When Ready to Use Published Package)

When you are done with local testing and want to switch back to the remote GitHub Packages registry version:

```bash
cd /Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-elearning/frontend
pnpm unlink @joxpg/akretrix-ui
pnpm install --force
```
