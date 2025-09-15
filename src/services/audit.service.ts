import { AuditModel } from "../models/audit.model";
import { AuditLog } from "../types/audit.types";

export class AuditService {
  static async getAllAuditLogs(
    filters: {
      user_id?: string;
      min_created_at?: string;
      max_created_at?: string;
    },
    pagination: { limit: number; offset: number }
  ): Promise<{ data: AuditLog[]; total: number }> {
    return await AuditModel.findAll(filters, pagination);
  }

  static async createAuditLog(auditData: {
    user_id?: string;
    action: string;
    details?: Record<string, any>;
    previous_hash?: string;
    current_hash: string;
  }): Promise<AuditLog> {
    return await AuditModel.create(auditData);
  }
}
