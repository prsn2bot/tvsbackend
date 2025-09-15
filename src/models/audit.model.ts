import { pool } from "../config/database";
import { AuditLog } from "../types/audit.types";

export class AuditModel {
  static async findAll(
    filters: {
      user_id?: string;
      min_created_at?: string;
      max_created_at?: string;
    },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AuditLog[]; total: number }> {
    let whereClause = "";
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.user_id) {
      whereClause += `WHERE user_id = $${paramIndex++} `;
      values.push(filters.user_id);
    }
    if (filters.min_created_at) {
      whereClause += `${
        whereClause ? "AND" : "WHERE"
      } created_at >= $${paramIndex++} `;
      values.push(filters.min_created_at);
    }
    if (filters.max_created_at) {
      whereClause += `${
        whereClause ? "AND" : "WHERE"
      } created_at <= $${paramIndex++} `;
      values.push(filters.max_created_at);
    }

    const countQuery = `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(pagination.limit, pagination.offset);

    const dataResult = await pool.query(dataQuery, values);
    const data = dataResult.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      details: row.details,
      previous_hash: row.previous_hash,
      current_hash: row.current_hash,
      created_at: row.created_at,
    }));

    return { data, total };
  }

  static async create(auditData: {
    user_id?: string;
    action: string;
    details?: Record<string, any>;
    previous_hash?: string;
    current_hash: string;
  }): Promise<AuditLog> {
    const query = `
      INSERT INTO audit_logs (user_id, action, details, previous_hash, current_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [
      auditData.user_id,
      auditData.action,
      auditData.details,
      auditData.previous_hash,
      auditData.current_hash,
    ];
    const result = await pool.query(query, values);
    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      details: row.details,
      previous_hash: row.previous_hash,
      current_hash: row.current_hash,
      created_at: row.created_at,
    };
  }
}
