require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const missingPaintings = [
  { catalog_number: '0143', id: 915 },
  { catalog_number: '0211', id: 930 },
  { catalog_number: '0292', id: 756 },
  { catalog_number: '0383', id: 963 },
  { catalog_number: '0501', id: 798 },
  { catalog_number: '0502', id: 799 },
  { catalog_number: '0589', id: 1022 },
  { catalog_number: '0595', id: 808 },
  { catalog_number: '0605', id: 1027 },
  { catalog_number: '1599', id: 702 },
  { catalog_number: '1600', id: 865 },
  { catalog_number: '1603', id: 704 },
  { catalog_number: '1609', id: 866 }
];

async function fixMissingImages() {
  try {
    console.log('Fixing 13 paintings with missing image URLs...\n');

    let updated = 0;

    for (const painting of missingPaintings) {
      const jpegUrlFront = `/images/front/${painting.catalog_number}-a.jpg`;

      await pool.query(
        'UPDATE paintings SET jpeg_url_front = $1 WHERE id = $2',
        [jpegUrlFront, painting.id]
      );

      console.log(`✅ Updated catalog ${painting.catalog_number} (ID ${painting.id})`);
      updated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully updated ${updated} paintings`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixMissingImages();
