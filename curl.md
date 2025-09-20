# API curl Commands - Complete Reference

This document provides comprehensive curl examples for all API endpoints in the Government Officers Defence application.

## Base URL

```
http://localhost:3000
```

## Authentication

Replace `YOUR_JWT_TOKEN_HERE` with actual JWT tokens obtained from login.

---

## 🔐 Authentication Routes

### Register New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@example.com",
    "password": "SecurePass123!",
    "role": "officer"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@example.com",
    "password": "SecurePass123!"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

---

## 👤 User Routes

### Get My Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Update My Profile

```bash
curl -X PUT http://localhost:3000/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Name",
    "phone": "+1234567890"
  }'
```

---

## 📋 Cases Routes

### Create New Case

```bash
curl -X POST http://localhost:3000/api/v1/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Corruption Investigation Case #2024-001",
    "description": "Investigation into alleged corruption in government procurement process",
    "status": "intake"
  }'
```

### Get My Cases

```bash
# Get all cases (default pagination)
curl -X GET "http://localhost:3000/api/v1/cases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Get cases with filters
curl -X GET "http://localhost:3000/api/v1/cases?page=1&limit=5&status=awaiting_officer_review" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Get Specific Case

```bash
curl -X GET "http://localhost:3000/api/v1/cases/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Add Document to Case

```bash
curl -X POST "http://localhost:3000/api/v1/cases/123/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "cloudinary_public_id": "case_123_document_abc123xyz",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v123456/case_123_document_abc123xyz.pdf",
    "ocr_text": "This is the extracted text from the document..."
  }'
```

### Submit Review

```bash
curl -X POST "http://localhost:3000/api/v1/cases/123/review" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "review_text": "After thorough review, I find the evidence compelling",
    "decision": "approved"
  }'
```

### Get Case Documents for Review

```bash
curl -X GET "http://localhost:3000/api/v1/cases/123/documents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Assign Case to CVO (Admin Only)

```bash
curl -X POST "http://localhost:3000/api/v1/cases/123/assign-cvo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "cvo_id": 456
  }'
```

### Assign Case to Legal Board (Admin Only)

```bash
curl -X POST "http://localhost:3000/api/v1/cases/123/assign-legal-board" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "legal_board_id": 789
  }'
```

### Get Assigned Cases (CVO/Legal Board Only)

```bash
curl -X GET "http://localhost:3000/api/v1/cases/assigned" \
  -H "Authorization: Bearer YOUR_CVO_OR_LEGAL_BOARD_JWT_TOKEN_HERE"
```

### Update Case Status

```bash
curl -X PUT "http://localhost:3000/api/v1/cases/123/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "status": "awaiting_cvo_review"
  }'
```

---

## 📦 Plans Routes

### List Available Plans

```bash
curl -X GET "http://localhost:3000/api/v1/plans" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Get Specific Plan

```bash
curl -X GET "http://localhost:3000/api/v1/plans/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create New Plan (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "name": "Premium Plan",
    "description": "Advanced features for large organizations",
    "price": 99.99,
    "features": ["unlimited_cases", "priority_support", "advanced_analytics"]
  }'
```

### Update Plan (Admin Only)

```bash
curl -X PUT "http://localhost:3000/api/v1/plans/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Premium Plan",
    "price": 129.99
  }'
```

### Delete Plan (Admin Only)

```bash
curl -X DELETE "http://localhost:3000/api/v1/plans/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

---

## 💳 Subscriptions Routes

### Get My Subscription

```bash
curl -X GET http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create Subscription (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "user_id": 123,
    "plan_id": 1,
    "status": "active"
  }'
```

### Update Subscription (Admin Only)

```bash
curl -X PUT "http://localhost:3000/api/v1/subscriptions/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "status": "cancelled"
  }'
```

### Cancel Subscription (Admin Only)

```bash
curl -X DELETE "http://localhost:3000/api/v1/subscriptions/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

---

## 🛡️ Admin Routes

