const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TARGET_NUMBERS = ['0093', '1611', '0083', '1417', '0642', '0648'];

const artistMap = {};

function yesNoToBoolean(value) {
  if (!value) return null;
  const str = String(value).toLowerCase().trim();
  if (str === 'yes') return true;
  if (str === 'no') return false;
  return null;
}

function parseQuality(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  if (str === 'N/A' || str === 'NA') return null;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

function parseSeals(value) {
  if (!value) return null;
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
}

function parseDimension(value) {
  if (!value) return null;
  if (typeof value === 'number') return value;
  const match = String(value).match(/[\d.]+/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }
  return null;
}

function dateToString(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

async function getOrCreateArtist(artistName) {
  if (!artistName || artistName.toLowerCase() === 'no') return null;
  if (artistMap[artistName]) return artistMap[artistName];

  const result = await pool.query(
    `SELECT id FROM artists WHERE name_preferred ILIKE $1 OR name_pinyin ILIKE $1`,
    [artistName]
  );

  if (result.rows.length > 0) {
    artistMap[artistName] = result.rows[0].id;
    return result.rows[0].id;
  }

  const newArtist = await pool.query(
    `INSERT INTO artists (name_preferred, name_pinyin) VALUES ($1, $1) RETURNING id`,
    [artistName]
  );
  artistMap[artistName] = newArtist.rows[0].id;
  console.log(`Created new artist: ${artistName}`);
  return newArtist.rows[0].id;
}

async function importSelected() {
  try {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile('MrandMrsFeiPaintingsForWebsite.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const rows = data.filter(row => {
      const num = row.Number ? String(row.Number).trim().padStart(4, '0') : null;
      return num && TARGET_NUMBERS.includes(num);
    });

    console.log(`Found ${rows.length} matching rows for: ${TARGET_NUMBERS.join(', ')}`);

    if (rows.length < TARGET_NUMBERS.length) {
      const found = rows.map(r => String(r.Number).trim().padStart(4, '0'));
      const missing = TARGET_NUMBERS.filter(n => !found.includes(n));
      console.warn(`WARNING: Not found in spreadsheet: ${missing.join(', ')}`);
    }

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const artistId = await getOrCreateArtist(row.Artist);
      const catalogNumber = row.Number ? String(row.Number).trim().padStart(4, '0') : null;
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

      let combinedNotes = notes || '';
      if (dateGiven && typeof dateGiven === 'string' && dateGiven.toLowerCase() !== 'no') {
        combinedNotes = `Date: ${dateGiven}\n${combinedNotes}`.trim();
      }

      const result = await pool.query(
        `INSERT INTO paintings (
          catalog_number, catalog_reference, artist_id, theme,
          artists_title, descriptive_title, medium_type, medium_detail,
          dimensions_h, dimensions_w, signature_location, notes,
          dropbox_link_front, dropbox_link_reverse,
          framed, mounted, condition, number_of_seals,
          quality_rating, location_code
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
        ON CONFLICT (catalog_number) DO NOTHING
        RETURNING id`,
        [
          catalogNumber, catalogReference, artistId, theme,
          artistsTitle, descriptiveTitle, mediumType, mediumDetail,
          dimensionsH, dimensionsW, signatureLocation, combinedNotes,
          dropboxFront, dropboxReverse,
          framed, mounted, condition, seals,
          quality, location
        ]
      );

      if (result.rows.length > 0) {
        console.log(`  Inserted: ${catalogNumber} — ${artistsTitle || descriptiveTitle || '(untitled)'} (id=${result.rows[0].id})`);
        inserted++;
      } else {
        console.log(`  Skipped (already exists): ${catalogNumber}`);
        skipped++;
      }
    }

    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await pool.end();
  }
}

importSelected();
