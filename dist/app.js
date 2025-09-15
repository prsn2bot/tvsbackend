"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const basic_auth_1 = __importDefault(require("basic-auth"));
const env_2 = require("./config/env");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = env_1.env.PORT;
// Razorpay webhook raw body parser - ONLY apply to the webhook route
// app.use(
//   "/api/razorpay-webhook",
//   express.raw({ type: "application/json" }),
//   razorWebhookRoutes
// );
// Middleware
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use(express_1.default.json({ limit: "1mb" })); // Enable JSON body parser
// Serve static files from the 'public' directory
app.use(express_1.default.static("src/public"));
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
function bullBoardAuth(req, res, next) {
    const user = (0, basic_auth_1.default)(req);
    if (!user ||
        user.name !== env_2.BULLMQ_DASH_USER ||
        user.pass !== env_2.BULLMQ_DASH_PASS) {
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
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
// Generic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res
        .status(500)
        .json({ message: "Something went wrong!", error: err.message });
});
// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    if (env_1.env.NODE_ENV === "development") {
        console.log(`Swagger API docs available at http://localhost:${port}/api-docs`);
    }
    // Log if email service is not fully configured for production/staging
    if ((env_1.env.NODE_ENV === "production" || env_1.env.NODE_ENV === "staging") &&
        (!env_1.env.EMAIL_HOST ||
            !env_1.env.EMAIL_USER ||
            !env_1.env.EMAIL_PASS ||
            !env_1.env.DEFAULT_EMAIL_FROM)) {
        console.warn("Warning: Email service (Nodemailer) is not fully configured with host, user, pass, or FROM address. Email notifications may fail if uncommented and used.");
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map