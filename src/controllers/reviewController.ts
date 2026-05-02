import { Request, Response } from "express";
import { Review } from "../models/Review";
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

  const review = await Review.findOneAndUpdate(
    { property: req.body.property, user: req.user.id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, upsert: true, runValidators: true }
  ).populate("user", "name avatar role");

  res.status(201).json({ success: true, data: review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  res.json({ success: true, message: "Review deleted successfully" });
});
