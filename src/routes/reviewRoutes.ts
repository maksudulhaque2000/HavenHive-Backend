import { Router } from "express";
import { createOrUpdateReview, deleteReview, getReviewsByProperty, updateReview } from "../controllers/reviewController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { reviewSchema, reviewUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/property/:propertyId", getReviewsByProperty);
router.post("/", protect, validateBody(reviewSchema), createOrUpdateReview);
router.put("/:id", protect, validateBody(reviewUpdateSchema), updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
