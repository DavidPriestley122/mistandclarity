const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all artists
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM artists ORDER BY name_preferred'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Get single artist with their paintings
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const artistResult = await db.query(
      'SELECT * FROM artists WHERE id = $1',
      [id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const paintingsResult = await db.query(
      'SELECT * FROM paintings WHERE artist_id = $1 ORDER BY catalog_number',
      [id]
    );

    res.json({
      artist: artistResult.rows[0],
      paintings: paintingsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// Create new artist
router.post('/', async (req, res) => {
  try {
    const { name_preferred, name_pinyin, bio, birth_year, death_year } = req.body;

    const result = await db.query(
      `INSERT INTO artists (name_preferred, name_pinyin, bio, birth_year, death_year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name_preferred, name_pinyin, bio, birth_year, death_year]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// Update artist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_preferred, name_pinyin, bio, birth_year, death_year } = req.body;

    const result = await db.query(
      `UPDATE artists
       SET name_preferred = COALESCE($1, name_preferred),
           name_pinyin = COALESCE($2, name_pinyin),
           bio = COALESCE($3, bio),
           birth_year = COALESCE($4, birth_year),
           death_year = COALESCE($5, death_year),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name_preferred, name_pinyin, bio, birth_year, death_year, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

module.exports = router;
