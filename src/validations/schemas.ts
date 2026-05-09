import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const optionalTrimmedString = z.string().trim().min(1).optional();

const parseJsonInput = (value: unknown) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const parseAmenitiesInput = (value: unknown) => {
  const parsed = parseJsonInput(value);
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (typeof parsed === "string") {
    return parsed.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  phone: optionalTrimmedString
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(16),
  password: z.string().min(8)
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(16)
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: optionalTrimmedString,
  avatarUrl: z.string().url().optional(),
  avatarPublicId: z.string().trim().optional()
});

export const userAdminUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(["user", "agent", "admin"]).optional(),
  phone: optionalTrimmedString,
  isVerified: z.boolean().optional()
});

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(10),
  type: z.enum(["apartment", "house", "villa", "land", "commercial", "office", "other"]),
  purpose: z.enum(["sale", "rent"]),
  price: z.coerce.number().min(0),
  area: z.coerce.number().min(0),
  location: z.preprocess(
    parseJsonInput,
    z.object({
      address: z.string().trim().min(3),
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
      country: z.string().trim().min(2),
      coordinates: z.object({
        lat: z.coerce.number(),
        lng: z.coerce.number()
      }).optional()
    })
  ),
  amenities: z.preprocess(parseAmenitiesInput, z.array(z.string().trim()).default([])),
  images: z.array(
    z.object({
      url: z.string().url(),
      publicId: z.string().trim().min(1)
    })
  ).optional().or(z.preprocess(() => undefined, z.undefined())),
  status: z.enum(["draft", "published", "sold", "rented", "archived"]).optional(),
  featured: z.coerce.boolean().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  parking: z.coerce.number().min(0).optional(),
  agent: objectIdSchema.optional()
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const bookingCreateSchema = z.object({
  property: objectIdSchema,
  visitDate: z.coerce.date(),
  type: z.enum(["visit", "call", "online"]).optional(),
  note: z.string().trim().optional()
});

export const bookingUpdateSchema = z.object({
  visitDate: z.coerce.date().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  type: z.enum(["visit", "call", "online"]).optional(),
  note: z.string().trim().optional()
});

export const reviewSchema = z.object({
  property: objectIdSchema,
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(2)
});

export const reviewApprovalSchema = z.object({
  status: z.enum(["pending", "approved"])
});

export const reviewUpdateSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(2)
});

const requiredTextField = (label: string, minLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().min(minLength, `${label} must be at least ${minLength} characters`)
  );

export const blogCreateSchema = z.object({
  title: requiredTextField("Title", 3),
  content: requiredTextField("Content", 20),
  category: requiredTextField("Category", 2),
  published: z.coerce.boolean().default(false).optional()
});

export const blogUpdateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").optional(),
  content: z.string().trim().min(20, "Content must be at least 20 characters").optional(),
  category: z.string().trim().min(2, "Category must be at least 2 characters").optional(),
  published: z.coerce.boolean().optional()
});

export const contactCreateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3),
  message: z.string().trim().min(10)
});

export const contactStatusSchema = z.object({
  status: z.enum(["new", "in-progress", "resolved"])
});
