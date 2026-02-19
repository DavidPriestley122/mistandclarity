// Generates dist/sitemap.xml during build by fetching live data from the API
import { writeFileSync } from 'fs';

const BASE_URL = 'https://vermillionpavilion.com';
const API_URL = 'https://mistandclarity-production.up.railway.app/api';

const STATIC_PAGES = [
  { url: '/',                  priority: '1.0', changefreq: 'monthly' },
  { url: '/gallery',          priority: '0.9', changefreq: 'weekly'  },
  { url: '/artists',          priority: '0.8', changefreq: 'monthly' },
  { url: '/artist/chang-chien-ying', priority: '0.8', changefreq: 'monthly' },
  { url: '/artist/fei-cheng-wu',     priority: '0.8', changefreq: 'monthly' },
  { url: '/intro',            priority: '0.7', changefreq: 'monthly' },
  { url: '/collection',       priority: '0.7', changefreq: 'monthly' },
  { url: '/contact',          priority: '0.6', changefreq: 'monthly' },
];

function urlEntry({ url, priority, changefreq }) {
  return `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`.trimStart();
}

async function fetchJson(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const entries = [...STATIC_PAGES.map(urlEntry)];

  try {
    // Active exhibitions
    const collections = await fetchJson('/collections');
    const active = collections.filter(c => c.is_active);
    for (const col of active) {
      entries.push(urlEntry({ url: `/exhibition/${col.id}`, priority: '0.8', changefreq: 'weekly' }));
    }
    console.log(`   Added ${active.length} exhibition(s)`);

  } catch (err) {
    console.warn('   Warning: could not fetch dynamic pages:', err.message);
    console.warn('   Sitemap will contain static pages only');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  writeFileSync('dist/sitemap.xml', xml);
  console.log(`✅ Sitemap written with ${entries.length} URLs`);
}

generateSitemap().catch(err => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
