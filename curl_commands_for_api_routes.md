# cURL Commands for API Routes

## Authentication Routes

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123","otherFields":"value"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123"}'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh-token \
-H "Content-Type: application/json" \
-d '{"refreshToken":"your_refresh_token"}'
```

## User Routes

### Get Current User Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
-H "Authorization: Bearer your_access_token"
```

### Update Current User Profile (Creates profile if it doesn't exist)

```bash
curl -X PUT http://localhost:3000/api/v1/users/me \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"first_name":"John","last_name":"Doe","employee_id":"EMP001","cadre_service":"Police","designation_rank":"Inspector","country":"India","state":"Maharashtra","district":"Mumbai","city":"Mumbai","preferred_language":"en"}'
```

## Case Routes

### Create Case

```bash
curl -X POST http://localhost:3000/api/v1/cases \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"title":"Case Title","description":"Description","status":"open","officer_user_id":"user_id"}'
```

### List Cases

```bash
curl -X GET "http://localhost:3000/api/v1/cases?page=1&limit=10&status=open" \
-H "Authorization: Bearer your_access_token"
```

### Get Case by ID

```bash
curl -X GET http://localhost:3000/api/v1/cases/{caseId} \
-H "Authorization: Bearer your_access_token"
```

### Add Document to Case

```bash
curl -X POST http://localhost:3000/api/v1/cases/{caseId}/documents \
-H "Authorization: Bearer your_access_token" \
-F "file=@/path/to/file.pdf"
```

### Submit Review for Case

```bash
curl -X POST http://localhost:3000/api/v1/cases/{caseId}/review \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"reviewer_id":"user_id","review_text":"Review comments","decision":"approved"}'
```

## Plan Routes

### List Plans

```bash
curl -X GET "http://localhost:3000/api/v1/plans?page=1&limit=10" \
-H "Authorization: Bearer your_access_token"
```

### Create Plan (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/plans \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"name":"Basic Plan","price_monthly":9.99,"features":{}}'
```

### Update Plan (Admin)

```bash
curl -X PUT http://localhost:3000/api/v1/plans/{planId} \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"price_monthly":19.99}'
```

### Delete Plan (Admin)

```bash
curl -X DELETE http://localhost:3000/api/v1/plans/{planId} \
-H "Authorization: Bearer your_access_token"
```

## Subscription Routes

### List Subscriptions

```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions?page=1&limit=10&status=active" \
-H "Authorization: Bearer your_access_token"
```

### Create Subscription (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"user_id":"user_id","plan_id":1,"status":"active"}'
```

### Update Subscription (Admin)

```bash
curl -X PUT http://localhost:3000/api/v1/subscriptions/{subscriptionId} \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"status":"cancelled"}'
```

### Delete Subscription (Admin)

```bash
curl -X DELETE http://localhost:3000/api/v1/subscriptions/{subscriptionId} \
-H "Authorization: Bearer your_access_token"
```

## Admin Routes

### List Users

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&limit=10&role=officer&status=active" \
-H "Authorization: Bearer your_access_token"
```

### Update User Status

```bash
curl -X PUT http://localhost:3000/api/v1/admin/users/{userId}/status \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"account_status":"active"}'
```

### List Cases

```bash
curl -X GET "http://localhost:3000/api/v1/admin/cases?page=1&limit=10&status=intake" \
-H "Authorization: Bearer your_access_token"
```

### List Audit Logs

```bash
curl -X GET "http://localhost:3000/api/v1/admin/audit-logs?page=1&limit=10&action=login" \
-H "Authorization: Bearer your_access_token"
```

## Mail Routes

### Send OTP

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-otp \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","validityDuration":"10 minutes"}'
```

### Send Update Email (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-update \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","userName":"John Doe","updateDetails":"Your account has been updated","actionLink":"https://example.com/action"}'
```

### Send Notification Email (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-notification \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","userName":"John Doe","notificationSubject":"Important Notification","notificationBody":"This is a notification","actionLink":"https://example.com/action","actionText":"Click Here"}'
```

### Send Welcome Email (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-welcome \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","userName":"John Doe","actionLink":"https://example.com/login"}'
```

### Send Password Reset Email

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-password-reset \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","userName":"John Doe","resetLink":"https://example.com/reset","validityDuration":"1 hour"}'
```

### Verify OTP

```bash
curl -X POST http://localhost:3000/api/v1/mail/verify-otp \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","otpCode":"123456","is_verified":true}'
```

### Send Invoice Email (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-invoice \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","invoiceNumber":"INV-001","amountDue":"100.00","dueDate":"2023-12-31","downloadLink":"https://example.com/invoice.pdf"}'
```

### Send Custom Email (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/mail/send-custom \
-H "Authorization: Bearer your_access_token" \
-H "Content-Type: application/json" \
-d '{"to":"user@example.com","subject":"Custom Subject","body":"Custom email body"}'
```

# Notes

- Replace `{caseId}`, `{planId}`, `{subscriptionId}`, `{userId}` with actual IDs.
- Replace `your_access_token` with a valid JWT token.
- Adjust URLs and ports as per your server configuration.
- For file uploads, use `-F` with the file path.
