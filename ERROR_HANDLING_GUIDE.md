# Error Handling Guide

## Problem Fixed

Your API was returning 500 Internal Server Errors for validation and authentication issues because services were throwing generic `Error` objects instead of `AppError` objects with proper HTTP status codes.

## Solution Applied

### 1. Updated Auth Service

- Replaced `throw new Error()` with `ErrorHelpers` methods
- Now returns proper HTTP status codes:
  - 400 for validation errors (missing fields, invalid role)
  - 401 for authentication errors (invalid credentials, expired tokens)
  - 409 for conflicts (user already exists)

### 2. Enhanced Error Handler Middleware

- Added fallback patterns to catch common error messages
- Automatically maps error messages to appropriate status codes

### 3. Created ErrorHelpers Utility

- Provides consistent error creation across all services
- Available methods:
  - `ErrorHelpers.invalidCredentials()` - 401
  - `ErrorHelpers.badRequest(message)` - 400
  - `ErrorHelpers.userNotFound()` - 404
  - `ErrorHelpers.userAlreadyExists()` - 409
  - `ErrorHelpers.forbidden()` - 403
  - And many more...

## How to Apply to Other Services

### Step 1: Import ErrorHelpers

```typescript
import { ErrorHelpers } from "../utils/errorHelpers";
```

### Step 2: Replace Generic Errors

**Before:**

```typescript
if (!user) throw new Error("User not found");
if (!email) throw new Error("Email is required");
if (existingUser) throw new Error("User already exists");
```

**After:**

```typescript
if (!user) throw ErrorHelpers.userNotFound();
if (!email) throw ErrorHelpers.badRequest("Email is required");
if (existingUser) throw ErrorHelpers.userAlreadyExists();
```

### Step 3: Add Validation

Always validate inputs and check if resources exist before operations:

```typescript
static async updateUser(userId: number, data: any) {
  if (!userId) throw ErrorHelpers.badRequest("User ID is required");

  const user = await UserModel.findById(userId);
  if (!user) throw ErrorHelpers.userNotFound();

  // Continue with update...
}
```

## Common Error Patterns

### Authentication (401)

- Invalid credentials
- Expired tokens
- Missing authentication

### Validation (400)

- Missing required fields
- Invalid input format
- Invalid enum values

### Not Found (404)

- Resource doesn't exist
- User not found

### Conflict (409)

- Resource already exists
- Duplicate entries

### Forbidden (403)

- Insufficient permissions
- Access denied

## Testing Your Changes

1. Try logging in with invalid credentials - should get 401, not 500
2. Try registering with existing email - should get 409, not 500
3. Try accessing protected routes without token - should get 401, not 500
4. Try invalid input validation - should get 400, not 500

## Services Fixed

✅ **Auth Service** - Proper error handling with status codes
✅ **User Service** - Input validation and proper errors  
✅ **Case Service** - All error cases now use ErrorHelpers
✅ **Plan Service** - Added validation and proper error handling
✅ **Subscription Service** - Added validation and error handling
✅ **AI Service** - Better error messages for service issues
✅ **Audit Service** - Basic structure (minimal errors needed)

## Controllers Fixed

✅ **Auth Controller** - Already using asyncHandler
✅ **User Controller** - Already using asyncHandler  
✅ **Case Controller** - Already using asyncHandler
✅ **Admin Controller** - Already using asyncHandler
✅ **Subscription Controller** - Converted from try-catch to asyncHandler
✅ **Audit Controller** - Converted from try-catch to asyncHandler

## Key Changes Made

### Services

- Replaced all `throw new Error()` with `ErrorHelpers` methods
- Added input validation (checking for required fields)
- Added existence checks before operations
- Added proper status code mapping

### Controllers

- Converted manual try-catch blocks to `asyncHandler`
- Standardized response format with success/message/data
- Removed manual error handling (let middleware handle it)

## Error Status Codes Now Working

- **400 Bad Request** - Missing fields, invalid input, validation errors
- **401 Unauthorized** - Invalid credentials, expired tokens
- **403 Forbidden** - Access denied, insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists, duplicates
- **500 Internal Server Error** - Actual server errors only
- **503 Service Unavailable** - AI service issues, external service problems

## All Done!

Your API now returns proper HTTP status codes instead of 500 errors for validation and business logic issues.
