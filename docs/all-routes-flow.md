# All Routes Flow: Controller-Service-Model

This document provides sequence diagrams for the flow of data through Controller -> Service -> Model for all API routes in the application.

## Authentication Routes

### POST /api/v1/auth/register

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant AuthModel
    participant DB

    Client->>AuthController: POST /register with user data
    AuthController->>AuthController: Validate schema
    AuthController->>AuthService: register(userData)
    AuthService->>AuthService: Hash password, check uniqueness
    AuthService->>AuthModel: createUser(userData)
    AuthModel->>DB: INSERT INTO users
    DB-->>AuthModel: Return user
    AuthModel-->>AuthService: Return user
    AuthService-->>AuthController: Return user
    AuthController-->>Client: 201 Created
```

### POST /api/v1/auth/login

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant AuthModel
    participant DB

    Client->>AuthController: POST /login with email/password
    AuthController->>AuthController: Validate schema
    AuthController->>AuthService: login(credentials)
    AuthService->>AuthModel: findUserByEmail(email)
    AuthModel->>DB: SELECT FROM users
    DB-->>AuthModel: Return user
    AuthModel-->>AuthService: Return user
    AuthService->>AuthService: Verify password, generate tokens
    AuthService-->>AuthController: Return TokenResponse
    AuthController-->>Client: 200 OK
```

### POST /api/v1/auth/refresh-token

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant DB

    Client->>AuthController: POST /refresh-token with refreshToken
    AuthController->>AuthController: Validate schema
    AuthController->>AuthService: refreshToken(refreshToken)
    AuthService->>AuthService: Verify refresh token
    AuthService->>DB: (Optional) Check refresh token in DB
    DB-->>AuthService: Valid
    AuthService->>AuthService: Generate new access token
    AuthService-->>AuthController: Return new TokenResponse
    AuthController-->>Client: 200 OK
```

## User Routes

### GET /api/v1/users/me

```mermaid
sequenceDiagram
    participant Client
    participant UserController
    participant UserService
    participant UserModel
    participant DB

    Client->>UserController: GET /me (authenticated)
    UserController->>UserService: getUserProfile(userId)
    UserService->>UserModel: findUserWithProfile(userId)
    UserModel->>DB: SELECT FROM users JOIN user_profiles
    DB-->>UserModel: Return data
    UserModel-->>UserService: Return UserWithProfile
    UserService-->>UserController: Return data
    UserController-->>Client: 200 OK
```

### PUT /api/v1/users/me

```mermaid
sequenceDiagram
    participant Client
    participant UserController
    participant UserService
    participant UserModel
    participant DB

    Client->>UserController: PUT /me with profileData
    UserController->>UserController: Validate schema
    UserController->>UserService: updateUserProfile(userId, profileData)
    UserService->>UserModel: updateProfile(userId, profileData)
    UserModel->>DB: UPDATE user_profiles SET ... WHERE user_id = $1
    DB-->>UserModel: Rows affected
    UserModel-->>UserService: Success
    UserService-->>UserController: Updated profile
    UserController-->>Client: 200 OK
```

## Case Routes

### POST /api/v1/cases

```mermaid
sequenceDiagram
    participant Client
    participant CaseController
    participant CaseService
    participant CaseModel
    participant DB

    Client->>CaseController: POST /cases with caseData
    CaseController->>CaseController: Validate schema
    CaseController->>CaseService: createCase(userId, caseData)
    CaseService->>CaseModel: create(caseData)
    CaseModel->>DB: INSERT INTO cases
    DB-->>CaseModel: Return case
    CaseModel-->>CaseService: Return case
    CaseService-->>CaseController: Return case
    CaseController-->>Client: 201 Created
