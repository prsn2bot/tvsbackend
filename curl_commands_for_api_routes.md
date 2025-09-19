# Complete API Documentation with cURL Commands

## Base Configuration

```bash
BASE_URL="http://localhost:3000/api/v1"
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 Authentication Routes

### Register New User

```bash
curl -X POST "${BASE_URL}/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "officer@example.com",
  "password": "SecurePass123!",
  "role": "officer"
}'
```

**Password Requirements:**

- Minimum 8 characters, maximum 128 characters
- Must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%\*?&)

**Available Roles:** `officer` (default), `cvo`, `legal_board`, `admin`, `owner`

### Login User

```bash
curl -X POST "${BASE_URL}/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "officer@example.com",
  "password": "SecurePass123!"
}'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "officer@example.com",
      "role": "officer",
      "account_status": "active"
    }
  }
}
```

### Refresh Access Token

```bash
curl -X POST "${BASE_URL}/auth/refresh-token" \
-H "Content-Type: application/json" \
-d '{
  "refreshToken": "'${REFRESH_TOKEN}'"
}'
```

---

## 👤 User Profile Routes

### Get Current User Profile

```bash
curl -X GET "${BASE_URL}/users/me" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Update User Profile

```bash
curl -X PUT "${BASE_URL}/users/me" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "first_name": "John",
  "last_name": "Doe",
  "employee_id": "EMP001",
  "cadre_service": "Police",
  "designation_rank": "Inspector",
  "profile_photo_url": "https://example.com/photo.jpg",
  "head_office_address": "123 Main St, City",
  "branch_office_address": "456 Branch St, City",
  "country": "India",
  "state": "Maharashtra",
  "district": "Mumbai",
  "city": "Mumbai",
  "preferred_language": "en"
}'
```

---

## 📋 Case Management Routes

### Create New Case

```bash
curl -X POST "${BASE_URL}/cases" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "title": "Corruption Investigation Case",
  "description": "Investigation into alleged corruption in department",
  "status": "intake"
}'
```

**Available Statuses:** `intake`, `ai_analysis`, `awaiting_officer_review`, `awaiting_cvo_review`, `awaiting_legal_review`, `finalized`, `archived`

### List Cases with Filters and Search

```bash
# Basic listing
curl -X GET "${BASE_URL}/cases?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Search by case title
curl -X GET "${BASE_URL}/cases?q=corruption&page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# With status filter
curl -X GET "${BASE_URL}/cases?page=1&limit=10&status=intake" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# With date filter
curl -X GET "${BASE_URL}/cases?page=1&limit=10&min_created_at=2024-01-01T00:00:00Z" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Combined filters with search
curl -X GET "${BASE_URL}/cases?q=investigation&status=awaiting_officer_review&min_created_at=2024-01-01T00:00:00Z&page=1&limit=20" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Specific Case

```bash
curl -X GET "${BASE_URL}/cases/123" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Add Document to Case

```bash
curl -X POST "${BASE_URL}/cases/123/documents" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "cloudinary_public_id": "documents/case_123_doc_1",
  "secure_url": "https://res.cloudinary.com/your-cloud/document.pdf",
  "ocr_text": "Extracted text from document...",
  "ocr_method_used": "tesseract",
  "ocr_confidence": 0.95,
  "ocr_processing_time": 2.5,
  "ocr_retry_count": 0
}'
```

### Submit Case Review

```bash
# CVO Review
curl -X POST "${BASE_URL}/cases/123/review" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "review_text": "Case reviewed and approved for legal board review",
  "decision": "approved"
}'

# Legal Board Review
curl -X POST "${BASE_URL}/cases/123/review" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "review_text": "Legal review completed with recommendations",
  "decision": "escalated_to_legal"
}'
```

**Available Decisions:** `pending`, `approved`, `rejected`, `escalated_to_legal`

---

## 💳 Plan Management Routes

### List All Plans (Public)

```bash
# Basic listing
curl -X GET "${BASE_URL}/plans?page=1&limit=10"

# Search by plan name
curl -X GET "${BASE_URL}/plans?q=professional&page=1&limit=10"
```

