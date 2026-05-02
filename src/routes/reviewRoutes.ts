import { Router } from "express";
import { createOrUpdateReview, deleteReview, getReviewsByProperty } from "../controllers/reviewController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { reviewSchema } from "../validations/schemas";

const router = Router();

router.get("/property/:propertyId", getReviewsByProperty);
router.post("/", protect, validateBody(reviewSchema), createOrUpdateReview);
router.delete("/:id", protect, restrictTo("admin"), deleteReview);

export default router;
