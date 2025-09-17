import { pool } from "../config/database";
import { Case, Document, Review } from "../types/case.types";

export class CaseModel {
  static async create(caseData: {
    title: string;
    description: string;
    status: string;
    officer_user_id: number;
  }): Promise<Case> {
    const query = `
      INSERT INTO cases (officer_user_id, case_title, status, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    const values = [caseData.officer_user_id, caseData.title, caseData.status];
    const result = await pool.query(query, values);
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

  static async findCasesByUser(
    userId: string,
    filters: { status?: string; min_created_at?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ data: Case[]; total: number }> {
    let whereClause = "WHERE officer_user_id = $1";
    const values: any[] = [userId];
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
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const dataQuery = `
      SELECT * FROM cases
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(pagination.limit, offset);

    const dataResult = await pool.query(dataQuery, values);
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

  static async findById(caseId: string): Promise<Case | null> {
    const query = `SELECT * FROM cases WHERE id = $1`;
    const result = await pool.query(query, [caseId]);
    if (result.rows.length === 0) return null;
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

  static async createDocument(documentData: {
    case_id: string;
    cloudinary_public_id: string;
    secure_url: string;
    ocr_text?: string;
  }): Promise<Document> {
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
    const result = await pool.query(query, values);
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

  static async createReview(reviewData: {
    case_id: string;
    reviewer_id: string;
    review_text: string;
    decision: string;
  }): Promise<Review> {
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
    const result = await pool.query(query, values);
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

  static async findAll(
    filters: { status?: string; min_created_at?: string },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: Case[]; total: number }> {
    let whereClause = "";
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      whereClause += `WHERE status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters.min_created_at) {
      whereClause += `${
        whereClause ? " AND" : " WHERE"
      } created_at >= $${paramIndex++}`;
      values.push(filters.min_created_at);
    }

    const countQuery = `SELECT COUNT(*) as count FROM cases ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT * FROM cases
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(pagination.limit, pagination.offset);

    const dataResult = await pool.query(dataQuery, values);
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

  /**
   * Find a document by its ID
   * @param documentId - The document ID to find
   * @returns Promise<Document | null> - The document or null if not found
   */
  static async findDocumentById(documentId: string): Promise<Document | null> {
    const query = `SELECT * FROM documents WHERE id = $1`;
    const result = await pool.query(query, [documentId]);
    if (result.rows.length === 0) return null;
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

  /**
   * Update a document with new data
   * @param documentId - The document ID to update
   * @param updates - The fields to update
   * @returns Promise<Document | null> - The updated document or null if not found
   */
  static async updateDocument(
    documentId: string,
    updates: Record<string, any>
  ): Promise<Document | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.ocr_text !== undefined) {
      fields.push(`ocr_text = $${paramIndex++}`);
      values.push(updates.ocr_text);
    }
    if (updates.ocr_status !== undefined) {
      fields.push(`ocr_status = $${paramIndex++}`);
      values.push(updates.ocr_status);
    }
    if (updates.vector_embedding !== undefined) {
      fields.push(`vector_embedding = $${paramIndex++}`);
      values.push(updates.vector_embedding);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push(`uploaded_at = NOW()`);
    values.push(documentId);

    const query = `
      UPDATE documents
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;

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

  /**
   * Update a case status
   * @param caseId - The case ID to update
   * @param status - The new status
   * @returns Promise<Case | null> - The updated case or null if not found
   */
  static async updateCaseStatus(
    caseId: string,
    status: string
  ): Promise<Case | null> {
    const query = `
      UPDATE cases
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, caseId]);
    if (result.rows.length === 0) return null;

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
}
