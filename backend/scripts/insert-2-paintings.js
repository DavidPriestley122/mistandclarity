const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const paintings = [
  {
    catalog_number: '0728',
    catalog_reference: '0728-a-37x31-g-z',
    artist_id: 2,
    theme: 'Fish',
    artists_title: null,
    descriptive_title: 'Ornamental goldfish',
    medium_type: 'Watercolour',
    medium_detail: 'Ink and colour on paper',
    dimensions_h: 37,
    dimensions_w: 31,
    signature_location: 'Front left lower, and pencil',
    notes: "Inscribed in ink to front: '蒨英' with one seal. [Not in photos. Noted by DP]: Pencilled to reverse: 'C.Y.Chang'.",
    dropbox_link_front: 'https://www.dropbox.com/s/woxbe3ta2nygw5s/0728-a-37x31-g-z.tif?dl=0',
    dropbox_link_reverse: null,
    framed: false,
    mounted: true,
    condition: 'Good',
    number_of_seals: 1,
    quality_rating: 75,
    location_code: 'Mrs Fei TF6 (overflow b)',
  },
  {
    catalog_number: '1152',
    catalog_reference: '1152-a-67.5x23.5-g-z',
    artist_id: 2,
    theme: 'Fish',
    artists_title: null,
    descriptive_title: 'Fish in a pond with waterplants',
    medium_type: 'Watercolour',
    medium_detail: 'Ink and colour on paper',
    dimensions_h: 67.5,
    dimensions_w: 23.5,
    signature_location: 'Front left middle',
    notes: "Inscribed in ink to front: '蒨英寫' with three seals.",
    dropbox_link_front: 'https://www.dropbox.com/s/sjr9p7aifiimp9y/1152-a-67.5x23.5-g-z.tif?dl=0',
    dropbox_link_reverse: null,
    framed: false,
    mounted: true,
    condition: 'Good',
    number_of_seals: 3,
    quality_rating: 75,
    location_code: 'O BF1',
  },
];

async function insertPaintings() {
  let inserted = 0;
  let skipped = 0;

  for (const p of paintings) {
    const result = await pool.query(
      `INSERT INTO paintings (
        catalog_number, catalog_reference, artist_id, theme,
        artists_title, descriptive_title, medium_type, medium_detail,
        dimensions_h, dimensions_w, signature_location, notes,
        dropbox_link_front, dropbox_link_reverse,
        framed, mounted, condition, number_of_seals,
        quality_rating, location_code
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT DO NOTHING
      RETURNING id`,
      [
        p.catalog_number, p.catalog_reference, p.artist_id, p.theme,
        p.artists_title, p.descriptive_title, p.medium_type, p.medium_detail,
        p.dimensions_h, p.dimensions_w, p.signature_location, p.notes,
        p.dropbox_link_front, p.dropbox_link_reverse,
        p.framed, p.mounted, p.condition, p.number_of_seals,
        p.quality_rating, p.location_code,
      ]
    );

    if (result.rows.length > 0) {
      console.log(`  Inserted: ${p.catalog_number} — ${p.artists_title || p.descriptive_title} (id=${result.rows[0].id})`);
      inserted++;
    } else {
      console.log(`  Skipped (already exists): ${p.catalog_number}`);
      skipped++;
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
  await pool.end();
}

insertPaintings().catch(err => { console.error(err); pool.end(); });