```

### GET /api/v1/cases

```mermaid
sequenceDiagram
    participant Client
    participant CaseController
    participant CaseService
    participant CaseModel
    participant DB

    Client->>CaseController: GET /cases?page=1&limit=10&status=intake&min_created_at=2023-01-01
    CaseController->>CaseController: Parse query params
    CaseController->>CaseService: getCases(userId, filters, pagination)
    CaseService->>CaseModel: findCasesByUser(userId, filters, pagination)
    CaseModel->>DB: SELECT * FROM cases WHERE officer_user_id = $1 AND status = $2 AND created_at >= $3 ORDER BY created_at DESC LIMIT $4 OFFSET $5
    DB-->>CaseModel: Return cases
    CaseModel-->>CaseService: Return cases
    CaseService-->>CaseController: Return PaginatedResponse
    CaseController-->>Client: 200 OK
```

### GET /api/v1/cases/:caseId

```mermaid
sequenceDiagram
    participant Client
    participant CaseController
    participant CaseService
    participant CaseModel
    participant DB

    Client->>CaseController: GET /cases/:caseId
    CaseController->>CaseService: getCaseById(caseId, userId)
    CaseService->>CaseModel: findById(caseId)
    CaseModel->>DB: SELECT * FROM cases WHERE id = $1
    DB-->>CaseModel: Return case
    CaseModel-->>CaseService: Return case
    CaseService-->>CaseController: Return case
    CaseController-->>Client: 200 OK
```

### POST /api/v1/cases/:caseId/documents

```mermaid
sequenceDiagram
    participant Client
    participant CaseController
    participant CaseService
    participant DocumentModel
    participant DB
    participant Queue

    Client->>CaseController: POST /cases/:caseId/documents with documentData
    CaseController->>CaseController: Validate schema
    CaseController->>CaseService: addDocument(caseId, documentData)
    CaseService->>DocumentModel: create(documentData)
    DocumentModel->>DB: INSERT INTO documents
    DB-->>DocumentModel: Return document
    DocumentModel-->>CaseService: Return document
    CaseService->>Queue: Enqueue AI processing job
    Queue-->>CaseService: Job queued
    CaseService-->>CaseController: Return document
    CaseController-->>Client: 201 Created
```

### POST /api/v1/cases/:caseId/review

```mermaid
sequenceDiagram
    participant Client
    participant CaseController
    participant CaseService
    participant ReviewModel
    participant DB

    Client->>CaseController: POST /cases/:caseId/review with reviewData
    CaseController->>CaseController: Validate schema
    CaseController->>CaseService: submitReview(caseId, reviewData, reviewerId)
    CaseService->>ReviewModel: create(reviewData)
    ReviewModel->>DB: INSERT INTO reviews
    DB-->>ReviewModel: Return review
    ReviewModel-->>CaseService: Return review
    CaseService-->>CaseController: Return review
    CaseController-->>Client: 201 Created
```

## Plan Routes

### GET /api/v1/plans

```mermaid
sequenceDiagram
    participant Client
    participant PlanController
    participant PlanService
    participant PlanModel
    participant DB

    Client->>PlanController: GET /plans?page=1&limit=10&min_price=10&max_price=50
    PlanController->>PlanController: Parse query params
    PlanController->>PlanService: getPlans(filters, pagination)
    PlanService->>PlanModel: findAll(filters, pagination)
    PlanModel->>DB: SELECT * FROM plans WHERE price_monthly >= $1 AND price_monthly <= $2 ORDER BY price_monthly ASC LIMIT $3 OFFSET $4
    DB-->>PlanModel: Return plans
    PlanModel-->>PlanService: Return plans
    PlanService-->>PlanController: Return PaginatedResponse
    PlanController-->>Client: 200 OK
