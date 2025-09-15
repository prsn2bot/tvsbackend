# Middleware Flow and Design

This document outlines the middleware architecture and flow for the API application.

## Overall Middleware Architecture

```mermaid
graph TD
    A[Client Request] --> B[Global Middleware]
    B --> C[Route-Specific Middleware]
    C --> D[Controller]
    D --> E[Response]

    B --> B1[Rate Limiting]
    B --> B2[CORS]
    B --> B3[Body Parser]
    B --> B4[Logging]

    C --> C1[Authentication]
    C --> C2[Role Authorization]
    C --> C3[Subscription Check]
    C --> C4[Usage Tracking]
```

## Middleware Execution Order

1. **Global Middleware** (applied to all routes in `app.ts`)

   - Rate limiting (`rateLimitMiddleware`)
   - CORS handling
   - Body parsing (JSON, URL-encoded)
   - Request logging

2. **Route-Specific Middleware** (applied per route)
   - Authentication (`authenticate`)
   - Role-based access (`hasRole`)
   - Subscription feature checks (`subscriptionFeatureMiddleware`)
   - Usage tracking (`usageTrackingMiddleware`)

## Detailed Middleware Flows

### 1. Authentication Middleware (`authenticate`)

```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant JWT
    participant UserModel
    participant DB

    Client->>AuthMiddleware: Request with Authorization header
    AuthMiddleware->>AuthMiddleware: Extract Bearer token
    AuthMiddleware->>JWT: Verify token signature
    JWT-->>AuthMiddleware: Decoded payload (userId, role, etc.)
    AuthMiddleware->>UserModel: findUserById(userId)
    UserModel->>DB: SELECT FROM users WHERE id = $1
    DB-->>UserModel: User data
    UserModel-->>AuthMiddleware: User object
    AuthMiddleware->>AuthMiddleware: Attach user to req.user
    AuthMiddleware-->>Client: Proceed to next middleware
```

**Implementation Points:**

- Extract token from `Authorization: Bearer <token>` header
- Verify JWT using secret key
- Fetch user from database to ensure validity
- Attach user object to `req.user`
- Handle token expiry, invalid tokens, missing users

### 2. Role Authorization Middleware (`hasRole`)

```mermaid
sequenceDiagram
    participant Client
    participant RoleMiddleware
    participant AuthMiddleware

    Client->>RoleMiddleware: Request (authenticated)
    RoleMiddleware->>RoleMiddleware: Check req.user exists
    RoleMiddleware->>RoleMiddleware: Check req.user.role in allowedRoles
    RoleMiddleware-->>Client: 403 Forbidden (if not authorized)
    RoleMiddleware-->>Client: Proceed (if authorized)
```

**Implementation Points:**

- Requires `authenticate` middleware to run first
- Accepts array of allowed roles: `hasRole(['admin', 'officer'])`
- Returns 403 if user role not in allowed list
- Admin role should have access to all routes

### 3. Rate Limiting Middleware (`rateLimitMiddleware`)

```mermaid
sequenceDiagram
    participant Client
    participant RateLimitMiddleware
    participant Redis
    participant Config

    Client->>RateLimitMiddleware: Request
    RateLimitMiddleware->>RateLimitMiddleware: Extract client identifier (IP/userId)
    RateLimitMiddleware->>Redis: Check current request count
    Redis-->>RateLimitMiddleware: Current count
    RateLimitMiddleware->>RateLimitMiddleware: Compare with limit
    RateLimitMiddleware-->>Client: 429 Too Many Requests (if exceeded)
    RateLimitMiddleware->>Redis: Increment counter
    RateLimitMiddleware-->>Client: Proceed
```

**Implementation Points:**

- Use Redis for distributed rate limiting
- Different limits for different user roles
- Sliding window or fixed window algorithm
- Include retry-after header in 429 responses

### 4. Subscription Feature Middleware (`subscriptionFeatureMiddleware`)

```mermaid
sequenceDiagram
    participant Client
    participant SubscriptionMiddleware
    participant SubscriptionService
    participant PlanService
    participant DB

    Client->>SubscriptionMiddleware: Request (authenticated)
    SubscriptionMiddleware->>SubscriptionService: getActiveSubscription(userId)
    SubscriptionService->>DB: Check active subscription
    DB-->>SubscriptionService: Subscription data
    SubscriptionService-->>SubscriptionMiddleware: Subscription with plan
    SubscriptionMiddleware->>PlanService: checkFeatureAccess(plan, feature)
    PlanService-->>SubscriptionMiddleware: Feature allowed?
    SubscriptionMiddleware-->>Client: 402 Payment Required (if not allowed)
    SubscriptionMiddleware-->>Client: Proceed (if allowed)
```

**Implementation Points:**

- Check if user has active subscription
- Verify plan includes required features
- Different features: case creation, document upload, AI processing
- Graceful degradation or upgrade prompts

### 5. Usage Tracking Middleware (`usageTrackingMiddleware`)

```mermaid
sequenceDiagram
    participant Client
    participant UsageMiddleware
    participant UsageService
    participant DB

    Client->>UsageMiddleware: Request
    UsageMiddleware->>UsageMiddleware: Track request start time
    UsageMiddleware-->>Client: Proceed to controller
    Client->>UsageMiddleware: Response
    UsageMiddleware->>UsageService: recordUsage(userId, feature, usageData)
    UsageService->>DB: INSERT/UPDATE usage metrics
    DB-->>UsageService: Success
    UsageService-->>UsageMiddleware: Logged
    UsageMiddleware-->>Client: Send response
```

**Implementation Points:**

- Track API calls, data usage, AI processing time
- Metered billing integration
- Usage limits enforcement
- Analytics and reporting

## Middleware Configuration

### Global Middleware (in `app.ts`)

```typescript
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware);
app.use(requestLogger);
```

### Route-Specific Middleware Examples

```typescript
// Public routes
router.get("/plans", rateLimitMiddleware, planController.getPlans);

// Authenticated routes
router.get(
  "/users/me",
  authenticate,
  rateLimitMiddleware,
  subscriptionFeatureMiddleware,
  userController.getProfile
);

// Admin routes
router.get(
  "/admin/users",
  authenticate,
  hasRole(["admin"]),
  rateLimitMiddleware,
  adminController.getUsers
);

// Feature-restricted routes
router.post(
  "/cases",
  authenticate,
  rateLimitMiddleware,
  subscriptionFeatureMiddleware,
  usageTrackingMiddleware,
  caseController.createCase
);
```

## Error Handling in Middleware

All middleware should:

- Use `next(error)` for async errors
- Return appropriate HTTP status codes
- Include descriptive error messages
- Log security-related events

## Testing Middleware

- Unit tests for each middleware function
- Integration tests for middleware chains
- Load testing for rate limiting
- Security testing for authentication/authorization

## Next Steps

1. Implement authentication middleware with JWT verification
2. Add role-based authorization checks
3. Configure Redis-based rate limiting
4. Implement subscription feature validation
5. Add usage tracking and metrics
6. Write comprehensive tests for all middleware
