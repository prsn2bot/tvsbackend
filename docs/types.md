# TypeScript Types Documentation

## Common Types (src/types/common.types.ts)

- **PaginatedResponse<T>**: Generic structure for paginated API responses.

  - `data: T[]` - Array of data items.
  - `pagination` - Pagination metadata including `total`, `limit`, and `offset`.

- **ApiResponse<T>**: Generic structure for single-item API responses.
  - `data: T` - Single data item.

## Authentication Types (src/types/auth.types.ts)

- **JwtPayload**: Data encoded within the JWT access token.

  - `userId: string` - User's unique identifier.
  - `role: UserRole` - User's role (officer, cvo, legal_board, admin).
  - `email: string` - User's email address.
  - `is_verified: boolean` - Indicates if the user's account is verified.

- **TokenResponse**: JSON response sent to client upon successful login.
  - `accessToken: string` - JWT access token.
  - `refreshToken: string` - JWT refresh token.

## User Types (src/types/user.types.ts)

- **UserRole**: Enum of user roles.

  - `'officer' | 'cvo' | 'legal_board' | 'admin'`

- **AccountStatus**: Enum of account statuses.

  - `'pending_verification' | 'active' | 'inactive' | 'suspended'`

- **User**: Represents the `users` table for authentication.

  - `id: string` - UUID.
  - `email: string`
  - `password_hash: string`
  - `role: UserRole`
  - `account_status: AccountStatus`
  - `mfa_enabled: boolean`
  - `mfa_secret?: string`
  - `created_at: Date`
  - `updated_at: Date`

- **UserProfile**: Represents the `user_profiles` table.

  - `user_id: string` - UUID.
  - `first_name: string`
  - `last_name: string`
  - Optional fields: `employee_id`, `cadre_service`, `designation_rank`, `profile_photo_url`, `head_office_address`, `branch_office_address`, `country`, `state`, `district`, `city`.
  - `preferred_language: string`
  - `updated_at: Date`

- **UserWithProfile**: Combined type of User and UserProfile.

## Case Types (src/types/case.types.ts)

- **CaseStatus**: Enum of case statuses.

  - `'intake' | 'ai_analysis' | 'awaiting_officer_review' | 'awaiting_cvo_review' | 'awaiting_legal_review' | 'finalized' | 'archived'`

- **ReviewType**: Enum of review types.

  - `'cvo' | 'legal_board'`

- **Case**: Represents the `cases` table.

  - `id: string` - UUID.
  - `officer_user_id: string` - UUID.
  - `case_title: string`
  - `status: CaseStatus`
  - `assigned_cvo_id?: string` - UUID.
  - `assigned_legal_board_id?: string` - UUID.
  - `created_at: Date`
  - `updated_at: Date`

- **Document**: Represents the `documents` table (using Cloudinary).

  - `id: string` - UUID.
  - `case_id: string` - UUID.
  - `original_filename: string`
  - `cloudinary_public_id: string`
  - `secure_url: string`
  - `file_type?: string`
  - `file_size_bytes?: number`
  - `ocr_text?: string`
  - `vector_embedding?: number[]`
  - `uploaded_at: Date`

- **AiDraft**: Represents the `ai_drafts` table.

  - `id: string` - UUID.
  - `case_id: string` - UUID.
  - `version: number`
  - `content: string`
  - `defence_score?: number`
  - `confidence_score?: number`
  - `created_at: Date`

- **Review**: Represents the `reviews` table.
  - `id: string` - UUID.
  - `case_id: string` - UUID.
  - `reviewer_id: string` - UUID.
  - `review_type: ReviewType`
  - `comments?: string`
  - `status: string` - e.g., 'approved', 'escalated_to_legal'
  - `created_at: Date`

## Plan Types (src/types/plan.types.ts)

- **PlanFeatures**: Structure of the `features` object within a Plan.

  - `max_cases: number | null` - null for unlimited.
  - `cvo_review_enabled: boolean`
  - `legal_board_audit_enabled: boolean`
  - `[key: string]: any` - Additional features.

- **Plan**: Represents a subscription plan record from the `plans` table.
  - `id: number`
  - `name: string`
  - `price_monthly: number`
  - `features: PlanFeatures`

## Subscription Types (src/types/subscription.types.ts)

- **Subscription**: Represents the `subscriptions` table.

  - `id: string` - UUID.
  - `user_id: string` - UUID.
  - `plan_id: number`
  - `payment_provider_subscription_id?: string`
  - `status: string` - e.g., 'active', 'canceled', 'past_due'
  - `start_date: Date`
  - `end_date?: Date`
  - `created_at: Date`

- **SubscriptionWithPlan**: Combined type for subscription with plan details.
  - Extends `Subscription` with `plan: Plan`

## Audit Types (src/types/audit.types.ts)

- **AuditLog**: Represents the `audit_logs` table.
  - `id: string` - BigInt as string.
  - `user_id?: string` - UUID.
  - `action: string`
  - `details?: Record<string, any>` - JSONB.
  - `previous_hash?: string`
  - `current_hash: string`
  - `created_at: Date`
