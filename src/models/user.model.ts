import { pool } from "../config/database";
import { User, UserProfile, UserWithProfile } from "../types/user.types";

export class UserModel {
  static async findUserWithProfile(
    userId: string
  ): Promise<UserWithProfile | null> {
    const query = `
      SELECT
        u.id, u.email, u.password_hash, u.role, u.account_status, u.mfa_enabled, u.mfa_secret, u.created_at, u.updated_at,
        up.user_id, up.first_name, up.last_name, up.employee_id, up.cadre_service, up.designation_rank, up.profile_photo_url,
        up.head_office_address, up.branch_office_address, up.country, up.state, up.district, up.city, up.preferred_language, up.updated_at as profile_updated_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const user: User = {
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
    const profile: UserProfile = {
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

  static async findUserByEmail(email: string): Promise<UserWithProfile | null> {
    const query = `
      SELECT
        u.id, u.email, u.password_hash, u.role, u.account_status, u.mfa_enabled, u.mfa_secret, u.created_at, u.updated_at,
        up.user_id, up.first_name, up.last_name, up.employee_id, up.cadre_service, up.designation_rank, up.profile_photo_url,
        up.head_office_address, up.branch_office_address, up.country, up.state, up.district, up.city, up.preferred_language, up.updated_at as profile_updated_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const user: User = {
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
    const profile: UserProfile = {
      user_id: row.user_id || row.id,
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

  static async updateProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    const fields = Object.keys(profileData).filter(
      (key) => profileData[key as keyof UserProfile] !== undefined
    );
    if (fields.length === 0) return;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = fields.map(
      (field) => profileData[field as keyof UserProfile]
    );
    values.unshift(userId);

    const query = `
      INSERT INTO user_profiles (user_id, ${fields.join(", ")}, updated_at)
      VALUES ($1, ${fields
        .map((_, index) => `$${index + 2}`)
        .join(", ")}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
      ${fields
        .map((field, index) => `${field} = EXCLUDED.${field}`)
        .join(", ")}, updated_at = NOW()
    `;
    await pool.query(query, values);
  }

  static async findAll(
    filters: { role?: string; account_status?: string },
    pagination: { limit: number; offset: number }
  ): Promise<User[]> {
    let whereClause = "";
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.role) {
      whereClause += `WHERE role = $${paramIndex++} `;
      values.push(filters.role);
    }
    if (filters.account_status) {
      whereClause += `${
        whereClause ? "AND" : "WHERE"
      } account_status = $${paramIndex++} `;
      values.push(filters.account_status);
    }

    const query = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(pagination.limit, pagination.offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async countAll(filters: {
    role?: string;
    account_status?: string;
  }): Promise<number> {
    let whereClause = "";
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.role) {
      whereClause += `WHERE role = $${paramIndex++} `;
      values.push(filters.role);
    }
    if (filters.account_status) {
      whereClause += `${
        whereClause ? "AND" : "WHERE"
      } account_status = $${paramIndex++} `;
      values.push(filters.account_status);
    }

    const query = `SELECT COUNT(*) as count FROM users ${whereClause}`;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  static async updateUserStatus(
    userId: string,
    accountStatus: string
  ): Promise<void> {
    const query = `
      UPDATE users
      SET account_status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [accountStatus, userId]);
  }

  static async updateUserRole(userId: string, role: string): Promise<void> {
    const query = `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(query, [role, userId]);
  }
}