### Get Specific Plan (Public)

```bash
curl -X GET "${BASE_URL}/plans/1"
```

### Create Plan (Admin Only)

```bash
curl -X POST "${BASE_URL}/plans" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "Professional Plan",
  "price_monthly": 2999.99,
  "features": {
    "max_cases": 50,
    "cvo_review_enabled": true,
    "legal_board_audit_enabled": true,
    "ai_analysis_enabled": true,
    "priority_support": true
  }
}'
```

### Update Plan (Admin Only)

```bash
curl -X PUT "${BASE_URL}/plans/1" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "price_monthly": 3499.99,
  "features": {
    "max_cases": 100,
    "cvo_review_enabled": true,
    "legal_board_audit_enabled": true,
    "ai_analysis_enabled": true,
    "priority_support": true,
    "advanced_analytics": true
  }
}'
```

### Delete Plan (Admin Only)

```bash
curl -X DELETE "${BASE_URL}/plans/1" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 📊 Subscription Management Routes

### Get User's Active Subscription

```bash
curl -X GET "${BASE_URL}/subscriptions" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Subscription (Admin Only)

```bash
curl -X POST "${BASE_URL}/subscriptions" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "user_id": 123,
  "plan_id": 1,
  "payment_provider_subscription_id": "sub_razorpay_123",
  "status": "active",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z"
}'
```

### Update Subscription (Admin Only)

```bash
curl -X PUT "${BASE_URL}/subscriptions/456" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "status": "cancelled",
  "end_date": "2024-06-30T23:59:59Z"
}'
```

### Cancel Subscription (Admin Only)

```bash
curl -X DELETE "${BASE_URL}/subscriptions/456" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 💰 Razorpay Payment Routes

### Create Razorpay Order

```bash
curl -X POST "${BASE_URL}/razorpay/create-order" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "planId": 1,
  "userId": "123"
}'
```

**Response:**

```json
{
  "id": "order_razorpay_123",
  "amount": 299999,
  "currency": "INR",
  "receipt": "receipt_order_1640995200000",
  "notes": {
    "planId": "1",
    "userId": "123",
    "originalPriceINR": "2999.99"
  }
}
```

### Verify Payment

```bash
curl -X POST "${BASE_URL}/razorpay/verify-payment" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "razorpay_order_id": "order_razorpay_123",
  "razorpay_payment_id": "pay_razorpay_456",
  "razorpay_signature": "signature_hash_here"
}'
```

### Razorpay Webhook (Called by Razorpay)

```bash
curl -X POST "${BASE_URL}/razorpay-webhook" \
-H "Content-Type: application/json" \
-H "X-Razorpay-Signature: webhook_signature_here" \
-d '{
  "event": "order.paid",
  "payload": {
    "order": {
      "entity": {
        "id": "order_razorpay_123",
        "notes": {
          "userId": "123",
          "planId": "1"
        }
      }
    },
    "payment": {
      "entity": {
        "id": "pay_razorpay_456"
      }
    }
  }
}'
```

---

## 📧 Email/Mail Routes

### Send OTP Email

```bash
curl -X POST "${BASE_URL}/mail/send-otp" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "validityDuration": "10 minutes"
}'
```

**Valid Duration Formats:** `"10 minutes"`, `"30 seconds"`, `"5 minutes"`

### Verify OTP

```bash
curl -X POST "${BASE_URL}/mail/verify-otp" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "otpCode": "123456",
  "is_verified": false,
  "forgot_password": false
}'
```

**OTP Requirements:**

- Must be exactly 6 digits
- Only numeric characters allowed

### Send Welcome Email (Admin Only)

```bash
curl -X POST "${BASE_URL}/mail/send-welcome" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "to": "newuser@example.com",
  "userName": "John Doe",
  "actionLink": "https://yourapp.com/login"
}'
```

### Send Update Notification (Admin Only)

```bash
curl -X POST "${BASE_URL}/mail/send-update" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "userName": "John Doe",
  "updateDetails": "Your account has been upgraded to Professional plan",
  "actionLink": "https://yourapp.com/dashboard"
}'
```

### Send Custom Notification (Admin Only)

```bash
curl -X POST "${BASE_URL}/mail/send-notification" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "userName": "John Doe",
  "notificationSubject": "Case Review Completed",
  "notificationBody": "Your case #123 has been reviewed and approved by the CVO.",
  "actionLink": "https://yourapp.com/cases/123",
  "actionText": "View Case"
}'
```

### Send Password Reset Email

```bash
curl -X POST "${BASE_URL}/mail/send-password-reset" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "userName": "John Doe",
  "resetLink": "https://yourapp.com/reset-password?token=abc123",
  "validityDuration": "1 hour"
}'
```

### Send Invoice Email (Admin Only)

```bash
curl -X POST "${BASE_URL}/mail/send-invoice" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "invoiceNumber": "INV-2024-001",
  "amountDue": "2999.99",
  "dueDate": "2024-02-15",
  "downloadLink": "https://yourapp.com/invoices/INV-2024-001.pdf"
}'
```

### Send Custom Email (Admin Only)

```bash
curl -X POST "${BASE_URL}/mail/send-custom" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "to": "user@example.com",
  "subject": "Important System Maintenance Notice",
  "body": "We will be performing system maintenance on Sunday from 2 AM to 6 AM IST. Please plan accordingly."
}'
```

---

## 🛡️ Admin Management Routes

### List All Users

```bash
# Basic listing
curl -X GET "${BASE_URL}/admin/users?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by role
curl -X GET "${BASE_URL}/admin/users?role=officer&page=1&limit=20" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by account status
curl -X GET "${BASE_URL}/admin/users?account_status=active&page=1&limit=50" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by date range
curl -X GET "${BASE_URL}/admin/users?min_created_at=2024-01-01T00:00:00Z&max_created_at=2024-12-31T23:59:59Z&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Search by email or name
curl -X GET "${BASE_URL}/admin/users?q=john&page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Combined filters
curl -X GET "${BASE_URL}/admin/users?role=cvo&account_status=active&min_created_at=2024-01-01T00:00:00Z&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Update User Status

