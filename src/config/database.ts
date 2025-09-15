import { Pool } from 'pg';
import {
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  NODE_ENV
} from './env';

const poolConfig = {
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: DB_SSL ? { rejectUnauthorized: false } : false, // Basic SSL config, adjust as needed for production
  // You might want to add more pool options like max connections, idle timeout, etc.
  // max: 20, 
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

export { pool };

pool.on('connect', (client) => {
  if (NODE_ENV === 'development') {
    console.log('PostgreSQL client connected');
  }
  // You could set session parameters here if needed, e.g.:
  // client.query('SET search_path TO my_schema, public');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  // process.exit(-1); // Consider exiting if pool errors are critical
});

// Test the connection (optional, but good for startup)
if (NODE_ENV !== 'test') { // Avoid running this during automated tests if they set up their own DB
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to PostgreSQL:', err.message);
            console.error('Pool config used:', {
                user: poolConfig.user, // Be careful not to log actual password
                host: poolConfig.host,
                database: poolConfig.database,
                port: poolConfig.port,
                ssl: poolConfig.ssl
            });
        } else {
            if (NODE_ENV === 'development') {
                console.log('Successfully connected to PostgreSQL. Server time:', res.rows[0].now);
            }
        }
    });
}

/**
 * Executes a SQL query using a client from the connection pool.
 * @param text The SQL query string (can include placeholders like $1, $2).
 * @param params An array of parameters to substitute into the query.
 * @returns A Promise that resolves with the query result.
 */
export const query = (text: string, params?: any[]) => pool.query(text, params);

// You can also export the pool itself if you need more direct control, e.g., for transactions
// export default pool;

// Graceful shutdown (optional, but good practice)
process.on('SIGINT', async () => {
  console.log('Shutting down PostgreSQL pool...');
  await pool.end();
  console.log('Pool has ended');
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('Shutting down PostgreSQL pool (SIGTERM)...');
  await pool.end();
  console.log('Pool has ended (SIGTERM)');
  process.exit(0);
}); 