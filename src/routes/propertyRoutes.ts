import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getProperties,
  getProperty,
  getPropertyStats,
  updateProperty
} from "../controllers/propertyController";
import { protect, restrictTo } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validateBody } from "../middleware/validate";
import { propertyCreateSchema, propertyUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/stats", getPropertyStats);
router.get("/featured", getFeaturedProperties);
router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", protect, restrictTo("agent", "admin"), upload.array("images", 10), validateBody(propertyCreateSchema), createProperty);
router.patch("/:id", protect, restrictTo("agent", "admin"), upload.array("images", 10), validateBody(propertyUpdateSchema), updateProperty);
router.delete("/:id", protect, restrictTo("admin"), deleteProperty);

export default router;
