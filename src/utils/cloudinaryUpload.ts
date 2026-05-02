import { Readable } from "stream";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { AppError } from "./AppError";

export type UploadedAsset = {
  url: string;
  publicId: string;
};

const uploadBuffer = (buffer: Buffer, folder: string): Promise<UploadedAsset> => {
  if (!isCloudinaryConfigured) {
    throw new AppError("Cloudinary is not configured", 500);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const uploadSingleImage = async (file?: Express.Multer.File, folder = "havenhive") => {
  if (!file) {
    return undefined;
  }

  return uploadBuffer(file.buffer, folder);
};

export const uploadMultipleImages = async (files: Express.Multer.File[] = [], folder = "havenhive") => {
  if (!files.length) {
    return [] as UploadedAsset[];
  }

  return Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));
};
