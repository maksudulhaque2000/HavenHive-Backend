import slugify from "slugify";
import { Request, Response } from "express";
import { Blog } from "../models/Blog";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadSingleImage } from "../utils/cloudinaryUpload";

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

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id).populate("author", "name email role avatar");
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  // Check authorization - only author or admin can access
  if (req.user?.role !== "admin" && req.user?.id !== blog.author._id.toString()) {
    throw new AppError("You are not authorized to access this blog", 403);
  }

  res.json({ success: true, data: blog });
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  // Ensure required fields exist
  if (!req.body.title) {
    throw new AppError("Title is required", 400);
  }
  if (!req.body.content) {
    throw new AppError("Content is required", 400);
  }
  if (!req.body.category) {
    throw new AppError("Category is required", 400);
  }

  const slug = slugify(req.body.title, { lower: true, strict: true, trim: true });
  
  // Check if slug already exists
  const existingBlog = await Blog.findOne({ slug });
  if (existingBlog) {
    throw new AppError("A blog with this title already exists. Please use a different title.", 400);
  }

  // Upload cover image if provided
  let coverImage = undefined;
  if (req.file) {
    try {
      coverImage = await uploadSingleImage(req.file, "havenhive/blogs");
    } catch (error) {
      console.error("Image upload error:", error);
      throw new AppError("Failed to upload cover image. Please try again.", 500);
    }
  }

  const blog = await Blog.create({
    title: req.body.title,
    slug,
    content: req.body.content,
    category: req.body.category,
    published: req.body.published ?? false,
    author: req.user.id,
    coverImage
  });

  res.status(201).json({ success: true, data: blog });
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  // Check authorization
  if (req.user?.role !== "admin" && req.user?.id !== blog.author.toString()) {
    throw new AppError("You are not authorized to update this blog", 403);
  }

  if (req.body.title) {
    const newSlug = slugify(req.body.title, { lower: true, strict: true, trim: true });
    // Check if new slug conflicts with existing blog (other than this one)
    if (newSlug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: newSlug });
      if (existingBlog) {
        throw new AppError("A blog with this title already exists. Please use a different title.", 400);
      }
    }
    req.body.slug = newSlug;
  }

  // Upload new cover image if provided
  if (req.file) {
    try {
      const newCoverImage = await uploadSingleImage(req.file, "havenhive/blogs");
      req.body.coverImage = newCoverImage;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new AppError("Failed to upload cover image. Please try again.", 500);
    }
  }

  Object.assign(blog, req.body);
  await blog.save();
  res.json({ success: true, data: blog });
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError("Blog post not found", 404);
  }

  // Check authorization
  if (req.user?.role !== "admin" && req.user?.id !== blog.author.toString()) {
    throw new AppError("You are not authorized to delete this blog", 403);
  }

  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Blog deleted successfully" });
});
