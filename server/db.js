import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      key_value TEXT NOT NULL,
      project VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

export default pool;
