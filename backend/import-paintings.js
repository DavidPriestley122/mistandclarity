const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Map artist names to IDs (we'll populate this from the database)
const artistMap = {};

// Helper function to convert Yes/No to boolean
function yesNoToBoolean(value) {
  if (!value) return null;
  const str = String(value).toLowerCase().trim();
  if (str === 'yes') return true;
  if (str === 'no') return false;
  return null;
}

// Helper function to parse quality rating
function parseQuality(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  if (str === 'N/A' || str === 'NA') return null;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

// Helper function to parse number of seals
function parseSeals(value) {
  if (!value) return null;
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
}

// Helper function to parse dimensions (handles "(Head) 56" format)
function parseDimension(value) {
  if (!value) return null;
  if (typeof value === 'number') return value;

  // Extract numbers from strings like "(Head) 56"
  const str = String(value);
  const match = str.match(/[\d.]+/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Helper function to safely convert date to string
function dateToString(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

// Helper function to get or create artist
async function getOrCreateArtist(artistName) {
  if (!artistName || artistName.toLowerCase() === 'no') return null;

  // Check if we already have this artist in our map
  if (artistMap[artistName]) {
    return artistMap[artistName];
  }

  // Try to find existing artist by either preferred name or pinyin
  const result = await pool.query(
    `SELECT id FROM artists
     WHERE name_preferred ILIKE $1 OR name_pinyin ILIKE $1`,
    [artistName]
  );

  if (result.rows.length > 0) {
    artistMap[artistName] = result.rows[0].id;
    return result.rows[0].id;
  }

  // Create new artist
  const newArtist = await pool.query(
    `INSERT INTO artists (name_preferred, name_pinyin)
     VALUES ($1, $1)
     RETURNING id`,
    [artistName]
  );

  artistMap[artistName] = newArtist.rows[0].id;
  console.log(`Created new artist: ${artistName}`);
  return newArtist.rows[0].id;
}

async function importPaintings() {
  try {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile('MrandMrsFeiPaintingsForWebsite.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    console.log(`Found ${data.length} paintings to import`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Get or create artist
        const artistId = await getOrCreateArtist(row.Artist);

        // Prepare data for insertion
        const catalogNumber = row.Number ? String(row.Number) : null;
        const catalogReference = row['Number and\r\n Code of Photo'] || row['Number and Code of Photo'] || null;
        const theme = row.Theme || null;
        const artistsTitle = row["Artist's Title"] || null;
        const descriptiveTitle = row['Descriptive\r\nTitle'] || row['Descriptive Title'] || null;
        const dateGiven = dateToString(row['Date (cyclical\r\n if given)'] || row['Date (cyclical if given)']);
        const mediumType = row.Category || null;
        const mediumDetail = row.Medium || null;
        const dimensionsH = parseDimension(row.Dimensions_H);
        const dimensionsW = parseDimension(row.Dimensions_W);
        const signatureLocation = row.Signature || null;
        const notes = row.Notes || null;
        const dropboxFront = row['Dropbox Link'] || null;
        const dropboxReverse = row['Dropbox Link to Reverse'] || null;
        const framed = yesNoToBoolean(row.Framed);
        const mounted = yesNoToBoolean(row.Mounted);
        const condition = row.Condition || null;
        const seals = parseSeals(row['Number\r\nof Seals'] || row['Number of Seals']);
        const quality = parseQuality(row['Quality\r\n(1 to 100)'] || row['Quality (1 to 100)']);
        const location = row.Location || null;

        // Combine notes with date if date exists
        let combinedNotes = notes || '';
        if (dateGiven && typeof dateGiven === 'string' && dateGiven.toLowerCase() !== 'no') {
          combinedNotes = `Date: ${dateGiven}\n${combinedNotes}`.trim();
        }

        // Insert painting
        await pool.query(
          `INSERT INTO paintings (
            catalog_number, catalog_reference, artist_id, theme,
            artists_title, descriptive_title, medium_type, medium_detail,
            dimensions_h, dimensions_w, signature_location, notes,
            dropbox_link_front, dropbox_link_reverse,
            framed, mounted, condition, number_of_seals,
            quality_rating, location_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
          [
            catalogNumber, catalogReference, artistId, theme,
            artistsTitle, descriptiveTitle, mediumType, mediumDetail,
            dimensionsH, dimensionsW, signatureLocation, combinedNotes,
            dropboxFront, dropboxReverse,
            framed, mounted, condition, seals,
            quality, location
          ]
        );

        imported++;
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} paintings...`);
        }
      } catch (err) {
        console.error(`Error importing row ${row.Index}:`, err.message);
        errors++;
      }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log(`\nArtists created/used: ${Object.keys(artistMap).length}`);
    console.log('Artist list:', Object.keys(artistMap).join(', '));

  } catch (err) {
    console.error('Fatal error during import:', err);
  } finally {
    await pool.end();
  }
}

importPaintings();
