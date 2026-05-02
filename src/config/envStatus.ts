import { env } from "../config/env";

export const envSchema = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  MONGODB_URI: env.MONGODB_URI ? "✓ Configured" : "✗ Missing",
  JWT_SECRET: env.JWT_SECRET ? "✓ Configured" : "✗ Missing",
  CLIENT_ORIGIN: env.CLIENT_ORIGIN,
  CLOUDINARY: env.CLOUDINARY_CLOUD_NAME ? "✓ Configured" : "Optional (images disabled)",
  SMTP: (env.SMTP_HOST && env.SMTP_USER) ? "✓ Configured" : "Optional (email disabled)"
};

export const printEnvStatus = () => {
  // eslint-disable-next-line no-console
  console.log("\n=== Environment Configuration ===");
  Object.entries(envSchema).forEach(([key, value]) => {
    // eslint-disable-next-line no-console
    console.log(`${key}: ${value}`);
  });
  // eslint-disable-next-line no-console
  console.log("================================\n");
};
