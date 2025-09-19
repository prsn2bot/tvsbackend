import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Validation middleware factory
export const validate = (
  schema: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  },
  entityType?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
          ...(entityType && { entity: entityType }),
        }));

        const entityMessage = entityType
          ? `${
              entityType.charAt(0).toUpperCase() + entityType.slice(1)
            } validation failed`
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

// Specific validation helpers
export const validateBody = (schema: z.ZodSchema, entityType?: string) =>
  validate({ body: schema }, entityType);
export const validateQuery = (schema: z.ZodSchema, entityType?: string) =>
  validate({ query: schema }, entityType);
export const validateParams = (schema: z.ZodSchema, entityType?: string) =>
  validate({ params: schema }, entityType);
export const validateAll = (
  bodySchema: z.ZodSchema,
  querySchema?: z.ZodSchema,
  paramsSchema?: z.ZodSchema,
  entityType?: string
) =>
  validate(
    {
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    },
    entityType
  );
