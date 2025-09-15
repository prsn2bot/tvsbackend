import { query } from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Running migration: Create usage tracking tables with current resource counts...');

    const migrationPath = path.join(__dirname, '../src/db/migrations/20241201000000_create_usage_tracking_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration SQL...');
    await query(migrationSQL);

    console.log('Migration completed successfully!');
    console.log('Created tables:');
    console.log('- resource_usage (for historical tracking)');
    console.log('- current_resource_counts (for real-time tracking - one row per user per resource)');
    console.log('- daily_feature_usage (for feature usage tracking)');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 