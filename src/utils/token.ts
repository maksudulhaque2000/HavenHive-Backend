import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signToken = (payload: { id: string; role: string }) =>
  jwt.sign(payload, env.JWT_SECRET as jwt.Secret, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
