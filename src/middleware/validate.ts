import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      return next(new AppError(message, 400));
    }

    req.body = parsed.data;
    next();
  };
};
