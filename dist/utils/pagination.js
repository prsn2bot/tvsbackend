"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = void 0;
const getPaginationParams = (req) => {
    const queryOffset = parseInt(req.query.offset, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    // Enforce a maximum limit of 50
    const effectiveLimit = Math.min(limit, 50);
    // If offset is provided, use it directly. Otherwise, calculate from page and limit.
    const offset = !isNaN(queryOffset)
        ? queryOffset
        : (page - 1) * effectiveLimit;
    return { page, limit: effectiveLimit, offset };
};
exports.getPaginationParams = getPaginationParams;
//# sourceMappingURL=pagination.js.map