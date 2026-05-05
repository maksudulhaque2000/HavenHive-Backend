import crypto from "crypto";
import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/token";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService";

const sanitizeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  wishlist: user.wishlist,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const createActionToken = () => crypto.randomBytes(32).toString("hex");

const hashActionToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const verificationToken = createActionToken();
  const user = await User.create({
    name,
    email,
    password,
    phone,
    emailVerificationTokenHash: hashActionToken(verificationToken),
    emailVerificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  const token = signToken({ id: String(user._id), role: user.role });

  void sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({
    success: true,
    token,
    verificationToken,
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isBlocked) {
    throw new AppError("Your account has been blocked. Please contact support.", 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: String(user._id), role: user.role });
  res.json({ success: true, token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export const requestEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const verificationToken = createActionToken();
  user.emailVerificationTokenHash = hashActionToken(verificationToken);
  user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  void sendVerificationEmail(user.email, verificationToken);

  res.json({ success: true, verificationToken });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const tokenHash = hashActionToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationTokenExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError("Verification token is invalid or expired", 400);
  }

  user.isVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationTokenExpiresAt = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = createActionToken();
  user.passwordResetTokenHash = hashActionToken(resetToken);
  user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  void sendPasswordResetEmail(user.email, resetToken);

  res.json({ success: true, resetToken });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const tokenHash = hashActionToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() }
  }).select("+password");

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  const authToken = signToken({ id: String(user._id), role: user.role });
  res.json({ success: true, token: authToken, user: sanitizeUser(user) });
});
