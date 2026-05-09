import { NextFunction, Request, Response } from "express";

type UnknownRecord = Record<string, unknown>;

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const normalizePropertyPayload = (req: Request, _res: Response, next: NextFunction) => {
  const body = (req.body || {}) as UnknownRecord;

  // Normalize location from JSON string or fallback flat fields.
  if (typeof body.location === "string") {
    const parsed = safeJsonParse(body.location);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body.location = parsed;
    }
  }

  if ((!body.location || typeof body.location !== "object" || Array.isArray(body.location)) &&
      typeof body.address === "string" && typeof body.city === "string" && typeof body.state === "string" && typeof body.country === "string") {
    body.location = {
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
    };
  }

  // Normalize amenities from JSON string or comma-separated text.
  if (typeof body.amenities === "string") {
    const parsed = safeJsonParse(body.amenities);
    if (Array.isArray(parsed)) {
      body.amenities = parsed;
    } else {
      body.amenities = body.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  // Normalize images payload: if client accidentally sends images as string, ignore it.
  if (typeof body.images === "string") {
    const parsed = safeJsonParse(body.images);
    body.images = Array.isArray(parsed) ? parsed : [];
  }

  req.body = body;
  next();
};
