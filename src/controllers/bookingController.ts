import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Property } from "../models/Property";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const property = await Property.findById(req.body.property);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const booking = await Booking.create({
    property: property._id,
    user: req.user.id,
    agent: property.agent,
    visitDate: req.body.visitDate,
    type: req.body.type,
    note: req.body.note
  });

  res.status(201).json({ success: true, data: booking });
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const filter: Record<string, unknown> = {};
  if (req.user.role === "user") {
    filter.user = req.user.id;
  } else if (req.user.role === "agent") {
    filter.agent = req.user.id;
  }

  const data = await Booking.find(filter)
    .populate("property", "title slug price purpose status images")
    .populate("user", "name email role")
    .sort("-createdAt");

  res.json({ success: true, data });
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const data = await Booking.find({ user: req.user.id })
    .populate("property", "title slug price purpose status images")
    .populate("user", "name email role")
    .sort("-createdAt");

  res.json({ success: true, data });
});

export const getAgentBookings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  if (!["agent", "admin"].includes(req.user.role)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  const filter = req.user.role === "admin" ? {} : { agent: req.user.id };
  const data = await Booking.find(filter)
    .populate("property", "title slug price purpose status images")
    .populate("user", "name email role")
    .populate("agent", "name email role")
    .sort("-createdAt");

  res.json({ success: true, data });
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id)
    .populate("property", "title slug price purpose status images")
    .populate("user", "name email role")
    .populate("agent", "name email role");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  res.json({ success: true, data: booking });
});

export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  Object.assign(booking, req.body);
  await booking.save();

  res.json({ success: true, data: booking });
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("You are not logged in", 401);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const isOwner = String(booking.user) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  await booking.deleteOne();

  res.json({ success: true, message: "Booking deleted successfully" });
});
