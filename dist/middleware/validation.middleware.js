"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAll = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
// Validation middleware factory
const validate = (schema) => {
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
                }));
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
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
const validateBody = (schema) => (0, exports.validate)({ body: schema });
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validate)({ query: schema });
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validate)({ params: schema });
exports.validateParams = validateParams;
const validateAll = (bodySchema, querySchema, paramsSchema) => (0, exports.validate)({
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
});
exports.validateAll = validateAll;
//# sourceMappingURL=validation.middleware.js.map