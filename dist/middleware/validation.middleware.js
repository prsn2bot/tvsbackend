"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAll = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
// Validation middleware factory
const validate = (schema, entityType) => {
    return (req, res, next) => {
        try {
            // Validate request body
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            // Validate query parameters
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            // Validate route parameters
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationErrors = error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                    ...(entityType && { entity: entityType }),
                }));
                const entityMessage = entityType
                    ? `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} validation failed`
                    : "Validation failed";
                return res.status(400).json({
                    success: false,
                    message: entityMessage,
                    errors: validationErrors,
                });
            }
            // Handle other types of errors
            return res.status(500).json({
                success: false,
                message: "Internal server error during validation",
            });
        }
    };
};
exports.validate = validate;
// Specific validation helpers
const validateBody = (schema, entityType) => (0, exports.validate)({ body: schema }, entityType);
exports.validateBody = validateBody;
const validateQuery = (schema, entityType) => (0, exports.validate)({ query: schema }, entityType);
exports.validateQuery = validateQuery;
const validateParams = (schema, entityType) => (0, exports.validate)({ params: schema }, entityType);
exports.validateParams = validateParams;
const validateAll = (bodySchema, querySchema, paramsSchema, entityType) => (0, exports.validate)({
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
}, entityType);
exports.validateAll = validateAll;
//# sourceMappingURL=validation.middleware.js.map