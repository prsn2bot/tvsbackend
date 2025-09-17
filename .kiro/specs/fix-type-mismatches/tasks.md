# Implementation Plan

- [x] 1. Update core type definitions and interfaces

  - Update job queue types to use number document IDs
  - Update AI draft model types to use number case_id
  - Update audit service filter types to use number user_id
  - _Requirements: 1.1, 1.2, 2.2, 4.1_

- [x] 2. Fix case controller parameter type conversions

  - Convert string caseId parameters to numbers in getCaseById method
  - Convert string caseId parameters to numbers in addDocument method
  - Convert string caseId parameters to numbers in submitReview method
  - Add validation for numeric conversion with proper error handling
  - _Requirements: 1.2, 1.3_

- [x] 3. Fix audit controller and webhook type handling

  - Update audit controller to handle number user_id in filters
  - Fix razor webhook controller to use number user_id
  - _Requirements: 2.1, 2.2_

- [x] 4. Update admin routes with parameter conversion

  - Convert string userId to number in user status update route
  - Convert string userId to number in user role update route
  - Convert string subscription id to number in subscription management routes
  - Add validation for all numeric conversions
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Fix subscription routes parameter conversion

  - Convert string id parameters to numbers in subscription update route
  - Convert string id parameters to numbers in subscription delete route
  - Add proper validation and error handling
  - _Requirements: 3.2, 3.3_

- [x] 6. Update service layer job queue integration

  - Fix case service to pass number document ID to AI processing job
  - Update job queue call to use number type
  - _Requirements: 4.1, 4.2_

- [x] 7. Fix AI draft processor for number ID handling

  - Update AI draft processor to handle number document IDs
  - Fix case_id type when creating AI drafts
  - Update all document model calls to use number IDs
  - _Requirements: 4.2, 4.3_

- [x] 8. Fix usage tracking middleware audit integration

  - Update usage tracking middleware to pass number user_id to audit service
  - Ensure proper type handling in audit log creation
  - _Requirements: 2.1, 2.3_

- [x] 9. Fix subscription model query parameter handling

  - Update subscription model to handle number ID parameters correctly
  - Fix parameter type issues in query methods
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 10. Add comprehensive validation and error handling

  - Implement consistent ID validation pattern across all controllers
  - Add proper error messages for invalid ID formats
  - Test all numeric conversions for edge cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 11. Verify TypeScript compilation and run tests

  - Run TypeScript compiler to ensure no type errors remain
  - Execute existing tests to verify functionality
  - Fix any remaining type-related issues
  - _Requirements: 1.1_
