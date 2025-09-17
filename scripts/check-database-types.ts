import { query } from "../src/config/database";

async function checkDatabaseSchemasTablesData() {
  try {
    console.log(
      "Fetching all schemas, tables, and data types in the database..."
    );

    const sql = `
      SELECT
        table_schema,
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name, ordinal_position;
    `;

    const result = await query(sql);

    if (result.rows.length === 0) {
      console.log("No tables or columns found in the database.");
    } else {
      let currentSchema = "";
      let currentTable = "";

      result.rows.forEach(
        (row: {
          table_schema: string;
          table_name: string;
          column_name: string;
          data_type: string;
        }) => {
          if (row.table_schema !== currentSchema) {
            console.log(`\nSchema: ${row.table_schema}`);
            currentSchema = row.table_schema;
            currentTable = "";
          }
          if (row.table_name !== currentTable) {
            console.log(`  Table: ${row.table_name}`);
            currentTable = row.table_name;
          }
          console.log(
            `    Column: ${row.column_name} - Type: ${row.data_type}`
          );
        }
      );
    }
  } catch (error) {
    console.error("Error fetching schema, table, and data information:", error);
    process.exit(1);
  }
}

checkDatabaseSchemasTablesData();
