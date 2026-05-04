import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  requestEmailVerification,
  resetPassword,
  verifyEmail
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema } from "../validations/schemas";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/verify-email/request", protect, requestEmailVerification);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;
