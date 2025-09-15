"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = void 0;
const database_1 = require("../config/database");
class SubscriptionModel {
    static async findByUserId(userId) {
        const query = `
      SELECT s.*, p.name as plan_name, p.price_monthly, p.features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1 AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
        const result = await database_1.pool.query(query, [userId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            user_id: row.user_id,
            plan_id: row.plan_id,
            payment_provider_subscription_id: row.payment_provider_subscription_id,
            status: row.status,
            start_date: row.start_date,
            end_date: row.end_date,
            created_at: row.created_at,
            plan: {
                id: row.plan_id,
                name: row.plan_name,
                price_monthly: row.price_monthly,
                features: row.features,
            },
        };
    }
    static async findAll(filters, pagination) {
        let whereClause = "";
        const values = [];
        let paramIndex = 1;
        if (filters.status) {
            whereClause += `WHERE s.status = $${paramIndex++} `;
            values.push(filters.status);
        }
        if (filters.min_price !== undefined) {
            whereClause += `${whereClause ? "AND" : "WHERE"} p.price_monthly >= $${paramIndex++} `;
            values.push(filters.min_price);
        }
        if (filters.max_price !== undefined) {
            whereClause += `${whereClause ? "AND" : "WHERE"} p.price_monthly <= $${paramIndex++} `;
            values.push(filters.max_price);
        }
        const countQuery = `
      SELECT COUNT(*) as count
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      ${whereClause}
    `;
        const countResult = await database_1.pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);
        const dataQuery = `
      SELECT s.*, p.name as plan_name, p.price_monthly, p.features
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        values.push(pagination.limit, pagination.offset);
        const dataResult = await database_1.pool.query(dataQuery, values);
        const data = dataResult.rows.map((row) => ({
            id: row.id,
            user_id: row.user_id,
            plan_id: row.plan_id,
            payment_provider_subscription_id: row.payment_provider_subscription_id,
            status: row.status,
            start_date: row.start_date,
            end_date: row.end_date,
            created_at: row.created_at,
            plan: {
                id: row.plan_id,
                name: row.plan_name,
                price_monthly: row.price_monthly,
                features: row.features,
            },
        }));
        return { data, total };
    }
    static async create(subscriptionData) {
        const query = `
      INSERT INTO subscriptions (user_id, plan_id, payment_provider_subscription_id, status, start_date, end_date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
        const values = [
            subscriptionData.user_id,
            subscriptionData.plan_id,
            subscriptionData.payment_provider_subscription_id,
            subscriptionData.status,
            subscriptionData.start_date,
            subscriptionData.end_date,
        ];
        const result = await database_1.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            user_id: row.user_id,
            plan_id: row.plan_id,
            payment_provider_subscription_id: row.payment_provider_subscription_id,
            status: row.status,
            start_date: row.start_date,
            end_date: row.end_date,
            created_at: row.created_at,
        };
    }
    static async update(id, subscriptionData) {
        const fields = Object.keys(subscriptionData);
        if (fields.length === 0)
            return null;
        const setClause = fields
            .map((field, index) => `${field} = $${index + 2}`)
            .join(", ");
        const values = fields.map((field) => subscriptionData[field]);
        values.unshift(id);
        const query = `UPDATE subscriptions SET ${setClause} WHERE id = $1 RETURNING *`;
        const result = await database_1.pool.query(query, values);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            user_id: row.user_id,
            plan_id: row.plan_id,
            payment_provider_subscription_id: row.payment_provider_subscription_id,
            status: row.status,
            start_date: row.start_date,
            end_date: row.end_date,
            created_at: row.created_at,
        };
    }
    static async delete(id) {
        const query = `DELETE FROM subscriptions WHERE id = $1`;
        const result = await database_1.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.SubscriptionModel = SubscriptionModel;
//# sourceMappingURL=subscription.model.js.map