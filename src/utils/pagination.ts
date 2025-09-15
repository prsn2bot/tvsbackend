import { Request } from "express";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}
export const getPaginationParams = (req: Request): PaginationParams => {
  const queryOffset = parseInt(req.query.offset as string, 10);
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  // Enforce a maximum limit of 50
  const effectiveLimit = Math.min(limit, 50);

  // If offset is provided, use it directly. Otherwise, calculate from page and limit.
  const offset = !isNaN(queryOffset)
    ? queryOffset
    : (page - 1) * effectiveLimit;

  return { page, limit: effectiveLimit, offset };
};