### List All Users

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### Update User Status

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/users/123/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "status": "suspended"
  }'
```

### Update User Role (Owner Only)

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/users/123/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OWNER_JWT_TOKEN_HERE" \
  -d '{
    "role": "admin"
  }'
```

### List All Cases

```bash
curl -X GET "http://localhost:3000/api/v1/admin/cases" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### List All Subscriptions

```bash
curl -X GET "http://localhost:3000/api/v1/admin/subscriptions" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### Create Subscription (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/admin/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "user_id": 123,
    "plan_id": 1,
    "status": "active"
  }'
```

### Update Subscription (Admin)

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/subscriptions/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "status": "cancelled"
  }'
```

### Delete Subscription (Admin)

```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/subscriptions/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### List All Plans

```bash
curl -X GET "http://localhost:3000/api/v1/admin/plans" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### Update Plan (Admin)

```bash
curl -X PUT "http://localhost:3000/api/v1/admin/plans/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "name": "Updated Plan Name",
    "price": 149.99
  }'
```

### Delete Plan (Admin)

```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/plans/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

### Get Audit Logs

```bash
curl -X GET "http://localhost:3000/api/v1/admin/audit-logs" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
```

---

## 📧 Mail Routes

### Send OTP

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Send Update Email (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "email": "user@example.com",
    "subject": "System Update",
    "message": "The system has been updated with new features"
  }'
```

### Send Notification Email (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "email": "user@example.com",
    "subject": "Important Notification",
    "message": "Your case status has been updated"
  }'
```

### Send Welcome Email (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "email": "newuser@example.com",
    "name": "John Doe"
  }'
```

### Send Password Reset Email

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Verify OTP

```bash
curl -X POST http://localhost:3000/api/v1/mail/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

### Send Invoice Email (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "email": "customer@example.com",
    "invoice_number": "INV-2024-001",
    "amount": 99.99
  }'
```

### Send Custom Email (Admin Only)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Custom Message",
    "message": "This is a custom email message"
  }'
```

---

## 💰 Razorpay Payment Routes

### Create Payment Order

```bash
curl -X POST http://localhost:3000/api/v1/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "amount": 10000,
    "currency": "INR",
    "receipt": "receipt_123"
  }'
```

### Verify Payment

```bash
curl -X POST http://localhost:3000/api/v1/razorpay/verify-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "razorpay_payment_id": "pay_1234567890",
    "razorpay_order_id": "order_1234567890",
    "razorpay_signature": "signature_hash"
  }'
```

---

## 🪝 Razorpay Webhook Route

### Webhook Handler (Server to Server)

```bash
curl -X POST http://localhost:3000/api/v1/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: your_webhook_signature" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_1234567890",
          "amount": 10000,
          "currency": "INR"
        }
      }
    }
  }'
```

---

## 🔧 Utility Routes

### Health Check

```bash
curl -X GET http://localhost:3000/health
```

---

## 📝 Notes

### Authentication Tokens

- Replace `YOUR_JWT_TOKEN_HERE` with actual JWT tokens
- Use different tokens based on user roles:
  - **Officer/Admin**: Can create cases and add documents
  - **CVO**: Can submit reviews and access assigned cases
  - **Legal Board**: Can submit reviews and access assigned cases
  - **Owner**: Full administrative access

### Status Values

- **Cases**: `intake`, `ai_analysis`, `awaiting_officer_review`, `awaiting_cvo_review`, `awaiting_legal_review`, `finalized`, `archived`
- **Subscriptions**: `active`, `cancelled`, `expired`, `pending`
- **Users**: `active`, `suspended`, `inactive`

### Review Decisions

- `pending`, `approved`, `rejected`, `escalated_to_legal`

### Environment Variables

Make sure to update:

- `localhost:3000` with your actual server URL
- IDs (123, 456, 789) with actual database IDs
- Email addresses with real email addresses
- Cloudinary URLs with your actual Cloudinary configuration

### Rate Limiting

All endpoints are rate-limited. If you hit the limit, wait before retrying.

### Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
