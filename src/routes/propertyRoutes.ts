import { Router } from "express";
import {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getProperties,
  getProperty,
  getPropertyStats,
  toggleFeaturedProperty,
  updateProperty
} from "../controllers/propertyController";
import { protect, restrictTo } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validateBody } from "../middleware/validate";
import { normalizePropertyPayload } from "../middleware/normalizePropertyPayload";
import { propertyCreateSchema, propertyUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/stats", getPropertyStats);
router.get("/stats/overview", getPropertyStats);
router.get("/featured", getFeaturedProperties);
router.get("/search", getProperties);
router.get("/", getProperties);
router.patch("/:id/toggle-featured", protect, restrictTo("admin"), toggleFeaturedProperty);
router.get("/:id", getProperty);
router.post("/", protect, restrictTo("agent", "admin"), upload.array("images", 10), normalizePropertyPayload, validateBody(propertyCreateSchema), createProperty);
router.patch("/:id", protect, restrictTo("agent", "admin"), upload.array("images", 10), normalizePropertyPayload, validateBody(propertyUpdateSchema), updateProperty);
router.delete("/:id", protect, restrictTo("admin"), deleteProperty);

export default router;
