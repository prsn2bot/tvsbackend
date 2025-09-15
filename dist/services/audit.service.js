"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const audit_model_1 = require("../models/audit.model");
class AuditService {
    static async getAllAuditLogs(filters, pagination) {
        return await audit_model_1.AuditModel.findAll(filters, pagination);
    }
    static async createAuditLog(auditData) {
        return await audit_model_1.AuditModel.create(auditData);
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map