```bash
curl -X PUT "${BASE_URL}/admin/users/123/status" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "account_status": "active"
}'
```

**Available Statuses:** `pending_verification`, `active`, `inactive`, `suspended`

### Update User Role (Owner Only)

```bash
curl -X PUT "${BASE_URL}/admin/users/123/role" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "role": "cvo"
}'
```

### List All Cases (Admin View)

```bash
# Basic listing
curl -X GET "${BASE_URL}/admin/cases?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by status
curl -X GET "${BASE_URL}/admin/cases?status=awaiting_cvo_review&page=1&limit=20" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by date range
curl -X GET "${BASE_URL}/admin/cases?min_created_at=2024-01-01T00:00:00Z&max_created_at=2024-12-31T23:59:59Z&page=1&limit=50" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by user
curl -X GET "${BASE_URL}/admin/cases?user_id=123&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Search by case title
curl -X GET "${BASE_URL}/admin/cases?q=corruption&page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Combined filters
curl -X GET "${BASE_URL}/admin/cases?q=investigation&status=finalized&min_created_at=2024-01-01T00:00:00Z&user_id=123&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### List All Subscriptions (Admin)

```bash
# Basic listing
curl -X GET "${BASE_URL}/admin/subscriptions?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by status
curl -X GET "${BASE_URL}/admin/subscriptions?status=active&page=1&limit=20" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by price range
curl -X GET "${BASE_URL}/admin/subscriptions?min_price=1000&max_price=5000&page=1&limit=30" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Combined filters
curl -X GET "${BASE_URL}/admin/subscriptions?status=active&min_price=2000&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Subscription (Admin)

```bash
curl -X POST "${BASE_URL}/admin/subscriptions" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "user_id": 123,
  "plan_id": 1,
  "payment_provider_subscription_id": "sub_razorpay_789",
  "status": "active",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z"
}'
```

