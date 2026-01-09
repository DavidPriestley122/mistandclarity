const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all collections
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM collections ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get single collection with paintings (in display order)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get collection details
    const collectionResult = await db.query(
      'SELECT * FROM collections WHERE id = $1',
      [id]
    );

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Get paintings in this collection (ordered by display_order)
    const paintingsResult = await db.query(
      `SELECT p.*, cp.display_order, a.name_preferred as artist_name
       FROM paintings p
       JOIN collection_paintings cp ON p.id = cp.painting_id
       LEFT JOIN artists a ON p.artist_id = a.id
       WHERE cp.collection_id = $1
       ORDER BY cp.display_order`,
      [id]
    );

    res.json({
      collection: collectionResult.rows[0],
      paintings: paintingsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Create new collection
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      'INSERT INTO collections (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Update collection
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await db.query(
      `UPDATE collections
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM collections WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json({ message: 'Collection deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Add painting to collection
router.post('/:id/paintings', async (req, res) => {
  try {
    const { id } = req.params;
    const { painting_id } = req.body;

    // Get the current max display_order for this collection
    const maxOrderResult = await db.query(
      'SELECT COALESCE(MAX(display_order), -1) as max_order FROM collection_paintings WHERE collection_id = $1',
      [id]
    );
    const nextOrder = maxOrderResult.rows[0].max_order + 1;

    const result = await db.query(
      `INSERT INTO collection_paintings (collection_id, painting_id, display_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, painting_id, nextOrder]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Painting already in this collection' });
    }
    res.status(500).json({ error: 'Failed to add painting to collection' });
  }
});

// Remove painting from collection
router.delete('/:id/paintings/:painting_id', async (req, res) => {
  try {
    const { id, painting_id } = req.params;

    const result = await db.query(
      'DELETE FROM collection_paintings WHERE collection_id = $1 AND painting_id = $2 RETURNING *',
      [id, painting_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painting not found in collection' });
    }

    res.json({ message: 'Painting removed from collection' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove painting from collection' });
  }
});

// Reorder paintings in collection (this is the critical feature!)
router.put('/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { painting_orders } = req.body; // Array of { painting_id, display_order }

    // Use a transaction to update all orders atomically
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      for (const item of painting_orders) {
        await client.query(
          `UPDATE collection_paintings
           SET display_order = $1
           WHERE collection_id = $2 AND painting_id = $3`,
          [item.display_order, id, item.painting_id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Paintings reordered successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder paintings' });
  }
});

module.exports = router;
