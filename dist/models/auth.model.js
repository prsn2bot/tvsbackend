"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModel = void 0;
const database_1 = require("../config/database");
class AuthModel {
    static async getUserByEmail(email) {
        const query = `
      SELECT * FROM users WHERE email = $1
    `;
        const result = await database_1.pool.query(query, [email]);
        if (result.rows.length === 0)
            return null;
        return result.rows[0];
    }
    static async createUser(userData) {
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
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
}
exports.AuthModel = AuthModel;
//# sourceMappingURL=auth.model.js.map