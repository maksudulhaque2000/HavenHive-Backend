import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Property } from "../models/Property";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getReviewsByProperty = asyncHandler(async (req: Request, res: Response) => {
  const data = await Review.find({ property: req.params.propertyId }).populate("user", "name avatar role");
  res.json({ success: true, data });
});

export const createOrUpdateReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const property = await Property.findById(req.body.property);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const review = await Review.findOneAndUpdate(
    { property: req.body.property, user: req.user.id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, upsert: true, runValidators: true }
  ).populate("user", "name avatar role");

  res.status(201).json({ success: true, data: review });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = String(review.user) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;
  await review.save();

  const populated = await review.populate("user", "name avatar role");
  res.json({ success: true, data: populated });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = String(review.user) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  await review.deleteOne();

  res.json({ success: true, message: "Review deleted successfully" });
});
