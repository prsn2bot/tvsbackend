import { pool } from "../config/database";
import { User } from "../types/user.types";

export class AuthModel {
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT * FROM users WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0] as User;
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, role, account_status, mfa_enabled, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const values = [
      userData.email,
      userData.password_hash,
      userData.role,
      userData.account_status || "pending_verification",
      userData.mfa_enabled || false,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] as User;
  }
}
