import { query } from "../src/config/database";
import * as fs from "fs";
import * as path from "path";

async function runAiDraftsMigration() {
  try {
    console.log("Running AI Drafts and Owner Role migration...");

    const migrationPath = path.join(
      __dirname,
      "../src/db/migrations/20240601000001_add_ai_drafts_and_owner_role.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Executing migration SQL...");

    // Execute the entire migration as one query to handle DO blocks properly
    await query(migrationSQL);

    console.log(
      "✅ AI Drafts and Owner Role Migration completed successfully!"
    );
    console.log("Added:");
    console.log("- ai_drafts table for storing AI-generated defence drafts");
    console.log("- owner role to roles table (if exists)");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runAiDraftsMigration();
