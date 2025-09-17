import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { env } from "./config/env";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import basicAuth from "basic-auth";
import { BULLMQ_DASH_USER, BULLMQ_DASH_PASS } from "./config/env";
import authRoutes from "./routes/v1/auth.route";
import userRoutes from "./routes/v1/user.route";
import caseRoutes from "./routes/v1/case.route";
import planRoutes from "./routes/v1/plan.route";
import subscriptionRoutes from "./routes/v1/subscription.route";
import adminRoutes from "./routes/v1/admin.route";
import mailRoutes from "./routes/v1/mail.route";
import razorPaymentRoutes from "./routes/v1/razorPayment.route";
import razorWebhookRoutes from "./routes/v1/razorWebhook.route";

dotenv.config();
const app: Express = express();
const port = env.PORT;

// Razorpay webhook raw body parser - ONLY apply to the webhook route
app.use(
  "/api/v1/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorWebhookRoutes
);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "1mb" })); // Enable JSON body parser

// Serve static files from the 'public' directory
app.use(express.static("src/public"));

// Import routes

// Register routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cases", caseRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/mail", mailRoutes);
app.use("/api/v1/razorpay", razorPaymentRoutes);

// Rate limiting for API endpoints
// app.use("/api", rateLimitMiddleware(1000, 15)); // Apply to all /api routes

// Serve Swagger UI at /api-docs with custom CSS
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, swaggerUiOptions)
// );

// Serve raw OpenAPI JSON for external/standalone UI consumers
// app.get("/api-docs.json", (_req: Request, res: Response) => {
//   res.json(swaggerSpec);
// });

function bullBoardAuth(req: Request, res: Response, next: NextFunction) {
  const user = basicAuth(req);
  if (
    !user ||
    user.name !== BULLMQ_DASH_USER ||
    user.pass !== BULLMQ_DASH_PASS
  ) {
    res.set("WWW-Authenticate", 'Basic realm="BullMQ Dashboard"');
    return res.status(401).send("Authentication required.");
  }
  next();
}

// BullMQ Dashboard setup
// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath("/bull-mq");
// createBullBoard({
//   queues: [new BullMQAdapter(soon)],
//   serverAdapter,
// });
// app.use("/bull-mq", bullBoardAuth, serverAdapter.getRouter());

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

// Generic error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log the error stack for debugging
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if (env.NODE_ENV === "development") {
    console.log(
      `Swagger API docs available at http://localhost:${port}/api-docs`
    );
  }
  // Log if email service is not fully configured for production/staging
  if (
    (env.NODE_ENV === "production" || env.NODE_ENV === "staging") &&
    (!env.EMAIL_HOST ||
      !env.EMAIL_USER ||
      !env.EMAIL_PASS ||
      !env.DEFAULT_EMAIL_FROM)
  ) {
    console.warn(
      "Warning: Email service (Nodemailer) is not fully configured with host, user, pass, or FROM address. Email notifications may fail if uncommented and used."
    );
  }
});

export default app;
