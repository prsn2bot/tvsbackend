"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../config/database");
class UserModel {
    static async findUserWithProfile(userId) {
        const query = `
      SELECT
        u.id, u.email, u.password_hash, u.role, u.account_status, u.mfa_enabled, u.mfa_secret, u.created_at, u.updated_at,
        up.user_id, up.first_name, up.last_name, up.employee_id, up.cadre_service, up.designation_rank, up.profile_photo_url,
        up.head_office_address, up.branch_office_address, up.country, up.state, up.district, up.city, up.preferred_language, up.updated_at as profile_updated_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
        const result = await database_1.pool.query(query, [userId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        const user = {
            id: row.id,
            email: row.email,
            password_hash: row.password_hash,
            role: row.role,
            account_status: row.account_status,
            mfa_enabled: row.mfa_enabled,
            mfa_secret: row.mfa_secret,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
        const profile = {
            user_id: row.user_id || userId,
            first_name: row.first_name || "",
            last_name: row.last_name || "",
            employee_id: row.employee_id,
            cadre_service: row.cadre_service,
            designation_rank: row.designation_rank,
            profile_photo_url: row.profile_photo_url,
            head_office_address: row.head_office_address,
            branch_office_address: row.branch_office_address,
            country: row.country,
            state: row.state,
            district: row.district,
            city: row.city,
            preferred_language: row.preferred_language || "en",
            updated_at: row.profile_updated_at || new Date(),
        };
        return { ...user, ...profile };
    }
    static async updateProfile(userId, profileData) {
        const fields = Object.keys(profileData).filter((key) => profileData[key] !== undefined);
        if (fields.length === 0)
            return;
        const setClause = fields
            .map((field, index) => `${field} = $${index + 2}`)
            .join(", ");
        const values = fields.map((field) => profileData[field]);
        values.unshift(userId);
        const query = `
      UPDATE user_profiles
      SET ${setClause}, updated_at = NOW()
      WHERE user_id = $1
    `;
        await database_1.pool.query(query, values);
    }
    static async findAll(filters, pagination) {
        let whereClause = "";
        const values = [];
        let paramIndex = 1;
        if (filters.role) {
            whereClause += `WHERE role = $${paramIndex++} `;
            values.push(filters.role);
        }
        if (filters.account_status) {
            whereClause += `${whereClause ? "AND" : "WHERE"} account_status = $${paramIndex++} `;
            values.push(filters.account_status);
        }
        const query = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        values.push(pagination.limit, pagination.offset);
        const result = await database_1.pool.query(query, values);
        return result.rows;
    }
    static async countAll(filters) {
        let whereClause = "";
        const values = [];
        let paramIndex = 1;
        if (filters.role) {
            whereClause += `WHERE role = $${paramIndex++} `;
            values.push(filters.role);
        }
        if (filters.account_status) {
            whereClause += `${whereClause ? "AND" : "WHERE"} account_status = $${paramIndex++} `;
            values.push(filters.account_status);
        }
        const query = `SELECT COUNT(*) as count FROM users ${whereClause}`;
        const result = await database_1.pool.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }
    static async updateUserStatus(userId, accountStatus) {
        const query = `
      UPDATE users
      SET account_status = $1, updated_at = NOW()
      WHERE id = $2
    `;
        await database_1.pool.query(query, [accountStatus, userId]);
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map