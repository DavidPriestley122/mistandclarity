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

async function verifyImages() {
  try {
    console.log('Verifying extracted images against database...\n');

    // Get all paintings from database
    const result = await pool.query('SELECT id, catalog_reference FROM paintings ORDER BY catalog_reference');
    const paintings = result.rows;

    console.log(`Database has ${paintings.length} paintings\n`);

    // Get extracted files
    const frontFiles = await fs.readdir(FRONT_DIR);
    const reverseFiles = await fs.readdir(REVERSE_DIR);

    console.log(`Extracted ${frontFiles.length} front images`);
    console.log(`Extracted ${reverseFiles.length} reverse images\n`);

    // Check matches
    let matchedFront = 0;
    let matchedReverse = 0;
    let missingFront = [];
    let missingReverse = [];

    for (const painting of paintings) {
      const catalogRef = painting.catalog_reference;

      // Extract catalog number and side from catalog_reference
      // Format: "0003-a-81.5x65-y-o" -> catalog number "0003", side "a"
      const match = catalogRef.match(/^(\d+)-([ab])-/);

      if (!match) {
        console.log(`⚠️  Cannot parse: ${catalogRef}`);
        continue;
      }

      const [, catalogNum, side] = match;

      // Check for front image
      const frontImage = `${catalogNum}-a.jpg`;
      if (frontFiles.includes(frontImage)) {
        matchedFront++;
      } else {
        missingFront.push(catalogNum);
      }

      // Check for reverse image (optional)
      const reverseImage = `${catalogNum}-b.jpg`;
      if (reverseFiles.includes(reverseImage)) {
        matchedReverse++;
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Matched front images:   ${matchedFront}/${paintings.length}`);
    console.log(`✅ Matched reverse images: ${matchedReverse}/${paintings.length}`);
    console.log(`❌ Missing front images:   ${missingFront.length}`);

    if (missingFront.length > 0 && missingFront.length <= 20) {
      console.log(`\nMissing front images for catalog refs: ${missingFront.join(', ')}`);
    }

    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

verifyImages();
