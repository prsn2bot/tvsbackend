"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("../config/env");
const swagger_schemas_1 = require("./swagger.schemas");
const swaggerServers = [
    {
        url: `http://localhost:${env_1.env.PORT}/api/v1`,
        description: "Development server",
    },
];
if (env_1.env.NODE_ENV === "production" && env_1.env.BASE_URL) {
    swaggerServers.push({
        url: `${env_1.env.BASE_URL}/api/v1`,
        description: "Production server",
    });
}
else if (env_1.env.NODE_ENV === "production" && !env_1.env.BASE_URL) {
    console.warn("WARNING: NODE_ENV is production, but BASE_URL is not set. Swagger documentation might point to an incorrect URL.");
}
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SEO App API Documentation",
            version: "1.0.0",
            description: `
# 🚀 SEO Application API

A comprehensive API for managing SEO operations, content generation, and analytics.

## Features
- **User Management**: Complete user authentication and authorization
- **Content Generation**: AI-powered content creation for multiple platforms
- **SEO Analytics**: Track and analyze SEO performance
- **Team Collaboration**: Multi-user workspace management
- **API Integration**: Seamless third-party integrations

## Getting Started
1. Obtain your API key from the dashboard
2. Include the Authorization header in your requests
3. Explore the endpoints below to get started

## Support
For technical support, please contact our development team.
      `,
            contact: {
                name: "SEO App Development Team",
                url: "https://your-seo-app.com",
                email: "support@your-seo-app.com",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
            termsOfService: "https://your-seo-app.com/terms",
        },
        tags: [
            {
                name: "Authentication",
                description: "🔐 User authentication and authorization endpoints",
                externalDocs: {
                    description: "Learn more about authentication",
                    url: "https://your-seo-app.com/docs/auth",
                },
            },
            {
                name: "Users",
                description: "👥 User management and profile operations",
            },
            {
                name: "Companies",
                description: "🏢 Company management and organization settings",
            },
            {
                name: "Teams",
                description: "👨‍👩‍👧‍👦 Team collaboration and member management",
            },
            {
                name: "Subscription Packages",
                description: "💳 Manage subscription plans and billing",
            },
            {
                name: "Coupons",
                description: "🎫 Discount coupons and promotional codes (admin only)",
            },
            {
                name: "Websites",
                description: "🌐 Website management and SEO tracking",
            },
            {
                name: "API Keys",
                description: "🔑 API key generation and management",
            },
            {
                name: "Contents",
                description: "📝 Content creation and management",
            },
            {
                name: "Content Posts",
                description: "📤 Content publishing and scheduling",
            },
            {
                name: "Keywords",
                description: "🎯 SEO keyword research and tracking",
            },
            {
                name: "Campaigns",
                description: "📊 Marketing campaign management and analytics",
            },
            {
                name: "Dashboard",
                description: "📈 Analytics dashboard and reporting",
            },
            {
                name: "Mail",
                description: "📧 Email services and notifications",
            },
            {
                name: "Tickets",
                description: "🎫 Support ticket management",
            },
            {
                name: "Usage",
                description: "📊 Usage analytics and resource monitoring",
            },
            {
                name: "Webhooks",
                description: "🔗 Webhook management and event handling",
            },
            {
                name: "Queue Management",
                description: "⚡ Background job and queue management",
            },
            {
                name: "Payments",
                description: "API for handling Stripe payments",
            },
            {
                name: "Webhooks",
                description: "API for handling Stripe webhooks",
            },
            {
                name: "Mails",
                description: "Manage emails",
            },
            {
                name: "Tickets",
                description: "Manage tickets",
            },
            {
                name: "AI",
                description: "AI related operations",
            },
            {
                name: "Usage",
                description: "Usage tracking and analytics operations",
            },
            {
                name: "Inquiries",
                description: "API for managing customer inquiries",
            },
            {
                name: "Campaigns",
                description: "Campaign management operations",
            },
            {
                name: "Dashboard",
                description: "Dashboard and analytics operations",
            },
            {
                name: "LinkedIn",
                description: "LinkedIn OAuth integration and content management",
            },
        ],
        servers: swaggerServers,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}". In Swagger UI, click the Authorize button and enter your token.',
                },
            },
            parameters: {
                PageParam: {
                    name: "page",
                    in: "query",
                    description: "Page number for pagination",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1,
                    },
                },
                LimitParam: {
                    name: "limit",
                    in: "query",
                    description: "Number of items per page",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: "Authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: "Resource not found",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
                ValidationError: {
                    description: "Validation error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse",
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        responses: {
            BadRequest: {
                description: "Bad request - validation error or invalid input",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Validation failed",
                                },
                                errors: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            field: { type: "string", example: "email" },
                                            message: {
                                                type: "string",
                                                example: "Invalid email format",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            Unauthorized: {
                description: "Unauthorized - authentication required",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Access denied. No token provided.",
                                },
                            },
                        },
                    },
                },
            },
            Forbidden: {
                description: "Forbidden - insufficient permissions",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Forbidden - insufficient permissions",
                                },
                            },
                        },
                    },
                },
            },
            NotFound: {
                description: "Resource not found",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Resource not found",
                                },
                            },
                        },
                    },
                },
            },
            InternalServerError: {
                description: "Internal server error",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Internal server error",
                                },
                            },
                        },
                    },
                },
            },
        },
        schemas: {
            ...swagger_schemas_1.schemas,
            User: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "User ID",
                        example: 1,
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "User email address",
                        example: "user@example.com",
                    },
                    role: {
                        type: "string",
                        description: "User role",
                        enum: ["owner", "admin", "reseller", "agency", "user"],
                        example: "user",
                    },
                    first_name: { type: "string", nullable: true, example: "John" },
                    last_name: { type: "string", nullable: true, example: "Doe" },
                    is_verified: { type: "boolean", example: true },
                    profile_photo: {
                        type: "string",
                        nullable: true,
                        example: "http://example.com/photo.jpg",
                    },
                    company_id: {
                        type: "integer",
                        nullable: true,
                        example: 1,
                        description: "ID of the company the user belongs to",
                    },
                    team_ids: {
                        type: "array",
                        items: { type: "integer" },
                        nullable: true,
                        example: [101, 102],
                        description: "IDs of the teams the user belongs to",
                    },
                    designation: {
                        type: "string",
                        nullable: true,
                        example: "Software Engineer",
                    },
                    account_person_email: {
                        type: "string",
                        format: "email",
                        nullable: true,
                        example: "john.doe@example.com",
                    },
                    account_type: {
                        type: "string",
                        enum: ["company", "individual", "reseller", "agency"],
                        example: "individual",
                    },
                    two_factor_enabled: { type: "boolean", example: false },
                    limit: { type: "string", nullable: true, example: "1000 credits" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                    account_status: {
                        type: "string",
                        enum: [
                            "Ban",
                            "Deactivate",
                            "Suspend",
                            "Freeze",
                            "Restrict",
                            "Shadowban",
                            "Lock",
                            "Delete",
                            "Review",
                            "Warning",
                        ],
                        example: "Review",
                    },
                    account_person_whatsapp_number: { type: "string", nullable: true },
                    public_mobile_number: { type: "string", nullable: true },
                    public_landline_number: { type: "string", nullable: true },
                    public_email_address: {
                        type: "string",
                        format: "email",
                        nullable: true,
                    },
                    public_website_1: { type: "string", format: "url", nullable: true },
                    public_website_2: { type: "string", format: "url", nullable: true },
                    main_office_address: { type: "string", nullable: true },
                    head_office_address: { type: "string", nullable: true },
                    branch_office_address: { type: "string", nullable: true },
                    business_categories: {
                        type: "array",
                        items: { type: "string" },
                        nullable: true,
                    },
                    business_type: { type: "string", nullable: true },
                    target_audience: { type: "string", nullable: true },
                    target_geo_location: { type: "string", nullable: true },
                    target_keywords: {
                        type: "array",
                        items: { type: "string" },
                        nullable: true,
                    },
                    about_business_description: { type: "string", nullable: true },
                    company_bio: { type: "string", nullable: true },
                    author_bio: { type: "string", nullable: true },
                    company_website: { type: "string", format: "url", nullable: true },
                    full_name: { type: "string", nullable: true },
                    country: { type: "string", nullable: true },
                    timezone: { type: "string", nullable: true },
                    preferred_language: { type: "string", nullable: true },
                    state: { type: "string", nullable: true },
                    fax: { type: "string", nullable: true },
                    district: { type: "string", nullable: true },
                    city: { type: "string", nullable: true },
                },
            },
            UserCreationRequest: {
                type: "object",
                required: ["email", "password", "account_type"],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        description: "User's email address.",
                        example: "new.user@example.com",
                    },
                    password: {
                        type: "string",
                        format: "password",
                        description: "User's password (min 8 characters).",
                        example: "StrongPassword123!",
                    },
                    first_name: {
                        type: "string",
                        description: "User's first name.",
                        example: "John",
                    },
                    last_name: {
                        type: "string",
                        description: "User's last name.",
                        example: "Doe",
                    },
                    role: {
                        type: "string",
                        enum: ["admin", "reseller", "agency", "user"],
                        description: "User role (defaults to 'user' if not provided during self-registration).",
                        example: "user",
                    },
                    account_type: {
                        type: "string",
                        enum: ["company", "individual", "reseller", "agency"],
                        description: "Type of account (e.g., individual, company, reseller).",
                        example: "individual",
                    },
                    is_verified: {
                        type: "boolean",
                        description: "Whether the user account is verified (defaults to false).",
                        example: false,
                    },
                    profile_photo: {
                        type: "string",
                        format: "url",
                        description: "URL to the user's profile photo.",
                        example: "https://example.com/profile.jpg",
                        nullable: true,
                    },
                    company_id: {
                        type: "integer",
                        description: "The ID of the company the user belongs to.",
                        example: 123,
                        nullable: true,
                    },
                    team_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "The IDs of the teams the user belongs to within a company.",
                        example: [456, 789],
                        nullable: true,
                    },
                    designation: {
                        type: "string",
                        description: "User's job designation.",
                        example: "SEO Specialist",
                        nullable: true,
                    },
                    account_person_email: {
                        type: "string",
                        format: "email",
                        description: "Email address of the account person associated with the user.",
                        example: "account.person@example.com",
                        nullable: true,
                    },
                    state: { type: "string", nullable: true },
                    fax: { type: "string", nullable: true },
                    district: { type: "string", nullable: true },
                    city: { type: "string", nullable: true },
                },
            },
            UserLoginRequest: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example: "john.doe@example.com",
                    },
                    password: {
                        type: "string",
                        format: "password",
                        example: "NewPassword123!",
                    },
                },
            },
            UserProfileUpdateRequest: {
                type: "object",
                properties: {
                    first_name: { type: "string", example: "Jonathan", nullable: true },
                    last_name: { type: "string", example: "Doe", nullable: true },
                    profile_photo: {
                        type: "string",
                        format: "url",
                        example: "https://example.com/path/to/profile.jpg",
                        nullable: true,
                    },
                    company_id: { type: "integer", example: 123, nullable: true },
                    team_ids: {
                        type: "array",
                        items: { type: "integer" },
                        example: [45, 67],
                        nullable: true,
                        description: "IDs of the teams the user belongs to",
                    },
                    designation: {
                        type: "string",
                        example: "SEO Specialist",
                        nullable: true,
                    },
                    account_person_email: {
                        type: "string",
                        format: "email",
                        example: "account.person@example.com",
                        nullable: true,
                    },
                    account_person_whatsapp_number: { type: "string", nullable: true },
                    public_mobile_number: { type: "string", nullable: true },
                    public_landline_number: { type: "string", nullable: true },
                    public_email_address: {
                        type: "string",
                        format: "email",
                        nullable: true,
                    },
                    public_website_1: { type: "string", format: "url", nullable: true },
                    public_website_2: { type: "string", format: "url", nullable: true },
                    main_office_address: { type: "string", nullable: true },
                    head_office_address: { type: "string", nullable: true },
                    branch_office_address: { type: "string", nullable: true },
                    business_categories: {
                        type: "array",
                        items: { type: "string" },
                        nullable: true,
                    },
                    business_type: { type: "string", nullable: true },
                    target_audience: { type: "string", nullable: true },
                    target_geo_location: { type: "string", nullable: true },
                    target_keywords: {
                        type: "array",
                        items: { type: "string" },
                        nullable: true,
                    },
                    about_business_description: { type: "string", nullable: true },
                    company_bio: { type: "string", nullable: true },
                    author_bio: { type: "string", nullable: true },
                    company_website: { type: "string", format: "url", nullable: true },
                    full_name: { type: "string", nullable: true },
                    country: { type: "string", nullable: true },
                    timezone: { type: "string", nullable: true },
                    preferred_language: { type: "string", nullable: true },
                    two_factor_enabled: { type: "boolean", nullable: true },
                    account_status: {
                        type: "string",
                        enum: [
                            "Ban",
                            "Deactivate",
                            "Suspend",
                            "Freeze",
                            "Restrict",
                            "Shadowban",
                            "Lock",
                            "Delete",
                            "Review",
                            "Warning",
                        ],
                        example: "Review",
                        nullable: true,
                    },
                    state: { type: "string", nullable: true },
                    fax: { type: "string", nullable: true },
                    district: { type: "string", nullable: true },
                    city: { type: "string", nullable: true },
                },
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "Error message",
                        example: "An error occurred",
                    },
                    errors: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                field: { type: "string", example: "email" },
                                message: { type: "string", example: "Invalid email format" },
                            },
                        },
                        nullable: true,
                    },
                },
            },
            UserResponse: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    email: {
                        type: "string",
                        format: "email",
                        example: "user@example.com",
                    },
                    role: {
                        type: "string",
                        enum: ["owner", "admin", "reseller", "agency", "user"],
                        example: "user",
                    },
                    first_name: { type: "string", nullable: true, example: "John" },
                    last_name: { type: "string", nullable: true, example: "Doe" },
                    is_verified: { type: "boolean", example: true },
                    account_type: {
                        type: "string",
                        enum: ["company", "individual", "reseller", "agency"],
                        example: "individual",
                    },
                    company_id: { type: "integer", nullable: true, example: 1 },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            PaginatedUsersResult: {
                type: "object",
                properties: {
                    users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                    },
                    total: { type: "integer", example: 100 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                    totalPages: { type: "integer", example: 10 },
                },
            },
            AuthResponse: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Login successful." },
                    token: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjE2NDQ2NDA2LCJleHAiOjE2MTY1MzI4MDZ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                    },
                    user: { $ref: "#/components/schemas/User" },
                },
            },
            SubscriptionActionInput: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["subscribe", "unsubscribe", "change_plan"],
                        example: "subscribe",
                    },
                    planId: { type: "string", example: "premium_monthly" },
                },
            },
            ContentGenerationInput: {
                type: "object",
                properties: {
                    keywords: {
                        type: "array",
                        items: { type: "string" },
                        example: [
                            "ai content generation",
                            "seo marketing",
                            "backlink strategy",
                        ],
                    },
                    contentType: { type: "string", example: "blog_post" },
                    tone: { type: "string", example: "professional" },
                },
            },
            ContentCategory: {
                type: "string",
                enum: [
                    "blog",
                    "article",
                    "search",
                    "ping",
                    "classified",
                    "forum",
                    "bookmarking",
                    "directory",
                    "social_media",
                    "linked_comment",
                ],
                description: "The category of the content.",
                example: "blog",
            },
            ContentPostType: {
                type: "string",
                enum: ["manual", "automated"],
                description: "The type of content posting.",
                example: "manual",
            },
            Content: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    user_id: { type: "integer", example: 123 },
                    company_id: { type: "integer", nullable: true, example: 1 },
                    generated_content: {
                        type: "object",
                        example: {
                            title: "My Blog Post",
                            content: "This is the content of my blog post.",
                        },
                    },
                    post_type: {
                        type: "string",
                        enum: ["manual", "automated"],
                        example: "automated",
                    },
                    post_date: {
                        type: "string",
                        format: "date-time",
                        example: "2024-08-01T12:00:00Z",
                    },
                    is_posted: { type: "boolean", example: true },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            CreateContentDto: {
                type: "object",
                required: ["user_id", "post_type"],
                properties: {
                    user_id: { type: "integer", description: "User ID", example: 1 },
                    company_id: {
                        type: "integer",
                        nullable: true,
                        description: "Company ID",
                        example: 1,
                    },
                    blog: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "My New Blog Post Title" },
                            content: {
                                type: "string",
                                example: "The full content of the new blog post.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-01T09:00:00Z",
                            },
                        },
                    },
                    article: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Article Title" },
                            content: {
                                type: "string",
                                example: "Content for a new article.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-02T10:00:00Z",
                            },
                        },
                    },
                    search: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: {
                                type: "string",
                                example: "New Search Optimized Content",
                            },
                            content: {
                                type: "string",
                                example: "Content for new search entry.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-03T11:00:00Z",
                            },
                        },
                    },
                    ping: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Ping Content" },
                            content: {
                                type: "string",
                                example: "Content for new ping service.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-04T12:00:00Z",
                            },
                        },
                    },
                    classified: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Classified Ad" },
                            content: {
                                type: "string",
                                example: "Content for new classified ad.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-05T13:00:00Z",
                            },
                        },
                    },
                    forum: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Forum Topic" },
                            content: {
                                type: "string",
                                example: "Content for a new forum topic.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-06T14:00:00Z",
                            },
                        },
                    },
                    bookmarking: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Bookmark Entry" },
                            content: {
                                type: "string",
                                example: "Content for a new bookmark.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-07T15:00:00Z",
                            },
                        },
                    },
                    directory: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Directory Listing" },
                            content: {
                                type: "string",
                                example: "Content for a new directory submission.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-08T16:00:00Z",
                            },
                        },
                    },
                    social_media: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "New Social Media Update" },
                            content: {
                                type: "string",
                                example: "Content for a new social media post.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Scheduled post date",
                                example: "2024-08-09T17:00:00Z",
                            },
                        },
                    },
                    post_type: {
                        type: "string",
                        enum: ["manual", "automated"],
                        description: "Type of content post",
                        example: "automated",
                    },
                    keyword_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "Array of keyword IDs associated with the content",
                        example: [1, 2, 3],
                        nullable: true,
                    },
                },
            },
            UpdateContentDto: {
                type: "object",
                properties: {
                    blog: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Blog Post Title" },
                            content: {
                                type: "string",
                                example: "Updated content of the blog post.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-01T09:00:00Z",
                            },
                        },
                    },
                    article: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Article Title" },
                            content: {
                                type: "string",
                                example: "Updated content of the article.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-02T10:00:00Z",
                            },
                        },
                    },
                    search: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: {
                                type: "string",
                                example: "Updated Search Optimized Content",
                            },
                            content: {
                                type: "string",
                                example: "Updated content for search entry.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-03T11:00:00Z",
                            },
                        },
                    },
                    ping: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Ping Content" },
                            content: {
                                type: "string",
                                example: "Updated content for ping service.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-04T12:00:00Z",
                            },
                        },
                    },
                    classified: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Classified Ad" },
                            content: {
                                type: "string",
                                example: "Updated content for classified ad.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-05T13:00:00Z",
                            },
                        },
                    },
                    forum: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Forum Topic" },
                            content: {
                                type: "string",
                                example: "Updated content for a forum topic.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-06T14:00:00Z",
                            },
                        },
                    },
                    bookmarking: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Bookmark Entry" },
                            content: {
                                type: "string",
                                example: "Updated content for a bookmark.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-07T15:00:00Z",
                            },
                        },
                    },
                    directory: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: { type: "string", example: "Updated Directory Listing" },
                            content: {
                                type: "string",
                                example: "Updated content for a directory submission.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-08T16:00:00Z",
                            },
                        },
                    },
                    social_media: {
                        type: "object",
                        nullable: true,
                        properties: {
                            title: {
                                type: "string",
                                example: "Updated Social Media Update",
                            },
                            content: {
                                type: "string",
                                example: "Updated content for a social media post.",
                            },
                            post_date: {
                                type: "string",
                                format: "date-time",
                                description: "Updated scheduled post date",
                                example: "2024-09-09T17:00:00Z",
                            },
                        },
                    },
                    post_type: {
                        type: "string",
                        enum: ["manual", "automated"],
                        description: "Type of content post",
                        example: "automated",
                        nullable: true,
                    },
                    keyword_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "Array of keyword IDs associated with the content",
                        example: [4, 5, 6],
                        nullable: true,
                    },
                    company_id: {
                        type: "integer",
                        nullable: true,
                        description: "Company ID",
                        example: 1,
                    },
                    is_posted: {
                        type: "boolean",
                        description: "Whether the content has been posted",
                        example: true,
                        nullable: true,
                    },
                },
            },
            ContentCreationRequest: {
                type: "object",
                required: [
                    "user_id",
                    "generated_content",
                    "post_type",
                    "post_date",
                    "category",
                ],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the content",
                        example: 123,
                    },
                    company_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the company (optional)",
                        example: 456,
                    },
                    generated_content: {
                        type: "object",
                        description: "Generated content data (JSONB) containing title and content",
                        example: {
                            title: "My Awesome Blog Post",
                            content: "This is the full content of my awesome blog post in HTML format.",
                        },
                    },
                    post_type: {
                        type: "string",
                        enum: ["manual", "automated"],
                        description: "Type of content post",
                        example: "manual",
                    },
                    post_date: {
                        type: "string",
                        format: "date-time",
                        description: "Date for content posting",
                        example: "2024-08-01T12:00:00Z",
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "article",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                        description: "Category of the content",
                        example: "blog",
                    },
                    keyword_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "Array of keyword IDs associated with the content",
                        example: [1, 2, 3],
                        nullable: true,
                    },
                    is_posted: {
                        type: "boolean",
                        description: "Whether the content has been posted.",
                        example: false,
                        nullable: true,
                    },
                },
            },
            ContentUpdateRequest: {
                type: "object",
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the content",
                        example: 123,
                        nullable: true,
                    },
                    blog: {
                        type: "object",
                        description: "Blog content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Blog Post",
                            content: "This is the updated content.",
                        },
                    },
                    article: {
                        type: "object",
                        description: "Article content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Content",
                            content: "This is the updated content.",
                        },
                    },
                    search: {
                        type: "object",
                        description: "Search content data (JSONB)",
                        nullable: true,
                        example: { query: "Updated SEO tips", results: ["new_result"] },
                    },
                    ping: {
                        type: "object",
                        description: "Ping content data (JSONB)",
                        nullable: true,
                        example: { url: "http://updated.com", status: "failed" },
                    },
                    classified: {
                        type: "object",
                        description: "Classified content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Item",
                            description: "Updated description.",
                        },
                    },
                    forum: {
                        type: "object",
                        description: "Forum content data (JSONB)",
                        nullable: true,
                        example: {
                            topic: "Updated Strategies",
                            post: "Discussing updated strategies.",
                        },
                    },
                    bookmarking: {
                        type: "object",
                        description: "Bookmarking content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Bookmark",
                            url: "http://updated-bookmark.com",
                        },
                    },
                    directory: {
                        type: "object",
                        description: "Directory content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Directory Entry",
                            description: "Updated directory description.",
                        },
                    },
                    social_media: {
                        type: "object",
                        description: "Social Media content data (JSONB)",
                        nullable: true,
                        example: {
                            title: "Updated Social Post",
                            content: "Updated social media content.",
                        },
                    },
                    post_type: {
                        type: "string",
                        enum: ["manual", "automated"],
                        description: "Type of content post",
                        nullable: true,
                    },
                    post_date: {
                        type: "string",
                        format: "date-time",
                        description: "Date for content posting",
                        example: "2024-08-01T12:00:00Z",
                        nullable: true,
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "article",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                        description: "Category of the content",
                        example: "blog",
                        nullable: true,
                    },
                    keyword_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "Array of keyword IDs associated with the content",
                        nullable: true,
                    },
                    is_posted: {
                        type: "boolean",
                        description: "Whether the content has been posted.",
                        nullable: true,
                    },
                },
            },
            ContentPost: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "Unique identifier for the content post",
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the associated content",
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who created the post",
                    },
                    company_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the company (optional)",
                    },
                    status: {
                        type: "string",
                        enum: ["pending", "success", "failed"],
                        description: "Status of the content post",
                    },
                    error_message: {
                        type: "string",
                        nullable: true,
                        description: "Error message if post failed",
                    },
                    post_urls: {
                        type: "array",
                        items: { type: "string" },
                        nullable: true,
                        description: "URLs where the content was posted",
                    },
                    summary: {
                        type: "string",
                        nullable: true,
                        description: "Summary of the content posted",
                    },
                    campaign_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the associated campaign",
                    },
                    scheduled_date: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Scheduled date and time for the content to be posted",
                        example: "2024-08-15T10:00:00Z",
                    },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the content post was created",
                    },
                    updated_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the content post was last updated",
                    },
                },
            },
            ContentPostCreationRequest: {
                type: "object",
                required: ["content_id", "user_id"],
                properties: {
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be posted",
                        example: 1,
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user creating the content post",
                        example: 123,
                    },
                    company_id: {
                        type: "integer",
                        description: "ID of the company this content post belongs to",
                        example: 456,
                        nullable: true,
                    },
                    summary: {
                        type: "string",
                        nullable: true,
                        description: "Summary of the content to be posted",
                        example: "SEO tips content for blog.",
                    },
                    campaign_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the associated campaign",
                        example: 789,
                    },
                    scheduled_date: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Scheduled date and time for the content to be posted",
                        example: "2024-08-15T10:00:00Z",
                    },
                },
            },
            ContentPostUpdateRequest: {
                type: "object",
                properties: {
                    platform: {
                        type: "string",
                        description: "Platform where the content was posted",
                        example: "blog",
                        nullable: true,
                    },
                    post_url: {
                        type: "string",
                        format: "url",
                        description: "URL of the posted content",
                        example: "http://example.com/blog/updated-post",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        description: "Status of the post",
                        example: "success",
                        nullable: true,
                    },
                    summary: {
                        type: "string",
                        description: "Summary of the content posted",
                        example: "Updated SEO tips content posted.",
                        nullable: true,
                    },
                    details: {
                        type: "object",
                        description: "Additional details about the post (JSONB)",
                        nullable: true,
                    },
                },
            },
            PostSchedule: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Schedule ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user this schedule belongs to",
                        example: 123,
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be posted",
                        example: 101,
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "content",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                        example: "content",
                        description: "Category of the site.",
                    },
                    site_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "IDs of the websites where content will be posted.",
                        example: [1, 2],
                    },
                    frequency: {
                        type: "string",
                        enum: ["daily", "weekly", "monthly"],
                        description: "Frequency of posting.",
                        example: "daily",
                    },
                    target: {
                        type: "integer",
                        description: "Target number of posts per frequency.",
                        example: 10,
                    },
                    minimumInclude: {
                        type: "integer",
                        description: "Minimum number of posts to include.",
                        example: 5,
                    },
                    schedule_time: {
                        type: "string",
                        format: "date-time",
                        description: "Scheduled time for posting (UTC).",
                        example: "2024-08-01T10:00:00Z",
                    },
                    last_posted: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Last time content was posted based on this schedule.",
                        example: "2024-07-31T10:00:00Z",
                    },
                    next_scheduled: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Next scheduled time for posting.",
                        example: "2024-08-02T10:00:00Z",
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the schedule is active.",
                        example: true,
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            PostScheduleCreationRequest: {
                type: "object",
                required: [
                    "user_id",
                    "content_id",
                    "category",
                    "site_ids",
                    "frequency",
                    "target",
                    "minimumInclude",
                    "schedule_time",
                ],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user this schedule belongs to",
                        example: 123,
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be posted",
                        example: 101,
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "content",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                        example: "content",
                        description: "Category of the site.",
                    },
                    site_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "IDs of the websites where content will be posted.",
                        example: [1, 2],
                    },
                    frequency: {
                        type: "string",
                        enum: ["daily", "weekly", "monthly"],
                        description: "Frequency of posting.",
                        example: "daily",
                    },
                    target: {
                        type: "integer",
                        description: "Target number of posts per frequency.",
                        example: 10,
                    },
                    minimumInclude: {
                        type: "integer",
                        description: "Minimum number of posts to include.",
                        example: 5,
                    },
                    schedule_time: {
                        type: "string",
                        format: "date-time",
                        description: "Scheduled time for posting (UTC).",
                        example: "2024-08-01T10:00:00Z",
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the schedule is active (defaults to true).",
                        example: true,
                    },
                },
            },
            PostScheduleUpdateRequest: {
                type: "object",
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user this schedule belongs to",
                        example: 123,
                        nullable: true,
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be posted",
                        example: 101,
                        nullable: true,
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "content",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                        example: "content",
                        description: "Category of the site.",
                        nullable: true,
                    },
                    site_ids: {
                        type: "array",
                        items: { type: "integer" },
                        description: "IDs of the websites where content will be posted.",
                        example: [1, 2],
                        nullable: true,
                    },
                    frequency: {
                        type: "string",
                        enum: ["daily", "weekly", "monthly"],
                        description: "Frequency of posting.",
                        example: "daily",
                        nullable: true,
                    },
                    target: {
                        type: "integer",
                        description: "Target number of posts per frequency.",
                        example: 10,
                        nullable: true,
                    },
                    minimumInclude: {
                        type: "integer",
                        description: "Minimum number of posts to include.",
                        example: 5,
                        nullable: true,
                    },
                    schedule_time: {
                        type: "string",
                        format: "date-time",
                        description: "Scheduled time for posting (UTC).",
                        example: "2024-08-01T10:00:00Z",
                        nullable: true,
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the schedule is active.",
                        example: true,
                        nullable: true,
                    },
                },
            },
            CreateWebsiteDto: {
                type: "object",
                required: ["name", "url", "user_id", "have_credential"],
                properties: {
                    name: {
                        type: "string",
                        description: "Website name",
                        example: "Tech Insights Blog",
                    },
                    url: {
                        type: "string",
                        format: "uri",
                        description: "Website URL",
                        example: "https://techinsights.com",
                    },
                    category: {
                        type: "string",
                        description: "Website category",
                        example: "blog",
                        nullable: true,
                        enum: [
                            "blog",
                            "article",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                    },
                    login_page: {
                        type: "string",
                        format: "uri",
                        description: "Login page URL",
                        example: "https://techinsights.com/login",
                        nullable: true,
                    },
                    register_page: {
                        type: "string",
                        format: "uri",
                        description: "Register page URL",
                        example: "https://techinsights.com/register",
                        nullable: true,
                    },
                    post_page: {
                        type: "string",
                        format: "uri",
                        description: "Post creation page URL",
                        example: "https://techinsights.com/wp-admin/post-new.php",
                        nullable: true,
                    },
                    is_verified: {
                        type: "boolean",
                        description: "Whether the website should be marked as verified",
                        example: false,
                        nullable: true,
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns this website",
                        example: 123,
                    },
                    score: {
                        type: "number",
                        format: "float",
                        description: "Website quality/authority score",
                        example: 8.5,
                        nullable: true,
                    },
                    have_credential: {
                        type: "boolean",
                        description: "Whether the website requires credentials for posting",
                        example: true,
                    },
                    credential_type: {
                        type: "object",
                        description: "Schema defining required credential fields and their types for this website",
                        example: {
                            username: "string",
                            password: "string",
                            api_key: "string",
                        },
                        nullable: true,
                        additionalProperties: {
                            type: "string",
                        },
                    },
                },
            },
            UpdateWebsiteDto: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Updated website name",
                        example: "Updated Tech Blog",
                        nullable: true,
                    },
                    url: {
                        type: "string",
                        format: "uri",
                        description: "Updated website URL",
                        example: "https://updated-techblog.com",
                        nullable: true,
                    },
                    category: {
                        type: "string",
                        description: "Updated website category",
                        example: "article",
                        nullable: true,
                        enum: [
                            "blog",
                            "article",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                    },
                    login_page: {
                        type: "string",
                        format: "uri",
                        description: "Updated login page URL",
                        example: "https://updated-techblog.com/login",
                        nullable: true,
                    },
                    register_page: {
                        type: "string",
                        format: "uri",
                        description: "Updated register page URL",
                        example: "https://updated-techblog.com/register",
                        nullable: true,
                    },
                    post_page: {
                        type: "string",
                        format: "uri",
                        description: "Updated post creation page URL",
                        example: "https://updated-techblog.com/wp-admin/post-new.php",
                        nullable: true,
                    },
                    is_verified: {
                        type: "boolean",
                        description: "Updated verification status",
                        example: true,
                        nullable: true,
                    },
                    user_id: {
                        type: "integer",
                        description: "Updated user ID (admin only)",
                        example: 456,
                        nullable: true,
                    },
                    score: {
                        type: "number",
                        format: "float",
                        description: "Updated website quality/authority score",
                        example: 9.2,
                        nullable: true,
                    },
                    have_credential: {
                        type: "boolean",
                        description: "Updated credential requirement status",
                        example: true,
                        nullable: true,
                    },
                    credential_type: {
                        type: "object",
                        description: "Updated schema for required credential fields and their types",
                        example: {
                            username: "string",
                            password: "string",
                            api_token: "string",
                        },
                        nullable: true,
                        additionalProperties: {
                            type: "string",
                        },
                    },
                },
            },
            SubscriptionPackage: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "Subscription package ID",
                        example: 1,
                    },
                    name: {
                        type: "string",
                        description: "Name of the package",
                        example: "Premium",
                    },
                    description: {
                        type: "string",
                        description: "Description of the package",
                        example: "Full access to all features.",
                    },
                    price: {
                        type: "number",
                        format: "float",
                        description: "Price of the package",
                        example: 99.99,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the price",
                        example: "USD",
                    },
                    duration_days: {
                        type: "integer",
                        description: "Duration of the package in days",
                        example: 30,
                    },
                    features: {
                        type: "object",
                        properties: {
                            max_users: {
                                type: "integer",
                                description: "Maximum number of users allowed",
                                example: 5,
                            },
                            max_websites: {
                                type: "integer",
                                description: "Maximum number of websites allowed",
                                example: 10,
                            },
                            max_keywords: {
                                type: "integer",
                                description: "Maximum number of keywords allowed",
                                example: 1000,
                            },
                            max_content_posts: {
                                type: "integer",
                                description: "Maximum number of content posts allowed",
                                example: 500,
                            },
                            ai_chat_access: {
                                type: "boolean",
                                description: "Access to AI chat features",
                                example: true,
                            },
                            rank_tracker_access: {
                                type: "boolean",
                                description: "Access to rank tracker",
                                example: true,
                            },
                            backlinks_access: {
                                type: "boolean",
                                description: "Access to backlinks features",
                                example: true,
                            },
                            audit_access: {
                                type: "boolean",
                                description: "Access to audit features",
                                example: true,
                            },
                            competitor_analysis_access: {
                                type: "boolean",
                                description: "Access to competitor analysis",
                                example: true,
                            },
                            content_editor_access: {
                                type: "boolean",
                                description: "Access to content editor",
                                example: true,
                            },
                            monthly_content_credit: {
                                type: "integer",
                                description: "Monthly credit for content generation",
                                example: 100,
                            },
                            support_priority: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                                description: "Support priority level",
                                example: "high",
                            },
                            custom_branding: {
                                type: "boolean",
                                description: "Ability to use custom branding",
                                example: false,
                            },
                            white_label_reporting: {
                                type: "boolean",
                                description: "Ability to use white label reporting",
                                example: false,
                            },
                            api_access: {
                                type: "boolean",
                                description: "Access to API",
                                example: true,
                            },
                        },
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the package is active",
                        example: true,
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            SubscriptionPackageCreationRequest: {
                type: "object",
                required: ["name", "price", "currency", "duration_days"],
                properties: {
                    name: {
                        type: "string",
                        description: "Name of the package",
                        example: "Standard",
                    },
                    description: {
                        type: "string",
                        description: "Description of the package",
                        example: "Access to core features.",
                    },
                    price: {
                        type: "number",
                        format: "float",
                        description: "Price of the package",
                        example: 49.99,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the price",
                        example: "USD",
                    },
                    duration_days: {
                        type: "integer",
                        description: "Duration of the package in days",
                        example: 30,
                    },
                    features: {
                        type: "object",
                        properties: {
                            max_users: {
                                type: "integer",
                                description: "Maximum number of users allowed",
                                example: 1,
                            },
                            max_websites: {
                                type: "integer",
                                description: "Maximum number of websites allowed",
                                example: 5,
                            },
                            max_keywords: {
                                type: "integer",
                                description: "Maximum number of keywords allowed",
                                example: 500,
                            },
                            max_content_posts: {
                                type: "integer",
                                description: "Maximum number of content posts allowed",
                                example: 250,
                            },
                            ai_chat_access: {
                                type: "boolean",
                                description: "Access to AI chat features",
                                example: true,
                            },
                            rank_tracker_access: {
                                type: "boolean",
                                description: "Access to rank tracker",
                                example: true,
                            },
                            backlinks_access: {
                                type: "boolean",
                                description: "Access to backlinks features",
                                example: true,
                            },
                            audit_access: {
                                type: "boolean",
                                description: "Access to audit features",
                                example: false,
                            },
                            competitor_analysis_access: {
                                type: "boolean",
                                description: "Access to competitor analysis",
                                example: false,
                            },
                            content_editor_access: {
                                type: "boolean",
                                description: "Access to content editor",
                                example: true,
                            },
                            monthly_content_credit: {
                                type: "integer",
                                description: "Monthly credit for content generation",
                                example: 50,
                            },
                            support_priority: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                                description: "Support priority level",
                                example: "medium",
                            },
                            custom_branding: {
                                type: "boolean",
                                description: "Ability to use custom branding",
                                example: false,
                            },
                            white_label_reporting: {
                                type: "boolean",
                                description: "Ability to use white label reporting",
                                example: false,
                            },
                            api_access: {
                                type: "boolean",
                                description: "Access to API",
                                example: true,
                            },
                        },
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the package is active (defaults to true).",
                        example: true,
                    },
                },
            },
            SubscriptionPackageUpdateRequest: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Name of the package",
                        example: "Pro",
                        nullable: true,
                    },
                    description: {
                        type: "string",
                        description: "Description of the package",
                        example: "Enhanced access with more features.",
                        nullable: true,
                    },
                    price: {
                        type: "number",
                        format: "float",
                        description: "Price of the package",
                        example: 79.99,
                        nullable: true,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the price",
                        example: "EUR",
                        nullable: true,
                    },
                    duration_days: {
                        type: "integer",
                        description: "Duration of the package in days",
                        example: 60,
                        nullable: true,
                    },
                    features: {
                        type: "object",
                        properties: {
                            max_users: {
                                type: "integer",
                                description: "Maximum number of users allowed",
                                example: 7,
                                nullable: true,
                            },
                            max_websites: {
                                type: "integer",
                                description: "Maximum number of websites allowed",
                                example: 12,
                                nullable: true,
                            },
                            max_keywords: {
                                type: "integer",
                                description: "Maximum number of keywords allowed",
                                example: 1200,
                                nullable: true,
                            },
                            max_content_posts: {
                                type: "integer",
                                description: "Maximum number of content posts allowed",
                                example: 600,
                                nullable: true,
                            },
                            ai_chat_access: {
                                type: "boolean",
                                description: "Access to AI chat features",
                                example: true,
                                nullable: true,
                            },
                            rank_tracker_access: {
                                type: "boolean",
                                description: "Access to rank tracker",
                                example: true,
                                nullable: true,
                            },
                            backlinks_access: {
                                type: "boolean",
                                description: "Access to backlinks features",
                                example: true,
                                nullable: true,
                            },
                            audit_access: {
                                type: "boolean",
                                description: "Access to audit features",
                                example: true,
                                nullable: true,
                            },
                            competitor_analysis_access: {
                                type: "boolean",
                                description: "Access to competitor analysis",
                                example: true,
                                nullable: true,
                            },
                            content_editor_access: {
                                type: "boolean",
                                description: "Access to content editor",
                                example: true,
                                nullable: true,
                            },
                            monthly_content_credit: {
                                type: "integer",
                                description: "Monthly credit for content generation",
                                example: 150,
                                nullable: true,
                            },
                            support_priority: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                                description: "Support priority level",
                                example: "high",
                                nullable: true,
                            },
                            custom_branding: {
                                type: "boolean",
                                description: "Ability to use custom branding",
                                example: true,
                                nullable: true,
                            },
                            white_label_reporting: {
                                type: "boolean",
                                description: "Ability to use white label reporting",
                                example: true,
                                nullable: true,
                            },
                            api_access: {
                                type: "boolean",
                                description: "Access to API",
                                example: true,
                                nullable: true,
                            },
                        },
                        nullable: true,
                    },
                    is_active: {
                        type: "boolean",
                        description: "Whether the package is active.",
                        example: false,
                        nullable: true,
                    },
                },
            },
            Payment: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Payment ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user making the payment",
                        example: 123,
                    },
                    subscription_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the associated subscription",
                        example: 101,
                    },
                    coupon_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the applied coupon",
                        example: 201,
                    },
                    amount: {
                        type: "number",
                        format: "float",
                        description: "Amount paid",
                        example: 99.99,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the payment",
                        example: "USD",
                    },
                    payment_method: {
                        type: "string",
                        description: "Method of payment (e.g., Stripe, PayPal)",
                        example: "Stripe",
                    },
                    transaction_id: {
                        type: "string",
                        description: "Unique transaction ID from payment gateway",
                        example: "txn_123abc",
                    },
                    status: {
                        type: "string",
                        enum: ["pending", "completed", "failed", "refunded"],
                        description: "Status of the payment",
                        example: "completed",
                    },
                    paid_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the payment was completed",
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            PaymentCreationRequest: {
                type: "object",
                required: [
                    "user_id",
                    "amount",
                    "currency",
                    "payment_method",
                    "transaction_id",
                    "status",
                ],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user making the payment",
                        example: 123,
                    },
                    subscription_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the associated subscription",
                        example: 101,
                    },
                    coupon_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the applied coupon",
                        example: 201,
                    },
                    amount: {
                        type: "number",
                        format: "float",
                        description: "Amount paid",
                        example: 99.99,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the payment",
                        example: "USD",
                    },
                    payment_method: {
                        type: "string",
                        description: "Method of payment (e.g., Stripe, PayPal)",
                        example: "Stripe",
                    },
                    transaction_id: {
                        type: "string",
                        description: "Unique transaction ID from payment gateway",
                        example: "txn_123abc",
                    },
                    status: {
                        type: "string",
                        enum: ["pending", "completed", "failed", "refunded"],
                        description: "Status of the payment",
                        example: "completed",
                    },
                    paid_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the payment was completed",
                    },
                },
            },
            PaymentUpdateRequest: {
                type: "object",
                properties: {
                    subscription_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the associated subscription",
                        example: 101,
                    },
                    coupon_id: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the applied coupon",
                        example: 201,
                    },
                    amount: {
                        type: "number",
                        format: "float",
                        description: "Amount paid",
                        example: 99.99,
                        nullable: true,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the payment",
                        example: "USD",
                        nullable: true,
                    },
                    payment_method: {
                        type: "string",
                        description: "Method of payment (e.g., Stripe, PayPal)",
                        example: "Stripe",
                        nullable: true,
                    },
                    transaction_id: {
                        type: "string",
                        description: "Unique transaction ID from payment gateway",
                        example: "txn_123abc",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["pending", "completed", "failed", "refunded"],
                        description: "Status of the payment",
                        example: "refunded",
                        nullable: true,
                    },
                    paid_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the payment was completed",
                        nullable: true,
                    },
                },
            },
            Website: {
                type: "object",
                required: [
                    "id",
                    "name",
                    "url",
                    "user_id",
                    "created_at",
                    "updated_at",
                    "have_credential",
                ],
                properties: {
                    id: { type: "integer", description: "Website ID", example: 1 },
                    name: {
                        type: "string",
                        description: "Website name",
                        example: "Tech Insights Blog",
                    },
                    url: {
                        type: "string",
                        format: "uri",
                        description: "Website URL",
                        example: "https://techinsights.com",
                    },
                    category: {
                        type: "string",
                        description: "Website category",
                        example: "blog",
                        nullable: true,
                        enum: [
                            "blog",
                            "article",
                            "search",
                            "ping",
                            "classified",
                            "forum",
                            "bookmarking",
                            "directory",
                            "social_media",
                        ],
                    },
                    login_page: {
                        type: "string",
                        format: "uri",
                        description: "Login page URL",
                        example: "https://techinsights.com/login",
                        nullable: true,
                    },
                    register_page: {
                        type: "string",
                        format: "uri",
                        description: "Register page URL",
                        example: "https://techinsights.com/register",
                        nullable: true,
                    },
                    post_page: {
                        type: "string",
                        format: "uri",
                        description: "Post page URL",
                        example: "https://techinsights.com/wp-admin/post-new.php",
                        nullable: true,
                    },
                    is_verified: {
                        type: "boolean",
                        description: "Whether the website is verified by admin",
                        example: true,
                        nullable: true,
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns this website",
                        example: 123,
                    },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the website was created",
                        example: "2024-08-01T12:00:00.000Z",
                    },
                    updated_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the website was last updated",
                        example: "2024-08-01T12:00:00.000Z",
                    },
                    score: {
                        type: "number",
                        format: "float",
                        description: "Website quality/authority score",
                        example: 8.5,
                        nullable: true,
                    },
                    have_credential: {
                        type: "boolean",
                        description: "Whether the website requires credentials for posting",
                        example: true,
                    },
                    credential_type: {
                        type: "object",
                        description: "Schema defining required credential fields and their types",
                        example: {
                            username: "string",
                            password: "string",
                            api_key: "string",
                        },
                        nullable: true,
                        additionalProperties: {
                            type: "string",
                        },
                    },
                },
            },
            WebsiteCreationRequest: {
                type: "object",
                required: ["user_id", "url", "name"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the website",
                        example: 123,
                    },
                    url: {
                        type: "string",
                        format: "url",
                        description: "Website URL",
                        example: "http://new-example.com",
                    },
                    name: {
                        type: "string",
                        description: "Website name",
                        example: "New Blog",
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "news",
                            "ecommerce",
                            "portfolio",
                            "service",
                            "other",
                        ],
                        description: "Category of the site.",
                        example: "blog",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["active", "inactive", "pending", "suspended"],
                        description: "Status of the website",
                        example: "active",
                        nullable: true,
                    },
                },
            },
            WebsiteUpdateRequest: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        format: "url",
                        description: "Website URL",
                        example: "http://updated-example.com",
                        nullable: true,
                    },
                    name: {
                        type: "string",
                        description: "Website name",
                        example: "Updated Blog",
                        nullable: true,
                    },
                    category: {
                        type: "string",
                        enum: [
                            "blog",
                            "news",
                            "ecommerce",
                            "portfolio",
                            "service",
                            "other",
                        ],
                        description: "Category of the site.",
                        example: "news",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["active", "inactive", "pending", "suspended"],
                        description: "Status of the website",
                        example: "inactive",
                        nullable: true,
                    },
                },
            },
            APIKey: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "API Key ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the API key",
                        example: 123,
                    },
                    key: {
                        type: "string",
                        description: "The API key string",
                        example: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    },
                    name: {
                        type: "string",
                        description: "Name or description of the API key",
                        example: "My App Integration",
                    },
                    permissions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Permissions associated with the API key",
                        example: ["read", "write"],
                    },
                    status: {
                        type: "string",
                        enum: ["active", "inactive", "revoked"],
                        description: "Status of the API key",
                        example: "active",
                    },
                    last_used_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Timestamp of last use",
                    },
                    expires_at: {
                        type: "string",
                        format: "date-time",
                        description: "Updated expiration timestamp for the API key",
                        nullable: true,
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                    credentials: {
                        type: "object",
                        description: "Actual credentials for this API key. Must match the schema defined in the linked website's credential_type.",
                        example: { api_key: "my-key", api_secret: "my-secret" },
                        nullable: true,
                    },
                },
            },
            APIKeyCreationRequest: {
                type: "object",
                required: ["user_id", "name"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the API key",
                        example: 123,
                    },
                    name: {
                        type: "string",
                        description: "Name or description for the new API key",
                        example: "New App Integration",
                    },
                    permissions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Permissions for the API key (defaults to all permissions if not specified)",
                        example: ["read", "write"],
                        nullable: true,
                    },
                    expires_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "Expiration timestamp for the API key",
                    },
                    credentials: {
                        type: "object",
                        description: "Credentials for the API key. Must match the schema defined in the linked website's credential_type.",
                        example: { api_key: "my-key", api_secret: "my-secret" },
                        nullable: true,
                    },
                },
            },
            APIKeyUpdateRequest: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Updated name or description for the API key",
                        example: "Updated App Integration",
                        nullable: true,
                    },
                    permissions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Updated permissions for the API key",
                        example: ["read"],
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["active", "inactive", "revoked"],
                        description: "Updated status of the API key",
                        example: "inactive",
                        nullable: true,
                    },
                    expires_at: {
                        type: "string",
                        format: "date-time",
                        description: "Updated expiration timestamp for the API key",
                        nullable: true,
                    },
                    credentials: {
                        type: "object",
                        description: "Updated credentials for the API key. Must match the schema defined in the linked website's credential_type.",
                        example: { api_key: "my-key", api_secret: "my-secret" },
                        nullable: true,
                    },
                },
            },
            Keyword: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Keyword ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the keyword",
                        example: 123,
                    },
                    keyword_text: {
                        type: "string",
                        description: "The actual keyword string",
                        example: "SEO best practices",
                    },
                    search_volume: {
                        type: "integer",
                        nullable: true,
                        description: "Estimated monthly search volume",
                        example: 1000,
                    },
                    competition: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        nullable: true,
                        description: "Competition level for the keyword",
                        example: "medium",
                    },
                    cpc: {
                        type: "number",
                        format: "float",
                        nullable: true,
                        description: "Cost Per Click (CPC) for the keyword",
                        example: 1.5,
                    },
                    last_updated: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp of last data update",
                        example: "2024-07-29T10:00:00Z",
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            KeywordCreationRequest: {
                type: "object",
                required: ["user_id", "keyword_text"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the keyword",
                        example: 123,
                    },
                    keyword_text: {
                        type: "string",
                        description: "The actual keyword string",
                        example: "new SEO trends",
                    },
                    search_volume: {
                        type: "integer",
                        nullable: true,
                        description: "Estimated monthly search volume",
                        example: 500,
                    },
                    competition: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        nullable: true,
                        description: "Competition level for the keyword",
                        example: "low",
                    },
                    cpc: {
                        type: "number",
                        format: "float",
                        nullable: true,
                        description: "Cost Per Click (CPC) for the keyword",
                        example: 0.75,
                    },
                },
            },
            KeywordUpdateRequest: {
                type: "object",
                properties: {
                    keyword_text: {
                        type: "string",
                        description: "The actual keyword string",
                        example: "updated SEO strategies",
                        nullable: true,
                    },
                    search_volume: {
                        type: "integer",
                        nullable: true,
                        description: "Estimated monthly search volume",
                        example: 1200,
                    },
                    competition: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        nullable: true,
                        description: "Competition level for the keyword",
                        example: "high",
                    },
                    cpc: {
                        type: "number",
                        format: "float",
                        nullable: true,
                        description: "Cost Per Click (CPC) for the keyword",
                        example: 2.0,
                    },
                },
            },
            Ticket: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Ticket ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who created the ticket",
                        example: 123,
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the ticket",
                        example: "Issue with content posting",
                    },
                    description: {
                        type: "string",
                        description: "Full description of the issue",
                        example: "I am unable to post content to my blog due to an API error.",
                    },
                    status: {
                        type: "string",
                        enum: ["open", "in-progress", "resolved", "closed"],
                        description: "Current status of the ticket",
                        example: "open",
                    },
                    priority: {
                        type: "string",
                        enum: ["low", "medium", "high", "urgent"],
                        description: "Priority level of the ticket",
                        example: "high",
                    },
                    assigned_to: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the staff member assigned to the ticket",
                        example: 456,
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            TicketCreationRequest: {
                type: "object",
                required: ["user_id", "subject", "description"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user creating the ticket",
                        example: 123,
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the ticket",
                        example: "New feature request",
                    },
                    description: {
                        type: "string",
                        description: "Detailed description of the request or issue",
                        example: "Please add a feature to schedule content posts monthly.",
                    },
                    priority: {
                        type: "string",
                        enum: ["low", "medium", "high", "urgent"],
                        description: "Priority level of the ticket (defaults to medium).",
                        example: "medium",
                        nullable: true,
                    },
                },
            },
            TicketUpdateRequest: {
                type: "object",
                properties: {
                    subject: {
                        type: "string",
                        description: "Updated subject of the ticket",
                        example: "Resolved: Content Posting Issue",
                        nullable: true,
                    },
                    description: {
                        type: "string",
                        description: "Updated description of the issue",
                        example: "The API error has been resolved.",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["open", "in-progress", "resolved", "closed"],
                        description: "Updated status of the ticket",
                        example: "resolved",
                        nullable: true,
                    },
                    priority: {
                        type: "string",
                        enum: ["low", "medium", "high", "urgent"],
                        description: "Updated priority level of the ticket",
                        example: "low",
                        nullable: true,
                    },
                    assigned_to: {
                        type: "integer",
                        nullable: true,
                        description: "ID of the staff member assigned to the ticket",
                        example: 789,
                    },
                },
            },
            AIUsage: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "AI Usage ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who used the AI service",
                        example: 123,
                    },
                    feature: {
                        type: "string",
                        enum: [
                            "content",
                            "keyword",
                            "website",
                            "ai_chat",
                            "api_key",
                            "rank_tracker",
                            "backlinks",
                            "audit",
                            "competitor_analysis",
                            "content_editor",
                        ],
                        description: "Specific AI feature used (e.g., content generation, keyword analysis)",
                        example: "content_editor",
                    },
                    tokens_used: {
                        type: "integer",
                        description: "Number of AI tokens consumed for the operation",
                        example: 500,
                    },
                    cost: {
                        type: "number",
                        format: "float",
                        description: "Cost incurred for the AI usage",
                        example: 0.05,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the cost",
                        example: "USD",
                    },
                    used_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp of AI usage",
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            AIUsageCreationRequest: {
                type: "object",
                required: ["user_id", "feature", "tokens_used", "cost", "currency"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user who used the AI service",
                        example: 123,
                    },
                    feature: {
                        type: "string",
                        enum: [
                            "content",
                            "keyword",
                            "website",
                            "ai_chat",
                            "api_key",
                            "rank_tracker",
                            "backlinks",
                            "audit",
                            "competitor_analysis",
                            "content_editor",
                        ],
                        description: "Specific AI feature used (e.g., content generation, keyword analysis)",
                        example: "ai_chat",
                    },
                    tokens_used: {
                        type: "integer",
                        description: "Number of AI tokens consumed",
                        example: 200,
                    },
                    cost: {
                        type: "number",
                        format: "float",
                        description: "Cost incurred for the AI usage",
                        example: 0.02,
                    },
                    currency: {
                        type: "string",
                        description: "Currency of the cost",
                        example: "USD",
                    },
                },
            },
            AIUsageUpdateRequest: {
                type: "object",
                properties: {
                    feature: {
                        type: "string",
                        enum: [
                            "content",
                            "keyword",
                            "website",
                            "ai_chat",
                            "api_key",
                            "rank_tracker",
                            "backlinks",
                            "audit",
                            "competitor_analysis",
                            "content_editor",
                        ],
                        description: "Updated AI feature used",
                        example: "keyword",
                        nullable: true,
                    },
                    tokens_used: {
                        type: "integer",
                        description: "Updated number of AI tokens consumed",
                        example: 300,
                        nullable: true,
                    },
                    cost: {
                        type: "number",
                        format: "float",
                        description: "Updated cost incurred for the AI usage",
                        example: 0.03,
                        nullable: true,
                    },
                    currency: {
                        type: "string",
                        description: "Updated currency of the cost",
                        example: "EUR",
                        nullable: true,
                    },
                },
            },
            Inquiry: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Inquiry ID", example: 1 },
                    name: {
                        type: "string",
                        description: "Name of the person making the inquiry",
                        example: "Jane Doe",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "Email of the person making the inquiry",
                        example: "jane.doe@example.com",
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the inquiry",
                        example: "Partnership Opportunity",
                    },
                    message: {
                        type: "string",
                        description: "Detailed message of the inquiry",
                        example: "I am interested in exploring a potential partnership with your company for SEO services.",
                    },
                    status: {
                        type: "string",
                        enum: ["new", "read", "responded", "closed"],
                        description: "Status of the inquiry",
                        example: "new",
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            InquiryCreationRequest: {
                type: "object",
                required: ["name", "email", "subject", "message"],
                properties: {
                    name: {
                        type: "string",
                        description: "Name of the person making the inquiry",
                        example: "John Smith",
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "Email of the person making the inquiry",
                        example: "john.smith@example.com",
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the inquiry",
                        example: "Product Inquiry",
                    },
                    message: {
                        type: "string",
                        description: "Detailed message of the inquiry",
                        example: "I would like to know more about your SEO tools.",
                    },
                },
            },
            InquiryUpdateRequest: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Name of the person making the inquiry",
                        example: "Jane Smith",
                        nullable: true,
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "Email of the person making the inquiry",
                        example: "jane.smith@example.com",
                        nullable: true,
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the inquiry",
                        example: "Regarding my previous inquiry",
                        nullable: true,
                    },
                    message: {
                        type: "string",
                        description: "Updated message of the inquiry",
                        example: "Could you please provide a demo?",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        enum: ["new", "read", "responded", "closed"],
                        description: "Status of the inquiry",
                        example: "read",
                        nullable: true,
                    },
                },
            },
            UsageLog: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Usage Log ID", example: 1 },
                    user_id: {
                        type: "integer",
                        description: "ID of the user associated with the log",
                        example: 123,
                    },
                    feature_name: {
                        type: "string",
                        description: "Name of the feature used",
                        example: "Content Generation",
                    },
                    usage_count: {
                        type: "integer",
                        description: "Number of times the feature was used",
                        example: 10,
                    },
                    log_date: {
                        type: "string",
                        format: "date",
                        description: "Date of the usage log",
                        example: "2024-07-30",
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            UsageLogCreationRequest: {
                type: "object",
                required: ["user_id", "feature_name", "usage_count", "log_date"],
                properties: {
                    user_id: {
                        type: "integer",
                        description: "ID of the user associated with the log",
                        example: 123,
                    },
                    feature_name: {
                        type: "string",
                        description: "Name of the feature used",
                        example: "Keyword Research",
                    },
                    usage_count: {
                        type: "integer",
                        description: "Number of times the feature was used",
                        example: 5,
                    },
                    log_date: {
                        type: "string",
                        format: "date",
                        description: "Date of the usage log",
                        example: "2024-07-30",
                    },
                },
            },
            UsageLogUpdateRequest: {
                type: "object",
                properties: {
                    feature_name: {
                        type: "string",
                        description: "Name of the feature used",
                        example: "Content Editing",
                        nullable: true,
                    },
                    usage_count: {
                        type: "integer",
                        description: "Number of times the feature was used",
                        example: 15,
                        nullable: true,
                    },
                    log_date: {
                        type: "string",
                        format: "date",
                        description: "Date of the usage log",
                        example: "2024-07-31",
                        nullable: true,
                    },
                },
            },
            ArticleType: {
                type: "object",
                properties: {
                    id: { type: "integer", description: "Article type ID", example: 1 },
                    name: {
                        type: "string",
                        description: "Name of the article type",
                        example: "Blog",
                    },
                    description: {
                        type: "string",
                        description: "Description of the article type",
                        example: "A blog post type for long-form content.",
                    },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        example: "2024-08-01T12:00:00Z",
                    },
                    updated_at: {
                        type: "string",
                        format: "date-time",
                        example: "2024-08-01T12:00:00Z",
                    },
                },
                example: {
                    id: 1,
                    name: "Blog",
                    description: "A blog post type for long-form content.",
                    created_at: "2024-08-01T12:00:00Z",
                    updated_at: "2024-08-01T12:00:00Z",
                },
            },
            AIGenerateAllContentRequest: {
                type: "object",
                required: ["title", "keywords"],
                properties: {
                    title: { type: "string", example: "How to Improve SEO in 2024" },
                    keywords: {
                        type: "array",
                        items: { type: "string" },
                        example: [
                            "SEO tips",
                            "Google ranking",
                            "backlinks",
                            "content marketing",
                            "2024 trends",
                        ],
                    },
                    length: {
                        type: "string",
                        enum: ["short", "medium", "long"],
                        example: "medium",
                    },
                    website: { type: "string", example: "https://example.com" },
                },
                example: {
                    title: "How to Improve SEO in 2024",
                    keywords: [
                        "SEO tips",
                        "Google ranking",
                        "backlinks",
                        "content marketing",
                        "2024 trends",
                    ],
                    length: "medium",
                    website: "https://example.com",
                },
            },
            AIGenerateAllContentResponse: {
                type: "object",
                properties: {
                    content: {
                        type: "object",
                        properties: {
                            article: {
                                type: "string",
                                example: "This is a detailed article about improving SEO in 2024...",
                            },
                            blog: {
                                type: "string",
                                example: "Welcome to our blog on SEO trends for 2024...",
                            },
                            classified: {
                                type: "string",
                                example: "Classified ad content for SEO services in 2024...",
                            },
                            bookmarking: {
                                type: "string",
                                example: "Bookmarking content for SEO resources...",
                            },
                            social_media: {
                                type: "string",
                                example: "Social media post about SEO tips...",
                            },
                        },
                    },
                    message: {
                        type: "string",
                        description: "Success message",
                        example: "All content generated successfully",
                    },
                },
            },
            CreatePaymentIntentRequest: {
                type: "object",
                required: ["packageSubscriptionId", "userId"],
                properties: {
                    packageSubscriptionId: {
                        type: "integer",
                        description: "ID of the subscription package",
                        example: 1,
                    },
                    userId: {
                        type: "integer",
                        description: "ID of the user",
                        example: 123,
                    },
                    couponCode: {
                        type: "string",
                        description: "Optional coupon code",
                        example: "SPRING2024",
                        nullable: true,
                    },
                },
            },
            CreatePaymentIntentResponse: {
                type: "object",
                properties: {
                    clientSecret: {
                        type: "string",
                        description: "Stripe client secret",
                        example: "pi_1Hxxxxxxx_secret_xxxxxxxx",
                    },
                    paymentIntentId: {
                        type: "string",
                        description: "Stripe payment intent ID",
                        example: "pi_1Hxxxxxxx",
                    },
                    status: {
                        type: "string",
                        description: "Status of the payment intent",
                        example: "requires_payment_method",
                    },
                },
            },
            VerifyPaymentRequest: {
                type: "object",
                required: ["paymentIntentId"],
                properties: {
                    paymentIntentId: {
                        type: "string",
                        description: "Stripe payment intent ID",
                        example: "pi_1Hxxxxxxx",
                    },
                },
            },
            VerifyPaymentResponse: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Status of the payment",
                        example: "succeeded",
                    },
                    message: {
                        type: "string",
                        description: "Verification message",
                        example: "Payment verified successfully",
                    },
                },
            },
            Campaign: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        description: "Campaign ID",
                        example: 1,
                    },
                    query_id: {
                        type: "string",
                        description: "Query ID associated with the campaign",
                        example: "seo-query-123",
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the campaign",
                        example: 123,
                    },
                    logs: {
                        type: "object",
                        description: "JSON object or array for campaign logs",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        description: "Status of the campaign",
                        enum: ["pending", "completed", "failed"],
                        example: "pending",
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content associated with the campaign",
                        example: 1,
                        nullable: true,
                    },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the campaign was created",
                    },
                    updated_at: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the campaign was last updated",
                    },
                },
            },
            CreateCampaignDto: {
                type: "object",
                required: ["query_id", "user_id"],
                properties: {
                    query_id: {
                        type: "string",
                        description: "Query ID for the campaign",
                        example: "seo-query-123",
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user creating the campaign",
                        example: 123,
                    },
                    logs: {
                        type: "object",
                        description: "Optional logs for the campaign",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        description: "Status of the campaign",
                        enum: ["pending", "completed", "failed"],
                        example: "pending",
                        nullable: true,
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be associated with the campaign",
                        example: 1,
                        nullable: true,
                    },
                },
            },
            UpdateCampaignDto: {
                type: "object",
                properties: {
                    query_id: {
                        type: "string",
                        description: "Query ID for the campaign",
                        example: "seo-query-123",
                        nullable: true,
                    },
                    user_id: {
                        type: "integer",
                        description: "ID of the user who owns the campaign",
                        example: 123,
                        nullable: true,
                    },
                    logs: {
                        type: "object",
                        description: "Optional logs for the campaign",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        description: "Status of the campaign",
                        enum: ["pending", "completed", "failed"],
                        example: "completed",
                        nullable: true,
                    },
                    content_id: {
                        type: "integer",
                        description: "ID of the content to be associated with the campaign",
                        example: 1,
                        nullable: true,
                    },
                },
            },
            SearchCampaignDto: {
                type: "object",
                properties: {
                    query_id: {
                        type: "string",
                        description: "Filter by Query ID",
                        example: "seo-query-123",
                        nullable: true,
                    },
                    user_id: {
                        type: "integer",
                        description: "Filter by User ID",
                        example: 123,
                        nullable: true,
                    },
                    from_date: {
                        type: "string",
                        format: "date",
                        description: "Filter campaigns created from this date (YYYY-MM-DD)",
                        example: "2024-01-01",
                        nullable: true,
                    },
                    to_date: {
                        type: "string",
                        format: "date",
                        description: "Filter campaigns created up to this date (YYYY-MM-DD)",
                        example: "2024-12-31",
                        nullable: true,
                    },
                    status: {
                        type: "string",
                        description: "Filter by campaign status",
                        enum: ["pending", "completed", "failed"],
                        example: "completed",
                        nullable: true,
                    },
                    content_id: {
                        type: "integer",
                        description: "Filter by Content ID",
                        example: 1,
                        nullable: true,
                    },
                },
            },
            ApiKeySearchRequest: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search query",
                        example: "SEO",
                    },
                    userId: {
                        type: "integer",
                        description: "User ID",
                        example: 123,
                    },
                },
            },
            ApiKeySearchResponse: {
                type: "object",
                properties: {
                    apiKeys: {
                        type: "array",
                        items: { $ref: "#/components/schemas/APIKey" },
                    },
                    total: { type: "integer" },
                },
            },
        }, // <-- schemas closing brace
    },
    paths: {
        "/ai/generate-all": {
            post: {
                summary: "Generate content for all platforms using AI",
                description: "Generates content for various platforms including articles, blogs, social media posts, etc.",
                tags: ["AI"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AIGenerateAllContentRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Generated content for all platforms.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AIGenerateAllContentResponse",
                                },
                            },
                        },
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/users": {
            post: {
                summary: "Create a new user",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UserCreationRequest",
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "The created user.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
            get: {
                summary: "Get all users",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "limit",
                        in: "query",
                        description: "Maximum number of users to return",
                        required: false,
                        schema: { type: "integer", default: 10 },
                    },
                    {
                        name: "page",
                        in: "query",
                        description: "Page number",
                        required: false,
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "company_id",
                        in: "query",
                        description: "Filter users by company ID (admin/owner only)",
                        required: false,
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    "200": {
                        description: "A list of users.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/PaginatedUsersResult",
                                },
                            },
                        },
                    },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/users/{id}": {
            get: {
                summary: "Get user by ID",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the user to retrieve",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    "200": {
                        description: "The user object.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
            put: {
                summary: "Update an existing user",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the user to update",
                        schema: { type: "integer" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UserProfileUpdateRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "The updated user.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
            delete: {
                summary: "Delete a user",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "ID of the user to delete",
                        schema: { type: "integer" },
                    },
                ],
                responses: {
                    "204": { description: "User deleted successfully." },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "403": { $ref: "#/components/responses/Forbidden" },
                    "404": { $ref: "#/components/responses/NotFound" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/users/login": {
            post: {
                summary: "User login",
                tags: ["Users"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UserLoginRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login successful.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/users/logout": {
            post: {
                summary: "User logout",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Logout successful.",
                    },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/users/profile": {
            get: {
                summary: "Get user profile",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "User profile retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
            put: {
                summary: "Update user profile",
                tags: ["Users"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UserProfileUpdateRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "User profile updated successfully.",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User",
                                },
                            },
                        },
                    },
                    "400": { $ref: "#/components/responses/BadRequest" },
                    "401": { $ref: "#/components/responses/Unauthorized" },
                    "500": { $ref: "#/components/responses/InternalServerError" },
                },
            },
        },
        "/api-keys/search": {
            get: {
                summary: "Search API keys",
                description: "OWNER and ADMIN can search all API keys. USER can only search their own API keys.",
                tags: ["API Keys"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "user_id",
                        in: "query",
                        description: "User ID (OWNER/ADMIN only; ignored for USER)",
                        schema: { type: "integer" },
                        required: false,
                    },
                    {
                        name: "company_id",
                        in: "query",
                        description: "Company ID (OWNER/ADMIN only)",
                        schema: { type: "integer" },
                        required: false,
                    },
                    {
                        name: "website_id",
                        in: "query",
                        description: "Website ID",
                        schema: { type: "integer" },
                        required: false,
                    },
                    {
                        name: "name",
                        in: "query",
                        description: "API key name (partial match)",
                        schema: { type: "string" },
                        required: false,
                    },
                    {
                        name: "status",
                        in: "query",
                        description: "API key status (pending, active, revoked)",
                        schema: {
                            type: "string",
                            enum: ["pending", "active", "revoked"],
                        },
                        required: false,
                    },
                    {
                        name: "limit",
                        in: "query",
                        description: "Number of results per page",
                        schema: { type: "integer", default: 10 },
                        required: false,
                    },
                    {
                        name: "offset",
                        in: "query",
                        description: "Offset for pagination",
                        schema: { type: "integer", default: 0 },
                        required: false,
                    },
                    {
                        name: "order_by",
                        in: "query",
                        description: "Order by field",
                        schema: { type: "string" },
                        required: false,
                    },
                    {
                        name: "order_direction",
                        in: "query",
                        description: "Order direction (asc, desc)",
                        schema: { type: "string", enum: ["asc", "desc"] },
                        required: false,
                    },
                ],
                responses: {
                    200: {
                        description: "A paginated list of API keys matching the search criteria.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        apiKeys: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/APIKey" },
                                        },
                                        total: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: "Unauthorized." },
                    403: { description: "Forbidden." },
                    400: { description: "Invalid input." },
                },
            },
        },
    },
};
exports.swaggerUiOptions = {
    customCssUrl: "/swagger-custom.css",
    customSiteTitle: "SEO App API Documentation",
    customfavIcon: "/logo.png",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js",
    ],
    customJsStr: `
    // Enhanced Swagger UI functionality
    document.addEventListener('DOMContentLoaded', function() {
      // Add loading animation
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64b5f6;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 1rem;">Loading API Documentation...</p></div>';
      document.body.appendChild(loadingDiv);

      // Remove loading after Swagger loads
      setTimeout(() => {
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
      }, 2000);

      // Hide the default Swagger UI topbar
      const topbar = document.querySelector('.swagger-ui .topbar');
      if (topbar) {
        topbar.style.display = 'none';
      }

      // Enhance filter functionality
      setTimeout(function() {
        const filterInput = document.querySelector('.swagger-ui .filter input');
        if (filterInput) {
          filterInput.placeholder = '🔍 Search endpoints...';
          filterInput.style.display = 'block';
          filterInput.style.visibility = 'visible';
          filterInput.style.opacity = '1';
        }

        // Ensure filter container is visible
        const filterContainer = document.querySelector('.swagger-ui .filter-container');
        if (filterContainer) {
          filterContainer.style.display = 'block';
          filterContainer.style.visibility = 'visible';
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          // Ctrl/Cmd + K to focus search
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (filterInput) {
              filterInput.focus();
            }
          }

          // Escape to clear search
          if (e.key === 'Escape' && document.activeElement === filterInput) {
            filterInput.value = '';
            filterInput.dispatchEvent(new Event('input'));
          }
        });

        // Add expand/collapse all functionality
        const infoContainer = document.querySelector('.swagger-ui .info');
        if (infoContainer) {
          const controlsDiv = document.createElement('div');
          controlsDiv.style.cssText = 'margin: 1rem 0; text-align: center;';
          controlsDiv.innerHTML = \`
            <button id="expand-all" style="margin: 0 0.5rem; padding: 0.5rem 1rem; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              <i class="fas fa-expand-arrows-alt"></i> Expand All
            </button>
            <button id="collapse-all" style="margin: 0 0.5rem; padding: 0.5rem 1rem; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              <i class="fas fa-compress-arrows-alt"></i> Collapse All
            </button>
          \`;
          infoContainer.appendChild(controlsDiv);

          // Add event listeners for expand/collapse
          document.getElementById('expand-all')?.addEventListener('click', function() {
            document.querySelectorAll('.swagger-ui .opblock').forEach(block => {
              if (!block.classList.contains('is-open')) {
                const summary = block.querySelector('.opblock-summary');
                if (summary) summary.click();
              }
            });
          });

          document.getElementById('collapse-all')?.addEventListener('click', function() {
            document.querySelectorAll('.swagger-ui .opblock.is-open').forEach(block => {
              const summary = block.querySelector('.opblock-summary');
              if (summary) summary.click();
            });
          });
        }
      }, 1500);
    });
  `,
    swaggerOptions: {
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: [
            "get",
            "post",
            "put",
            "delete",
            "patch",
            "head",
            "options",
        ],
        validatorUrl: null,
        persistAuthorization: true,
        requestInterceptor: (req) => {
            // Simple request interceptor without complex async operations
            req.headers = req.headers || {};
            req.headers["X-API-Client"] = "Swagger-UI";
            req.headers["X-Request-ID"] = `req_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            // Add timestamp for performance monitoring
            req.timestamp = Date.now();
            // Log request for debugging
            console.log("API Request:", {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body,
            });
            return req;
        },
        responseInterceptor: (res) => {
            // Calculate request duration
            if (res.req && res.req.timestamp) {
                const duration = Date.now() - res.req.timestamp;
                console.log(`Request completed in ${duration}ms`);
            }
            // Log responses for debugging
            console.log("API Response:", {
                status: res.status,
                statusText: res.statusText,
                url: res.url,
            });
            // Handle common error responses
            if (res.status >= 400) {
                console.warn("API Error Response:", {
                    status: res.status,
                    statusText: res.statusText,
                    url: res.url,
                });
            }
            return res;
        },
        onComplete: () => {
            console.log("Swagger UI loaded successfully");
        },
        onFailure: (error) => {
            console.error("Swagger UI failed to load:", error);
        },
        layout: "BaseLayout",
        deepLinking: true,
        displayOperationId: false,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        defaultModelRendering: "example",
        displayRequestDuration: true,
        maxDisplayedTags: 50,
        showExtensions: true,
        useUnsafeMarkdown: false,
        syntaxHighlight: {
            activated: true,
            theme: "tomorrow-night",
        },
        requestSnippetsEnabled: false,
    },
    explorer: true,
};
const swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: swaggerOptions.definition,
    apis: ["./src/routes/v1/*.ts"],
});
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.config.js.map