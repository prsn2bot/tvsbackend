"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
// Database connection configuration using existing config
const pool = new pg_1.Pool({
    user: env_1.DB_USER,
    host: env_1.DB_HOST,
    database: env_1.DB_NAME,
    password: env_1.DB_PASSWORD,
    port: env_1.DB_PORT,
    ssl: env_1.DB_SSL ? { rejectUnauthorized: false } : false,
});
class MigrationRunner {
    constructor() {
        this.migrationsDir = path_1.default.join(__dirname, "migrations");
    }
    /**
     * Initialize migrations table if it doesn't exist
     */
    async initializeMigrationsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        version VARCHAR(50) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;
        try {
            await pool.query(query);
            console.log("✅ Migrations table initialized");
        }
        catch (error) {
            console.error("❌ Failed to initialize migrations table:", error);
            throw error;
        }
    }
    /**
     * Get list of executed migrations from database
     */
    async getExecutedMigrations() {
        try {
            const result = await pool.query("SELECT filename FROM migrations ORDER BY executed_at");
            return result.rows.map((row) => row.filename);
        }
        catch (error) {
            console.error("❌ Failed to get executed migrations:", error);
            return [];
        }
    }
    /**
     * Get list of available migration files
     */
    getAvailableMigrations() {
        try {
            const files = fs_1.default
                .readdirSync(this.migrationsDir)
                .filter((file) => file.endsWith(".sql"))
                .sort();
            return files.map((filename) => ({
                filename,
                version: this.extractVersion(filename),
                executed: false,
            }));
        }
        catch (error) {
            console.error("❌ Failed to read migrations directory:", error);
            return [];
        }
    }
    /**
     * Extract version from migration filename
     */
    extractVersion(filename) {
        const match = filename.match(/^(\d{14})/);
        return match ? match[1] : "0";
    }
    /**
     * Execute a single migration file
     */
    async executeMigration(migration) {
        const filePath = path_1.default.join(this.migrationsDir, migration.filename);
        try {
            console.log(`🔄 Executing migration: ${migration.filename}`);
            const sql = fs_1.default.readFileSync(filePath, "utf8");
            // Start transaction
            await pool.query("BEGIN");
            try {
                // Execute migration SQL
                await pool.query(sql);
                // Record migration as executed
                await pool.query("INSERT INTO migrations (filename, version) VALUES ($1, $2)", [migration.filename, migration.version]);
                // Commit transaction
                await pool.query("COMMIT");
                console.log(`✅ Migration completed: ${migration.filename}`);
            }
            catch (error) {
                // Rollback on error
                await pool.query("ROLLBACK");
                throw error;
            }
        }
        catch (error) {
            console.error(`❌ Migration failed: ${migration.filename}`, error);
            throw error;
        }
    }
    /**
     * Run all pending migrations
     */
    async runMigrations() {
        try {
            console.log("🚀 Starting database migrations...");
            // Initialize migrations table
            await this.initializeMigrationsTable();
            // Get executed and available migrations
            const executedMigrations = await this.getExecutedMigrations();
            const availableMigrations = this.getAvailableMigrations();
            // Filter pending migrations
            const pendingMigrations = availableMigrations.filter((migration) => !executedMigrations.includes(migration.filename));
            if (pendingMigrations.length === 0) {
                console.log("✅ No pending migrations found. Database is up to date.");
                return;
            }
            console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
            pendingMigrations.forEach((migration) => {
                console.log(`   - ${migration.filename}`);
            });
            // Execute pending migrations
            for (const migration of pendingMigrations) {
                await this.executeMigration(migration);
            }
            console.log(`🎉 Successfully executed ${pendingMigrations.length} migration(s)`);
        }
        catch (error) {
            console.error("❌ Migration process failed:", error);
            throw error;
        }
    }
    /**
     * Show migration status
     */
    async showStatus() {
        try {
            await this.initializeMigrationsTable();
            const executedMigrations = await this.getExecutedMigrations();
            const availableMigrations = this.getAvailableMigrations();
            console.log("\n📊 Migration Status:");
            console.log("==================");
            availableMigrations.forEach((migration) => {
                const status = executedMigrations.includes(migration.filename)
                    ? "✅"
                    : "⏳";
                console.log(`${status} ${migration.filename}`);
            });
            const pendingCount = availableMigrations.length - executedMigrations.length;
            console.log(`\n📈 Total: ${availableMigrations.length} migrations`);
            console.log(`✅ Executed: ${executedMigrations.length}`);
            console.log(`⏳ Pending: ${pendingCount}`);
        }
        catch (error) {
            console.error("❌ Failed to show migration status:", error);
            throw error;
        }
    }
    /**
     * Close database connection
     */
    async close() {
        await pool.end();
    }
}
exports.MigrationRunner = MigrationRunner;
// Main execution
async function main() {
    const migrationRunner = new MigrationRunner();
    try {
        const command = process.argv[2];
        switch (command) {
            case "status":
                await migrationRunner.showStatus();
                break;
            case "run":
            default:
                await migrationRunner.runMigrations();
                break;
        }
    }
    catch (error) {
        console.error("❌ Migration process failed:", error);
        process.exit(1);
    }
    finally {
        await migrationRunner.close();
    }
}
// Run if called directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=migrate.js.map