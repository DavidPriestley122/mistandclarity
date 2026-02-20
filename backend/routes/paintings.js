const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// Get all paintings (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { artist_id, theme, limit, offset } = req.query;

    let query = `
      SELECT p.*, a.name_preferred as artist_name, a.name_pinyin
      FROM paintings p
      LEFT JOIN artists a ON p.artist_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (artist_id) {
      query += ` AND p.artist_id = $${paramCount}`;
      params.push(artist_id);
      paramCount++;
    }

    if (theme) {
      query += ` AND p.theme ILIKE $${paramCount}`;
      params.push(`%${theme}%`);
      paramCount++;
    }

    query += ' ORDER BY p.catalog_number';

    if (limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
      paramCount++;
    }

    if (offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(offset);
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch paintings' });
  }
});

// Get single painting by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT p.*, a.name_preferred as artist_name, a.name_pinyin
       FROM paintings p
       LEFT JOIN artists a ON p.artist_id = a.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch painting' });
  }
});

// Create new painting
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      catalog_number, catalog_reference, artist_id, theme,
      artists_title, descriptive_title, medium_type, medium_detail,
      dimensions_h, dimensions_w, signature_location, notes,
      dropbox_link_front, dropbox_link_reverse,
      framed, mounted, condition, number_of_seals,
      quality_rating, location_code
    } = req.body;

    const result = await db.query(
      `INSERT INTO paintings (
        catalog_number, catalog_reference, artist_id, theme,
        artists_title, descriptive_title, medium_type, medium_detail,
        dimensions_h, dimensions_w, signature_location, notes,
        dropbox_link_front, dropbox_link_reverse,
        framed, mounted, condition, number_of_seals,
        quality_rating, location_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        catalog_number, catalog_reference, artist_id, theme,
        artists_title, descriptive_title, medium_type, medium_detail,
        dimensions_h, dimensions_w, signature_location, notes,
        dropbox_link_front, dropbox_link_reverse,
        framed, mounted, condition, number_of_seals,
        quality_rating, location_code
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create painting' });
  }
});

// Update painting
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.values(updates);

    const result = await db.query(
      `UPDATE paintings SET ${fields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update painting' });
  }
});

// Delete painting
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM paintings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found' });
    }

    res.json({ message: 'Painting deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete painting' });
  }
});

module.exports = router;
