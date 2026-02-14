const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// Source: Dropbox folder (Windows path accessed via WSL)
const SOURCE_DIR = '/mnt/c/Users/David/Dropbox/Mr and Mrs Fei Excel listing/z、f字畫拍攝文件';

// Destination: organized images folder
const DEST_DIR = path.join(__dirname, 'extracted-images');
const FRONT_DIR = path.join(DEST_DIR, 'front');
const REVERSE_DIR = path.join(DEST_DIR, 'reverse');

async function extractImages() {
  console.log('Starting image extraction...\n');

  // Create destination directories
  await fs.mkdir(DEST_DIR, { recursive: true });
  await fs.mkdir(FRONT_DIR, { recursive: true });
  await fs.mkdir(REVERSE_DIR, { recursive: true });

  // Find all JPG files
  console.log('Searching for JPG files...');
  const pattern = `${SOURCE_DIR}/**/*.JPG`;
  const files = await glob(pattern, { nocase: true });

  console.log(`Found ${files.length} JPG files\n`);

  let copiedFront = 0;
  let copiedReverse = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filename = path.basename(file);

      // Extract catalog number and side from filename
      // Format: 0001-a-91.5x71-ym-o.JPG
      const match = filename.match(/^(\d+)-([ab])-/);

      if (!match) {
        console.log(`⚠️  Skipping (no match): ${filename}`);
        skipped++;
        continue;
      }

      const [, catalogNum, side] = match;
      const catalogNumber = parseInt(catalogNum, 10);

      // Determine destination directory
      const destDir = side === 'a' ? FRONT_DIR : REVERSE_DIR;

      // New filename: just catalog number, side, and original extension
      // e.g., 0001-a.jpg or 0002-b.jpg
      const newFilename = `${catalogNum}-${side}.jpg`;
      const destPath = path.join(destDir, newFilename);

      // Copy file
      await fs.copyFile(file, destPath);

      if (side === 'a') {
        copiedFront++;
      } else {
        copiedReverse++;
      }

      // Log progress every 50 files
      if ((copiedFront + copiedReverse) % 50 === 0) {
        console.log(`Progress: ${copiedFront + copiedReverse} files copied...`);
      }

    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Front images:   ${copiedFront}`);
  console.log(`✅ Reverse images: ${copiedReverse}`);
  console.log(`⚠️  Skipped:        ${skipped}`);
  console.log(`❌ Errors:         ${errors}`);
  console.log(`📁 Destination:    ${DEST_DIR}`);
  console.log('='.repeat(60));
}

// Run the extraction
extractImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
