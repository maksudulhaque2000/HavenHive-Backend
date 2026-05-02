import slugify from "slugify";
import { Request, Response } from "express";
import { Blog } from "../models/Blog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.user?.role !== "admin") {
    filter.published = true;
  }

  const data = await Blog.find(filter).sort("-createdAt").populate("author", "name email role avatar");
  res.json({ success: true, data });
});

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate("author", "name email role avatar");
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  res.json({ success: true, data: blog });
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const slug = slugify(req.body.title, { lower: true, strict: true, trim: true });
  const blog = await Blog.create({
    title: req.body.title,
    slug,
    content: req.body.content,
    category: req.body.category,
    published: req.body.published ?? false,
    author: req.user.id
  });

  res.status(201).json({ success: true, data: blog });
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true, trim: true });
  }

  Object.assign(blog, req.body);
  await blog.save();
  res.json({ success: true, data: blog });
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  res.json({ success: true, message: "Blog deleted successfully" });
});
