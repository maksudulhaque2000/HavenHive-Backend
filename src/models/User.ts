import bcrypt from "bcryptjs";
import mongoose, { Schema, model } from "mongoose";

export type UserRole = "user" | "agent" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  wishlist: mongoose.Types.ObjectId[];
  isVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiresAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "agent", "admin"], default: "user" },
    phone: { type: String, trim: true },
    avatar: {
      url: { type: String },
      publicId: { type: String }
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    isVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String },
    emailVerificationTokenExpiresAt: { type: Date },
    passwordResetTokenHash: { type: String },
    passwordResetTokenExpiresAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
