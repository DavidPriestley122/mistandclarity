import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes to prerender with their SEO metadata
const routes = [
  {
    path: '/',
    title: 'Vermillion Pavilion - Paintings by Chang Chien-ying and Fei Cheng-wu',
    description: 'Explore the paintings of Chang Chien-ying and Fei Cheng-wu, the first Chinese academically trained artists to settle permanently in Britain. Discover their remarkable collection from Chongqing to London.'
  },
  {
    path: '/gallery',
    title: 'Gallery - Vermillion Pavilion',
    description: 'Browse exhibitions of Chinese paintings by Chang Chien-ying and Fei Cheng-wu from the Vermillion Pavilion studio.'
  },
  {
    path: '/collection',
    title: 'About the Collection - Vermillion Pavilion',
    description: 'Discover the remarkable collection of paintings by Chang Chien-ying and Fei Cheng-wu, preserved from their London studio. Learn about their exhibitions and the ongoing research since 2003.'
  },
  {
    path: '/intro',
    title: 'The Artists\' Story - Vermillion Pavilion',
    description: 'From the artistic heart of wartime Chongqing to a lifetime in London. Discover the extraordinary journey of Chang Chien-ying and Fei Cheng-wu, sent to Britain by Xu Beihong in 1946.'
  },
  {
    path: '/artists',
    title: 'The Artists - Vermillion Pavilion',
    description: 'Chang Chien-ying (1909-2003) and Fei Cheng-wu (1911-2000), the first Chinese academically trained artists to settle permanently in Britain. Read their biographies and view their works.'
  },
  {
    path: '/artist/chang-chien-ying',
    title: 'Chang Chien-ying (1909-2003) - Vermillion Pavilion',
    description: 'Biography of Chang Chien-ying (張蒨英), 1909-2003. Chang Chien-ying was born in 1909 in Wuxi, Jiangsu province. She studied calligraphy as a child under the guidance of her father...'
  },
  {
    path: '/artist/fei-cheng-wu',
    title: 'Fei Cheng-wu (1911-2000) - Vermillion Pavilion',
    description: 'Biography of Fei Cheng-wu (費成武), 1911-2000. Fei Cheng-wu was born in 1911 in Wujiang, Jiangsu province, into an accomplished family of politicians, architects, and academics...'
  },
  {
    path: '/contact',
    title: 'Contact - Vermillion Pavilion',
    description: 'Contact us for pricing information, condition reports, framing and mounting details, or to arrange a viewing of paintings by Chang Chien-ying and Fei Cheng-wu.'
  }
];

async function prerender() {
  console.log('🚀 Starting prerendering...');

  const distPath = join(__dirname, 'dist');

  // Read the built index.html
  const indexPath = join(distPath, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf-8');

  for (const route of routes) {
    console.log(`Prerendering ${route.path}...`);

    // Replace title and meta description in the HTML
    let html = indexHtml;

    // Replace title tag
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${route.title}</title>`
    );

    // Replace meta description
    html = html.replace(
      /<meta name="description" content=".*?" ?\/?>/,
      `<meta name="description" content="${route.description}" />`
    );

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