```

### POST /api/v1/plans (Admin)

Create new plan.

### PUT /api/v1/plans/:id (Admin)

Update plan.

### DELETE /api/v1/plans/:id (Admin)

Delete plan.

## Subscription Routes

### GET /api/v1/subscriptions

```mermaid
sequenceDiagram
    participant Client
    participant SubscriptionController
    participant SubscriptionService
    participant SubscriptionModel
    participant DB

    Client->>SubscriptionController: GET /subscriptions?page=1&limit=10&status=active&min_price=20
    SubscriptionController->>SubscriptionController: Parse query params
    SubscriptionController->>SubscriptionService: getSubscriptions(userId, filters, pagination)
    SubscriptionService->>SubscriptionModel: findByUser(userId, filters, pagination)
    SubscriptionModel->>DB: SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 AND plan_id IN (SELECT id FROM plans WHERE price_monthly >= $3) ORDER BY start_date DESC LIMIT $4 OFFSET $5
    DB-->>SubscriptionModel: Return subscriptions
    SubscriptionModel-->>SubscriptionService: Return subscriptions with plans
    SubscriptionService-->>SubscriptionController: Return PaginatedResponse
    SubscriptionController-->>Client: 200 OK
```

### POST /api/v1/subscriptions

Create subscription (admin only).

### PUT /api/v1/subscriptions/:id

Update subscription (admin only).

### DELETE /api/v1/subscriptions/:id

Cancel subscription (admin only).

## Admin Routes

### GET /api/v1/admin/users

```mermaid
sequenceDiagram
    participant Client
    participant AdminController
    participant UserService
    participant UserModel
    participant DB

    Client->>AdminController: GET /admin/users?page=1&limit=10&role=officer&status=active
    AdminController->>AdminController: Parse query params
    AdminController->>UserService: getAllUsers(filters, pagination)
    UserService->>UserModel: findAll(filters, pagination)
    UserModel->>DB: SELECT * FROM users WHERE role = $1 AND account_status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4
    DB-->>UserModel: Return users
    UserModel-->>UserService: Return users
    UserService-->>AdminController: Return PaginatedResponse
    AdminController-->>Client: 200 OK
```

### PUT /api/v1/admin/users/:userId/status

Update user status.

### GET /api/v1/admin/cases

```mermaid
sequenceDiagram
    participant Client
    participant AdminController
    participant CaseService
    participant CaseModel
    participant DB

    Client->>AdminController: GET /admin/cases?page=1&limit=10&status=intake&min_created_at=2023-01-01
    AdminController->>AdminController: Parse query params
    AdminController->>CaseService: getAllCases(filters, pagination)
    CaseService->>CaseModel: findAll(filters, pagination)
    CaseModel->>DB: SELECT * FROM cases WHERE status = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4
    DB-->>CaseModel: Return cases
    CaseModel-->>CaseService: Return cases
    CaseService-->>AdminController: Return PaginatedResponse
    AdminController-->>Client: 200 OK
```

### GET /api/v1/admin/subscriptions

Similar to GET /subscriptions, but for all users.

### POST /api/v1/admin/subscriptions

Create subscription for any user.

### PUT /api/v1/admin/subscriptions/:id

Update any subscription.

### DELETE /api/v1/admin/subscriptions/:id

Cancel any subscription.

### GET /api/v1/admin/plans

List all plans with filters.

### PUT /api/v1/admin/plans/:id

Update plan.

### DELETE /api/v1/admin/plans/:id

Delete plan.

### GET /api/v1/admin/audit-logs

```mermaid
sequenceDiagram
    participant Client
    participant AdminController
    participant AuditService
    participant AuditModel
    participant DB

    Client->>AdminController: GET /admin/audit-logs?page=1&limit=10&action=login&min_created_at=2023-01-01
    AdminController->>AdminController: Parse query params
    AdminController->>AuditService: getAuditLogs(filters, pagination)
    AuditService->>AuditModel: findAll(filters, pagination)
    AuditModel->>DB: SELECT * FROM audit_logs WHERE action = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4
    DB-->>AuditModel: Return logs
    AuditModel-->>AuditService: Return logs
    AuditService-->>AdminController: Return PaginatedResponse
    AdminController-->>Client: 200 OK
```

## General Notes

- All routes use authentication middleware to attach user to req.
- Role-based access uses hasRole middleware.
- Subscription features checked where applicable.
- Rate limiting applied to all routes.
- Usage tracking for metered features.
- Errors handled with custom AppError and sent as JSON.
- Database operations use raw SQL with parameterized queries.
