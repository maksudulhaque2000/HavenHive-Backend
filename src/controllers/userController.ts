import { Request, Response } from "express";
import { User } from "../models/User";
import { Property } from "../models/Property";
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

const ensureSelfOrAdmin = (req: Request, userId: string) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const isAdmin = req.user.role === "admin";
  const isSelf = req.user.id === userId;

  if (!isAdmin && !isSelf) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
};

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort("-createdAt");
  res.json({ success: true, data: users.map(sanitizeUser) });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = String(req.params.id);
  ensureSelfOrAdmin(req, targetUserId);

  const user = await User.findById(targetUserId);
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

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = String(req.params.id);
  ensureSelfOrAdmin(req, targetUserId);

  const user = await User.findById(targetUserId).populate(
    "wishlist",
    "title slug price purpose status images location area bedrooms bathrooms featured"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, data: user.wishlist });
});

export const addWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = String(req.params.id);
  ensureSelfOrAdmin(req, targetUserId);

  const [user, property] = await Promise.all([
    User.findById(targetUserId),
    Property.findById(req.params.propertyId)
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const exists = user.wishlist.some((id) => String(id) === req.params.propertyId);
  if (!exists) {
    user.wishlist = [...user.wishlist, property._id as any];
    await user.save();
  }

  res.status(201).json({ success: true, wishlist: user.wishlist });
});

export const removeWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = String(req.params.id);
  ensureSelfOrAdmin(req, targetUserId);

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.wishlist = user.wishlist.filter((id) => String(id) !== req.params.propertyId);
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
