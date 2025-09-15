"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanModel = void 0;
const database_1 = require("../config/database");
class PlanModel {
    static async findAll() {
        const query = `SELECT * FROM plans ORDER BY id`;
        const result = await database_1.pool.query(query);
        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            price_monthly: row.price_monthly,
            features: row.features,
        }));
    }
    static async findById(id) {
        const query = `SELECT * FROM plans WHERE id = $1`;
        const result = await database_1.pool.query(query, [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            price_monthly: row.price_monthly,
            features: row.features,
        };
    }
    static async create(planData) {
        const query = `
      INSERT INTO plans (name, price_monthly, features)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const values = [planData.name, planData.price_monthly, planData.features];
        const result = await database_1.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            price_monthly: row.price_monthly,
            features: row.features,
        };
    }
    static async update(id, planData) {
        const fields = Object.keys(planData);
        if (fields.length === 0)
            return null;
        const setClause = fields
            .map((field, index) => `${field} = $${index + 2}`)
            .join(", ");
        const values = fields.map((field) => planData[field]);
        values.unshift(id);
        const query = `UPDATE plans SET ${setClause} WHERE id = $1 RETURNING *`;
        const result = await database_1.pool.query(query, values);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            price_monthly: row.price_monthly,
            features: row.features,
        };
    }
    static async delete(id) {
        const query = `DELETE FROM plans WHERE id = $1`;
        const result = await database_1.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.PlanModel = PlanModel;
//# sourceMappingURL=plan.model.js.map