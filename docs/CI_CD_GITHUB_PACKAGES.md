# CI/CD & GitHub Packages Management Guide

This guide explains how `@joxpg/akretrix-ui` is published to GitHub Packages and how all consumer repositories (`akretrix-landing-page`, `akretrix-elearning`, etc.) authenticate and install the package both in CI/CD and locally.

---

## 1. Publishing a New Version of `@joxpg/akretrix-ui`

### Automatic Tag-Based Publishing (Recommended)

1. Bump the version in `package.json`:
   ```bash
   # In akretrix-ui
   npm version patch  # or minor / major
   ```
2. Commit and push the tag to GitHub:
   ```bash
   git push origin main --tags
   ```
3. The single unified GitHub Actions workflow [.github/workflows/release.yml](file:///Users/johann.trigos/Documents/Github/organization-akretrix/akretrix-ui/.github/workflows/release.yml) will trigger automatically:
   - **Stage 1 (Quality Gate)**: Runs TypeScript typecheck, tests, and build.
   - **Stage 2 (Automated Release)**: Computes semantic version, tags git, publishes `@joxpg/akretrix-ui@<version>` to `npm.pkg.github.com`, and creates the GitHub Release.

---

## 2. Configuring Consumer Repositories to Install the Package

To allow other repositories to install `@joxpg/akretrix-ui`, two items are required:

### Step 1: Add `.npmrc` to the Consumer Repository

In the root of `akretrix-elearning` and `akretrix-landing-page/frontend`, add a `.npmrc` file:

```ini
@joxpg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

---

### Step 2: Configure GitHub Actions CI/CD in Consumer Repositories

In the consumer repo's GitHub Actions workflow (e.g. `deploy-frontend-s3-cloudfront.yml` or `ci-pr-validation.yml`), configure `actions/setup-node` to inject `NODE_AUTH_TOKEN`:

```yaml
- name: Setup Node.js with GitHub Packages Auth
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'

- name: Install Dependencies
  run: pnpm install --frozen-lockfile
  env:
    # If repositories are under the same personal account/org, GITHUB_TOKEN has read permission:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> **Note for Private Repositories Across Different Accounts**: If the consumer repo cannot read the package using `GITHUB_TOKEN`, create a repository secret called `PAT_PACKAGES_READ` containing a GitHub Personal Access Token with `read:packages` permission, and set `NODE_AUTH_TOKEN: ${{ secrets.PAT_PACKAGES_READ }}`.

---

## 3. Local Machine Developer Setup

For developers to run `pnpm install` on their local workstations:

1. Generate a GitHub Personal Access Token (classic) at:  
   `https://github.com/settings/tokens`  
   with scope: `read:packages`.
2. Add the token to your local `~/.npmrc`:
   ```ini
   @joxpg:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_yourPersonalAccessTokenHere
   ```
   Or export it in your `~/.zshrc` / `~/.bashrc`:
   ```bash
   export NODE_AUTH_TOKEN=ghp_yourPersonalAccessTokenHere
   ```
