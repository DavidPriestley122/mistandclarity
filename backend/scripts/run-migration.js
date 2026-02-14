const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations/add-exhibition-fields.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: add-exhibition-fields.sql...');
    await pool.query(migration);

    console.log('✓ Migration applied successfully!');
    console.log('✓ Added subtitle and introduction fields to collections table');

  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
