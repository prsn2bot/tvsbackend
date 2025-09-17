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

    // Split the SQL into individual statements and execute them one by one
    const statements = migrationSQL
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(
          `Executing statement ${i + 1}: ${statement.substring(0, 50)}...`
        );
        try {
          await query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error);
          throw error;
        }
      }
    }

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
