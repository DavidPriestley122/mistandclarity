const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// PUBLIC ENDPOINTS (no auth required)

// POST /api/contacts/inquiry - Submit painting inquiry
router.post('/inquiry', async (req, res) => {
  try {
    const { name, email, message, painting_id, catalog_number } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    let paintingId = painting_id || null;

    // If catalog_number provided, look up the painting ID
    if (catalog_number && !paintingId) {
      const paintingResult = await db.query(
        'SELECT id FROM paintings WHERE catalog_number = $1',
        [catalog_number]
      );
      if (paintingResult.rows.length > 0) {
        paintingId = paintingResult.rows[0].id;
      }
    }

    const result = await db.query(
      `INSERT INTO contact_submissions (name, email, message, painting_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, message, paintingId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// POST /api/contacts/subscribe - Subscribe to mailing list
router.post('/subscribe', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await db.query(
      `INSERT INTO mailing_list (name, email)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [name, email]
    );

    // Return success even if duplicate (ON CONFLICT prevents error)
    res.status(201).json(result.rows[0] || { message: 'Already subscribed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// ADMIN ENDPOINTS

// GET /api/contacts/submissions - Get all inquiries
router.get('/submissions', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cs.*, p.descriptive_title as painting_title, p.catalog_number
       FROM contact_submissions cs
       LEFT JOIN paintings p ON cs.painting_id = p.id
       ORDER BY cs.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /api/contacts/mailing-list - Get all subscribers
router.get('/mailing-list', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM mailing_list ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mailing list' });
  }
});

// PUT /api/contacts/submissions/:id - Update submission status
router.put('/submissions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE contact_submissions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// DELETE /api/contacts/submissions/:id - Delete inquiry
router.delete('/submissions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_submissions WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// DELETE /api/contacts/mailing-list/:id - Unsubscribe
router.delete('/mailing-list/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM mailing_list WHERE id = $1', [id]);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

module.exports = router;
