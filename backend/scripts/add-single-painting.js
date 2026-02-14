const { Pool } = require('pg');
require('dotenv').config();

async function addPainting() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding painting S0013...');

    // Get Zhang Qianying's artist ID
    const artistResult = await pool.query(
      `SELECT id FROM artists WHERE name_preferred ILIKE '%Chang Chien-ying%' OR name_preferred ILIKE '%Zhang Qianying%'`
    );

    if (artistResult.rows.length === 0) {
      throw new Error('Artist Zhang Qianying / Chang Chien-ying not found in database');
    }

    const artistId = artistResult.rows[0].id;
    console.log(`Found artist ID: ${artistId}`);

    // Prepare painting data
    const paintingData = {
      catalog_number: '13',
      catalog_reference: 'S0013',
      artist_id: artistId,
      theme: 'View',
      artists_title: 'In the Rain',
      descriptive_title: 'River bank in the rain',
      medium_type: 'Watercolour',
      medium_detail: 'Ink and light colour on paper',
      dimensions_h: 55,
      dimensions_w: 76,
      signature_location: 'Right middle',
      notes: `Date: 1953

Inscribed: '煙水茫茫何處尋 一九五三年冬十一月 蒨英寫於英倫客次' with three seals.

Labels to reverse:
- First label: 'No 5/"IN The Rain"/by/Chang Chien-ying/6/17 De Vere Gardens/W 8'
- Second label: 'CHARLES & CO/..'

Comment: Text refers to the fisherman recluse Yan Guang of the Han dynasty.`,
      dropbox_link_front: 'https://www.dropbox.com/s/wqqi2zf2go3sovh/S0013-a-55x76-g-z.jpg?dl=0',
      dropbox_link_reverse: 'https://www.dropbox.com/s/ltxr05ta7hq5nhx/S0013-b-55x76-g-z.jpg?dl=0',
      framed: true,
      mounted: true,
      condition: 'Good',
      number_of_seals: 3,
      quality_rating: 95,
      location_code: null
    };

    // Check if painting already exists
    const existingCheck = await pool.query(
      'SELECT id FROM paintings WHERE catalog_number = $1 OR catalog_reference = $2',
      [paintingData.catalog_number, paintingData.catalog_reference]
    );

    if (existingCheck.rows.length > 0) {
      console.log('⚠️  Painting already exists in database');
      console.log('Existing painting ID:', existingCheck.rows[0].id);
      return;
    }

    // Insert painting
    const result = await pool.query(
      `INSERT INTO paintings (
        catalog_number, catalog_reference, artist_id, theme,
        artists_title, descriptive_title, medium_type, medium_detail,
        dimensions_h, dimensions_w, signature_location, notes,
        dropbox_link_front, dropbox_link_reverse,
        framed, mounted, condition, number_of_seals,
        quality_rating, location_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id`,
      [
        paintingData.catalog_number,
        paintingData.catalog_reference,
        paintingData.artist_id,
        paintingData.theme,
        paintingData.artists_title,
        paintingData.descriptive_title,
        paintingData.medium_type,
        paintingData.medium_detail,
        paintingData.dimensions_h,
        paintingData.dimensions_w,
        paintingData.signature_location,
        paintingData.notes,
        paintingData.dropbox_link_front,
        paintingData.dropbox_link_reverse,
        paintingData.framed,
        paintingData.mounted,
        paintingData.condition,
        paintingData.number_of_seals,
        paintingData.quality_rating,
        paintingData.location_code
      ]
    );

    console.log('✓ Painting added successfully!');
    console.log('New painting ID:', result.rows[0].id);
    console.log('\nDetails:');
    console.log('- Catalog: 13 (S0013)');
    console.log('- Artist: Chang Chien-ying');
    console.log('- Title: "In the Rain" (River bank in the rain)');
    console.log('- Dimensions: 55 × 76 cm');

  } catch (err) {
    console.error('Error adding painting:', err);
  } finally {
    await pool.end();
  }
}

addPainting();
