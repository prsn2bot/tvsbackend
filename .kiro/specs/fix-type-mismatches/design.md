# Design Document

## Overview

This design addresses the systematic fixing of type mismatches throughout the codebase after the database migration from string IDs to SERIAL (integer) IDs. The solution involves updating type definitions, adding proper type conversions in controllers, and ensuring consistency across all layers of the application.

## Architecture

The fix follows the existing MVC architecture pattern:

- **Routes**: Convert string parameters to numbers before passing to controllers
- **Controllers**: Handle type conversion and validation of ID parameters
- **Services**: Use number types consistently for all ID operations
- **Models**: Already updated to use number types from the migration
- **Jobs**: Update job data types and processors to use number IDs

## Components and Interfaces

### 1. Type Definitions Updates

**Job Queue Types** (`src/jobs/queue.ts`)

- Update `AiProcessingJobData` interface to use `documentId: number`

**AI Draft Model Types** (`src/models/aiDraft.model.ts`)

- Update `CreateAiDraftData` interface to use `case_id: number`

**Audit Service Types** (`src/services/audit.service.ts`)

- Update filter interfaces to use `user_id?: number` instead of string

### 2. Controller Layer Updates

**Case Controller** (`src/controllers/v1/case.controller.ts`)

- Convert string `caseId` parameters to numbers using `parseInt()`
- Add validation to ensure conversion is successful

**Audit Controller** (`src/controllers/v1/audit.controller.ts`)

- Convert string `user_id` filter to number type

**Razor Webhook Controller** (`src/controllers/v1/razorWebhook.controller.ts`)

- Ensure `user_id` is treated as number type

### 3. Route Layer Updates

**Admin Routes** (`src/routes/v1/admin.route.ts`)

- Convert string `userId` and `id` parameters to numbers
- Add validation for numeric conversion

**Subscription Routes** (`src/routes/v1/subscription.route.ts`)

- Convert string `id` parameters to numbers for subscription operations

### 4. Service Layer Updates

**Case Service** (`src/services/case.service.ts`)

- Update job queue calls to pass number document IDs

**Audit Service** (`src/services/audit.service.ts`)

- Update method signatures to accept number user_id

### 5. Job Processing Updates

**AI Draft Processor** (`src/jobs/processors/aiDraftProcessor.ts`)

- Update to handle number document IDs
- Ensure case_id is passed as number to AI draft creation

**Usage Tracking Middleware** (`src/middleware/usageTracking.middleware.ts`)

- Ensure user_id is passed as number to audit service

### 6. Model Updates

**Subscription Model** (`src/models/subscription.model.ts`)

- Fix parameter type handling in query methods

## Data Models

### Updated Interface Definitions

```typescript
// Job Queue Types
interface AiProcessingJobData {
  documentId: number; // Changed from string
}

// AI Draft Types
interface CreateAiDraftData {
  case_id: number; // Changed from string
  version: number;
  content: string;
  defence_score?: number;
  confidence_score?: number;
}

// Audit Filter Types
interface AuditFilters {
  user_id?: number; // Changed from string
  min_created_at?: string;
  max_created_at?: string;
}
```

## Error Handling

### Type Conversion Validation

- Add validation for `parseInt()` operations to ensure valid numbers
- Return appropriate HTTP 400 errors for invalid ID parameters
- Use `isNaN()` checks after conversion

### Example Validation Pattern

```typescript
const numericId = parseInt(stringId, 10);
if (isNaN(numericId)) {
  return res.status(400).json({ error: "Invalid ID format" });
}
```

## Testing Strategy

### Unit Tests

- Test type conversion functions in controllers
- Verify proper error handling for invalid ID formats
- Test service methods with number ID parameters

### Integration Tests

- Test complete request flows with string parameters converted to numbers
- Verify job processing with number document IDs
- Test audit logging with number user IDs

### Type Safety Tests

- Ensure TypeScript compilation passes without errors
- Verify no runtime type errors occur during normal operations

## Implementation Approach

### Phase 1: Core Type Updates

1. Update interface definitions in job queue and model types
2. Fix audit service type signatures

### Phase 2: Controller Updates

3. Update case controller parameter conversion
4. Fix audit controller filter handling
5. Update webhook controller type handling

### Phase 3: Route and Service Updates

6. Update admin routes with parameter conversion
7. Update subscription routes with parameter conversion
8. Fix service layer job queue calls

### Phase 4: Job Processing Updates

9. Update AI draft processor for number IDs
10. Fix usage tracking middleware
11. Update subscription model query handling

### Phase 5: Validation and Testing

12. Add comprehensive validation for ID conversions
13. Test all updated endpoints
14. Verify TypeScript compilation
