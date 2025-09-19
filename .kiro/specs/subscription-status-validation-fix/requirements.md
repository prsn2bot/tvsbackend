# Requirements Document

## Introduction

This feature addresses a critical validation error in the subscription system where subscription status values are being incorrectly validated against case status enum values. The error occurs when the `/subscriptions` endpoint receives a valid subscription status ('active') but the validation middleware expects case status values ('intake', 'ai_analysis', etc.). This indicates a routing or validation configuration issue that needs to be resolved to ensure proper API functionality.

## Requirements

### Requirement 1

**User Story:** As an API consumer, I want to be able to send subscription requests with valid subscription status values without receiving validation errors, so that I can successfully manage subscription data.

#### Acceptance Criteria

1. WHEN a subscription endpoint receives a request with status 'active' THEN the system SHALL accept it as a valid subscription status
2. WHEN a subscription endpoint receives a request with status 'cancelled', 'past_due', or 'trialing' THEN the system SHALL accept these as valid subscription status values
3. WHEN a subscription endpoint receives an invalid subscription status THEN the system SHALL return an error message specific to subscription status validation
4. WHEN a case endpoint receives a subscription status value THEN the system SHALL return an appropriate validation error for case-specific status values

### Requirement 2

**User Story:** As a developer, I want clear separation between subscription and case validation logic, so that there are no cross-contamination issues between different entity validations.

#### Acceptance Criteria

1. WHEN the system validates subscription data THEN it SHALL use only subscription-specific validation schemas
2. WHEN the system validates case data THEN it SHALL use only case-specific validation schemas
3. WHEN validation fails THEN the error message SHALL clearly indicate which entity type and field caused the validation failure
4. WHEN multiple validation errors occur THEN the system SHALL return all relevant errors grouped by entity type

### Requirement 3

**User Story:** As a system administrator, I want to identify and fix any routing misconfigurations that cause validation mixups, so that API endpoints behave predictably and correctly.

#### Acceptance Criteria

1. WHEN a subscription route is accessed THEN it SHALL use subscription validation middleware exclusively
2. WHEN a case route is accessed THEN it SHALL use case validation middleware exclusively
3. WHEN middleware is applied to routes THEN it SHALL be applied in the correct order and scope
4. WHEN route parameters are validated THEN they SHALL use the appropriate parameter validation schema for that entity type

### Requirement 4

**User Story:** As a quality assurance engineer, I want comprehensive tests that verify subscription status validation works correctly, so that this type of validation mixup doesn't happen again.

#### Acceptance Criteria

1. WHEN subscription endpoints are tested with valid status values THEN all tests SHALL pass
2. WHEN subscription endpoints are tested with invalid status values THEN appropriate validation errors SHALL be returned
3. WHEN case endpoints are tested with subscription status values THEN appropriate validation errors SHALL be returned
4. WHEN integration tests run THEN they SHALL verify that subscription and case validations are completely separate
