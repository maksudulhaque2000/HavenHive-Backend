import mongoose, { Schema, model } from "mongoose";

export interface IReview {
  property: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: "pending" | "approved";
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" }
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
