# Design Document

## Overview

The subscription status validation error occurs because the subscription API endpoints lack proper validation middleware, while case endpoints have comprehensive validation. The error message indicates that subscription data with status 'active' is being validated against case status enum values, suggesting either:

1. A routing misconfiguration where subscription requests are hitting case endpoints
2. Missing validation middleware on subscription routes causing downstream validation issues
3. Incorrect validation schema being applied somewhere in the request pipeline

The solution involves implementing proper validation middleware for subscription endpoints and ensuring clear separation between subscription and case validation logic.

## Architecture

### Current State

- **Subscription Routes**: No validation middleware applied, direct service calls
- **Case Routes**: Comprehensive validation using `validateBody`, `validateQuery`, `validateParams`
- **Validation Middleware**: Centralized validation using Zod schemas with proper error formatting
- **DTOs**: Separate and correctly defined for subscriptions and cases

### Target State

- **Subscription Routes**: Full validation middleware implementation
- **Subscription Controller**: New controller layer for proper separation of concerns
- **Enhanced Error Handling**: Clear distinction between subscription and case validation errors
- **Route Testing**: Comprehensive tests to prevent validation mixups

## Components and Interfaces

### 1. Subscription Controller

```typescript
export class SubscriptionController {
  static async getSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  static async createSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  static async updateSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  static async deleteSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
```

### 2. Enhanced Subscription Routes

- Apply `validateBody(CreateSubscriptionDto)` for POST requests
- Apply `validateBody(UpdateSubscriptionDto)` for PUT requests
- Apply `validateParams(SubscriptionParamsDto)` for parameterized routes
- Apply `validateQuery(SubscriptionQueryDto)` for GET requests with filters

### 3. Validation Middleware Enhancements

- Add entity-specific error context to validation responses
- Ensure validation errors clearly indicate the entity type (subscription vs case)
- Maintain backward compatibility with existing validation patterns

### 4. Route Organization

```
/api/v1/subscriptions
├── GET /           - Get user's subscription (with query validation)
├── POST /          - Create subscription (with body validation)
├── PUT /:id        - Update subscription (with body + params validation)
└── DELETE /:id     - Delete subscription (with params validation)
```

## Data Models

### Subscription Status Enum

```typescript
enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  PAST_DUE = "past_due",
  TRIALING = "trialing",
}
```

### Case Status Enum (for reference)

```typescript
enum CaseStatus {
  INTAKE = "intake",
  AI_ANALYSIS = "ai_analysis",
  AWAITING_OFFICER_REVIEW = "awaiting_officer_review",
  AWAITING_CVO_REVIEW = "awaiting_cvo_review",
  AWAITING_LEGAL_REVIEW = "awaiting_legal_review",
  FINALIZED = "finalized",
  ARCHIVED = "archived",
}
```

### Validation Error Response

```typescript
interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    field: string;
    message: string;
    code: string;
    entity?: "subscription" | "case"; // New field for clarity
  }>;
}
```

## Error Handling

### Validation Error Types

1. **Subscription Status Validation**: Clear messages for invalid subscription status values
2. **Case Status Validation**: Clear messages for invalid case status values
3. **Cross-Entity Validation**: Specific errors when wrong entity data is sent to endpoints
4. **Parameter Validation**: ID format and range validation for route parameters

### Error Response Format

```json
{
  "success": false,
  "message": "Subscription validation failed",
  "errors": [
    {
      "field": "status",
      "message": "Invalid subscription status. Expected 'active' | 'cancelled' | 'past_due' | 'trialing'",
      "code": "invalid_enum_value",
      "entity": "subscription"
    }
  ]
}
```

## Testing Strategy

### Unit Tests

- **Subscription Controller Tests**: Verify each controller method handles validation correctly
- **Validation Middleware Tests**: Test subscription-specific validation schemas
- **DTO Tests**: Verify subscription DTOs accept valid data and reject invalid data

### Integration Tests

- **Route Validation Tests**: Test each subscription endpoint with valid/invalid data
- **Cross-Entity Tests**: Verify subscription endpoints reject case data appropriately
- **Error Response Tests**: Verify error messages are entity-specific and helpful

### Test Scenarios

1. **Valid Subscription Data**: All endpoints accept correct subscription status values
2. **Invalid Subscription Data**: Proper error responses for invalid status values
3. **Case Data to Subscription Endpoints**: Clear rejection with appropriate error messages
4. **Subscription Data to Case Endpoints**: Verify case endpoints still work correctly
5. **Parameter Validation**: ID validation works correctly for subscription routes

### Test Data

```typescript
// Valid subscription test data
const validSubscriptionData = {
  user_id: 1,
  plan_id: 1,
  status: "active",
  start_date: new Date().toISOString(),
};

// Invalid subscription test data
const invalidSubscriptionData = {
  user_id: 1,
  plan_id: 1,
  status: "intake", // Case status, not subscription status
  start_date: new Date().toISOString(),
};
```

## Implementation Approach

### Phase 1: Controller Creation

- Create `SubscriptionController` with proper error handling
- Move business logic from routes to controller methods
- Maintain existing functionality while adding structure

### Phase 2: Validation Integration

- Add validation middleware to all subscription routes
- Update routes to use controller methods
- Ensure parameter validation for ID-based routes

### Phase 3: Error Enhancement

- Add entity context to validation errors
- Improve error messages for better debugging
- Maintain backward compatibility

### Phase 4: Testing

- Comprehensive test suite for all subscription endpoints
- Cross-entity validation tests
- Integration tests with existing case functionality
