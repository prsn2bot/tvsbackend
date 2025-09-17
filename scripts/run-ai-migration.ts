import { query } from "../src/config/database";
import * as fs from "fs";
import * as path from "path";

async function runAiMigration() {
  try {
    console.log("Running AI processing migration...");

    const migrationPath = path.join(
      __dirname,
      "../src/db/migrations/20240917000000_add_ai_processing_columns.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Executing AI migration SQL...");
    await query(migrationSQL);

    console.log("✅ AI Migration completed successfully!");
    console.log("Added:");
    console.log("- ocr_status column to documents table");
    console.log("- ai_drafts table for storing AI-generated defence drafts");
    console.log("- Indexes for better query performance");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runAiMigration();
