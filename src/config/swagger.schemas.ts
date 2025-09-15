export const schemas = {
  // Authentication Schemas
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", minLength: 6, example: "password123" },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      token: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: { $ref: "#/components/schemas/User" },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["email", "password", "first_name"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "newuser@example.com",
      },
      password: { type: "string", minLength: 6, example: "password123" },
      first_name: { type: "string", example: "John" },
      last_name: { type: "string", example: "Doe" },
    },
  },

  // Campaign Schemas
  Campaign: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      query_id: { type: "string", example: "cmp-2024-001" },
      user_id: { type: "integer", example: 101 },
      name: { type: "string", example: "Summer SEO Campaign" },
      description: {
        type: "string",
        example: "Comprehensive SEO campaign for summer products",
      },
      status: {
        type: "string",
        enum: ["active", "paused", "completed"],
        example: "active",
      },
      budget: { type: "number", example: 1500.0 },
      start_date: { type: "string", format: "date", example: "2024-06-01" },
      end_date: { type: "string", format: "date", example: "2024-08-31" },
      logs: {
        type: "object",
        example: { action: "created", details: "Initial campaign setup" },
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  CampaignCreateRequest: {
    type: "object",
    required: ["name", "user_id"],
    properties: {
      name: { type: "string", example: "New SEO Campaign" },
      description: { type: "string", example: "Campaign description" },
      user_id: { type: "integer", example: 101 },
      budget: { type: "number", example: 1000.0 },
      start_date: { type: "string", format: "date", example: "2024-06-01" },
      end_date: { type: "string", format: "date", example: "2024-08-31" },
    },
  },
  CampaignUpdateRequest: {
    type: "object",
    properties: {
      query_id: { type: "string", example: "cmp-2024-001" },
      user_id: { type: "integer", example: 101 },
      logs: {
        type: "object",
        example: { action: "updated", details: "Changed details" },
        nullable: true,
      },
    },
  },

  // Dashboard Schemas
  DashboardStats: {
    type: "object",
    properties: {
      totalUsers: { type: "integer", example: 1250 },
      totalCompanies: { type: "integer", example: 85 },
      totalCampaigns: { type: "integer", example: 342 },
      totalRevenue: { type: "number", example: 45678.9 },
      activeSubscriptions: { type: "integer", example: 78 },
      monthlyGrowth: { type: "number", example: 12.5 },
      topKeywords: {
        type: "array",
        items: {
          type: "object",
          properties: {
            keyword: { type: "string", example: "SEO optimization" },
            searches: { type: "integer", example: 1250 },
            difficulty: { type: "integer", example: 65 },
          },
        },
      },
      recentActivity: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string", example: "Campaign created" },
            user: { type: "string", example: "John Doe" },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2024-06-01T12:00:00Z",
            },
          },
        },
      },
    },
  },
  DashboardAdmin: {
    type: "object",
    properties: {
      totalUsers: { type: "number", example: 100 },
      totalCampaigns: { type: "number", example: 250 },
      totalKeywords: { type: "number", example: 500 },
      totalSubscriptions: { type: "number", example: 75 },
      totalWebsites: { type: "number", example: 120 },
      allCampaigns: { type: "array", items: { type: "object" } },
      allKeywords: { type: "array", items: { type: "object" } },
      allSubscriptions: { type: "array", items: { type: "object" } },
      allWebsites: { type: "array", items: { type: "object" } },
    },
  },
  DashboardUser: {
    type: "object",
    properties: {
      userCampaigns: { type: "array", items: { type: "object" } },
      userKeywords: { type: "array", items: { type: "object" } },
      contentGenerationTrend: { type: "array", items: { type: "object" } },
      userSubscriptionDetails: { type: "object" },
    },
  },
  SendOtpResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "OTP sent successfully" },
    },
  },
  SendUpdateMailRequest: {
    type: "object",
    properties: {
      to: { type: "string", example: "user@example.com" },
      userName: { type: "string", example: "John Doe" },
      updateDetails: {
        type: "string",
        example: "Your profile has been updated.",
      },
      actionLink: { type: "string", example: "https://example.com/profile" },
    },
  },
  SendUpdateMailResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Update email sent successfully" },
    },
  },
  SendNotificationMailRequest: {
    type: "object",
    properties: {
      to: { type: "string", example: "user@example.com" },
      userName: { type: "string", example: "John Doe" },
      notificationSubject: { type: "string", example: "New Feature Alert" },
      notificationBody: {
        type: "string",
        example: "We have a new feature for you to check out!",
      },
      actionLink: { type: "string", example: "https://example.com/features" },
      actionText: { type: "string", example: "Check it out" },
    },
  },
  SendNotificationMailResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Notification email sent successfully",
      },
    },
  },
  VerifyOtpRequest: {
    type: "object",
    properties: {
      email: { type: "string", example: "user@example.com" },
      otp: { type: "string", example: "123456" },
    },
  },
  VerifyOtpResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "OTP verified successfully" },
    },
  },
  Ticket: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      subject: { type: "string", example: "Login Issue" },
      description: {
        type: "string",
        example: "I am unable to login to my account.",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        example: "high",
      },
      status: {
        type: "string",
        enum: ["open", "in_progress", "resolved", "closed"],
        example: "open",
      },
      email_id: { type: "string", example: "user@example.com" },
      user_id: { type: "integer", example: 1 },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  TicketComment: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      ticket_id: { type: "integer", example: 1 },
      user_id: { type: "integer", example: 1 },
      comment: { type: "string", example: "We are looking into this issue." },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  UserUsageSummary: {
    type: "object",
    properties: {
      user_id: { type: "integer", example: 1 },
      company_id: { type: "integer", example: 1 },
      subscription_limits: { type: "object" },
      current_usage: { type: "object" },
      usage_percentage: { type: "object" },
      last_updated: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  UsageAnalytics: {
    type: "object",
    properties: {
      period: {
        type: "string",
        enum: ["daily", "weekly", "monthly"],
        example: "daily",
      },
      data: { type: "array", items: { type: "object" } },
    },
  },
  ResourceUsage: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      user_id: { type: "integer", example: 1 },
      resource_type: { type: "string", example: "keywords" },
      usage_count: { type: "integer", example: 10 },
      date: { type: "string", format: "date", example: "2024-06-01" },
    },
  },

  // Mail Schemas
  SendOTPRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
    },
  },
  VerifyOTPRequest: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      otp: { type: "string", example: "123456" },
    },
  },
  MailResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "OTP sent successfully" },
    },
  },

  // Webhook Schemas
  Webhook: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      url: {
        type: "string",
        format: "uri",
        example: "https://api.example.com/webhook",
      },
      events: {
        type: "array",
        items: { type: "string" },
        example: ["user.created", "campaign.completed"],
      },
      secret: { type: "string", example: "webhook_secret_key" },
      active: { type: "boolean", example: true },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  WebhookCreateRequest: {
    type: "object",
    required: ["url", "events"],
    properties: {
      url: {
        type: "string",
        format: "uri",
        example: "https://api.example.com/webhook",
      },
      events: {
        type: "array",
        items: { type: "string" },
        example: ["user.created", "campaign.completed"],
      },
      secret: { type: "string", example: "webhook_secret_key" },
    },
  },

  // Queue Management Schemas
  QueueJob: {
    type: "object",
    properties: {
      id: { type: "string", example: "job_12345" },
      name: { type: "string", example: "process-content" },
      data: { type: "object", example: { contentId: 123, userId: 456 } },
      status: {
        type: "string",
        enum: ["waiting", "active", "completed", "failed", "delayed"],
        example: "active",
      },
      progress: { type: "integer", minimum: 0, maximum: 100, example: 75 },
      attempts: { type: "integer", example: 1 },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      processed_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:05:00Z",
      },
      failed_reason: { type: "string", example: "Network timeout" },
    },
  },
  QueueStats: {
    type: "object",
    properties: {
      waiting: { type: "integer", example: 15 },
      active: { type: "integer", example: 3 },
      completed: { type: "integer", example: 1250 },
      failed: { type: "integer", example: 12 },
      delayed: { type: "integer", example: 5 },
    },
  },

  // Common Response Schemas
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
      data: { type: "object" },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "An error occurred" },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          details: { type: "string", example: "Invalid input provided" },
        },
      },
    },
  },
  ValidationErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", example: "email" },
            message: { type: "string", example: "Email is required" },
          },
        },
      },
    },
  },
  PaginatedResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "array", items: { type: "object" } },
      pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
          totalPages: { type: "integer", example: 10 },
          hasNext: { type: "boolean", example: true },
          hasPrev: { type: "boolean", example: false },
        },
      },
    },
  },

  // Payment Schemas
  PaymentIntentRequest: {
    type: "object",
    required: ["amount", "currency"],
    properties: {
      amount: {
        type: "integer",
        example: 2999,
        description: "Amount in cents",
      },
      currency: { type: "string", example: "usd" },
      description: { type: "string", example: "SEO Pro Plan - Monthly" },
      metadata: {
        type: "object",
        example: { userId: 123, planId: "pro-monthly" },
      },
    },
  },
  PaymentIntentResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      clientSecret: { type: "string", example: "pi_1234567890_secret_abcdef" },
      paymentIntentId: { type: "string", example: "pi_1234567890" },
    },
  },

  DailyFeatureUsage: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      user_id: { type: "integer", example: 1 },
      feature_type: { type: "string", example: "article_generation_limit" },
      usage_count: { type: "integer", example: 5 },
      date: { type: "string", format: "date", example: "2024-06-01" },
    },
  },
  CreatePaymentIntentRequest: {
    type: "object",
    properties: {
      packageSubscriptionId: { type: "integer", example: 1 },
      userId: { type: "integer", example: 1 },
    },
  },
  CreatePaymentIntentResponse: {
    type: "object",
    properties: {
      clientSecret: { type: "string", example: "pi_123..." },
    },
  },
  VerifyPaymentRequest: {
    type: "object",
    properties: {
      paymentIntentId: { type: "string", example: "pi_123..." },
    },
  },
  VerifyPaymentResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Payment verified successfully" },
    },
  },
  AdminAssignSubscriptionRequest: {
    type: "object",
    properties: {
      user_email: { type: "string", example: "user@example.com" },
      package_id: { type: "integer", example: 1 },
      type: {
        type: "string",
        enum: ["reseller", "individual", "agency", "under-reseller"],
        example: "individual",
      },
      quantity: { type: "integer", example: 1 },
      quantity_used: { type: "integer", example: 0 },
      company_id: { type: "integer", example: 1 },
      coupon_code: { type: "string", example: "SAVE20" },
      duration_days: { type: "integer", example: 30 },
      notes: { type: "string", example: "Assigned for project X" },
      assigned_by: { type: "integer", example: 1 },
    },
  },
  Subscription: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      user_id: { type: "integer", example: 1 },
      package_id: { type: "integer", example: 1 },
      company_id: { type: "integer", example: 1 },
      status: {
        type: "string",
        enum: ["active", "expired", "cancelled", "pending", "trial"],
        example: "active",
      },
      starts_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      expires_at: {
        type: "string",
        format: "date-time",
        example: "2024-07-01T12:00:00Z",
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  SubscriptionStatus: {
    type: "string",
    enum: ["active", "expired", "cancelled", "pending", "trial"],
  },
  SubscriptionType: {
    type: "string",
    enum: ["reseller", "individual", "agency", "under-reseller", "admin"],
  },
  UpdateSubscriptionRequest: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["active", "expired", "cancelled", "pending", "trial"],
        example: "active",
      },
      expires_at: {
        type: "string",
        format: "date-time",
        example: "2024-08-01T12:00:00Z",
      },
    },
  },
  CreateSubscriptionPackageRequest: {
    type: "object",
    properties: {
      package_name: { type: "string", example: "basic-plan" },
      title: { type: "string", example: "Basic Plan" },
      description: { type: "string", example: "Entry-level SEO tools" },
      price: { type: "number", example: 9.99 },
      renewal_price: { type: "number", example: 8.99 },
      duration_days: { type: "integer", example: 30 },
      max_users: { type: "integer", example: 1 },
      max_keywords: { type: "integer", example: 50 },
      max_api_keys: { type: "integer", example: 10 },
      max_teams: { type: "integer", example: 1 },
      sites_details: { type: "array", items: { type: "object" } },
      keyword_suggestions_limit: { type: "integer", example: 100 },
      support_type: { type: "string", example: "email" },
      package_type: { type: "string", example: "individual" },
      subscription_quantity: { type: "integer", example: 1 },
      expire_at: { type: "string", format: "date-time", nullable: true },
      created_by: { type: "integer", example: 101 },
    },
  },
  UpdateSubscriptionPackageRequest: {
    type: "object",
    properties: {
      price: { type: "number", example: 249.99 },
      description: {
        type: "string",
        example: "Updated description for advanced features.",
      },
    },
  },
  Team: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Development Team" },
      company_id: { type: "integer", example: 1 },
      description: {
        type: "string",
        example: "Team responsible for software development.",
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-06-01T12:00:00Z",
      },
    },
  },
  CreateTeamInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Development Team" },
      company_id: { type: "integer", example: 1 },
      description: {
        type: "string",
        example: "Team responsible for software development.",
      },
    },
  },
  UpdateTeamInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Revised Marketing Team" },
      description: {
        type: "string",
        example: "Handles all digital marketing efforts.",
      },
    },
  },
  CreateWebsiteDto: {
    type: "object",
    properties: {
      name: { type: "string", example: "Tech Insights Blog" },
      url: { type: "string", example: "https://techinsights.com" },
      category: { type: "string", example: "blog" },
      description: {
        type: "string",
        example:
          "A technology blog covering latest trends in AI, web development, and digital innovation",
      },
    },
  },
  UpdateWebsiteDto: {
    type: "object",
    properties: {
      name: { type: "string", example: "Tech Insights Blog" },
      url: { type: "string", example: "https://techinsights.com" },
      category: { type: "string", example: "blog" },
      description: {
        type: "string",
        example:
          "A technology blog covering latest trends in AI, web development, and digital innovation",
      },
      is_verified: { type: "boolean", example: true },
      score: { type: "number", example: 9.5 },
    },
  },
};
