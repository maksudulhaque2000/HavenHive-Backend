import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

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

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort("-createdAt");
  res.json({ success: true, data: users.map(sanitizeUser) });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, data: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  Object.assign(user, req.body);
  if (req.body.avatarUrl || req.body.avatarPublicId) {
    user.avatar = {
      url: req.body.avatarUrl ?? user.avatar?.url ?? "",
      publicId: req.body.avatarPublicId ?? user.avatar?.publicId ?? ""
    };
  }

  await user.save();
  res.json({ success: true, data: sanitizeUser(user) });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, message: "User deleted successfully" });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.avatarUrl || req.body.avatarPublicId) {
    user.avatar = {
      url: req.body.avatarUrl ?? user.avatar?.url ?? "",
      publicId: req.body.avatarPublicId ?? user.avatar?.publicId ?? ""
    };
  }

  await user.save();
  res.json({ success: true, data: sanitizeUser(user) });
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const propertyId = req.params.propertyId;
  const exists = user.wishlist.some((id) => String(id) === propertyId);
  user.wishlist = exists ? user.wishlist.filter((id) => String(id) !== propertyId) : [...user.wishlist, propertyId as any];
  await user.save();

  res.json({ success: true, wishlist: user.wishlist });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: {
      wishlistCount: user.wishlist.length,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});
