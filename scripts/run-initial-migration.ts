import { query } from "../src/config/database";
import * as fs from "fs";
import * as path from "path";

async function runInitialMigration() {
  try {
    console.log("Running initial migration: Create all main tables...");

    const migrationPath = path.join(
      __dirname,
      "../src/db/migrations/20240601000000_create_initial_tables.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Executing migration SQL...");
    await query(migrationSQL);

    console.log("Migration completed successfully!");
    console.log("Created tables:");
    console.log("- users");
    console.log("- user_profiles");
    console.log("- cases");
    console.log("- documents");
    console.log("- reviews");
    console.log("- plans");
    console.log("- subscriptions");
    console.log("- audits");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runInitialMigration();
