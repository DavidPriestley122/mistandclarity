require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const FRONT_DIR = path.join(__dirname, 'extracted-images', 'front');
const REVERSE_DIR = path.join(__dirname, 'extracted-images', 'reverse');

async function updateImageUrls() {
  try {
    console.log('Updating database with JPEG URLs...\n');

    // Get all paintings
    const result = await pool.query('SELECT id, catalog_reference FROM paintings ORDER BY id');
    const paintings = result.rows;

    console.log(`Processing ${paintings.length} paintings...\n`);

    // Get available image files
    const frontFiles = await fs.readdir(FRONT_DIR);
    const reverseFiles = await fs.readdir(REVERSE_DIR);

    const frontSet = new Set(frontFiles);
    const reverseSet = new Set(reverseFiles);

    let updatedFront = 0;
    let updatedReverse = 0;
    let skipped = 0;

    for (const painting of paintings) {
      const catalogRef = painting.catalog_reference;

      // Extract catalog number from catalog_reference
      // Format: "0003-a-81.5x65-y-o" -> catalog number "0003"
      const match = catalogRef.match(/^(\d+)-([ab])-/);

      if (!match) {
        console.log(`⚠️  Skipping (cannot parse): ${catalogRef}`);
        skipped++;
        continue;
      }

      const [, catalogNum] = match;

      // Determine JPEG URLs
      const frontImage = `${catalogNum}-a.jpg`;
      const reverseImage = `${catalogNum}-b.jpg`;

      const jpegUrlFront = frontSet.has(frontImage) ? `/images/front/${frontImage}` : null;
      const jpegUrlReverse = reverseSet.has(reverseImage) ? `/images/reverse/${reverseImage}` : null;

      // Update database
      await pool.query(
        'UPDATE paintings SET jpeg_url_front = $1, jpeg_url_reverse = $2 WHERE id = $3',
        [jpegUrlFront, jpegUrlReverse, painting.id]
      );

      if (jpegUrlFront) updatedFront++;
      if (jpegUrlReverse) updatedReverse++;

      // Log progress every 50 paintings
      if ((updatedFront + updatedReverse) % 100 === 0) {
        console.log(`Progress: ${updatedFront} front, ${updatedReverse} reverse URLs added...`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Paintings with front images:   ${updatedFront}`);
    console.log(`✅ Paintings with reverse images: ${updatedReverse}`);
    console.log(`⚠️  Skipped:                       ${skipped}`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateImageUrls();
