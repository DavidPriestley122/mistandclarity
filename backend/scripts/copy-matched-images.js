require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SOURCE_FRONT_DIR = path.join(__dirname, 'extracted-images', 'front');
const SOURCE_REVERSE_DIR = path.join(__dirname, 'extracted-images', 'reverse');
const DEST_DIR = path.join(__dirname, 'images');
const DEST_FRONT_DIR = path.join(DEST_DIR, 'front');
const DEST_REVERSE_DIR = path.join(DEST_DIR, 'reverse');

async function copyMatchedImages() {
  try {
    console.log('Copying only matched images for the 580 paintings...\n');

    // Create destination directories
    await fs.mkdir(DEST_DIR, { recursive: true });
    await fs.mkdir(DEST_FRONT_DIR, { recursive: true });
    await fs.mkdir(DEST_REVERSE_DIR, { recursive: true });

    // Get all paintings with JPEG URLs
    const result = await pool.query(
      'SELECT jpeg_url_front, jpeg_url_reverse FROM paintings WHERE jpeg_url_front IS NOT NULL'
    );
    const paintings = result.rows;

    console.log(`Found ${paintings.length} paintings with images\n`);

    let copiedFront = 0;
    let copiedReverse = 0;

    for (const painting of paintings) {
      // Copy front image
      if (painting.jpeg_url_front) {
        // Extract filename from path like "/images/front/0003-a.jpg"
        const filename = path.basename(painting.jpeg_url_front);
        const sourcePath = path.join(SOURCE_FRONT_DIR, filename);
        const destPath = path.join(DEST_FRONT_DIR, filename);

        try {
          await fs.copyFile(sourcePath, destPath);
          copiedFront++;
        } catch (err) {
          console.error(`❌ Failed to copy ${filename}: ${err.message}`);
        }
      }

      // Copy reverse image if it exists
      if (painting.jpeg_url_reverse) {
        const filename = path.basename(painting.jpeg_url_reverse);
        const sourcePath = path.join(SOURCE_REVERSE_DIR, filename);
        const destPath = path.join(DEST_REVERSE_DIR, filename);

        try {
          await fs.copyFile(sourcePath, destPath);
          copiedReverse++;
        } catch (err) {
          console.error(`❌ Failed to copy ${filename}: ${err.message}`);
        }
      }

      // Log progress
      if ((copiedFront + copiedReverse) % 50 === 0) {
        console.log(`Progress: ${copiedFront} front, ${copiedReverse} reverse...`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('COPY COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Front images copied:   ${copiedFront}`);
    console.log(`✅ Reverse images copied: ${copiedReverse}`);
    console.log(`📁 Destination:           ${DEST_DIR}`);
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

copyMatchedImages();
