import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes to prerender with their expected titles and descriptions
const routes = [
  { path: '/', title: 'Vermillion Pavilion - Paintings by Chang Chien-ying and Fei Cheng-wu' },
  { path: '/gallery', title: 'Gallery - Vermillion Pavilion' },
  { path: '/collection', title: 'About the Collection - Vermillion Pavilion' },
  { path: '/intro', title: 'The Artists\' Story - Vermillion Pavilion' },
  { path: '/artists', title: 'The Artists - Vermillion Pavilion' },
  { path: '/artist/chang-chien-ying', title: 'Chang Chien-ying (1909-2003) - Vermillion Pavilion' },
  { path: '/artist/fei-cheng-wu', title: 'Fei Cheng-wu (1911-2000) - Vermillion Pavilion' },
  { path: '/contact', title: 'Contact - Vermillion Pavilion' }
];

async function prerender() {
  console.log('🚀 Starting prerendering...');

  const distPath = join(__dirname, 'dist');

  // Read the built index.html
  const indexPath = join(distPath, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf-8');

  // Read the built JavaScript
  const assetsPath = join(distPath, 'assets');
  const files = await fs.readdir(assetsPath);
  const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

  if (!jsFile) {
    throw new Error('Could not find built JavaScript file');
  }

  const jsPath = join(assetsPath, jsFile);
  const jsContent = await fs.readFile(jsPath, 'utf-8');

  for (const route of routes) {
    console.log(`Prerendering ${route.path}...`);

    // Create a DOM from the index.html
    const dom = new JSDOM(indexHtml, {
      url: `http://localhost${route.path}`,
      runScripts: 'dangerously',
      resources: 'usable',
      beforeParse(window) {
        // Make the route available to the script
        window.location.pathname = route.path;
      }
    });

    // Execute the JavaScript
    try {
      const scriptEl = dom.window.document.createElement('script');
      scriptEl.textContent = jsContent;
      dom.window.document.body.appendChild(scriptEl);

      // Wait a moment for JavaScript to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the title directly
      dom.window.document.title = route.title;

    } catch (error) {
      console.error(`Error executing JavaScript for ${route.path}:`, error.message);
    }

    // Get the rendered HTML
    const html = dom.serialize();

    // Create directory structure if needed
    const routePath = route.path === '/' ? '' : route.path;
    const outputDir = join(distPath, routePath);

    if (routePath) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Write the HTML file
    const outputPath = join(outputDir, 'index.html');
    await fs.writeFile(outputPath, html);

    console.log(`✅ Prerendered ${route.path} -> ${outputPath}`);
  }

  console.log('✨ Prerendering complete!');
}

prerender().catch(console.error);
