"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseModel = void 0;
const database_1 = require("../config/database");
class CaseModel {
    static async create(caseData) {
        const query = `
      INSERT INTO cases (officer_user_id, case_title, status, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
        const values = [caseData.officer_user_id, caseData.title, caseData.status];
        const result = await database_1.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            officer_user_id: row.officer_user_id,
            case_title: row.case_title,
            status: row.status,
            assigned_cvo_id: row.assigned_cvo_id,
            assigned_legal_board_id: row.assigned_legal_board_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    static async findCasesByUser(userId, filters, pagination) {
        let whereClause = "WHERE officer_user_id = $1";
        const values = [userId];
        let paramIndex = 2;
        if (filters.status) {
            whereClause += ` AND status = $${paramIndex++}`;
            values.push(filters.status);
        }
        if (filters.min_created_at) {
            whereClause += ` AND created_at >= $${paramIndex++}`;
            values.push(filters.min_created_at);
        }
        const countQuery = `SELECT COUNT(*) as count FROM cases ${whereClause}`;
        const countResult = await database_1.pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const offset = (pagination.page - 1) * pagination.limit;
        const dataQuery = `
      SELECT * FROM cases
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        values.push(pagination.limit, offset);
        const dataResult = await database_1.pool.query(dataQuery, values);
        const data = dataResult.rows.map((row) => ({
            id: row.id,
            officer_user_id: row.officer_user_id,
            case_title: row.case_title,
            status: row.status,
            assigned_cvo_id: row.assigned_cvo_id,
            assigned_legal_board_id: row.assigned_legal_board_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
        return { data, total };
    }
    static async findById(caseId) {
        const query = `SELECT * FROM cases WHERE id = $1`;
        const result = await database_1.pool.query(query, [caseId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            officer_user_id: row.officer_user_id,
            case_title: row.case_title,
            status: row.status,
            assigned_cvo_id: row.assigned_cvo_id,
            assigned_legal_board_id: row.assigned_legal_board_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    static async createDocument(documentData) {
        const query = `
      INSERT INTO documents (case_id, cloudinary_public_id, secure_url, ocr_text, uploaded_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
        const values = [
            documentData.case_id,
            documentData.cloudinary_public_id,
            documentData.secure_url,
            documentData.ocr_text,
        ];
        const result = await database_1.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            case_id: row.case_id,
            original_filename: row.original_filename,
            cloudinary_public_id: row.cloudinary_public_id,
            secure_url: row.secure_url,
            file_type: row.file_type,
            file_size_bytes: row.file_size_bytes,
            ocr_text: row.ocr_text,
            vector_embedding: row.vector_embedding,
            uploaded_at: row.uploaded_at,
        };
    }
    static async createReview(reviewData) {
        const query = `
      INSERT INTO reviews (case_id, reviewer_id, comments, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
        const values = [
            reviewData.case_id,
            reviewData.reviewer_id,
            reviewData.review_text,
            reviewData.decision,
        ];
        const result = await database_1.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            case_id: row.case_id,
            reviewer_id: row.reviewer_id,
            review_type: row.review_type,
            comments: row.comments,
            status: row.status,
            created_at: row.created_at,
        };
    }
    static async findAll(filters, pagination) {
        let whereClause = "";
        const values = [];
        let paramIndex = 1;
        if (filters.status) {
            whereClause += `WHERE status = $${paramIndex++}`;
            values.push(filters.status);
        }
        if (filters.min_created_at) {
            whereClause += `${whereClause ? " AND" : " WHERE"} created_at >= $${paramIndex++}`;
            values.push(filters.min_created_at);
        }
        const countQuery = `SELECT COUNT(*) as count FROM cases ${whereClause}`;
        const countResult = await database_1.pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT * FROM cases
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        values.push(pagination.limit, pagination.offset);
        const dataResult = await database_1.pool.query(dataQuery, values);
        const data = dataResult.rows.map((row) => ({
            id: row.id,
            officer_user_id: row.officer_user_id,
            case_title: row.case_title,
            status: row.status,
            assigned_cvo_id: row.assigned_cvo_id,
            assigned_legal_board_id: row.assigned_legal_board_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
        return { data, total };
    }
}
exports.CaseModel = CaseModel;
//# sourceMappingURL=case.model.js.map