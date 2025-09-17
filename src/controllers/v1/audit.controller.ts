import { Request, Response } from "express";
import { AuditService } from "../../services/audit.service";
import { ApiResponse, PaginatedResponse } from "../../types/common.types";
import { AuditLog } from "../../types/audit.types";

export class AuditController {
  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        min_created_at,
        max_created_at,
      } = req.query;

      const filters: {
        user_id?: number;
        min_created_at?: string;
        max_created_at?: string;
      } = {};

      if (user_id) {
        filters.user_id = parseInt(user_id as string, 10);
      }
      if (min_created_at) {
        filters.min_created_at = min_created_at as string;
      }
      if (max_created_at) {
        filters.max_created_at = max_created_at as string;
      }

      const pagination = {
        limit: parseInt(limit as string, 10),
        offset:
          (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
      };

      const result = await AuditService.getAllAuditLogs(filters, pagination);

      const response: PaginatedResponse<AuditLog> = {
        data: result.data,
        pagination: {
          total: result.total,
          limit: pagination.limit,
          offset: pagination.offset,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
