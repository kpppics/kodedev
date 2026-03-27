// ==========================================
// DATABASE CLIENT — PostgreSQL via pg Pool
// ==========================================

import { Pool, PoolClient } from 'pg';

let _pool: Pool | null = null;

export function getDb(): Pool {
  if (!_pool) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    _pool.on('error', (err) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });

    console.log('[DB] PostgreSQL pool initialised');
  }
  return _pool;
}

/**
 * Convenience helper: run multiple queries in a single transaction.
 * Automatically commits on success, rolls back on error.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const db = getDb();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Close the pool gracefully (for tests / shutdown hooks) */
export async function closeDb(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    console.log('[DB] Pool closed');
  }
}
