import mongoose, { Schema, model } from "mongoose";

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: string;
  published: boolean;
  coverImage?: {
    url: string;
    publicId: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true },
    published: { type: Boolean, default: false },
    coverImage: {
      url: { type: String },
      publicId: { type: String }
    }
  },
  { timestamps: true }
);

export const Blog = model<IBlog>("Blog", blogSchema);
