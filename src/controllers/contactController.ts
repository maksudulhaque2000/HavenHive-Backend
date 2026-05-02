import { Request, Response } from "express";
import { Contact } from "../models/Contact";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.create({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
    user: req.user?.id
  });

  res.status(201).json({ success: true, data: contact });
});

export const getContacts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await Contact.find().sort("-createdAt");
  res.json({ success: true, data });
});

export const updateContactStatus = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  contact.status = req.body.status;
  await contact.save();
  res.json({ success: true, data: contact });
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) {
    throw new AppError("Contact message not found", 404);
  }

  res.json({ success: true, message: "Contact message deleted successfully" });
});
