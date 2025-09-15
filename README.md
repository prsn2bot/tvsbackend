# SEO Application Backend

A comprehensive SEO management platform backend built with Node.js, Express, TypeScript, and PostgreSQL. This application provides content generation, website management, subscription handling, and automated posting capabilities.

## 🚀 Features

### Core Features

- **User Management**: Multi-role authentication (Owner, Admin, Reseller, Agency, User)
- **Company & Team Management**: Hierarchical organization structure
- **Website Management**: Multi-category website support with credential management
- **Content Generation**: AI-powered content creation for multiple formats
- **Subscription Management**: Flexible subscription packages with usage tracking
- **Payment Processing**: Stripe integration for subscription payments
- **API Key Management**: Secure credential storage and validation
- **Queue Management**: Background job processing with BullMQ
- **Email System**: Automated email notifications and templates
- **Usage Analytics**: Comprehensive usage tracking and limits
- **Ticket System**: Customer support and inquiry management

### Content Features

- **AI Content Generation**: Blog posts, articles, classified ads, social media posts
- **Multi-format Support**: Blog, article, search, ping, classified, forum, bookmarking, directory, social media
- **Scheduled Posting**: Automated content posting with scheduling
- **Keyword Management**: SEO keyword tracking and optimization
- **Campaign Management**: Content campaign creation and tracking

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Database Migrations**: Automated schema management
- **Background Jobs**: Redis-based job queue system
- **Caching**: Node-cache for performance optimization
- **Logging**: Winston-based structured logging
- **Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting and usage tracking

## 🏗️ Project Structure

```
seo/
├── src/
│   ├── config/               # Application configuration
│   │   ├── ai.ts            # AI service configuration
│   │   ├── bull.config.ts   # Queue configuration
│   │   ├── database.ts      # Database connection
│   │   ├── email.ts         # Email configuration
│   │   ├── env.ts           # Environment variables
│   │   ├── redis.ts         # Redis configuration
│   │   ├── stripe.ts        # Payment configuration
│   │   └── swagger.config.ts # API documentation
│   ├── controllers/v1/      # API route handlers
│   │   ├── aiController.ts           # AI content generation
│   │   ├── apiKey.controller.ts      # API key management
│   │   ├── campaign.controller.ts    # Campaign management
│   │   ├── company.controller.ts     # Company management
│   │   ├── content.controller.ts     # Content management
│   │   ├── contentPost.controller.ts # Content posting
│   │   ├── coupon.controller.ts      # Coupon management
│   │   ├── dashboardController.ts    # Dashboard analytics
│   │   ├── inquiryController.ts      # Customer inquiries
│   │   ├── keyword.controller.ts     # Keyword management
│   │   ├── mail.controller.ts        # Email management
│   │   ├── payment.controller.ts     # Payment processing
│   │   ├── queueManagement.controller.ts # Queue management
│   │   ├── subscription.controller.ts     # Subscription management
│   │   ├── subscriptionPackage.controller.ts # Package management
│   │   ├── team.controller.ts        # Team management
│   │   ├── ticket.controller.ts      # Support tickets
│   │   ├── usage.controller.ts       # Usage tracking
│   │   ├── userController.ts         # User management
│   │   ├── webhook.controller.ts     # Webhook handling
│   │   └── website.controller.ts     # Website management
│   ├── db/                  # Database management
│   │   ├── migrations/      # Database migration files
│   │   └── migrate.ts       # Migration runner
│   ├── jobs/                # Background job definitions
│   │   ├── generateAllContent.job.ts
│   │   ├── postScheduledContent.job.ts
│   │   └── subscriptionStatus.job.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts                 # Authentication middleware
│   │   ├── rateLimitMiddleware.ts  # Rate limiting
│   │   ├── subscriptionFeature.middleware.ts # Feature access
│   │   └── usageTracking.middleware.ts # Usage tracking
│   ├── models/              # Data models
│   │   ├── apiKey.model.ts
│   │   ├── campaign.model.ts
│   │   ├── company.model.ts
│   │   ├── content.model.ts
│   │   ├── contentPost.model.ts
│   │   ├── coupon.model.ts
│   │   ├── inquiry.model.ts
│   │   ├── keyword.model.ts
│   │   ├── subscription.model.ts
│   │   ├── subscriptionPackage.model.ts
│   │   ├── team.model.ts
│   │   ├── ticket.model.ts
│   │   ├── usage.model.ts
│   │   ├── user.ts
│   │   └── website.model.ts
│   ├── routes/v1/           # API route definitions
│   ├── services/            # Business logic services
│   │   ├── queueServices/   # Queue-related services
│   │   └── [service files]  # All service implementations
│   ├── templates/           # Email templates
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── app.ts               # Main application entry point
├── scripts/                 # Utility scripts
├── public/                  # Static files
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Prerequisites

- **Node.js** (version 18.x or later)
- **PostgreSQL** (version 12 or later)
- **Redis** (for job queues and caching)
- **npm** or **Yarn**

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd seo
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-very-strong-jwt-secret-key
JWT_EXPIRES_IN=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Configuration (Google Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Email Templates
EMAIL_TEMPLATES_PATH=src/templates
```

### 3. Database Setup

```bash
# Run database migrations
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📚 API Documentation

Access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Base URL**: `http://localhost:3000/api/v1`

### Key API Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

#### User Management

- `GET /users` - Get users (Admin/Owner)
- `POST /users` - Create user (Admin)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin)

#### Website Management

- `GET /websites` - Get websites
- `POST /websites` - Create website
- `PUT /websites/:id` - Update website
- `DELETE /websites/:id` - Delete website

#### Content Generation

- `POST /ai/generate-article` - Generate article content
- `POST /ai/generate-all-content` - Generate multiple content types

#### Subscription Management

- `GET /subscriptions` - Get subscriptions
- `POST /subscriptions` - Create subscription
- `PUT /subscriptions/:id` - Update subscription

#### API Keys

- `GET /api-keys` - Get API keys
- `POST /api-keys` - Create API key
- `PUT /api-keys/:id` - Update API key
- `DELETE /api-keys/:id` - Delete API key

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Database
npm run migrate      # Run database migrations

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm test            # Run tests

# Queue Management
# Access Bull Board at http://localhost:3000/admin/queues
```

## 🔧 Configuration

### Database Migrations

The application uses a custom migration system. Migration files are in `src/db/migrations/` and follow the naming convention: `YYYYMMDDHHMMSS_description.sql`

### Queue Management

- **Bull Board**: Access queue dashboard at `/admin/queues`
- **Redis**: Required for job queues and caching
- **Jobs**: Background tasks for content generation and posting

### Email Templates

Email templates are stored in `src/templates/` and include:

- Welcome emails
- Password reset
- OTP verification
- Notification emails

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions
- **API Rate Limiting**: Prevents abuse
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Cross-origin request handling

## 📊 Monitoring & Analytics

- **Usage Tracking**: Comprehensive usage analytics
- **Subscription Limits**: Feature access control
- **Activity Logging**: User action tracking
- **Error Logging**: Winston-based structured logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api-docs`
- Review the logs for error details
- Contact the development team

---

**Note**: This is a production-ready SEO management platform with comprehensive features for content generation, website management, and subscription handling.
