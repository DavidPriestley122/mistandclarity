import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Site URL (can be overridden via environment variable)
const SITE_URL = process.env.PRERENDER_URL || 'http://localhost:8080';

// Routes to prerender
const routes = [
  '/',
  '/gallery',
  '/collection',
  '/intro',
  '/artists',
  '/artist/chang-chien-ying',
  '/artist/fei-cheng-wu',
  '/contact'
];

async function prerender() {
  console.log(`🚀 Starting prerendering from ${SITE_URL}...`);

  const distPath = join(__dirname, 'dist');
  let browser;

  try {
    // Launch browser with options for CI environments
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext();

    for (const route of routes) {
      console.log(`📄 Prerendering ${route}...`);

      const page = await context.newPage();
      const url = `${SITE_URL}${route}`;

      try {
        // Navigate and wait for content to load
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait a bit extra for any dynamic content
        await page.waitForTimeout(1000);

        // Get the fully rendered HTML
        const html = await page.content();

        // Create directory structure if needed
        const routePath = route === '/' ? '' : route;
        const outputDir = join(distPath, routePath);

        if (routePath) {
          await fs.mkdir(outputDir, { recursive: true });
        }

        // Write the HTML file
        const outputPath = join(outputDir, 'index.html');
        await fs.writeFile(outputPath, html);

        console.log(`✅ Prerendered ${route} -> ${outputPath}`);

      } catch (error) {
        console.error(`❌ Failed to prerender ${route}:`, error.message);
      } finally {
        await page.close();
      }
    }

    console.log('✨ Prerendering complete!');

  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

prerender().catch((error) => {
  console.error(error);
  process.exit(1);
});
