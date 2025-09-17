"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../../services/audit.service");
class AuditController {
    static async getAuditLogs(req, res) {
        try {
            const { page = 1, limit = 10, user_id, min_created_at, max_created_at, } = req.query;
            const filters = {};
            if (user_id) {
                filters.user_id = parseInt(user_id, 10);
            }
            if (min_created_at) {
                filters.min_created_at = min_created_at;
            }
            if (max_created_at) {
                filters.max_created_at = max_created_at;
            }
            const pagination = {
                limit: parseInt(limit, 10),
                offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            };
            const result = await audit_service_1.AuditService.getAllAuditLogs(filters, pagination);
            const response = {
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: pagination.limit,
                    offset: pagination.offset,
                },
            };
            res.json(response);
        }
        catch (error) {
            console.error("Error fetching audit logs:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map