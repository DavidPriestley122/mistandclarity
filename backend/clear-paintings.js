const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function clearPaintings() {
  try {
    console.log('Deleting all paintings...');
    const result = await pool.query('DELETE FROM paintings');
    console.log(`Deleted ${result.rowCount} paintings`);

    console.log('Deleting extra artists (keeping Fei Cheng-wu and Chang Chien-ying)...');
    const artistResult = await pool.query(
      `DELETE FROM artists
       WHERE name_preferred NOT IN ('Fei Cheng-wu', 'Chang Chien-ying')`
    );
    console.log(`Deleted ${artistResult.rowCount} extra artists`);

    console.log('Database cleared and ready for fresh import!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

clearPaintings();
