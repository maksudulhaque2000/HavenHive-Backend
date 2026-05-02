import mongoose, { Schema, model } from "mongoose";

export type PropertyStatus = "draft" | "published" | "sold" | "rented" | "archived";
export type PropertyPurpose = "sale" | "rent";
export type PropertyType = "apartment" | "house" | "villa" | "land" | "commercial" | "office" | "other";

export interface IProperty {
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  agent?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  status: PropertyStatus;
  featured: boolean;
  images: {
    url: string;
    publicId: string;
  }[];
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["apartment", "house", "villa", "land", "commercial", "office", "other"],
      required: true
    },
    purpose: { type: String, enum: ["sale", "rent"], required: true },
    price: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    amenities: [{ type: String, trim: true }],
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "published", "sold", "rented", "archived"], default: "draft" },
    featured: { type: Boolean, default: false },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    parking: { type: Number, min: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

propertySchema.index({ title: "text", description: "text", "location.city": "text", "location.state": "text" });

export const Property = model<IProperty>("Property", propertySchema);