### Update Subscription (Admin)

```bash
curl -X PUT "${BASE_URL}/admin/subscriptions/456" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "status": "cancelled",
  "end_date": "2024-06-30T23:59:59Z"
}'
```

### Delete Subscription (Admin)

```bash
curl -X DELETE "${BASE_URL}/admin/subscriptions/456" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### List All Plans (Admin)

```bash
curl -X GET "${BASE_URL}/admin/plans?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Update Plan (Admin)

```bash
curl -X PUT "${BASE_URL}/admin/plans/1" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Professional Plan",
  "price_monthly": 3999.99,
  "features": {
    "max_cases": 100,
    "cvo_review_enabled": true,
    "legal_board_audit_enabled": true,
    "ai_analysis_enabled": true,
    "priority_support": true,
    "advanced_analytics": true,
    "custom_reports": true
  }
}'
```

### Delete Plan (Admin)

```bash
curl -X DELETE "${BASE_URL}/admin/plans/1" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### List Audit Logs

```bash
# Basic listing
curl -X GET "${BASE_URL}/admin/audit-logs?page=1&limit=10" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by user
curl -X GET "${BASE_URL}/admin/audit-logs?user_id=123&page=1&limit=20" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by date range
curl -X GET "${BASE_URL}/admin/audit-logs?min_created_at=2024-01-01T00:00:00Z&max_created_at=2024-01-31T23:59:59Z&page=1&limit=50" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"

# Combined filters
curl -X GET "${BASE_URL}/admin/audit-logs?user_id=123&min_created_at=2024-01-01T00:00:00Z&max_created_at=2024-01-31T23:59:59Z&page=1&limit=25" \
-H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 📋 Common Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `offset`: Number of items to skip (alternative to page)

### Date Filters

- `min_created_at`: Filter records created after this date (ISO 8601 format)
- `max_created_at`: Filter records created before this date (ISO 8601 format)

### Status Filters

- **Case Status**: `intake`, `ai_analysis`, `awaiting_officer_review`, `awaiting_cvo_review`, `awaiting_legal_review`, `finalized`, `archived`
- **Account Status**: `pending_verification`, `active`, `inactive`, `suspended`
- **Subscription Status**: `active`, `cancelled`, `past_due`, `trialing`
- **User Roles**: `officer`, `cvo`, `legal_board`, `admin`, `owner`

### Price Filters (Subscriptions)

- `min_price`: Minimum price filter
- `max_price`: Maximum price filter

### Search Parameters

- `q`: Search query for text-based fields (case titles, user emails/names, plan names, etc.)

---

## 🔧 Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

---

## 🚨 Error Responses

### Common Error Formats

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

---

## 📋 Notes

1. **Authentication**: Most endpoints require a valid JWT token in the Authorization header
2. **Rate Limiting**: All endpoints have rate limiting applied
3. **Subscription Features**: Some endpoints require active subscription
4. **Role-based Access**: Different endpoints require different user roles
5. **ID Format**: All IDs are now integers (changed from UUIDs)
6. **Date Format**: Use ISO 8601 format for all dates (YYYY-MM-DDTHH:mm:ssZ)
7. **File Uploads**: Use multipart/form-data for file uploads to document endpoints
8. **Webhook Security**: Razorpay webhooks include signature verification

---

## 🔄 Typical Workflow

1. **User Registration & Verification**

   ```bash
   POST /auth/register → POST /mail/send-otp → POST /mail/verify-otp
   ```

2. **Login & Profile Setup**

   ```bash
   POST /auth/login → GET /users/me → PUT /users/me
   ```

3. **Case Management Flow**

   ```bash
   POST /cases → POST /cases/{id}/documents → POST /cases/{id}/review
   ```

4. **Payment Flow**

   ```bash
   GET /plans → POST /razorpay/create-order → POST /razorpay/verify-payment
   ```

5. **Admin Management**
   ```bash
   GET /admin/users → PUT /admin/users/{id}/status → GET /admin/audit-logs
   ```
