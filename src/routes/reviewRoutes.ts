import { Router } from "express";
import { approveReview, createOrUpdateReview, deleteReview, getApprovedReviews, getPendingReviews, getReviewsByProperty, updateReview } from "../controllers/reviewController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { reviewApprovalSchema, reviewSchema, reviewUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/approved", getApprovedReviews);
router.get("/property/:propertyId", getReviewsByProperty);
router.get("/pending", protect, restrictTo("admin"), getPendingReviews);
router.post("/", protect, validateBody(reviewSchema), createOrUpdateReview);
router.put("/:id", protect, validateBody(reviewUpdateSchema), updateReview);
router.patch("/:id/approve", protect, restrictTo("admin"), validateBody(reviewApprovalSchema), approveReview);
router.delete("/:id", protect, deleteReview);

export default router;
