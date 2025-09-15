import { query } from '../src/config/database';
import { env } from '../src/config/env'; // For logging environment

const revertLimitColumnFromUsers = async () => {
  const alterTableSQL = 'ALTER TABLE users DROP COLUMN IF EXISTS "limit";';

  try {
    console.log(`[Migration-Revert] Running in ${env.NODE_ENV} environment.`);
    console.log('[Migration-Revert] Attempting to DROP "limit" column from "users" table...');
    await query(alterTableSQL);
    console.log('[Migration-Revert] Successfully DROPPED "limit" column (or it did not exist).');
  } catch (error) {
    console.error('[Migration-Revert] Error DROPPING "limit" column:', error);
    process.exit(1); 
  } finally {
    console.log('[Migration-Revert] Script finished.');
    process.exit(0);
  }
};

revertLimitColumnFromUsers(); 