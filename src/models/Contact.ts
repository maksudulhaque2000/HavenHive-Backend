import mongoose, { Schema, model } from "mongoose";

export type ContactStatus = "new" | "in-progress" | "resolved";

export interface IContact {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  user?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "in-progress", "resolved"], default: "new" },
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", contactSchema);
