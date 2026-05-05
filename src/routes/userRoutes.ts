import { Router } from "express";
import {
  addWishlistItem,
  deleteUser,
  getDashboardStats,
  getUser,
  getUsers,
  getWishlist,
  removeWishlistItem,
  toggleWishlist,
  updateMyProfile,
  updateUser,
  uploadProfilePicture
} from "../controllers/userController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema, userAdminUpdateSchema } from "../validations/schemas";
import { upload } from "../middleware/upload";

const router = Router();

// Specific routes first (before dynamic :id routes)
router.get("/stats", protect, getDashboardStats);
router.get("/dashboard/stats", protect, getDashboardStats);
router.patch("/me", protect, validateBody(updateProfileSchema), updateMyProfile);
router.post("/me/avatar", protect, upload.single("avatar"), uploadProfilePicture);
router.post("/wishlist/:propertyId", protect, toggleWishlist);

// Dynamic routes last (after specific routes)
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/:id", protect, getUser);
router.patch("/:id", protect, restrictTo("admin"), validateBody(userAdminUpdateSchema), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);
router.get("/:id/wishlist", protect, getWishlist);
router.post("/:id/wishlist/:propertyId", protect, addWishlistItem);
router.delete("/:id/wishlist/:propertyId", protect, removeWishlistItem);

export default router;
