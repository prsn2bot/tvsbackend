# Backend API Flow and Structure

## Overall Architecture Flow

1. **Request Entry (Client -> Server)**:

   - HTTP request hits the server (e.g., Express app in `src/server.ts` or `src/app.ts`).

2. **Routing (src/routes/)**:

   - Routes are defined in `src/routes/v1/` (e.g., `auth.routes.ts`, `user.routes.ts`).
   - Routes specify HTTP methods, paths, and attach middleware/controllers.

3. **Middleware (src/middleware/)**:

   - Global middleware: Authentication (`auth.middleware.ts`), rate limiting (`rateLimitMiddleware.ts`), subscription checks (`subscriptionFeature.middleware.ts`), usage tracking (`usageTracking.middleware.ts`).
   - Applied per route or globally in `app.ts`.

4. **Controller (src/controllers/)**:

   - Handles request/response logic.
   - Validates input using Zod schemas (e.g., in `src/controllers/v1/auth.controller.ts`).
   - Calls service layer for business logic.

5. **Service (src/services/)**:

   - Contains business logic (e.g., `auth.service.ts`, `user.service.ts`).
   - Orchestrates data access, external APIs, and complex operations.

6. **Model (src/models/)**:

   - Data access layer interacting with PostgreSQL.
   - Uses raw SQL queries or an ORM.
   - Represents database tables (e.g., `user.model.ts` for users table).

7. **Database Schema (PostgreSQL)**:

   - Tables defined in SQL migrations or schema files.
   - Matches TypeScript interfaces (e.g., User interface aligns with users table).

8. **Response (Server -> Client)**:
   - Controller sends JSON response via `res.json()` or `res.status().json()`.

## Adding a Route to app.ts

In `src/app.ts`:

- Import the route: `import authRoutes from './routes/v1/auth.routes';`
- Register it: `app.use('/api/v1/auth', authRoutes);`
- Ensure middleware like `authenticate` is applied in the route file.

## Example Flow for Auth API

- **Route**: `POST /api/v1/auth/login` in `auth.routes.ts`
- **Middleware**: `authenticate` (if needed, but for login, usually not), validation.
- **Controller**: `authController.login` validates input, calls `authService.login`.
- **Service**: `authService.login` checks credentials against `userModel.getByEmail`, generates JWT.
- **Model**: `userModel.getByEmail` queries `users` table.
- **Response**: Returns `TokenResponse` with tokens.

## Complete API Routes Structure with Middleware

Based on the project specifications, here are the routes grouped by service, including required middleware for security:

### Auth Routes (/api/v1/auth)

- POST /register - Register new user
  - Middleware: rateLimitMiddleware (to prevent abuse)
- POST /login - Login user
  - Middleware: rateLimitMiddleware
- POST /refresh-token - Refresh access token
  - Middleware: rateLimitMiddleware

### User Routes (/api/v1/users)

- GET /me - Get my profile
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware
- PUT /me - Update my profile
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware

### Case Routes (/api/v1/cases)

- POST / - Create a new case
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware
- GET / - Get my cases (with pagination and filters by case title, status, min_created_at, max_created_at, min_updated_at, max_updated_at)
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware
- GET /:caseId - Get a specific case
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware
- POST /:caseId/documents - Add a document to a case
  - Middleware: authenticate, rateLimitMiddleware, subscriptionFeature.middleware
- POST /:caseId/review - Submit a review
  - Middleware: authenticate, hasRole(['cvo', 'legal_board','admin']), rateLimitMiddleware, subscriptionFeature.middleware

### Plan Routes (/api/v1/plans)

- GET / - List available plans (with pagination and filters by plan name, price, min_price, max_price)
  - Middleware: rateLimitMiddleware (public access)
- GET /:id - Get a specific plan
  - Middleware: rateLimitMiddleware (public access)
- POST / - Create a new plan
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- PUT /:id - Update a plan
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- DELETE /:id - Delete a plan
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware

### Subscription Routes (/api/v1/subscriptions)

- GET / - Get user's subscriptions (with pagination and filters by plan, status, min_price, max_price, min_start_date, max_start_date, min_end_date, max_end_date)
  - Middleware: authenticate, rateLimitMiddleware
- POST / - Create a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- PUT /:id - Update a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- DELETE /:id - Cancel a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware

### Admin Routes (/api/v1/admin)

- GET /users - List all users (with pagination and search by email, role, status)
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- PUT /users/:userId/status - Update user status
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- GET /cases - List all cases (with pagination and search by case title, status, officer, min_created_at, max_created_at, min_updated_at, max_updated_at)
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- GET /subscriptions - List all subscriptions (with pagination and search by user, plan, status, min_price, max_price, min_start_date, max_start_date, min_end_date, max_end_date)
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- POST /subscriptions - Create a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- PUT /subscriptions/:id - Update a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- DELETE /subscriptions/:id - Delete a subscription
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- GET /plans - List all plans (with pagination and filters by plan name, price, min_price, max_price)
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- PUT /plans/:id - Update a plan
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- DELETE /plans/:id - Delete a plan
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware
- GET /audit-logs - List audit logs (with pagination and search by action, user, date, min_created_at, max_created_at)
  - Middleware: authenticate, hasRole('admin'), rateLimitMiddleware

## Next Steps: Implement One by One

We can start with the Auth API (3 routes) as it's foundational. Then proceed to User API (2 routes), Case API (5 routes), etc.
