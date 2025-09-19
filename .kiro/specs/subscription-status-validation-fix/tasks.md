# Implementation Plan

- [x] 1. Create subscription controller with proper error handling

  - Create `src/controllers/v1/subscription.controller.ts` with static methods for all CRUD operations
  - Move business logic from route handlers to controller methods
  - Implement proper error handling and response formatting in each controller method
  - _Requirements: 2.1, 2.2_

- [x] 2. Add validation middleware to subscription routes

  - Update `src/routes/v1/subscription.route.ts` to import validation middleware functions
  - Apply `validateBody(CreateSubscriptionDto)` to POST route for subscription creation
  - Apply `validateBody(UpdateSubscriptionDto)` and `validateParams(SubscriptionParamsDto)` to PUT route
  - Apply `validateParams(SubscriptionParamsDto)` to DELETE route
  - _Requirements: 1.1, 1.2, 3.1_

- [x] 3. Update subscription routes to use controller methods

  - Replace inline route handlers with controller method calls in subscription routes
  - Ensure all routes use the new controller methods
  - Maintain existing authentication and authorization middleware
  - _Requirements: 2.1, 3.1_

- [x] 4. Enhance validation error responses with entity context

  - Modify validation middleware to include entity type in error responses
  - Update error message formatting to be more specific for subscription validation
  - Ensure backward compatibility with existing error response format
  - _Requirements: 2.3, 2.4_

- [x] 5. Create comprehensive unit tests for subscription controller

  - Write unit tests for `SubscriptionController.createSubscription` method
  - Write unit tests for `SubscriptionController.updateSubscription` method
  - Write unit tests for `SubscriptionController.getSubscription` method
  - Write unit tests for `SubscriptionController.deleteSubscription` method
  - _Requirements: 4.1, 4.2_

- [x] 6. Create integration tests for subscription route validation

  - Write integration tests for POST `/subscriptions` with valid subscription status values
  - Write integration tests for PUT `/subscriptions/:id` with valid subscription status values
  - Write integration tests for subscription endpoints with invalid status values
  - Write integration tests to verify proper error responses for validation failures
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Create cross-entity validation tests

  - Write tests that send case status values to subscription endpoints
  - Write tests that send subscription status values to case endpoints
  - Verify that appropriate validation errors are returned for cross-entity data
  - Ensure error messages clearly indicate the expected entity type
  - _Requirements: 1.4, 4.3, 4.4_

- [x] 8. Add parameter validation tests for subscription routes

  - Write tests for subscription ID parameter validation in PUT and DELETE routes
  - Test invalid ID formats (non-numeric, negative numbers, zero)
  - Test valid ID formats and ensure they pass validation
  - Verify error responses for invalid parameters are clear and helpful
  - _Requirements: 3.4, 4.1_
