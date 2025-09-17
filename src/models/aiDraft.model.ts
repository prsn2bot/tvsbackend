import { pool } from "../config/database";
import { AiDraft } from "../types/case.types";

interface CreateAiDraftData {
  case_id: string;
  version: number;
  content: string;
  defence_score?: number;
  confidence_score?: number;
}

export class AiDraftModel {
  /**
   * Creates a new AI draft record in the database
   * @param data - The AI draft data to create
   * @returns Promise<AiDraft> - The created AI draft record
   */
  static async createAiDraft(data: CreateAiDraftData): Promise<AiDraft> {
    const { case_id, version, content, defence_score, confidence_score } = data;
    const query = `
      INSERT INTO ai_drafts (case_id, version, content, defence_score, confidence_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      case_id,
      version,
      content,
      defence_score,
      confidence_score,
    ]);
    return result.rows[0];
  }

  /**
   * Finds AI drafts by case ID
   * @param caseId - The case ID to find drafts for
   * @returns Promise<AiDraft[]> - Array of AI drafts for the case
   */
  static async findByCaseId(caseId: string): Promise<AiDraft[]> {
    const query = `
      SELECT * FROM ai_drafts
      WHERE case_id = $1
      ORDER BY version DESC, created_at DESC;
    `;
    const result = await pool.query(query, [caseId]);
    return result.rows;
  }

  /**
   * Finds the latest AI draft for a case
   * @param caseId - The case ID to find the latest draft for
   * @returns Promise<AiDraft | null> - The latest AI draft or null if none exists
   */
  static async findLatestByCaseId(caseId: string): Promise<AiDraft | null> {
    const query = `
      SELECT * FROM ai_drafts
      WHERE case_id = $1
      ORDER BY version DESC, created_at DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [caseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Updates an AI draft record
   * @param draftId - The ID of the draft to update
   * @param updates - The fields to update
   * @returns Promise<AiDraft | null> - The updated draft or null if not found
   */
  static async updateAiDraft(
    draftId: string,
    updates: Partial<
      Pick<AiDraft, "content" | "defence_score" | "confidence_score">
    >
  ): Promise<AiDraft | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }
    if (updates.defence_score !== undefined) {
      fields.push(`defence_score = $${paramIndex++}`);
      values.push(updates.defence_score);
    }
    if (updates.confidence_score !== undefined) {
      fields.push(`confidence_score = $${paramIndex++}`);
      values.push(updates.confidence_score);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push(`updated_at = NOW()`);
    values.push(draftId);

    const query = `
      UPDATE ai_drafts
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Deletes an AI draft record
   * @param draftId - The ID of the draft to delete
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  static async deleteAiDraft(draftId: string): Promise<boolean> {
    const query = `DELETE FROM ai_drafts WHERE id = $1;`;
    const result = await pool.query(query, [draftId]);
    return (result.rowCount ?? 0) > 0;
  }
}
