import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({
    success: false,
    message
  });
};
