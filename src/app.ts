import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import userRoutes from "./routes/userRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import blogRoutes from "./routes/blogRoutes";
import contactRoutes from "./routes/contactRoutes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "HavenHive API is running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/blogs", blogRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/contacts", contactRoutes);

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/properties", propertyRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
  app.use("/api/v1/reviews", reviewRoutes);
  app.use("/api/v1/blogs", blogRoutes);
  app.use("/api/v1/contact", contactRoutes);
  app.use("/api/v1/contacts", contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
