import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEFAULT_ADMIN_EMAIL = 'osamaqonaibe@gmail.com';
const DEFAULT_ADMIN_PASS  = 'osama@1976';

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      key_value TEXT NOT NULL,
      project VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query('DELETE FROM admins WHERE username = $1', ['admin']);

  const existing = await pool.query('SELECT id FROM admins WHERE username = $1', [DEFAULT_ADMIN_EMAIL]);
  if (existing.rows.length === 0) {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.default.hash(DEFAULT_ADMIN_PASS, 12);
    await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [DEFAULT_ADMIN_EMAIL, hash]);
  }
}

export default pool;
