# Requirements Document

## Introduction

After migrating the database to use SERIAL (integer) primary keys instead of string IDs, there are type mismatches throughout the codebase where some components still expect string IDs while others now use number IDs. This feature will systematically fix all type inconsistencies to ensure the application works correctly with the new integer ID system.

## Requirements

### Requirement 1

**User Story:** As a developer, I want all ID types to be consistent throughout the application, so that there are no TypeScript compilation errors and the application functions correctly.

#### Acceptance Criteria

1. WHEN the TypeScript compiler runs THEN there SHALL be no type mismatch errors related to ID types
2. WHEN controllers receive ID parameters from routes THEN they SHALL properly convert string parameters to numbers before passing to services
3. WHEN services interact with models THEN they SHALL use number types for all ID parameters
4. WHEN job processors handle document IDs THEN they SHALL use number types consistently

### Requirement 2

**User Story:** As a developer, I want the audit system to work correctly with the new ID types, so that user actions are properly tracked.

#### Acceptance Criteria

1. WHEN audit logs are created THEN the user_id SHALL be stored as a number type
2. WHEN filtering audit logs by user_id THEN the filter SHALL accept number type parameters
3. WHEN usage tracking middleware creates audit entries THEN it SHALL use number type for user_id

### Requirement 3

**User Story:** As a developer, I want the subscription system to work correctly with the new ID types, so that user subscriptions are properly managed.

#### Acceptance Criteria

1. WHEN creating subscriptions THEN user_id and plan_id SHALL be number types
2. WHEN updating subscriptions THEN the subscription ID SHALL be converted from string to number
3. WHEN deleting subscriptions THEN the subscription ID SHALL be converted from string to number

### Requirement 4

**User Story:** As a developer, I want the AI processing jobs to work correctly with the new ID types, so that document processing functions properly.

#### Acceptance Criteria

1. WHEN AI processing jobs are queued THEN document IDs SHALL be number types
2. WHEN AI processors handle documents THEN they SHALL use number types for document and case IDs
3. WHEN creating AI drafts THEN case_id SHALL be number type

### Requirement 5

**User Story:** As a developer, I want admin routes to work correctly with the new ID types, so that user management functions properly.

#### Acceptance Criteria

1. WHEN admin updates user status THEN user ID SHALL be converted from string parameter to number
2. WHEN admin updates user role THEN user ID SHALL be converted from string parameter to number
3. WHEN admin manages subscriptions THEN subscription IDs SHALL be converted from string parameters to numbers
