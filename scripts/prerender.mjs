/**
 * Build-time pre-rendering for the public/crawlable routes.
 *
 * Why a headless browser instead of ReactDOMServer.renderToString: src/utils/i18n.js
 * and src/utils/api.js read window/localStorage/navigator at module-import time (not
 * inside effects), and AuthContext reads localStorage inside useState initializers
 * during render — all of that throws in a bare Node process. PageMeta also does its
 * per-page title/description/canonical work in a useEffect, which never runs during
 * renderToString. A real Chromium page sidesteps all of it and captures the exact DOM
 * a visitor would see, including PageMeta's corrected tags, with no source changes.
 *
 * Only the 6 URLs robots.txt/sitemap.xml actually mark as crawlable are included.
 * /forgot-password, /reset-password, /verify-email are Disallow'd — intentionally
 * excluded.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

// path -> expected <title> once PageMeta's effect has run; used as a concrete
// readiness signal instead of trusting networkidle alone. Sourced directly from
// each page's own <PageMeta title="..."> prop, so this can't silently drift.
const ROUTES = [
  { path: '/', title: 'AI Leadership Coaching & Resilience Training | Human First AI' },
  { path: '/login', title: 'Sign In | Human First AI' },
  { path: '/register', title: 'Create Your Account | Human First AI' },
  { path: '/privacy-policy', title: 'Privacy Policy | Human First AI' },
  { path: '/terms-of-service', title: 'Terms of Service | Human First AI' },
  { path: '/cookie-policy', title: 'Cookie Policy | Human First AI' },
];

function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url)
        .then(() => resolve())
        .catch((err) => {
          if (Date.now() > deadline) {
            reject(new Error(`Preview server never came up at ${url}: ${err.message}`));
          } else {
            setTimeout(attempt, 200);
          }
        });
    };
    attempt();
  });
}

// Race any cleanup step against a hard deadline. Headless Chromium spawns several
// internal sub-processes (GPU, renderer, zygote); in a container without a proper
// init process to reap them, browser.close() can hang forever waiting for a clean
// shutdown confirmation that never arrives. Never let cleanup block final exit.
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
}

async function main() {
  // Spawn Vite's local binary directly rather than through `npx` — npx can leave
  // an extra process layer between this script and the real server, which makes
  // preview.kill() unreliable at cleanup time.
  const viteBin = join(ROOT, 'node_modules', '.bin', 'vite');
  const preview = spawn(viteBin, ['preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
  preview.stderr.on('data', (d) => process.stderr.write(`[vite preview] ${d}`));

  let browser;
  try {
    await waitForServer(BASE_URL);

    browser = await chromium.launch();
    const page = await browser.newPage();

    const captured = [];
    for (const route of ROUTES) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(
        (expectedTitle) => document.title === expectedTitle,
        route.title,
        { timeout: 10000 }
      );
      const html = await page.content();
      captured.push({ path: route.path, html });
      console.log(`Captured ${route.path} ("${route.title}")`);
    }

    // Write only after every route is captured — writing mid-loop risks the
    // preview server serving an already-overwritten shell to a later navigation.
    for (const { path, html } of captured) {
      const outPath =
        path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html');
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, 'utf-8');
      console.log(`Wrote ${outPath}`);
    }
  } finally {
    await withTimeout(browser?.close() ?? Promise.resolve(), 5000);
    preview.kill('SIGKILL');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
