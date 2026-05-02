import mongoose, { Schema, model } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingType = "visit" | "call" | "online";

export interface IBooking {
  property: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  agent?: mongoose.Types.ObjectId;
  visitDate: Date;
  status: BookingStatus;
  type: BookingType;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    visitDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    type: { type: String, enum: ["visit", "call", "online"], default: "visit" },
    note: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
