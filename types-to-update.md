# List of Files and Locations Where ID Types Need to be Changed from string to number

## Services

- src/services/user.service.ts
  - getUserProfile(userId: string)
  - updateUserProfile(userId: string, ...)
  - updateUserStatus(userId: string, ...)
  - updateUserRole(userId: string, ...)
  - getSubscriptionByUserId(userId: string)
- src/services/subscription.service.ts
  - getSubscriptionByUserId(userId: string)
  - updateSubscription(id: string, ...)
  - deleteSubscription(id: string)
- src/services/case.service.ts
  - getCaseById(caseId: string, userId: number)
  - addDocument(caseId: string, ...)
  - submitReview(caseId: string, ...)
  - findUserWithProfile(reviewerId: string, ...)

## Models

- src/models/user.model.ts
  - findUserWithProfile(userId: string)
  - updateProfile(userId: string, ...)
  - updateUserStatus(userId: string, ...)
  - updateUserRole(userId: string, ...)
- src/models/subscription.model.ts
  - findByUserId(userId: string)
  - update(id: string, ...)
  - delete(id: string)
- src/models/aiDraft.model.ts
  - findByCaseId(caseId: string)
  - findLatestByCaseId(caseId: string)

## Controllers

- src/controllers/v1/razorWebhook.controller.ts
  - userId: string
  - planId: number
- src/controllers/v1/razorPayment.controller.ts
  - planId: number
  - userId: string

## Jobs

- src/jobs/queue.ts
  - documentId: string

## Other

- src/config/swagger.schemas.ts
  - id: string (e.g., job_12345)
- src/config/swagger.config.ts
  - planId: string (e.g., premium_monthly)

---

Please confirm if you want me to proceed with updating these files to use number types for IDs instead of string.
