import { Request, Response } from "express";
import slugify from "slugify";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { Property } from "../models/Property";
import { uploadMultipleImages } from "../utils/cloudinaryUpload";
import { User } from "../models/User";

const buildPropertyFilters = (query: Request["query"]) => {
  const filters: Record<string, unknown> = {};

  if (query.type) filters.type = query.type;
  if (query.purpose) filters.purpose = query.purpose;
  if (query.status) filters.status = query.status;
  if (query.featured !== undefined) filters.featured = query.featured === "true";
  if (query.agent) filters.agent = query.agent;
  if (query.city) filters["location.city"] = new RegExp(String(query.city), "i");
  if (query.country) filters["location.country"] = new RegExp(String(query.country), "i");
  if (query.search) {
    const search = new RegExp(String(query.search), "i");
    filters.$or = [
      { title: search },
      { description: search },
      { "location.address": search },
      { "location.city": search },
      { "location.state": search }
    ];
  }

  const priceFilter: Record<string, number> = {};
  if (query.minPrice !== undefined) priceFilter.$gte = Number(query.minPrice);
  if (query.maxPrice !== undefined) priceFilter.$lte = Number(query.maxPrice);
  if (Object.keys(priceFilter).length) filters.price = priceFilter;

  const areaFilter: Record<string, number> = {};
  if (query.minArea !== undefined) areaFilter.$gte = Number(query.minArea);
  if (query.maxArea !== undefined) areaFilter.$lte = Number(query.maxArea);
  if (Object.keys(areaFilter).length) filters.area = areaFilter;

  return filters;
};

const parseSort = (value: unknown) => {
  if (!value) {
    return "-createdAt";
  }

  const sortFields = String(value).split(",").map((item) => item.trim()).filter(Boolean);
  return sortFields.join(" ");
};

export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const filters = buildPropertyFilters(req.query);
  const sort = parseSort(req.query.sort);

  const [properties, total] = await Promise.all([
    Property.find(filters).sort(sort).skip((page - 1) * limit).limit(limit).populate("agent", "name email role avatar"),
    Property.countDocuments(filters)
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: properties
  });
});

export const getProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id).populate("agent", "name email role avatar");
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  property.views += 1;
  await property.save();

  res.json({ success: true, data: property });
});

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const payload = req.body;
  const slug = slugify(payload.title, { lower: true, strict: true, trim: true });
  const duplicate = await Property.findOne({ slug });
  if (duplicate) {
    throw new AppError("A property with the same title already exists", 409);
  }

  const uploadedImages = await uploadMultipleImages((req.files as Express.Multer.File[] | undefined) ?? [], "havenhive/properties");
  const images = uploadedImages.length
    ? uploadedImages
    : Array.isArray(payload.images)
      ? payload.images
      : [];

  const assignedAgent = payload.agent ?? (req.user.role === "agent" ? req.user.id : undefined);
  if (!assignedAgent && req.user.role === "agent") {
    const agent = await User.findById(req.user.id);
    if (!agent) {
      throw new AppError("Agent not found", 404);
    }
  }

  const property = await Property.create({
    ...payload,
    slug,
    images,
    agent: assignedAgent,
    createdBy: req.user.id
  });

  res.status(201).json({ success: true, data: property });
});

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const payload = req.body;
  if (payload.title && payload.title !== property.title) {
    payload.slug = slugify(payload.title, { lower: true, strict: true, trim: true });
  }

  const uploadedImages = await uploadMultipleImages((req.files as Express.Multer.File[] | undefined) ?? [], "havenhive/properties");
  if (uploadedImages.length) {
    property.images = [...property.images, ...uploadedImages];
  }

  Object.assign(property, payload);
  await property.save();

  res.json({ success: true, data: property });
});

export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  res.json({ success: true, message: "Property deleted successfully" });
});

export const getFeaturedProperties = asyncHandler(async (_req: Request, res: Response) => {
  const data = await Property.find({ featured: true, status: "published" }).sort("-createdAt").limit(8);
  res.json({ success: true, data });
});

export const getPropertyStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, published, draft, sold, rented, featured] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: "published" }),
    Property.countDocuments({ status: "draft" }),
    Property.countDocuments({ status: "sold" }),
    Property.countDocuments({ status: "rented" }),
    Property.countDocuments({ featured: true })
  ]);

  res.json({
    success: true,
    data: { total, published, draft, sold, rented, featured }
  });
});
