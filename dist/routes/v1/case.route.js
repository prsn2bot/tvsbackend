"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimitMiddleware_1 = __importDefault(require("../../middleware/rateLimitMiddleware"));
const subscriptionFeature_middleware_1 = __importDefault(require("../../middleware/subscriptionFeature.middleware"));
const case_controller_1 = require("../../controllers/v1/case.controller");
const router = express_1.default.Router();
// POST / - Create a new case
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["officer"]), (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, case_controller_1.CaseController.createCase);
// GET / - Get my cases with filters
router.get("/", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, case_controller_1.CaseController.getCases);
// GET /:caseId - Get a specific case
router.get("/:caseId", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, case_controller_1.CaseController.getCaseById);
// POST /:caseId/documents - Add a document to a case
router.post("/:caseId/documents", auth_middleware_1.authenticate, (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, case_controller_1.CaseController.addDocument);
// POST /:caseId/review - Submit a review
router.post("/:caseId/review", auth_middleware_1.authenticate, (0, auth_middleware_1.hasRole)(["cvo", "legal_board"]), (0, rateLimitMiddleware_1.default)(), subscriptionFeature_middleware_1.default, case_controller_1.CaseController.submitReview);
exports.default = router;
//# sourceMappingURL=case.route.js.map