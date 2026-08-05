import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('AkreTrix UI Package Verification Suite', async (t) => {
  await t.test('1. Package manifest integrity', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    assert.equal(pkg.name, '@joxpg/akretrix-ui');
    assert.ok(pkg.version, 'Package version must be defined');
    assert.equal(pkg.publishConfig?.registry, 'https://npm.pkg.github.com');
  });

  await t.test('2. Built distribution files exist after build', () => {
    const distPath = path.join(rootDir, 'dist');
    assert.ok(fs.existsSync(path.join(distPath, 'index.js')), 'dist/index.js must exist');
    assert.ok(fs.existsSync(path.join(distPath, 'index.d.ts')), 'dist/index.d.ts must exist');
    assert.ok(fs.existsSync(path.join(distPath, 'styles/theme.css')), 'dist/styles/theme.css must exist');
  });

  await t.test('3. Verify TypeScript declarations and JS exports', () => {
    const dtsContent = fs.readFileSync(path.join(rootDir, 'dist/index.d.ts'), 'utf-8');
    const jsContent = fs.readFileSync(path.join(rootDir, 'dist/index.js'), 'utf-8');
    
    assert.ok(dtsContent.includes('ContactModal'), 'index.d.ts must declare ContactModal');
    assert.ok(dtsContent.includes('PrivacyPolicyModal'), 'index.d.ts must declare PrivacyPolicyModal');
    assert.ok(dtsContent.includes('TurnstileWidget'), 'index.d.ts must declare TurnstileWidget');

    assert.ok(jsContent.includes('ContactModal'), 'index.js must export ContactModal');
    assert.ok(jsContent.includes('PrivacyPolicyModal'), 'index.js must export PrivacyPolicyModal');
    assert.ok(jsContent.includes('TurnstileWidget'), 'index.js must export TurnstileWidget');
  });
});
