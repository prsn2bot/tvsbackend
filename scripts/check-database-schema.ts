import { pool } from "../src/config/database";

async function checkDatabaseSchema() {
  try {
    console.log("🔍 Checking database schema...\n");

    // Check all tables
    console.log("📋 TABLES:");
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.table(tablesResult.rows);

    // Check all enums
    console.log("\n🏷️  ENUMS:");
    const enumsResult = await pool.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

    if (enumsResult.rows.length > 0) {
      const enumsByType = enumsResult.rows.reduce((acc, row) => {
        if (!acc[row.enum_name]) {
          acc[row.enum_name] = [];
        }
        acc[row.enum_name].push(row.enum_value);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(enumsByType).forEach(([enumName, values]) => {
        console.log(`${enumName}: [${values.map((v) => `'${v}'`).join(", ")}]`);
      });
    } else {
      console.log("No enums found");
    }

    // Check specific table columns and their constraints
    console.log("\n📊 TABLE COLUMNS WITH CONSTRAINTS:");

    const columnsResult = await pool.query(`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.columns c
      LEFT JOIN information_schema.constraint_column_usage ccu ON c.table_name = ccu.table_name AND c.column_name = ccu.column_name
      LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position;
    `);

    const tableColumns = columnsResult.rows.reduce((acc, row) => {
      if (!acc[row.table_name]) {
        acc[row.table_name] = [];
      }
      acc[row.table_name].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(tableColumns).forEach(([tableName, columns]) => {
      console.log(`\n🗂️  ${tableName.toUpperCase()}:`);
      columns.forEach((col) => {
        let info = `  ${col.column_name}: ${col.data_type}`;
        if (col.is_nullable === "NO") info += " NOT NULL";
        if (col.column_default) info += ` DEFAULT ${col.column_default}`;
        if (col.constraint_type) info += ` [${col.constraint_type}]`;
        if (col.check_clause) info += ` CHECK(${col.check_clause})`;
        console.log(info);
      });
    });

    // Check for specific status columns that might need enum updates
    console.log("\n🔍 STATUS COLUMNS ANALYSIS:");
    const statusColumnsResult = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name LIKE '%status%'
      ORDER BY table_name, column_name;
    `);

    if (statusColumnsResult.rows.length > 0) {
      console.table(statusColumnsResult.rows);
    } else {
      console.log("No status columns found");
    }
  } catch (error) {
    console.error("❌ Error checking database schema:", error);
  } finally {
    await pool.end();
  }
}

checkDatabaseSchema();
