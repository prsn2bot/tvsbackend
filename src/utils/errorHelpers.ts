import { AppError } from "./AppError";

/**
 * Common error helper functions to maintain consistency across services
 */
export class ErrorHelpers {
  // Authentication errors (401)
  static invalidCredentials(message: string = "Invalid email or password") {
    return new AppError(message, 401);
  }

  static unauthorized(message: string = "Unauthorized access") {
    return new AppError(message, 401);
  }

  static tokenExpired(message: string = "Token has expired") {
    return new AppError(message, 401);
  }

  static invalidToken(message: string = "Invalid token") {
    return new AppError(message, 401);
  }

  // Validation errors (400)
  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static missingFields(fields: string[]) {
    return new AppError(`Missing required fields: ${fields.join(", ")}`, 400);
  }

  static invalidInput(message: string) {
    return new AppError(message, 400);
  }

  // Not found errors (404)
  static notFound(resource: string = "Resource") {
    return new AppError(`${resource} not found`, 404);
  }

  static userNotFound() {
    return new AppError("User not found", 404);
  }

  // Conflict errors (409)
  static alreadyExists(resource: string) {
    return new AppError(`${resource} already exists`, 409);
  }

  static userAlreadyExists() {
    return new AppError("User already exists", 409);
  }

  // Forbidden errors (403)
  static forbidden(message: string = "Access forbidden") {
    return new AppError(message, 403);
  }

  static insufficientPermissions() {
    return new AppError("Insufficient permissions", 403);
  }

  // Server errors (500)
  static internalError(message: string = "Internal server error") {
    return new AppError(message, 500);
  }

  // Service unavailable (503)
  static serviceUnavailable(
    message: string = "Service temporarily unavailable"
  ) {
    return new AppError(message, 503);
  }
}
