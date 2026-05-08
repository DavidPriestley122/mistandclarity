const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const paintings = [
  {
    catalog_number: '0083',
    catalog_reference: '0083-a-24x18-g-f',
    artist_id: 1,
    theme: 'View',
    artists_title: 'Coverack',
    descriptive_title: 'Coverack harbour (in Cornwall)',
    medium_type: 'Watercolour',
    medium_detail: 'Ink and colour on paper',
    dimensions_h: 18,
    dimensions_w: 24,
    signature_location: 'On reverse',
    notes: "Inscribed to reverse (in FCW's hand): 'Coverack' / by Fei Cheng-wu / 1955. Label to reverse: 'CHARLES & CO/[]'. Also (illegible) an earlier inscription.",
    dropbox_link_front: 'https://www.dropbox.com/s/7lbjfikbem6agsz/0083-a-24x18-g-f.tif?dl=0',
    dropbox_link_reverse: 'https://www.dropbox.com/s/n44hth0k9vrg7e9/0083-b-24x18-g-f.tif?dl=0',
    framed: true,
    mounted: true,
    condition: 'Good',
    number_of_seals: 0,
    quality_rating: 75,
    location_code: 'CH, KA',
  },
  {
    catalog_number: '0093',
    catalog_reference: '0093-a-38.5x30-g-f',
    artist_id: 1,
    theme: 'Fish',
    artists_title: null,
    descriptive_title: 'Goldfish',
    medium_type: 'Watercolour',
    medium_detail: 'Ink and colour on paper',
    dimensions_h: 38.5,
    dimensions_w: 30,
    signature_location: 'Front right lower',
    notes: "Inscribed in ink to front: '成武' with one seal.",
    dropbox_link_front: 'https://www.dropbox.com/s/uhhsg4yj0h8gqm8/0093-a-38.5x30-g-f.tif?dl=0',
    dropbox_link_reverse: null,
    framed: true,
    mounted: true,
    condition: 'Good (needs new frame)',
    number_of_seals: 1,
    quality_rating: 70,
    location_code: 'CH,KA',
  },
  {
    catalog_number: '0642',
    catalog_reference: '0642-a-30x22.5-s-f',
    artist_id: 1,
    theme: 'View',
    artists_title: null,
    descriptive_title: 'Boat at a lakeside',
    medium_type: 'Watercolour',
    medium_detail: 'Pencil and colour on paper',
    dimensions_h: 22.5,
    dimensions_w: 30,
    signature_location: 'Front left lower, in pencil',
    notes: "Date: 1953\nPencilled lower left: 'Fei ’53'. Comment: Western style. Location unidentified yet.",
    dropbox_link_front: 'https://www.dropbox.com/s/r586dw1kdeuq7gj/0642-a-30x22.5-s-f.tif?dl=0',
    dropbox_link_reverse: null,
    framed: false,
    mounted: true,
    condition: 'Mount a bit discoloured',
    number_of_seals: 0,
    quality_rating: 75,
    location_code: 'O TF',
  },
  {
    catalog_number: '1417',
    catalog_reference: '1417-a-46.5x9.5-f-z',
    artist_id: 1,
    theme: 'View',
    artists_title: null,
    descriptive_title: 'Sunset on long beach with blue yacht',
    medium_type: 'Watercolour',
    medium_detail: 'Pencil and colour on paper',
    dimensions_h: 9.5,
    dimensions_w: 46,
    signature_location: 'On mount in pencil',
    notes: "Signed on mount: 'Fei Cheng-wu' and '1970s'. Comment: unclear if name and date inscribed at the same time.",
    dropbox_link_front: 'https://www.dropbox.com/s/phvkpzuesm6spn9/1417-a-46.5x9.5-g-f.tif?dl=0',
    dropbox_link_reverse: null,
    framed: false,
    mounted: true,
    condition: 'Good',
    number_of_seals: 0,
    quality_rating: 75,
    location_code: 'STF1',
  },
  {
    catalog_number: '1611',
    catalog_reference: '1611-a-72.5x30.5-g-z',
    artist_id: 2,
    theme: 'Birds and trees',
    artists_title: 'Spring Flight',
    descriptive_title: 'Sparrows and willow',
    medium_type: 'Watercolour',
    medium_detail: 'Ink and colour on paper',
    dimensions_h: 72.5,
    dimensions_w: 30.5,
    signature_location: 'Front left upper',
    notes: "Date: 1957\nInscribed in ink to front: '一九五七年張蒨英寫於倫敦' with three seals. Labels to reverse: first label: 'THE TRYON GALLERY/[address]/TITLE \"Spring Flight\"/ARTIST by Chien-ying Chang'; second label: 'JAMES BOURLET & SONS/[]/L0309/[]'; inscribed number (twice): 'A271'; chalked: 'Chang 3'. Comment: backboard re-used or re-labelled.",
    dropbox_link_front: 'https://www.dropbox.com/s/4l36fux6ijighgp/1611-a-72.5x30.5-g-z.tif?dl=0',
    dropbox_link_reverse: 'https://www.dropbox.com/s/1xw18s9dz6vd6fg/1611-b-72.5x30.5-g-z.tif?dl=0',
    framed: true,
    mounted: true,
    condition: 'Good',
    number_of_seals: 3,
    quality_rating: 75,
    location_code: 'CH/KA',
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
