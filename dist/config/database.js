"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const poolConfig = {
    user: env_1.DB_USER,
    host: env_1.DB_HOST,
    database: env_1.DB_NAME,
    password: env_1.DB_PASSWORD,
    port: env_1.DB_PORT,
    ssl: env_1.DB_SSL ? { rejectUnauthorized: false } : false, // Basic SSL config, adjust as needed for production
    // You might want to add more pool options like max connections, idle timeout, etc.
    // max: 20, 
    // idleTimeoutMillis: 30000,
    // connectionTimeoutMillis: 2000,
};
const pool = new pg_1.Pool(poolConfig);
exports.pool = pool;
pool.on('connect', (client) => {
    if (env_1.NODE_ENV === 'development') {
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
if (env_1.NODE_ENV !== 'test') { // Avoid running this during automated tests if they set up their own DB
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to PostgreSQL:', err.message);
            console.error('Pool config used:', {
                user: poolConfig.user,
                host: poolConfig.host,
                database: poolConfig.database,
                port: poolConfig.port,
                ssl: poolConfig.ssl
            });
        }
        else {
            if (env_1.NODE_ENV === 'development') {
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
const query = (text, params) => pool.query(text, params);
exports.query = query;
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
//# sourceMappingURL=database.js.map